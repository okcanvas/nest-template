import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { MysqlService } from '@src/okcanvas-libs';
import moment from 'moment';
import { parseTime } from '@src/utils/timezone';
import { _Success, _Fail, helper } from '@src/utils/response';
import pushing from '@src/utils/push-message';


@Injectable()
export class LogService {

  constructor(
    private readonly mysql: MysqlService,
  ) {}

  async getLog(userId: number, lastId: number) {
    const data = await this.mysql.builder()
    .sqlAdd('SELECT member.name, log.id, log.calltime, log.userId, log.ip, log.method, log.url, log.runtime, log.sendLen, log.os, log.status, log.hostname, log.userAgent')
    .sqlAdd(`FROM (SELECT * FROM ok_log_api WHERE id > ${lastId}) AS log`)
    .sqlAdd('LEFT JOIN `ok_member` AS `member` ON (member.userId = log.userId)')
    .sqlAdd('ORDER BY log.id DESC LIMIT 1000')
    .sqlQuery();

    return _Success(data);
  }

  async getError(userId: number, lastId: number) {
    const data = await this.mysql.builder()
    .sqlAdd('SELECT member.name, log.id, log.calltime, log.userId, log.ip, log.method, log.url, log.hostname, log.error')
    .sqlAdd(`FROM (SELECT * FROM ok_log_error WHERE id > ${lastId}) AS log`)
    .sqlAdd('LEFT JOIN `ok_member` AS `member` ON (member.userId = log.userId)')
    .sqlAdd('ORDER BY log.id DESC LIMIT 1000')
    .sqlQuery();

    return _Success(data);
  }

  async getSummary(userId: number, query: any = {}) {
    const searchDate = query.date.split(',');

    let sdate = '0000-00-00';
    let edate = '9999-99-99';
    if (searchDate.length === 2) {
      sdate = searchDate[0];
      edate = searchDate[1];
    }

    const data = await this.mysql.builder()
    .sqlAdd('SELECT count(*) AS count, sum(runtime) AS sumtime, max(calltime) AS lasttime, url, method')
    .sqlAdd('FROM ok_log_api')
    .sqlAdd('WHERE SUBSTRING(calltime,1,10) >= "'+sdate+'" AND SUBSTRING(calltime,1,10) <= "'+edate+'" GROUP BY url, method')
    .sqlQuery();

    data.forEach((e: any, index: number) => {
      e.id = index;
      e.avgtime = e.sumtime / e.count;
    });

    return _Success(data);
  }

  async getSummaryHour(userId: number, query: any = {}) {
    const searchDate = query.date.split(',');

    let sdate = '0000-00-00';
    let edate = '9999-99-99';
    if (searchDate.length === 2) {
      sdate = searchDate[0];
      edate = searchDate[1];
    }

    const result = [];
    for (let i = 1; i <= 24; i++) {
      result.push({
        hour: i-1, 
        name: ('00' + i).slice(-2), 
        count: 0, 
        error: 0,
      })
    }

    const apiData = await this.mysql.builder()
    .sqlAdd('SELECT HOUR(calltime) AS hour, count(*) AS count')
    .sqlAdd('FROM ok_log_api')
    .sqlAdd('WHERE SUBSTRING(calltime,1,10) >= "'+sdate+'" AND SUBSTRING(calltime,1,10) <= "'+edate+'" GROUP BY HOUR(calltime)')
    .sqlAdd('ORDER BY HOUR(calltime) ASC')
    .sqlQuery();

    apiData.forEach((data: any, index: number) => {
      let found = result.find(e => e.hour === data.hour);
      if (found) found.count = data.count;
    });

    const errData = await this.mysql.builder()
    .sqlAdd('SELECT HOUR(calltime) AS hour, count(*) AS count')
    .sqlAdd('FROM ok_log_error')
    .sqlAdd('WHERE SUBSTRING(calltime,1,10) >= "'+sdate+'" AND SUBSTRING(calltime,1,10) <= "'+edate+'" GROUP BY HOUR(calltime)')
    .sqlAdd('ORDER BY HOUR(calltime) ASC')
    .sqlQuery();

    errData.forEach((data: any, index: number) => {
      let found = result.find(e => e.hour === data.hour);
      if (found) found.error = data.count;
    });

    return _Success(result);
  }

