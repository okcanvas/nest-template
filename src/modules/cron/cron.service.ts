import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MysqlService } from '@src/okcanvas-libs';
import moment from 'moment';
import { work as cronNoConnectPoint }  from './work.noconnect.point';
import { work as cronNoConnectPush }  from './work.noconnect.push';
import { work as cronTodoPush }  from './work.todo.push';
import { work as cronWeeklyRank }  from './work.week.rank';
import { work as cronContentDepth }  from './work.content.depth';
import { work as cronReviewPush }  from './work.review.push';

//  https://www.ibm.com/docs/ko/urbancode-release/6.1.0?topic=interval-cron-expressions-defining-frequency
//const TEST_SCHEDULE = '*/10 * * * * *';
const SCHEDULE_ALL_01M = '0 0/1 * * * *';     //  1분
const SCHEDULE_ALL_05M = '0 0/5 * * * *';     //  5분
const SCHEDULE_ALL_10M = '0 0/10 * * * *';    //  10분
const SCHEDULE_ALL_30M = '0 0/30 * * * *';    //  30분
const SCHEDULE_ALL_01H = '0 0 1 * * *';       //  매일 01시
const SCHEDULE_DAY_05H = '0 0 5 * * *';       //  매일 05시
const SCHEDULE_ALL_13H = '0 0 13 * * *';
const SCHEDULE_ALL_12H45M = '0 47 12 * * *';
const TEST_SCHEDULE = '*/10 * * * * *';


@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    private readonly mysql: MysqlService,
  ) {}

  @Cron(SCHEDULE_ALL_01M, {
    name: 'notifications',
    timeZone: 'Asia/Seoul',
  })
  triggerNotifications() {
    //this.logger.log(`==================================================`);
    //this.logger.log(`1분마다 실행`);
    //this.logger.log(`==================================================`);
  }

  //===========================================================================
  //  복생이 오믈의목표 리뷰 알람
  //  5분마다 실행
  //===========================================================================
  @Cron(SCHEDULE_ALL_05M, {
    name: 'ReviewPush',
    timeZone: 'Asia/Seoul',
  })
  async triggerReviewPush() {
    //cronReviewPush(this);
  }

  //===========================================================================
  //  미접속 포인트 변경 스케줄러
  //  매일 05시
  //===========================================================================
  @Cron(SCHEDULE_ALL_01H, {
    name: 'NoConnect',
    timeZone: 'Asia/Seoul',
  })
  async triggerNoConnect() {
    //cronNoConnectPoint(this);
  }

  //===========================================================================
  //  weeklyRank  레코드 생성
  //  랭킹 일정 변경 및 마감처리 스케줄러
  //  
  //===========================================================================
  @Cron(SCHEDULE_DAY_05H, {
    name: 'createWeekly',
    timeZone: 'Asia/Seoul',
  })
  async triggerCreateWeekly() {
    //cronWeeklyRank(this);
  }
  //===========================================================================
  //  3일연속으로 투두리스트를 생성하지 않았을때 알림, 하루에 한번씩
  //  전송시간 설정 필요.....
  //===========================================================================
  @Cron(SCHEDULE_ALL_10M, {
    name: 'todopush',
    timeZone: 'Asia/Seoul',
  })
  async triggerTodoPush() {
    //cronTodoPush(this);
  }

  //===========================================================================
  //  3일연속으로 접속하지 않을경우 
  //  전송시간 설정 필요.....
  //===========================================================================
  @Cron(SCHEDULE_ALL_10M, {
    name: 'NoConnectPush',
    timeZone: 'Asia/Seoul',
  })
  async triggerNoConnectPush() {
    //cronNoConnectPush(this);
  }

  //===========================================================================
  //  기출문제의 Delpth를 계산한다.
  //  30분마다 변경된 것만...
  //===========================================================================
  @Cron(SCHEDULE_ALL_10M, {
    name: 'ContentDepth',
    timeZone: 'Asia/Seoul',
  })
  async triggerContentDepth() {
    //cronContentDepth(this);
  }

  //===========================================================================
  //  기출문제의 Delpth를 계산한다.
  //  매일 05시 전체
  //===========================================================================
  @Cron(SCHEDULE_DAY_05H, {
    name: 'ContentDepthAll',
    timeZone: 'Asia/Seoul',
  })
  async triggerContentDepthAll() {
    //cronContentDepth(this, true);
  }

}
