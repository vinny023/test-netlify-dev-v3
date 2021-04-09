const mongo = require ('./helper_functions/mongo.js')

exports.handler = async(event, context) => {

    try {
        const sgevents = JSON.parse(event.body)
        
        const processed = []
        const processedEmails = []
        const delivered = []
        const deliveredEmails = []
        const opened = []
        const openedEmails = []
  
        sgevents.forEach(sgevent => {
            switch (sgevent.event) {
                case 'processed':
                    processed.push(sgevent.orderId)
                    processedEmails.push(sgevent.email)
                case 'delievered':
                    delivered.push(sgevent.orderId)
                    deliveredEmails.push(sgevent.email)
                case 'open':
                    opened.push(sgevent.orderId)                    
                    openedEmails.push(sgevent.email)
            }
        })    
  
        await mongo.orders('updateManyNoCheck',{filter:{id: {'$in':processed}, supplierEmail: {'$in':processedEmails}}, update: {status:'Processed'}})
        await mongo.orders('updateManyNoCheck',{filter:{id: {'$in':delivered}, supplierEmail: {'$in':deliveredEmails}}, update: {status:'Delivered'}})
        await mongo.orders('updateManyNoCheck',{filter:{id: {'$in':opened}, supplierEmail: {'$in':openedEmails}}, update: {status:'Opened'}})  
        
        return {statusCode: 200}          
  
    } 
    catch (error) {
        return {statusCode: 500, error: error.stack}
    }
}