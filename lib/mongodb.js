var MongoClient = require('mongodb').MongoClient

class MongoDBService {

  constructor(options) {
    this.uri = options.uri
    this.client = null
  }

  async connect() {
    if (this.client) {
      console.log("MongoDBPlugin: using cached connection")
      return this.client.db()
    }
    var t1 = (new Date()).getTime()
    this.client = await MongoClient.connect(this.uri)
    var t2 = (new Date()).getTime()
    console.log(`MongoDBPlugin: established new connection (${t2-t1} ms)`)
    return this.client.db()
  }

  isConnected() {
    return this.client && this.client.isConnected()
  }

  async close() {
    if (this.client) {
      await this.client.close()
      this.client = null
      console.log("MongoDBPlugin: closing connection")
    }
  }
}

class MongoDBPlugin {
  
  constructor() {
    this.name = 'mongodb'
    this.cachedDb = null
  }
  
  async start(conf, env) {
    this.name == conf.name || this.name
    this.uri = conf.uri || env.MONGODB_URI
    if ('cache' in conf) {  // conf.cache could equal false
      this.cache = conf.cache
    } else {
      this.cache =  (env.MONGODB_CACHE_CONNECTION && env.MONGODB_CACHE_CONNECTION == 'true') || false
    }
    this.service = new MongoDBService({ uri: this.uri })
  }
  
  async request(event, context) {
    return { service: this.service }
  }
  
  async end(options) {
    if (!this.cache || options.teardown) {
      await this.service.close()
    }
  }
  
  // async connectToDatabase() {
  //   if (this.cache && this.cachedDb && this.cachedDb.isConnected()) {
  //     console.log("MongoDBPlugin: using cached connection")
  //     return this.cachedDb.db()
  //   }
  //   var options = this.conf.options || { }
  //   var t1 = (new Date()).getTime()
  //   var client = await MongoClient.connect(this.uri, options)
  //   var t2 = (new Date()).getTime()
  //   console.log(`MongoDBPlugin: established new connection (${t2-t1} ms)`)
  //   this.cachedDb = client
  //   return this.cachedDb.db()
  // }

  // async disconnectFromDatabase() {
  //   if (this.cachedDb) {
  //     await this.cachedDb.close()
  //     console.log("MongoDBPlugin: closing connection")
  //   }
  // }
}

module.exports = MongoDBPlugin