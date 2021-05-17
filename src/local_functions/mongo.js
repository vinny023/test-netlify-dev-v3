const algoliasearch = require('algoliasearch');
const MongoClient = require('mongodb').MongoClient;

const mongo_uri = "mongodb+srv://truffle_client:qUP5La8Dj9OjIESD@cluster0.uwtbq.mongodb.net/Truffle?retryWrites=true&w=majority"

// const client = new MongoClient(mongo_client_uri, { useNewUrlParser: true, useUnifiedTopology: true });

const accountMetadata = async(action, payload) => {  

  
  
  try {

      const client = new MongoClient(mongo_uri, { useNewUrlParser: true, useUnifiedTopology: true });

      await client.connect()
      let accountMetadata = client.db(process.env.MONGO_DB).collection(payload.accountId+'-metadata');

      switch (action) {            
          case 'markRecentlyOrdered' :            
            const date = new Date()
            console.log('PAYLOAD')
            console.log(payload)
            const updateParam = payload.cart.map(item => {
              console.log('MAP ITEM'  );
              // console.log(item);
              delete item['quantity']
              delete item['objectID']  
              delete item['_id']       
              console.log(item._id);     
              return {"updateOne" : 
                            {"filter": {"sku": {'$eq': item.sku}},
                            "update": {'$set':{...item, lastOrderDate:date.getTime()}},
                            "upsert": true}
                        }
                      })     
                      
            console.log('UPDATE PARAMS');
            console.log(updateParam);
            const response = await accountMetadata.bulkWrite(updateParam)
            console.log('MONGO WRITESPONSE')
            console.log(response);
            return (response.result.n >= payload.cart.length) ? {success: 'success'} : {error: {stack: response}}
      }
      
      } catch (error) {              
            //   if (!Sentry.error) {
            //     Sentry.captureException('Mongo Account Metadata Order Error - '+error)
            // }            
            console.log(error.stack)
            return {error:error}
      }
    
}

// console.log(orderGuide)

const cart = [
  {sku: 'woolco-282181',
    price: 20.07,
    size: 12, 
    qtyPerItem: 27,
    units: "Oz",
    totalQty: 184,
    unitCost: 0.06,    
    quantity: 20,
    },
  {sku: 'woolco-55856',
    price: 16.7,
    size: 12, 
    qtyPerItem: 24,
    units: "Oz",
    totalQty: 288,
    unitCost: 0.06,    
    quantity: 20,
    } 
    
]

// {"sku":"woolco-282181"}

accountMetadata('markRecentlyOrdered', {accountId: 'arvindsdeli', cart: cart})

// account('updateOrderGuide', {query: {id: 'arvindsdeli'}, skuList: orderGuide })
//   .then(output => console.log(output))