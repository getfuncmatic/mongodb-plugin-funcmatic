var MongoClient = require('mongodb').MongoClient

class MongoDBPlugin {
  
  constructor() {
    this.name = 'mongodb'
    this.cachedDb = null
    this.cache = false
  }
  
  async start(conf) {
    this.name == conf.name || this.name
    this.conf = conf
    this.uri = conf.uri
    this.cache = conf.cache 
  }
  
  async request(event, context) {
    var db = await this.connectToDatabase()
    var service = db
    return { service }
  }
  
  async end(options) {
    if (!this.cache || options.teardown) {
      await this.disconnectFromDatabase()
    }
  }
  
  async connectToDatabase() {
    if (this.cache && this.cachedDb && this.cachedDb.isConnected()) {
      console.log("MongoDBPlugin: using cached connection")
      return this.cachedDb.db()
    }
    var options = this.conf.options || { }
    var t1 = (new Date()).getTime()
    var client = await MongoClient.connect(this.uri, options)
    var t2 = (new Date()).getTime()
    console.log(`MongoDBPlugin: established new connection (${t2-t1} ms)`)
    this.cachedDb = client
    return this.cachedDb.db()
  }

  async disconnectFromDatabase() {
    if (this.cachedDb) {
      await this.cachedDb.close()
      console.log("MongoDBPlugin: closing connection")
    }
  }
}

module.exports = MongoDBPlugin