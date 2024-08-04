import 'dotenv/config';
import * as multer from "multer";
import moment from 'moment';
import * as crypto from 'crypto';
import * as path from 'path';


export const LocalMulter = (filePath: string = '') => {
  if (filePath.length > 0 && filePath[filePath.length-1] != '/') {
    filePath += '/'
  }

  return {
    limits: { fileSize: 500 * 1024 * 1024 },
    storage: multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, filePath)
      },
      filename: function (req, file, cb) {
        const uniqueSuffix = moment(Date.now()).format('YYYYMMDDHHmmss') + '-' + crypto.randomBytes(24).toString('hex');
        const extname = path.extname(file.originalname);
        const fileName = `${uniqueSuffix}${extname}`;
        cb(null, fileName);
      }
    })
  }
}

