import { ExecutionContext } from "@nestjs/common";
declare const JwtAuthGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class JwtAuthGuard extends JwtAuthGuard_base {
    private readonly logger;
    handleRequest(err: any, user: any, info: any, _context: ExecutionContext): any;
}
export {};
