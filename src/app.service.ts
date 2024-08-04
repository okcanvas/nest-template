import { Injectable } from '@nestjs/common';
import * as _lib from '@src/utils/common';
import { parseTime } from '@src/utils/timezone';
import { MysqlService } from '@src/okcanvas-libs';
import { PostgresSqlService } from '@src/okcanvas-libs';
import cluster from 'cluster';
import * as os from 'os';
import moment from 'moment';
import { join } from 'path';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import md5 from 'md5';
import { renderFile } from 'ejs';
import { AccountTypeEnum } from 'src/modules/enums';
import { _Success, _Fail, helper } from '@src/utils/response';
import { NewsDto } from 'src/dto';
import CryptoJS from 'crypto-js'; 

import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, UserSchema } from '@src/schemas/users.schema';
import { MetaData, MetaDataDocument, MetaDataSchema } from '@src/schemas/metadata.schema';
/*
  기록용

  commons/utility/StringCrypto.class
    return new String(cipher.doFinal(encrypted), Charsets.UTF_8);
*/


@Injectable()
export class AppService {

  constructor(
    private readonly mysql: MysqlService,
    private readonly postgresql: PostgresSqlService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(MetaData.name) private metaModel: Model<MetaDataDocument>,
  ) {
    this.onStart(); 
  }

  //===========================================================================
  //
  //===========================================================================
  async onStart() {
    const payload = {
      appInfo: process.env.VERSION || '',
      masterId: process.env['MASTER_ID'] ? process.env['MASTER_ID'] : 0,
      processId: process.pid,
      isMaster: cluster.isMaster ? 1 : 0,
      isWorker: cluster.isWorker ? 1 : 0,
      isCron: process.env['WORKER_CRON'] ? 1 : 0,
      cpu: os.cpus().length,
      platform: os.platform(),
      version: os.version(),
      homedir: os.homedir(),
      tmpdir: os.tmpdir(),
    }
    if (payload.platform == 'linux') {
      this.mysql.add('ok_log_process', payload);
    }
  }


  
  async testPostgreSql() {
    //var data = await this.postgresql.query('INSERT INTO test (\"name\") VALUES(\'sdfsfsf\') RETURNING id')
    //console.log(data)

    //var data = await this.postgresql.query('SELECT * FROM test')
    //console.log(data)

    //var data = await this.postgresql.model('test').select()
    //console.log(data)

    /*
    var data = await this.postgresql.builder()
      .sqlAdd('SELECT *')
      .sqlAdd(`FROM test`)
      .sqlQuery();
      //console.log(data)
      */

    var data = await this.postgresql.model('test01').add({ name: '21432423432432' })
    console.log('===========', data)

    const connB = await this.postgresql.getConnection();
    
    try {
      await connB.transaction();

      var data = await connB.query('INSERT INTO test (\"name\") VALUES(\'sdfsfsf\') RETURNING id')
      //console.log(data)

      var data = await connB.model('test').add({ name: '21432423432432' })
      console.log(data)

      var data = await connB.model('test').where({ id: 20 }).update({ name: '21432423432432' })
      //console.log(data)

      var data = await connB.model('test').where({ id: 20 }).delete()
      //console.log(data)

      var data = await connB.query('SELECT * FROM test')
      //console.log(data)

      //await connB.commit();
      await connB.rollback();

      var data = await connB.query('SELECT * FROM test')
      //console.log(data)


    } catch (e) {
      console.log(e)
      await connB.rollback();
    } finally {
      await connB.release();
    }

    var data = await this.mysql.query('SELECT * FROM test1')
    console.log(data)




    return {
      message: 'data',
    };
  }


  async ___mongo(id: number) {
    let insertList = [];
    const list = await this.mysql.model('aaa_metadata').where({ id: ['>', id] }).limit(0, 1000).select();
    for (const item of list) {
      insertList.push({
        _dataset: item.dataset,
        _collection: item.collection,
        publisher: item.publisher,
        publishDate: item.publishDate,
        publishYear: item.publishYear,
        title: item.title,
        content: item.content,
        creator: item.creator,
        schemeURI: item.schemeURI,
        keyword: item.keyword,
        resourceInfo: item.resourceInfo,
      });
    }
    await this.metaModel.insertMany(insertList);

    return list.length;
  }


