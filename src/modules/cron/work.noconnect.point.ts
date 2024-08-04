import { Injectable, Logger } from '@nestjs/common';
import { MysqlService } from '@src/okcanvas-libs';
import { parseTime } from '@src/utils/timezone';
import moment from 'moment';

//================================
//  WEEKLY RANG DATE OF DATE
//================================
function getWeeklyRang(timeStamp: Date) {
  const date = moment(timeStamp);
  const startDate = date.startOf('week').isoWeekday(7);
  const endDate = moment(startDate).add(6, 'days');
  return {
    startDate: moment(startDate).format('YYYY-MM-DD'),
    endDate: moment(endDate).format('YYYY-MM-DD'),
  };
}

//================================
//  MONTH RANG DATE OF DATE
//================================
function getMonthRang(timeStamp: Date) {
  const date = moment(timeStamp);
  return {
    startDate: date.startOf('month').format('YYYY-MM-DD'),
    endDate: date.endOf('month').format('YYYY-MM-DD'),
  };
}



//================================
//  ID List에서 중복제거
//================================
function uniqIds(array: Object[], field: string) {
  const Ids = [0];
  array.map(e => { 
    if (e[field]) Ids.push(e[field]) 
  });
  const set = new Set(Ids);
  return [...set];
}

//=============================================================================
//  MAIN WORK
//=============================================================================
export const work = async (_this: any) => {
  _this.logger.log(`==================================================`);
  _this.logger.log(`CRON FOR NO CONNECT POINT`);
  _this.logger.log(`==================================================`);

  //  이번주 시작일+종료일
  const weeklyRange = getWeeklyRang(new Date());
  const conn = await _this.mysql.getConnection();
  try {
    await conn.transaction();


    //  포인트 정보
    const pointList = await conn.query('SELECT type, pointId, point, title FROM point WHERE isEnable = 1 AND isDelete = 0');
    

    //  5일 이상 10일 미만 미접속 회원
    //  POINT ID : 9  shortAbsent
    const point09 = pointList.find((e: any) => e.pointId == 9);
    if (point09) {
      const userList = await conn.query('SELECT userId FROM users WHERE accountState = "normal" AND connectState = "normal" AND lastUseTime < DATE_ADD(NOW(), INTERVAL -5 DAY)');
      console.log('userList', userList)
      userList.forEach(function (user: any) {
        const insert = 'INSERT INTO userPoints (pointId, userId, point, targetId) VALUES (?,?,?,?)'
        conn.query(insert, [point09.pointId, user.userId, point09.point, user.userId])

        const update = 'UPDATE users SET connectState = "shortAbsent", point = point+? WHERE userId = ?'
        conn.query(update, [point09.point, user.userId])
      });
    }

    //  10일 이상 미접속 회원
    //  POINT ID : 10  longAbsent
    const point10 = pointList.find((e: any) => e.pointId == 10);
    if (point10) {
      const userList = await conn.query('SELECT * FROM users WHERE accountState = "normal" AND users.connectState = "shortAbsent" AND DATE_ADD(lastUseTime, INTERVAL -10 DAY) <= NOW()')
      userList.forEach(async function (user: any) {
        const insert = 'INSERT INTO userPoints (pointId, userId, point, targetId) VALUES (?,?,?,?)'
        conn.query(insert, [point10.pointId, user.userId, point10.point, user.userId])

        const update = 'UPDATE users SET connectState = "longAbsent", point = point+? WHERE userId = ?'
        conn.query(update, [point10.point, user.userId])
      });
    }
    
    await conn.commit();
  } catch (e) {
    console.log(e)
    await conn.rollback();
  } finally {
    await conn.release();
  }


}
