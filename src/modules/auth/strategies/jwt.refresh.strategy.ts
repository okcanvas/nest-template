import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Injectable } from '@nestjs/common';
import { UserService } from 'src/modules/user/user.service';
import { JWT_SECRET } from 'src/config/constants';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromHeader("x-okcanvas-token"), 
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (request: any) => {
          //return request?.cookies['Refresh'].split(' ')[1];
          return request?.cookies?.access_token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: JWT_SECRET,
    });
  }

  async validate(payload: any) {
    console.log('<<<',payload);
    const { sub: userId, name: userName, admin: userAdmin } = payload;
    return {
      userId: userId,
      userName: userName,
      userAdmin: userAdmin,
    };
  }
}
