const
  path = require('path'),
  { generateFromFile } = require('./services/report')

const pdfPath = path.join(process.cwd(), 'test', 'single_page.pdf')

module.exports = async (req, res) => await generateFromFile(pdfPath)