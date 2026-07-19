import { ConfigService } from "@nestjs/config";
export declare class SecretCipherService {
    private readonly logger;
    private readonly key;
    constructor(config: ConfigService);
    encrypt(plaintext: string): string;
    decrypt(stored: string): string;
}
