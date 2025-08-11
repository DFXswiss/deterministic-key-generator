# BIP39 Tool

A tool for converting BIP39 mnemonic phrases to addresses and private keys.

## Online Version

https://deterministic-key-generator.com

## Origin

This project was originally forked by https://iancoleman.io/bip39/
The original intention to fork the repository was the desire for a tool that can display seed QR codes. 

## Features

- **BIP39 Mnemonic Generation**: Generate secure mnemonic phrases for cryptocurrency wallets
- **Private Key Conversion**: Support for WIF, Hexadecimal, and Nostr nsec formats
- **Bitcoin Ark Protocol**: Full support for Ark Layer-2 protocol with bech32m address encoding
- **Multiple Address Types**: Legacy (P2PKH), SegWit (P2WPKH), Native SegWit (Bech32), and Taproot (P2TR)
- **QR Code Generation**: Generate QR codes for seeds and addresses
- **Extensive Coin Support**: Over 200+ cryptocurrencies supported

## Usage

### Mnemonic Tab
Enter your BIP39 phrase into the 'BIP39 Phrase' field, or press 'Generate Random Phrase'

If required, set the derivation path, although the defaults are quite usable.

See the table for a list of addresses generated from the phrase.

Toggle columns to blank to easily copy/paste a single column of data, eg to import private keys into a wallet or supply someone with a list of addresses.

### Private Key Tab
Enter a private key in WIF, Hexadecimal, or Nostr nsec format to convert between formats and generate addresses.

For Bitcoin Ark Testnet, server parameters will be automatically fetched to generate proper Ark addresses.

