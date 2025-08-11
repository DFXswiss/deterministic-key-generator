// Decode the expected Bech32m address to get the tweaked pubkey

const CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';

function bech32mDecode(address) {
    // Find the separator
    const pos = address.lastIndexOf('1');
    if (pos < 1) throw new Error('Invalid bech32m address');
    
    const hrp = address.substring(0, pos);
    const data = address.substring(pos + 1);
    
    // Decode data
    const values = [];
    for (let i = 0; i < data.length; i++) {
        const d = CHARSET.indexOf(data[i]);
        if (d === -1) throw new Error('Invalid character in bech32m');
        values.push(d);
    }
    
    // First value is witness version
    const witver = values[0];
    
    // Convert 5-bit groups back to 8-bit bytes (skip version and checksum)
    const witnessProgram = [];
    let acc = 0;
    let bits = 0;
    
    // Skip witness version (first element) and checksum (last 6 elements)
    for (let i = 1; i < values.length - 6; i++) {
        acc = (acc << 5) | values[i];
        bits += 5;
        
        while (bits >= 8) {
            bits -= 8;
            witnessProgram.push((acc >> bits) & 0xFF);
        }
    }
    
    return {
        hrp,
        witver,
        witnessProgram,
        witnessProgramHex: witnessProgram.map(b => b.toString(16).padStart(2, '0')).join('')
    };
}

// Decode the expected address
const expectedAddress = 'bc1p6q3lfsz7a7tlcpz5upe9dqjf9ynxnahxyqhjfqnhsfh0ew3790gsqxpv09';
console.log('Decoding expected address:', expectedAddress);
console.log('');

try {
    const decoded = bech32mDecode(expectedAddress);
    console.log('HRP:', decoded.hrp);
    console.log('Witness Version:', decoded.witver);
    console.log('Witness Program (tweaked pubkey):', decoded.witnessProgramHex);
    console.log('');
    console.log('This is the tweaked x-only public key we should get from our implementation.');
} catch (e) {
    console.error('Error:', e.message);
}