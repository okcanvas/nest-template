import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
//import { HttpService } from '@nestjs/axios';
import { Axios, AxiosInstance, AxiosPromise, AxiosRequestConfig, AxiosResponse } from 'axios';
import { MysqlService } from '@src/okcanvas-libs';
import * as _lib from '@src/utils/common';
import { _Success, _Fail, helper } from '@src/utils/response';
import { Length } from 'class-validator';
import { KakaoKeywordDto } from './dtos';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';



@Injectable()
export class KakaoService {

  constructor(
    private readonly mysql: MysqlService,
  ) {}



/*
curl -L -X POST '{API Endpoint URL}' \
 -H 'x-api-key: {API Key}' \
 -H 'Content-Type: application/json' \
 -d '{
    "sentences": [
        "기축 통화는 국제 거래에 결제 수단으로 통용되고 환율 결정에 기준이 되는 통화이다.",
        "1960년 트리핀 교수는 브레턴우즈 체제 에서의 기축 통화인 달러화의 구조적 모순을 지적했다.",
        "한 국가의 재화와 서비스의 수출입 간 차이인 경상 수지는 수입이 수출을 초과하면 적자이고, 수출이 수입을 초과하면 흑자이다."
    ],
    "lang": "ko"
  }'
*/
//  API key   ab71f3871d4e3c0c8a2c6fe482a2456c
//  EndpOINT  https://df3f764e-442d-47af-9f83-364b7bd72145.api.kr-central-1.kakaoi.io/ai/nlp/31b29f25e4004b0798342db3c22df20c

  async keyword(dto: KakaoKeywordDto) {
    try {
      const options = {
        method: 'POST',
        url: 'https://df3f764e-442d-47af-9f83-364b7bd72145.api.kr-central-1.kakaoi.io/ai/nlp/31b29f25e4004b0798342db3c22df20c',
        headers: {
          'x-api-key': 'ab71f3871d4e3c0c8a2c6fe482a2456c',
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        data: dto
      };

      const res = await axios(options);
      if (res.status === 200 || res.status === 201) {
        return _Success(res.data);
      } else {
        return _Fail(401, res.data.response.statusText);
      }
    }
    catch (exception) {
      const res = exception.response || {};
      if (res.status == 400) {
        console.log('장애가 발생하였습니다.', res.data)
        return _Fail(400, res.data.code);
      } else {
        console.log('장애가 발생하였습니다.', exception);
        return _Fail(401, '장애가 발생하였습니다.');
      }
    }  
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
            url: url,
            size: size,
            originalname: originalname,
            filename: filename,
            mimetype: mimetype
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
    return _Success(result);
  }

  //===========================================================================
  //  
  //===========================================================================
  async uploadLeadwin(files: any[], uploadOption: any) {
    const result = [];
    try {
      const token = await this.getAccessToken();
      if (!token) {
        return _Fail(401, 'Error getAccessToken for Bucket...');
      }

      const accessToken = token.accessToken;
      const account = process.env.KAKAO_ACCOUNT || 'f4eb3ad7c6cf4c2982d7def1d3345065';
      const bucketName = process.env.KAKAO_BUCKET_NAME || 'boksaeng-bucket';

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
            url: url,
            size: size,
            originalname: originalname,
            filename: filename,
            mimetype: mimetype
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
    return _Success(result);
  }


  //===========================================================================
  //  
  //===========================================================================
  async requestOCR(fileInfo: any) {
    try {
      const formData = new FormData();
      formData.append('image', fs.createReadStream(fileInfo.path));

      const options = {
        method: 'POST',
        url: 'https://580901a0-2149-4bfd-b244-ba34174b536d.api.kr-central-1.kakaoi.io/ai/ocr/a42e2fbeb44e43a285ad50416f359e7e',
        headers: {
          'x-api-key': '2b8bd75ca6cc38144dc167fe798ab085',
          'Content-Type': 'multipart/form-data',
          'Access-Control-Allow-Origin': '*'
        },
        data: formData
      };

      const res = await axios(options);
      if (res.status === 200 || res.status === 201) {
        return _Success({
          ...res.data,
          //url: 'http://app.repeach.net/upload/kakao/' + fileInfo.filename,
          url: 'https://objectstorage.kr-central-1.kakaoi.io/v1/f4eb3ad7c6cf4c2982d7def1d3345065/boksaeng-bucket/images/20230527095157-f10e07384274627c1169988007b26bcb7ef46c3ab3aaeffa.webp'
        });
      } else {
        return _Fail(401, res.data.response.statusText);
      }
    }
    catch (exception) {
      console.log('UPLOAD 장애가 발생하였습니다.', exception);
      return _Fail(401, 'UPLOAD 장애가 발생하였습니다.');
    }
  }




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
