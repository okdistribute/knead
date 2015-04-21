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
    var diffStream = db.createDiffStream(heads[0], heads[1])

    function merger (output, visual, writer, next) {
      var table1 = output.tables[0]
      var table2 = output.tables[1]


      t.equals(table1.height, 3)
      t.equals(table2.height, 4)
      t.deepEquals(table1.columns, ['capital', 'country'])
      t.deepEquals(table2.columns, ['capital', 'code', 'country'])
      t.same(typeof visual, 'string')
      t.same(typeof writer, 'function')
      t.same(typeof next, 'function')
      t.end()
    }

    var opts = {
      merger: merger,
      limit: 3
    }

    visualdiff(diffStream, opts, function () {} )
  })
})
