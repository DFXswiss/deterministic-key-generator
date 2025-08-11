// Wrapper module for Ark SDK to use in browser
const { DefaultVtxo, ArkAddress } = require('@arkade-os/sdk');

// Helper functions
function hexToUint8Array(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes;
}

function uint8ArrayToHex(bytes) {
    return Array.from(bytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// Main function to generate Ark Protocol address
function generateArkProtocolAddress(userPubkeyHex, serverPubkeyHex, exitDelay, network) {
    try {
        // Convert hex strings to Uint8Array
        const userPubkey = hexToUint8Array(userPubkeyHex);
        
        // Handle server pubkey - remove 02/03 prefix if present
        let serverPubkey;
        if (serverPubkeyHex.length === 66 && (serverPubkeyHex.startsWith('02') || serverPubkeyHex.startsWith('03'))) {
            serverPubkey = hexToUint8Array(serverPubkeyHex.substring(2));
        } else {
            serverPubkey = hexToUint8Array(serverPubkeyHex);
        }
        
        // Create VTXO script
        const vtxoScript = new DefaultVtxo.Script({
            pubKey: userPubkey,
            serverPubKey: serverPubkey,
            timelock: exitDelay // Try to set timelock
        });
        
        // Determine HRP based on network
        const hrp = (network === 'mainnet') ? 'ark' : 'tark';
        
        // Generate address object
        const arkAddressObj = vtxoScript.address(hrp, serverPubkey);
        
        // Encode to string
        const addressString = arkAddressObj.encode();
        
        // Return result with additional info
        return {
            address: addressString,
            vtxoKey: uint8ArrayToHex(arkAddressObj.vtxoTaprootKey),
            serverPubKey: uint8ArrayToHex(arkAddressObj.serverPubKey),
            tweakedPublicKey: uint8ArrayToHex(vtxoScript.tweakedPublicKey),
            success: true
        };
        
    } catch (error) {
        console.error('Error generating Ark Protocol address:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Function to decode Ark address
function decodeArkAddress(addressString) {
    try {
        const decoded = ArkAddress.decode(addressString);
        return {
            serverPubKey: uint8ArrayToHex(decoded.serverPubKey),
            vtxoTaprootKey: uint8ArrayToHex(decoded.vtxoTaprootKey),
            hrp: decoded.hrp,
            version: decoded.version,
            success: true
        };
    } catch (error) {
        console.error('Error decoding Ark address:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Export for browser use
window.ArkSDK = {
    generateArkProtocolAddress,
    decodeArkAddress,
    DefaultVtxo,
    ArkAddress
};