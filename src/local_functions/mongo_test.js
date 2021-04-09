const MongoClient = require('mongodb').MongoClient;
const mongo_uri = process.env.MONGO_CLIENT_URI || 'mongodb+srv://truffle_client:qUP5La8Dj9OjIESD@cluster0.uwtbq.mongodb.net/Truffle?retryWrites=true&w=majority'
console.log(mongo_uri)



const skuList = [ 'woolco-208301', 'us_foods-208250', 'us_foods-150' ]
let mongoquery = [{$match: {sku: {$in: skuList}}}]

mongoquery.push({$addFields: {"__skuList": {$indexOfArray: [skuList, "$sku" ]}}})

const client = new MongoClient(mongo_uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect().then(() => {
  return client.db("Truffle").collection('arvindsdeli-metadata');
}).then(metadata => {
  metadata.aggregate(mongoquery).toArray().then(output => {
    console.log(output)
  }).then(() => {
    client.close()
  })
})




