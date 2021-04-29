const mongo = require('./helper_functions/mongo')
const sentry = require('./helper_functions/sentry')

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
  };

exports.handler = async(event, context) => {

    const Sentry = await sentry.initSentry()         

    try {            
        const suppliers = await mongo.suppliers('getCartSuppliers', {supplierList: JSON.parse(event.queryStringParameters.suppliers)})
        return {statusCode: 200, headers, body: JSON.stringify({suppliers:suppliers})}
    }
    catch(error) {
        if (!Sentry.error) {
            Sentry.captureException('Get Cart Supplier Error - '+error)
        }
        return {statusCode: 500, headers, body: JSON.stringify({error: error})}
    }   

}