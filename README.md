# knead

![dat](http://img.shields.io/badge/Development%20sponsored%20by-dat-green.svg?style=flat)

#### Knead your doughy data. Resolve Not Small Data conflicts with manual merges.

Not Small Data. /nät/ /smôl/ /dādə/ (noun).
When data conflicts are sufficiently troubling to resolve manually.

![diff](/images/diff.png)

You can send two files into `knead`. The user is presented with a [daff](https://github.com/paulfitz/daff) for each chunk, prompting to either 'keep' the changes or not.

## Usage

```
knead <base-file> <changed-file> <resolved-file> [--format csv,ndjson,json] [--limit <num>]
```

`base-file`: also known as `local file`, this is the file that will work as the 'truth' for the diff

`changed-file`: also known as `remote file`, this is the file that is proposing changes

`resolved-file`: this is where the approved or disapproved changes will be saved.


## JS

See cli.js or test.js for using this module in js.