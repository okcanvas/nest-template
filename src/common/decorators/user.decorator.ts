import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    //console.log('====================', user)
    //console.log('====================', data ? request.headers[data] : request.headers )

    return data ? user && user[data] : user;
  },
);
