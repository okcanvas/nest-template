import {
  Injectable,
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { MysqlService } from '@src/okcanvas-libs';
import * as URL from 'url';


@Injectable()
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  
  constructor(
    private readonly mysql: MysqlService,
  ) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const error = exception.getResponse() as
      | string
      | { error: string; statusCode: number; message: string | string[] };

    if (typeof error === 'string') {
      response.status(status).json({
        success: false,
        timestamp: new Date().toISOString(),
        path: request.url,
        error,
      });
    } else {
      response.status(status).json({
        success: false,
        timestamp: new Date().toISOString(),
        ...error,
      });
    }
    Logger.error(`${request.method} ${request.url} HttpExceptionFilter`, JSON.stringify(error)  );


    //  SAVE DB
    const { method, originalUrl: url  } = request;
    const urlInfo = URL.parse(url, true);
    const pathname = urlInfo.pathname || url;
    const remoteIp = request.headers['x-forwarded-for'] || request.ip;
    const hostname = require('os').hostname();
    const user: any = request.user || {};
    const data = {
      userId: user.userId || 0,
      ip: remoteIp,
      method: method,
      url: pathname,
      hostname: hostname,
      error: JSON.stringify(error)
    }
    this.saveLogger(data);
  }

  async saveLogger(data: any) {
    this.mysql.add('ok_log_error', data, {}, true);
    
    /*
    const conn = mysql.createConnection(MYSQL_OPTIONS);
    conn.builder();
    conn.query('INSERT INTO log_error (userId, ip, method, url, hostname, error) VALUES (?,?,?,?,?,?)', [data.userId, data.ip, data.method, data.url, data.hostname, data.error]);
    conn.end();
    */
    
  }
}
