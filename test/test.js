'use strict'

const
  parser = require('../services/parser'),
  wines = require('../services/wines'),
  report = require('../services/report'),
  path    = require('path'),
  _       = require('lodash')

const 
  menuPath = path.join(process.cwd(), 'test', 'menu.pdf'),
  singlePagePath = path.join(process.cwd(), 'test', 'single_page.pdf'),
  pdfUrl  = 'http://noblerot.co.uk/wp-content/uploads/2016/11/FINAL.pdf'
  

describe('pdf-parser', function() {
  it('should parse a wine menu from a file', function(done) {
    parser.parseFile(menuPath)
      .then(wines => {
        // wines.should.be.instanceof(Array).and.have.lengthOf(582);

        // const firstWine = _.head(wines);
        // firstWine.should.have.property('name', 'Gaston Chiquet, 1er Cru Brut; Champagne, France NV');
        // firstWine.should.have.property('price', '£55');
        done()
      })
      .catch(console.error)
  })

  // todo: find a static url, this one 404s
  // it('should parse a wine menu from a url', function(done) {
  //   parser.parseUrl(pdfUrl)
  //     .then(wines => {
  //       // console.log(wines)
  //       done()
  //     })
  //     .catch(console.error)
  // })
})

describe('wine service', function() {
  it('should search for wines', function(done) {
    this.timeout(3000);
    wines.search('jean folliard cote du py')
      .then(results => {
        // console.log(results)
        // results.should.be.instanceof(Array)
        // results.length.should.not.be.exactly(0)
        done()
      })
      .catch(console.error)
  })
})

describe('report service', function() {
  it('should generate a report', function(done) {
    this.timeout(7000);
    report.generateFromFile(singlePagePath)
      .then(report => {
        // console.log(JSON.stringify(report))
        done()
      })
      .catch(console.error)
  })
})