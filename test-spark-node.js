const crypto = require('crypto');
const { HDKey } = require('@scure/bip32');
const { mnemonicToSeedSync } = require('@scure/bip39');
const { wordlist } = require('@scure/bip39/wordlists/english');

// Test configuration
const testMnemonic = 'fancy argue embody own tape pair brief pink pact syrup electric chicken';
const expectedPubKey = '03d6f4d678308908d8baf1d355d17c19370ce485d94c788cb15ec31d6638023ee8';

// Convert mnemonic to seed
const seed = mnemonicToSeedSync(testMnemonic);
const hdkey = HDKey.fromMasterSeed(seed);

console.log('Testing Spark Identity Key Derivation');
console.log('======================================');
console.log('Mnemonic:', testMnemonic);
console.log('');

// Test different account numbers
const paths = [
    "m/8797555'/0'/0'",  // Account 0
    "m/8797555'/1'/0'",  // Account 1 (SDK default)
];

paths.forEach(path => {
    try {
        const derivedKey = hdkey.derive(path);
        const pubKeyHex = Buffer.from(derivedKey.publicKey).toString('hex');
        
        console.log(`Path: ${path}`);
        console.log(`  Public Key: ${pubKeyHex}`);
        console.log(`  Match: ${pubKeyHex === expectedPubKey ? '✅ YES!' : '❌ NO'}`);
        console.log('');
    } catch (err) {
        console.log(`Path: ${path}`);
        console.log(`  Error: ${err.message}`);
        console.log('');
    }
});

console.log('Expected from Blitz Wallet:');
console.log(`  Public Key: ${expectedPubKey}`);