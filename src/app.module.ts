import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE, APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AccessControlModule } from 'nest-access-control';
import { MysqlModule } from '@src/okcanvas-libs';
import { PostgresSqlModule } from '@src/okcanvas-libs';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';
import { MYSQL_OPTIONS } from '@src/config/database.mysql';
import { POSTGRESQL_OPTIONS } from 'src/config/database.postgresql';
import { LoggerMiddleware } from './common/middlewares/logger.middleware';
import { HttpExceptionFilter } from 'src/common/exceptions/http-exception.filter';
import { LoggingInterceptor } from 'src/common/interceptors/logging.interceptor';

//import { ServeStaticModule } from '@nestjs/serve-static';
//import { join } from 'path';
import Joi from 'joi';
import cluster from 'cluster';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CronService } from './modules/cron/cron.service';

import { AuthModule } from './modules/auth/auth.module';
import { LogModule } from './modules/log/log.module';
import { UserModule } from './modules/user/user.module';
import { UploadModule } from './modules/upload/upload.module';
import { WebsocketModule } from './modules/websocket/module';

import * as mongoose from 'mongoose';
import { User, UserSchema } from '@src/schemas/users.schema';
import { MetaData, MetaDataSchema } from '@src/schemas/metadata.schema';

const configOptions = {
  isGlobal: true,
  //envFilePath: process.env.NODE_ENV === 'dev' ? '.env.dev' : '.env.prod',
  //ignoreEnvFile: process.env.NODE_ENV === 'prod', // prod할 때는 heroku에 따로 넣기로
  validationSchema: Joi.object({
    NODE_ENV: Joi.string().valid('develop', 'production', 'test').required(),
    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.string().required(),
    DB_USERNAME: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    DB_DATABASE: Joi.string().required(),
    //
    REDIS_HOST: Joi.string().required(),
    REDIS_PORT: Joi.string().required(),
  }),
}

//console.log(configOption)
//console.log(process.env)
//console.log(configService.get('NODE_SERVER_PORT'))
//console.log(MYSQL_OPTIONS)


var _imports = []
var _controllers = [];
var _providers = [];
if (cluster.isWorker) {
  _imports = [
    ConfigModule.forRoot(configOptions),
    MysqlModule.forRoot(MYSQL_OPTIONS),
    PostgresSqlModule.forRoot(POSTGRESQL_OPTIONS),
    MongooseModule.forRoot(process.env.MONGO_URL),

    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: MetaData.name, schema:MetaDataSchema }]),

    AccessControlModule.forRoles(null),
    ScheduleModule.forRoot(),
    AuthModule,
    LogModule,
    UserModule,
    UploadModule,
    WebsocketModule, 

    //ServeStaticModule.forRoot({
    //  rootPath: join(__dirname, '..', 'public'),
    //}),
  ];
  _controllers = [AppController];
  _providers = process.env['WORKER_CRON'] 
    ? [
        AppService, 
        CronService, 
        {provide: APP_FILTER, useClass: HttpExceptionFilter},
        {provide: APP_INTERCEPTOR, useClass: LoggingInterceptor},
      ] 
    : [
        AppService, 
        {provide: APP_FILTER, useClass: HttpExceptionFilter},
        {provide: APP_INTERCEPTOR, useClass: LoggingInterceptor},
      ]  
}



@Module({
  imports: _imports,
  controllers: _controllers,
  providers: _providers,
})

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');

    //  log enabled
    mongoose.set('debug', true);
  }
}
