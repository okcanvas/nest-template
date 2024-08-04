import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Req, 
  Request,
  Param,
  Body,
  Query,
  ParseIntPipe,
  ParseBoolPipe,
  UseGuards,
  UploadedFiles, UploadedFile, UseInterceptors, BadRequestException,
  //ParseFilePipe,
  //FileTypeValidator,
  //MaxFileSizeValidator,
} from '@nestjs/common';
import { FilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ApiKeyAuthGuard } from 'src/modules/auth/guards';
import { User, Auth } from 'src/common/decorators';
import { KakaoService } from './kakao.service';
import { KakaoKeywordDto } from './dtos';
import { KakaoOCRMulter, KakaoUploadMulter } from './multer';
import * as multer from "multer";
import moment from 'moment';
import * as crypto from 'crypto';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { _Success, _Fail } from '@src/utils/response';


@ApiTags('Kakao')
//@UseGuards(ApiKeyAuthGuard)
@Controller('kakao')
export class KakaoController {

  constructor(
    private readonly service: KakaoService,
  ) {}

  //===========================================================================
  //
  //===========================================================================
  @ApiOperation({ summary: `headers "${process.env.API_KEY_NAME}": "${process.env.API_KEY}" 주요 키워드 검출` }) 
  //@UseGuards(ApiKeyAuthGuard)
  @Post('/nlp/keyword')
  async keyword(
    @Body() dto: KakaoKeywordDto
  ) {
    console.log(dto);
    return await this.service.keyword(dto);
  }


  //===========================================================================
  //
  //===========================================================================
  @ApiOperation({ summary: `headers "${process.env.API_KEY_NAME}": "${process.env.API_KEY}" 이미지 파일 업로드(파일업로드와 동일)` }) 
  @UseGuards(ApiKeyAuthGuard)
  @Post('/ocr')
  @UseInterceptors(FilesInterceptor('files', null, KakaoOCRMulter))
  async uploadOCR(@UploadedFiles() files: any[]) {
    console.log(files);
    if (files.length > 0) {
      return await this.service.requestOCR(files[0]);
    } else {
      return _Fail(401, '파일을 찾을 수 없습니다.')
    }
  }

  //===========================================================================
  //
  //===========================================================================
  @ApiOperation({ summary: '' }) 
  @UseGuards(ApiKeyAuthGuard)
  @Post('/upload')
  @UseInterceptors(FilesInterceptor('files', null, KakaoUploadMulter))
  async uploadImages(@UploadedFiles() files: any[]) {
    console.log(files)
    const data = await this.service.uploads(files, {path: 'leadwin'});
    console.log(data)
    return data;
  }

  
}
