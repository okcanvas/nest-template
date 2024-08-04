import 'dotenv/config';
import { Controller, Post, Get, Put, Delete, Param, Body, UploadedFiles, UploadedFile, UseInterceptors, BadRequestException, UseGuards, ParseIntPipe } from '@nestjs/common';
import { FilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { User, Auth } from 'src/common/decorators';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ApiKeyAuthGuard } from 'src/modules/auth/guards';
import * as multer from "multer";
import multerS3  from 'multer-s3';
import * as AWS from 'aws-sdk';
import { S3Client } from '@aws-sdk/client-s3';
import { KakaoMulter, LocalMulter, MathMulter } from '@src/common/multer';
import { _Success, _Fail } from '@src/utils/response';
import { UploadService } from './upload.service';

const UPLOAD_PATH = process.env.UPLOAD_PATH || 'd:/upload';

@ApiTags('Uplaod')
@Controller('upload')
export class UploadController {
  constructor (
      private readonly uploadService: UploadService
  ) {}

  //   http://127.0.0.1:9680/admin/upload/math
  //@UseGuards(ApiKeyAuthGuard)
  @Post('/math')
  @UseInterceptors(FilesInterceptor('files', null, MathMulter(UPLOAD_PATH)))
  async upload_math_canvas(@UploadedFiles() files: File[]) {
    console.log(files)
    return _Success({
      generatedFiles: files,
      message: 'uploaded',
    });
  }


  @UseGuards(ApiKeyAuthGuard)
  @Post()
  @UseInterceptors(FilesInterceptor('files', null, KakaoMulter('images')))
  async uploads(@UploadedFiles() files: File[]) {
    files.forEach((file: any) => { delete file.fieldname })
    return _Success({
      generatedFiles: files,
      message: 'uploaded',
    });
  }

  @Auth()
  @ApiBearerAuth('access-token')
  @Post('/image')
  @UseInterceptors(FilesInterceptor('files', null, KakaoMulter('images')))
  async uploadMediaImages(
    @UploadedFiles() files: File[],
  ) {
    files.forEach((file: any) => { delete file.fieldname })
    return _Success({
      generatedFiles: files,
      message: 'uploaded',
    });
  }

  @Auth()
  @ApiBearerAuth('access-token')
  @Post('/file')
  @UseInterceptors(FilesInterceptor('files', null, KakaoMulter('files')))
  async uploadMediaFiles(@UploadedFiles() files: File[]) {
    files.forEach((file: any) => { delete file.fieldname })
    return _Success({
      generatedFiles: files,
      message: 'uploaded',
    });
  }

  @Auth()
  @ApiBearerAuth('access-token')
  @Post('/github')
  @UseInterceptors(FilesInterceptor('files', null, KakaoMulter('github')))
  async uploadMediaGithub(@UploadedFiles() files: File[]) {
    files.forEach((file: any) => { delete file.fieldname })
    return _Success({
      generatedFiles: files,
      message: 'uploaded',
    });
  }

  @UseGuards(ApiKeyAuthGuard)
  @Post('/okcanvas')
  @UseInterceptors(FilesInterceptor('files', null, KakaoMulter('okcanvas')))
  async uploadMediaOkcanvas(@UploadedFiles() files: File[]) {
    files.forEach((file: any) => { delete file.fieldname })
    return _Success({
      generatedFiles: files,
      message: 'uploaded',
    });
  }

  @Auth()
  @ApiBearerAuth('access-token')
  @Post('/:doc_sn')
  @UseInterceptors(FilesInterceptor('files', null, KakaoMulter('okcanvas')))
  async createFileOfDocument(
    @User() user: any,
    @UploadedFiles() files: File[],
    @Param('doc_sn') doc_sn: string
  ) {
    return await this.uploadService.createFileOfDocument(user.user_id, doc_sn, files);
  }

  @Auth()
  @ApiBearerAuth('access-token')
  @Get('/:doc_sn')
  async getFileListOfDocument(
    @User() user: any,
    @Param('doc_sn') doc_sn: string
  ) {
    return await this.uploadService.getFileListOfDocument(user.user_id, doc_sn);
  }

  @Auth()
  @ApiBearerAuth('access-token')
  @Delete('/:doc_sn/:id')
  async deleteFileOfDocument(
    @User() user: any,
    @Param('doc_sn') doc_sn: string,
    @Param('id', ParseIntPipe) id: number
  ) {
    return await this.uploadService.deleteFileOfDocument(user.user_id, doc_sn, id);
  }



/*  
  @Auth()
  @ApiBearerAuth('access-token')
  @Post('/image')
  @UseInterceptors(FilesInterceptor('files', null, MulterOptions))
  async uploadMediaImages(@UploadedFiles() files: File[]) {
    const data = await this.uploadService.uploads(files, {path: 'images'});
    return {
      ...data,
      message: 'image uploaded',
    };
  }

  @Auth()
  @ApiBearerAuth('access-token')
  @Post('/file')
  @UseInterceptors(FilesInterceptor('files', null, MulterOptions))
  async uploadMediaFiles(@UploadedFiles() files: File[]) {
    const data = await this.uploadService.uploads(files, {path: 'files'});
    return {
      ...data,
      message: 'file uploaded',
    };
  }

  @Auth()
  @ApiBearerAuth('access-token')
  @Post('/github')
  @UseInterceptors(FilesInterceptor('files', null, MulterOptions))
  async uploadMediaGithub(@UploadedFiles() files: File[]) {
    const data = await this.uploadService.uploads(files, {path: 'github'});
    return {
      ...data,
      message: 'github uploaded',
    };
  }
*/

}

