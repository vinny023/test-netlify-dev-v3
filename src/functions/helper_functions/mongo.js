const MongoClient = require('mongodb').MongoClient;
const mongo_uri = process.env.MONGO_CLIENT_URI || 'mongodb+srv://truffle_client:qUP5La8Dj9OjIESD@cluster0.uwtbq.mongodb.net/Truffle?retryWrites=true&w=majority'
console.log(mongo_uri)


exports.orders = async(action,payload) => {
    //check if order already exists?
   
    try {
      const client = new MongoClient(mongo_uri, { useNewUrlParser: true, useUnifiedTopology: true });

        await client.connect()
        let orders = client.db("Truffle").collection('Orders');

        switch (action) {
            case 'saveNewOrder':
                const insertRes = await orders.insertOne(payload.order)
                // if (payload.close) { client.close() }
                return ((insertRes.insertedCount === 1) ? {success:'success'} : {error: {stack: insertRes}})
     
            case 'updateOrder':
                const updateRes = await orders.updateOne(payload.filter, {'$set': payload.update})
                // if (payload.close) { client.close() }
                return ((updateRes.modifiedCount === 1) ? {success:'success'} : {error: {stack: updateRes}})

            case 'updateManyNoCheck':
                return await orders.updateMany(payload.filter, {'$set': payload.update})
                // if (payload.close) { client.close() }          
        }    
        client.close()
    }
    catch (error) {
      client.close()
      return {error:error}
    }
}


//PULL USER-SPECIFIC PRODUCT DATA FOR ALGOLIA PRODUCT QUERY
exports.pullMetadata = async(skuList, accountId, hits, sortQuery, filterQuery) => {
  
  try {
    const client = new MongoClient(mongo_uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect()
    let metadata = client.db("Truffle").collection(accountId+'-metadata');

    //SORT PRICES BY ORDER OF INPUT SKU LIST OR BY SORT TERM
    let mongoquery = [];        
    
    if (!filterQuery) {
      mongoquery = [{$match: {sku: {$in: skuList}}}]
    } else {
      mongoquery = [{$match: {$and:[{sku: {$in: skuList}}, ...filterQuery]}}]
    }

    mongoquery.push({$addFields: {"__skuList": {$indexOfArray: [skuList, "$sku" ]}}})

    if (!sortQuery) {
      mongoquery.push({$sort: {"__skuList": 1}})
    } else {
      // field = sortQuery.field
      // if (sortQuery.direction === 'ascending') {direction = 1}
      // else {direction = -1}
      // mongoSort = {}
      // mongoSort[field] = direction
      mongoquery.push({$sort: {...sortQuery, "__skuList":1}})
    }

    console.log(mongoquery)

    const metadataCont = await metadata.aggregate(mongoquery).toArray()
    client.close()

    //ADD IN ORIGINAL PRODUCT DATA TO SORTED LIST AND REMOVE FROM ORIGINAL HITS
     combinedData = metadataCont.map(meta => {
      const product = hits[meta.__skuList]
      hits.splice(meta.__skuList, 1)
      return {...meta, ...product}
     } )

    //APPEND REMAINDER OF HITS WITHOUT METADATA TO THE BOTTOM OF THE LIST?
    return {'metadata':[...combinedData, ...hits]}
  }
  catch (err) {
    client.close()
    return {'error':err}
  }
}