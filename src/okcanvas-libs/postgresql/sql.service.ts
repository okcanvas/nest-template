import { Inject, Injectable, Logger } from '@nestjs/common';
import console = require('console');
import * as postgresSQL from 'pg';
import { CONFIG_OPTIONS } from './common.constants';
//import { MYSQL_ENCRYPT } from '@/config/databases/mysql-config';
import { PostgresSqlOptions } from '../interfaces/config.postgresql.interface';
import { SqlBuilder } from './sql.builder';
import { SqlWorker } from './sql.worker';
import PostgreSQLParser from './sql.parser';
import Helper from '../helper';

const DB_LOG = (process.env.DB_LOG == 'true') || (process.env.DB_LOG == 'TRUE') || (process.env.DB_LOG == '1'); 
const DB_TIMEZONE = process.env.DB_TIMEZONE;
const NS_PER_SEC = 1e9;
const MS_PER_NS = 1e6;

/*
  host: '211.45.167.54',
  port: 3306,
  user: 'root',
  password: 'cellbio0707!',
  database: 'cellbioVINA',
  timezone: '+07:00',
  waitForConnections: true,
  queueLimit: 0,
  connectTimeout: 5000,
  connectionLimit: 10,
  typeCast: [Function: typeCast]
*/

@Injectable()
export class PostgresSqlService {
  private logger: Logger;
  private POOL: any;
  private parser: any;
  helper = Helper;

  constructor(@Inject(CONFIG_OPTIONS) private readonly options: PostgresSqlOptions) {
    this.logger = new Logger('SQL');
    this.parser = new PostgreSQLParser();

    //postgresSQL.pool

    const pgConfig: postgresSQL.ClientConfig = {
      user: options.user,
      host: options.host,
      database: options.database,
      password: options.password,
      port: options.port,
      max: options.max,
      idleTimeoutMillis: options.idleTimeoutMillis,
      connectionTimeoutMillis: options.connectionTimeoutMillis,
    };
  
    this.POOL = new postgresSQL.Pool(pgConfig);
    
    // 커넥션이 생성될 때
    this.POOL.on('connect', (client: postgresSQL.Client) => {
      console.log(`PostgreSQL Connection ${client.processID} succeed ${options.host}:${options.port} ${options.database}`);
    });
  
    // 커넥션이 해제될 때
    this.POOL.on('disconnect', (client) => {
      console.log(`Connection ${client.processID} released`, new Date());
    });
  
    // 커넥션 획득 시
    this.POOL.on('acquire', (client) => {
      //console.log(`Connection ${client.processID} acquired`, new Date());
    });
  
    // 대기열에 커넥션이 있을 때
    this.POOL.on('waiting', () => {
      //console.log('Waiting for available connection slot', new Date());
    });



    /*

    this.POOL = mysql2.createPool(options);
    //  pool 에 새로운 커넥션 생성됨
    this.POOL.on('connection', function (conn: any) {
      if (DB_TIMEZONE) {
        conn.query('SET @@session.time_zone = ?', DB_TIMEZONE);
      }
      //  PING
      setInterval(async function() {
        conn.ping();
        //console.log('ping', conn.threadId, new Date());
      }, 60*1000);
      console.log('DB Connection %d succeed %s:%d %s %s', conn.threadId, options.host, options.port, options.database, options.timezone);
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
    */
  }

  //===========================================================================
  //
  //===========================================================================
  model(modelName?: string): SqlWorker {
    return new SqlWorker({
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
  builder(): SqlBuilder {
    return new SqlBuilder(this);
  }

  //===========================================================================
  //
  //===========================================================================
  async getConnection(option = {}): Promise<SqlWorker> {
    const conn: postgresSQL.PoolClient = await this.POOL.connect();
    return new SqlWorker({
      logSql: (option['noLog'] == true) ? false : DB_LOG == true,
      logger: this.logger,
      helper: this.helper,
      conn: conn,
    });
  }

  //===========================================================================
  //
  //===========================================================================
  async query(sql: any, value?: any, option = {}) {
    const stime = process.hrtime();
    try {
      const result = await this.POOL.query(sql, value);
      return result.rows;
    } catch (e) {
      throw e;
    } finally {
      if (DB_LOG && !option['noLog']) {
        const etime = process.hrtime(stime);
        const elapsedTimeInNS = etime[0] * NS_PER_SEC + etime[1];
        const elapsedTimeInMS = elapsedTimeInNS / MS_PER_NS;
        if (Helper.isObject(value)) {
          this.logger.log(`${sql} [${JSON.stringify(value)}] Time: ${elapsedTimeInMS}ms`);
        } else if (!Helper.isEmpty(value)) {
          this.logger.log(`${sql} [${value}] Time: ${elapsedTimeInMS}ms`);
        } else {
          this.logger.log(`${sql}  Time: ${elapsedTimeInMS}ms`);
        }
      }
    }
  }

  //===========================================================================
  //
  //===========================================================================
  async execute(sql: any, value?: any, option = {}) {
    const stime = process.hrtime();
    try {
      const result = await this.POOL.execute(sql, value);
      return result.rows;
    } catch (e) {
      throw e;
    } finally {
      //conn.release();
      if (DB_LOG && !option['noLog']) {
        const etime = process.hrtime(stime);
        const elapsedTimeInNS = etime[0] * NS_PER_SEC + etime[1];
        const elapsedTimeInMS = elapsedTimeInNS / MS_PER_NS;
        if (Helper.isObject(value)) {
          this.logger.log(`${sql} [${JSON.stringify(value)}] Time: ${elapsedTimeInMS}ms`);
        } else if (!Helper.isEmpty(value)) {
          this.logger.log(`${sql} [${value}] Time: ${elapsedTimeInMS}ms`);
        } else {
          this.logger.log(`${sql}  Time: ${elapsedTimeInMS}ms`);
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
    //const encrypt = MYSQL_ENCRYPT;
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
    //const encrypt = MYSQL_ENCRYPT;
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
    return res;
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
    return res;
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

  //===========================================================================
  //  PARSE UTILS
  //===========================================================================
  parseWhere(options: any = null) {
    const parser = this.parser;
    let sql: any;
    if (Helper.isObject(options)) {
      sql = options.sql ? options.sql : parser.parseWhere(options);
    } else {
      sql = options;
    }
    return sql;
  }
}
