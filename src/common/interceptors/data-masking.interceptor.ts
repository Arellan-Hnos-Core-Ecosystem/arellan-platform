import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common"
import { Observable } from "rxjs"
import { map } from "rxjs/operators"

const MASKED_FIELDS_FOR_MECHANIC = [
  "phone", "email", "address", "dni", "ruc", "phone2",
  "creditLimit", "creditBalance",
]

const MECHANIC_ROLES = ["MECHANIC", "TRAINEE"]

function maskObject(obj: any): any {
  if (!obj || typeof obj !== "object") return obj
  if (Array.isArray(obj)) return obj.map(maskObject)

  const masked = { ...obj }
  if ("client" in masked && masked.client) {
    masked.client = { ...masked.client }
    MASKED_FIELDS_FOR_MECHANIC.forEach((field) => {
      if (field in masked.client) delete masked.client[field]
    })
  }
  Object.keys(masked).forEach((key) => {
    if (masked[key] && typeof masked[key] === "object") {
      masked[key] = maskObject(masked[key])
    }
  })
  return masked
}

@Injectable()
export class DataMaskingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest()
    const userRole = request.user?.role
    if (!MECHANIC_ROLES.includes(userRole)) return next.handle()
    return next.handle().pipe(map((data) => maskObject(data)))
  }
}
