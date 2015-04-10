var dat = require('dat-core')
var rimraf = require('rimraf')
var tape = require('tape')
var concat = require('concat')
var from2 = require('from2')

var visualdiff = require('../index.js')
var testData = require('./testData.js')
var memdb = require('memdb')

var db = dat(memdb(), {valueEncoding: 'json'})

createTableConflicts(function (branches) {
  console.log(branches)
  var table1 = db.checkout(branches[0])
  var table2 = db.checkout(branches[1])

  var stream = db.createDiffStream(branches[0], branches[1])

  stream.on('data', console.log)

})


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
  if (i > data.length) return cb()
  db.put(i.toString(), data, function () {
    putFromTable(db, data, i+1, cb)
  })
}

function createSimpleConflicts (cb) {
  db.put('hello', 'world', function () {
    var oldHash = db.head
    db.put('hello', 'verden', function () {
      var oldDb = db.checkout(oldHash)
      oldDb.put('hello', 'mars', function (err) {
        db.heads(function (err, branches) {
          cb(branches)
        })
      })
    })
  })
}