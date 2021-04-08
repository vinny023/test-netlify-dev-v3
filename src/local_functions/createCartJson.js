const cart = [
    {
        supplierItemId: '1111',
        quantity:1,
        qtyPerItem:1,
        size:5,
        units: 'pieces',
        name: 'Chocolate',
        price: 11.99,
        sku:'chocolate1111'
    },

    {
        supplierItemId: '1112',
        sku: 'whitechocolate1112',
        quantity:3,
        qtyPerItem:4,
        size:20,
        units: 'pieces',
        name: 'White Chocolate',
        price: 11.99,
    }
]

orderDetails = 
    {
        'supplierContact':{'contactType':'email', 'contact':'syscosupplyhero@gmail.com'},
        'accountId':'arvindsdeli',
        'accountDisplayName': "Arvindasdfsadf's Deli",
        'supplierId':'sysco',
        'supplierDisplayName':'Bysco',
        'accountConfirmationEmail': 'aanandacoumar@gmail.com',      
        'userId': 'aanandacoumar@gmail.com',      
        'deliveryFee': 0,
        'orderTotal': 159.99,
        'estimatedDeliveryDate': (new Date()).getTime + 86400000
    }

console.log(encodeURIComponent(JSON.stringify({...orderDetails, cart:cart})))

