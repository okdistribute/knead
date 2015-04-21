var dat = require('dat-core')
var test = require('tape')
var from2 = require('from2')
var fs = require('fs')
var memdb = require('memdb')

var createDatConflicts = require('./createDatConflicts.js')
var dat2daff = require('../lib/dat2daff.js')
var visualdiff = require('../index.js')
var testData = require('./testData.js')

var TABLES = [
  testData.COUNTRIES_0,
  testData.COUNTRIES_1,
  testData.COUNTRIES_2
]

test('visualdiff terminal', function (t) {
  var db = dat(memdb(), {valueEncoding: 'json'})
  createDatConflicts(db, TABLES, function (heads) {
    var opts = {
      db: db,
      html: false,
      limit: 3
    }
    visualdiff(heads, opts, function (data, visual, next) {
      var table1 = data.tables[0]
      var table2 = data.tables[1]

      t.equals(data.heads, heads)
      t.equals(data.older, 'left')
      t.equals(table1.height, 3)
      t.equals(table2.height, 4)
      t.deepEquals(table1.columns, ['capital', 'country'])
      t.deepEquals(table2.columns, ['capital', 'code', 'country'])
      t.same(typeof(visual), 'string')
      t.same(typeof(next), 'function')
      t.end()
    })
  })
})

test('visualdiff older switches with head switch', function (t) {
  var db = dat(memdb(), {valueEncoding: 'json'})
  createDatConflicts(db, TABLES, function (heads) {
    var opts = {
      db: db,
      html: false,
      limit: 3
    }
    heads = [heads[1], heads[0]]
    visualdiff(heads, opts, function (data, visual, next) {
      var table1 = data.tables[1]
      var table2 = data.tables[0]

      t.equals(data.heads, heads)
      t.equals(data.older, 'right')
      t.equals(table1.height, 3)
      t.equals(table2.height, 4)
      t.deepEquals(table1.columns, ['capital', 'country'])
      t.deepEquals(table2.columns, ['capital', 'code', 'country'])
      t.same(typeof(visual), 'string')
      t.same(typeof(next), 'function')
      t.end()
    })
  })
})


test('dat2daff.fromReadStreams with limit', function (t) {
  var db = dat(memdb(), {valueEncoding: 'json'})
  createDatConflicts(db, TABLES, function (heads) {
    var stream1 = db.checkout(heads[0]).createReadStream()
    var stream2 = db.checkout(heads[1]).createReadStream()
    var opts = {
      html: false,
      limit: 20
    }
    dat2daff.fromReadStreams(stream1, stream2, opts, function (tables, visual, next) {
      var table1 = tables[0]
      var table2 = tables[1]
      t.equals(table1.height, 5)
      t.equals(table2.height, 12)
      t.deepEquals(table1.columns, ['capital', 'country'])
      t.deepEquals(table2.columns, ['capital', 'code', 'country'])
      t.same(typeof(visual), 'string')
      t.same(typeof(next), 'function')
      t.end()
    })
  })
})


test('dat2daff.fromReadStreams without limit should default to 50', function (t) {
  var db = dat(memdb(), {valueEncoding: 'json'})
  createDatConflicts(db, TABLES, function (heads) {
    var stream1 = db.checkout(heads[0]).createReadStream()
    var stream2 = db.checkout(heads[1]).createReadStream()
    var opts = {
      html: false,
    }
    dat2daff.fromReadStreams(stream1, stream2, opts, function (tables, visual, next) {
      var table1 = tables[0]
      var table2 = tables[1]
      t.equals(table1.height, 5)
      t.equals(table2.height, 12)
      t.deepEquals(table1.columns, ['capital', 'country'])
      t.deepEquals(table2.columns, ['capital', 'code', 'country'])
      t.same(typeof(visual), 'string')
      t.same(typeof(next), 'function')
      t.end()
    })
  })
})
