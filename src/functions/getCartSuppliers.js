const mongo = require('./helper_functions/mongo')

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
  };

exports.handler = async(event, context) => {

    try {        
        const suppliers = await mongo.suppliers('getCartSuppliers', {supplierList: JSON.parse(event.queryStringParameters.suppliers)})
        return {statusCode: 200, headers, body: JSON.stringify({suppliers:suppliers})}
    }
    catch(error) {
        return {statusCode: 500, headers, body: JSON.stringify(error)}
    }   

}