var batcher = require('byte-stream')
var through = require('through2')
var debug = require('debug')('visualdiff')
var promptSync = require('prompt-sync')
var Stream = require('stream').Writable

var diff2daff = require('./lib/diff2daff.js')

function VisualDiff (diffStream, opts, cb) {
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
  if (!(this instanceof VisualDiff)) return new VisualDiff(diffStream, opts, cb)
  if (!cb) throw new Error('what do I do with the mergeStream? give me an cb')

  var self = this

  if (!opts) opts = {}

  self.limit = (opts.limit || 20) * 2
  self.strategy = opts.strategy || 'rows'

  var mergeStream = new Stream()
  var batchedStream = batcher(self.limit)

  var merger = opts.merger || defaultCli
  var writer = opts.writer || mergeStream.write


  batchedStream.on('end', function () {
    cb(mergeStream)
  })

  diffStream
    .pipe(batchedStream)
    .pipe(through.obj(function (diffs, enc, next) {
      diff2daff(diffs, function (tables, visual) {
        var output = {
          changes: diffs,
          tables: tables
        }
        debug('visualdiff callback', output, visual)

        merger(output, visual, writer, next)
      })
    })
  )
}

function defaultCli (output, visual, writer, next) {
  console.log(visual)

  var changes = output.changes
  var tables = output.tables
  console.log(tables)

  function repl () {
    // TODO: change limit in repl (like git's add -p or e/edit)
    process.stdout.write('Keep this chunk? [y,n,s,q,?] ')
    var val = promptSync()
    if (val === 's' || val === 'skip') {
      return next()
    }
    if (val === 'y' || val === 'yes') {
      for (choice in tables[0]) {
        writer(choices[choice][1])
      }
      return next()
    }
    if (val === 'n' || val === 'no') {
      for (choice in tables[1]) {
        writer(choices[choice])
      }
      return next()
    }
    if (val === 'q' || val === 'quit') {
      end(mergeStream)
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

function usage () {
  console.log('dat-visualDiff <dat-db> [--limit <num>] [--heads <head1,head2>]')
}


module.exports = VisualDiff
