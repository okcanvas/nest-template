import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
//import * as config from 'config';
import { KakaoDto } from '../dtos/kakao.dto'


/*
 <!--  google-services.json - > "client_type": 3 -->
    <string name="google_client_id">279994251411-si53mshjhtast8b8uvm05m9peieibtkg.apps.googleusercontent.com</string>

    <string name="facebook_app_id">487981566103809</string>

    <string name="naver_client_id">b8FR1rWv1pfLR3GV9q1f</string>
    <string name="naver_client_secret">3IzEowD5I8</string>

    <string name="kakao_app_key">036dd991acf2a13987f35cfac809ba71</string>
    <string name="general_please_wait_again">잠시 후 다시 시도해주세요.</string>
*/

//const kakaoConfig = config.get('kakao')
const kakaoConfig = {
  clientID: '036dd991acf2a13987f35cfac809ba71', 
  callbackURL: 'app.repeach.net/api/kakao/callback'
}

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(private authService: AuthService) {
    super({
      clientID: kakaoConfig.clientID,
      callbackURL: kakaoConfig.callbackURL, 
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: any) {
    const profileJson = profile._json;
    const kakao_account = profileJson.kakao_account;
    const payload: KakaoDto = {
      name: kakao_account.profile.nickname,
      kakaoId: profileJson.id,
      email: 
        kakao_account.has_email && !kakao_account.email_needs_agreement 
          ? kakao_account.email 
          : null,
    }
    // this will create a user in the db and return user details. if user does exist, it will only return the user details.
    const user = this.authService.validateKakaoUser(payload);

    done(null, payload)
  }
}
