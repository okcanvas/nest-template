const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const net = require('net');
const cluster = require('cluster');
const uuid = require('uuid');
const ms = require('ms');
const {
  isArray,
  isBoolean,
  isNull,
  isNullOrUndefined,
  isNumber,
  isString,
  isSymbol,
  isUndefined,
  isRegExp,
  isObject,
  isDate,
  isError,
  isFunction,
  isPrimitive,
  isBuffer
} = require('core-util-is');

const fsRmdir = promisify(fs.rmdir, fs);
const fsUnlink = promisify(fs.unlink, fs);
const fsReaddir = promisify(fs.readdir, fs);

const numberReg = /^((-?(\d+\.|\d+|\.\d)\d*(?:e[+-]?\d*(?:\d?\.?|\.?\d?)\d*)?)|(0[0-7]+)|(0x[0-9a-f]+))$/i;
const toString = Object.prototype.toString;

exports.isIP = net.isIP;
exports.isIPv4 = net.isIPv4;
exports.isIPv6 = net.isIPv6;
exports.isMaster = cluster.isMaster;

exports.isArray = isArray;
exports.isBoolean = isBoolean;
exports.isNull = isNull;
exports.isNullOrUndefined = isNullOrUndefined;
exports.isNumber = isNumber;
exports.isString = isString;
exports.isSymbol = isSymbol;
exports.isUndefined = isUndefined;
exports.isRegExp = isRegExp;
exports.isObject = isObject;
exports.isDate = isDate;
exports.isError = isError;
exports.isFunction = isFunction;
exports.isPrimitive = isPrimitive;
exports.isBuffer = isBuffer;

/**
 * override isObject method in `core-util-is` module
 */
exports.isObject = obj => {
  return toString.call(obj) === '[object Object]';
};

/**
 * check value is integer
 */
function isInt(value) {
  if (isNaN(value) || exports.isString(value)) {
    return false;
  }
  var x = parseFloat(value);
  return (x | 0) === x;
}

exports.isInt = isInt;

/**
 * make callback function to promise
 * @param  {Function} fn       []
 * @param  {Object}   receiver []
 * @return {Promise}            []
 */
function promisify(fn, receiver) {
  return (...args) => {
    return new Promise((resolve, reject) => {
      fn.apply(receiver, [...args, (err, res) => {
        return err ? reject(err) : resolve(res);
      }]);
    });
  };
}

exports.promisify = promisify;

exports.extend = require('lodash.merge');

/**
 * camelCase string
 * @param  {String} str []
 * @return {String}     []
 */
function camelCase(str) {
  if (str.indexOf('_') > -1) {
    str = str.replace(/_(\w)/g, (a, b) => {
      return b.toUpperCase();
    });
  }
  return str;
}
exports.camelCase = camelCase;

/**
 * snakeCase string
 * @param  {String} str []
 * @return {String}     []
 */
function snakeCase(str) {
  return str.replace(/([^A-Z])([A-Z])/g, function($0, $1, $2) {
    return $1 + '_' + $2.toLowerCase();
  });
};
exports.snakeCase = snakeCase;

/**
 * check object is number string
 * @param  {Mixed}  obj []
 * @return {Boolean}     []
 */
function isNumberString(obj) {
  if (!obj) return false;
  return numberReg.test(obj);
}
exports.isNumberString = isNumberString;

/**
 * true empty
 * @param  {Mixed} obj []
 * @return {Boolean}     []
 */
function isTrueEmpty(obj) {
  if (obj === undefined || obj === null || obj === '') return true;
  if (exports.isNumber(obj) && isNaN(obj)) return true;
  return false;
}
exports.isTrueEmpty = isTrueEmpty;

/**
 * check object is mepty
 * @param  {[Mixed]}  obj []
 * @return {Boolean}     []
 */
function isEmpty(obj) {
  if (isTrueEmpty(obj)) return true;
  if (exports.isRegExp(obj)) {
    return false;
  } else if (exports.isDate(obj)) {
    return false;
  } else if (exports.isError(obj)) {
    return false;
  } else if (exports.isArray(obj)) {
    return obj.length === 0;
  } else if (exports.isString(obj)) {
    return obj.length === 0;
  } else if (exports.isNumber(obj)) {
    return obj === 0;
  } else if (exports.isBoolean(obj)) {
    return !obj;
  } else if (exports.isObject(obj)) {
    for (const key in obj) {
      return false && key; // only for eslint
    }
    return true;
  }
  return false;
}
exports.isEmpty = isEmpty;

