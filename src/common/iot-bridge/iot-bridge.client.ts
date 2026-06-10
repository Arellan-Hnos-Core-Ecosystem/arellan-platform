import { Injectable } from "@nestjs/common"
import { HttpService } from "@nestjs/axios"
import { firstValueFrom } from "rxjs"

export interface RequestCapturePayload {
  orderId: string
  position: string
}

// Cliente HTTP hacia arellan-hardware-iot (puerto 3007). baseURL y header
// x-device-key (IOT_BRIDGE_SHARED_SECRET) configurados en IotBridgeModule.
@Injectable()
export class IotBridgeClient {
  constructor(private readonly http: HttpService) {}

  // Ordena al bridge tomar un snapshot ONVIF de "cameraId" y vincularlo a
  // orderId/position. El bridge responde tras reenviar la imagen a
  // /public/iot/orders/:id/photos/camera-capture (captureCameraPhoto).
  async requestCapture(cameraId: string, payload: RequestCapturePayload) {
    const response = await firstValueFrom(
      this.http.post(`/iot/cameras/${cameraId}/capture`, payload),
    )
    return response.data
  }
}
