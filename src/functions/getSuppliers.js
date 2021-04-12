const mongo = require('./helper_functions/mongo')

exports.handler = async(event, context) => {

    try {        
        const suppliers = await mongo.suppliers('getSupplier', {supplierList: JSON.parse(event.queryStringParameters.suppliers)})
        return {statusCode: 200, body:JSON.stringify(suppliers)}
    }
    catch(error) {
        return {statusCode: 500, body: JSON.stringify(error)}
    }   

}