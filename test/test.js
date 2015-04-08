var dat = require('dat-core')
var rimraf = require('rimraf')
var tape = require('tape')
var concat = require('concat')
var from2 = require('from2')

var visualdiff = require('./index.js')
var testData = require('./testData.js')
var memdb = require('memdb')

var db = dat(memdb(), {valueEncoding: 'json'})

createTableConflicts(function (branches) {
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

function list2stream (data) {
  var since = 0
  return from2.obj(function(size, cb) {
    if (since > data.length) return
    since++
    cb(null, data[since])
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