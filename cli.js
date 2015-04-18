var argv = require('minimist')(process.argv.slice(2))
var dat = require('dat-core')
var prompt = require('prompt')

var visualdiff = require('./')

if (argv._.length < 2) return usage()

var db = dat(argv.db)
var branch1 = argv._[0]
var branch1 = argv._[1]

var differ = new visualdiff(db, branch1, branch2, function (table1, table2, output, next) {
  repl(table1, table2, output, next)
})

// TODO: add atom-shell app view option

function repl (table1, tabel2, output, next) {
  var self = this
  console.log(output)

  function doprompt ()
    prompt('Keep this chunk? [y,n,s,e,q,?]', function (val) {
      if (val === 's' || val === 'skip') {
        next()
      }
      if (val === 'y' || val === 'yes') {
        differ.merge() // TODO: choose newer version
        next()
      }
      if (val === 'n' || val === 'no') {
        differ.decline() // TODO: choose older version
        next()
      }
      if (val === 'r' || val === 'rows') {
        // remake differ
      }
      if (val === 'c' || val === 'cols') {
        // remake differ
      }
      if (val === '?' || val === 'help') {
        help()
      }
      if (val === 'q' || val === 'quit') {
        return process.exit()
      }
      else help()
    })
  }
}

function help () {
  console.log('skip (s), yes (y), no (n), cols (c), rows (r), quit (q)')
}

function usage () {
  console.log("dat-VisualDiff <head1> <head2> --db <dat-db> [--limit <num>]")
}