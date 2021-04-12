const mongo = require('../functions/helper_functions/mongo')


mongo.suppliers('getSupplier', {supplierList: ['sysco']}).then(output => console.log(output))