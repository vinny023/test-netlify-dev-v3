const axios = require('axios')

const supplierId = 'usfoods'
const accountId = 'arvindsdeli'

const getOrder = async() => {

    try {
        const masterCart = await axios.get('https://supplyhero-1605397286974-default-rtdb.firebaseio.com/customers/'+accountId+'/state/cartState/masterCart.json')
        const supplierOrder = masterCart.data.filter(cart => cart.supplierId === supplierId)[0]
        return supplierOrder
    } catch (error) {
        console.log(error)
    }
}

getOrder().then(val => console.log(val))