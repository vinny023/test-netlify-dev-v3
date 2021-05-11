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
        const response = await mongo.accounts('setAccount', {id: event.queryStringParameters.id,
                                                      update: update})        
        console.log(response)

        if (response.error) {
            if (!Sentry.error) {
                Sentry.captureException('Set Account - '+response.error)
            }  
            return {statusCode: 500, headers, body: JSON.stringify({error: response.error})}    
        }

        //return proper message if order status is confirmed
        return {statusCode: 200, headers, body: JSON.stringify({response: response})}
  
      
    }
    catch(error) {
        if (!Sentry.error) {
            Sentry.captureException('Set Account Error - '+error)
        }  
        console.log(error)
        return {statusCode: 500, headers, body: JSON.stringify({error: error})}
    }   

}