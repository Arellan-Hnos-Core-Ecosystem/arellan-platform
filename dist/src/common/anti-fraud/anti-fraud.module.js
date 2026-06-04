"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AntiFraudModule = void 0;
const common_1 = require("@nestjs/common");
const anti_fraud_service_1 = require("./anti-fraud.service");
const anti_fraud_middleware_1 = require("./anti-fraud.middleware");
let AntiFraudModule = class AntiFraudModule {
    configure(consumer) {
        consumer.apply(anti_fraud_middleware_1.AntiFraudMiddleware).forRoutes("*");
    }
};
exports.AntiFraudModule = AntiFraudModule;
exports.AntiFraudModule = AntiFraudModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [anti_fraud_service_1.AntiFraudService],
        exports: [anti_fraud_service_1.AntiFraudService],
    })
], AntiFraudModule);
//# sourceMappingURL=anti-fraud.module.js.map