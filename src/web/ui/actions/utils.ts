import { BaseResponse } from './devices';

export function handleError(message: string): BaseResponse {
  return {
    result: 'error',
    error: message,
  };
}
