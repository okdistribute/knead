var dat = require('dat-core')
var daff = require('daff')
var debug = require('debug')('daff.visualdiff')
var through = require('through2')

module.exports = datVisualDiff

function datVisualDiff (dat) {
  this.dat = dat
}

datVisualDiff.prototype.changes2html = function (changesStream, cb) {
  var ndjson1 = ''
  var ndjson2 = ''

  changesStream.pipe(through.obj(function (change) {
    console.log('sup')
    ndjson1.concat(JSON.stringify(change.changes[0].row) + '\n')
    ndjson2.concat(JSON.stringify(change.changes[1].row) + '\n')
  }))

  changesStream.on('end', function () {
    ndjson2html(ndjson1, ndjson2, cb)
  })
}

datVisualDiff.prototype.ndjson2html = function (ndjson1, ndjson2, cb) {
  var data1 = new daff.SimpleTable(0,0)
  var data2 = new daff.SimpleTable(0,0)

  var table1 = new daff.Ndjson(data1)
  var table2 = new daff.Ndjson(data2)
  table1.parse(ndjson1)
  table2.parse(ndjson2)
  var alignment = daff.compareTables(table1,table2).align();

  var data_diff = [];
  var table_diff = new daff.TableView(data_diff);
  var flags = new daff.CompareFlags();
  var highlighter = new daff.TableDiff(alignment,flags);

  debug('highlighter', highlighter)
  highlighter.hilite(table_diff);
  var diff2html = new daff.DiffRender();
  debug('table_diff', table_diff)

  diff2html.render(table_diff);
  var table_diff_html = diff2html.html();
  cb(table_diff_html)

}

datVisualDiff.prototype.diff2html = function (branches) {
  var stream = this.dat.compare(branches)
  return this.changes2html(stream)
}