/**
 * get deferred object
 * @return {Object} []
 */
function defer() {
  const deferred = {};
  deferred.promise = new Promise((resolve, reject) => {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });
  return deferred;
}
exports.defer = defer;

/**
 * get content md5
 * @param  {String} str [content]
 * @return {String}     [content md5]
 */
function md5(str) {
  return crypto.createHash('md5').update(str + '', 'utf8').digest('hex');
}
exports.md5 = md5;

/**
 * get timeout Promise
 * @param  {Number} time []
 * @return {[type]}      []
 */
function timeout(time = 1000) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}
exports.timeout = timeout;

/**
 * escape html
 */
function escapeHtml(str) {
  return (str + '').replace(/[<>'"]/g, a => {
    switch (a) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quote;';
      case '\'':
        return '&#39;';
    }
  });
}
exports.escapeHtml = escapeHtml;

/**
 * get datetime
 * @param  {Date} date []
 * @return {String}      []
 */
function datetime(date = new Date(), format) {
  if (date && isString(date)) {
    const dateString = date;
    date = new Date(Date.parse(date));

    if (isNaN(date.getTime()) && !format) {
      format = dateString;
      date = new Date();
    }
  }
  format = format || 'YYYY-MM-DD HH:mm:ss';

  const fn = d => {
    return ('0' + d).slice(-2);
  };

  const d = new Date(date);
  const formats = {
    YYYY: d.getFullYear(),
    MM: fn(d.getMonth() + 1),
    DD: fn(d.getDate()),
    HH: fn(d.getHours()),
    mm: fn(d.getMinutes()),
    ss: fn(d.getSeconds())
  };

  return format.replace(/([a-z])\1+/ig, a => {
    return formats[a] || a;
  });
}
exports.datetime = datetime;

/**
 * generate uuid
 * @param  {String} version [uuid RFC version]
 * @return {String}         []
 */
exports.uuid = function(version) {
  if (version === 'v1') return uuid.v1();
  return uuid.v4();
};

/**
 * parse adapter config
 */
exports.parseAdapterConfig = (config = {}, ...extConfig) => {
  config = exports.extend({}, config);
  // {handle: ''}
  if (!config.type) config.type = '_';
  // {type: 'xxx', handle: ''}
  if (config.handle) {
    const type = config.type;
    delete config.type;
    config = { type, [type]: config };
  }
  extConfig = extConfig.map(item => {
    if (!item) return {};
    // only change type
    // 'xxx'
    if (exports.isString(item)) {
      item = { type: item };
    }
    // {handle: 'www'}
    // only add some configs
    if (!item.type) {
      item = { type: config.type, [config.type]: item };
    }
    // {type: 'xxx', handle: 'www'}
    if (item.handle) {
      const type = item.type;
      delete item.type;
      item = { type, [type]: item };
    }
    return item;
  });
  // merge config
  config = exports.extend({}, config, ...extConfig);
  const value = config[config.type] || {};
  // add type for return value
  value.type = config.type;
  return value;
};
/**
 * transform humanize time to ms
 */
exports.ms = function(time) {
  if (typeof time === 'number') return time;
  const result = ms(time);
  if (result === undefined) {
    throw new Error(`orm-ms('${time}') result is undefined`);
  }
  return result;
};

/**
 * omit some props in object
 */
exports.omit = function(obj, props) {
  if (exports.isString(props)) {
    props = props.split(',');
  }
  const keys = Object.keys(obj);
  const result = {};
  keys.forEach(item => {
    if (props.indexOf(item) === -1) {
      result[item] = obj[item];
    }
  });
  return result;
};

/**
 * check path is exist
 */
function isExist(dir) {
  dir = path.normalize(dir);
  try {
    fs.accessSync(dir, fs.R_OK);
    return true;
  } catch (e) {
    return false;
  }
}

exports.isExist = isExist;

/**
 * check filepath is file
 */
function isFile(filePath) {
  if (!isExist(filePath)) return false;
  try {
    const stat = fs.statSync(filePath);
    return stat.isFile();
  } catch (e) {
    return false;
  }
}
exports.isFile = isFile;

/**
 * check path is directory
 */
function isDirectory(filePath) {
  if (!isExist(filePath)) return false;
  try {
    const stat = fs.statSync(filePath);
    return stat.isDirectory();
  } catch (e) {
    return false;
  }
}
exports.isDirectory = isDirectory;

