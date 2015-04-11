var dat = require('dat-core')
var test = require('tape')
var from2 = require('from2')
var fs = require('fs')

var visualdiff = require('../index.js')
var testData = require('./testData.js')
var memdb = require('memdb')

var db = dat(memdb(), {valueEncoding: 'json'})

// test('test js table conflicts from dat-core', function (t) {
//   createTableConflicts(function (branches) {
//     var diffStream = db.createDiffStream(branches[0], branches[1])
//     var opts = {
//       html: true,
//       limit: 10
//     }
//     visualdiff(diffStream, opts, function (err, daff, next) {
//       console.log(daff)
//       t.end()
//     })
//   })
// })

test('test js table conflicts from dat-core', function (t) {
  createTableConflicts(function (branches) {
    var diffStream = db.createDiffStream(branches[0], branches[1])
    var opts = {
      html: false,
      limit: 10
    }
    visualdiff(diffStream, opts, function (err, visual, next) {
      console.log(visual)
      t.end()
    })
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
  db.put(data[i]['country'], data[i], function () {
    putFromTable(db, data, i+1, cb)
  })
}