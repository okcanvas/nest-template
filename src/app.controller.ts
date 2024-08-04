import { Controller, Get, Post, Render, UseGuards, Param, Query, Body, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { renderFile } from 'ejs';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import md5 from 'md5';
import { AppService } from './app.service';
import { ApiKeyAuthGuard } from 'src/modules/auth/guards';
import { User, Auth, Page } from 'src/common/decorators';
import * as URL from 'url';
import { NewsDto } from 'src/dto';

@ApiTags('Default')
//@ApiSecurity('api-Key')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
  ) {
    
  }

  @Get('/postgresql')
  async postgresql() {
    const data = await this.appService.testPostgreSql();
    return data
  }

  @Get('/mongo/:id')
  async mongo(
    @User() user: any,
    @Query('id') id: number,
  ) {
    return await this.appService.mongo(id);
  }

  @Post('/news')
  async addNews(
    @User() user: any,
    @Body() data: NewsDto
  ) {
    return await this.appService.addNews(user?.userId || 0, data);
  }

  @Get('/url')
  async getURL(
    @User() user: any,
    @Query('url') url: string,
  ) {
    return await this.appService.getURL(url);
  }


  @Get('/test')
  async getTestA() {
    const data = await this.appService.getTestA();
    return data
  }

  @Get('/home')
  @Page('home')
  homeA(
    //@Param('key') key: string,
    @Query('width') width: number,
    //@Query('height') height: number,
  ) {
    const data = { 
      lang: 'ko',
      user: {
        username: 'okcanvas 555'
      },
      message: new Date()
    };
    //console.log(key)

    //this.appService.getTest(data);
    
    
    return data;
  }

  @Get('/home/:key')
  @Page('home')
  homeB(
    @Param('key') key: string,
    @Query('width') width: number,
    //@Query('height') height: number,
  ) {
    const data = { 
      lang: 'ko',
      user: {
        username: key
      },
      message: new Date()
    };
    console.log(md5(key + 'OKCANVAS'))

/*
const Cryptr = require('cryptr');
const cryptr = new Cryptr('oKCanVaS', { pbkdf2Iterations: 1000, saltLength: 5 });
let email = 'some@mail.com';
let encryptdEmail = cryptr.encrypt(email);
console.log("cryptr = ", cryptr);
console.log("Encrypted email = ", encryptdEmail);
console.log("Decrypted email = ", cryptr.decrypt(encryptdEmail ));
*/
    
    
    return data;
  }



  @Get('/profile')
  @Page('profile')
  profileA(
    //@Param('key') key: string,
    //@Query('width') width: number,
    //@Query('height') height: number,
  ) {
    return { 
      lang: 'ko',
      user: {
        username: 'okcanvas9999',
        pet: {
          name: 'marry',
          image: '',
        }
      },
      message: 'Hello world!!====' 
    };
  }



  @Get()
  root(@Res() res: Response) {
    return res.render('index', { message: 'Hello world!!' });
  }

  @Get('name')
  printName(@Res() res: Response) {
    return res.render('print', { message: 'Hello world!!' });
  }

  @Get('layout')
  anotherLayout(@Res() res: Response) {
    return res.render('print', {
      layout: 'layout_other',
      message: 'Hello world!!',
    });
  }

  @Get('array')
  getArray(@Res() res: Response) {
    const contentArray = [
      { message: 'first' },
      { message: 'second' },
      { message: 'third' },
    ];
    return res.render('array', { myArray: contentArray });
  }



  @UseGuards(ApiKeyAuthGuard)
  //@UseGuards(AuthGuard('api-key'))
  @Get('/hello')
  getHello() {
    const data = this.appService.getHello();
    return {
      ...data,
      errno: 0,
    }
  }

  /*
  @Get('/test')
  getTest(
    @Response() res: Res
  ) {
    return res.set({ 'x-access-token': '3212423424234242424242424324324242424242432424324324242' }).json({ hello: 'world' });
    res.set({ 'x-access-token': 1 }).json({ hello: 'world' });
    return { message: 'Hello world!' };
  }
  */




  @Get('/player/:key')
  @Render('player')
  player(
    @Req() request: Request,
    @Param('key') key: string,
    @Query('width') width: number,
    @Query('height') height: number,
  ) {
    const logData = {
      ip: request.headers['x-forwarded-for'] || request.ip,
      url: request.originalUrl,
      hostname: require('os').hostname(),
      userAgent: request.get('user-agent') || '',
      mediaKey: key,
      userKey: request.query['u'] || null,
      params: JSON.stringify(request.params),
      query: JSON.stringify(request.query),
    }

    const data = this.appService.player(key, width, height, logData);
    return data;
  }

  @Get('/sample/:key')
  @Render('sample')
  sample(
    @Param('key') key: string,
    @Query('width') width: number,
    @Query('height') height: number,
  ) {
    const data = this.appService.sample(key, width, height);
    return data;
  }

}


/*
<ref *2> IncomingMessage {
  rawHeaders: [
    'Host',
    'wwww.localhost:9690',
    'Connection',
    'keep-alive',
    'sec-ch-ua',
    '"Google Chrome";v="113", "Chromium";v="113", "Not-A.Brand";v="24"',
    'accept',
    'sec-ch-ua-mobile',
    '?0',
    'User-Agent',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
    'sec-ch-ua-platform',
    '"Windows"',
    'Sec-Fetch-Site',
    'same-origin',
    'Sec-Fetch-Mode',
    'cors',
    'Sec-Fetch-Dest',
    'empty',
    'Referer',
    'http://wwww.localhost:9690/api/docs/',
    'Accept-Encoding',
    'gzip, deflate, br',
    'Accept-Language',
    'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
    'If-None-Match',
    'W/"1a-T7vCLEZV7pLSyUzkr9XBdG32YU8"'
  ],

  originalUrl: '/api/resetbucket',
  params: {},
  query: {},
  body: {},
  [Symbol(kCapture)]: false,
  [Symbol(kHeaders)]: {
    host: 'wwww.localhost:9690',
    connection: 'keep-alive',
    'sec-ch-ua': '"Google Chrome";v="113", "Chromium";v="113", "Not-A.Brand";v="24"',
    'sec-ch-ua-mobile': '?0',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-site': 'same-origin',
    'sec-fetch-mode': 'cors',
    'sec-fetch-dest': 'empty',
    referer: 'http://wwww.localhost:9690/api/docs/',
    'accept-encoding': 'gzip, deflate, br',
    'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
    'if-none-match': 'W/"1a-T7vCLEZV7pLSyUzkr9XBdG32YU8"'
  },
  [Symbol(kHeadersCount)]: 28,
  [Symbol(kTrailers)]: null,
  [Symbol(kTrailersCount)]: 0,
  [Symbol(RequestTimeout)]: undefined
}
*/

