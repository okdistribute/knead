var daff = require('daff')

function diff2daff (changes, opts, cb) {
  // takes a diff stream to new heights
  if (!cb) cb = opts

  var data1 = []
  var data2 = []

  for (var i = 0; i < changes.length; i++) {
    var change = changes[i]
    if (change[0] && change[0]['value']) {
      data1.push(change[0]['value'])
    }
    if (change[1] && change[1]['value']) {
      data2.push(change[1]['value'])
    }
  }
  var table1 = new daff.NdjsonTable(data1)
  var table2 = new daff.NdjsonTable(data2)
  var tables = [table1, table2]
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
