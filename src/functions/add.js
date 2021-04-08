require('dotenv').config

exports.handler = async(event, context) => {
    try {
        return {
            statusCode: 200,
            body: JSON.stringify({'message':parseInt(process.env.ADD_CONSTANT,10) + parseInt(event.queryStringParameters.val1,10)})
        }
    
    } catch (error) {
        return {statusCode: 500, body: error.toString()}
    }
}