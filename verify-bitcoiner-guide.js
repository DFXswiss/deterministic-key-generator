// Verify the bitcoiner.guide output

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

console.log('Bitcoiner.guide output analysis');
console.log('===============================\n');

const bitcoinerGuideAddress = 'bc1peyp4cj4a48hyk7q7mh7wkmhq20dd45nq26pe684kxavhkf6juw9q9qq5a5';
console.log('Address from bitcoiner.guide:', bitcoinerGuideAddress);
console.log('Public Key:', '03d0ed6676dc17e0707776590807da7abb50064234b232e12fc47defa671e32dc2');
console.log('Private Key:', 'KzXHL4tVtRoy2ydEL5xDUXsDb48ThnwoTZVNPnX8JasMaNskPHGi');
console.log('');

try {
    const decoded = bech32mDecode(bitcoinerGuideAddress);
    console.log('Decoded address:');
    console.log('- HRP:', decoded.hrp);
    console.log('- Witness Version:', decoded.witver);
    console.log('- Witness Program (tweaked pubkey):', decoded.witnessProgramHex);
    console.log('');
    console.log('This means the tweaked x-only public key from bitcoiner.guide is:');
    console.log(decoded.witnessProgramHex);
    console.log('');
    console.log('The untweaked x-only public key is:');
    console.log('d0ed6676dc17e0707776590807da7abb50064234b232e12fc47defa671e32dc2');
} catch (e) {
    console.error('Error:', e.message);
}