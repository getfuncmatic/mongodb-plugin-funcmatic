var Funcmatic = require('@funcmatic/funcmatic')
var MongoDBPlugin = require('../lib/mongodb')

var handler = Funcmatic.wrap(async (event, context, { mongodb }) => {
  var stats = await mongodb.stats()
  return {
    statusCode: 200,
    stats
  }    
})

describe('Request', () => {
  beforeEach(() => {
    Funcmatic.clear()
  })
  it ('should get an uncached connection', async () => {
    Funcmatic.use(MongoDBPlugin, { uri: process.env.MONGODB_URI, cache: false })
    var event = { }
    var context = { }
    var ret = await handler(event, context)
    expect(ret).toMatchObject({
      stats: {
        db: 'test',
        ok: 1
      }
    })
    expect(MongoDBPlugin.cachedDb.isConnected()).toBeFalsy()
  })
  it ('should get an cached connection', async () => {
    Funcmatic.use(MongoDBPlugin, { uri: process.env.MONGODB_URI, cache: true })
    var event = { }
    var context = { }
    var ret = await handler(event, context)
    console.log("RET", ret)
    expect(MongoDBPlugin.cachedDb).toBeTruthy()
    expect(MongoDBPlugin.cachedDb.isConnected()).toBeTruthy()
    await MongoDBPlugin.cachedDb.close()
  })
}) 