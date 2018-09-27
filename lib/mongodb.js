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
    console.log("end", this.cache, options)
    if (!this.cache || options.teardown) {
      await this.disconnectFromDatabase()
    }
  }
  
  async connectToDatabase() {
    if (this.cache && this.cachedDb && this.cachedDb.isConnected()) {
      return this.cachedDb.db()
    }
    var options = this.conf.options || { }
    var client = await MongoClient.connect(this.uri, options)
    this.cachedDb = client
    return this.cachedDb.db()
  }

  async disconnectFromDatabase() {
    if (this.cachedDb) {
      await this.cachedDb.close()
    }
  }
}

module.exports = MongoDBPlugin