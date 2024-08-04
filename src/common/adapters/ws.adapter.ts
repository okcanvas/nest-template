import { WsAdapter } from '@nestjs/platform-ws';
import { verify } from 'jsonwebtoken';
import { ServerOptions } from 'socket.io';
import { Socket } from 'socket.io';
import URL from 'url';

export interface WsAuthSocket extends Socket {
  userInfo?: any;
  corpCode?: string;
}


export class WsAuthAdapter extends WsAdapter {
  create(port: number, options?: any): any {
    const server = super.create(port, { ...options, cors: true });

    server.on('connection', (socket: WsAuthSocket, req: Request) => {
      let urlInfo = URL.parse(req.url, true);
      const token =  urlInfo.query.token;
      console.log(token)

      if (token) {
        socket.userInfo = { userId: 1000, name: '1234' };
        //socket.disconnect(true);

        /*
        verify(socket.handshake.query.token as string, process.env.JWT_SECRET, (err: any, decoded: any) => {
          if (err) {
            socket.disconnect(true);
          } else {
            // 클라이언트 정보를 소켓의 custom 속성에 저장
            socket.userInfo = { userId: 1000, name: '1234' };
          }
        });
        */
      } else {
        socket.disconnect(true);
      }
    });

    return server;
  }
}