'use strict'

const
  { parseFile } = require('./parser'),
  { search } = require('./wines'),
  { zip, compose, flatten, reduce, merge, map, prop } = require('ramda')
  
const mergeListItems = reduce(merge, {})

const mergeParsedWithResult = map(mergeListItems)

const searchPromise = compose(search, prop('pdfName'))

exports.generateFromFile = (pdfPath) => new Promise((resolve, reject) =>
  parseFile(pdfPath)
    .then(parsedWines => {
      const zipWithWines = zip(parsedWines)
      const searches = parsedWines.map(searchPromise)
      
      return Promise.all(searches)
        .then(compose(mergeParsedWithResult, zipWithWines, flatten))
    })
    .then(resolve)
    .catch(reject)
)