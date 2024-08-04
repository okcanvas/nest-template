import { Injectable, Logger } from '@nestjs/common';
import { MysqlService } from '@src/okcanvas-libs';
import moment from 'moment';
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
  let Ids = [0];
  array.map(e => { 
    if (e[field]) Ids.push(e[field]) 
  });
  let set = new Set(Ids);
  return [...set];
}

//=============================================================================
//  MAIN WORK
//=============================================================================
export const work = async (_this: any) => {
  _this.logger.log(`==================================================`);
  _this.logger.log(`CRON FOR ADD WEEKLY RANK`);
  _this.logger.log(`==================================================`);

  //  이번주 시작일+종료일
  const weeklyRange = getWeeklyRang(new Date());
  const conn = await _this.mysql.getConnection();
  try {
    await conn.transaction();


    //  이번주 랭킹 없으면, 랭킹 일정 추가
    const newWeeklyRank = await conn.query('SELECT * FROM weeklyRank WHERE startDate = ? AND endDate = ?', [weeklyRange.startDate, weeklyRange.endDate]);
    if (newWeeklyRank.length == 0) {
      await conn.query('INSERT INTO weeklyRank (startDate, endDate) VALUES (?, ?)', [weeklyRange.startDate, weeklyRange.endDate]);
    }

    //  지난주 랭킹 일정 찾기
    const weeklyRankResult = await conn.query('SELECT * FROM weeklyRank WHERE isDone = 0 AND endDate < SUBSTRING(NOW(),1,10)');
    if (weeklyRankResult.length != 0) {
      //  이전 랭킹 일정 마감
      const update = 'UPDATE weeklyRank SET isDone = 1 WHERE weeklyRankId = ? '
      await conn.query(update, [weeklyRankResult[0].weeklyRankId])

      //  GET TOTAL POINT OF WEEK
      const select = 'SELECT userId, sum(point) as totalPoint ' +
                     'FROM userPoints WHERE SUBSTRING(userPoints.createdAt,1,10) >= ? AND SUBSTRING(userPoints.createdAt,1,10) <= ? ' +
                     'GROUP BY userId ' +
                     'ORDER BY totalPoint DESC ' +
                     'LIMIT 10000';
      const rankResult = await conn.query(select, [weeklyRange.startDate, weeklyRange.endDate]);

      //  MAKE RANKING
      rankResult.forEach((user: any, index: number) => {
        if (index == 0) {
          user['ranking'] = 1; 
        } else {
          if (user['totalPoint'] == rankResult[index-1]['totalPoint']) {
            user['ranking'] = rankResult[index-1]['ranking'];
          } else {
            user['ranking'] = rankResult[index-1]['ranking'] + 1;
          }
        }
      });

      
      //  GIVE MEDAL
      const insertMedal = 'INSERT INTO userMedals (userId, type, weeklyRankId) VALUES (?,?,?)';
      const updateGold = 'UPDATE users SET goldMedalCount = goldMedalCount +1 WHERE userId = ? ';
      const updateSilver = 'UPDATE users SET silverMedalCount = silverMedalCount +1 WHERE userId = ? ';
      const updateBronze = 'UPDATE users SET bronzeMedalCount = bronzeMedalCount +1 WHERE userId = ? ';
      for (var i = 0; i < rankResult.length; i++) {
        if (rankResult[i].ranking == 1) {
          await conn.query(insertMedal, [rankResult[i].userId, "gold", weeklyRankResult[0].weeklyRankId])
          await conn.query(updateGold, [rankResult[i].userId])
        }
        else if (rankResult[i].ranking == 2) {
          await conn.query(insertMedal, [rankResult[i].userId, "silver", weeklyRankResult[0].weeklyRankId])
          await conn.query(updateSilver, [rankResult[i].userId])
        }
        else if (rankResult[i].ranking == 3) {
          await conn.query(insertMedal, [rankResult[i].userId, "bronze", weeklyRankResult[0].weeklyRankId])
          await conn.query(updateBronze, [rankResult[i].userId])
        }
      }
    }


    /*
    //  카카오 이전으로
    //  MYSQL 버전 달라져 사용 못함
    if (weeklyRankResult.length != 0) {

      //  이전 랭킹 일정 마감
      const update = 'UPDATE weeklyRank SET isDone = 1 WHERE weeklyRankId = ? '
      await conn.query(update, [weeklyRankResult[0].weeklyRankId])

      //  메달 지급
      const select = 'SELECT users.userId as userId, DENSE_RANK() OVER (ORDER BY t.totalPoint DESC) as ranking ' +
                     'FROM ( SELECT *, sum(point) as totalPoint ' +
                     'FROM userPoints WHERE SUBSTRING(userPoints.createdAt,1,10) >= "' + weeklyRange.startDate + '" ' + 
                                       'AND SUBSTRING(userPoints.createdAt,1,10) <= "' + weeklyRange.endDate + '" GROUP BY userId ) t ' +
                     'JOIN users ON (users.userId = t.userId) '

      const medalResult = await conn.query(select)
      for (var i = 0; i < medalResult.length; i++) {

        const insert = 'INSERT INTO userMedals (userId, type, weeklyRankId) VALUES (?,?,?)'

        if (medalResult[i].ranking == 1) {
          await conn.query(insert, [medalResult[i].userId, "gold", weeklyRankResult[0].weeklyRankId])

          const update = 'UPDATE users SET goldMedalCount = goldMedalCount +1 WHERE userId = ? '
          await conn.query(update, [medalResult[i].userId])

        }
        else if (medalResult[i].ranking == 2) {
          await conn.query(insert, [medalResult[i].userId, "silver", weeklyRankResult[0].weeklyRankId])

          const update = 'UPDATE users SET sliverMedalCount = sliverMedalCount +1 WHERE userId = ? '
          await conn.query(update, [medalResult[i].userId])
        }
        else if (medalResult[i].ranking == 3) {
          await conn.query(insert, [medalResult[i].userId, "bronze", weeklyRankResult[0].weeklyRankId])

          const update = 'UPDATE users SET bronzeMedalCount = bronzeMedalCount +1 WHERE userId = ? '
          await conn.query(update, [medalResult[i].userId])
        }

      }
    }
    */
    
    await conn.commit();
  } catch (e) {
    console.log(e)
    await conn.rollback();
  } finally {
    await conn.release();
  }


}
