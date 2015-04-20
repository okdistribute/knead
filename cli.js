var argv = require('minimist')(process.argv.slice(2))
var dat = require('dat-core')
var prompt = require('prompt-sync')

var visualdiff = require('./')
if (argv._.length != 1) return usage()

var differ

var opts = {
  db: dat(argv._[0], { valueEncoding: 'json' }),
  limit: argv.limit || 20,
  strategy: 'pages'
}

function makeDiffer (heads) {
  differ = visualdiff(heads[0], heads[1], opts, onDiff)
}

function onDiff (table1, table2, output, next) {
  repl(table1, table2, output, next)
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

// TODO: add atom-shell app view option

function repl (table1, tabel2, output, next) {
  var self = this
  console.log(output)

  function doprompt () {
    process.stdout.write('Keep this chunk? [y,n,s,e,q,?] ')
    var val = prompt()
    if (val === 's' || val === 'skip') {
      return next()
    }
    if (val === 'y' || val === 'yes') {
     // differ.merge() // TODO: choose 'newer' version
      return next()
    }
    if (val === 'n' || val === 'no') {
     // differ.decline() // TODO: choose 'older' version
      return next()
    }
    if (val === 'r' || val === 'rows') {
      opts.strategy = 'rows'
      differ = visualdiff(branch1, branch2, opts, onDiff)
      return
    }
    if (val === 'c' || val === 'cols') {
      opts.strategy = 'cols'
      differ = visualdiff(branch1, branch2, opts, onDiff)
      return
    }
    if (val === 'q' || val === 'quit') {
      return process.exit()
    }
    else {
      help()
      doprompt()
    }
  }
  doprompt()
}

function help () {
  console.log('skip (s), yes (y), no (n), cols (c), rows (r), quit (q)')
}

function usage () {
  console.log("dat-visualDiff <dat-db> [--limit <num>] [--heads <head1,head2>]")
}