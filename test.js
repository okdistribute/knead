var dat = require('dat-core')
var rimraf = require('rimraf')

var daff = require('daff')

rimraf.sync('./testdb')

var db = dat('./testdb')

var visualdiff = require('./index.js')


createConflicts(function (branches) {
  var stream = db.compare(branches)
  stream.pipe(process.stdout)
})


function createConflicts(cb) {
  db.put('hello', 'world', function () {
    var oldHash = db.head
    db.put('hello', 'verden', function () {
      var oldDb = db.checkout(oldHash)

      oldDb.put('hello', 'mars', function (err) {
        oldDb.branches('default', function (err, branches) {
          console.log('branches', branches)
          cb(branches)
        })
      })
    })
  })
}


function getDaffReady(cb) {

}


