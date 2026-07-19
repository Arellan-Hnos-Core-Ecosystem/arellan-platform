import { HttpService } from "@nestjs/axios";
export interface RequestCapturePayload {
    orderId: string;
    position: string;
}
export declare class IotBridgeClient {
    private readonly http;
    constructor(http: HttpService);
    requestCapture(cameraId: string, payload: RequestCapturePayload): Promise<any>;
}
