const algoliasearch = require('algoliasearch');
const MongoClient = require('mongodb').MongoClient;

//ENV VARIABLES
const algolia_search_api_key = '7fee6e06a5cb7c4491a1c1e9fcfd8d9d' //NEED TO USE THIS IN APP FOR PERSONALIZATION...
const algolia_api_key = '1fff7f94e6d0d8f4e40e466920e98488' 
const algolia_app_name = '33BEDS6295'
const products_index = 'dev_Products'
const mongo_client_uri = "mongodb+srv://truffle_client:qUP5La8Dj9OjIESD@cluster0.uwtbq.mongodb.net/Truffle?retryWrites=true&w=majority"


const restaurantKey = 'arvindsdeli'

const algolia_client = algoliasearch(algolia_app_name, algolia_api_key);
const index = algolia_client.initIndex(products_index);

const client = new MongoClient(mongo_client_uri, { useNewUrlParser: true, useUnifiedTopology: true });

const pull_metadata = async(skuList) => {
  try {
    await client.connect()
    console.log('connected to MongoDB')
    let metadata = client.db("Truffle").collection(restaurantKey+'-metadata');

    //SORT PRICES BY ORDER OF INPUT SKU LIST
    const mongoquery = [
      {$match: {sku: {$in: skuList}}},
      {$addFields: {"__skuList": {$indexOfArray: [skuList, "$sku" ]}}},
      {$sort: {"__skuList": 1}}
     ];

    // priceList = await price_data.find({'sku': {'$in':skuList}}).toArray()
    const metadataCont = await metadata.aggregate(mongoquery).toArray()
    client.close()
    return {'metadata':metadataCont, 'error': 'none'}
  }
  catch (err) {
    client.close()
    console.log(err)
    return {'error':err}
  }
}


const getProductsAndPrices = async(query) => {

  const startTime = new Date();

    //SEARCH QUERY
    const {hits, nbPages} = await index.search(query)
    const AlgoliaTime = new Date();

    //CREATE METADATA QUERY ARRAY
    const skuList = hits.map(hit => hit.sku)
     
    //PULL METADATA
    const {metadata,error} = await pull_metadata(skuList)

    const MongoTime = new Date();

    console.log('AlgoliaTime:'+(AlgoliaTime-startTime))
    console.log('MongoTime:'+(MongoTime-AlgoliaTime))
    console.log('TotalTime:'+(MongoTime-startTime))  

    return {products: hits, metadata: metadata, nbPages: nbPages}     

}

getProductsAndPrices('chicken').then(val => {
  console.log(val.metadata)  
})



//auto suggestions

