#!/usr/bin/env node

const program = require('commander');
const fs = require('fs');
const { red, green, yellow } = require('chalk');

const converter = require('./lib/gettextWrapper');
const pkg = require('./package.json');

// test calls:

// gettext -> i18next
// node program.js -l en -s ./test/_testfiles/en/translation.utf8.po -t ./test/_tmp/en.json
// node program.js -l de -s ./test/_testfiles/de/translation.utf8.po -t ./test/_tmp/de.json
// node program.js -l ru -s ./test/_testfiles/ru/translation.utf8.po -t ./test/_tmp/ru.json
//
// With filter:
// node program.js -l en -s ./test/_testfiles/en/translation.utf8.po -t ./test/_tmp/en.json -f path/to/filter.js

// i18next -> gettext
// node program.js -l de -s ./test/_testfiles/de/translation.utf8.json -t ./test/_tmp/de.po
// and back
// node program.js -l de -s ./test/_tmp/de.po -t ./test/_tmp/de.json

// program
program
  .version(pkg.version)
  .option('-b, --base [path]', 'Sepcify path for the base language file. only take effect with -K option', '')
  .option('-f, --filter [path]', 'Specify path to gettext filter')
  .option('-l, --language [domain]', 'Specify the language code, eg. \'en\'')
  .option('-p, --pot', 'Generate POT file.')
  .option('-s, --source [path]', 'Specify path to read from')
  .option('-t, --target [path]', 'Specify path to write to', '')
  .option('-K, --keyasareference', 'Deal with the reference comment as a key', false)
  .option('-ks, --keyseparator [path]', 'Specify keyseparator you want to use, defaults to ##', '##')
  .option('-P, --plurals [path]', 'Specify path to plural forms definitions')
  .option('--quiet', 'Silence output', false)
  .option('--splitNewLine', 'Silence output', false)
  .option('--ctxSeparator [sep]', 'Specify the context separator', '_')
  .option('--ignorePlurals', 'Do not process the plurals')
  .parse(process.argv);

if (program.source && program.language) {
  if (program.pot && !program.base) {
    console.log(red('\nat least call with argument -p and -b.'));
    console.log('(call program with argument -h for help.)\n\n');
    process.exit();
  }
  const options = {
    base: program.base,
    ctxSeparator: program.ctxSeparator,
    ignorePlurals: program.ignorePlurals,
    language: program.language,
    keyasareference: program.keyasareference,
    keyseparator: program.keyseparator,
    plurals: program.plurals,
    pot: program.pot,
    quiet: program.quiet,
    splitNewLine: program.splitNewLine,
  };

  if (program.filter && fs.existsSync(program.filter)) {
    options.filter = require(program.filter); // eslint-disable-line global-require
  }

  if (!options.quiet) console.log(yellow('\nstart converting'));

  converter.process(program.language, program.source, program.target, options, err => {
    if (err) {
      console.log(red('\nfailed writing file\n\n'));
    } else if (!options.quiet) {
      console.log(green('\nfile written\n\n'));
    }
  });
} else {
  console.log(red('\nat least call with argument -l and -s.'));
  console.log('(call program with argument -h for help.)\n\n');
}

// expose to the world
module.exports = converter;
