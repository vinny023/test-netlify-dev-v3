const axios = require('axios');

//TEST THAT GET ACCOUNT PULLS CORRECT ACCOUT BY ID AND BY CODE
exports.testGet = async({ baseUrl }) => {

    console.log('Running Get Accounts Test')
    
//GET ACCOUNT
//BOTH SHOULD RETURN OBJECT {account: ARRAY OF ACCOUNTS}

    try{
        const idQuery = {id: 'arvindsdeli'}    
        const getAccountWithId = baseUrl + "getAccount?query="+JSON.stringify(idQuery)
        const accountById = await axios.get(getAccountWithId)   

        //SUCCESS CRITERIA => OBJECT WITH SAME ID IS RETURNED
        if (accountById.status === 200 && accountById.data.account && accountById.id === idQuery.id) {
            console.log('ACCOUNT BY ID SUCCESS')
        } else {
            console.log('ACCOUNT BY ID FAILED')
            console.log(accountById.status)
            console.log(accountById.data)
        }    
    } catch(error) {
        console.log('GET ACCOUNT BY ID FAILED')
        console.log(error)
    }   

    try {
        const codeQuery = {code: '12345'}
        const getAccountWithCode = baseUrl + "getAccount?query="+JSON.stringify(codeQuery)
        const accountByCode = await axios.get(getAccountWithCode)

        //SUCCESS CRITERIA => OBJECT WITH SAME CODE IS RETURNED
        if (accountByCode.status === 200 && accountByCode.data.account && accountByCode.code === codeQuery.code) {
            console.log('ACCOUNT BY CODE SUCCESS')
        } else {
            console.log('GET ACCOUNT BY CODE FAILED')
            console.log(accountByCode.data)
        }

    } catch (error) {
        console.log('GET ACCOUNT BY ID FAILED')
        console.log(error)

    }

}

// // const getAccountResponse=

// // GET CART SUPPLIERS
// //SHOULD RETURN OBJECT {suppliers: ARRAY OF SUPPLIERS}
// const suppliers = ['sysco', 'woolco']
// const callstring = baseURL + "getCartSuppliers?suppliers="+JSON.stringify(suppliers)

// //GET ORDERS
// //RETURN OBJECT {orders: ARRAY OF ORDERS}
// const orderIdQuery = {id: 'arvindsdeli-sysco-2021.3.17.20.33-[["sysco-61208",3],["sysco-741520",2]]'} //should return array of 1 order
// const accountQuery = {accountId: 'arvindsdeli', }
// const accountAndSupplierQuery = {...accountQuery, supplierId: 'sysco'}
// const accountAndstatusQuery = {accountQuery, status: 'Delivered'} //should return array of 2 orders 

// const getOrderWithId = baseURL + 'getOrders?query='+JSON.stringify(orderIdQuery)
// //***PLEASE REPEAAT FOR OTHER QUERIES ^

// //SET ORDERS
// const id = 'arvindsdeli-sysco-2021.3.17.20.33-[["sysco-61208",3],["sysco-741520",2]]'
// const update = {status: 'Queued'}

// const setOrder = baseURL + 'setOrders?id='+id+'update='+JSON.stringify(update)

// //GET PRODUCTS
// const accountId = 'arvindsdeli'
// const search = 'chicken'
// const page = 0
// sortQuery = {price: -1} // SORT PRICE HIGH TO LOW - to sort in ascending order, set value to 1
// filterQuery = [
//     {
//         field: 'supplier',
//         comparison: ':',
//         values: ['sysco', 'usfoods']
//     },
//     {
//         field: 'price',
//         comparison: '$gt', //use $LT for less ten
//         values: [15]
//     },
//     {
//         field: 'sku',
//         comparison: ':',
//         values: ['us_foods-150'] //this last filter will cause only 1 item to be outputted
//     }
// ]

// const getProducts = baseURL + 'getProducts?search='+search+'accountId='+accountId+'page='+page+'sortQuery='+JSON.stringify(sortQuery)+'filterQuery='+JSON.stringify(filterQuery)



// //handleHook


// //Place Order

