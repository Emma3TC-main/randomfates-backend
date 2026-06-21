export type ApiMeta = Record<string, unknown>;

export type ApiSuccess<T> = {
  success: true;
  message: string;
  data: T;
  meta?: ApiMeta;
};

export type ApiFailure = {
  success: false;
  message: string;
  error: {
    code: string;
    details?: unknown;
  };
};

export const successResponse = <T>(
  message: string,
  data: T,
  meta?: ApiMeta,
): ApiSuccess<T> => ({
  success: true,
  message,
  data,
  ...(meta ? { meta } : {}),
});

export const errorResponse = (
  message: string,
  code: string,
  details?: unknown,
): ApiFailure => ({
  success: false,
  message,
  error: {
    code,
    ...(details ? { details } : {}),
  },
});