The BIP32 keys can be used at [bip32.org](https://bip32.org) if desired.

## Supported Cryptocurrencies

The tool supports **200+ cryptocurrencies** including Bitcoin, Ethereum, and many altcoins.

### Full Support (Mnemonic & Private Key)

The following cryptocurrencies support both **BIP39 mnemonic phrases** and **private key import**:

#### Bitcoin and Variants
- **BTC** - Bitcoin
- **BTC** - Bitcoin Testnet
- **BTC** - Bitcoin RegTest
- **BTC** - Bitcoin Ark Testnet
- **LTC** - Litecoin
- **LTCt** - Litecoin Testnet

### Mnemonic Only Support

The following cryptocurrencies support **BIP39 mnemonic phrases only** (no private key import):

#### Bitcoin Forks
- **BCH** - Bitcoin Cash
- **BSV** - BitcoinSV
- **BTG** - Bitcoin Gold
- **BTCP** - Bitcoin Private
- **BTCPt** - Bitcoin Private Testnet
- **BTCZ** - Bitcoinz
- **BCA** - Bitcoin Atom

#### Litecoin Variants
- **LCC** - Litecoincash
- **LTZ** - LitecoinZ

#### Privacy Coins
- **DASH** - Dash
- **DASH** - Dash Testnet
- **ZEC** - Zcash
- **ZEN** - Horizen
- **ZCL** - Zclassic
- **FIRO** - Firo (Zcoin rebrand)
- **XZC** - Zcoin (rebranded to Firo)
- **KMD** - Komodo
- **HUSH** - Hush3
- **HUSH** - Hush (Legacy)
- **PIVX** - PIVX
- **PIVX** - PIVX Testnet
- **PART** - Particl
- **ANON** - ANON

#### Ethereum and EVM Chains
- **ETH** - Ethereum
- **ETC** - Ethereum Classic
- **BSC** - Binance Smart Chain
- **CLO** - Callisto
- **ESN** - Ethersocial Network
- **EWT** - EnergyWeb
- **EXP** - Expanse
- **ELLA** - Ellaism
- **PIRL** - Pirl
- **MIX** - MIX
- **MUSIC** - Musicoin
- **MOAC** - MOAC
- **ERE** - EtherCore
- **POA** - Poa

#### Proof of Stake Coins
- **ATOM** - Cosmos Hub
- **LUNA** - Terra
- **RUNE** - THORChain
- **IOV** - Starname
- **PPC** - Peercoin
- **NVC** - Novacoin
- **RDD** - Reddcoin
- **STRAT** - Stratis
- **TSTRAT** - Stratis Testnet
- **NAV** - Navcoin

#### UTXO-based Altcoins
- **DOGE** - Dogecoin
- **DOGEt** - Dogecoin Testnet
- **DGB** - Digibyte
- **VTC** - Vertcoin
- **VIA** - Viacoin
- **VIA** - Viacoin Testnet
- **GRS** - Groestlcoin
- **GRS** - Groestlcoin Testnet
- **MONA** - Monacoin
- **FTC** - Feathercoin
- **RVN** - Ravencoin

#### Gaming and Entertainment
- **GAME** - GameCredits
- **WGR** - Wagerr
- **CLUB** - Clubcoin
- **FLASH** - Flashcoin
- **BEET** - Beetlecoin

#### Regional Coins
- **AUR** - Auroracoin (Iceland)
- **NLG** - Gulden (Netherlands)
- **EFL** - Egulden (Netherlands)
- **CDN** - Canadaecoin (Canada)
- **BSD** - Bitsend (Germany)
- **BRIT** - Britcoin (United Kingdom)
- **CESC** - Cryptoescudo (Portugal)
- **ARYA** - Aryacoin (Iran)
- **BOLI** - Bolivarcoin (Venezuela)
- **SWTC** - Jingtum (China)

#### DeFi and Smart Contract Platforms
- **EOS** - EOSIO
- **TRX** - Tron
- **FIO** - Foundation for Interwallet Operability
- **VET** - VeChain
- **ELA** - Elastos
- **NAS** - Nebulas
- **HNS** - Handshake
- **DXN** - DEXON

#### Specialized Protocols
- **SLP** - Simple Ledger Protocol
- **OMNI** - Omnicore
- **R-BTC** - RSK
- **tR-BTC** - RSK Testnet
- **XRP** - Ripple
- **XLM** - Stellar
- **NANO** - Nano

#### Mining-focused Coins
- **XMY** - Myriadcoin
- **CPU** - CPUchain
- **MEC** - Megacoin
- **GRC** - Gridcoin
- **DNR** - Denarius
- **MNX** - Minexcoin

#### Community and Meme Coins
- **PINK** - Pinkcoin
- **POT** - Potcoin
- **THC** - Hempcoin
- **CCN** - Cannacoin
- **SMLY** - Smileycoin
- **PUT** - Putincoin

#### Legacy and Historical Coins
- **NMC** - Namecoin
- **IXC** - Ixcoin
- **BLK** - BlackCoin
- **DGC** - Digitalcoin
- **CLAM** - Clams
- **SDC** - ShadowCash
- **SDC** - ShadowCash Testnet
- **JBS** - Jumbucks
- **OK** - Okcash
- **FRST** - Firstcoin

#### Other Notable Coins
- **AC** - Asiacoin
- **ACC** - Adcoin
- **AGM** - Argoneum
- **AXE** - Axe
- **BELA** - Belacoin
- **BND** - Blocknode
- **tBND** - Blocknode Testnet
- **BST** - BlockStamp
- **BTA** - Bata
- **BITG** - Bitcoin Green
- **BTDX** - BitCloud
- **BTX** - Bitcore
- **CMP** - Compcoin
- **CRAVE** - Crave
- **CRP** - CranePay
- **CRW** - Crown
- **CRW** - Crown (Legacy)
- **CSC** - CasinoCoin
- **DFC** - Defcoin
- **DIVI** - DIVI
- **DIVI** - DIVI Testnet
- **DMD** - Diamond
- **ECN** - Ecoin
- **EDRC** - Edrcoin
- **EMC2** - Einsteinium
- **ERC** - Europecoin
- **EXCL** - Exclusivecoin
- **EXCC** - ExchangeCoin
- **FIX** - FIX
- **FIX** - FIX Testnet
- **FJC** - Fujicoin
- **GBX** - Gobyte
- **GCR** - GCRCoin
- **HNC** - Helleniccoin
- **INSN** - Insane
- **IOP** - Iop
- **KOBO** - Kobocoin
- **LBC** - Library Credits
- **LDCN** - Landcoin
- **LINX** - Linx
- **LKR** - Lkrcoin
- **LYNX** - Lynx
- **MAZA** - Maza
- **MONK** - Monkey Project
- **NEBL** - Neblio
- **NEOS** - Neoscoin
- **NIX** - NIX Platform
- **NRG** - Energi
- **NRO** - Neurocoin
- **NSR** - Nushares
- **NYC** - Newyorkc
- **ONION** - DeepOnion
- **ONX** - Onixcoin
- **PHR** - Phore
- **POSW** - POSWcoin
- **PRJ** - ProjectCoin
- **PSB** - Pesobit
- **RPD** - Rapids
- **RITO** - Ritocoin
- **RVR** - RevolutionVR
- **RBY** - Rubycoin
- **SAFE** - Safecoin
- **SCRIBE** - Scribe
- **SLS** - Salus
- **SLM** - Slimcoin
- **SLM** - Slimcoin Testnet
- **SLR** - Solarcoin
- **STASH** - Stash
- **STASH** - Stash Testnet
- **SUGAR** - Sugarchain
- **TUGAR** - Sugarchain Testnet
- **SYS** - Syscoin
- **THT** - Thought
- **TOA** - Toa
- **TWINS** - TWINS
- **TWINS** - TWINS Testnet
- **USC** - Ultimatesecurecash
- **USNBT** - NuBits
- **UNO** - Unobtanium
- **VASH** - Vpncoin
- **VIVO** - Vivo
- **WC** - Wincoin
- **XAX** - Artax
- **XBC** - Bitcoinplus
- **XVC** - Vcash
- **XVG** - Verge
- **XUEZ** - Xuez
- **XWCC** - Whitecoin Classic
- **XWC** - Whitecoin
- **ZBC** - ZooBlockchain

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
