import { Injectable, Logger } from '@nestjs/common';
import moment from 'moment';
import pushing from '@src/utils/push-message';
import { parseTime } from '@src/utils/timezone';

//=============================================================================
//  MAIN WORK
//=============================================================================
export const work = async (_this: any) => {
  _this.logger.log(`==================================================`);
  _this.logger.log(`CRON FOR review`);
  _this.logger.log(`==================================================`);

  //
  let listA = [];
  let listB = [];
  const conn = await _this.mysql.getConnection();
  try {
    await conn.transaction();
    //  복생이
    const sqlA = 'SELECT user.userId, user.pushToken, user.isPush, list.boksaengListId '
               + 'FROM (SELECT * FROM boksaengList WHERE isAlarm = 0 AND reviewDate < NOW()) AS list '
               + 'LEFT JOIN users AS user ON user.userId = list.userId ';
    listA = await conn.query(sqlA);
    for (const user of listA) {
      await conn.query('UPDATE boksaengList SET isAlarm = 1 WHERE boksaengListId = ?',[user.boksaengListId]);
    }
    //  오늘의 목표
    const sqlB = 'SELECT user.userId, user.pushToken, user.isPush, list.dailyPurposeId '
               + 'FROM (SELECT * FROM dailyPurpose WHERE isAlarm = 0 AND `date` < NOW()) AS list '
               + 'LEFT JOIN users AS user ON user.userId = list.userId ';
    listB = await conn.query(sqlB);
    for (const user of listB) {
      await conn.query('UPDATE dailyPurpose SET isAlarm = 1 WHERE dailyPurposeId = ?',[user.dailyPurposeId]);
    }

    await conn.commit();
  } catch (e) {
    console.log(e)
    await conn.rollback();
  } finally {
    await conn.release();
  }

  //
  for (const user of listA) {
    if (user.isPush == 1 && user.pushToken && user.pushToken != '') {
      const multiMessage ={
        tokens: [user.pushToken],
        priority: 'high',
        notification: {
          title: '복생이',
          body: '복생이 리뷰 알림',
        },
        data: {
          title: '복생이',
          body: '복생이 리뷰 알림',
          origin: 'boksaengList',
          boksaengListId: String(user.boksaengListId),
        },
        android: {
          notification: {
            channelId: 'repeach_noti_channel',
            priority: 'max',
            defaultSound: 'true',
          },
        },
      };
      const pushResults = await pushing.multiSend(multiMessage);
      console.log('<<<<<', pushResults);
    }
  }

  //
  for (const user of listB) {
    if (user.isPush == 1 && user.pushToken && user.pushToken != '') {
      const multiMessage ={
        tokens: [user.pushToken],
        priority: 'high',
        notification: {
          title: '복생이',
          body: '오늘의 목표 알림',
        },
        data: {
          title: '복생이',
          body: '오늘의 목표 알림',
          origin: 'dailyPurpose',
          boksaengListId: String(user.dailyPurposeId),
        },
        android: {
          notification: {
            channelId: 'repeach_noti_channel',
            priority: 'max',
            defaultSound: 'true',
          },
        },
      };
      const pushResults = await pushing.multiSend(multiMessage);
      console.log('<<<<<', pushResults);
    }
  }


}
