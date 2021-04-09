const algoliasearch = require('algoliasearch');
const mongo = require('./helper_functions/mongo.js')

const algolia_client = algoliasearch(process.env.ALGOLIA_APP_NAME, process.env.ALGOLIA_API_KEY);
const index = algolia_client.initIndex(process.env.ALGOLIA_PRODUCTS_INDEX);

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
  };

exports.handler = async(event, context) => {

    try {
        search = event.queryStringParameters.search
        accountId = event.queryStringParameters.accountId
        page = event.queryStringParameters.page
        sortQuery = event.queryStringParameters.sortQuery //sort query is shape {'field': field, 'direction':direction}
        filterQuery = event.queryStringParameters.filterQuery //filter query is shape [{'field': field, 'value':[value1, value2}]
        
        //****HANDLE IF METADATA DOESNT EXIST...


        //SET DEFAULT VALUES FOR PAGE, THEY DO NOT EXIST
        if (!page) {
            page = 0
        }

        //PARSE SORT QUERY IF IT DOES EXIST
        if (sortQuery) {
            sortQuery = JSON.parse(sortQuery)
        }                  

        //PARSE FILTER QUERY IF IT DOES EXIST
        if (filterQuery) {
            filterQuery = JSON.parse(filterQuery)
        }
       
        //CHECK ALGOLIA FILTER, MONGOFILTER and MONGOSORT
        filterAndSort = createFilterAndSort(filterQuery, sortQuery)
        
        const startTime = new Date();

        //SEARCH QUERY
        const {hits, nbPages} = await index.search(search, {filters:filterAndSort.algoliaFilter,page:page})
        const AlgoliaTime = new Date();              

        //CREATE METADATA QUERY ARRAY
        const skuList = hits.map(hit => hit.sku)
        
        //PULL METADATA

        //monogSort = {orderHistory: -1, price: 1}
        //mongoFilter = [{price:{$gt: 500}}, {price:{$gt: 1970}},{supplier:{$in:["woolco, sysco"]}}]
        const {metadata,error} = await mongo.pullMetadata(skuList, accountId, hits, filterAndSort.mongoSort, filterAndSort.mongoFilter)

        const MongoTime = new Date();

        console.log('AlgoliaTime:'+(AlgoliaTime-startTime))
        console.log('MongoTime:'+(MongoTime-AlgoliaTime))
        console.log('TotalTime:'+(MongoTime-startTime))  
        if (metadata) {           
            
            return {
                statusCode: 200,
                headers,
                // body: JSON.stringify({'products': hits, 'metadata': metadata, 'nbPages': nbPages} )
                body: JSON.stringify({'products': metadata, 'nbPages': nbPages} )
            }       
        } else if (error) {
            return {statusCode: 500, body: 'MONGO CALL ERROR -'&JSON.stringify(error)}
        } 

    } catch(error) {
        return {statusCode: 500, body: 'ALGOLIA CALL ERROR -'&JSON.stringify(error)}
    }
}

const createFilterAndSort = (filterInput, sortInput) => {

    const algoliaFilterFields = ['supplierId', 'qtyPerItem', 'size', 'units', 'displayName']
    const mongoFilterFields = ['price', 'orderHistory']
        
    let algoliaFilter = '';
    let mongoFilter = [];
    let mongoSort = {};
    //create Algolia Filter
    //(supplierId:aceendico OR supplierId:woolco) AND (units:Gallon) AND (size>2)

    if (filterInput) {
    algoliaFilter = filterInput.filter((filter) => algoliaFilterFields.indexOf(filter.field) !== -1)
        .reduce((algoliaFilter, filter) => algoliaFilter + "("+filter.values
            .reduce((filterString, filterValue) => filterString + filter.field+filter.comparison + filterValue +" OR ", "").slice(0,-4)+") AND ","").slice(0,-4)
         
    //create Mongo Filter
    //mongoFilter = [{price:{$gt: 500}}, {price:{$gt: 1970}},{supplier:{$in:["woolco, sysco"]}}]
    mongoFilter = filterInput.filter((filter) => mongoFilterFields.indexOf(filter.field) !== -1)
        .reduce((mongoFilter, filter) => {
                let newFilter = {}
                let newCompare = {}
                if (["$in", "$nin"].indexOf(filter.comparison) === -1) {
                    newCompare[filter.comparison] = filter.values[0]
                } else {
                    newCompare[filter.comparison] = filter.values
                }
                newFilter[filter.field] = newCompare
                mongoFilter.push(newFilter)
                return mongoFilter
        }, [])
    } 
    //create Mongo Sort
    //mongoSort = {orderHistory: -1, price: 1} 

    if (sortInput) {
        mongoSort = sortInput.reduce((mongoSort, sort) => {
            mongoSort[sort.field] = sort.direction
            return mongoSort
        }, {})
    } 
    return {'mongoFilter':mongoFilter, 'mongoSort': mongoSort, 'algoliaFilter':algoliaFilter}
}