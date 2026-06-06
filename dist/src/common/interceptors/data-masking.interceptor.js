"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataMaskingInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const MASKED_FIELDS_FOR_MECHANIC = [
    "phone", "email", "address", "dni", "ruc", "phone2",
    "creditLimit", "creditBalance",
];
const MECHANIC_ROLES = ["MECHANIC", "TRAINEE"];
function maskObject(obj) {
    if (!obj || typeof obj !== "object")
        return obj;
    if (Array.isArray(obj))
        return obj.map(maskObject);
    const masked = { ...obj };
    if ("client" in masked && masked.client) {
        masked.client = { ...masked.client };
        MASKED_FIELDS_FOR_MECHANIC.forEach((field) => {
            if (field in masked.client)
                delete masked.client[field];
        });
    }
    Object.keys(masked).forEach((key) => {
        if (masked[key] && typeof masked[key] === "object") {
            masked[key] = maskObject(masked[key]);
        }
    });
    return masked;
}
let DataMaskingInterceptor = class DataMaskingInterceptor {
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const userRole = request.user?.role;
        if (!MECHANIC_ROLES.includes(userRole))
            return next.handle();
        return next.handle().pipe((0, operators_1.map)((data) => maskObject(data)));
    }
};
exports.DataMaskingInterceptor = DataMaskingInterceptor;
exports.DataMaskingInterceptor = DataMaskingInterceptor = __decorate([
    (0, common_1.Injectable)()
], DataMaskingInterceptor);
//# sourceMappingURL=data-masking.interceptor.js.map