var dat = require('dat-core')
var test = require('tape')
var batcher = require('byte-stream')
var memdb = require('memdb')
var diff = require('sorted-diff-stream')
var from = require('from2')

var createDatConflicts = require('./createDatConflicts.js')
var knead = require('../index.js')
var DATA = require('test-data')

var TABLES = DATA.CONFLICTS.SMALL

test('dat knead', function (t) {
  var db = dat(memdb(), {valueEncoding: 'json'})
  createDatConflicts(db, TABLES, function (heads) {
    var diffStream = db.createDiffStream(heads[0], heads[1])

    var opts = {
      rowPath: function (row) { return row['value'] }
    }
    var kneadStream = knead(opts)

    kneadStream.merge = function (output, visual, next) {
      var table1 = output.tables[0]
      var table2 = output.tables[1]
      console.log(visual)

      t.equals(table1.height, 3)
      t.equals(table2.height, 4)
      t.deepEquals(table1.columns, ['capital', 'country'])
      t.deepEquals(table2.columns, ['capital', 'code', 'country'])
      t.same(typeof visual, 'string')
      t.same(typeof next, 'function')
      t.end()
    }

    var batchStream = batcher(3 * 2)

    diffStream.pipe(batchStream).pipe(kneadStream)
  })
})

test('knead from sorted-diff-stream', function (t) {
  function keyData (data) {
    var index = 0
    data.map(function (obj) {
      var rObj = {}
      rObj.key = index
      rObj.value = obj
      index++
      return rObj
    })
    return data
  }

  var older = from.obj(keyData(TABLES[1]))
  var newer = from.obj(keyData(TABLES[2]))

  function jsonEquals (a, b, cb) {
    if (JSON.stringify(a) === JSON.stringify(b)) cb(null, true)
    else cb(null, false)
  }

  var diffStream = diff(older, newer, jsonEquals)

  var kneadStream = knead()

  kneadStream.merge = function (output, visual, next) {
    var table1 = output.tables[0]
    var table2 = output.tables[1]
    console.log(visual)

    t.equals(table1.height, 4)
    t.equals(table2.height, 4)
    t.deepEquals(table1.columns, ['capital', 'country'])
    t.deepEquals(table2.columns, ['capital', 'code', 'country'])
    t.same(typeof visual, 'string')
    t.same(typeof next, 'function')
    t.end()
  }

  var batchStream = batcher(3 * 2)

  diffStream.pipe(batchStream).pipe(kneadStream)
})
