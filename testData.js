module.exports = {}

module.exports.CHANGES = [
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

module.exports.TABLE_0 =  [{country: 'germany'},
                {country: 'ireland'},
                {country: 'france'}]

module.exports.TABLE_1 = [{country: 'ireland', captial: 'dublin'},
               {country: 'france', captial: 'paris'},
               {country: 'spain', capital: 'madrid'}]

module.exports.TABLE_2 =  [{country: 'germany', code: 'de', capital: 'berlin'},
                {country: 'ireland', code: 'ie', capital: 'dublin'},
                {country: 'france', code: 'fr', capital: 'paris'},
                {country: 'spain', code: 'es', capital: 'barcelona'}]

