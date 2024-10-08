import * as multer from "multer";
import moment from 'moment';
import * as crypto from 'crypto';
import * as path from 'path';

const UPLOAD_PATH = process.env.KAKAO_UPLOAD || 'f:/upload'

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_PATH)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = moment(Date.now()).format('YYYYMMDDHHmmss') + '-' + crypto.randomBytes(24).toString('hex');

    //let originalname = file.originalname;
    //if (file.mimetype == 'image/jpeg') originalname = 'image.jpg';
    //if (file.mimetype == 'image/png' ) originalname = 'image.png';
    //if (file.mimetype == 'image/gif' ) originalname = 'image.gif';
    //if (file.mimetype == 'video/mp4' ) originalname = 'video.mp4';

    const extname = path.extname(file.originalname);
    const fileName = `${uniqueSuffix}${extname}`;
    cb(null, fileName);
  }
})

export const KakaoOCRMulter = {
  limits: { fileSize: 1024 * 1024 * 1024 * 5 },
  storage: storage
};


