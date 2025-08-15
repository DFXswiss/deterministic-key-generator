// Wrapper module for Ark SDK to use in browser
let DefaultVtxo, ArkAddress, RestArkProvider;

console.log('🔍 SDK Wrapper: Initializing...');

// Try to get SDK from different sources
if (typeof ArkSDK !== 'undefined') {
    // From UMD bundle (global ArkSDK)
    console.log('🔍 SDK Wrapper: Found global ArkSDK, keys:', Object.keys(ArkSDK));
    ({ DefaultVtxo, ArkAddress, RestArkProvider } = ArkSDK);
    
    // Debug what we got
    console.log('🔍 SDK Wrapper: DefaultVtxo type:', typeof DefaultVtxo);
    console.log('🔍 SDK Wrapper: DefaultVtxo.Script type:', typeof DefaultVtxo?.Script);
    console.log('🔍 SDK Wrapper: ArkAddress type:', typeof ArkAddress);
    console.log('🔍 SDK Wrapper: RestArkProvider type:', typeof RestArkProvider);
    
} else if (typeof window !== 'undefined' && window.ArkSDK) {
    // Fallback to window.ArkSDK
    console.log('🔍 SDK Wrapper: Found window.ArkSDK, keys:', Object.keys(window.ArkSDK));
    ({ DefaultVtxo, ArkAddress, RestArkProvider } = window.ArkSDK);
    
} else if (typeof require !== 'undefined') {
    // From Node.js require (for development/testing)
    console.log('🔍 SDK Wrapper: Using Node.js require');
    try {
        ({ DefaultVtxo, ArkAddress, RestArkProvider } = require('@arkade-os/sdk'));
        console.log('🔍 SDK Wrapper: Node.js SDK loaded successfully');
    } catch (e) {
        console.error('Could not load Ark SDK:', e);
    }
} else {
    console.error('Ark SDK not available - neither global ArkSDK, window.ArkSDK, nor require() found');
}

// Helper functions
function hexToUint8Array(hex) {
    // Validate hex string
    if (!/^[0-9a-fA-F]*$/.test(hex)) {
        throw new Error('Invalid hex string: contains non-hex characters');
    }
    if (hex.length % 2 !== 0) {
        throw new Error('Invalid hex string: odd length');
    }
    
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        const byteValue = parseInt(hex.substr(i, 2), 16);
        if (isNaN(byteValue)) {
            throw new Error(`Invalid hex string: cannot parse byte at position ${i}`);
        }
        bytes[i / 2] = byteValue;
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
        // Check if DefaultVtxo is available
        if (!DefaultVtxo) {
            throw new Error('DefaultVtxo not available - SDK not loaded properly');
        }
        
        // Check if DefaultVtxo.Script is available
        if (!DefaultVtxo.Script) {
            throw new Error('DefaultVtxo.Script not available - check SDK bundle');
        }
        
        // Fetch server info to get correct parameters
        const serverInfo = await fetchServerInfo(serverUrl);
        
        // Convert user pubkey - ensure it's 32 bytes (x-only)
        let userPubkey;
        if (userPubkeyHex.length === 66 && (userPubkeyHex.startsWith('02') || userPubkeyHex.startsWith('03'))) {
            // Remove compression prefix for x-only key
            userPubkey = hexToUint8Array(userPubkeyHex.substring(2));
        } else if (userPubkeyHex.length === 64) {
            // Already x-only key
            userPubkey = hexToUint8Array(userPubkeyHex);
        } else {
            throw new Error(`Invalid user pubkey length: expected 32 or 33 bytes, got ${userPubkeyHex.length / 2}`);
        }
        
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
        // Check if DefaultVtxo is available
        if (!DefaultVtxo) {
            throw new Error('DefaultVtxo not available - SDK not loaded properly');
        }
        
        // Check if DefaultVtxo.Script is available
        if (!DefaultVtxo.Script) {
            throw new Error('DefaultVtxo.Script not available - check SDK bundle');
        }
        
        // Convert user pubkey - ensure it's 32 bytes (x-only)
        let userPubkey;
        if (userPubkeyHex.length === 66 && (userPubkeyHex.startsWith('02') || userPubkeyHex.startsWith('03'))) {
            // Remove compression prefix for x-only key
            userPubkey = hexToUint8Array(userPubkeyHex.substring(2));
        } else if (userPubkeyHex.length === 64) {
            // Already x-only key
            userPubkey = hexToUint8Array(userPubkeyHex);
        } else {
            throw new Error(`Invalid user pubkey length: expected 32 or 33 bytes, got ${userPubkeyHex.length / 2}`);
        }
        
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

// Export helper functions to global scope for browser use
if (typeof window !== 'undefined') {
    window.ArkSDK = Object.assign(window.ArkSDK || {}, {
        generateArkProtocolAddress,
        generateArkProtocolAddressManual,
        decodeArkAddress,
        fetchServerInfo,
        DefaultVtxo,
        ArkAddress,
        RestArkProvider
    });
}

// Export for Node.js use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        generateArkProtocolAddress,
        generateArkProtocolAddressManual,
        decodeArkAddress,
        fetchServerInfo,
        DefaultVtxo,
        ArkAddress,
        RestArkProvider
    };
}