// Debug script to understand the nsec issue
const bitcoin = require('bitcoinjs-lib');
const bech32 = require('bech32');
const ECPairFactory = require('ecpair');
const ecc = require('tiny-secp256k1');

const ECPair = ECPairFactory.default(ecc);

const nsecKey = 'nsec10av6mn0nguyyg9c7fhmclz7qq25x34ds6zhmq0hd4l3y8kem37yqvkcy4t';
const actualWebsiteOutput = 'tark1qp9wsjfpsj5v5ex022v6tmhukkw3erjpv68xvl0af5zzukrk6dr5247ahzyqhauuasdynxrw57rnvsgx9s9sd0adszmhtds7265gnyuu97sq07';
const expectedCorrectOutput = 'tark1qra883hysahlkt0ujcwhv0x2n278849c3m7t3a08l7fdc40f4f2nma2qs9psp6j0ul985al8l8z7r89dfh3a58aplgvqfwd7wggzxjzf83gnaj';

console.log('Debugging nsec issue');
console.log('====================\n');

// Step 1: Decode nsec
console.log('1. Decoding nsec key...');
const decoded = bech32.bech32.decode(nsecKey);
const privateKeyBytes = bech32.bech32.fromWords(decoded.words);
const privateKeyHex = Buffer.from(privateKeyBytes).toString('hex');

console.log('   Private key hex:', privateKeyHex);

// Step 2: Create key pair
console.log('\n2. Creating key pair...');
const keyPair = ECPair.fromPrivateKey(Buffer.from(privateKeyHex, 'hex'), {
    network: bitcoin.networks.testnet
});

const publicKey = keyPair.publicKey;
console.log('   Public key hex:', Buffer.from(publicKey).toString('hex'));
console.log('   Public key compressed?', publicKey.length === 33);

// Step 3: Decode the actual website output to see what it contains
console.log('\n3. Decoding actual website output...');
try {
    const actualDecoded = bech32.bech32m.decode(actualWebsiteOutput, 200);
    const actualBytes = Buffer.from(bech32.bech32m.fromWords(actualDecoded.words));
    
    console.log('   Address data hex:', actualBytes.toString('hex'));
    console.log('   Version:', actualBytes[0]);
    console.log('   Server pubkey:', actualBytes.slice(1, 33).toString('hex'));
    console.log('   VTXO key:', actualBytes.slice(33, 65).toString('hex'));
} catch (e) {
    console.error('   Error decoding actual output:', e.message);
}

// Step 4: Decode the expected correct output
console.log('\n4. Decoding expected correct output...');
try {
    const expectedDecoded = bech32.bech32m.decode(expectedCorrectOutput, 200);
    const expectedBytes = Buffer.from(bech32.bech32m.fromWords(expectedDecoded.words));
    
    console.log('   Address data hex:', expectedBytes.toString('hex'));
    console.log('   Version:', expectedBytes[0]);
    console.log('   Server pubkey:', expectedBytes.slice(1, 33).toString('hex'));
    console.log('   VTXO key:', expectedBytes.slice(33, 65).toString('hex'));
} catch (e) {
    console.error('   Error decoding expected output:', e.message);
}

// Step 5: Compare the differences
console.log('\n5. Comparison:');
console.log('   The website produces:', actualWebsiteOutput.substring(0, 50) + '...');
console.log('   But it should produce:', expectedCorrectOutput.substring(0, 50) + '...');

// Step 6: Let's check what public key produces the expected address
console.log('\n6. Analyzing the expected address...');
console.log('   The expected address suggests a different server pubkey or VTXO calculation');
console.log('   This might be due to:');
console.log('   - Wrong server being used (not mutinynet.arkade.sh)');
console.log('   - Different exit delay value');
console.log('   - Different VTXO calculation logic');
console.log('   - Or the expected address was generated with different parameters');

// Additional check: Try another known working key from the test docs
console.log('\n7. Testing with known working key from documentation...');
const knownWorkingNsec = 'nsec12ngue0y6wtx0f2hhzl6ssxndmc02hqxryuavtfzgs72lt08kz3msvs6fnd';
const knownExpectedAddress = 'tark1qra883hysahlkt0ujcwhv0x2n278849c3m7t3a08l7fdc40f4f2nmr7aax9rt24j6nygp6rsmdgqnqk3ld5qpnymcyfp0n46w63vt6twj24hvy';

const decoded2 = bech32.bech32.decode(knownWorkingNsec);
const privateKeyBytes2 = bech32.bech32m.fromWords(decoded2.words);
const privateKeyHex2 = Buffer.from(privateKeyBytes2).toString('hex');
const keyPair2 = ECPair.fromPrivateKey(Buffer.from(privateKeyHex2, 'hex'), {
    network: bitcoin.networks.testnet
});

console.log('   Known working nsec decodes to hex:', privateKeyHex2);
console.log('   Public key:', Buffer.from(keyPair2.publicKey).toString('hex'));
console.log('   This should produce:', knownExpectedAddress.substring(0, 50) + '...');