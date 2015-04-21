module.exports = createDatConflicts

function createDatConflicts (db, tables, cb) {
  putFromTable(db, tables[0], 0, function () {
    var oldHash = db.head
    putFromTable(db, tables[1], 0 , function () {
      var oldDb = db.checkout(oldHash)
      putFromTable(oldDb, tables[2], 0, function () {
        db.heads(function (err, heads) {
          cb(heads)
        })
      })
    })
  })
}

function putFromTable (db, data, i, cb) {
  if (i === data.length) return cb()
  db.put(data[i]['country'], data[i], function () {
    putFromTable(db, data, i+1, cb)
  })
}