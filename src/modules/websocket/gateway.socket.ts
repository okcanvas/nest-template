import {
  SubscribeMessage,
  MessageBody, 
  ConnectedSocket,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { ValidationPipe, UsePipes, UseGuards, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ExtendedSocket } from './interfaces';
import { GatewayService, USER_TYPE_IOT } from './gateway.service';
//import { RedisService } from './redis.service';
import { MysqlService, PostgresSqlService } from '@src/okcanvas-libs';
import { CommandDTO } from './dto';
import { Observable, map, from } from 'rxjs';
//import { setIotData, getIotData } from './interfaces';
import { IotData, MIN_SLITTING_LINE, MAX_SLITTING_LINE } from './interfaces';

import { User, Auth } from '@src/common/decorators';
import { ApiTags, ApiBearerAuth, ApiProperty } from '@nestjs/swagger';
import { ApiKeyAuthGuard, WsGuard } from 'src/modules/auth/guards';

/*
@WebSocketGateway(8681, {
  cors: {
    //origin: 'http://localhost:8681',
    origin: '*',
  },
})
*/

//@Auth()
//@ApiBearerAuth('access-token')
//@UseGuards(WsGuard)
@WebSocketGateway({ /*namespace: 'gateway'*/ path: 'gateway' }) // namespace는 optional 입니다!
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit 
{
  constructor(
    private readonly mysql: MysqlService,
    private readonly postgresql: PostgresSqlService,
    private readonly gateway: GatewayService,
    //private readonly redis: RedisService
  ) {}
  private static readonly logger = new Logger('WEBSOCKET');
  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    SocketGateway.logger.debug(`Socket Server Init Complete`);
  }

  //  소켓 연결
  public handleConnection(client: ExtendedSocket, req: Request): void {
    SocketGateway.logger.log('connected');
    //this.gateway.createUser(client);

    console.log(client.userInfo, req.query)
  }

  //  소켓 연결 해제
  public handleDisconnect(client: ExtendedSocket): void {
    SocketGateway.logger.log('disonnected');
    //this.gateway.deleteUser(client);
  }

  /*
  @SubscribeMessage('msg:IOT:slitting:read')
  async onIOTSlittingRead(client: ExtendedSocket, data: any) {
    const slitting = IotData.getData('slitting') || [];
    const payload ={
      event: 'msg:IOT:slitting:read',
      data: slitting
    }
    client.send(JSON.stringify(payload)); 
  }
  */


  //  NEWS
  @SubscribeMessage('msg:news')
  async onNews(client: ExtendedSocket, data: any) {
    //console.log('<<< msg:news', client.sessionID, data);
    //this.redis.send('msg:broadcast', data)
    //this.gateway.broadcast(client, data);

    const dbData = await this.postgresql.model('math_question').where({ document_id: 105 }).select()
    console.log(dbData.length)


    const payload ={
      event: 'msg:news',
      data: '응답보내기'
    }
    client.send(JSON.stringify(payload)); 
    /*
    //
    delete data.sections;
    delete data.followingCodes;
    data.horizontalWritingYn = (data.horizontalWritingYn == 'true');
    const found = await this.mysql.model('aaa_naver_news').where({ articleId: data.articleId }).find();
    if (this.mysql.helper.isEmpty(found)) {
      try {
        await this.mysql.model('aaa_naver_news').add(data); 
      } catch (error) {
        delete data.content;
        await this.mysql.model('aaa_naver_news').add(data); 
      }
    }
    */
  }



  //  COMMAND
  @SubscribeMessage('msg:command')
  async onCommand(client: ExtendedSocket, data: any) {
    console.log('<<< msg:command', client.sessionID, data)
  }

  //  BROADCAST
  @SubscribeMessage('msg:broadcast')
  async onBroadcast(client: ExtendedSocket, data: any) {
    console.log('<<< msg:broadcast', client.sessionID, data);
    //this.redis.send('msg:broadcast', data)
  }


  //메시지가 전송되면 모든 유저에게 메시지 전송
  @SubscribeMessage('message')
  onMessage(client: ExtendedSocket, data: any): void {
    console.log('<<< message', data, new Date())
    const payload ={
      event: 'message',
      data: {
        ...data,
        pid: process.pid,
      }
    }
    client.send(JSON.stringify(payload)); 


    //  메세지 공유
    //this.redis.send('message', payload)
  }

}