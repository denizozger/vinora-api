const
  { parseFile, parseUrl } = require('./parser'),
  { search } = require('./wines'),
  { zip, compose, flatten, reduce, merge, map, prop } = require('ramda')
  
const mergeListItems = reduce(merge, {})

const mergeParsedWithResult = map(mergeListItems)

// const searchPromise = compose(search, prop('pdfName'))

exports.generateFromFile = (pdfPath, client) => new Promise((resolve, reject) =>
  parseFile(pdfPath)
    .then(wines => {
      client.emit('wines-parsed', wines)

      wines.map(wine => search(wine, client))
      return true
    })
    .then(resolve)
    .catch(reject)
)

exports.generateFromUrl = (url, client) => new Promise((resolve, reject) =>
  parseUrl(url)
    .then(wines => {
      client.emit('wines-parsed', wines)
      
      wines.map(wine => search(wine, client))
      return true
    })
    .then(resolve)
    .catch(reject)
)