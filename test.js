var test = require('tape')
var diff = require('sorted-diff-stream')
var DATA = require('conflict-spectrum')
var from = require('from2')
var diff2daff = require('diff2daff')
var diffs2string = require('diffs-to-string')

var knead = require('./')

var TABLES = DATA[0].json

test('knead from sorted-diff-stream using daff-stream', function (t) {
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
  var opts = {
    limit: 3,
    vizFn: diff2daff
  }

  knead(diffStream, opts, function (diffs, visual, push, next) {
    var cols = Object.keys(diffs[0][0])
    var cols2 = Object.keys(diffs[0][1])

    t.deepEquals(cols, ['country', 'capital'])
    t.deepEquals(cols2, ['country', 'code', 'capital'])
    t.same(typeof next, 'function')
    t.end()
  })
})

test('knead from sorted-diff-stream using the simple differ', function (t) {
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
  var opts = {
    limit: 10
  }

  knead(diffStream, opts, function (tables, visual, push, next) {
    console.log(tables)
    console.log(visual)
    t.end()
  })
})


