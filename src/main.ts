import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Transport } from '@nestjs/microservices'
import { WsAdapter } from '@nestjs/platform-ws';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cluster from 'cluster';
import { join } from 'path';
import * as express from 'express';
import * as os from 'os';
import { AppClusterService } from './app.cluster.service';
import { AppModule } from './app.module';
//import { SERVER_PORT } from './config/constants';
import { HttpExceptionFilter } from 'src/common/exceptions/http-exception.filter';
import { LoggingInterceptor } from 'src/common/interceptors/logging.interceptor';

//import * as hbs from 'express-handlebars';
import hbs from 'express-handlebars';
import { printName } from './hbs/helpers';

import { WsAuthAdapter, WsAuthSocket } from 'src/common/adapters';
import { SocketIoAdapter } from 'src/common/adapters/socket-io.adapter';
import { RedisIoAdapter } from 'src/common/adapters/redis.adapter';

const PORT = process.env.PORT || 8080;
const PREFIX = '/admin' // process.env.PREFIX || '/admin';
export const IS_DEV = process.env.NODE_ENV !== 'production';


async function bootstrap() {
  const logger: Logger = new Logger('MAIN');
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: IS_DEV ? ['log', 'debug', 'error', 'warn'] : ['error', 'warn'],
  });

  
  if (IS_DEV) {
    const options = new DocumentBuilder()
      .setTitle('OKCANVAS API')
      .setDescription('OKCANVAS API')
      .setVersion('1.0.0')
      .addServer(PREFIX)
      //.addApiKey(
      //  {
      //    type: 'apiKey', 
      //    name: 'api-key', 
      //    in: 'header'
      //  }, 
      //  'api-key'
      //)
      .addBearerAuth(
        { 
          description: `Please enter token in following format: Bearer <JWT>`,
          name: 'Authorization',
          bearerFormat: 'Bearer',
          scheme: 'Bearer',
          type: 'http',
          in: 'Header'
        },
        'access-token',
      )
      .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup(`${PREFIX}/docs`, app, document);
  }
  

  //setDefaultUser(config);
  //generateTypeormConfigFile(config);

  //=========================================================
  //  참고자료
  //  https://marklee1117.tistory.com/25?category=547907
  //=========================================================
  //app.useGlobalFilters(new HttpExceptionFilter());
  //app.useGlobalInterceptors(new LoggingInterceptor());


  app.setGlobalPrefix(PREFIX);
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  app.enableCors();
  
  //=======================================================
  //  WebSocket Adapter 
  //=======================================================
  app.useWebSocketAdapter(new WsAuthAdapter(app));
  //app.useWebSocketAdapter(new SocketIoAdapter(app));
  //app.useWebSocketAdapter(new RedisIoAdapter(app));



  /*
  app.enableCors({
    origin: [
      'http://localhost:9690',
      'http://localhost:9690',
      'http://37ac059572c941a9aa0b09c00616ecec.kakaoiedge.com',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Accept');
      next();
  });
  app.enableCors({
      allowedHeaders:"*",
      origin: "*"
  });
  */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  //app.useStaticAssets(join(__dirname, '..', 'public')); 
  //app.setBaseViewsDir(join(__dirname, '..', 'views')); 
  /*
  app.engine(
    'hbs',
    hbs({
      extname: 'hbs',
      defaultLayout: 'layout_main',
      layoutsDir: join(__dirname, '..', 'views', 'layouts'),
      partialsDir: join(__dirname, '..', 'views', 'partials'),
      helpers: { printName },
    }),
  );
  app.setViewEngine('hbs');
  */
  //app.setViewEngine('ejs');
    /*
  app.set('view options', {
    layout: 'layouts/base'
  });
  */



  await app.listen(PORT, () => {
    logger.log(`Starting service : http://localhost:${PORT}${PREFIX}/`);
    logger.log(`Starting service : http://localhost:${PORT}${PREFIX}/docs`);
  });
}
//bootstrap();
AppClusterService.clusterize(bootstrap);
