# Hash
A simple command line tool to hash files.

## Installation
```bash
$ npm install -g hash-cli
```

## Usage
```
Usage: hash-cli [options]

  Options:

    -h, --help                             output usage information
    -V, --version                          output the version number
    -a, --algorithm [algo]                 Algorithm to hash with. Defaults to sha1
    -d, --directory [dir]                  Directory to hash
    -f, --files [file[,file[,file[...]]]]  Files to hash
    --createOutputFiles                    Create hash files: 'FILENAME.EXT.ALG'
    --list                                 List available algorithms
    --debug                                Debug on errors
```

### Basic
```bash
$ hash-cli --algorithm sha1 --directory dir/to/hash --files file1,file2,file3
```
 - This will output the `sha1` hashes for `file1`, `file2`, and `file3` in `dir/to/hash`
 - Algorithm defaults to `sha1` and accepts anything that `require("crypto").createHash()` accepts
 - Directory defaults to `process.cwd()`
 - Files defaults to every file in the specified or current directory

### Hash every file in the directory
```bash
$ hash-cli -a md5
```
 - This will create a `.md5` file for each file in the directory

### Force creation of hash files
```bash
$ hash-cli -a sha256 -f file1.txt --createOutputFiles
```
  - Instead of outputting the shasum of `file1.txt`, this will create `file1.txt.sha256`

### List available hashing algorithms
```
$ hash-cli --list
```
  - This will list the result of `require("crypto").getHashes()`

### Debugging
```
$ hash-cli [options] --debug
```
  - If the debug option is supplied, the command will output a lot of debugging info. I'm not perfect.

## License
[MIT](LICENSE)
