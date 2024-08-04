import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsGuard implements CanActivate {

    constructor(
      //private userService: UserService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {

      try {
          const client: Socket = context.switchToWs().getClient<Socket>();
          const authToken: any = client.handshake?.query?.token;
          console.log(authToken)

          return false
          /*
          const authToken: string = client.handshake?.query?.token;
          const user: User = await this.authService.verifyUser(authToken);
          client.join(`house_${user?.house?.id}`);
          context.switchToHttp().getRequest().user = user
  
          return Boolean(user);
          */
      } catch (err) {
          throw new WsException(err.message);
      }
  }
}