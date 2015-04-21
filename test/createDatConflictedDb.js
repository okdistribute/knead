var dat = require('dat-core')
var path = require('path')
var argv = require('minimist')(process.argv.slice(2))
var DATA = require('test-data')

var createDatConflicts = require('./createDatConflicts.js')

if (argv._.length < 1) {
  console.log('must supply path')
  process.exit()
}
var dbPath = path.resolve(__dirname, argv._[0])

var db = dat(dbPath, { valueEncoding: 'json', createIfMissing: true })

createDatConflicts(db, DATA.CONFLICTS.SMALL, function (heads) {
  console.log(heads)
})
