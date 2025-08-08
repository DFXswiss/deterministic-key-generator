const crypto = require('crypto');

// Test values from Blitz Wallet
const testMnemonic = 'fancy argue embody own tape pair brief pink pact syrup electric chicken';
const expectedPubKey = '03d6f4d678308908d8baf1d355d17c19370ce485d94c788cb15ec31d6638023ee8';
const expectedAddress = 'sp1pzmh4nvpxyys34wh36d246h3exdsewg9vfru32wcxm2ceclkxpa0kcquxgrl5';

console.log('Testing Spark derivation path: m/8797555\'/0\'/0\'');
console.log('');
console.log('Mnemonic:', testMnemonic);
console.log('');
console.log('Expected from Blitz Wallet:');
console.log('  Public Key:', expectedPubKey);
console.log('  Address:', expectedAddress);
console.log('');

// Calculate SHA256 of "spark" to verify the purpose number
const sparkHash = crypto.createHash('sha256').update('spark').digest();
const purpose = sparkHash.readUInt32LE(0) & 0x7fffffff; // 31-bit integer

console.log('Verification:');
console.log('  SHA256("spark") first 4 bytes as 31-bit int:', purpose);
console.log('  Expected purpose: 8797555');
console.log('  Match:', purpose === 8797555 ? '✓' : '✗');
console.log('');

if (purpose !== 8797555) {
    console.log('ERROR: Purpose number calculation does not match!');
    console.log('This suggests the derivation path m/8797555\'/0\'/0\' might be incorrect.');
}