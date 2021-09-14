const sentry = require('./sentry')

exports.createOrderEmailParams = ({ accountDisplayName,
                                    cart,
                                    supplierContact, 
                                    accountConfirmationEmail,
                                    supplierDetail,
                                    id,
                                    deliveryLocation,
                                    selectedDeliveryDate,
                                    selectedDeliveryTimeSlot,
                                    specialNotes
                                    }) => {

        const Sentry = sentry.initSentry()          
        

        try {         

            const confirmLink = process.env.BASE_URL+`setOrder?id=`+id+`&update=%7B%22status%22%3A%22Confirmed%22%7D`
            
            const {streetAddress, city, state, zipCode} = deliveryLocation       
            
            if (specialNotes === undefined) {
                specialNotes = ''
            }
            
            //CREATE ORDER STRING
            var orderstring = `<h3>Order From `+accountDisplayName+`</h3>
            <h4>Deliver To (Location): </h4>
            <p>`+streetAddress+` </p>
            <p>`+city+`, `+state+ ` `+zipCode+`</p>
            <br>
            <h4>Deliver On: </h4>
            <p>`+selectedDeliveryDate.day + `- `+
                 selectedDeliveryDate.date+`<//p>
            <p>`+selectedDeliveryTimeSlot+`</p>
            <br>
            <p>`+specialNotes+`</p>
            <br>
            <a href="`+confirmLink+`">CLICK HERE TO CONFIRM ORDER</a>
            <br>
            <table style="border-collapse: collapse; width: 100%;">         
            <tr>           
            
            <th style=" text-align: left; padding: 8px;">UPC</th>
            <th style=" text-align: left; padding: 8px;">Vendor Item Code</th>
            <th style=" text-align: left; padding: 8px;">Qty</th>
            <th style=" text-align: left; padding: 8px;">Size</th>
            <th style=" text-align: left; padding: 8px;">Description</th>
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
                <td style=" text-align: left; padding: 8px;">`+cart[m].upc+`</td>
                <td style=" text-align: left; padding: 8px;">`+cart[m].supplierItemId+`</td>
                <td style=" text-align: left; padding: 8px;">`+cart[m].quantity+`</td>
                <td style=" text-align: left; padding: 8px;">`+cart[m].qtyPerItem+` x `+cart[m].size+' '+cart[m].units+`</td>
                <td style=" text-align: left; padding: 8px;">`+cart[m].brand+` - `+cart[m].displayName+`</td>
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
