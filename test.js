var dat = require('dat-core')
var rimraf = require('rimraf')
var visualdiff = require('./index.js')
var JSONStream = require('JSONStream')

rimraf.sync('./testdb')
var db = dat('./testdb')


TEST_DATA = [
  {
    key: 'asdb32',
    changes: [
      { 'branch': 'branchA', row: {country: 'ireland', captial: 'dublin'}},
      { 'branch': 'branchB', row: {country: 'ireland', code: 'ie', capital: 'dublin'}},
    ],
  },
  {
    key: 'asdb32',
    changes: [
      { 'branch': 'branchA', row: {country: 'france', captial: 'paris'}},
      { 'branch': 'branchB', row: {country: 'france', code: 'fr', capital: 'paris'}},
    ],
  },
  {
    key: 'nbndf2',
    changes: [
      { 'branch': 'branchA', row: {country: 'spain', capital: 'madrid'}},
      { 'branch': 'branchB', row: {country: 'spain', code: 'es', capital: 'barcelona'}}
    ],
  },
  {
    key: 'nbndf2',
    changes: [
      { 'branch': 'branchA', row: null},
      { 'branch': 'branchB', row: {country: 'germany', code: 'de', capital: 'berlin'}}
    ],
  }
]

createConflicts(function (branches) {
  var datDiffer = new visualdiff(db)
  datDiffer.changes2html(TEST_STREAM, function (html) {
    console.log(html)
  })
})

// createConflicts(function (branches) {
//   var datDiffer = new visualdiff(db)
//   var html = datDiffer.diff2html()
// })


function createConflicts(cb) {
  db.put('hello', 'world', function () {
    var oldHash = db.head
    db.put('hello', 'verden', function () {
      var oldDb = db.checkout(oldHash)

      oldDb.put('hello', 'mars', function (err) {
        oldDb.branches('default', function (err, branches) {
          cb(branches)
        })
      })
    })
  })
}

