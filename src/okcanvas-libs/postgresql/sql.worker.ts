import { Logger } from '@nestjs/common';
import * as util from 'util';
import { PostgresSqlService } from './sql.service';
import { SqlBuilder } from './sql.builder';
import PostgreSQLParser from './sql.parser';
import Helper from '../helper';

const QUOTE_FIELD = Symbol('orm-model-quote-field');
const NS_PER_SEC = 1e9;
const MS_PER_NS = 1e6;

export class SqlWorker {
  parent: PostgresSqlService;
  conn: any;
  logger: Logger;
  logSql: boolean;
  tablePrefix: string;
  tableName: string;
  pk: string;
  options: object;
  parser: any;
  helper: any;
  sqlList: string[];
  
  constructor(config: any) {
    this.parent = config.parent;
    this.conn = config.conn;
    this.logger = config.logger;
    this.logSql = config.logSql;
    this.helper = config.helper;
    this.tablePrefix = '';
    this.tableName = config.modelName ? config.modelName : '';
    this.pk = '';
    this.options = {};
    this.parser = new PostgreSQLParser();
    this.sqlList = [];
  }

  builder(): SqlBuilder {
    return new SqlBuilder(this);
  }

  model(modelName: string): SqlWorker {
    this.tableName = modelName;
    this.pk = '';
    this.options = {};
    return this;
  }

