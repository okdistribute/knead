var dat = require('dat-core')
var test = require('tape')
var batcher = require('byte-stream')
var memdb = require('memdb')

var createDatConflicts = require('./createDatConflicts.js')
var dough = require('../index.js')
var DATA = require('test-data')

var TABLES = DATA.CONFLICTS.SMALL

test('dough', function (t) {
  var db = dat(memdb(), {valueEncoding: 'json'})
  createDatConflicts(db, TABLES, function (heads) {
    var diffStream = db.createDiffStream(heads[0], heads[1])

    var doughStream = dough()

    doughStream.merge = function (output, visual, next) {
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

    diffStream.pipe(batchStream).pipe(doughStream)
  })
})
