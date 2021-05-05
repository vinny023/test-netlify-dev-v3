import axios from 'axios'
import { NETLIFY, headers} from '../env.js'

export const getAccount = async({query}) => { 
    console.log(NETLIFY+'getAccount?query='+encodeURI(JSON.stringify(query)))
    const returnval = await axios.get(NETLIFY+'getAccount?query='+encodeURI(JSON.stringify(query)))    
    if (returnval.status === 200 && returnval.data.account) {
        return returnval.data.account[0]
    }  else {
        throw 500
    } 
}

export const setOrder = async({id, update}) => { 
    console.log(NETLIFY+'setOrder?id='+id+'&update='+encodeURI(JSON.stringify(update)))
    const returnval = await axios.get(NETLIFY+'setOrder?id='+id+'&update='+encodeURI(JSON.stringify(update)))
    if (returnval.status === 200 && returnval.data.response) {
        return returnval.data.response             
    }  else {
        throw 500
    } 
}

export const getOrders = async({query, sort}) => { 
    console.log(NETLIFY+'getOrders?query='+encodeURI(JSON.stringify(query))+"&sort="+encodeURI(JSON.stringify(sort)))
    const returnval = await axios.get(NETLIFY+'getOrders?query='+encodeURI(JSON.stringify(query))+"&sort="+encodeURI(JSON.stringify(sort)))    
    if (returnval.status === 200 && returnval.data.orders) {
        return returnval.data.orders             
    }  else {
        throw 500
    } 
}


export const placeOrder = async({supplierOrder})  => {
    console.log(NETLIFY+'placeOrder?supplierOrder='+encodeURI(JSON.stringify(supplierOrder)))
    const returnval = await axios.get(NETLIFY+'placeOrder?supplierOrder='+encodeURI(JSON.stringify(supplierOrder)))
    if (returnval.status === 200 && returnval.data.orderSaved) {
        return returnval.data.orderSaved           
    }  else {
        throw 500
    }    
}

export const getCartSuppliers = async({suppliers}) => {

    console.log(NETLIFY+'getCartSuppliers?suppliers='+encodeURI(JSON.stringify(suppliers)))
    const supplierList = await axios.get(NETLIFY+'getCartSuppliers?suppliers='+encodeURI(JSON.stringify(suppliers)), headers)
    if (supplierList.status === 200 && supplierList.data.suppliers) {
        return supplierList.data.suppliers
    } else {
        throw 500       
    }    
}

export const getProducts = async({search, filter, sort, initialFilter, accountId}) => {


    //PUT QUOTES AROUND STRING VALUES FOR FILTER SO ALGOLIA CAN ACCEPT THEM
    const modFilter = filter.map(filter => {
        const moddedFilter = {...filter}
        if (filter.field === 'supplierDisplayName' || filter.field === 'units') {
            moddedFilter.values = moddedFilter.values.map(value => `"${value}"`)
        }
        return moddedFilter
    })
    
    //BUILD QUERY STRING
    let queryString = '?accountId='+accountId+'&'
    if (search !== '') { queryString += 'search='+encodeURI(search)+"&" } 
    if ([...initialFilter, ...modFilter].length !== 0) { queryString += 'filterQuery='+encodeURI(JSON.stringify([...initialFilter, ...modFilter]))+"&" }
    if (sort.length !== 0) {queryString += 'sortQuery='+encodeURI(JSON.stringify(sort))}

    //GET PRODUCTS BASED ON QUERY   
    console.log('GET PRODUCTS QUERY')
    console.log(NETLIFY+'getProducts'+queryString, headers)
    const productList = await axios.get(NETLIFY+'getProducts'+queryString, headers)
    if (productList.status === 200 && productList.data.products) {
        return productList.data.products
    } else {
        throw 500     
    }

    
}