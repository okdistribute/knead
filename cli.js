var argv = require('minimist')(process.argv.slice(2))
var dat = require('dat-core')

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
  visualdiff(heads, opts)
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

