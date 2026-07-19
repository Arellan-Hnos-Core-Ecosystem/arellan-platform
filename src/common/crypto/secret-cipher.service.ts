import { Injectable, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto"

// SEC-06: cifrado autenticado en reposo para secretos que deben recuperarse en
// claro (el secreto TOTP se necesita para verificar códigos, no admite hash).
// AES-256-GCM con clave de 32 bytes derivada por scrypt desde MFA_ENC_KEY —
// variable obligatoria y separada de los secretos JWT (fail-closed: sin ella el
// arranque falla). Formato versionado `v1:<iv>:<tag>:<ct>` en base64 para
// permitir rotación futura de esquema. Los valores legacy sin prefijo (texto
// plano pre-SEC-06) se aceptan en lectura para no bloquear cuentas existentes
// y quedan re-cifrados en la siguiente escritura del secreto.
@Injectable()
export class SecretCipherService {
  private readonly logger = new Logger(SecretCipherService.name)
  private readonly key: Buffer

  constructor(config: ConfigService) {
    const raw = config.getOrThrow<string>("MFA_ENC_KEY")
    this.key = scryptSync(raw, "arellan-mfa-cipher-v1", 32)
  }

  encrypt(plaintext: string): string {
    const iv = randomBytes(12)
    const cipher = createCipheriv("aes-256-gcm", this.key, iv)
    const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()])
    const tag = cipher.getAuthTag()
    return `v1:${iv.toString("base64")}:${tag.toString("base64")}:${ciphertext.toString("base64")}`
  }

  decrypt(stored: string): string {
    if (!stored.startsWith("v1:")) {
      this.logger.warn(
        "Secreto MFA legacy sin cifrar detectado; se re-cifrará en la próxima escritura",
      )
      return stored
    }
    const [, ivB64, tagB64, ctB64] = stored.split(":")
    const decipher = createDecipheriv("aes-256-gcm", this.key, Buffer.from(ivB64, "base64"))
    decipher.setAuthTag(Buffer.from(tagB64, "base64"))
    return Buffer.concat([
      decipher.update(Buffer.from(ctB64, "base64")),
      decipher.final(),
    ]).toString("utf8")
  }
}
