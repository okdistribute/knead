# dough

A manual visual diff tool. See cli.js or test.js for JS usage examples.

![dat](http://img.shields.io/badge/Development%20sponsored%20by-dat-green.svg?style=flat)

## Usage
```
dough <dat-db> [--limit <num>] [--heads <head1,head2>]
```

```
dough a.csv b.csv c.csv
```

## See it in (preliminary) action

```
node tests/createDatConflictedDb.js conflicted
node cli.js tests/conflicted
```

