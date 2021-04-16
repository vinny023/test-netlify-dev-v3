const mongo = require ('./helper_functions/mongo.js')
const createOrderEmail = require ('./helper_functions/createOrderEmail.js')
const sendgrid = require ('./helper_functions/sendgrid.js')

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
  };

exports.handler = async(events, context) => {
    
    let emailSent = false;

    try {
        supplierOrder = JSON.parse(events.queryStringParameters.supplierOrder)
        
        //CREATE UNIQUE ID FOR THIS ORDER WITH ACCOUNTID, SUPPLIERID, ORDER DATE & HOUR, AND STRINGIFIED UNIQUE CART ID
        const date = new Date()
        supplierOrder.createdDate = date.getTime()
        const uniqueCartString = supplierOrder.cart.map(item => [item.sku, item.quantity]) //UNIQUE CART ID
        const uniqueDateString = date.getUTCFullYear()+'.'+date.getUTCMonth()+'.'+date.getUTCDate()+'.'+date.getUTCHours()+'.'+date.getUTCMinutes()
        supplierOrder.id = supplierOrder.accountId+'-'+supplierOrder.supplierId+'-'+uniqueDateString+'-'+JSON.stringify(uniqueCartString)
        
        //MAKE SURE ORDER DOESNT EXIST?

        //SAVE ORDER TO DATABASE - STATUS = "UNQUEUED"
        supplierOrder.status = 'Unqueued';
        const saveOrderRes = await mongo.orders('saveNewOrder', {order: supplierOrder})
        if (saveOrderRes.error) {
            return {statusCode: 500, headers, body: JSON.stringify({emailSent: false, error: 'Save Unqueued Order Error - '+saveOrderRes.error.stack})}
        }

        //CREATE ORDER EMAIL (BODY, SENDER, RECIPIENT)
        const orderEmail = createOrderEmail.createOrderEmailParams(supplierOrder)
        if(orderEmail.error) {
            return {statusCode: 500, headers,body: JSON.stringify({emailSent: false, orderSaved: false, error: 'Order Email Creation Error - '+orderEmail.error.stack}) }
        }

         //SEND EMAIL VIA SENDGRID & HANDLE ERROR IF NOT 202 RESPONSE
         const sgQueueConfirm = await sendgrid.sendEmail(orderEmail)
         if (sgQueueConfirm.error) {            
            return {statusCode: 500, headers, body: JSON.stringify({emailSent: false, error: 'Order Email Queuing Error - '+sgQueueConfirm.error.stack} )}         
        }
        
        emailSent = true

        //CHANGE ORDER STATUS TO QUEUED
        const orderUpdateRes = await mongo.orders('updateOrder', {filter: {id:supplierOrder.id}, update: {status: 'Queued'}, close:true})
        if (orderUpdateRes.error) {
            return {statusCode: 200, headers, body: JSON.stringify({emailSent:true, error: 'Update Order To Queued Error - '+orderUpdateRes.error.stack} )}
        }

        return {
            statusCode:200,
            headers,
            body: JSON.stringify(orderUpdateRes)
        }

    }
    catch(error) {
        return {statusCode: 500, headers, body: JSON.stringify({emailSent: emailSent, error: 'Place Order Master Function Error - '+error.stack} )}
    }


    //delete firebase cart


    //handle sendgrid webhook
        //if webhook is delivered => orderstatus = place

        //if webhook is not delievered => orderstatus = not_placed
            //notify user
            //flag internally & try to push
            //add back to cart?    
}



//  console.log({...data.cart.cart[0], ...orderDetails})


