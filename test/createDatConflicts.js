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

module.exports = createDatConflicts

function createDatConflicts (db, tables, cb) {
  putFromTable(db, tables[0], 0, function () {
    var oldHash = db.head
    putFromTable(db, tables[1], 0 , function () {
      var oldDb = db.checkout(oldHash)
      putFromTable(oldDb, tables[2], 0, function () {
        db.heads(function (err, heads) {
          cb(heads)
        })
      })
    })
  })
}

function putFromTable (db, data, i, cb) {
  if (i === data.length) return cb()
  db.put(data[i]['country'], data[i], function () {
    putFromTable(db, data, i+1, cb)
  })
}