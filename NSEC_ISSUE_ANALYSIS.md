# NSEC Key Issue Analysis

## Problem Description
When entering the nsec key `nsec10av6mn0nguyyg9c7fhmclz7qq25x34ds6zhmq0hd4l3y8kem37yqvkcy4t`, the website generates an incorrect Ark address.

- **Generated**: `tark1qp9wsjfpsj5v5ex022v6tmhukkw3erjpv68xvl0af5zzu...`
- **Expected**: `tark1qra883hysahlkt0ujcwhv0x2n278849c3m7t3a08l7fdc40f4f2nma2qs9psp6j0ul985al8l8z7r89dfh3a58aplgvqfwd7wggzxjzf83gnaj`

## Root Cause
The website is using an incorrect server public key when generating the address:

### Actual Values Used:
- Server pubkey: `4ae8492184a8ca64cf5299a5eefcb59d1c8e41668e667dfd4d042e5876d34745`
- VTXO key: `57ddb8880bf79cec1a49986ea7873641062c0b06bfad80b775b61e56a889939c`

### Expected Values (from mutinynet.arkade.sh):
- Server pubkey: `fa73c6e4876ffb2dfc961d763cca9abc73d4b88efcb8f5e7ff92dc55e9aa553d`
- Exit delay: `172544`

## Why This Happens

1. When "BTC - Bitcoin Ark Testnet" is selected, the code attempts to auto-fetch server info
2. The fetch happens asynchronously
3. If the user enters a private key before the fetch completes, it uses whatever values are in the form fields
4. The default/placeholder values in the fields are incorrect

## The Fix

The issue is that the server info might not be fetched yet when the user enters the private key. The code needs to:

1. Either wait for the server info to be fetched before processing
2. Or ensure the correct default values are set
3. Or show a loading state while fetching server info

## Verification

The nsec key `nsec10av6mn0nguyyg9c7fhmclz7qq25x34ds6zhmq0hd4l3y8kem37yqvkcy4t` decodes to:
- Private key: `7f59adcdf3470844171e4df78f8bc002a868d5b0d0afb03eedafe243db3b8f88`
- Public key: `0282cdbb939881335a342611504bf3cf247d5e98af2dba008f1d26f6c5a8ea902f`

With the correct mutinynet server parameters, this should produce the expected address.