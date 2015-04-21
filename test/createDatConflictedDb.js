var dat = require('dat-core')
var path = require('path')
var argv = require('minimist')(process.argv.slice(2))
var testData = require('./testData.js')

var TABLES = [
  testData.COUNTRIES_0,
  testData.COUNTRIES_1,
  testData.COUNTRIES_2
]

if (argv._.length < 1) return console.log('must supply path')
var dbPath = path.resolve(__dirname, argv._[0])

var db = dat(dbPath, { valueEncoding: 'json', createIfMissing: true })

createDatConflicts(db, TABLES, function (heads) {
  console.log(heads)
})