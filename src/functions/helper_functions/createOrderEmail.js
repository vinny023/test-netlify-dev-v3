
exports.createOrderEmailParams = ({ accountDisplayName,
                                    cart,
                                    supplierContact, 
                                    accountConfirmationEmail,
                                    supplierDisplayName,
                                    id}) => {

        try {
         
            //CREATE ORDER STRING
            var orderstring = `<h2>Order From `+accountDisplayName+`</h2>
            <table style="border-collapse: collapse; width: 100%;">
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
                <td style=" text-align: left; padding: 8px;">`+cart[m].name+`</td>
                <td style=" text-align: left; padding: 8px;">$`+cart[m].price+`</td>
                </tr>
            `
        }

        orderstring += "</table>"

        return {
                    html: orderstring, 
                    subject: 'New Order From '+accountDisplayName+' to '+supplierDisplayName,
                    from: process.env.ORDER_EMAIL_SENDER,
                    to: [supplierContact.contact, accountConfirmationEmail],
                    custom_args:{orderId:id}
                }

        } catch (error) {
            return {
                error: error
            }
        }
        
}