  async add(data: any, option: any = {}) {
    if (Helper.isEmpty(data)) return Promise.reject(new Error('add data is empty'));
    //const res = await this.query(`INSERT INTO ${this.tableName} SET ?`, data);
    //return res.insertId;

    let options = {
      ...option,
      table: this.tableName,
    };
    //
    const values = [];
    const fields = [];
    const parser = this.parser;
    for (const key in data) {
      const val = parser.parseValue(data[key]);
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
    const res = await this.query(sql, null);
    return res;
  }

  //===========================================================================
  //
  //===========================================================================
  async addMany(data: any[]) {
    let options = this.parseOptions(this.options);
    const parser = this.parser;

    let fields = Object.keys(data[0]);
    const values = data.map(item => {
      const value = [];
      fields.forEach(key => {
        const val = parser.parseValue(item[key]);
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
    const sql = parser.buildInsertSql(options);
    
    return await this.query(sql).then((res) => {
      return data.map((item, index) => {
        return res.insertId ? res.insertId + index : 0;
      });
    });
  }  


  async addlock(data: any) {
    try {
      try {
        this.query(`LOCK TABLES ${this.tableName} WRITE`);
        return await this.add(data);
      } finally {  
        this.query('UNLOCK TABLES');
      }
    } catch (e) {
      throw e;
    }
  }

  async update(data: any = {}) {
    let options = this.parseOptions(this.options);
    let parsedData = data ? data : {};
    // check where condition
    if (Helper.isEmpty(options['where'])) {
      if (parsedData[this.pk]) {
        options['where'] = { [this.pk]: parsedData[this.pk] };
        delete parsedData[this.pk];
      } else {
        return Promise.reject(new Error('miss where condition on update'));
      }
    }
    // check data is empty
    if (Helper.isEmpty(parsedData)) {
      return null;
      return Promise.reject(new Error(`update data is empty, original data is ${JSON.stringify(data)}`));
    }

    const parser = this.parser;
    const sql = parser.buildUpdateSql(data, options);
    const result = await this.query(sql);
    console.log(result)
    return result.affectedRows || 0;
  }

  async find(options: any = null) {
    this.options['limit'] = 1;
    const data = await this.select(options);
    return data[0] || null;
  }

  async select(options: any = null) {
    options = options ? this.parseOptions(options) : this.parseOptions(this.options);
    const parser = this.parser;
    let sql: any;
    if (Helper.isObject(options)) {
      sql = options.sql ? options.sql : parser.buildSelectSql(options);
    } else {
      sql = options;
    }
    return await this.query(sql);
  }

  selectSql(options: any = null) {
    options = options ? this.parseOptions(options) : this.parseOptions(this.options);
    const parser = this.parser;
    let sql: any;
    if (Helper.isObject(options)) {
      sql = options.sql ? options.sql : parser.buildSelectSql(options);
    } else {
      sql = options;
    }
    return sql;
  }

  async delete(options: any = null) {
    options = options ? this.parseOptions(options) : this.parseOptions(this.options);
    const parser = this.parser;
    let sql: any;
    if (Helper.isObject(options)) {
      sql = options.sql ? options.sql : parser.buildDeleteSql(options);
    } else {
      sql = options;
    }
    
    return await this.query(sql);
  }

  async getField(field: any, one?: any) {
    const options = this.parseOptions({ field });
    if (Helper.isNumber(one)) {
      options.limit = one;
    } else if (one === true) {
      options.limit = 1;
    }
    const data = await this.select(options);

    const result = {};
    for (const item of data) {
      for (const field in item) {
        if (Array.isArray(result[field])) {
          result[field].push(item[field]);
        } else {
          result[field] = one === true ? item[field] : [item[field]];
        }
      }
    }
    const fields = Object.keys(result);
    // result is empty
    if (fields.length === 0) {
      const multi = field.indexOf(',') > -1 && field.indexOf('(') === -1;
      if (multi) {
        field.split(/\s*,\s*/).forEach(function (item: any) {
          result[item] = one === true ? undefined : [];
        });
        return result;
      } else {
        return one === true ? undefined : [];
      }
    }
    if (fields.length === 1) {
      return result[fields[0]];
    }
    return result;
  }

  async query(sql: any, value?: any) {
    const stime = process.hrtime();
    try {
      if (this.conn) {
        const result = await this.conn.query(sql, value);
        return result.rows;
      } else {
        return await this.parent.query(sql, value);
      }
    } catch (e) {
      throw e;
    } finally {
      if (this.logSql == true && this.conn) {
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

  async execute(sql: any, value?: any) {
    const stime = process.hrtime();
    try {
      if (this.conn) {
        const result = await this.conn.execute(sql, value);
        return result.rows;
      } else {
        return await this.parent.execute(sql, value);
      }
    } catch (e) {
      throw e;
    } finally {
      if (this.logSql) {
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

  async transaction(): Promise<any> {
    if (this.logSql) this.logger.log('TRANSACTION');
    return await this.conn.query('BEGIN');
  }

  async commit(): Promise<any> {
    if (this.logSql) this.logger.log('COMMIT');
    return await this.conn.query('COMMIT');
  }

  async rollback(): Promise<any> {
    if (this.logSql) this.logger.log('ROLLBACK');
    return await this.conn.query('ROLLBACK');
  }

  async release(): Promise<any> {
    if (this.logSql) this.logger.log('RELEASE');
    try {
      this.conn.release();
    } catch (error) {
      //
    }
  }

  getOptions() {
    return this.parseOptions(this.options);
  }

  key(key: any) {
    this.pk = key;
    return this;
  }

  limit(offset: any, length: any) {
    if (offset === undefined) {
      return this;
    }
    if (Helper.isArray(offset)) {
      length = offset[1] || length;
      offset = offset[0];
    }
    offset = Math.max(parseInt(offset) || 0, 0);
    if (length) {
      length = Math.max(parseInt(length) || 0, 0);
    }
    this.options['limit'] = [offset, length];
    return this;
  }

  page(page: any, listRows: any = 20) {
    if (Helper.isArray(page)) {
      listRows = page[1] || listRows;
      page = page[0];
    }
    page = Math.max(parseInt(page) || 1, 1);
    listRows = Math.max(parseInt(listRows) || 10, 1);
    this.options['limit'] = [listRows * (page - 1), listRows];
    return this;
  }

  where(where: any) {
    if (!where) return this;
    if (Helper.isString(where)) {
      where = { _string: where };
    }
    const options = this.options;
    if (options['where'] && Helper.isString(options['where'])) {
      options['where'] = { _string: options['where'] };
    }
    options['where'] = Helper.extend({}, options['where'], where);
    return this;
  }

  field(field: any, reverse = false) {
    if (!field) return this;
    this.options['field'] = field;
    this.options['fieldReverse'] = reverse;
    return this;
  }

  fieldReverse(field: any) {
    return this.field(field, true);
  }

  union(union: any, all = false) {
    if (!union) return this;
    if (!this.options['union']) {
      this.options['union'] = [];
    }
    this.options['union'].push({
      union: union,
      all: all
    });
    return this;
  }

  join(join: any) {
    if (!join) return this;
    if (!this.options['join']) {
      this.options['join'] = [];
    }
    if (Helper.isArray(join)) {
      this.options['join'] = this.options['join'].concat(join);
    } else {
      this.options['join'].push(join);
    }
    return this;
  }

  order(value: any) {
    this.options['order'] = value;
    return this;
  }

  alias(value: any) {
    this.options['alias'] = value;
    return this;
  }

  having(value: any) {
    this.options['having'] = value;
    return this;
  }

  group(value: any) {
    this.options['group'] = value;
    return this;
  }

  lock(value: any) {
    this.options['lock'] = value;
    return this;
  }

  auto(value: any) {
    this.options['auto'] = value;
    return this;
  }
  
  distinct(data: any) {
    this.options['distinct'] = data;
    if (Helper.isString(data)) {
      this.options['field'] = data;
    }
    return this;
  }

  explain(explain: any) {
    this.options['explain'] = explain;
    return this;
  }

  
  parseOptions(options: any) {
    if (Helper.isNumber(options) || Helper.isString(options)) {
      options += '';
      const where = {
        [this.pk]: options.indexOf(',') > -1 ? { IN: options } : options
      };
      options = { where };
    }
    options = Helper.extend({}, this.options, options);
    this.options = {};
    options.table = options.table || this['tableName'];
    options.tablePrefix = this.tablePrefix;
    options.pk = this.pk; // add primary key for options
    if (options.field && options.fieldReverse) {
      delete options.fieldReverse;
    }
    return options;
  }
  
  count(field: any) {
    //field = this[QUOTE_FIELD](field);
    return this.getField(`COUNT(${field}) AS orm_count`, true);
  }

  sum(field: any) {
    //field = this[QUOTE_FIELD](field);
    return this.getField(`SUM(${field}) AS orm_sum`, true);
  }

  min(field: any) {
    //field = this[QUOTE_FIELD](field);
    return this.getField(`MIN(${field}) AS orm_min`, true);
  }

  max(field: any) {
    //field = this[QUOTE_FIELD](field);
    return this.getField(`MAX(${field}) AS orm_max`, true);
  }

  avg(field: any) {
    //field = this[QUOTE_FIELD](field);
    return this.getField(`AVG(${field}) AS orm_avg`, true);
  }

  parseSql(sqlOptions: any, ...args: any) {
    if (Helper.isString(sqlOptions)) {
      sqlOptions = { sql: sqlOptions };
    }
    if (args.length) {
      sqlOptions.sql = util.format(sqlOptions.sql, ...args);
    }
    // replace table name
    sqlOptions.sql = sqlOptions.sql.replace(/(?:^|\s)__([A-Z]+)__(?:$|\s)/g, (a: any, b: any) => {
      if (b === 'TABLE') {
        return ` ${this[QUOTE_FIELD](this.tableName)} `;
      }
      return ` ${this[QUOTE_FIELD](this.tablePrefix + b.toLowerCase())} `;
    });
    return sqlOptions;
  }

  
}

