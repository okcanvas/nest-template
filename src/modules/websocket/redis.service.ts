import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { v4 as uuidv4 } from 'uuid';


@Injectable()
export class RedisService {
  constructor(
    @Inject('MICRO_SERVICE') private redisClient: ClientProxy,
  ) {}

  send(command: string, data: any) {
    this.redisClient.emit(command, data);
  }


}