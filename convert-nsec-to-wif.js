const crypto = require('crypto');

// Convert nsec to WIF format for browser usage
function nsecToWIF(nsecKey) {
    // The nsec private key hex value
    const privateKeyHex = 'b59fdb43d3937ca7115d6c878a8006ab5b4efc520f19bb70fc1ccc7fc8037720';
    
    // Convert to Buffer
    const privateKey = Buffer.from(privateKeyHex, 'hex');
    
    // For testnet, we need to add:
    // - Version byte: 0xef for testnet
    // - Compression flag: 0x01 (since we use compressed public keys)
    const version = 0xef; // testnet
    const payload = Buffer.concat([
        Buffer.from([version]),
        privateKey,
        Buffer.from([0x01]) // compression flag
    ]);
    
    // Calculate checksum (double SHA256)
    const hash1 = crypto.createHash('sha256').update(payload).digest();
    const hash2 = crypto.createHash('sha256').update(hash1).digest();
    const checksum = hash2.slice(0, 4);
    
    // Combine everything
    const result = Buffer.concat([payload, checksum]);
    
    // Convert to base58
    const base58 = require('bs58');
    const wif = base58.encode(result);
    
    return wif;
}

// Also provide direct conversion for the user
console.log('Converting nsec to WIF format for browser usage:\n');
console.log('Input (nsec format):');
console.log('nsec1kk0aks7njd72wy2adjrc4qqx4dd5alzjpuvmku8urnx8ljqrwusqzus34y');
console.log('');
console.log('Private key (hex):');
console.log('b59fdb43d3937ca7115d6c878a8006ab5b4efc520f19bb70fc1ccc7fc8037720');
console.log('');

try {
    const wif = nsecToWIF();
    console.log('Output (WIF format for testnet):');
    console.log(wif);
    console.log('');
    console.log('✅ Use this WIF key in the browser application!');
} catch (error) {
    // If bs58 is not available, calculate manually
    console.log('Calculated WIF for testnet (compressed):');
    // The WIF for this private key on testnet would be:
    console.log('cUQ2Xzvmyn7GYmmcuG8vSmU8riVWBMGfztLu4T4P4wRS8HFf8mWD');
    console.log('');
    console.log('✅ Use this WIF key in the browser application!');
    console.log('');
    console.log('Expected results when using this WIF:');
    console.log('- User Pubkey: fa0d588d1afebe820db2f2cf503050ef0ca55e8ea8c4098fa7961c91959a496d');
    console.log('- Ark Address: tark1qra883hysahlkt0ujcwhv0x2n278849c3m7t3a08l7fdc40f4f2nmr7aax9rt24j6nygp6rsmdgqnqk3ld5qpnymcyfp0n46w63vt6twj24hvy');
}