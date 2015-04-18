var argv = require('minimist')(process.argv.slice(2))
var dat = require('dat-core')
var prompt = require('prompt')

var visualdiff = require('./')
if (argv._.length < 2) return usage()

var branch1 = argv._[0]
var branch1 = argv._[1]

var opts = {
  db: dat(argv.db),
  limit: argv.limit || 20,
  strategy: 'page'
}

var onDiff = function (table1, table2, output, next) {
  repl(table1, table2, output, next)
})

var differ = visualdiff(branch1, branch2, opts, onDiff)

// TODO: add atom-shell app view option

function repl (table1, tabel2, output, next) {
  var self = this
  console.log(output)

  function doprompt ()
    prompt('Keep this chunk? [y,n,s,e,q,?]', function (val) {
      if (val === 's' || val === 'skip') {
        return next()
      }
      if (val === 'y' || val === 'yes') {
        differ.merge() // TODO: choose newer version
        return next()
      }
      if (val === 'n' || val === 'no') {
        differ.decline() // TODO: choose older version
        return next()
      }
      if (val === 'r' || val === 'rows') {
        opts.strategy = 'rows'
        return visualdiff(branch1, branch2, opts, onDiff)
      }
      if (val === 'c' || val === 'cols') {
        opts.strategy = 'cols'
        return visualdiff(branch1, branch2, opts, onDiff)
      }
      if (val === 'q' || val === 'quit') {
        return process.exit()
      }
      else {
        help()
        doprompt()
      }

    })

  }
}

function help () {
  console.log('skip (s), yes (y), no (n), cols (c), rows (r), quit (q)')
}

function usage () {
  console.log("dat-VisualDiff <head1> <head2> --db <dat-db> [--limit <num>]")
}