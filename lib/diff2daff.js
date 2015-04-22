var daff = require('daff')
var debug = require('debug')('diff2daff')

function diff2daff (changes, opts, cb) {
  // takes a diff stream to new heights
  if (!cb) cb = opts
  var rowPath = opts.rowPath || function (data) { return data }
  var data1 = []
  var data2 = []

  for (var i = 0; i < changes.length; i++) {
    var change = changes[i]
    var row
    if (change[0]) {
      row = change[0]
      debug('pushing', row)
      data1.push(row)
    }
    if (change[1]) {
      row = change[1]
      debug('pushing', row)
      data2.push(row)
    }
  }
  var table1 = new daff.NdjsonTable(data1, rowPath)
  var table2 = new daff.NdjsonTable(data2, rowPath)
  var tables = [table1, table2]
  debug(tables)
  var visual = tablesToVisual(tables, opts)

  cb(tables, visual)
}

function tablesToVisual (tables, opts) {
  var flags = new daff.CompareFlags()

  var table1 = tables[0]
  var table2 = tables[1]

  var alignment = daff.compareTables(table1, table2, flags).align()
  var highlighter = new daff.TableDiff(alignment, flags)
  var table_diff = new daff.SimpleTable()
  highlighter.hilite(table_diff)

  if (opts.html) {
    var diff2html = new daff.DiffRender()
    diff2html.render(table_diff)
    var table_diff_html = diff2html.html()
    return table_diff_html
  } else {
    var diff2terminal = new daff.TerminalDiffRender()
    return diff2terminal.render(table_diff)
  }
}

module.exports = diff2daff
