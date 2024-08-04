import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { MysqlService } from '@src/okcanvas-libs';
import * as URL from 'url';


@Injectable()
export class LoggingInterceptor implements NestInterceptor {

  constructor(
    //private readonly logger: Logger,
    //private readonly mysql: MysqlService,
  ) { }
  



  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const req = context.switchToHttp().getRequest();
    //const { statusCode } = context.switchToHttp().getResponse();
    const { originalUrl, method, params, query, body } = req;
    const user: any = req.user || {};

    const urlInfo = URL.parse(originalUrl, true);
    const pathname = urlInfo.pathname || originalUrl;
    

    /*
    console.log({
      originalUrl,
      method,
      params,
      query,
      body,
      user
    });
    */

    return next.handle().pipe(
      tap((data: any) => {
        const response = context.switchToHttp().getResponse();
        const delay = Date.now() - now;
        /*
        try {
          const payload = {
            userId: user.userId || 0,
            //ip: ip,
            method: method,
            url: pathname,
            status: response.statusCode,
            runtime: delay,
            request: JSON.stringify({
              params,
              query,
              body,
            }),
            response: JSON.stringify({
              data,
            }),
          }
          //  this.mysql.add('ok_log_data', payload, {}, true); 
        } catch (error) {
          //
        }
        */
      }),
    );

  }
}