  async mongo(id: number): Promise<any> {
    //const data00 = await this.metaModel.find({ $text : { $search : "인삼" } }).lean();
    /*
    const data = await this.metaModel.aggregate([
      {
        $search: {
          index: 'title_1_content_1',
          text: {
            query: "금산",
            path: "metadata.text"
            //path: ['컬렉션명', '컬렉션명']
          }
        }
      }, 
    ])
    */
    //console.log(data00.length);
    //return

    /*
    let count = 0;
    let start = 0;
    do {
      count = await this.___mongo(start);
      start += 1000
    } while(count == 1000)
    return
    */
    

    //  
    //
    //  db.metadatas.createIndex({ title: "text", content: "text" }, { default_language: "ngram" })

    const aggregatorOpts = [
      {
        $match: { 
          $text : { $search : "인삼" }
        }
      },
      {
        $group: {
          _id: {
            _dataset: "$_dataset",
            _collection: "$_collection",
          },
          count: { $sum: 1 }
        }
      }
    ]
    const aggregatorOptsA = [
      {
        $group: {
          _id: "$_dataset",
          count: { $sum: 1 }
        }
      }
    ]
    const group = await this.metaModel.aggregate(aggregatorOpts)
    console.log(group);

    //const data = await this.metaModel.find({ $text : { $search : "인" } }).skip(0).limit(20).lean();
    const data = await this.metaModel.find({ $text : { $search : "인삼" } }).skip(0).limit(20).lean();
    console.log(data.length);

    //console.log(data[0]);


    /*
    select longToday, count(*) from incaData group by longToday order by longToday 
    db.incaData.aggregate(    {$match  : { nScanResult : 5}}  ,      {$sort : { longToday : -1}} ,    { $group: { _id: "$longToday", count: { $sum: 1 } } }            );
    */


    /*
    let insertList = [];
    const list = await this.mysql.model('aaa_metadata').where({ id: ['>', id] }).limit(0, 50000).select();
    for (const item of list) {
      insertList.push({
        dataset: item.dataset,
        collection: item.collection,
        publisher: item.publisher,
        publishDate: item.publishDate,
        publishYear: item.publishYear,
        title: item.title,
        content: item.content,
        creator: item.creator,
        schemeURI: item.schemeURI,
        keyword: item.keyword,
        resourceInfo: item.resourceInfo,
      });
      if (insertList.length == 1000) {
        await this.metaModel.insertMany(insertList);
        insertList = [];
      }
    }

    if (insertList.length > 0) {
      await this.metaModel.insertMany(insertList);
    }

    return (list.length > 0) ? list[list.length-1] : null;
    */


    /*
    try {
      
      const newUser = new this.userModel({
        email: 'okcanvas@naver.com', 
        name: 'okcanvas',
        password: '1234',
        imgUrl: null,
      });
      await newUser.save();
      
      
      await this.userModel.insertMany([
        {
          email: 'okcanvas1@naver.com', 
          name: 'okcanvas',
          password: '1234',
          imgUrl: null,
        },
        {
          email: 'okcanvas2@naver.com', 
          name: 'okcanvas',
          password: '1234',
          imgUrl: null,
        } 
      ])
      
      //  mongodb://cellbio:cellbio0707)%26)%26@211.42.156.52:28018/test?authMechanism=DEFAULT



      const data = await this.userModel.find().lean();
      console.log(data);

      const result = await this.userModel.findOne({ name: userName }).lean();
      console.log(result);

      return result;
    } catch (err) {
      console.log('error...', err);
    }
    */
  }


