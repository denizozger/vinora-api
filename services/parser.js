'use strict'

const 
  BBP       = require('bluebird'),
  fs        = BBP.promisifyAll(require('fs')),
  tmp       = BBP.promisifyAll(require('tmp')),
  download  = require('download'),
  assert    = require('assert'),
  uuid    = require('uuid'),
  os      = require('os'),
  should    = require('should'),
  PDFJS     = require('pdfjs-dist');

const
  currencySymbol = '£';

tmp.setGracefulCleanup()
  
exports.parseFile = (pdfPath) => {
  return new Promise((resolve, reject) => {
    return fs.readFileAsync(pdfPath)
      .then(extractData)
      .then(resolve)
      .catch(reject)
  })
}

exports.parseUrl = (pdfUrl) => {
  return new Promise((resolve, reject) => {
    const tmpFilePath = os.tmpdir() + uuid()

    return download(pdfUrl, tmpFilePath)
      .then(extractData)
      .then(resolve)
      .catch(reject)
  })
}

function extractData(data) {
  return new Promise((resolve, reject) => {
      PDFJS.getDocument(new Uint8Array(data))
      .then(doc => Promise.all(Array.from(Array(doc.numPages)).map((o, i) => doc.getPage(i + 1))))
      .then(pages => Promise.all(pages.map(p => p.getTextContent())))
      .then(content => {
        const wines = []
        const strings = content
          .map(c => c.items.map(i => i.str))
          .reduce((a, b) => a.concat(b), [])
          .filter(s => s.trim());
          
        strings.forEach((s, i) => {
          if (s.startsWith(currencySymbol)) {
            wines.push({pdfName: strings[i - 1].trim(), pdfPrice: s.trim()});
          }
        });

        resolve(wines)
      })
      .catch(reject)
  })
}