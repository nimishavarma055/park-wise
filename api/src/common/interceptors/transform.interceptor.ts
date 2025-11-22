import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
  statusCode: number;
  message?: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        // If the response is already a PaginatedResponse (has both 'data' and 'meta' properties),
        // spread it instead of wrapping it in another 'data' field
        if (
          data &&
          typeof data === 'object' &&
          'data' in data &&
          'meta' in data &&
          Array.isArray(data.data)
        ) {
          return {
            statusCode: context.switchToHttp().getResponse().statusCode,
            ...data,
            timestamp: new Date().toISOString(),
          } as any;
        }

        // For other responses, wrap in the standard format
        return {
          statusCode: context.switchToHttp().getResponse().statusCode,
          data,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}

