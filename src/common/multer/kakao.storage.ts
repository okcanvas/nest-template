var crypto = require('crypto')
var stream = require('stream')
var fileType = require('file-type')
var htmlCommentRegex = require('html-comment-regex')
var parallel = require('run-parallel')
var axios = require('axios')



function staticValue (value: any) {
  return function (req: any, file: any, cb: any) {
    cb(null, value)
  }
}

var defaultContentType = staticValue('application/octet-stream')
var defaultMetadata = staticValue(undefined)
var defaultContentDisposition = staticValue(null)

// Regular expression to detect svg file content, inspired by: https://github.com/sindresorhus/is-svg/blob/master/index.js
// It is not always possible to check for an end tag if a file is very big. The firstChunk, see below, might not be the entire file.
var svgRegex = /^\s*(?:<\?xml[^>]*>\s*)?(?:<!doctype svg[^>]*>\s*)?<svg[^>]*>/i

function isSvg (svg: any) {
  // Remove DTD entities
  svg = svg.replace(/\s*<!Entity\s+\S*\s*(?:"|')[^"]+(?:"|')\s*>/img, '')
  // Remove DTD markup declarations
  svg = svg.replace(/\[?(?:\s*<![A-Z]+[^>]*>\s*)*\]?/g, '')
  // Remove HTML comments
  svg = svg.replace(htmlCommentRegex, '')

  return svgRegex.test(svg)
}

function defaultKey (req: any, file: any, cb: any) {
  crypto.randomBytes(16, function (err: any, raw: any) {
    cb(err, err ? undefined : raw.toString('hex'))
  })
}

function autoContentType (req: any, file: any, cb: any) {
  file.stream.once('data', function (firstChunk: any) {
    var type = fileType(firstChunk)
    var mime = 'application/octet-stream' // default type

    // Make sure to check xml-extension for svg files.
    if ((!type || type.ext === 'xml') && isSvg(firstChunk.toString())) {
      mime = 'image/svg+xml'
    } else if (type) {
      mime = type.mime
    }

    var outStream = new stream.PassThrough()

    outStream.write(firstChunk)
    file.stream.pipe(outStream)

    cb(null, mime, outStream)
  })
}

function collect (storage: any, req: any, file: any, cb: any) {
  parallel([
    storage.getAccessKey.bind(storage, req, file),
    storage.getAccessSecret.bind(storage, req, file),
    storage.getAccount.bind(storage, req, file),
    storage.getBucket.bind(storage, req, file),
    storage.getKey.bind(storage, req, file),
    storage.getMetadata.bind(storage, req, file),
    storage.getContentDisposition.bind(storage, req, file),
  ], function (err: any, values: any) {
    if (err) return cb(err)

    storage.getContentType(req, file, function (err: any, contentType: any, replacementStream: any) {
      if (err) return cb(err)

      cb.call(storage, null, {
        accessKey: values[0],
        accessSecret: values[1],
        account: values[2],
        bucket: values[3],
        key: values[4],
        metadata: values[5],
        contentDisposition: values[6],
        contentType: contentType,
        replacementStream: replacementStream,
      })
    })
  })
}

function getToken (opts: any, cb: any) {
  const options = {
    method: 'POST',
    url: 'https://iam.kakaoi.io/identity/v3/auth/tokens',
    data: {
      "auth": {
        "identity": {
          "methods": [
            "application_credential"
          ],
          "application_credential": {
            "id": opts.accessKey,
            "secret": opts.accessSecret
          }
        }
      }
    }
  };

  const stime = Date.now();
  axios(options).then((resKey: any) => {
    console.log('getToken  ========================', (Date.now() - stime))
    if (resKey.status === 200 || resKey.status === 201) {
      const accessToken = resKey.headers['x-subject-token'];
      cb(null, accessToken)
    }
  }).catch((e: any) => {
    console.log(e)
    //throw e;
    cb(e);
  });
}

function upload (accessToken: any, opts: any, cb: any) {
  const url = `https://objectstorage.kr-central-1.kakaoi.io/v1/${opts.account}/${opts.bucket}/${opts.key}`;
  const options = {
    method: 'PUT',
    url: url,
    headers: {
      'x-auth-token': accessToken,
      'Content-Type': opts.contentType,
    },
    data: opts.replacementStream
  };

  const stime = Date.now();
  axios(options).then((res: any) => {
    console.log('upload  ========================', (Date.now() - stime),  res?.request?._redirectable?._requestBodyLength || 0)
    if (res.status === 200 || res.status === 201) {
      cb(null, {
        location: url,
        filename: opts.key,
        contentType: opts.contentType,
        size: res?.request?._redirectable?._requestBodyLength || 0,
        key: opts.key,
      })
    }

  }).catch((e: any) => {
    console.log(e?.response?.status, e?.response?.statusText)
    cb(e)
  });
}




function BucketStorage (opts: any) {
  var accessToken = null;
  var lastTime = Date.now();

  switch (typeof opts.accessKey) {
    case 'function': this.getAccessKey = opts.accessKey; break
    case 'string': this.getAccessKey = staticValue(opts.accessKey); break
    case 'undefined': throw new Error('accessKey is required')
    default: throw new TypeError('Expected opts.accessKey to be undefined, string or function')
  }

  switch (typeof opts.accessSecret) {
    case 'function': this.getAccessSecret = opts.accessSecret; break
    case 'string': this.getAccessSecret = staticValue(opts.accessSecret); break
    case 'undefined': throw new Error('accessSecret is required')
    default: throw new TypeError('Expected opts.accessSecret to be undefined, string or function')
  }

  switch (typeof opts.account) {
    case 'function': this.getAccount = opts.account; break
    case 'string': this.getAccount = staticValue(opts.account); break
    case 'undefined': throw new Error('account is required')
    default: throw new TypeError('Expected opts.account to be undefined, string or function')
  }

  switch (typeof opts.bucket) {
    case 'function': this.getBucket = opts.bucket; break
    case 'string': this.getBucket = staticValue(opts.bucket); break
    case 'undefined': throw new Error('bucket is required')
    default: throw new TypeError('Expected opts.bucket to be undefined, string or function')
  }

  switch (typeof opts.key) {
    case 'function': this.getKey = opts.key; break
    case 'undefined': this.getKey = defaultKey; break
    default: throw new TypeError('Expected opts.key to be undefined or function')
  }

  switch (typeof opts.contentType) {
    case 'function': this.getContentType = opts.contentType; break
    case 'undefined': this.getContentType = defaultContentType; break
    default: throw new TypeError('Expected opts.contentType to be undefined or function')
  }

  switch (typeof opts.metadata) {
    case 'function': this.getMetadata = opts.metadata; break
    case 'undefined': this.getMetadata = defaultMetadata; break
    default: throw new TypeError('Expected opts.metadata to be undefined or function')
  }

  switch (typeof opts.contentDisposition) {
    case 'function': this.getContentDisposition = opts.contentDisposition; break
    case 'string': this.getContentDisposition = staticValue(opts.contentDisposition); break
    case 'undefined': this.getContentDisposition = defaultContentDisposition; break
    default: throw new TypeError('Expected opts.contentDisposition to be undefined, string or function')
  }

}

BucketStorage.prototype._handleFile = function (req: any, file: any, cb: any) {
  let self = this;

  collect(this, req, file, function (err: any, opts: any) {
    if (err) return cb(err)

    //  token 없는 경우 / token 이 6시간 이상된 경우
    if (!self.accessToken || (Date.now() - self.lastTime) > (1000 * 60 * 60 * 6)) {
      getToken(opts, function (err: any, token: any) {
        if (err) {
          self.accessToken = null;
          return cb(err);
        }

        self.accessToken = token;
        self.lastTime = Date.now();

        upload(self.accessToken, opts,  function (err: any, res: any) {
          if (err) {
            self.accessToken = null;
            return cb(err);
          }
          cb(null, res)
        })
      })
    } 
    // token이 유효한 경우
    else {
      console.log('has accessToken  ========================')

      upload(self.accessToken, opts,  function (err: any, res: any) {
        if (err) {
          self.accessToken = null;
          return cb(err);
        }
        cb(null, res)
      }) 
    }
  })
}
/*
BucketStorage.prototype._removeFile = function (req, file, cb) {
  this.s3.send(
    new DeleteObjectCommand({
      Bucket: file.bucket,
      Key: file.key
    }),
    cb
  )
}
*/

/*
module.exports = function (opts: any) {
  //console.log('######################### CREATE')
  return new KakaoStorage(opts)
}

module.exports.AUTO_CONTENT_TYPE = autoContentType
module.exports.DEFAULT_CONTENT_TYPE = defaultContentType
*/


export const KakaoBucketStorage = BucketStorage;
export const AUTO_CONTENT_TYPE = autoContentType;
export const DEFAULT_CONTENT_TYPE = defaultContentType;
