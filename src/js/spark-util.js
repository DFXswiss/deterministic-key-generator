(function() {

    // Spark Money uses Bech32m encoding for addresses
    // Based on the Spark SDK which uses @scure/bip32, @scure/bip39
    
    var ALPHABET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
    var ENCODING_CONST = 0x2bc830a3; // Bech32m constant
    
    function polymodStep(pre) {
        var b = pre >> 25;
        return ((pre & 0x1ffffff) << 5) ^
            (-((b >> 0) & 1) & 0x3b6a57b2) ^
            (-((b >> 1) & 1) & 0x26508e6d) ^
            (-((b >> 2) & 1) & 0x1ea119fa) ^
            (-((b >> 3) & 1) & 0x3d4233dd) ^
            (-((b >> 4) & 1) & 0x2a1462b3);
    }
    
    function prefixChk(prefix) {
        var chk = 1;
        for (var i = 0; i < prefix.length; ++i) {
            var c = prefix.charCodeAt(i);
            chk = polymodStep(chk) ^ (c >> 5);
        }
        chk = polymodStep(chk);
        
        for (var i = 0; i < prefix.length; ++i) {
            var v = prefix.charCodeAt(i);
            chk = polymodStep(chk) ^ (v & 0x1f);
        }
        return chk;
    }
    
    function encode(prefix, words) {
        var chk = prefixChk(prefix);
        var result = prefix + '1';
        for (var i = 0; i < words.length; ++i) {
            var x = words[i];
            chk = polymodStep(chk) ^ x;
            result += ALPHABET.charAt(x);
        }
        
        for (var i = 0; i < 6; ++i) {
            chk = polymodStep(chk);
        }
        chk ^= ENCODING_CONST;
        
        for (var i = 0; i < 6; ++i) {
            var v = (chk >> ((5 - i) * 5)) & 0x1f;
            result += ALPHABET.charAt(v);
        }
        
        return result;
    }
    
    function convertBits(data, fromBits, toBits, pad) {
        var acc = 0;
        var bits = 0;
        var ret = [];
        var maxv = (1 << toBits) - 1;
        for (var i = 0; i < data.length; ++i) {
            var value = data[i];
            if (value < 0 || (value >> fromBits) !== 0) {
                return null;
            }
            acc = (acc << fromBits) | value;
            bits += fromBits;
            while (bits >= toBits) {
                bits -= toBits;
                ret.push((acc >> bits) & maxv);
            }
        }
        if (pad) {
            if (bits > 0) {
                ret.push((acc << (toBits - bits)) & maxv);
            }
        } else if (bits >= fromBits || ((acc << (toBits - bits)) & maxv)) {
            return null;
        }
        return ret;
    }
    
    function publicKeyToSparkAddress(publicKeyHex, network) {
        // Network prefixes for Spark
        var prefixes = {
            'mainnet': 'sp',
            'testnet': 'spt',
            'regtest': 'sprt',
            'signet': 'sps'
        };
        
        var prefix = prefixes[network] || 'sp';
        
        // Debug logging
        console.log('Generating Spark address for public key:', publicKeyHex);
        
        // Convert hex public key to bytes
        var publicKeyBytes = [];
        for (var i = 0; i < publicKeyHex.length; i += 2) {
            publicKeyBytes.push(parseInt(publicKeyHex.substr(i, 2), 16));
        }
        
        // Spark uses a special format:
        // Version byte 0x0a (10) + Length prefix 0x21 (33) + 33-byte public key
        var version = 0x0a; // Spark version byte
        var lengthPrefix = 0x21; // Length of public key (33 bytes)
        
        // Combine: version + length + public key
        var combined = [version, lengthPrefix].concat(publicKeyBytes);
        
        // Convert to 5-bit groups for bech32m
        var words = convertBits(combined, 8, 5, true);
        
        if (!words) {
            throw new Error('Failed to convert public key to bech32m format');
        }
        
        // Encode with bech32m
        var address = encode(prefix, words);
        console.log('Generated Spark address:', address);
        
        return address;
    }
    
    // Export for use in index.js
    window.sparkUtil = {
        publicKeyToSparkAddress: publicKeyToSparkAddress
    };

})();