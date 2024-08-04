import { Inject, Injectable, Logger } from '@nestjs/common';
import console = require('console');
import * as mysql2 from 'mysql2/promise';
import { CONFIG_OPTIONS } from './common.constants';
import { MYSQL_ENCRYPT } from '@src/config/database.mysql';
import { MySqlOptions } from '../interfaces/config.mysql.interface';
import { MysqlBuilder } from './mysql.builder';
import { MysqlWork } from './mysql.work';
import Parser from '../abstract/lib/parser';
import Helper from '../helper';

const DB_LOG = (process.env.DB_LOG == 'true') || (process.env.DB_LOG == 'TRUE') || (process.env.DB_LOG == '1'); 
const DB_TIMEZONE = process.env.DB_TIMEZONE;



@Injectable()
export class MysqlService {
  private logger: Logger;
  private POOL: any;
  private parser: any;
  helper = Helper;

  constructor(@Inject(CONFIG_OPTIONS) private readonly options: MySqlOptions) {
    this.logger = new Logger('SQL');
    this.parser = new Parser();
    this.POOL = mysql2.createPool(options);
    //  pool 에 새로운 커넥션 생성됨
    this.POOL.on('connection', function (conn: any) {
      if (DB_TIMEZONE) {
        conn.query('SET @@session.time_zone = ?', DB_TIMEZONE);
      }
      async function ping() {
        console.log('ping', conn.threadId)
      }
      console.log('MySQL Connection %d succeed', conn.threadId, new Date());
    });
    //  커넥션 사용을 마치고 pool 로 반환했을 때 발생
    this.POOL.on('release', function (conn: any) {
      //console.log('Connection %d released', conn.threadId, new Date());
    });
    //  유효한 커넥션을 얻기위해 queue 에서 대기하게 되었을 때 발생
    this.POOL.on('enqueue', function () {
      //console.log('Waiting for available connection slot', new Date());
    });
    //  pool 로 부터 커넥션을 획득
    this.POOL.on('acquire', function (conn: any) {
      //console.log('Connection %d acquired', conn.threadId, new Date());
    });

    //
    this.keepAlive();
  }

  private keepAlive() {
    const _self = this;
    async function ping() {
      //const conn = await _self.POOL.getConnection((conn: any) => conn);
      //conn.ping();
      //conn.release();
      //_self.POOL.query('SELECT 1');
      //console.log('ping')
    }
    //setInterval(ping, 60*1000);
    //setInterval(ping, 3*1000);
  }

  //===========================================================================
  //
  //===========================================================================
  model(modelName?: string): MysqlWork {
    return new MysqlWork({
      logSql: DB_LOG,
      logger: this.logger,
      conn: null,
      parent: this,
      modelName: modelName,
    });
  }

  //===========================================================================
  //
  //===========================================================================
  builder(): MysqlBuilder {
    return new MysqlBuilder(this);
  }

  //===========================================================================
  //
  //===========================================================================
  async getConnection(option = {}): Promise<MysqlWork> {
    const conn = await this.POOL.getConnection((conn: any) => conn);
    return new MysqlWork({
      logSql: (option['noLog'] == true) ? false : DB_LOG == true,
      logger: this.logger,
      conn: conn
    });
  }

  //===========================================================================
  //
  //===========================================================================
  async query(sql: any, value?: any, option = {}) {
    const stime = new Date().getTime();
    //const conn = await this.POOL.getConnection((conn: any) => conn);
    try {
      //const [result] = await conn.query(sql, value);
      const [result] = await this.POOL.query(sql, value);

      // decrypt
      //const encrypt = MYSQL_ENCRYPT;
      //if (Helper.isArray(result)) {
      //  for(let i=0; i<result.length; i++) {
      //    for (const key in result[i]) {
      //      if (encrypt.fields.includes(key)) {
      //        result[i][key] = Helper.decrypt(result[i][key], encrypt.key);
      //      }
      //    }
      //  };
      //}

      return result;
    } catch (e) {
      throw e;
    } finally {
      //conn.release();
      if (DB_LOG && !option['noLog']) {
        const etime = new Date().getTime();
        if (Helper.isObject(value)) {
          this.logger.log(`${sql} [${JSON.stringify(value)}] Time: ${etime-stime}ms`);
        } else if (!Helper.isEmpty(value)) {
          this.logger.log(`${sql} [${value}] Time: ${etime-stime}ms`);
        } else {
          this.logger.log(`${sql}  Time: ${etime-stime}ms`);
        }
      }
    }
  }

