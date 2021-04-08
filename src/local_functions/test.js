const blah = `[ { 'field':'supplierId', 'comparison':':', 'values':['aceendico', 'woolco'] }, { 'field':'units', 'comparison':':', 'values':['Gallon'] }, { 'field':'size', 'comparison':'>', 'values':[2] }, { 'field':'orderHistory', 'comparison':'$nin', 'values':[""] }, { 'field':'price', 'comparison':'$gt', 'values':[20] } ]`
blah = JSON.parse(blah)

console.log()