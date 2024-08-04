import { WsAuthSocket } from 'src/common/adapters';

export interface ExtendedSocket extends WsAuthSocket {
  sessionID?: string;
  userId?: string;
}