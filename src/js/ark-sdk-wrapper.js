// Wrapper module for Ark SDK to use in browser
const { DefaultVtxo, ArkAddress, RestArkProvider } = require('@arkade-os/sdk');

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

// Cache for server info to avoid repeated fetches
const serverInfoCache = new Map();

// Function to fetch server info with caching
async function fetchServerInfo(serverUrl) {
    if (serverInfoCache.has(serverUrl)) {
        return serverInfoCache.get(serverUrl);
    }
    
    try {
        const arkProvider = new RestArkProvider(serverUrl);
        const info = await arkProvider.getInfo();
        serverInfoCache.set(serverUrl, info);
        return info;
    } catch (error) {
        console.error('Error fetching server info:', error);
        throw error;
    }
}

// Main function to generate Ark Protocol address (with server fetch)
async function generateArkProtocolAddress(userPubkeyHex, serverUrl, network) {
    try {
        // Fetch server info to get correct parameters
        const serverInfo = await fetchServerInfo(serverUrl);
        
        // Convert user pubkey
        const userPubkey = hexToUint8Array(userPubkeyHex);
        
        // Extract server pubkey from server info (remove 02/03 prefix if present)
        let serverPubkey;
        const signerPubkeyHex = serverInfo.signerPubkey;
        if (signerPubkeyHex.length === 66 && (signerPubkeyHex.startsWith('02') || signerPubkeyHex.startsWith('03'))) {
            serverPubkey = hexToUint8Array(signerPubkeyHex.substring(2));
        } else {
            serverPubkey = hexToUint8Array(signerPubkeyHex);
        }
        
        // Create timelock from server info
        const exitTimelock = {
            value: BigInt(serverInfo.unilateralExitDelay),
            type: serverInfo.unilateralExitDelay < 512 ? "blocks" : "seconds"
        };
        
        // Create VTXO script with correct parameters
        const vtxoScript = new DefaultVtxo.Script({
            pubKey: userPubkey,
            serverPubKey: serverPubkey,
            csvTimelock: exitTimelock  // Use csvTimelock, not timelock!
        });
        
        // Determine HRP based on network (use server info network if available)
        const hrp = (serverInfo.network === 'mainnet') ? 'ark' : 'tark';
        
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
            exitDelay: serverInfo.unilateralExitDelay,
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

// Fallback function for manual generation (without server fetch)
function generateArkProtocolAddressManual(userPubkeyHex, serverPubkeyHex, exitDelay, network) {
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
        
        // Create timelock object  
        const exitTimelock = {
            value: BigInt(exitDelay),
            type: exitDelay < 512 ? "blocks" : "seconds"
        };
        
        // Create VTXO script with correct parameters
        const vtxoScript = new DefaultVtxo.Script({
            pubKey: userPubkey,
            serverPubKey: serverPubkey,
            csvTimelock: exitTimelock  // Use csvTimelock, not timelock!
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
    generateArkProtocolAddressManual,
    decodeArkAddress,
    fetchServerInfo,
    DefaultVtxo,
    ArkAddress,
    RestArkProvider
};