  //===========================================================================
  //
  //===========================================================================
  async addNews(userId: number, data: NewsDto) {
    if (!this.mysql.helper.isArray(data?.article)) {
      _Fail(401, 'not array') 
    }

    for (const item of data.article) {
      delete item.sections;
      delete item.followingCodes;
      item.horizontalWritingYn = (item.horizontalWritingYn == 'true');
      console.log(item)
      const found = await this.mysql.model('aaa_naver_news').where({ articleId: item.articleId }).find();
      if (this.mysql.helper.isEmpty(found)) {
        try {
          await this.mysql.model('aaa_naver_news').add(item); 
        } catch (error) {
          delete item.content;
          await this.mysql.model('aaa_naver_news').add(item); 
        }
      }
    }
    //console.log(data)



    return {
      message: 'Hello Boksaeng!',
    };
  }

  //===========================================================================
  //
  //===========================================================================
  async getURL(url: string) {
    if (!this.mysql.helper.isEmpty(url)) {
      _Fail(401, 'not url') 
    }

    //require('https').globalAgent.options.ca = require('ssl-root-cas/latest').create();
    const options = {
      method: 'GET',
      url: url,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
    };

    try {
      //const res = await axios(options);
      //if (res.status === 200 || res.status === 201) {
      //  console.log(res)
      //} 
      var option = {
        host: 'db.history.go.kr',
        path: '/id/ks_003_0020_0810'
    };

    const https = require("https");
      const rootCas = require('ssl-root-cas').create();
      const httpsAgent = new https.Agent({ca: rootCas});
      //console.log(httpsAgent)


      axios.get(url, { httpsAgent })
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });

    } catch (error) {
      console.log(error)
    }


    return {
      message: 'Hello Boksaeng!',
    };
  }


  //===========================================================================
  //
  //===========================================================================
  async getTestA() {
    var text = '010-4140-0278'
    var encrypted = this.mysql.helper.encrypt(text, 'mbs123')
    var decrypted = this.mysql.helper.decrypt(encrypted, 'mbs123')
    console.log(text);
    console.log(encrypted);
    console.log(decrypted);

    if (false) {
      const userId = 1;
      //work.model('users').field('u.userId, u.nickname, c.categoryId, c.categoryName').where({ userId: 413 }).alias('u')
      const dataB = await this.mysql
      .model(`(SELECT * from users where userId = ${userId})`).alias('u')
      .join({
        table: 'category',
        as: 'c',
        join: 'left',
        on: {
          'u.categoryId': 'c.categoryId'
        }
      })
      .join({
        table: 'subject',
        as: 's',
        join: 'left',
        on: {
          's.categoryId': 'c.categoryId'
        }
      })
      .field('u.userId, c.categoryId, c.categoryName, s.subjectId, s.subjectName')
      //.where({ userId: 1 })
      .select();

      console.log( dataB )
    }

    if (false) {
      const userId = 1;
      const data = await this.mysql.builder()
      .sqlAdd('SELECT u.userId, c.categoryId, c.categoryName, s.subjectId, s.subjectName')
      .sqlAdd('FROM (select * from users where userId = ?) AS u', [userId])
      .sqlAdd('LEFT JOIN `category` AS `c` ON (u.categoryId=c.categoryId)')
      .sqlAdd('LEFT JOIN `subject` AS `s` ON (s.categoryId=c.categoryId)')
      .sqlQuery();
      //console.log('<<<',data);
    }

    if (true) {
      const data1 = await this.mysql.builder()
      .sqlAdd('SELECT *')
      .sqlAdd(`FROM okcanvasDB.users`)
      .sqlQuery();
      console.log('<<<', data1.length);

      const data2 = await this.mysql.builder()
      .sqlAdd('SELECT *')
      .sqlAdd(`FROM boksaengDB.users`)
      .sqlQuery();
      console.log('<<<', data2.length);

    }

    /*
    const data = await this.mysql.model('users').where({ userId: 413 }).find();
    //console.log(data)

    
    //console.log(await this.mysql.model('users').where({ userId: ['>', 413] }).count('userId'))
    //console.log(await this.mysql.model('users').where({ userId: ['>', 413] }).sum('userId'))
    //console.log(await this.mysql.model('users').where({ userId: ['>', 413] }).max('userId'))

    //----------------------------------------
    //  
    //----------------------------------------     
    
    
    
    const data1 = await this.mysql.builder()
    .sqlAdd('SELECT *')
    .sqlAdd(`FROM (select * from users where userId = ${userId}) AS u`)
    .sqlAdd('LEFT JOIN `category` AS `c` ON (u.categoryId=c.categoryId)')
    .sqlAdd('LEFT JOIN `subject` AS `s` ON (s.categoryId=c.categoryId)')
    .sqlQuery();
    console.log('<<<', data1.length);
    

    const data2 = await this.mysql.builder()
    .sqlAdd('SELECT *')
    //.sqlAdd('FROM (select * from users where userId = ? and name = ? and id in (?)) AS u', [userId, 'abcd', [1,2,3,4,5, 'a', 'b']])
    //.sqlAdd('FROM (select * from users where userId IN (?)) AS u', [[413,'414','415']])
    .sqlAdd('FROM (select * from users where userId > ? AND loginType IN (?)) AS u', [400, ['google','415']])
    //.sqlAdd('LEFT JOIN `category` AS `c` ON (u.categoryId=c.categoryId)')
    //.sqlAdd('LEFT JOIN `subject` AS `s` ON (s.categoryId=c.categoryId)')
    .sqlQuery();
    console.log('<<<', data2.length);

    const data1 = await this.mysql.builder()
    .sqlAdd('SELECT *')
    .sqlAdd(`FROM (select * from users where userId = ${userId}) AS u`)
    .sqlAdd('LEFT JOIN `category` AS `c` ON (u.categoryId=c.categoryId)')
    .sqlAdd('LEFT JOIN `subject` AS `s` ON (s.categoryId=c.categoryId)')
    .sqlQuery();
    console.log('<<<', data1);

    //----------------------------------------
    //  
    //----------------------------------------
    
    const conn = await this.mysql.getConnection();
    try {
      await conn.transaction();
  
      const data1 = await conn.builder()
      .sqlAdd('SELECT *')
      .sqlAdd(`FROM (select * from users where userId = ${userId}) AS u`)
      .sqlAdd('LEFT JOIN `category` AS `c` ON (u.categoryId=c.categoryId)')
      .sqlAdd('LEFT JOIN `subject` AS `s` ON (s.categoryId=c.categoryId)')
      .sqlQuery();
      //console.log('<<<', data1.length);

      const data2 = await conn.builder()
      .sqlAdd(`select * from users where userId = ${userId}`)
      .sqlQuery();
      console.log('<<<', data2.length);
      

      await conn.commit();
    } catch (e) {
      console.log(e)
      await conn.rollback();
    } finally {
      await conn.release();
    }
    */

    
    
    //const users = await this.mysql.query('SELECT * FROM ok_member WHERE email = ?', ['okcanvas@naver.com']);
    //console.log(users)

    //const data3 = await this.mysql.model('ok_test_1').where({ id: ['<', 10]}).having('id > 5').select();
    //console.log(data3)

    /*
    const data4 = await this.mysql.model('ok_test_1').addMany([
      {user: 999003, aa: 999},
      {user: 999001, aa: 999},
      {user: 999002, aa: 999},
      {user: 999004, aa: 999},
      {user: 999005, aa: 999}
    ]);
    console.log(data4)
    */

    //const data5 = await this.mysql.model('ok_test_1').where({ id: 100}).find();
    //console.log(data5 ? data5 : '자료가 없습니다')
    //const data6 = await this.mysql.model('ok_test_1').where({ id: -100}).find();
    //console.log(data6 ? data6 : '자료가 없습니다')

    /*
    * AES_ENCRYPT 암호화
    INSERT INTO 테이블명 VALUES (HEX(AES_ENCRYPT('문자열', '암호화 키')));
     
    * AES_DECRYPT 복호화
    SELECT AES_DECRYPT(UNHEX(필드명), '암호화 키') FROM 테이블명;
    */
    
    if (false) {
      for (let i=0; i<1; i++) {
        const aaa = await this.mysql.builder()
        .sqlAdd('INSERT INTO ok_test_1 (user, uuid) VALUES (')
        .sqlAdd('?,', [i])
        .sqlAdd('HEX(AES_ENCRYPT(?, ?))', ['시큐리티 시스템의 클래스와 인터페이스를 제공합니다', 'mbs123'])
        .sqlAdd(')')
        .sqlQuery();
        //console.log(aaa)
      }
      const bbb = await this.mysql.builder()
      .sqlAdd('SELECT CAST(AES_DECRYPT(UNHEX(uuid), ?) AS char(100)) AS uuid FROM ok_test_1 WHERE id <= 10000', ['mbs123'])
      .sqlQuery();
      //console.log(bbb)
    }

    if (false) {
      const data = await this.mysql.model('ok_test_1')
      .field('id, user, CAST(AES_DECRYPT(UNHEX(uuid), "mbs123") AS char(100)) AS uuid')
      .where({ id: 9999 })
      .select();
      console.log('<<<<<', data)
    }

    if (false) {
      const data = await this.mysql.builder()
      .sqlAdd('SELECT id, CAST(AES_DECRYPT(UNHEX(uuid), ?) AS char(100)) AS uuid,', ['mbs123'])
      .sqlAdd('CASE')
      .sqlAdd('WHEN id > 10020 THEN ?', ['FAIL'])
      .sqlAdd('ELSE ?', ['OK'])
      .sqlAdd('END AS QuantityText')
      .sqlAdd('FROM ok_test_1 WHERE id >= ?', [10018])
      .sqlQuery();
      //console.log('<<<<<', data)
    }

    if (false) {
      const data = await this.mysql.builder()
      .sqlAdd('SELECT *')
      .sqlAdd('FROM ok_test_1 WHERE id BETWEEN ? AND ?', [10, 20])
      .sqlAdd('UNION')
      .sqlAdd('SELECT *')
      .sqlAdd('FROM ok_test_1 WHERE id BETWEEN ? AND ?', [30, 40])
      .sqlQuery();
      console.log('<<<<<', data)
    }


    if (false) {
      await this.mysql.add('ok_test_1', {
        user: 999003, 
        aa: 999,
        uuid: this.mysql.helper.encrypt(new Date().toString(), 'mbs123')
      });
      await this.mysql.add('ok_test_1', {
        user: 999003, 
        aa: 999,
        uuid: this.mysql.helper.encrypt('010-4140-0278', 'mbs123')
      });
    }



    if (false) {
      const stime = new Date().getTime();
      const aaaa = await this.mysql.model('ok_test_1').limit(0, 1000).select();
      aaaa.forEach((row: any) => {
        row.uuid = this.mysql.helper.decrypt(row.uuid, 'mbs123')
      })
      console.log(aaaa)
      const etime = new Date().getTime();
      console.log('<<<<<<<<<<<<<<<<<<<<', aaaa.length, `Time: ${etime-stime}ms`)
    }

    if (false) {
      

      let sql = 'INSERT INTO `ok_test_1` (`user`,`aa`,`uuid`) VALUES '
      for (let i=1; i<=10000; i++) {
        sql += (i==1) ? `(${i},${i},HEX(AES_ENCRYPT('010-4140-0278', 'mbs123')))` : `,(${i},${i},HEX(AES_ENCRYPT('010-4140-0278', 'mbs123')))`
      }
      //console.log(sql)
      for (let i=1; i<=0; i++) {
        await this.mysql.query(sql)
      }


      const bbb = await this.mysql.builder()
      .sqlAdd('SELECT id, user')
      .sqlAdd(',CAST(AES_DECRYPT(UNHEX(uuid), ?) AS char(1000)) AS uuid', ['mbs123'])
      .sqlAdd(',CAST(AES_DECRYPT(UNHEX(uuid), ?) AS char(1000)) AS uuid1', ['mbs123'])
      .sqlAdd(',CAST(AES_DECRYPT(UNHEX(uuid), ?) AS char(1000)) AS uuid2', ['mbs123'])
      .sqlAdd(',CAST(AES_DECRYPT(UNHEX(uuid), ?) AS char(1000)) AS uuid3', ['mbs123'])
      .sqlAdd(',CAST(AES_DECRYPT(UNHEX(uuid), ?) AS char(1000)) AS uuid4', ['mbs123'])
      .sqlAdd(',SUBSTRING(createdAt,1,10) AS createdDate')
      .sqlAdd(',SUBSTRING(updatedAt,1,10) AS updatedDate')
      .sqlAdd('FROM ok_test_1 WHERE id <= ?', [100000])
      .sqlQuery();
      console.log(bbb.length)
      console.log(bbb[0])

      //INSERT INTO `ok_test_1` (`user`,`aa`,`uuid`) VALUES (2,1,'010-4140-0278'),(2,2,'010-4140-0278'),(2,3,'010-4140-0278'),(2,4,'010-4140-0278'),(2,5,'010-4140-0278')

      /*
      await this.mysql.add('ok_test_1',{
        user: 1,
        aa: 1,
        uuid: '010-4140-0278'
      })

      await this.mysql.addMany('ok_test_1', [
        {user: 2, aa: 1, uuid: '010-4140-0278'},
        {user: 2, aa: 2, uuid: '010-4140-0278'},
        {user: 2, aa: 3, uuid: '010-4140-0278'},
        {user: 2, aa: 4, uuid: '010-4140-0278'},
        {user: 2, aa: 5, uuid: '010-4140-0278'}
      ]);  
      
      
      await this.mysql.model('ok_test_1').add({
        user: 1,
        aa: 1,
        uuid: '010-4140-0278'
      })
      
      await this.mysql.model('ok_test_1').addMany([
        {user: 2, aa: 1, uuid: '010-4140-0278'},
        {user: 2, aa: 2, uuid: '010-4140-0278'},
        {user: 2, aa: 3, uuid: '010-4140-0278'},
        {user: 2, aa: 4, uuid: '010-4140-0278'},
        {user: 2, aa: 5, uuid: '010-4140-0278'}
      ]); 
      
      
      await this.mysql.update('ok_test_1', {id: 240067}, {
        user: 1,
        aa: 1,
        uuid: '999-4140-0278'
      })
      await this.mysql.model('ok_test_1').where({id: 240067}).update({
        user: 1,
        aa: 1,
        uuid: '999-4140-0278'
      })
      */
      
      var data = await this.mysql.select('ok_test_1', { id: ['=', 0]});
      for (let i = 0; i < data.length; i++) {
        data[i]['uuid'] = this.mysql.helper.decrypt(data[i]['uuid'], 'mbs123')
      }
      console.log(data)

      //var data = await this.mysql.model('ok_test_1').where({ id: ['>=', 240067]}).select();
      //console.log(data)

      //var data = await this.mysql.query('SELECT * FROM ok_test_1 WHERE id >= ?', [240067]);
      //console.log(data)
    }

    /*
    var password = "12"
    var encrypted = this.mysql.helper.encrypt(password, 'mbs123')
    var decrypted = this.mysql.helper.decrypt(encrypted, 'mbs123')

    console.log('Original: ' + password)
    console.log('Encrypted: ' + encrypted)
    console.log('Decrypted: ' + decrypted)


    var password = "SecretKey 를 사용하고 있는 패키지. java.security, 시큐리티 시스템의 클래스와 인터페이스를 제공합니다. javax.crypto, 암호화 조작의 클래스와 인터페이스를 제공"
    var encrypted = this.mysql.helper.encrypt(password)
    var decrypted = this.mysql.helper.decrypt(encrypted)
    
    console.log('Original: ' + password)
    console.log('Encrypted: ' + encrypted)
    console.log('Decrypted: ' + decrypted)
    */

    


    //=======================
    //  코드생성 예제
    //=======================
    if (false) {
      var codeId = '';
      var user = 'wonsig'
      var uuid = '010-4140-0278';
      var uuid = new Date().toString()

      for (let i=0; i< 10; i++) {
        const connB = await this.mysql.getConnection();
        try {
          await connB.transaction();

          await connB.query('LOCK TABLES ok_test_1 WRITE');
          //
          var data = await connB.query("SELECT SUBSTRING(IFNULL(MAX(codeId),'M00000'),2,5)+1 AS newId FROM ok_test_1");
          if (data.length > 0) {
            const newId = String(data[0].newId);
            codeId = `M${newId.padStart(5, '0')}`;
            console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<',codeId)

            var sql = await connB.builder()
            .sqlAdd('INSERT INTO ok_test_1 (codeId, user, uuid) VALUES (?,?,HEX(AES_ENCRYPT(?, ?)))', [codeId, user, uuid, 'mbs123'])
            .sqlQuery();
          console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<',sql)
          }
          //
          await connB.query('UNLOCK TABLES');

          await connB.commit();
        } catch (e) {
          console.log(e)
          await connB.rollback();
        } finally {
          await connB.release();
        }
      }
    }



    const manyData = [];
    if (false) {
      
      for (let i=0; i<1000; i++) {
        manyData.push({user: i, aa: 999, uuid: this.mysql.helper.encrypt('안녕하세요', 'mbs123')})
      }
      //const data5 = await this.mysql.model('ok_test_1').addMany(manyData);
      //console.log(data5)

      /*
      const rand_0_99 = Math.floor(Math.random() * 100); 
      for (let i=0; i<10; i++) {
        //const insertId = await this.mysql.add('ok_test_1', {user: i, aa: rand_0_99});

        //const insertId = await this.mysql.addlock('ok_test', {user: i, aa: rand_0_99});
        //console.log('<<< insertId', insertId)


        //await this.mysql.query('LOCK TABLES ok_test WRITE');
        //const insertId = await this.mysql.add('ok_test', {user: i, aa: rand_0_99});
        //await this.mysql.query('UNLOCK TABLES');
        //console.log('<<< insertId', insertId)
      }
      */
    }

    if (false) {
      const connA = await this.mysql.getConnection();
      try {
        await connA.transaction();

        for (let i=0; i<10; i++) {
          const data5 = await connA.model('ok_test_1').addMany(manyData);


          //await connA.model('ok_test_1').add({user: i, aa: rand_0_99});
          //await connA.model('ok_test').addlock({user: i, aa: rand_0_99});
          /*
          try {
            await connA.query('LOCK TABLES ok_test WRITE');
            await connA.model('ok_test').add({ user: i});
          } finally {  
            await connA.query('UNLOCK TABLES');
          }
          */
        }

        await connA.commit();
      } catch (e) {
        console.log(e)
        await connA.rollback();
      } finally {
        await connA.release();
      }
    }


    return {
      message: 'data',
    };
  }

  //===========================================================================
  //
  //===========================================================================
  getHello(): { message: string } {
    const msg = _lib.getMonthRang(new Date())
    console.log(msg)

    return {
      message: 'Hello Boksaeng!',
    };
  }

  //===========================================================================
  //
  //===========================================================================
  async getTest(data: any) {
    console.log(join(__dirname, '..', 'views/pages/home.ejs'))
    //const content = await renderFile(join(__dirname, '..', 'views/pages/home.ejs'), data);
  }

  //
  async doContentTree() {
    const conn = await this.mysql.getConnection();
    try {
      const contents = await conn.model('content').where({ isUpdate: 1 }).select();
      for (const content of contents) {
        const contentUnits = await conn.model('content_unit').where({ contentId: content.contentId }).select();
        const resultUnits = [];
        const aList = contentUnits.filter((e: any) => e.parentUnitId === 0);
        aList.map((aNode: any) => {
          aNode.depth = 0;
          aNode.depthName = (aNode.type === 'none') ? '대목차' : '문제';
          aNode.depthMap = {0: { contentUnitId: aNode.contentUnitId, unitName: aNode.unitName }};
          resultUnits.push(aNode);
          const bList = contentUnits.filter((e: any) => e.parentUnitId === aNode.contentUnitId);
          aNode.hasChildren = bList.length > 0;
          bList.map((bNode: any) => {
            bNode.depth = 1;
            bNode.depthName = (bNode.type === 'none') ? '중목차' : '문제';
            bNode.depthMap = {...aNode.depthMap, 1: { contentUnitId: bNode.contentUnitId, unitName: bNode.unitName }};
            resultUnits.push(bNode);
            const cList = contentUnits.filter((e: any) => e.parentUnitId === bNode.contentUnitId);
            bNode.hasChildren = cList.length > 0;
            cList.map((cNode: any) => {
              cNode.depth = 2;
              cNode.depthName = (cNode.type === 'none') ? '소목차' : '문제';
              cNode.depthMap = {...bNode.depthMap, 2: { contentUnitId: cNode.contentUnitId, unitName: cNode.unitName }};
              resultUnits.push(cNode);
              const dList = contentUnits.filter((e: any) => e.parentUnitId === cNode.contentUnitId);
              cNode.hasChildren = dList.length > 0;
              dList.map((dNode: any) => {
                dNode.depth = 3;
                dNode.depthName = (dNode.type === 'none') ? '' : '문제';
                dNode.depthMap = {...cNode.depthMap, 3: { contentUnitId: dNode.contentUnitId, unitName: dNode.unitName }};
                resultUnits.push(dNode);
              });
            });
          });
        });
    
        for (const unit of resultUnits) {
          await conn.model('content_unit')
          .where({ contentUnitId: unit.contentUnitId })
          .update({
            depth: unit.depth,
            depthName: unit.depthName,
            depthMap: JSON.stringify(unit.depthMap),
          });
        }
        //
        await conn.model('content').where({ contentId: content.contentId }).update({ isUpdate: 0 });
      }
    } catch (e) {
      //
    } finally {
      await conn.release();
    }
  }



  
  //===========================================================================
  //
  //===========================================================================
  async player(key: string, width: number, height: number, logData: any) {
    const posterList = await this.mysql.query('SELECT * FROM leadwin_poster WHERE isEnable = 1');
    const posterUrl = (posterList.length > 0) 
      ? posterList[Math.floor(Math.random() * posterList.length)].url 
      : '';

    const adsList = await this.mysql.query('SELECT * FROM leadwin_ads WHERE isEnable = 1');
    const adsUrl = (adsList.length > 0) 
      ? adsList[Math.floor(Math.random() * adsList.length)].url 
      : '';

    //  로그기족
    //this.mysql.add('leadwin_log_play', logData);


    return { 
      //mediaUrl: `https://objectstorage.kr-central-1.kakaoi.io/v1/f4eb3ad7c6cf4c2982d7def1d3345065/lecture-video/${key}/original.m3u8`,
      mediaUrl: `https://37ac059572c941a9aa0b09c00616ecec.kakaoiedge.com/${key}/original.m3u8`,
      posterUrl: posterUrl,
      adsUrl: adsUrl,
      width: (width && width > 0) ? width : 900,
      height: (height && height > 0) ? height : 600,
    }; 
  }

  //===========================================================================
  //
  //===========================================================================
  async sample(key: string, width: number, height: number) {
    return { 
      //mediaUrl: `https://objectstorage.kr-central-1.kakaoi.io/v1/f4eb3ad7c6cf4c2982d7def1d3345065/lecture-video/${key}/original.m3u8`,
      mediaUrl: `https://37ac059572c941a9aa0b09c00616ecec.kakaoiedge.com/${key}/original.m3u8`,
      width: (width && width > 0) ? width : 320,
      height: (height && height > 0) ? height : 220,
    }; 
  }
  
  
}


