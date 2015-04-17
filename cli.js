var argv = require('minimist')(process.argv.slice(2))
var dat = require('dat-core')
var prompt = require('prompt')

var visualdiff = require('./')

if (argv._.length < 2) return usage()

var db = dat(argv.db)
var branch1 = argv._[0]
var branch1 = argv._[1]

var differ = new visualdiff(db, branch1, branch2)

repl()
// TODO: add atom-shell app view option

function repl () {
  var self = this
  var visual = differ.visual
  if (!visual) return process.exit()
  console.log(visual)

  prompt('Keep this chunk? [y,n,s,e,q,?]', function (val) {
    if (val === 's' || val === 'skip') {
      differ.next()
    }
    if (val === 'y' || val === 'yes') {
      differ.merge() // TODO: choose newer version
      differ.next()
    }
    if (val === 'n' || val === 'no') {
      differ.decline() // TODO: choose older version
      differ.next()
    }
    if (val === 'r' || val === 'rows') {
      differ.strategy = 'rows'
    }
    if (val === 'c' || val === 'cols') {
      differ.strategy = 'cols'
    }
    if (val === '?' || val === 'help') {
      help()
    }
    if (val === 'q' || val === 'quit') {
      return process.exit()
    }
    else help()

    // all over again...
    repl()
  })
}

function help () {
  console.log('skip (s), yes (y), no (n), cols (c), rows (r), quit (q)')
}

function usage () {
  console.log("dat-VisualDiff <head1> <head2> --db <dat-db> [--limit <num>]")
}