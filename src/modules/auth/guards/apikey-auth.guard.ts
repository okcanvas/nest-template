import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

const API_KEY_NAME = process.env.API_KEY_NAME || 'X-API-KEY';

@Injectable()
export class ApiKeyAuthGuard extends AuthGuard('api-key') {
  handleRequest(err: any, company: any, info: any) {
    if (err || !company) {
      throw err || new UnauthorizedException(`invalid ${API_KEY_NAME}`);
    }
    return company;
  }
}