  //===========================================================================
  //
  //===========================================================================
  async execute(sql: any, value?: any, option = {}) {
    const stime = new Date().getTime();
    const conn = await this.POOL.getConnection((conn: any) => conn);
    try {
      const result = await conn.execute(sql, value);
      return result[0];
    } catch (e) {
      throw e;
    } finally {
      conn.release();
      if (DB_LOG && !option['noLog']) {
        const etime = new Date().getTime();
        if (Helper.isObject(value)) {
          this.logger.log(`${sql} [${JSON.stringify(value)}] Time: ${etime-stime}ms`);
        } else if (!Helper.isEmpty(value)) {
          this.logger.log(`${sql} [${value}] Time: ${etime-stime}ms`);
        } else {
          this.logger.log(`${sql}  Time: ${etime-stime}ms`);
        }
      }
    }
  }

  //===========================================================================
  //
  //===========================================================================
  async addlock(table: string, data: any, options = {}, noLog = false) {
    const conn = await this.getConnection();
    try {
      try {
        conn.query(`LOCK TABLES ${table} WRITE`);
        return await conn.model(table).add(data);
      } finally {  
        conn.query('UNLOCK TABLES');
      }
    } catch (e) {
      console.log(e)
      throw e;
    } finally {
      await conn.release();
    }
  }

  //===========================================================================
  //
  //===========================================================================
  async addMany(table: string, data: any[], options = {}) {
    options = {
      ...options,
      table: table
    }
    const encrypt = MYSQL_ENCRYPT;
    const parser = this.parser;

    let fields = Object.keys(data[0]);
    const values = data.map(item => {
      const value = [];
      fields.forEach(key => {
        //let val = encrypt.fields.includes(key) ? Helper.encrypt(item[key], encrypt.key) : item[key];
        //val = parser.parseValue(val);
        let val = parser.parseValue(item[key]);
        if (Helper.isString(val) || Helper.isBoolean(val) || Helper.isNumber(val)) {
          value.push(val);
        }
      });
      return `(${value.join(',')})`;
    }).join(',');

    fields = fields.map(field => parser.parseKey(field));

    // compatiable with boolean and array update property value
    if (options['update'] === true) {
      options['update'] = fields;
    } else if (Helper.isArray(options['update'])) {
      options['update'] = options['update'].filter((field: any) =>
        fields.indexOf(field) > -1
      );
    } else {
      for (const key in options['update']) {
        if (fields.indexOf(key) > -1) {
          continue;
        }
        delete options['update'][key];
      }
    }

    options['fields'] = fields.join(',');
    options['values'] = values;
    const sql = this.parser.buildInsertSql(options);
    
    return await this.query(sql).then((res) => {
      return data.map((item, index) => {
        return res.insertId ? res.insertId + index : 0;
      });
    });
  }


  //===========================================================================
  //
  //===========================================================================
  async add(table: string, data: any, options = {}, noLog = false) {
    options = {
      ...options,
      table: table
    }

    //
    const encrypt = MYSQL_ENCRYPT;
    const values = [];
    const fields = [];
    const parser = this.parser;
    for (const key in data) {
      //let val = encrypt.fields.includes(key) ? Helper.encrypt(data[key], encrypt.key) : data[key];
      //val = parser.parseValue(val);
      let val = parser.parseValue(data[key]);
      if (Helper.isString(val) || Helper.isBoolean(val) || Helper.isNumber(val)) {
        values.push(val);
        fields.push(parser.parseKey(key));
      }
    }

    // compatiable with boolean and array update property value
    if (options['update'] === true) {
      options['update'] = fields;
    } else if (Helper.isArray(options['update'])) {
      options['update'] = options['update'].filter((field: any) =>
        fields.indexOf(field) > -1
      );
    } else {
      for (const key in options['update']) {
        if (fields.indexOf(key) > -1) {
          continue;
        }
        delete options['update'][key];
      }
    }

    options['fields'] = fields.join(',');
    options['values'] = values.join(',');

    const sql = this.parser.buildInsertSql(options);
    const res = await this.query(sql, null, { noLog: noLog });
    return res?.insertId;
  }

  //===========================================================================
  //
  //===========================================================================
  async update(table: string, options = {}, data: any, noLog = false) {
    const options2 = {
      table: table,
      where: options,
    }

    //const encrypt = MYSQL_ENCRYPT;
    //for (const key in data) {
    //  let val = encrypt.fields.includes(key) ? Helper.encrypt(data[key], encrypt.key) : data[key];
    //  data[key] = val;
    //}

    const sql = this.parser.buildUpdateSql(data, options2);
    const res = await this.query(sql, null, { noLog: noLog });
    return res?.affectedRows;
  }

  //===========================================================================
  //
  //===========================================================================
  async delete(table: string, options = {}, noLog = false) {
    const options2 = {
      table: table,
      where: options,
    }
    const sql = this.parser.buildDeleteSql(options2);
    const res = await this.query(sql, null, { noLog: noLog });
    return res?.affectedRows;
  }
  
  //===========================================================================
  //
  //===========================================================================
  async select(table: string, options = {}, noLog = false) {
    const options2 = {
      table: table,
      where: options,
    }
    const sql = this.parser.buildSelectSql(options2);
    return await this.query(sql, null, { noLog: noLog });
  }

}
