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
        console.log(event.queryStringParameters.id)

        const update = JSON.parse(event.queryStringParameters.update)
        const response = await mongo.orders('setOrder', {id: event.queryStringParameters.id,
                                                      update: update})        
        console.log(response)

        if (response.error) {
            return {statusCode: 500, headers, body: JSON.stringify({error: response.error})}    
        }

        //return proper message if order status is confirmed
        try {
            if (update.status && update.status === "Confirmed") {
                return {statusCode: 200, headers, body: '<h1>Thanks! This order has been confirmed</h1>'}
            } else 
                return {statusCode: 200, headers, body: JSON.stringify({response: response})}
            } catch (error) {
                return {statusCode: 200, headers, body: JSON.stringify({response: response})}
            }        
    }
    catch(error) {
        if (!Sentry.error) {
            Sentry.captureException('Set Order Error - '+error)
        }  
        console.log(error)
        return {statusCode: 500, headers, body: JSON.stringify({error: error})}
    }   

}