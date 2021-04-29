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
        const response = await mongo.orders('setOrder', {id: event.queryStringParameters.id,
                                                      update: JSON.parse(event.queryStringParameters.update)})        
        console.log(response)

        if (response.error) {
            return {statusCode: 500, headers, body: JSON.stringify({error: response.error})}    
        }
        return {statusCode: 200, headers, body: JSON.stringify({response: response})}
    }
    catch(error) {
        if (!Sentry.error) {
            Sentry.captureException('Set Order Error - '+error)
        }  
        console.log(error)
        return {statusCode: 500, headers, body: JSON.stringify({error: error})}
    }   

}