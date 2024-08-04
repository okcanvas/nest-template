import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { parseTime } from '@src/utils/timezone';
import { _Success, _Fail, helper } from '@src/utils/response';
import { isEmail, isEmpty } from 'class-validator';
import { MysqlService } from '@src/okcanvas-libs';
import { StudySummaryDto } from './dtos';

export interface UserFindOne {
  id?: number;
  email?: string;
}

@Injectable()
export class UserService {
  constructor(
    private readonly mysql: MysqlService,
  ) {}

  async findByUserName(username: string) {
    const res = await this.mysql.query('SELECT * FROM ok_member WHERE accountState = ? AND email = ?', ['normal', username]);
    return (res.length > 0) ? res[0] : null;
  }


  async findBySnsId(snsId: string) {
    const res = await this.mysql.query('SELECT * FROM ok_member WHERE accountState = ? AND snsId = ?', ['normal', snsId]);
    return (res.length > 0) ? res[0] : null;
  }

  async findByEmail(email: string) {
    const res = await this.mysql.query('SELECT * FROM ok_member WHERE accountState = ? AND email = ?', ['normal', email]);
    return (res.length > 0) ? res[0] : null;
  }

  async getAll() {
    const res = await this.mysql.query('SELECT * FROM ok_member WHERE accountState = ? ', ['normal']);
    console.log(res)
    return _Success(res);
  }

  //===========================================================================
  //  등록 유뮤
  //===========================================================================
  async getFind(snsId: any) {
    const res = await this.mysql.query('SELECT * FROM ok_member WHERE accountState = ? AND snsId = ?', ['normal', snsId]);
    if (res.length == 0) {
      return _Fail(5001)
    }

    var userInfo = res[0];
    return _Success({
      userId: userInfo.userId,
      nickname: userInfo.nickname,
    });
  }



  //===========================================================================
  //  사용자 조회
  //===========================================================================
  async getById(userId: number) {
    const res = await this.mysql.query('SELECT * FROM ok_member WHERE accountState = ? AND userId = ?', ['normal', userId]);
    if (res.length == 0) {
      return _Fail(5001)
    }

    var userInfo = res[0];
    delete userInfo.password;
    return _Success({
      userInfo
    });
  }

  //===========================================================================
  //  사용자 상세정보
  //===========================================================================
  async getInfo(userId: number) {
    const user = await this.mysql.query('SELECT * FROM ok_member WHERE userId = ?', [userId]);
    if (user.length == 0) return _Fail(5001)

    delete user[0].password;
    return _Success(user[0]);


  }

  //===========================================================================
  //  
  //===========================================================================
  async updateUserInfo(userId: number, dto: any) {
    if (dto.nickname) {
      //const user = await this.mysql.query('SELECT * FROM ok_member WHERE nickname = ?', [dto.nickname]);
      //if (user.length > 0) {
      //  return _Fail(5000, '이미 사용중인 닉네임입니다.');
      //}
    }

    console.log('<<<<<<', dto)
    delete dto.userId;

    try {
      const res = await this.mysql.update('ok_member', {userId: userId}, dto);
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
