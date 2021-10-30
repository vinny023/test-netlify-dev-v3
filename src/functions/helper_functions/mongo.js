const MongoClient = require('mongodb').MongoClient;
const sentry = require('./sentry')

const mongo_uri = process.env.MONGO_CLIENT_URI
console.log(mongo_uri)


exports.suppliers = async(action, payload) => {
  
  const Sentry = await sentry.initSentry() 

  try {

  const client = new MongoClient(mongo_uri, { useNewUrlParser: true, useUnifiedTopology: true });

  await client.connect()
  let supplierDb = client.db(process.env.MONGO_DB).collection('Suppliers');
  
  try {
  switch (action) {
    case 'getCartSuppliers':      
        const {supplierList} = payload
        const mongoquery = [{$match: {id: {$in: supplierList}}}]
        mongoquery.push({$addFields: {"__originalOrder": {$indexOfArray: [supplierList, "$id" ]}}})
        mongoquery.push({$sort: {"__originalOrder": 1}})      
        const suppliers = await supplierDb.aggregate(mongoquery).toArray()
        client.close()
        return suppliers
        
 
      }
    }
    catch (error) {
      if (!Sentry.error) {
        Sentry.captureException('Mongo Suppliers Post Connection Error - '+error)
    }  
      client.close()
      return {'error':error}
  }
  } catch(error) {
    if (!Sentry.error) {
      Sentry.captureException('Mongo Suppliers Pre Connection Error - '+error)
  } 
      return {error: error}
  }
}

exports.accounts = async(action, payload) => {

  const Sentry = await sentry.initSentry() 

  try {
    const client = new MongoClient(mongo_uri, { useNewUrlParser: true, useUnifiedTopology: true });

      await client.connect()
      let accounts = client.db(process.env.MONGO_DB).collection('Accounts');

      switch (action) {            
        case 'getAccount':
          return await accounts.find(payload.query).toArray() 
        case 'updateOrderGuide':
          return await accounts.updateOne(payload.query, {$addToSet: { orderGuide: {$each: payload.skuList}}})
        case 'setAccount':
          return await accounts.updateOne({id: payload.id}, {"$set": payload.update})
      }
      client.close()

    } catch(error) {
      console.log(error)
      if (!Sentry.error) {
        Sentry.captureException('Mongo Accounts Error - '+error)
    }  
      return {error:error}
    }
        
}


exports.orders = async(action,payload) => {
    //check if order already exists?

    const Sentry = await sentry.initSentry() 
   
    try {
      const client = new MongoClient(mongo_uri, { useNewUrlParser: true, useUnifiedTopology: true });

        await client.connect()
        let orders = client.db(process.env.MONGO_DB).collection('Orders');

        switch (action) {            
            case 'setOrder' :
              const response = await orders.updateOne({id: payload.id}, {"$set": payload.update})                 
              return (response.result.n === 1) ? response : {error: {stack: response}}
              
            case 'getOrder':              
              return await orders.find(payload.query).sort(payload.sort).limit(10).toArray()  
            case 'saveNewOrder':
                const insertRes = await orders.insertOne(payload.order)
                // if (payload.close) { client.close() }
                return ((insertRes.insertedCount === 1) ? {success:'success'} : {error: {stack: insertRes}})
     
            case 'updateOrder':
                return await orders.updateOne(payload.filter, {'$set': payload.update})
                // if (payload.close) { client.close() }
                // return ((updateRes.modifiedCount === 1) ? {success:'success'} : {error: {stack: updateRes}})

            case 'updateManyNoCheck':
                return await orders.updateMany(payload.filter, {'$set': payload.update})
                // if (payload.close) { client.close() }          
        }    
        client.close()
    }
    catch (error) {
      // if (client) {
      //   client.close()
      // }'
      if (!Sentry.error) {
        Sentry.captureException('Mongo Orders Error - '+error)
    }  
      console.log(error)
      return {error:error}
    }
}

