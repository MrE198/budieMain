export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly data?: any;

  constructor(statusCode: number, message: string, code: string, data?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.data = data;

    // Maintains proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}