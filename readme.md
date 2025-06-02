# BIP39 Tool

A tool for converting BIP39 mnemonic phrases to addresses and private keys.

## Online Version

https://deterministic-key-generator.com

## Origin

This project was originally forked by https://iancoleman.io/bip39/
The original intention to fork the repository was the desire for a tool that can display seed QR codes. 

## Usage

Enter your BIP39 phrase into the 'BIP39 Phrase' field, or press
'Generate Random Phrase'

If required, set the derivation path, although the defaults are quite usable.

See the table for a list of addresses generated from the phrase.

Toggle columns to blank to easily copy/paste a single column of data, eg to
import private keys into a wallet or supply someone with a list of addresses.

The BIP32 keys can be used at [bip32.org](https://bip32.org) if desired.

## Making changes

Please do not make modifications to `bip39-standalone.html`, since they will
be overwritten by `compile.py`.

Make changes in `src/*`.

Changes are applied during release using the command `python compile.py`, so
please do not commit changes to `bip39-standalone.html`

# Tests

Tests depend on

* nodejs
* selenium webdriver - cd /path/to/bip39/tests; npm install
* selenium driver for firefox ([geckodriver](https://github.com/mozilla/geckodriver/releases)) and / or chrome ([chromedriver](https://sites.google.com/a/chromium.org/chromedriver/downloads))
* jasmine - npm install --global jasmine

Before running tests, the site must be served at http://localhost:8000.

```
$ cd /path/to/bip39/src
$ python -m http.server

or for python2
$ python -m SimpleHTTPServer
```

Run tests from the command-line

```
$ cd /path/to/bip39/tests
$ jasmine spec/tests.js
```

# License

This BIP39 tool is released under the terms of the MIT license. See LICENSE for
more information or see https://opensource.org/licenses/MIT.
