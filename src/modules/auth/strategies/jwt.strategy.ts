import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UserService } from 'src/modules/user/user.service';
import { JWT_SECRET } from 'src/config/constants';


/*
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_SECRET,
    });
  }

  async validate(payload: any) {
    console.log('<<<',payload)
    const { sub: userId } = payload;
    return {
      userId: userId
    };
  }
}
*/



@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({
      //jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      //jwtFromRequest: ExtractJwt.fromHeader('x-okcanvas-token'),
      jwtFromRequest: ExtractJwt.fromExtractors([ExtractJwt.fromHeader("x-okcanvas-token"), ExtractJwt.fromAuthHeaderAsBearerToken()]),
      /*
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          console.log(req)
          return '';
        },
      ]),
      */
      ignoreExpiration: false,
      secretOrKey: JWT_SECRET,
    });
  }

  async validate(payload: any) {
    console.log('<<<',payload)
    const { sub: userId, name: userName, admin: userAdmin } = payload;
    return {
      userId: userId,
      userName: userName,
      userAdmin: userAdmin,
    };
  }
}
