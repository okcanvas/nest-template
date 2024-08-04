import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
//import * as redisIoAdapter from 'socket.io-redis';
import redisIoAdapter from 'socket.io-redis';

/*
console.log('=========================================', redisIoAdapter)
const redisAdapter = redisIoAdapter({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});
console.log('=========================================', redisAdapter)
*/


export class RedisIoAdapter extends IoAdapter {
  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    const redisAdapter = redisIoAdapter({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    });

    server.adapter(redisAdapter);
    return server;
  }
}