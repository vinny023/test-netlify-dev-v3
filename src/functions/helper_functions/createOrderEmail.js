const sentry = require('./sentry')

exports.createOrderEmailParams = ({ accountDisplayName,
                                    cart,
                                    supplierContact, 
                                    accountConfirmationEmail,
                                    supplierDetail,
                                    id,
                                    deliveryLocation,
                                    selectedDeliveryDate,
                                    selectedTimeSlot,
                                    specialNotes
                                    }) => {

        const Sentry = sentry.initSentry()          
        

        try {         
            
            const {streetAddress, city, state, zipCode} = deliveryLocation       
            
            if (specialNotes === undefined) {
                specialNotes = ''
            }
            
            //CREATE ORDER STRING
            var orderstring = `<h3>Order From `+accountDisplayName+`</h3>
            <table style="border-collapse: collapse; width: 100%;">
           
            <h4>Location: </h4>
            <p>`+streetAddress+` </p>
            <p>`+city+`, `+state+ ` `+zipCode+`</p>
            <br>
            <h4>Deliver At: $</h4>
            <p>`+selectedDeliveryDate.day + `- `+
                 selectedDeliveryDate.date+`<//p>
            <p>`+selectedTimeSlot+`</p>
            <br>
            <p>`+specialNotes+`</p>
            <tr>
            <th style=" text-align: left; padding: 8px;">Item Number</th>
            <th style=" text-align: left; padding: 8px;">Quantity</th>
            <th style=" text-align: left; padding: 8px;">Size</th>
            <th style=" text-align: left; padding: 8px;">Description</th>
            <th style=" text-align: left; padding: 8px;">Price</th>
            </tr>`

        for (var m = 0; m < cart.length; m++) {
            var shade = '';
            if (m % 2 === 0) {
            shade = `style="background-color: #f2f2f2;"`
            } 
            
            if (!cart[m].price) {
                cart[m].price = '';
            }
        
            orderstring += `
            <tr `+shade+`>
                <td style=" text-align: left; padding: 8px;">`+cart[m].supplierItemId+`</td>
                <td style=" text-align: left; padding: 8px;">`+cart[m].quantity+`</td>
                <td style=" text-align: left; padding: 8px;">`+cart[m].qtyPerItem+`x `+cart[m].size+` `+cart[m].units+`</td>
                <td style=" text-align: left; padding: 8px;">`+cart[m].displayName+`</td>
                <td style=" text-align: left; padding: 8px;">$`+cart[m].price+`</td>
                </tr>
            `
        }

        orderstring += "</table>"

        return {
                    html: orderstring, 
                    subject: 'Order From '+accountDisplayName+' to '+supplierDetail.displayName,
                    from: process.env.ORDER_EMAIL_SENDER,
                    to: [supplierContact.contact, accountConfirmationEmail],
                    custom_args:{orderId:id}
                }

        } catch (error) {
            if (!Sentry.error) {
                Sentry.captureException('Create Order Email Error - '+error)
            }  
            return {
                error: error
            }
        }
        
}