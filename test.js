var dat = require('dat-core')
var rimraf = require('rimraf')
var tape = require('tape')
var visualdiff = require('./index.js')
var testData = require('./testData.js')

rimraf.sync('./testdb')
var db = dat('./testdb')

createConflicts(function (branches) {
  console.log(branches)
  var table1 = db.checkout(branches[0])
  var table2 = db.checkout(branches[1])

  table1.createReadStream().on('data', function (data) {
    console.log('table1', data)
  })
  table2.createReadStream().on('data', function (data)  {
    console.log('table2', data)
  })
  // visualdiff.ndjson2html(ndjson1, ndjson2, function (html) {
  //   console.log(html)
  // })
})


function createConflicts(cb) {
  db.put('hello', 'world', function () {
    var oldHash = db.head
    db.put('hello', 'verden', function () {
      var oldDb = db.checkout(oldHash)

      oldDb.put('hello', 'mars', function (err) {
        oldDb.branches('default', function (err, branches) {
          cb(branches)
        })
      })
    })
  })
}

