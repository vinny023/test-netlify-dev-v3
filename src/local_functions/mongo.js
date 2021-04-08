const algoliasearch = require('algoliasearch');
const MongoClient = require('mongodb').MongoClient;

const mongo_client_uri = "mongodb+srv://truffle_client:qUP5La8Dj9OjIESD@cluster0.uwtbq.mongodb.net/Truffle?retryWrites=true&w=majority"

const client = new MongoClient(mongo_client_uri, { useNewUrlParser: true, useUnifiedTopology: true });

const order = async(action,payload) => {
    //check if order already exists?
    
    try {
        await client.connect()
        let orders = client.db("Truffle").collection('Orders');

        switch (action) {
            case 'saveNewOrder':
                const insertRes = await orders.insertOne(payload.order)
                client.close()  
                return ((insertRes.insertedCount === 1) ? {success:'success'} : {error: 'Order Not Inserted - '+JSON.stringify(insertRes)})
     
            case 'updateOrder':
                const updateRes = await orders.updateOne(payload.filter, {'$set': payload.update})
                client.close()
                return ((updateRes.modifiedCount === 1) ? {success:'success'} : {error: 'Order Not Updated - '+JSON.stringify(updateRes)})
        }   
         
    }
    catch (error) {
      client.close()
      return {error:error}
    }
}

order('updateOrder',{filter: {id:"arvindsdeli-sysco-2021.2.28.15.34-[[null,1],[null,3]]" }, update: {test: 2}}).then(val => console.log(val))