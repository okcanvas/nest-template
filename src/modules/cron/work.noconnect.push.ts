import { Injectable, Logger } from '@nestjs/common';
import { MysqlService } from '@src/okcanvas-libs';
import moment from 'moment';
import pushing from '@src/utils/push-message';
import { parseTime } from '@src/utils/timezone';

//================================
//  CURRENT DATES IN TIS WEEKLY
//================================
function getWeeklyRang(timeStamp: Date) {
  const today = moment(timeStamp);
  const startDate = today.startOf('week').isoWeekday(7);
  const endDate = moment(startDate).add(6, 'days');
  return {
    startDate: moment(startDate).format('YYYY-MM-DD'),
    endDate: moment(endDate).format('YYYY-MM-DD'),
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
  _this.logger.log(`CRON FOR NO CONNECT PUSH`);
  _this.logger.log(`==================================================`);

  //  PUSH_005
  const messageId = 'PUSH_005';
  const messages = await _this.mysql.query('SELECT * FROM message_auto WHERE is_enabled = 1 AND auto_id = ?', [messageId]);
  if (messages.length == 0) return;

  const title = '';
  const content = messages[0].message || '복생이가 애타게 기다리고 있어… 우리 행복했잖아…오늘도 복생이랑 함께해줄거지?';
  const pushTokens = [];

  //
  const conn = await _this.mysql.getConnection();
  try {
    await conn.transaction();
    //  3일
    const userList = await conn.query('SELECT userId, pushToken FROM users WHERE accountState = "normal" AND DATE_ADD(users.lastUseTime, INTERVAL 3 DAY) < NOW()');

    for (const user of userList) {
      if (user.pushToken && user.pushToken != '') {
        //  9시간
        const type = 'connectNone';
        const select = 'SELECT * FROM alarmLogAuto WHERE userId = ? AND type = ? AND SUBSTRING( DATE_ADD(createdAt, INTERVAL 9 HOUR),1,10 ) = SUBSTRING( DATE_ADD(NOW(), INTERVAL 9 HOUR) ,1,10 ) '
        const logResult = await conn.query(select, [user.userId, type])
        if (logResult.length == 0){
          const insert = 'INSERT INTO alarmLogAuto (type, userId, messageId, content) VALUES (?,?,?,?)'
          await conn.query(insert,[type, user.userId, messageId, content])
          //  PUSH SEND
          pushTokens.push(user.pushToken)
        }
      }
    };
    
    await conn.commit();
  } catch (e) {
    console.log(e)
    await conn.rollback();
  } finally {
    await conn.release();
  }

  const max = 300;
  const count = Math.ceil(pushTokens.length / max);
  for (let i=0; i < count; i++) {
    const sendTokens = pushTokens.slice(i*max, i*max + max);
    const multiMessage ={
      tokens: sendTokens,
      priority: 'high',
      notification: {
        title: title,
        body: content,
      },
    };

    const pushResults = await pushing.multiSend(multiMessage);
    console.log('<<<<<', pushResults);
  }
  
}
