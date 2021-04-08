const testFilter = 
[
    {
        'field':'supplierId',
        'comparison':':',
        'values':['aceendico', 'woolco']
    },
    {
        'field':'units',
        'comparison':':',
        'values':['Lb']
    },
    {
        'field':'size',
        'comparison':'>',
        'values':[2]
    },
    {
        'field':'orderHistory',
        'comparison':'$nin',
        'values':[""]    
    },
    {
        'field':'price',
        'comparison':'$gt',
        'values':[20]
    }
]

const testSort = [
    {
        'field':'orderHistory',
        'direction': -1
    },
    {
        'field':'price',
        'direction': 1
    }
]

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

// console.log(createFilterAndSort(testFilter).mongoFilter)

// console.log(encodeURI(JSON.stringify(testFilter)))
console.log('\n')
console.log(encodeURI(JSON.stringify(testSort)))
// console.log(createFilterAndSort(testFilter))

//HANDLE IF FILTER OR SORT IS NULL

//WHAT IF ONLY ONE KIND OF SORTCOMES OUT

