const qs = require('querystring')
const bluebird = require('bluebird')
const request = require('request')
const fetch = bluebird.promisify(request.get)
const cheerio = require('cheerio')
const { map, merge, compose, pick, composeP, head, curry, ifElse, gte, prop, append } = require('ramda')
// const { map } = require('sanctuary')

const redis = require('redis')
bluebird.promisifyAll(redis.RedisClient.prototype)
bluebird.promisifyAll(redis.Multi.prototype)
const cache = redis.createClient()

cache.on('error', err => console.error('cache error: ' + err))

// const trace = curry(function(tag, x) {
//   console.log(tag, x);
//   return x;
// })

const WINE_DB_URL = process.env.WINE_DB_URL

const defaultOptions = { start : 1 }

const queryOptions = query => { q: query }

const options = query => merge(defaultOptions, { q: query })

const searchQueryString = compose(qs.stringify, options)

const getHtml = x => x.html()

const fields = ['@id', 'name', 'image', 'aggregateRating', 'manufacturer', 'offers']

const pickFields = pick(fields)

const results = compose(map(pickFields), JSON.parse, getHtml)

const resultsSingle = compose(JSON.parse, getHtml)

const result = compose(pickFields, JSON.parse, getHtml)

const getUrl = q => `${WINE_DB_URL}/search/wines?q=${searchQueryString(q.pdfName)}`

const parse = html => {
  const $ = cheerio.load(html.body)
  const json = $('script[type="application/ld+json"]')
  
  return (json && json.length) ? results(json) : []
}

const parsePrice = html => {
  const $ = cheerio.load(html.body)

  
  const json = $('script[type="application/ld+json"]')
  if (json && json.length) {
  	const res = result(json)
  	if (res.offers) {
  		return res.offers.price
  	}
  }

  const priceTag = $('[data-item-type="average-price-icon"]')
  const price = priceTag.data('item-name')
  // const currency = priceTag.data('item-subname')

  if (!price) {
  	console.log('Undefined price!')
  }

  console.log('price:', price)
  
  return price
}


exports.search = (wine, socket) => {
	const url = getUrl(wine)
	const cacheKey = wine.pdfName.replace(/ /g, '+')

	let result

	console.log('cache try:', cacheKey)
	return cache.getAsync(cacheKey).then((reply) => {
    if (reply !== null) {
    	console.log('cache hit:', cacheKey)
    	socket.emit('result', { wine: wine, result: JSON.parse(reply)})
    	return
    } else {
	    console.log('cache miss:', cacheKey)
	    return fetch(url)
	    	.then(parse)
				.then(head)
				.then(res => {
					result = res

					if (!result['@id'].includes('9999')) {
						result.vintage = result['@id'].substr(result['@id'].length - 4)
					}

					// const id = result['@id']
					// if (id.includes('9999')) { // attempt to fix the vintage
					// 	const vintage = wine.pdfName.substr(wine.pdfName.length - 4)
					// 	result['@id'] = id.substring(0, id.length - 4) + vintage
					// }

					console.log(result['@id'])
					return fetch(result['@id'])
				})
				.then(parsePrice)
				.then(price => {
					result.price = price
					const resultStr = JSON.stringify(result)
					console.log('cache set:', cacheKey, resultStr)
					cache.set(cacheKey, resultStr, redis.print)
					socket.emit('result', { wine, result })
			})
    }
	})
	.catch(console.error)



	

}