var dat = require('dat-core')
var rimraf = require('rimraf')
var tape = require('tape')
var concat = require('concat')

var visualdiff = require('./index.js')
var testData = require('./testData.js')

rimraf.sync('./testdb')
var db = dat('./testdb')
var oldHash = null

createSimpleConflicts(function (branches) {
  console.log(branches)
  var table1 = db.checkout(branches[0])
  var table2 = db.checkout(branches[1])

  table1.createReadStream().on('data', function (data) {
    console.log('table1', data)
  })
  table2.createReadStream().on('data', function (data)  {
    console.log('table2', data)
  })

})

function createSimpleConflicts (cb) {
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



function createTableConflicts (cb) {
  // for (var i = 0; i < testData.json.length; i++ ) {
  //   var change = testData[i]
  //   db.put(change.key, change.changes[0].row)
  //
}

  //   visualdiff.ndjson2html(ndjson1, ndjson2, function (html) {
  //     console.log(html)
  //   })

