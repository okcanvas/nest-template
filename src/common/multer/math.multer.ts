import 'dotenv/config';
import * as multer from "multer";
import moment from 'moment';
import * as crypto from 'crypto';
import * as path from 'path';

function getFileExtension(filePath) {
  return path.extname(filePath).slice(1);
}


export const MathMulter = (filePath: string = '') => {
  if (filePath.length > 0 && filePath[filePath.length-1] != '/') {
    filePath += '/'
  }

  return {
    limits: { fileSize: 500 * 1024 * 1024 },
    storage: multer.diskStorage({
      destination: function (req: any, file: any, cb: any) {
        cb(null, filePath)
      },
      filename: function (req: any, file: any, cb: any) {
        //  유니코드 파일명
        file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');

        //
        const filePrefix = getFileExtension(filePath);
        const uniqueSuffix = moment(Date.now()).format('YYMMDDHHmmss') + '-' + crypto.randomBytes(12).toString('hex');
        const extname = path.extname(file.originalname);
        const fileName = `${uniqueSuffix}${extname}`;
        const fileName_test = file.originalname;

        cb(null, fileName_test);
      }
    })
  }
}

