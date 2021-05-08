const mongo = require ('./helper_functions/mongo.js')
const createOrderEmail = require ('./helper_functions/createOrderEmail.js')
const sendgrid = require ('./helper_functions/sendgrid.js')
const sentry = require('./helper_functions/sentry')

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
  };

exports.handler = async(events, context) => {

    const Sentry = await sentry.initSentry()
    
    let orderSent = false;        

    try {
       
    console.log(decodeURI(events.queryStringParameters.supplierOrder.replace(/HTAG/g,"#")))
    
    const supplierOrder = JSON.parse(decodeURI(events.queryStringParameters.supplierOrder.replace(/HTAG/g,"#")))        

    try {        
        
        //CREATE UNIQUE ID FOR THIS ORDER WITH ACCOUNTID, SUPPLIERID, ORDER DATE & HOUR, AND STRINGIFIED UNIQUE CART ID
        const date = new Date()
        supplierOrder.createdDate = date.getTime()
        const uniqueCartString = supplierOrder.cart.map(item => [item.sku, item.quantity]) //UNIQUE CART ID
        const uniqueDateString = date.getUTCFullYear()+'.'+date.getUTCMonth()+'.'+date.getUTCDate()+'.'+date.getUTCHours()+'.'+date.getUTCMinutes()
        supplierOrder.id = supplierOrder.accountId+'-'+supplierOrder.supplierId+'-'+uniqueDateString+'-'+JSON.stringify(uniqueCartString)
        
        supplierOrder.id = supplierOrder.accountId + '-' + supplierOrder.supplierId +'-'+date.getTime().toString()

        //MAKE SURE ORDER DOESNT EXIST?

        // //SAVE ORDER TO DATABASE - STATUS = "UNQUEUED"
        // supplierOrder.status = 'Unqueued';
        // const saveOrderRes = await mongo.orders('saveNewOrder', {order: supplierOrder})
        // if (saveOrderRes.error) {
        //     if (!Sentry.error) {
        //         Sentry.captureException('Place Order Error - Saving Unqued Issue - '+error)
        //     }  
        //     return {statusCode: 500, headers, body: JSON.stringify({orderId: supplierOrder.id,orderSaved: false, error: 'Save Unqueued Order Error - '+saveOrderRes.error.stack})}
        // }            

        //CREATE ORDER EMAIL (BODY, SENDER, RECIPIENT)
        const orderEmail = createOrderEmail.createOrderEmailParams(supplierOrder)
        if(orderEmail.error) {
            if (!Sentry.error) {
                Sentry.captureException('Place Order Error - Create Order Email Issue - '+error)
            }  
            return {statusCode: 500, headers,body: JSON.stringify({orderId: supplierOrder.id, orderSent: false, error: 'Order Email Creation Error - '+orderEmail.error.stack}) }
        }

        console.log("Order Email")
        console.log(orderEmail)        

         //SEND EMAIL VIA SENDGRID & HANDLE ERROR IF NOT 202 RESPONSE
         const sgQueueConfirm = await sendgrid.sendEmail(orderEmail)        
        
         if (sgQueueConfirm.error) {  
            if (!Sentry.error) {
                Sentry.captureException('Place Order Error - SG Send Email Issue - '+error)
            }            
            return {statusCode: 500, headers, body: JSON.stringify({orderId: supplierOrder.id, orderSent: false, error: 'Order Email Queuing Error - '+sgQueueConfirm.error.stack} )}         
        }
        
        console.log("Send Grid Response")
        console.log(sgQueueConfirm)

        orderSent= true;


        mongo.accountMetadata('markRecentlyOrdered', supplierOrder)
        
        //SAVE ORDER TO DATABASE - STATUS = "QUEUED"
        supplierOrder.status = 'Queued';
        const saveOrderRes = await mongo.orders('saveNewOrder', {order: supplierOrder})
        if (saveOrderRes.error) {
            if (!Sentry.error) {
                Sentry.captureException('Place Order Error - Saving Unqued Issue - '+error)
            }  
            return {statusCode: 200, headers, body: JSON.stringify({orderId: supplierOrder.id,orderSent: true, error: 'Save Queued Order Error - '+saveOrderRes.error.stack})}
        }
        

        // //CHANGE ORDER STATUS TO QUEUED
        // const orderUpdateRes = await mongo.orders('updateOrder', {filter: {id:supplierOrder.id}, update: {status: 'Queued'}, close:true})
        // if (orderUpdateRes.error) {
        //     if (!Sentry.error) {
        //         Sentry.captureException('Place Order Error - Save Queued Order Issue - '+error)
        //     } 
        //     return {statusCode: 200, headers, body: JSON.stringify({orderId: supplierOrder.id,orderSaved:true, error: 'Update Order To Queued Error - '+orderUpdateRes.error.stack} )}
        // }

        return {
            statusCode:200,
            headers,
            body: JSON.stringify({orderId: supplierOrder.id,orderSent: true})
        }

    }
    catch(error) {
        let statusCode = 500;
        if (orderSent) {
            statusCode = 200
        }
        if (!Sentry.error) {
            Sentry.captureException('Place Order Error - General - '+error)
        }  
        return {statusCode: statusCode, headers, body: JSON.stringify({order: supplierOrder,orderSent: orderSent, error: 'Place Order Master Function Error - '+error.stack} )}
    }

}
catch (error) {
    if (!Sentry.error) {
        Sentry.captureException('Place Order Error - Read Order - '+error)
    }  
    return {statusCode: 500, headers, body: JSON.stringify({orderSent: false, error: 'Place Order Read Order Error - '+error.stack} )}
}



}







