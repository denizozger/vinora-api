// @flow
const
  path = require('path'),
  { generateFromFile } = require('./services/report')

const pdfPath = path.join(process.cwd(), 'test', 'single_page.pdf')

module.exports = async (req, res) => {
	res.setHeader('Access-Control-Allow-Origin', '*')
	return await generateFromFile(pdfPath)
}