/**
 * change path mode
 * @param  {String} p    [path]
 * @param  {String} mode [path mode]
 * @return {Boolean}      []
 */
function chmod(p, mode) {
  try {
    fs.chmodSync(p, mode);
    return true;
  } catch (e) {
    return false;
  }
}
exports.chmod = chmod;

/**
 * make dir
 */
function mkdir(dir, mode) {
  if (isExist(dir)) {
    if (mode) return chmod(dir, mode);
    return true;
  }
  const pp = path.dirname(dir);
  if (isExist(pp)) {
    try {
      fs.mkdirSync(dir, mode);
      return true;
    } catch (e) {
      return false;
    }
  }
  if (mkdir(pp, mode)) return mkdir(dir, mode);
  return false;
}
exports.mkdir = mkdir;

/**
 * get files in path
 * @param  {} dir    []
 * @param  {} prefix []
 * @return {}        []
 */
function getdirFiles(dir, prefix = '') {
  dir = path.normalize(dir);
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir);
  let result = [];
  files.forEach(item => {
    const currentDir = path.join(dir, item);
    const stat = fs.statSync(currentDir);
    if (stat.isFile()) {
      result.push(path.join(prefix, item));
    } else if (stat.isDirectory()) {
      const cFiles = getdirFiles(currentDir, path.join(prefix, item));
      result = result.concat(cFiles);
    }
  });
  return result;
};

exports.getdirFiles = getdirFiles;

/**
 * remove dir aync
 * @param  {String} p       [path]
 * @param  {Boolean} reserve []
 * @return {Promise}         []
 */
function rmdir(p, reserve) {
  if (!isDirectory(p)) return Promise.resolve();
  return fsReaddir(p).then(files => {
    const promises = files.map(item => {
      const filepath = path.join(p, item);
      if (isDirectory(filepath)) return rmdir(filepath, false);
      return fsUnlink(filepath);
    });
    return Promise.all(promises).then(() => {
      if (!reserve) return fsRmdir(p);
    });
  });
}
exports.rmdir = rmdir;

exports.isBuffer = Buffer.isBuffer;

//-----------------------------------------------------------------------------
//  중요  : 수정하지 마시오
//-----------------------------------------------------------------------------
const CRYPTO_BASE_KEY = 'YFpoGQ@$VrUMf64tZ9eg^RiaQSZ^Pw%*';
const CRYPTO_BASE_IV = 'B426E467C3E6F2233C8906C55E79A531';

function String2Hex(tmp = '') {
  var str = '';
  for(var i = 0; i < tmp.length; i++) {
    str += tmp[i].charCodeAt(0).toString(16);
  }
  return str;
}

function encrypt (text, key = '') {
  try {
    const _key = (key + CRYPTO_BASE_KEY).substring(0, 32);
    let iv = Buffer.from(CRYPTO_BASE_IV, 'hex')
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(_key), iv)
    let encrypted = cipher.update(text)
    encrypted = Buffer.concat([encrypted, cipher.final()])
    return encrypted.toString('hex').toUpperCase();
    
    /*
    const _key = (key + CRYPTO_BASE_KEY).substring(0, 32);
    const IV_LENGTH = 16 // For AES, this is always 16
    let iv = crypto.randomBytes(IV_LENGTH)
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(_key), iv)
    let encrypted = cipher.update(text)
    encrypted = Buffer.concat([encrypted, cipher.final()])
    return iv.toString('hex').toUpperCase() + ':' + encrypted.toString('hex').toUpperCase()
    */
  } catch (err) {
    //throw err
    return null;
  }
}
exports.encrypt = encrypt;

function decrypt (text, key = '') {
  try {
    const _key = (key + CRYPTO_BASE_KEY).substring(0, 32);
    let iv = Buffer.from(CRYPTO_BASE_IV, 'hex')
    let encryptedText = Buffer.from(text, 'hex')
    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(_key), iv)
    let decrypted = decipher.update(encryptedText)
    decrypted = Buffer.concat([decrypted, decipher.final()])
    return decrypted.toString()

    /*
    const _key = (key + CRYPTO_BASE_KEY).substring(0, 32);
    let textParts = text.split(':')
    let iv = Buffer.from(textParts.shift(), 'hex')
    let encryptedText = Buffer.from(textParts.join(':'), 'hex')
    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(_key), iv)
    let decrypted = decipher.update(encryptedText)
    decrypted = Buffer.concat([decrypted, decipher.final()])
    return decrypted.toString()
    */
  } catch (err) {
    //throw err
    return null;
  }
}
exports.decrypt = decrypt;


