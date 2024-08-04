import { Inject, Injectable } from '@nestjs/common';
import { gatewayUserDTO } from './dto';
//import { Socket } from 'socket.io';
import { ExtendedSocket } from './interfaces';
import { MysqlService } from '@src/okcanvas-libs';
import { v4 as uuidv4 } from 'uuid';



export const USER_TYPE_NONE = 0;
export const USER_TYPE_IOT  = 1;
export const USER_TYPE_USER = 2;



@Injectable()
export class GatewayService {
  private userList: Record<string, gatewayUserDTO>;
  constructor(
    private readonly mysql: MysqlService,
  ) {
    this.userList = {};
  }

  createUser(client: ExtendedSocket) {
    const sessionID = `user:${uuidv4()}`;
    const payload ={
      event: 'connected',
      data: {
        sessionID: sessionID,
        message: 'welcome...'  
      }
    }
    client.sessionID = sessionID;
    client.send(JSON.stringify(payload)); 
    //
    this.userList[client.sessionID] = {
      socket: client,
      userId: 0,
      userType: USER_TYPE_NONE,
    };
  }

  setUserType(sessionID: string, userType: number = USER_TYPE_NONE) {
    const user = this.userList[sessionID];
    if (user) {
      user.userType = userType; 
    }
  }

  getUser(sessionID: string): gatewayUserDTO {
    return this.userList[sessionID];
  }

  getUserList(): Record<string, gatewayUserDTO> {
    return this.userList;
  }

  deleteUser(client: ExtendedSocket) {
    delete this.userList[client.sessionID];
  }

  broadcast(client: ExtendedSocket, data: any) {
    Object.keys(this.userList).forEach((sessionID) => {
      const user = this.userList[sessionID];
      user.socket.send(JSON.stringify(data)); 
    });
    /*
    const payload ={
      event: 'broadcast',
      data: data
    }
    Object.keys(this.userList).forEach((sessionID) => {
      const user = this.userList[sessionID];
      //if (user && user.userType == USER_TYPE_IOT) {
        //console.log('SEND <<<', user.socket.sessionID, data)
        user.socket.send(JSON.stringify(payload)); 
      //}
    })
    */
  }

  //
  async notification(user_id: number = 0) {
    //const data = await this.mysql.query('SELECT * FROM `cellbio_approval_recv` WHERE `is_delete` = 0 AND `is_status` = 0 AND `user_id` = ?', [user_id], {noLog: true})
    //return data;
    return [];
  }
  
}