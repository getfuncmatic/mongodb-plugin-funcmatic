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
    context[this.name] = db
    return { event, context }
  }
  
  async response(event, context, res) {
    if (!this.cache) {
      await this.disconnectFromDatabase()
    }
    return res 
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
    if (!this.cachedDb) return 
    await this.cachedDb.close()
  }
}

module.exports = new MongoDBPlugin()