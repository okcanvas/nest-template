import axios from 'axios';

/*
export default axios.create({
  baseURL: 'https://api.mathpix.com/v3',
  headers: {
    "content-type": "application/json",
    "app_id": "akfn011_naver_com_481ac7",
    "app_key": "b6b89c51202c79ef922b13cd3af04f1944b4d50f96668569989d5a5c3721acf3"
    }
});
*/

export default class KakaoClient {
  http: any;
  accessKey: string;
  accessSecret: string;
  accessToken: string;
  ready: any;
  error: any;
  
  constructor(options: any) {
    this.http = axios.create();
    this.accessKey = options.accessKey;
    this.accessSecret = options.accessSecret;
    this.ready = options.ready;
    this.error = options.error;
    this.init();
  }

  init() {
    const accessTokenOptions = {
      method: 'POST',
      url: 'https://iam.kakaoi.io/identity/v3/auth/tokens',
      data: {
        "auth": {
          "identity": {
            "methods": [
              "application_credential"
            ],
            "application_credential": {
              "id": this.accessKey,
              "secret": this.accessSecret
            }
          }
        }
      }
    };

    const now1 = Date.now();
    this.http(accessTokenOptions).then((res) => {
      console.log('accessTokenOptions  ========================', (Date.now() - now1))
      if (res.status === 200 || res.status === 201) {
        this.accessToken = res.headers['x-subject-token'];
        this.ready() 
      }
  	}).catch((e) => {
      console.log(e)
      this.error(e);
    });
  }


}

