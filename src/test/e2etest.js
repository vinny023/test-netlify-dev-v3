// //LOAD NECESSARY SDKS
// const sgMail = require('@sendgrid/mail')
// sgMail.setApiKey(process.env.SENDGRID_API_KEY)

import {getAccount, getProducts, getOrders, getCartSuppliers, orderResponse} from './apis/apis'
//PLEASE NOTE, VARIABLE "body" REFERS TO TO RESPONSE BODY OF TESTED API CALL

//1. GET ACCOUNT

//1A. Get Account by Id
const idQuery = {id: 'arvindsdeli'}
const accountById = await getAccount({query: idQuery})
//1A. SUCCESS CODE: accountById.id === idQuery.id

//1B. Get Account by Code
const codeQuery = {code: '12345'}
const accountByCode = await getAccount({query: codeQuery})
//1A. SUCCESS CODE: accountByCode.code === codeQuery.code

//USE accountById.orderGuide for next step

//____________________________________________________________

//2. GET PRODUCTS
//2A. Get Products by SKU query
const orderGuide = accountById.orderGuide //from previous module
const accountId = accountById.id
let initialFilter = [{ 'field': 'sku', 'comparison': ':', 'values': orderGuide }]
let prod = await getProducts({accountId: accountId, initialFilter: initialFilter, sort: {}, search: '', filter: []})
//SUCCESS: all sku properties in array of objects are in skuList
//SUCCESS CODE: prod.products.forEach(product => if(skuList.indexOf(product.sku) === -1 {FAILED; break;}))

//2B. Get Products with search, sort & multiple filters
const accountId = accountById.id
const search = 'chicken'
const page = 0
const sort = [{price: -1}] //sort in descending order
const filter = [
    {
        field: 'supplier',
        comparison: ':',
        values: ['sysco', 'usfoods']
    },
    {
        field: 'units',
        comparison: ':',
        values: ['Lb', 'Oz']
    },
    {
        field: 'size',
        comparison: '<',
        values: [50]
    },  
    {
        field: 'price',
        comparison: '$gt', //use $LT for less ten
        values: [100]
    }
]
const search = 'chicken'
let prod = await getProducts({accountId: accountId, initialFilter: [], sort: sort, search: search, filter: filter})
//SUCCESS: loop through prod.products and check following conditions:
//1) every product.supplierId is either sysco or usfoods
//2) every product.units is either Lb or Oz
//3) every product.size is less than 50
//4) every product.price is greater than 100
//5) every product.price is greater than the previous product.price

//6) search for specific prodcut from CSV

//_____________________________________________________________________________________


//3. GET SUPPLIER DETAILS
//3A. GET SUPPLIER DETAILS
const suppliers = ['sysco', 'woolco', 'usfoods']
let supplierList = await getCartSuppliers({suppliers: suppliers})
//SUCCESS: returned list of suppliers should contain suppliers in exact same order
//SUCCESS CODE: supplierList.forEach((supplier, index) => supplier.id === suppliers[index] )

//___________________________________________________________________________________________________

//4. PLACE ORDER
//4A. Place order

const date = new Date()
const supplierOrder = {
    "accountId":"arvindsdeli",
    "accountDisplayName":"Arvind's Deli",
    "accountConfirmationEmail":"aanandacoumar@gmail.com",
    "supplierContact":{"contact":"trufflefoodmarket@gmail.com"},
    "cart":[
            {"__skuList":2,
            "qtyPerItem":1,"size":72,"supplierId":"sysco","supplierItemId":"100","units":"Count","_id":"606d1c751adff13e090a84db",
            "displayName":"Serving Spoons ","objectID":"818817002",
            "orderHistory":"[{\"orderID\":\"1001\", \"date\":\"3/15/21\",\"quantity\":2}]",
            "price":10.99,"qtyPerItem":1,"quantity":1,"size":72,"sku":"sysco-100","supplierDisplayName":"Sysco","supplierId":"sysco",
            "supplierItemId":{"$numberInt":"100"},
            "supplierLogo":"https://www.sysco.com/dam/jcr:2ed25439-a58a-41d2-8306-dcf3761c7d95/Sysco-Logo-Color1.png","units":"Count"}
        ],
        "supplierId":"sysco",
        "supplierDetail":{"_id":"60538fa5b3e89357e4bdfab7","displayName":"Sysco","id":"sysco","logo":"https://www.sysco.com/dam/jcr:2ed25439-a58a-41d2-8306-dcf3761c7d95/Sysco-Logo-Color1.png","image":"","shippingDays":{"$numberInt":"1"},"shippingCutoff":{"$numberInt":"15"},"orderMinimum":{"$numberInt":"200"},"deliveryFee":{"$numberInt":"15"},"shippingDoW":[{"$numberInt":"1"},{"$numberInt":"2"},{"$numberInt":"3"},{"$numberInt":"4"},{"$numberInt":"5"},{"$numberInt":"6"}],"shippingTimeSlots":["12 AM - 5 AM","5 AM - 10 AM","10 AM - 3 PM","3 PM - 8 PM"],"__originalOrder":{"$numberInt":"0"}},
        "orderTotal":115,
        "deliveryFee":15,
        "selectedDeliveryDate":{"day":"Thursday","date":date.getTime()},
        "selectedDeliveryTimeSlot":"12 AM - 5 AM",
        "placingOrder":true,  }

const orderResponse = await placeOrder({supplierOrder: supplierOrder})
//SUCESS 1: Function ran successfully and returned orderId property.
//CODE: orderResponse.orderId !== undefined 

//SUCCESS 2: Order is saved in database and can be called
const orderId = orderResponse.orderId
const checkOrder = getOrders({query: {id: orderId }})
//SUCCESS CODE: checkOrder.id === orderId

//SUCCCESS 3: checkEmailQueued = await sgMail.get({orderId: body.orderId)
//checkEmailQueued.status === 'queued', 'processed', 'delivered, 'opened'

//SUCCESS 4: 
//wait 30 seconds
//checkEmailPlaced = await sgMail.get({orderId: body.orderId})
//checkEmailPlaced.status === 'processed', 'delivered', 'opened'

//SUCCESS 5:
//checkOrder = await getOrders({query: {id: body.orderId}})[0]
//checkOrder.status ==== 'Placed'


// _____________________________________________________________________________________

//5. HANDLE HOOK
//5A. Handle hook data

//1. is it actually firing?

//2. when it fires - does it work right?

// _____________________________________________________________________________

//6. SET ORDER DETAILS
//6A. Set order detail
const orderset = await setOrder({id: orderId, update:{status: 'Delivered'}})

//SUCCESS: call same order - status should be set as delivered
//SUCCES CODE:
// const getSetOrder = await getOrders({query: {id: orderId}})
// getSetOrder.status === 'Delivered'