//================================
//  GROUP SUM 비교함수
//================================
/**
 * @param {Array} array
 * @param {Array} props
 * @returns {Array}
 */
function groupBy(array, props) {
  function getGroupedItems(item) {
    let returnArray = [];
    let i;
    for (i = 0; i < props.length; i++) {
        returnArray.push(item[props[i]]);
    }
    return returnArray;
  };
  let groups = {};
  let i;
  for (i = 0; i < array.length; i++) {
    const arrayRecord = array[i];
    const group = JSON.stringify(getGroupedItems(arrayRecord));
    groups[group] = groups[group] || [];
    groups[group].push(arrayRecord);
  }
  return Object.keys(groups).map((group) => {
    return groups[group];
  });
}
exports.groupBy = groupBy;

//================================
//  GROUP SORT 비교함수
//================================
/**
 * @param {Array} array
 * @param {Array} keys
 * @returns {Array}
 */
function sortBy(array, keys) {
  keys = keys || {};

  var obLen = function(obj) {
    var size = 0, key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) size++;
    }
    return size;
  };
  
  var obIx = function(obj, ix) {
    var size = 0, key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (size == ix) return key;
        size++;
      }
    }
    return false;
  };
  
  const keySort = function(a, b, d) {
    d = d !== null ? d : 1;
    // a = a.toLowerCase(); // this breaks numbers
    // b = b.toLowerCase();
    if (a == b) return 0;
    return a > b ? 1 * d : -1 * d;
  };
  
  var KL = obLen(keys);
  if (!KL) return array.sort(keySort);
  
  for ( var k in keys) {
    keys[k] = keys[k] == 'desc' || keys[k] == -1  ? -1 
            : (keys[k] == 'skip' || keys[k] === 0 ? 0 
            : 1);
  }
  
  array.sort(function(a, b) {
    var sorted = 0, ix = 0;
    while (sorted === 0 && ix < KL) {
      var k = obIx(keys, ix);
      if (k) {
        var dir = keys[k];
        sorted = keySort(a[k], b[k], dir);
        ix++;
      }
    }
    return sorted;
  });
  return array;
}
exports.sortBy = sortBy;

function uniqIds(array, field, defaultValue = 0) {
  let result = [defaultValue];
  array.map(e => { 
    if (e[field]) result.push(e[field]) 
  });
  if (result.length <= 0) result = [defaultValue];
  let set = new Set(result);
  return [...set];
}
exports.uniqIds = uniqIds;

//================================
//  BINARY SEARCH
//================================
/**
 * @param {Array} array
 * @param {string} key
 * @param {any} value
 * @returns {object}
 */
function searchBy(array, key, value) {
  let start = 0;
  let end = array.length - 1;
  let index = 0;
  while (start <= end) {
    let middle = Math.floor((end + start) / 2);
    if (array[middle][key] === value) {
      return array[middle];
    } else if (array[middle][key] > value) {
      end = middle - 1;
    } else {
      start = middle + 1;
    }
    index++;
  }
  return null;
}
exports.searchBy = searchBy;

//================================
//  ARRAY SUM
//================================
/**
 * @param {Array} array
 * @param {string} key
 * @returns {number}
 */
function sumBy(array, key) {
  let result = 0;
  for (let i=0; i<array.length; i++) {
    result += array[i][key] || 0;
  }
  return result;
}
exports.sumBy = sumBy;

//================================
//  
//================================
function parseTimeStamp(time) {
  if (arguments.length === 0 || !time) {
    //console.log('================== 1', time)
    time = new Date().getTime();
  }
  if (typeof time === 'object') {
    //console.log('================== 2', time)
    //  2023-12-01T05:37:54.766Z
    //  new Date()의 결과 바로사용할때 string이 아니다.
  }
  if ((typeof time === 'string')) {
    //console.log('================== 3', time)
    if ((/^[0-9]+$/.test(time))) {
      //console.log('================== 3-1', time)
      // support "1548221490638"
      time = parseInt(time)
    } else {
      //console.log('================== 3-2', time, (new Date(time)))
      //time = time.replace(new RegExp(/-/gm), '/')
    }
  }
  if ((typeof time === 'number') && (time.toString().length === 10)) {
    //console.log('================== 4', time)
    time = time * 1000
  }
  //let date = new Date(time)
  return Math.ceil(new Date(time).getTime() / 1000);
}
exports.parseTimeStamp = parseTimeStamp;

