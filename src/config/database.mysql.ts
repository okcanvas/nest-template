export const MYSQL_OPTIONS = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USERNAME || 'admin',
  password: process.env.DB_PASSWORD || '1234567890',
  database: process.env.DB_DATABASE || 'testDB',

  //charset: 'utf8mb4',
  timezone: process.env.DB_TIMEZONE || '+00:00',  // SEOUL
  //multipleStatements: ,
  //debug: false,
  //trace: false,
  //localAddress: '0.0.0.0',
  //socketPath: '',
  //stringifyObjects: boolean,
  //insecureAuth: boolean,
  //typeCast: boolean,
  //queryFormat: any,
  //supportBigNumbers: boolean,
  //bigNumberStrings: any,
  //localInfile: boolean,
  //flags: any,
  //ssl: any,

  waitForConnections: true,
  queueLimit: 0,
  connectTimeout: 5000,
  //dateStrings?: boolean;
  //decimalNumbers?: boolean;
  connectionLimit: 10,
}

export const MYSQL_ENCRYPT = {
  key: 'mbs123',
  fields: [
    //  test
    'uuid',
    //  member
    'member_name',
    'member_tell',
    'member_address',
  ]
}