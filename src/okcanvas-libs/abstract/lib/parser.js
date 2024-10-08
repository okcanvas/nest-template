const helper = require('../../helper');
const querystring = require('querystring');
const { COMPARISON, COMPARISON_LIST } = require('./comparison.js');

/**
 * get comparison
 * @param {String} comparison
 */
const getComparison = comparison => {
  let comparisonUpper = comparison.toUpperCase();
  comparisonUpper = COMPARISON[comparisonUpper] || comparisonUpper;
  if (COMPARISON_LIST.indexOf(comparisonUpper) > -1) return comparisonUpper;
  throw new Error(`${comparison} is not valid`);
};

module.exports = class AbstractParser {
  /**
   * constructor
   * @return {} []
   */
  constructor(config = {}) {
    this.config = config;
  }
  /**
   * parse explain
   * @param {Boolean} explain
   */
  parseExplain(explain) {
    if (!explain) return '';
    return 'EXPLAIN ';
  }
  /**
   * parse set
   * @param  {Object} data []
   * @return {String}      []
   */
  parseSet(data = {}) {
    const set = [];
    for (const key in data) {
      const value = this.parseValue(data[key]);
      if (helper.isString(value) || helper.isNumber(value)) {
        set.push(this.parseKey(key) + '=' + value);
      }
    }
    if (set.length) {
      return ' SET ' + set.join(',');
    }
    return '';
  }
  /**
   * parse field
   * parseField('name');
   * parseField('name,email');
   * parseField([]);
   * parseField(['xx_name','xx_email']);
   * parseField({});
   * parseField({
   *     xx_name: 'name',
   *     xx_email: 'email'
   * })
   * @return {String} []
   */
  parseField(fields, options = {}) {
    if (helper.isString(fields)) {
      // fields('id, instr('30,35,31,',id+',') as d')
      if (fields.indexOf('(') > -1 && fields.indexOf(')') > -1) {
        return fields;
      }
      if (fields.indexOf(',') > -1) {
        fields = fields.split(/\s*,\s*/);
      }
    }
    const alias = options.alias;
    if (helper.isArray(fields) && !helper.isEmpty(fields)) {
      return fields.map(item => {
        item = this.parseKey(item);
        if (alias && item.indexOf('.') === -1) return `${this.parseKey(alias)}.${item}`;
        return item;
      }).join(',');
    } else if (helper.isObject(fields) && !helper.isEmpty(fields)) {
      const data = [];
      for (const key in fields) {
        data.push(this.parseKey(key) + ' AS ' + this.parseKey(fields[key]));
      }
      return data.join(',');
    } else if (helper.isString(fields) && fields) {
      fields = this.parseKey(fields);
      if (alias && fields.indexOf('.') === -1) return `${this.parseKey(alias)}.${fields}`;
      return fields;
    }
    return '*';
  }
  /**
   * parse table
   * @param  {Mixed} tables []
   * @return {}        []
   */
  parseTable(table, options = {}) {
    if (helper.isString(table)) {
      if (options.alias) {
        return `${this.parseKey(table)} AS ${options.alias}`;
      }
      table = table.split(/\s*,\s*/);
    }
    if (helper.isArray(table)) {
      return table.map(item => this.parseKey(item)).join(',');
    } else if (helper.isObject(table)) {
      const data = [];
      for (const key in table) {
        data.push(this.parseKey(key) + ' AS ' + this.parseKey(table[key]));
      }
      return data.join(',');
    }
    return '';
  }
  /**
   * get logic
   * @param  {String} logic    []
   * @param  {String} _default []
   * @return {String}          []
   */
  getLogic(logic, _default = 'AND') {
    const list = ['AND', 'OR', 'XOR'];
    if (helper.isObject(logic)) {
      const _logic = logic._logic;
      delete logic._logic;
      logic = _logic;
    }
    if (!logic || !helper.isString(logic)) {
      return _default;
    }
    logic = logic.toUpperCase();
    if (list.indexOf(logic) > -1) {
      return logic;
    }
    return _default;
  }
  /**
   * parse where
   * @param  {Mixed} where []
   * @return {String}       []
   */
  parseWhere(where) {
    if (helper.isEmpty(where)) {
      return '';
    } else if (helper.isString(where)) {
      return ` WHERE ${where}`;
    }
    const logic = this.getLogic(where);
    // safe key regexp
    const keySafeRegExp = /^[\w|&\-.()_,%']+$/;
    const multi = where._multi;
    delete where._multi;

    // eslint-disable-next-line one-var
    let key, val, result = [], str = '';

    const fn = (item, i) => {
      const v = multi ? val[i] : val;
      return '(' + this.parseWhereItem(this.parseKey(item), v) + ')';
    };

    for (key in where) {
      val = where[key];
      str = '( ';
      // _string: ''
      if (['_string', '_complex', '_query'].indexOf(key) > -1) {
        if (helper.isArray(val)) {
          result = result.concat(
            val.map(v => `( ${this.parseOrmWhere(key, v)} )`)
          );
          continue;
        }

        str += this.parseOrmWhere(key, val);
      } else if (!keySafeRegExp.test(key)) {
        throw new Error('INVALID_WHERE_CONDITION_KEY');
        // title|content
      } else if (key.indexOf('|') > -1) {
        str += key.split('|').map(fn).join(' OR ');
        // title&content
      } else if (key.indexOf('&') > -1) {
        str += key.split('&').map(fn).join(' AND ');
      } else {
        str += this.parseWhereItem(this.parseKey(key), val);
      }
      str += ' )';
      result.push(str);
    }
    result = result.join(` ${logic} `);
    return result ? ` WHERE ${result}` : '';
  }
  /**
  * parse where item
  * @param  {String} key []
  * @param  {Mixed} val []
  * @return {String}     []
  */
  parseWhereItem(key, val) {
    // {id: null}
    if (val === null) {
      return `${key} IS NULL`;
    } else if (helper.isObject(val)) {
      // {id: {'<': 10, '>': 1}}
      const logic = this.getLogic(val);
      const result = [];
      for (const opr in val) {
        const nop = getComparison(opr);
        const parsedValue = this.parseValue(val[opr]);
        // {id: {IN: [1, 2, 3]}}
        if (helper.isArray(parsedValue)) {
          result.push(`${key} ${nop} (${parsedValue.join(', ')})`);
        } else if (parsedValue === 'null') {
          result.push(key + ' ' + (nop === '!=' ? 'IS NOT NULL' : 'IS NULL'));
        } else {
          result.push(key + ' ' + nop + ' ' + parsedValue);
        }
      }
      return result.join(' ' + logic + ' ');
    } else if (helper.isArray(val)) {
      // where({id: [1, 2, 3]})
      let flag = helper.isNumber(val[0]) || helper.isNumberString(val[0]);
      if (flag) {
        flag = val.every(item =>
          helper.isNumber(item) || helper.isNumberString(item)
        );
        if (flag) {
          return `${key} IN ( ${val.join(', ')} )`;
        }
      }
    } else {
      return key + ' = ' + this.parseValue(val);
    }

    let whereStr = '';
    let data;
    if (helper.isString(val[0])) {
      const val0 = getComparison(val[0]);
      // compare
      if (/^(=|!=|>|>=|<|<=)$/.test(val0)) {
        if (val[1] === null) {
          whereStr += key + ' ' + (val[0] === '!=' ? 'IS NOT NULL' : 'IS NULL');
        } else {
          whereStr += key + ' ' + val0 + ' ' + this.parseValue(val[1]);
        }
      } else if (/^(NOT\s+LIKE|LIKE|NOT\s+ILIKE|ILIKE)$/.test(val0)) {
        // like or not like
        if (helper.isArray(val[1])) {
          // get like logic, default is OR
          const likeLogic = this.getLogic(val[2], 'OR');
          const like = val[1].map(item => key + ' ' + val0 + ' ' + this.parseValue(item)).join(' ' + likeLogic + ' ');
          whereStr += '(' + like + ')';
        } else {
          whereStr += key + ' ' + val0 + ' ' + this.parseValue(val[1]);
        }
      } else if (val0 === 'IN' || val0 === 'NOT IN') {
        // in or not in
        if (/^exp$/i.test(val[2])) {
          whereStr += key + ' ' + val0 + ' ' + val[1];
        } else {
          if (helper.isString(val[1])) {
            val[1] = val[1].split(',');
          }
          if (!helper.isArray(val[1])) {
            val[1] = [val[1]];
          }
          val[1] = this.parseValue(val[1]);
          if (val[1].length === 1) {
            whereStr += key + (val0 === 'IN' ? ' = ' : ' != ') + val[1];
          } else {
            whereStr += key + ' ' + val0 + ' (' + val[1].join(',') + ')';
          }
        }
      } else if (val0 === 'BETWEEN' || val0 === 'NOT BETWEEN') {
        // between
        data = helper.isString(val[1]) ? val[1].split(',') : val[1];
        if (!helper.isArray(data) || data.length === 1) {
          data = [val[1], val[2]];
        }
        whereStr += ' (' + key + ' ' + val0 + ' ' + this.parseValue(data[0]);
        whereStr += ' AND ' + this.parseValue(data[1]) + ')';
      } else if (val0 === 'FUNC') {
        // function
        let func = val[1];
        func = func.replace('?', key)
        whereStr += func;
      } else {
        // exp
        whereStr += '(' + key + ' ' + val[1] + ')';
      }
    } else {
      let length = val.length;
      let logic = this.getLogic(val[length - 1], '');
      if (logic) {
        length--;
      } else {
        logic = 'AND';
      }
      const result = [];
      for (let i = 0; i < length; i++) {
        const isArr = helper.isArray(val[i]);
        data = isArr ? val[i][1] : val[i];
        const exp = ((isArr ? val[i][0] : '') + '').toUpperCase();
        if (/^exp$/i.test(exp)) {
          result.push(`(${key} ${data})`);
        } else {
          const op = isArr ? getComparison(val[i][0]) : '=';
          result.push(`(${key} ${op} ${this.parseValue(data)})`);
        }
      }
      whereStr = result.join(` ${logic} `);
    }
    return whereStr;
  }
  /**
   * parse special condition
   * @param  {String} key []
   * @param  {Mixed} val []
   * @return {String}     []
   */
  parseOrmWhere(key, val) {
    switch (key) {
      case '_string':
        return val;
      case '_complex':
        return this.parseWhere(val).substr(6);
      case '_query':
        const where = helper.isString(val) ? querystring.parse(val) : val;
        const logic = this.getLogic(where);
        const arr = [];
        for (const name in where) {
          val = this.parseKey(name) + ' = ' + this.parseValue(where[name]);
          arr.push(val);
        }
        return arr.join(` ${logic} `);
    }
    return '';
  }
  /**
   * parse limit
   * @param  {String} limit []
   * @return {}       []
   */
  parseLimit(limit) {
    if (helper.isEmpty(limit)) return '';
    if (helper.isNumber(limit)) {
      limit = Math.max(limit, 0);
      return ` LIMIT ${limit}`;
    }
    if (helper.isString(limit)) {
      limit = limit.split(/\s*,\s*/);
    }
    const data = [Math.max(limit[0] | 0, 0)];
    if (limit[1]) {
      data.push(Math.max(limit[1] | 0, 0));
    }
    return ' LIMIT ' + data.join(',');
  }
  /**
   * parse join
   * @param  {String} join []
   * @return {String}      []
   */
  parseJoin(join, options = {}) {
    if (helper.isEmpty(join)) return '';
    let joinStr = '';
    const defaultJoin = ' LEFT JOIN ';
    if (!helper.isArray(join)) {
      joinStr += defaultJoin + join;
      return joinStr;
    }

    const joins = {
      'left': ' LEFT JOIN ',
      'right': ' RIGHT JOIN ',
      'inner': ' INNER JOIN '
    };
    join.forEach(val => {
      if (!helper.isString(val) && !helper.isObject(val)) {
        return;
      }

      if (helper.isString(val)) {
        const hasJoin = val.toLowerCase().indexOf(' join ') > -1;
        joinStr += (hasJoin ? ' ' : defaultJoin) + val;
        return;
      }

      const ret = [];
      if (!('on' in val)) {
        for (const key in val) {
          const v = val[key];
          if (!helper.isObject(v)) {
            ret.push(val);
            break;
          }

          v.table = key;
          ret.push(v);
        }
      } else {
        ret.push(val);
      }

      ret.forEach(item => {
        const joinType = joins[item.join] || item.join || defaultJoin;
        let table = item.table.trim();
        // table is sql
        if (table.indexOf(' ') > -1) {
          if (table.indexOf('(') !== 0) {
            table = '(' + table + ')';
          }
          joinStr += joinType + table;
        } else {
          table = options.tablePrefix + table;
          if (table.indexOf('.') === -1) {
            joinStr += joinType + this.parseKey(table);
          } else {
            joinStr += joinType + table;
          }
        }
        if (item.as) {
          joinStr += ' AS ' + this.parseKey(item.as);
        }
        if (item.on) {
          const mTable = this.parseKey(options.alias || options.table);
          const jTable = this.parseKey(item.as || table);

          if (!helper.isObject(item.on)) {
            if (helper.isString(item.on)) {
              item.on = item.on.split(/\s*,\s*/);
            }
            joinStr += ' ON ' + (item.on[0].indexOf('.') > -1 ? item.on[0] : (mTable + '.' + this.parseKey(item.on[0])));
            joinStr += ' = ' + (item.on[1].indexOf('.') > -1 ? item.on[1] : (jTable + '.' + this.parseKey(item.on[1])));
            return;
          }

          const where = [];
          for (const key in item.on) {
            let onKey = key;
            if (onKey.indexOf('.') === -1) {
              onKey = mTable + '.' + this.parseKey(onKey);
            }

            const onVal = item.on[key];
            const onWhereItem = [onKey];
            if (helper.isString(onVal) && onVal.indexOf('.') === -1) {
              onWhereItem.push('=', jTable + '.' + this.parseKey(onVal));
            } else if (helper.isArray(onVal) && /^exp$/i.test(onVal[0])) {
              onWhereItem.push(onVal[1]);
            } else {
              onWhereItem.push('=', onVal);
            }

            where.push(onWhereItem.join(''));
          }
          joinStr += ' ON (' + where.join(' AND ') + ')';
        }
      });
    });
    return joinStr;
  }
  /**
   * parse order
   * @param  {String} order []
   * @return {String}       []
   */
  parseOrder(order) {
    if (helper.isEmpty(order)) return '';
    if (helper.isArray(order)) {
      order = order.map(item => this.parseKey(item)).join(',');
    } else if (helper.isObject(order)) {
      const arr = [];
      for (const key in order) {
        let val = order[key];
        val = this.parseKey(key) + ' ' + val;
        arr.push(val);
      }
      order = arr.join(',');
    }
    return ` ORDER BY ${order}`;
  }
  /**
   * parse group
   * @param  {String} group []
   * @return {String}       []
   */
  parseGroup(group) {
    if (helper.isEmpty(group)) return '';
    if (helper.isString(group)) {
      // group may be `date_format(create_time,'%Y-%m-%d')`
      if (group.indexOf('(') !== -1) {
        return ' GROUP BY ' + group;
      }
      group = group.split(/\s*,\s*/);
    }
    const result = group.map(item => {
      if (item.indexOf('.') === -1) {
        return this.parseKey(item);
      } else {
        item = item.split('.');
        return item[0] + '.' + this.parseKey(item[1]);
      }
    });
    return ' GROUP BY ' + result.join(',');
  }
  /**
   * parse having
   * @param  {String} having []
   * @return {}        []
   */
  parseHaving(having) {
    return having ? ` HAVING ${having}` : '';
  }
  /**
   * parse comment
   * @param  {String} comment []
   * @return {String}         []
   */
  parseComment(comment) {
    return comment ? ` /*${comment}*/` : '';
  }
  /**
   * parse distinct
   * @param  {} distinct []
   * @return {}          []
   */
  parseDistinct(distinct) {
    return distinct ? ' DISTINCT' : '';
  }
  /**
   * parse union
   * @param  {String} union []
   * @return {}       []
   */
  parseUnion(union) {
    if (helper.isEmpty(union)) return '';
    if (helper.isArray(union)) {
      let sql = ' ';
      union.forEach(item => {
        sql += item.all ? 'UNION ALL ' : 'UNION ';
        sql += '(' + (helper.isObject(item.union) ? this.buildSelectSql(item.union) : item.union) + ')';
      });
      return sql;
    } else {
      return ' UNION (' + (helper.isObject(union) ? this.buildSelectSql(union) : union) + ')';
    }
  }
  /**
   * parse lock
   * @param  {Boolean} lock []
   * @return {}      []
   */
  parseLock(lock) {
    if (!lock) return '';
    return ' FOR UPDATE ';
  }
  /**
   * parse sql
   * @param  {String} sql     []
   * @param  {Object} options []
   * @return {String}         []
   */
  parseSql(sql, options) {
    return sql.replace(/%([A-Z]+)%/g, (a, type) => {
      type = type.toLowerCase();
      const ucfirst = type[0].toUpperCase() + type.slice(1);
      if (helper.isFunction(this['parse' + ucfirst])) {
        return this['parse' + ucfirst](options[type] || '', options);
      }
      return a;
    }).replace(/\s__([A-Z_-]+)__\s?/g, (a, b) => {
      return ' `' + this.config.prefix + b.toLowerCase() + '` ';
    });
  }
  /**
   * parse key
   * @param  {String} key []
   * @return {String}     []
   */
  parseKey(key) {
    key = key.trim();
    if (helper.isEmpty(key)) return '';
    if (helper.isNumberString(key)) return key;
    if (!(/[,'"*()`.\s]/.test(key))) {
      key = '`' + key + '`';
    }
    return key;
    //return key;
  }
  /**
   * parse value
   * @param  {Mixed} value []
   * @return {Mixed}       []
   */
  parseValue(value) {
    if (helper.isString(value)) {
      value = '\'' + this.escapeString(value) + '\'';
    } else if (helper.isArray(value)) {
      if (/^exp$/i.test(value[0])) {
        value = value[1];
      } else {
        value = value.map(item => this.parseValue(item));
      }
    } else if (helper.isBoolean(value)) {
      value = value ? '1' : '0';
    } else if (helper.isBuffer(value)) {
      value = `X'${value.toString('hex')}'`;
    } else if (value === null) {
      value = 'null';
    }
    return value;
  }
  /**
   * escape string, override in sub class
   * @param  {String} str []
   * @return {String}     []
   */
  escapeString(str) {
    if (!str) return '';

    // eslint-disable-next-line no-control-regex
    return str.replace(/[\0\n\r\b\t\\'"\x1a]/g, s => {
      switch (s) {
        case '\0':
          return '\\0';
        case '\n':
          return '\\n';
        case '\r':
          return '\\r';
        case '\b':
          return '\\b';
        case '\t':
          return '\\t';
        case '\x1a':
          return '\\Z';
        default:
          return '\\' + s;
      }
    });
    //return str;
  }
  /**
   * get select sql
   * @param  {Object} options []
   * @return {String}         [sql string]
   */
  buildSelectSql(options) {
    const sql = '%EXPLAIN%SELECT%DISTINCT% %FIELD% FROM %TABLE%%JOIN%%WHERE%%GROUP%%HAVING%%ORDER%%LIMIT%%UNION%%LOCK%%COMMENT%';
    return this.parseSql(sql, options);
  }
  /**
   * get insert sql
   * @param {Object} options
   */
  buildInsertSql(options) {
    const table = this.parseTable(options.table);
    let sql = options.replace ? 'REPLACE' : 'INSERT';
    if (sql === 'INSERT' && options.ignore) {
      sql += ' IGNORE';
    }
    const insertSql = `${sql} INTO ${table} (${options.fields})`;
    if (helper.isString(options.values)) {
      let values = options.values;
      if (values[0] !== '(') {
        values = `(${values})`;
      }
      const lock = this.parseLock(options.lock);
      const comment = this.parseComment(options.comment);
      return `${insertSql} VALUES ${values}${lock}${comment}`;
    }
    return `${insertSql} ${this.buildSelectSql(options.values)}`;
  }
  /**
   * build delete sql
   * @param {Object} options
   */
  buildDeleteSql(options) {
    const sql = `DELETE FROM %TABLE%%WHERE%%ORDER%%LIMIT%%LOCK%%COMMENT%`;
    return this.parseSql(sql, options);
  }
  /**
   * build update sql
   * @param {Object} options
   */
  buildUpdateSql(data, options) {
    const set = this.parseSet(data);
    const sql = `UPDATE %TABLE%${set}%WHERE%%ORDER%%LIMIT%%LOCK%%COMMENT%`;
    return this.parseSql(sql, options);
  }
};
