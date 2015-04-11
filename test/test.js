var dat = require('dat-core')
var test = require('tape')
var from2 = require('from2')
var fs = require('fs')

var visualdiff = require('../index.js')
var testData = require('./testData.js')
var memdb = require('memdb')

var db = dat(memdb(), {valueEncoding: 'json'})

test('test js table conflicts from dat-core', function (t) {
  createTableConflicts(function (branches) {
    var diffStream = db.createDiffStream(branches[0], branches[1])
    var opts = {
      html: true,
      limit: 10
    }
    // [ { type: 'put',
    //   version: 'b6e5b78f508c8df10a504be866134ad67ddb7a64bf1e69a4b114fc297b690a78',
    //   change: 7,
    //   key: '0',
    //   value: [Object] },
    // { type: 'put',
    //   version: '447a437350c61432ee4020721ee336a3137ab6d26dcf9649d6ed9e2a2bb36dae',
    //   change: 4,
    //   key: '0',
    //   value: [Object] } ],
    visualdiff(diffStream, opts, function (err, vals, next) {
      console.log(vals)
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
  db.put(i.toString(), data[i], function () {
    putFromTable(db, data, i+1, cb)
  })
}