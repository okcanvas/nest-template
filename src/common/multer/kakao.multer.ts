import 'dotenv/config';
import { UnsupportedMediaTypeException } from '@nestjs/common';
import { KakaoBucketStorage, AUTO_CONTENT_TYPE } from './kakao.storage';
import moment from 'moment';
import * as crypto from 'crypto';
import * as path from 'path';


export const KakaoMulter = (filePath: string = '', filters: string[] = []) => {
  if (filePath.length > 0 && filePath[filePath.length-1] != '/') {
    filePath += '/'
  }

  return {
    limits: { fileSize: 500 * 1024 * 1024 },
    storage: new KakaoBucketStorage({
      accessKey: process.env.KAKAO_ACCESS_KEY || '1507648baada4ed09c7e6973c487cb4d', 
      accessSecret: process.env.KAKAO_ACCESS_SECRET || 'VTLuMSrJ9NMexVTs4sTOfSl0p5kvv-cFflWjNDA9CmT5FZMdenAyWwKkw4prCxJIu0OFtVcqs4NnI0S8YEVCyg', 
      account: process.env.KAKAO_ACCOUNT || 'f4eb3ad7c6cf4c2982d7def1d3345065', 
      bucket: process.env.KAKAO_BUCKET_NAME || 'boksaeng-bucket',
      contentType: AUTO_CONTENT_TYPE,
      metadata: (req: any, file: any, cb: any) => {
        console.log(file)
        cb(null, {fieldName: file.fieldname});
      },
      key: (req: any, file: any, cb: any) => {
        const extname = path.extname(file.originalname);
        const fileName = `${filePath}${moment(Date.now()).format('YYYYMMDDHHmmss')}-${crypto.randomBytes(48).toString('hex')}${extname}`;

        //  str.match(new RegExp(pattern1+'|'+pattern2, 'gi'));

        console.log('####################', extname, filters)
        if (filters.length > 0 && !filters.includes(extname)) {
          cb(new UnsupportedMediaTypeException(`Only ${filters.join(',')} files are allowed`), null);
        } else {
          cb(null, fileName); 
        }
      }
    })
  }
}

