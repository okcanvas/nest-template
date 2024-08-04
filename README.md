# nest template

## database
- mysql
- postgresql
- mongodb

## custom orm + sql builder
- mysql
- postgresql

```
await connB.model('test').add({ name: '21432423432432' })
await connB.model('test').where({ id: 20 }).select()
await connB.model('test').where({ id: 20 }).find()
await connB.model('test').where({ id: 20 }).update({ name: '21432423432432' })
await connB.model('test').where({ id: 20 }).delete()
```


