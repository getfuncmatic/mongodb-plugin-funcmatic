require('dotenv').config()
var funcmatic = require('@funcmatic/funcmatic')
var MongoDBPlugin = require('../lib/mongodb')

describe('Request', () => {
  beforeEach(() => {
    funcmatic.clear()
    funcmatic = funcmatic.clone()
  })
  afterEach(async () => {
    await funcmatic.teardown()
  })
  it ('should get an uncached connection', async () => {
    funcmatic.use(MongoDBPlugin, { uri: process.env.MONGODB_URI, cache: false })
    var plugin = funcmatic.getPlugin('mongodb')

    var event = { }
    var context = { }
    await funcmatic.invoke(event, context, async(event, context, { mongodb }) => {
      expect(mongodb).toBeTruthy()
      var db = await mongodb.connect()
      expect(await db.stats()).toMatchObject({    
        db: 'test',
        ok: 1
      })
    })
    expect(plugin.service.isConnected()).toBeFalsy()
  })

  it ('should get an cached connection', async () => {
    funcmatic.use(MongoDBPlugin, { uri: process.env.MONGODB_URI, cache: true })
    var plugin = funcmatic.getPlugin('mongodb')
    var event = { }
    var context = { }
    await funcmatic.invoke(event, context, async (event, context, { mongodb }) => {
      expect(mongodb).toBeTruthy()
      var db = await mongodb.connect()
      expect(await db.stats()).toMatchObject({
        db: 'test',
        ok: 1
      })
    })
    await funcmatic.invoke(event, context, async (event, context, { mongodb }) => {
      expect(mongodb).toBeTruthy()
      var db = await mongodb.connect()
      expect(await db.stats()).toMatchObject({
        db: 'test',
        ok: 1
      })
    })
    expect(plugin.service.isConnected()).toBeTruthy()
  })
}) 