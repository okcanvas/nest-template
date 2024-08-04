declare namespace OrmHelper {
  interface Defer {
    promise: Promise<any>,
    resolve: Function,
    reject: Function
  }
  export function camelCase(str: any): any;


  /**
   * change path mode
   *
   * @export
   * @param {string} p
   * @param {string} mode default is '0777'
   * @returns {*}
   */
  export function chmod(p: string, mode?: string): any;

  /**
   * get datetime
   *
   * @export
   * @param {*} date
   * @param {*} format default is 'YYYY-MM-DD HH:mm:ss'
   * @returns {*}
   */
  export function datetime(date?: Date | string | number, format?: string): string;

  /**
   * get deferred object
   *
   * @export
   * @returns {Defer}
   */
  export function defer(): Defer;

  /**
   * escape html
   *
   * @export
   * @param {string} str
   * @returns {string}
   */
  export function escapeHtml(str: string): string;

  export function extend(target: Object, ...args: Object[]): any;


  /**
   *
   * get files in path
   * @export
   * @param {string} dir
   * @param {string} prefix
   * @returns {string}
   */
  export function getdirFiles(dir: string, prefix?: string): Array<string>;

  export function isArray(arg: any): boolean;

  export function isBoolean(arg: any): boolean;

  export function isBuffer(b: any): boolean;

  export function isDate(d: any): boolean;

  export function isDirectory(filePath: any): boolean;

  export function isEmpty(obj: any): boolean;

  export function isError(e: any): boolean;

  export function isExist(dir: any): boolean;

  export function isFile(filePath: any): boolean;

  export function isFunction(arg: any): boolean;

  export function isInt(value: string): boolean;

  export function isIP(value: string): boolean;

  export function isIPv4(value: string): boolean;

  export function isIPv6(value: string): boolean;

  export var isMaster: boolean;

  export function isNull(arg: any): boolean;

  export function isNullOrUndefined(arg: any): boolean;

  export function isNumber(arg: any): boolean;

  export function isNumberString(obj: any): boolean;

  export function isObject(obj: any): boolean;

  export function isPrimitive(arg: any): boolean;

  export function isRegExp(re: any): boolean;

  export function isString(arg: any): boolean;

  export function isSymbol(arg: any): boolean;

  export function isTrueEmpty(obj: any): boolean;

  export function isUndefined(arg: any): boolean;

  export function md5(str: string): string;

  
  /**
   *
   *
   * @export
   * @param {string} dir
   * @param {string} mode default to '0777'
   * @returns {*}
   */
  export function mkdir(dir: string, mode?: string): any;

  /**
   * transform humanize time to ms
   *
   * @export
   * @param {*} time
   * @returns {*}
   */
  export function ms(time: any): number;


  /**
   * omit some props in object
   *
   * @export
   * @param {Object} obj
   * @param {(string | Array<any>)} props ',' seperate string or array of props
   * @returns {Object}
   */
  export function omit(obj: Object, props: string | Array<any>): Object;


  export function parseAdapterConfig(config: Object, ...extConfig: Array<any>): Object;

  /**
   * make callback function to promise
   *
   * @param  {Function} fn       []
   * @param  {Object}   receiver []
   * @return {Function}            []
   */
  export function promisify(fn: Function, receiver: Object): Function;
  /**
   * remove dir aync
   * @param  {string} p       [path]
   * @param  {Boolean} reserve []
   * @return {Promise}         []
   */
  export function rmdir(p: string, reserve?: Boolean): Promise<any>;

  /**
   * snakeCase string
   * @param  {string} str []
   * @return {string}     []
   */
  export function snakeCase(str: string): string;

  /**
   * get timeout Promise default 1000
   * @param  {Number} time []
   * @return {Promise}      []
   */
  export function timeout(time?: Number): Promise<any>;
  /**
   * generate uuid
   * @param  {string} version [uuid RFC version defautl to v4, or v1]
   * @return {string}         []
   */
  export function uuid(version?: string): string;

  export function encrypt(text: string, key?: string) : string;
  export function decrypt(text: string, key?: string) : string;

  export function groupBy(array: any[], props: any) : any[];
  export function sortBy(array: any[], keys: any) : any[];
  export function searchBy(array: any[], key: string, value: any) : any;
  export function sumBy(array: any[], key: string) : number;

  export function parseTime(time: any, cFormat?: string): string;
  export function parseTimeStamp(time: any): number;
  export function workTime (startTimeStamp: any, endTimeStamp: any, startHour: number, startMinute: number): any;

  export function randomstring(len: Number): string;
  export function createPassword(charLen: Number, specLen: Number): string;

  export function uniqIds(array: any[], field: string, defaultValue: any): any[];
}

export = OrmHelper;

