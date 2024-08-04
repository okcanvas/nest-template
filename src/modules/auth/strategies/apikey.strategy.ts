import { HeaderAPIKeyStrategy } from 'passport-headerapikey';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';

const API_KEY_NAME = process.env.API_KEY_NAME || 'X-API-KEY';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(HeaderAPIKeyStrategy, 'api-key') {
  constructor(private authService: AuthService, private configService: ConfigService) {

    super({ header: API_KEY_NAME, prefix: '' },
    true,
    async (apiKey: string, done: any) => {
      if (await this.authService.validateApiKey(apiKey)) {
        done(null, true);
      }
      done(true, null);
    });
  }

}
