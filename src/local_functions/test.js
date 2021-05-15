const algoliasearch = require('algoliasearch');

const ALGOLIA_API_KEY='1fff7f94e6d0d8f4e40e466920e98488'
const ALGOLIA_APP_NAME='33BEDS6295'
const ALGOLIA_PRODUCTS_INDEX='dev_Products'

const algolia_client = algoliasearch(ALGOLIA_APP_NAME, ALGOLIA_API_KEY);
const index = algolia_client.initIndex(ALGOLIA_PRODUCTS_INDEX);


const skuList = [{sku: 'woolco-999985'},{sku: 'woolco-99995'}]
const accountId = 'arvindsdeli'

const updateObjects = skuList.map(item => {
    let updateObject = {objectID: item.sku}
    updateObject[accountId+'-orderGuide'] = 'yes'
    return updateObject
})


console.log(updateObjects)

index.partialUpdateObjects(updateObjects).then(val => console.log(val)).catch(err => console.log(err))