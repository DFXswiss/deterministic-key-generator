# Manual Test Instructions for Ark Consistency

## Test Setup
1. Open http://localhost:8090 in your browser
2. Open the browser console (F12 -> Console)

## Test 1: Find the correct derivation path

Run this in the console to find which path generates the target private key:

```javascript
// Test mnemonic derivation paths
const mnemonic = 'hub easily force horn pull coast business rice cabbage shed around fence';
const targetWIF = 'KzF9AjZVYkVGyV3MAtDWs1BrMWq6jQzqwoeoSstFCMAw1UaALCDP';

const seed = libs.bip39.mnemonicToSeed(mnemonic);
const root = libs.bitcoin.HDNode.fromSeedBuffer(seed, libs.bitcoin.networks.bitcoin);

const paths = [
    "m/44'/0'/0'/0/0",
    "m/44'/0'/0'/0",  
    "m/44'/1237'/0'/0/0", // Ark coin type
    "m/44'/1237'/0'/0",
    "m/0/0",
    "m/0"
];

console.log('Finding correct derivation path...');
paths.forEach(path => {
    try {
        let node = root;
        const parts = path.replace('m/', '').split('/');
        
        parts.forEach(part => {
            const hardened = part.includes("'");
            const index = parseInt(hardened ? part.replace("'", "") : part);
            node = hardened ? node.deriveHardened(index) : node.derive(index);
        });
        
        const wif = node.keyPair.toWIF();
        if (wif === targetWIF) {
            console.log('✅ FOUND! Path:', path, 'WIF:', wif);
        } else {
            console.log('❌ Path:', path, 'WIF:', wif.substring(0, 10) + '...');
        }
    } catch (e) {
        console.log('Error with path', path, ':', e.message);
    }
});
```

## Test 2: Manual Test Steps

### Mnemonic Tab:
1. Enter mnemonic: `hub easily force horn pull coast business rice cabbage shed around fence`
2. Select network: `BTC - Bitcoin Ark`
3. Check/adjust the derivation path based on Test 1 results
4. Note the Private Key and Ark Address

### Private Key Tab:
1. Click "Private Key" tab
2. Enter private key: `KzF9AjZVYkVGyV3MAtDWs1BrMWq6jQzqwoeoSstFCMAw1UaALCDP`
3. Select network: `BTC - Bitcoin Ark`
4. Note the Ark Address

### Compare:
Both Ark addresses should be identical and start with `ark1...` (mainnet prefix).

## Test 3: Check current values

Run this in console while on the page:

```javascript
// Check current values in both tabs
console.log('=== Current Values ===');

// Mnemonic tab values
console.log('Mnemonic Tab:');
console.log('  Path:', document.querySelector('#derivation-path-input')?.value);
console.log('  Private Key:', document.querySelector('#private-key-display')?.value);
console.log('  Ark Address:', document.querySelector('#ark-address-display')?.value);

// Private key tab values  
console.log('Private Key Tab:');
console.log('  Private Key:', document.querySelector('#private-key-wif')?.value);
console.log('  Ark Address:', document.querySelector('#ark-protocol-address')?.value);
```