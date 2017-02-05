'use strict'

const qs = require('querystring')
const bluebird = require('bluebird')
const request = require('request')
const fetch = bluebird.promisify(request.get)
const cheerio = require('cheerio')
const { merge, compose, pick, composeP, map, head } = require('ramda')

const WINE_DB_URL = process.env.WINE_DB_URL

const defaultOptions = { start : 1 }

const queryOptions = query => { q: query }

const options = query => merge(defaultOptions, { q: query })

const searchQueryString = compose(qs.stringify, options)

const getHtml = x => x.html()

const pickFields = pick(['@id', 'name', 'aggregateRating', 'manufacturer'])

const results = compose(map(pickFields), JSON.parse, getHtml)

const getUrl = q => Promise.resolve(`${WINE_DB_URL}/search/wines?q=${searchQueryString(q)}`)

const parse = html => {
  const $ = cheerio.load(html.body)
  const json = $('script[type="application/ld+json"]')
  return results(json)
}

exports.search = composeP(head, parse, fetch, getUrl)