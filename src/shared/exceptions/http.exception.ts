export class HttpException extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(
    statusCode: number,
    message: string,
    code = "HTTP_ERROR",
    details?: unknown,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export class BadRequestException extends HttpException {
  constructor(message = "Solicitud inválida", details?: unknown) {
    super(400, message, "BAD_REQUEST", details);
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message = "No autenticado") {
    super(401, message, "UNAUTHORIZED");
  }
}

export class ForbiddenException extends HttpException {
  constructor(message = "No autorizado") {
    super(403, message, "FORBIDDEN");
  }
}

export class NotFoundException extends HttpException {
  constructor(message = "Recurso no encontrado") {
    super(404, message, "NOT_FOUND");
  }
}

export class ConflictException extends HttpException {
  constructor(message = "Conflicto con el estado actual", details?: unknown) {
    super(409, message, "CONFLICT", details);
  }
}
