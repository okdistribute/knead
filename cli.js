var argv = require('minimist')(process.argv.slice(2))
var dat = require('dat-core')
var prompt = require('prompt-sync')

var visualdiff = require('./')
if (argv._.length != 1) return usage()

var differ

var opts = {
  db: dat(argv._[0], { valueEncoding: 'json' }),
  limit: argv.limit || 20,
  strategy: 'rows',
  html: false // TODO: make atom shell option
}

function makeDiffer (heads) {
  var diffStream = opts.db.createDiffStream(heads[0], heads[1])
  visualdiff(diffStream, opts, function (data, visual, next) {
    console.log(visual)

    var changes = data.changes
    var tables = data.tables
    var older = data.older // 'left' or 'right'

    function repl () {
      // TODO: change limit in repl (like git's add -p or e/edit)
      process.stdout.write('Keep this chunk? [y,n,s,r,c,q,?] ')
      var val = prompt()
      if (val === 's' || val === 'skip') {
        return next()
      }
      if (val === 'y' || val === 'yes') {
        // TODO: choose 'newer' version
        return next()
      }
      if (val === 'n' || val === 'no') {
        // TODO: choose 'older' version
        return next()
      }
      if (val === 'r' || val === 'rows') {
        opts.strategy = 'rows'
        // todo
        return
      }
      if (val === 'c' || val === 'cols') {
        opts.strategy = 'cols'
        // todo
        return
      }
      if (val === 'q' || val === 'quit') {
        return process.exit()
      }
      else {
        help()
        repl()
      }
    }
    repl()
  })
}

if (!argv.heads) {
  opts.db.heads(function (err, heads) {
    makeDiffer(heads)
  })
}
else {
  heads = argv.heads.split(',')
  makeDiffer(heads)
}

function help () {
  console.log('skip (s), yes (y), no (n), cols (c), rows (r), quit (q)')
}

function usage () {
  console.log('dat-visualDiff <dat-db> [--limit <num>] [--heads <head1,head2>]')
}
