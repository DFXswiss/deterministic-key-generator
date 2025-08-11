const crypto = require('crypto');

// Test the BIP341 tweaking directly
function sha256(data) {
    return crypto.createHash('sha256').update(Buffer.from(data)).digest();
}

function taggedHash(tag, data) {
    const tagHash = sha256(Buffer.from(tag, 'utf8'));
    return sha256(Buffer.concat([tagHash, tagHash, Buffer.from(data)]));
}

// Our test data
const internalPubkeyHex = 'd0ed6676dc17e0707776590807da7abb50064234b232e12fc47defa671e32dc2';
const internalPubkey = Buffer.from(internalPubkeyHex, 'hex');

// Expected output from bitcoiner.guide
const expectedTweakedHex = 'd023f4c05eef97fc0454e072568249292669f6e6202f248277826efcba3e2bd1';

console.log('Testing BIP341 Taproot Tweak');
console.log('=============================\n');

console.log('Internal pubkey (x-only):', internalPubkeyHex);
console.log('Expected tweaked pubkey: ', expectedTweakedHex);
console.log('');

// Calculate the tweak according to BIP341
// For key-path spending (BIP86), tweak = hashTapTweak(internalPubkey)
const tweak = taggedHash('TapTweak', internalPubkey);
console.log('Tweak hash:', tweak.toString('hex'));

// Note: To get the actual tweaked public key, we would need to:
// 1. Lift the x-only internal pubkey to a full point
// 2. Add tweak*G to it
// 3. Return the x-coordinate
// This requires elliptic curve operations which we can't easily do here

console.log('\nThe issue is likely in how we\'re lifting the x-coordinate or applying the tweak.');
console.log('We might need to check:');
console.log('1. Are we lifting the point correctly (choosing the right y-coordinate)?');
console.log('2. Are we handling the parity correctly when the tweaked point has odd y?');
console.log('3. Is our tagged hash implementation correct?');