exports.accountMetadata = async(action, payload) => {
  

  const Sentry = await sentry.initSentry() 
  
  try {

      const client = new MongoClient(mongo_uri, { useNewUrlParser: true, useUnifiedTopology: true });

      await client.connect()
      let accountMetadata = client.db(process.env.MONGO_DB).collection(payload.accountId+'-metadata');

      switch (action) {            
        case 'markRecentlyOrdered' :            
        const date = new Date()
        // console.log('PAYLOAD')
        // console.log(payload)
        const updateParam = payload.cart.map(item => {
          // console.log('MAP ITEM'  );
          // console.log(item);
          delete item['quantity']          
          delete item['objectID']  
          delete item['_id']                 
          return {"updateOne" : 
                        {"filter": {"sku": {'$eq': item.sku}},
                        "update": {'$set':{...item, lastOrderDate:date.getTime()}},
                        "upsert": true}
                    }
                  })                     
        const response = await accountMetadata.bulkWrite(updateParam)
        // console.log('MONGO WRITESPONSE')
        // console.log(response);
        return (response.result.n >= payload.cart.length) ? {success: 'success'} : {error: {stack: response}}
      }
      } catch (error) {              
              if (!Sentry.error) {
                Sentry.captureException('Mongo Account Metadata Order Error - '+error)
            }            
            console.log(error.stack)
            return {error:error}
      }
    
}


//PULL USER-SPECIFIC PRODUCT DATA FOR ALGOLIA PRODUCT QUERY
exports.pullMetadata = async(skuList, accountId, hits, sortQuery, filterQuery) => {

  const Sentry = await sentry.initSentry() 
  
  try {
    const client = new MongoClient(mongo_uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect()
    let metadata = client.db(process.env.MONGO_DB).collection(accountId+'-metadata');

    //SORT PRICES BY ORDER OF INPUT SKU LIST OR BY SORT TERM
    let mongoquery = [];   
    
    // console.log('FITLER QUERY')
    // console.log(filterQuery)
    // console.log(filterQuery.length)
    // console.log(skuList)
    if (!filterQuery || filterQuery.length === 0) {
      mongoquery = [{$match: {sku: {$in: skuList}}}]
    } else {
      mongoquery = [{$match: {$and:[{sku: {$in: skuList}}, ...filterQuery]}}]
    }

    mongoquery.push({$addFields: {"__skuList": {$indexOfArray: [skuList, "$sku" ]}}})

    if (!sortQuery || sortQuery.length === 0) {
      mongoquery.push({$sort: {"__skuList": 1}})
    } else {
      // field = sortQuery.field
      // if (sortQuery.direction === 'ascending') {direction = 1}
      // else {direction = -1}
      // mongoSort = {}
      // mongoSort[field] = direction
      mongoquery.push({$sort: {...sortQuery, "__skuList":1}})
    }

    const metadataCont = await metadata.aggregate(mongoquery).toArray()

     
    client.close()

    // console.log(metadataCont)

    //ADD IN ORIGINAL PRODUCT DATA TO SORTED METADATA AND REMOVE FROM ORIGINAL HITS TO LATER APPEND ONLY PROD-DATA THAT DOESN'T HAVE ASSOCIATE METADATA        
    combinedData = metadataCont.map(meta => {
      //PULL PRODUCT DATA
      const product = hits[meta.__skuList]
      //REPLACE PRODUCT WITH 0 FOR FILTERING LATER
      hits.splice(meta.__skuList, 1, 0)
      return {...meta, ...product}
     } )

    //REOMVE 0 ENTRIES FROM HITS TO ONLY HAVE HITS THAT DON'T HAVE METADATA
     hits = hits.filter(entry => entry !== 0)

    //  console.log('METADATA')
    //  console.log(combinedData)
    //  console.log('HITS')
    //  console.log(hits)


    //APPEND REMAINDER OF HITS WITHOUT METADATA TO THE BOTTOM OF THE LIST
    return {'metadata':[...combinedData, ...hits]}
  }
  catch (error) {
    if (!Sentry.error) {
      Sentry.captureException('Mongo PullMetadata Error - '+error)
    }  
    client.close()
    return {'error':error}
  }
}