  async getSummaryWeek(userId: number, query: any = {}) {
    const searchDate = query.date.split(',');

    let sdate = '0000-00-00';
    let edate = '9999-99-99';
    if (searchDate.length === 2) {
      sdate = searchDate[0];
      edate = searchDate[1];
    }

    const result = [
      { week: 0, name: '월', count: 0, error: 0 },
      { week: 1, name: '화', count: 0, error: 0 },
      { week: 2, name: '수', count: 0, error: 0 },
      { week: 3, name: '목', count: 0, error: 0 },
      { week: 4, name: '금', count: 0, error: 0 },
      { week: 5, name: '토', count: 0, error: 0 },
      { week: 6, name: '일', count: 0, error: 0 },
    ];

    const apiData = await this.mysql.builder()
    .sqlAdd('SELECT WEEKDAY(calltime) AS week, count(*) AS count')
    .sqlAdd('FROM ok_log_api')
    .sqlAdd('WHERE SUBSTRING(calltime,1,10) >= "'+sdate+'" AND SUBSTRING(calltime,1,10) <= "'+edate+'" GROUP BY WEEKDAY(calltime)')
    .sqlAdd('ORDER BY WEEKDAY(calltime) ASC')
    .sqlQuery();

    apiData.forEach((data: any, index: number) => {
      let found = result.find(e => e.week === data.week);
      if (found) found.count = data.count;
    });

    const errData = await this.mysql.builder()
    .sqlAdd('SELECT WEEKDAY(calltime) AS week, count(*) AS count')
    .sqlAdd('FROM ok_log_error')
    .sqlAdd('WHERE SUBSTRING(calltime,1,10) >= "'+sdate+'" AND SUBSTRING(calltime,1,10) <= "'+edate+'" GROUP BY WEEKDAY(calltime)')
    .sqlAdd('ORDER BY WEEKDAY(calltime) ASC')
    .sqlQuery();

    errData.forEach((data: any, index: number) => {
      let found = result.find(e => e.week === data.week);
      if (found) found.error = data.count;
    });

    return _Success(result);
  }

  async getSummaryMonth(userId: number, query: any = {}) {
    const searchDate = query.date.split(',');

    let sdate = '0000-00-00';
    let edate = '9999-99-99';
    if (searchDate.length === 2) {
      sdate = searchDate[0];
      edate = searchDate[1];
    }

    const result = [
      { month:  1, name: '1월',  count: 0, error: 0 },
      { month:  2, name: '2월',  count: 0, error: 0 },
      { month:  3, name: '3월',  count: 0, error: 0 },
      { month:  4, name: '4월',  count: 0, error: 0 },
      { month:  5, name: '5월',  count: 0, error: 0 },
      { month:  6, name: '6월',  count: 0, error: 0 },
      { month:  7, name: '7월',  count: 0, error: 0 },
      { month:  8, name: '8월',  count: 0, error: 0 },
      { month:  9, name: '9월',  count: 0, error: 0 },
      { month: 10, name: '10월', count: 0, error: 0 },
      { month: 11, name: '11월', count: 0, error: 0 },
      { month: 12, name: '12월', count: 0, error: 0 },
    ];

    const apiData = await this.mysql.builder()
    .sqlAdd('SELECT MONTH(calltime) AS month, count(*) AS count')
    .sqlAdd('FROM ok_log_api')
    .sqlAdd('WHERE SUBSTRING(calltime,1,10) >= "'+sdate+'" AND SUBSTRING(calltime,1,10) <= "'+edate+'" GROUP BY MONTH(calltime)')
    .sqlAdd('ORDER BY MONTH(calltime) ASC')
    .sqlQuery();

    apiData.forEach((data: any, index: number) => {
      let found = result.find(e => e.month === data.month);
      if (found) found.count = data.count;
    });

    const errData = await this.mysql.builder()
    .sqlAdd('SELECT MONTH(calltime) AS month, count(*) AS count')
    .sqlAdd('FROM ok_log_error')
    .sqlAdd('WHERE SUBSTRING(calltime,1,10) >= "'+sdate+'" AND SUBSTRING(calltime,1,10) <= "'+edate+'" GROUP BY MONTH(calltime)')
    .sqlAdd('ORDER BY MONTH(calltime) ASC')
    .sqlQuery();

    errData.forEach((data: any, index: number) => {
      let found = result.find(e => e.month === data.month);
      if (found) found.error = data.count;
    });

    return _Success(result);
  }

}








function getWhereQuiry(option: any, isHaveWhere: any){
  let query = '';

  if (isHaveWhere) {
    query += ' WHERE '
  }

  for(let i=0;i<option.length;i++){
    if(!(option[i].value.length == 0 || !option[i].value[0])){
      if(query != '' && query != ' WHERE '){
        if(option[i].joint == 'and')
          query += ' AND '
        else
         query += ' OR '
      }

      switch(option[i].type){
        case 'normal' :
          query += option[i].key + ' = "' + option[i].value[0] +'" '
          break;
        case 'not' :
          query += option[i].key + ' != "' + option[i].value[0] +'" '
          break;
        case 'between' :
          query += ' ('+ option[i].key + ' BETWEEN "' + option[i].value[0] +'" AND "' +option[i].value[1] + '") '
          break;
        case 'isNull' :
          query += option[i].key + ' IS NULL '
          break;
        case 'isNotNull' :
          query += option[i].key + ' IS NOT NULL '
          break;
        case 'like' :
          query += option[i].key + ' LIKE "%'+option[i].value[0]+'%" '
          break;
      }
    }
  }

  if(query == '' || query == ' WHERE ') return ''

  return query;
}