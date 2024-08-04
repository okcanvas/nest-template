import { Module } from '@nestjs/common';
import { Transport, ClientsModule } from '@nestjs/microservices'
//import { ChatGateway } from './gateway.socket';
import { SocketGateway } from './gateway.socket';
//import { RedisController } from './redis.controller';
//import { RedisService } from './redis.service';
import { GatewayService } from './gateway.service';

@Module({
  imports: [],
  controllers: [],
  providers: [SocketGateway,  GatewayService],
})
export class WebsocketModule {}


/*
import { Module } from '@nestjs/common';
import { Transport, ClientsModule } from '@nestjs/microservices'
//import { ChatGateway } from './gateway.socket';
import { SocketGateway } from './gateway.socket';
import { RedisController } from './redis.controller';
import { RedisService } from './redis.service';
import { GatewayService } from './gateway.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'MICRO_SERVICE',
        transport: Transport.REDIS,
        options: {
          host: process.env.REDIS_HOST,
          port: Number(process.env.REDIS_PORT),
        }
      },
    ]),
  ],
  controllers: [RedisController],
  providers: [SocketGateway, RedisService, GatewayService],
})
export class WebsocketModule {}

*/