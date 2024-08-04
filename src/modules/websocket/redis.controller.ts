import { Controller, Logger, Post, Get } from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';
import md5 from 'md5';
import { MessagePattern, RedisContext, Ctx, Payload } from '@nestjs/microservices';
import { RedisService } from './redis.service';
import { GatewayService } from './gateway.service';
import { ApiKeyAuthGuard } from 'src/modules/auth/guards';
import { User, Auth, Page } from 'src/common/decorators';
import { _Success, _Fail } from '@src/utils/response';
import { IotData, MIN_SLITTING_LINE, MAX_SLITTING_LINE } from './interfaces';


@ApiTags('message')
@Controller('message/redis')
export class RedisController {
  private static readonly logger = new Logger('REDIS');

  constructor(
    private readonly service: RedisService,
    private readonly gateway: GatewayService,
  ) {
    
  }

  
  @MessagePattern('notifications')
  getNotifications(@Payload() data: string[], @Ctx() context: RedisContext) {
    console.log('===', 'app')
    console.log(`Channel: `, context.getChannel())
    console.log(`message : `, data)
    console.log(`context : `, context)
  }

  @MessagePattern('message')
  getMessage(@Payload() data: string[], @Ctx() context: RedisContext) {
    RedisController.logger.log('<<< REDIS RECV', data)
    //console.log('===', 'message')
    //RedisController.logger.log(`Channel: ${context.getChannel()}`)
    //RedisController.logger.log(`message : ${data}`, data)
    //RedisController.logger.log(`context : ${context}`, context)
    this.gateway.broadcast(null, data)
  }

  @MessagePattern('msg:broadcast')
  onBroadcast(@Payload() data: string[], @Ctx() context: RedisContext) {
    //RedisController.logger.log('<<< REDIS RECV', data)
    this.gateway.broadcast(null, data)
  }

  //---------------------------------------------------------------------------
  //
  //---------------------------------------------------------------------------
  @MessagePattern('msg:IOT:slitting')
  onIOT(@Payload() data: string[], @Ctx() context: RedisContext) {
    //const channel = context.getChannel();
    //console.log('<<< REDIS RECV', channel)
    //RedisController.logger.log('<<< REDIS RECV msg:IOT',  data)
    //this.gateway.broadcast(null, data);

    //
    //IotData.setData('slitting', data || []);
    //console.log('<<< REDIS RECV', process.pid, IotDataRecord.get('slitting'))
  }

  @MessagePattern('msg:slitting')
  onSlitting(@Payload() data: any, @Ctx() context: RedisContext) {
    const line = data.line || 0;
    if (line >= MIN_SLITTING_LINE && line <= MAX_SLITTING_LINE) {
      IotData.slitting.setLine(line, data);
    }
  }
  

  @Get('/slitting')
  async getSlitting() {
    const data = IotData.slitting.getList();
    return _Success(data);
  }

  @Post('/send')
  async redisSend() {
    const channel = 'notifications';
    const payload = {
      name: 'kim',
      tell: '4140-0278'
    }

    this.service.send(channel, payload);
  }

}