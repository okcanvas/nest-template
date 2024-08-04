import 'dotenv/config';
import { Injectable, BadRequestException } from '@nestjs/common';
import { MysqlService } from '@src/okcanvas-libs';
//import * as AWS from 'aws-sdk';
//import * as path from 'path';
//import { PromiseResult } from 'aws-sdk/lib/request';
import { parseTime } from '@src/utils/timezone';
import { _Success, _Fail } from '@src/utils/response';
import axios from 'axios';
import * as path from 'path';
import fs from 'fs';




@Injectable()
export class UploadService {
  //private readonly awsS3: AWS.S3;
  public readonly S3_BUCKET_NAME: string;

  constructor(
    private readonly mysql: MysqlService,
  ) {}


//===========================================================================
  //  
  //===========================================================================
  async createFileOfDocument(user_id: number, doc_sn: string, files: any) {
    console.log(files)
    for (const file of files) {
      await this.mysql.model('ok_upload_files').add({
        doc_sn: doc_sn,
        userId: user_id,
        filename: file.filename,
        filesize: file.size,
        fileurl: file.location,
        originalname: file.originalname,
        extname: (path.extname(file.originalname) || '').toLowerCase(),
      });  
    }

    return this.getFileListOfDocument(user_id, doc_sn);
  }


  //===========================================================================
  //  
  //===========================================================================
  async getFileListOfDocument(user_id: number, doc_sn: string) {
    const data = await this.mysql.model('ok_upload_files').where({ is_delete: 0, doc_sn: doc_sn }).select();
    return _Success(data);
  }

  //===========================================================================
  //  
  //===========================================================================
  async deleteFileOfDocument(user_id: number, doc_sn: string, id: number) {
    await this.mysql.model('ok_upload_files').where({ doc_sn: doc_sn, id: id }).update({ 
      is_delete: 1,
      //delete_user: user_id,
      //delete_time: new Date().getTime() / 1000,
    });

    return this.getFileListOfDocument(user_id, doc_sn);
  }










  public uploadFiles(files: File[]) {
    const generatedFiles: object[] = [];
    console.log(files)

    for (const file of files) {
      generatedFiles.push({
        originalname: file['originalname'],
        contentType: file['contentType'],
        location: file['location'],
        key: file['key'],
      });
    }

    return _Success({
      generatedFiles
    });
    //return generatedFiles;
  }


  //===========================================================================
  //  
  //===========================================================================
  async uploads(files: any[], uploadOption: any) {
    const result = [];
    try {
      const token = await this.getAccessToken();
      if (!token) {
        return _Fail(401, 'Error getAccessToken for Bucket...');
      }

      const accessToken = token.accessToken;
      const account = process.env.KAKAO_ACCOUNT || 'f4eb3ad7c6cf4c2982d7def1d3345065';
      const bucketName = process.env.KAKAO_BUCKET_NAME || 'boksaeng-bucket';

      console.log(files)

      for (let i = 0; i < files.length; i++) {
        const originalname = files[i].originalname
        const size = files[i].size;
        const filepath = files[i].path;
        const filename = files[i].filename;
        const mimetype = files[i].mimetype;
        const url = uploadOption.path 
                  ? `https://objectstorage.kr-central-1.kakaoi.io/v1/${account}/${bucketName}/${uploadOption.path}/${filename}`
                  : `https://objectstorage.kr-central-1.kakaoi.io/v1/${account}/${bucketName}/${filename}`;

        const options = {
          method: 'PUT',
          url: url,
          headers: {
            'x-auth-token': accessToken,
            'Content-Type': mimetype,
          },
          data: fs.createReadStream(filepath)
        };

        const res = await axios(options);
        if (res.status === 200 || res.status === 201) {
          result.push({
            originalname: originalname,
            contentType: mimetype,
            location: url,
            size: size,
            filename: filename,
            key: filename,
          })
        }
      }
    }
    catch (exception) {
      console.log('UPLOAD 장애가 발생하였습니다.', exception);
      return _Fail(401, 'UPLOAD 장애가 발생하였습니다.');
    }
    finally {
      files.forEach((file: any) => {
        fs.unlinkSync(file.path);
        console.log('remove temp file :', file.path);
      });
    }

    //
    console.log('UPLOAD done');
    return _Success({
      generatedFiles: result
    });
  }
  /*
"generatedFiles": [
      {
        "originalname": "001b24de-1200.webp",
        "contentType": "image/webp",
        "location": "https://s3-boksaeng.s3.ap-northeast-2.amazonaws.com/images/1685148187798-4beb55c8f96a784cc89481220d21c7db76c4c6123ba65d78ccf0273d899f71333b14e70903dce7f896c81333eb49a9b4",
        "key": "images/1685148187798-4beb55c8f96a784cc89481220d21c7db76c4c6123ba65d78ccf0273d899f71333b14e70903dce7f896c81333eb49a9b4"
      }
    ]
  */

  //===========================================================================
  //  
  //===========================================================================
  async getAccessToken() {
    const body = {
      "auth": {
        "identity": {
          "methods": [
            "application_credential"
          ],
          "application_credential": {
            "id": "1507648baada4ed09c7e6973c487cb4d",
            "secret": "VTLuMSrJ9NMexVTs4sTOfSl0p5kvv-cFflWjNDA9CmT5FZMdenAyWwKkw4prCxJIu0OFtVcqs4NnI0S8YEVCyg"
          }
        }
      }
    }
    const options = {
      method: 'POST',
      url: 'https://iam.kakaoi.io/identity/v3/auth/tokens',
      data: body
    };

    try {
      const res = await axios(options);
      if (res.status === 200 || res.status === 201) {
        return {
          account: res.data.token.project.id,
          bucketName: res.data.token.project.name,
          accessToken: res.headers['x-subject-token'],
        }
      } else {
        return null;
      }
    }
    catch (exception) {
      console.log('ERROR application_credential', exception.code);
      return null;
    }
  } 
}
