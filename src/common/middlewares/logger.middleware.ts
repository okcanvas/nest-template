import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { MysqlService } from '@src/okcanvas-libs';
import * as URL from 'url';
import moment from 'moment';

const NS_PER_SEC = 1e9;
const MS_PER_NS = 1e6;


@Injectable()
export class LoggerMiddleware implements NestMiddleware {

  constructor(
    //private readonly mysql: MysqlService,
  ) {}

  private readonly logger = new Logger('HTTP');
  

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl: url  } = req;
    const remoteIp = req.headers['x-forwarded-for'] || req.ip;
    const hostname = require('os').hostname();
    const userAgent = req.get('user-agent') || '';
    const startTime = process.hrtime();
    const urlInfo = URL.parse(url, true);
    const pathname = urlInfo.pathname || url;

    let sendData = '';
    let sendLen = 0;

    const send = res.send;
    res.send = (exitData: any) => {
      if ( res?.getHeader('content-type')?.toString().includes('application/json') ) {
        sendData += exitData;
        sendLen  += exitData.length;
      }
      res.send = send;
      return res.send(exitData);
    };

    res.on('finish', () => {
      const endTime = process.hrtime(startTime);
      const runtimeNS = endTime[0] * NS_PER_SEC + endTime[1];
      const runtimeMS = Math.round(runtimeNS / MS_PER_NS);
      const user: any = req.user || {};

      this.logger.log(`${remoteIp} ${method} ${res.statusCode} ${pathname} ${runtimeMS}ms`);
      /*
      const saveData = {
        userId: user.userId ? user.userId : 0,
        ip: remoteIp,
        method: method,
        url: pathname,
        hostname: hostname,
        userAgent: userAgent,
        status: res.statusCode,
        runtime: runtimeMS,
        //sendData: sendData,
        sendLen: sendLen,
      }
      this.saveLogger(saveData);
      this.updateLastUseTime(user.userId)
      */
    });

    next();
  }

  async saveLogger(data: any) {
    /*
    const url = data.url || '';
    if (url.indexOf('/admin/log/') < 0) {
      this.mysql.add('ok_log_api', data, {}, true);
    }
    */
  }

  async updateLastUseTime(userId: number) {
    /*
    if (userId > 0) {
      this.mysql.query('UPDATE ok_member SET lastUseAt = NOW() WHERE userId = ?', [userId], { noLog: true });
    }
    */
  }

}
