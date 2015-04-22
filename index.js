var debug = require('debug')('dough')
var promptSync = require('prompt-sync')
var Transform = require('stream').Transform
var inherits = require('inherits')
var diff2daff = require('./lib/diff2daff.js')

inherits(KneadStream, Transform)
function KneadStream (opts) {
  /*
  strategy:
    - 'rows': by limit of row, seeing the full table
    - 'cols': by each column that has been identified as 'mostly changed', 'added', or 'deleted'

  returns:
    onDiff(output, visual, next)
    - output: object
      {
        tables: daff tables,
        changes: batched dat diffStream
      }

    - visual: string
    - next: function
  */
  if (!(this instanceof KneadStream)) return new KneadStream(opts)
  Transform.call(this, {objectMode: true})

  if (!opts) opts = {}
  this.destroyed = false
  // TODO: always does 'by row' right now.
  opts.strategy = opts.strategy || 'rows'
  this.opts = opts
}

KneadStream.prototype._transform = function (data, enc, next) {
  var self = this
  debug('_transform', data)
  var opts = {
    rowPath: self.opts.rowPath
  }
  diff2daff(data, opts, function (tables, visual) {
    var output = {
      changes: data,
      tables: tables
    }
    self.merge(output, visual, next)
  })
}

KneadStream.prototype.merge = function (output, visual, next) {
  var self = this
  debug('merge', output)
  console.log(visual)

  var tables = output.tables
  var older = tables[0]
  var newer = tables[1]

  function repl () {
    // TODO: change limit in repl (like git's add -p or e/edit)
    process.stdout.write('Keep this chunk? [y,n,s,q,?] ')
    var val = promptSync()
    if (val === 's' || val === 'skip') {
      return next()
    }
    if (val === 'y' || val === 'yes') {
      for (var i in newer.data) {
        debug('pushing', newer.data[i])
        self.push(newer.data[i])
      }
      return next()
    }
    if (val === 'n' || val === 'no') {
      for (i in older.data) {
        debug('pushing', older.data[i])
        self.push(older.data[i])
      }
      return next()
    }
    if (val === 'q' || val === 'quit') {
      self.end()
      process.exit()
    } else {
      help()
      repl()
    }
  }
  repl()
}

function help () {
  console.log('skip (s), yes (y), no (n), quit (q)')
}

KneadStream.prototype.destroy = function (err) {
  if (this.destroyed) return
  this.destroyed = true

  this.err = err
  this.end()
}

module.exports = KneadStream
