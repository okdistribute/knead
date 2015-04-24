var test = require('tape')
var diff = require('sorted-diff-stream')
var DATA = require('conflict-spectrum')
var from = require('from2')

var knead = require('./')

var TABLES = DATA.CONFLICTS.SMALL

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

  knead(diffStream, { limit: 3 }, function (tables, visual, push, next) {
    var table1 = tables[0]
    var table2 = tables[1]
    console.log(visual)

    t.equals(table1.height, 4)
    t.equals(table2.height, 4)
    t.deepEquals(table1.columns, ['capital', 'country'])
    t.deepEquals(table2.columns, ['capital', 'code', 'country'])
    t.same(typeof visual, 'string')
    t.same(typeof next, 'function')
    t.end()
  })
})
