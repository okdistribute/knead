var dat = require('dat-core')
var test = require('tape')
var from2 = require('from2')
var fs = require('fs')

var visualdiff = require('../index.js')
var testData = require('./testData.js')
var memdb = require('memdb')

var db = dat(memdb(), {valueEncoding: 'json'})

var changesDataStream = fs.createReadStream('./test/changes.ndjson')

// test('test data', function (t) {
//   visualdiff(changesDataStream, function (err, val) {
//     console.log(val)
//     t.end()
//   })
// })

test('test js table conflicts', function (t) {
  createTableConflicts(function (branches) {
    var diffStream = db.createDiffStream(branches[0], branches[1])
    visualdiff(diffStream)
  })
})


/** UTILS **/

function createTableConflicts (cb) {
  putFromTable(db, testData.TABLE_0, 0, function () {
    var oldHash = db.head
    putFromTable(db, testData.TABLE_1, 0 , function () {
      var oldDb = db.checkout(oldHash)
      putFromTable(oldDb, testData.TABLE_2, 0, function () {
        db.heads(function (err, branches) {
          cb(branches)
        })
      })
    })
  })
}

function putFromTable (db, data, i, cb) {
  if (i === data.length) return cb()
  db.put(i.toString(), data[i], function () {
    putFromTable(db, data, i+1, cb)
  })
}