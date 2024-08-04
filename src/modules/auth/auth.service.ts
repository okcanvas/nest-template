import { Injectable, NotFoundException, BadRequestException, HttpException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import md5 from 'md5';
import { parseTime } from '@src/utils/timezone';
import { _Success, _Fail } from '@src/utils/response';
import { MysqlService } from '@src/okcanvas-libs';
import { UserService } from 'src/modules/user/user.service';
import { LoginSnsDto, ProfileDto } from './dtos';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly mysql: MysqlService,
  ) {}

  //===========================================================================
  //  
  //===========================================================================
  async validateUser(email: string, password: string): Promise<any> {
    const users = await this.mysql.query('SELECT * FROM ok_member WHERE email = ?', [email]);
    const user = (users.length > 0) ? users[0] : null;

    console.log(email, password, users)
    if (user) {
      console.log(password, user.password)
      password = md5(password + '' + user.password_salt);
      console.log(password, user.password)
      if (password !== user.password) {
        return _Fail(5000, 'Incorrect password!!');
      } else {
        const { password, ...rest } = user;
        return rest; 
      }
    }
    
    return null;
  }

  //===========================================================================
  //  
  //===========================================================================
  async validateApiKey(apiKey: string) {
    const apiKeys: string[] = [
      '1ab2c3d4e5f61ab2c3d4e5f6'
    ];
    return apiKeys.find((key) => apiKey == key);
  }

  //===========================================================================
  //  
  //===========================================================================
  async validateKakaoUser(payload: any): Promise<any> {
    return null;
  }

  //===========================================================================
  //  
  //===========================================================================
  async login(user: any) {
    const { userId, username, ...rest } = user;
    const payload = { 
      sub: userId,
      username: username
    };
    console.log('================')
    console.log('LOGIN', payload)
    console.log('================')
    return _Success({
      userId: user.userId,
      token: this.jwtService.sign(payload),
    });
  }

  //===========================================================================
  //  
  //===========================================================================
  async logout(userId: number) {
    return _Success({});
  }

  //===========================================================================
  //  
  //===========================================================================
  async info(userId: number) {
    const users = await this.mysql.query('SELECT * FROM ok_member WHERE userId = ?', [userId]);
    if (users.length == 0) {
      return _Fail(401, 'Can not find userinfo !!');
    }
    const userInfo = users[0];
    //
    delete userInfo.password;
    delete userInfo.password_salt;
    delete userInfo.last_login_ip;
    delete userInfo.last_login_date;
    delete userInfo.last_login_time;
    delete userInfo.is_delete;

    const routes = [];
    const roles = await this.mysql.query('SELECT * FROM ok_member_roles WHERE userId = ?', [userInfo.userId]);
    for (const roleItem of roles) {
      routes.push(roleItem.role);
    }
    
    const data = {
      ...userInfo,
      routes: routes
    }

    console.log(data)
    return _Success(data);
  }

  //===========================================================================
  //  
  //===========================================================================
  async profile(userId: number) {
    return await this.userService.getInfo(userId);
  }

  //===========================================================================
  //  
  //===========================================================================
  async update(userId: number, dto: ProfileDto) {
    if (dto.nickname) {
      //const user = await this.mysql.query('SELECT * FROM ok_member WHERE nickname = ?', [dto.nickname]);
      //if (user.length > 0) {
      //  return _Fail(5000, '이미 사용중인 닉네임입니다.');
      //}
    }

    console.log('<<<<<<', dto)
    let payload = {
      ...dto,
      updatedAt: new Date(),
    }

    //  check birthday
    const date = Date.parse(payload.birthday);
    if (isNaN(date)) {
      delete payload.birthday;
    } else {
      payload.birthday = parseTime(date, '{y}-{m}-{d}');
    }
    //  check pushToken
    if (!payload['pushToken'] == null || !payload['pushToken'] == undefined) {
      delete payload.pushToken;
    }

    try {
      const res = await this.mysql.update('ok_member', {userId: userId}, payload);
      if (!res) return _Fail(1003);
  
      const user = await this.mysql.query('SELECT * FROM ok_member WHERE userId = ?', [userId]);
      if (user.length == 0) return _Fail(5001);
      
      return _Success(user[0])
    } catch (e) {
      console.log(e)
    } 
    
    /*
    참고자료
    Error: Can't create more than max_prepared_stmt_count statements (current value: 16382)
    code: 'ER_MAX_PREPARED_STMT_COUNT_REACHED',
    sqlMessage: "Can't create more than max_prepared_stmt_count statements (current value: 16382)"

    const conn = await this.mysql.getConnection();
    try {
      const res = await conn.model('users').where({userId: userId}).update(payload);
      if (!res) return _Fail(1003);
  
      const user = await conn.query('SELECT * FROM ok_member WHERE userId = ?', [userId]);
      if (user.length == 0) return _Fail(5001);
      
      return _Success(user[0])
    } catch (e) {
      console.log(e)
    } finally {
      await conn.release();
    } 
    */
  }




}
