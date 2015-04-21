# dat-visualdiff

A visual differ for use with dat. Please don't be shy. This is experimental.


## Usage
Only for use in development right now.
```
node cli.js <dat-db> [--limit <num>] [--heads <head1,head2>]
```

## See it in (preliminary) action

```
node tests/createDatConflicts.js conflicted
node cli.js tests/conflicted
```


