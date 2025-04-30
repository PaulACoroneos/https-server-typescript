export class HttpError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export class BadRequestError extends HttpError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class UnauthorizedRequestError extends HttpError {
  constructor(message: string) {
    super(message, 401);
  }
}

export class ForbiddenRequestError extends HttpError {
  constructor(message: string) {
    super(message, 403);
  }
}

export class NotFoundRequestError extends HttpError {
  constructor(message: string) {
    super(message, 404);
  }
}