//================================
//  
//================================
function parseTime(time, cFormat) {
  if (arguments.length === 0 || !time) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if ((typeof time === 'string')) {
      if ((/^[0-9]+$/.test(time))) {
        // support "1548221490638"
        time = parseInt(time)
      } else {
        time = time.replace(new RegExp(/-/gm), '/')
      }
    }

    if ((typeof time === 'number') && (time.toString().length === 10)) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const time_str = format.replace(/{([ymdhisa])+}/g, (result, key) => {
    const value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') { return ['일', '월', '화', '수', '목', '금', '토'][value ] }
    return value.toString().padStart(2, '0')
  })
  return time_str
}
exports.parseTime = parseTime;

//================================
//  
//================================
function newDate(time) {
	let date
  time = parseTimeStamp(time)
	if (typeof time === 'object') {
		date = time
	} else {
		if ((typeof time === 'string')) {
			if ((/^[0-9]+$/.test(time))) {
				// support "1548221490638"
				time = parseInt(time)
			} else {
				time = time.replace(new RegExp(/-/gm), '/')
			}
		}
		if ((typeof time === 'number') && (time.toString().length === 10)) {
			time = time * 1000
		}
		date = new Date(time)
	}
	return date;
}


//================================
//  WORK TIME
//================================
/**
 * @param {number} startTimeStamp
 * @param {number} endTimeStamp
 * @param {number} startHour
 * @returns {object}
 */
function workTime (startTimeStamp, endTimeStamp, startHour, startMinute) {
  //  기본 작업시각 시간 8시
  if (!startHour && startHour != 0) startHour = 8;
  if (!startMinute && startMinute != 0) startHour = 0;

  const result = [];
  if (startTimeStamp) {
    const date = newDate(startTimeStamp), 
    y = date.getFullYear(), 
    m = date.getMonth(), 
    d = date.getDate(),
    timestamp = new Date(y, m, d, startHour, startMinute) / 1000;
    result.push({
      startHour: startHour,
      startMinute: startMinute,
      timestamp: timestamp,
      datetime: parseTime(timestamp),
      date: parseTime(date, '{y}-{m}-{d}')
    });
  }
  if (endTimeStamp) {
    const date = newDate(endTimeStamp), 
    y = date.getFullYear(), 
    m = date.getMonth(), 
    d = date.getDate(),
    timestamp = new Date(y, m, d, startHour+24, startMinute, -1) / 1000;
    result.push({
      startHour: startHour,
      startMinute: startMinute,
      timestamp: timestamp,
      datetime: parseTime(timestamp),
      date: parseTime(date, '{y}-{m}-{d}')
    });
  }
  return result; 
}
exports.workTime = workTime;


function randomString(len) {
  var charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var randomString = '';
  for (var i = 0; i < len; i++) {
    var randomPoz = Math.floor(Math.random() * charSet.length);
    randomString += charSet.substring(randomPoz,randomPoz+1);
  }
  return randomString;
}
exports.randomString = randomString;

function createPassword(charLen, specLen) {
  const charLowerSet = 'abcdefghijklmnopqrstuvwxyz';
  const charUpperSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numberSet = '0123456789';

  let result = '';
  //  소문자
  for (var i = 0; i < 5; i++) {
    var randomPoz = Math.floor(Math.random() * charLowerSet.length);
    result += charLowerSet.substring(randomPoz,randomPoz+1);
  }
  //  대문자
  //for (var i = 0; i < 2; i++) {
  //  var randomPoz = Math.floor(Math.random() * charUpperSet.length);
  //  result += charUpperSet.substring(randomPoz,randomPoz+1);
  //}
  //  숫자
  for (var i = 0; i < 5; i++) {
    var randomPoz = Math.floor(Math.random() * numberSet.length);
    result += numberSet.substring(randomPoz,randomPoz+1);
  }

  /*
  var charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var specSet = '!@#$%^&*()';
  var result = '';
  for (var i = 0; i < charLen; i++) {
    var randomPoz = Math.floor(Math.random() * charSet.length);
    result += charSet.substring(randomPoz,randomPoz+1);
  }
  if (specLen > 0) {
    for (var i = 0; i < specLen; i++) {
      var randomPoz = Math.floor(Math.random() * specSet.length);
      result += specSet.substring(randomPoz,randomPoz+1);
    } 
  }
  */
  return result;
}
exports.createPassword = createPassword;