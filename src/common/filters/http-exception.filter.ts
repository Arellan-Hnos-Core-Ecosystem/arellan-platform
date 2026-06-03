import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common"
import { Request, Response } from "express"

interface ErrorResponse {
  statusCode: number
  message: string
  code: string
  timestamp: string
  path: string
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name)

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    let status = HttpStatus.INTERNAL_SERVER_ERROR
    let message = "Error interno del servidor"
    let code = "INTERNAL_ERROR"

    if (exception instanceof HttpException) {
      status = exception.getStatus()
      const exceptionResponse = exception.getResponse()
      if (typeof exceptionResponse === "object" && exceptionResponse !== null) {
        const resp = exceptionResponse as Record<string, any>
        message = resp.message || exception.message
        code = resp.code || exception.name
        if (Array.isArray(message)) {
          message = message.join("; ")
          code = "VALIDATION_FAILED"
        }
      } else {
        message = exception.message
      }
    } else if (exception instanceof Error) {
      this.logger.error(`Unhandled error: ${exception.message}`, exception.stack)
    }

    const errorResponse: ErrorResponse = {
      statusCode: status,
      message,
      code,
      timestamp: new Date().toISOString(),
      path: request.url,
    }

    response.status(status).json(errorResponse)
  }
}
