var dat = require('dat-core')
var test = require('tape')
var from2 = require('from2')
var fs = require('fs')

var dat2daff = require('../lib/dat2daff.js')
var visualdiff = require('../index.js')
var testData = require('./testData.js')
var memdb = require('memdb')

test('visualdiff terminal', function (t) {
  var db = dat(memdb(), {valueEncoding: 'json'})
  createTableConflicts(db, function (heads) {
    var opts = {
      db: db,
      html: false,
      limit: 30
    }
    visualdiff(heads[0], heads[1], opts, function (err, output, next) {
      console.log(output)
      t.same(typeof(output), 'string')
      t.same(typeof(next), 'function')
      t.end()
    })
  })
})


test('dat2daff.fromReadStreams', function (t) {
  var db = dat(memdb(), {valueEncoding: 'json'})
  createTableConflicts(db, function (heads) {
    var stream1 = db.checkout(heads[0]).createReadStream()
    var stream2 = db.checkout(heads[1]).createReadStream()
    var opts = {
      html: false,
      limit: 30
    }
    dat2daff.fromReadStreams(stream1, stream2, opts, function (err, visual) {
      t.end()
    })
  })
})

// test('test js table conflicts from dat-core', function (t) {
//   var db = dat(memdb(), {valueEncoding: 'json'})
//   createTableConflicts(db, function (branches) {
//     var diffStream = db.createDiffStream(branches[0], branches[1])
//     var opts = {
//       html: false,
//       limit: 10
//     }
//     visualdiff(diffStream, opts, function (err, visual, next) {
//       console.log(visual)
//       t.end()
//     })
//   })
// })

/** UTILS **/

function createTableConflicts (db, cb) {
  putFromTable(db, testData.TABLE_0, 0, function () {
    var oldHash = db.head
    putFromTable(db, testData.TABLE_1, 0 , function () {
      var oldDb = db.checkout(oldHash)
      putFromTable(oldDb, testData.TABLE_2, 0, function () {
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