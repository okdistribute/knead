var dat = require('dat-core')
var test = require('tape')
var memdb = require('memdb')

var createDatConflicts = require('./createDatConflicts.js')
var visualdiff = require('../index.js')
var DATA = require('test-data')

var TABLES = DATA.CONFLICTS.SMALL

test('visualdiff terminal', function (t) {
  var db = dat(memdb(), {valueEncoding: 'json'})
  createDatConflicts(db, TABLES, function (heads) {
    var opts = {
      db: db,
      html: false,
      limit: 3
    }
    var diffStream = db.createDiffStream(heads[0], heads[1])

    visualdiff(diffStream, opts, function (data, visual, next) {
      var table1 = data.tables[0]
      var table2 = data.tables[1]

      t.equals(data.older, 'left')
      t.equals(table1.height, 3)
      t.equals(table2.height, 4)
      t.deepEquals(table1.columns, ['capital', 'country'])
      t.deepEquals(table2.columns, ['capital', 'code', 'country'])
      t.same(typeof visual, 'string')
      t.same(typeof next, 'function')
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
    var diffStream = db.createDiffStream(heads[1], heads[0])

    visualdiff(diffStream, opts, function (data, visual, next) {
      var table1 = data.tables[1]
      var table2 = data.tables[0]

      t.equals(data.older, 'right')
      t.equals(table1.height, 3)
      t.equals(table2.height, 4)
      t.deepEquals(table1.columns, ['capital', 'country'])
      t.deepEquals(table2.columns, ['capital', 'code', 'country'])
      t.same(typeof visual, 'string')
      t.same(typeof next, 'function')
      t.end()
    })
  })
})
