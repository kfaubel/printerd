# printerd
Scans a queue directory and sends pdf files to a printer.  Once complete it moves the file to the 'complete' directory

## Setup
```
npm install
npm run build
npm install -g
```

## Usage:
```
Usage: printerd [options]

```
### Options:
```
  -v, --verbose            Enable extra logging
  -t, --testonly           Process the pdf but don't actually send it to the printer
  -h, --help               Show help only
  -l, --list               List the printers only
  -q, --queue <queue>      directory for printer queue
  -p, --printer <printer>  Printer name
```

### Examples:
```
$ printerd -l         
$ printerd --printer EPSON645 --queue "c:\\Users\Ken\\My Drive\\EPSON645"
```