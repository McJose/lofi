import type { ApiError } from '@/types';
import { ERROR_CODES } from '@/lib/constants';
import { HTTP_STATUS } from '@/lib/constants';

export class AppError extends Error {
  public code: string;
  public statusCode: number;
  public details?: Record<string, unknown>;

  constructor(
    message: string,
    code: string = ERROR_CODES.VALIDATION.INVALID_INPUT,
    statusCode: number = HTTP_STATUS.BAD_REQUEST,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }

  static badRequest(message: string, details?: Record<string, unknown>): AppError {
    return new AppError(message, ERROR_CODES.VALIDATION.INVALID_INPUT, HTTP_STATUS.BAD_REQUEST, details);
  }

  static unauthorized(message: string = 'Unauthorized'): AppError {
    return new AppError(message, ERROR_CODES.AUTH.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED);
  }

  static forbidden(message: string = 'Forbidden'): AppError {
    return new AppError(message, ERROR_CODES.AUTH.INVALID_TOKEN, HTTP_STATUS.FORBIDDEN);
  }

  static notFound(message: string = 'Not found'): AppError {
    return new AppError(message, ERROR_CODES.DATABASE.RECORD_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  static conflict(message: string, details?: Record<string, unknown>): AppError {
    return new AppError(message, ERROR_CODES.DATABASE.DUPLICATE_ENTRY, HTTP_STATUS.CONFLICT, details);
  }

  static tooManyRequests(message: string = 'Too many requests'): AppError {
    return new AppError(message, ERROR_CODES.RATE_LIMIT.TOO_MANY_REQUESTS, HTTP_STATUS.TOO_MANY_REQUESTS);
  }

  static internal(message: string = 'Internal server error'): AppError {
    return new AppError(message, 'INTERNAL_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }

  toApiError(): ApiError {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
    };
  }
}

export const handleSupabaseError = (error: { code?: string; message: string }): AppError => {
  const errorCode = error.code || '';

  switch (errorCode) {
    case '23505':
      return AppError.conflict('A record with this information already exists');
    case '23503':
      return AppError.badRequest('Referenced record does not exist');
    case 'PGRST116':
      return AppError.notFound('Record not found');
    case 'auth/user-not-found':
      return AppError.notFound('User not found');
    case 'auth/invalid-email':
      return AppError.badRequest('Invalid email address');
    case 'auth/wrong-password':
      return AppError.unauthorized('Invalid password');
    case 'auth/email-already-in-use':
      return AppError.conflict('Email already in use');
    case 'auth/weak-password':
      return AppError.badRequest(ERROR_CODES.AUTH.PASSWORD_TOO_WEAK, { password: 'Password is too weak' });
    default:
      return AppError.internal(error.message);
  }
};
