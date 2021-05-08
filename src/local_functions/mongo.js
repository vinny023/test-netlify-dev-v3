const algoliasearch = require('algoliasearch');
const MongoClient = require('mongodb').MongoClient;

const mongo_uri = "mongodb+srv://truffle_client:qUP5La8Dj9OjIESD@cluster0.uwtbq.mongodb.net/Truffle?retryWrites=true&w=majority"

// const client = new MongoClient(mongo_client_uri, { useNewUrlParser: true, useUnifiedTopology: true });

const accountMetadata = async(action, payload) => {
 
    const Sentry = await sentry.initSentry() 
  
    try {
  
        const client = new MongoClient(mongo_uri, { useNewUrlParser: true, useUnifiedTopology: true });
  
        await client.connect()
        let accountMetadata = client.db(process.env.MONGO_DB).collection(payload.accountId+'-metadata');
  
        switch (action) {            
            case 'markRecentlyOrdered' :
              const cartSkus = payload.cart.map(item => item.sku)
              console.log(cartSkus)
              const date = new Date()
              const response = await accountMetadata.updateMany({sku: {"$in": cartSkus}}, {'$set':{lastOrderDate:date.getTime()}})                           
              return (response.result.n >= payload.cart.length) ? {success: 'success'} : {error: {stack: response}}
        }
        } catch (error) {              
                if (!Sentry.error) {
                  Sentry.captureException('Mongo Account Metadata Order Error - '+error)
              }  
            console.log('ERROR')
                console.log(error.stack)
                return {error:error}
        }
      
  }

accountMetadata('markRecentlyOrdered', {accountId: 'arvindsdeli', cart: [{sku: "woolco-653110"}]})
  .then(output => console.log(output))