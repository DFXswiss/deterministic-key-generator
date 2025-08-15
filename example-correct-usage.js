/**
 * Example: Correct usage of arkade-os SDK for VTXO generation
 * 
 * This example shows how to properly generate VTXO keys that match
 * the expected values from the Ark protocol.
 */

const { DefaultVtxo, ArkAddress, RestArkProvider } = require('@arkade-os/sdk');

// Helper functions
function hexToUint8Array(hex) {
    return new Uint8Array(Buffer.from(hex, 'hex'));
}

function uint8ArrayToHex(bytes) {
    return Buffer.from(bytes).toString('hex');
}

/**
 * Generate Ark Protocol VTXO address with correct server parameters
 */
async function generateCorrectArkAddress(userPubkeyHex, serverUrl = 'https://mutinynet.arkade.sh') {
    try {
        console.log('🔧 Generating Ark Protocol address...');
        
        // 1. Convert user public key
        const userPubkey = hexToUint8Array(userPubkeyHex);
        
        // 2. CRITICAL: Fetch server info for correct parameters
        console.log('📡 Fetching server info from:', serverUrl);
        const arkProvider = new RestArkProvider(serverUrl);
        const info = await arkProvider.getInfo();
        
        // 3. Extract server pubkey (remove 02/03 prefix for x-only format)
        const serverPubkey = Buffer.from(info.signerPubkey, 'hex').slice(1);
        
        // 4. Create correct timelock from server info
        const exitTimelock = {
            value: info.unilateralExitDelay,
            type: info.unilateralExitDelay < 512n ? "blocks" : "seconds",
        };
        
        console.log('📊 Server Parameters:');
        console.log('  - Signer Pubkey:', info.signerPubkey);
        console.log('  - Server x-only:', uint8ArrayToHex(serverPubkey));  
        console.log('  - Exit Delay:', info.unilateralExitDelay.toString(), exitTimelock.type);
        console.log('  - Network:', info.network);
        
        // 5. Create VTXO script with correct parameters
        const vtxoScript = new DefaultVtxo.Script({
            pubKey: userPubkey,
            serverPubKey: serverPubkey,
            csvTimelock: exitTimelock  // Note: csvTimelock, NOT timelock!
        });
        
        // 6. Generate address
        const hrp = info.network === 'mainnet' ? 'ark' : 'tark';
        const arkAddressObj = vtxoScript.address(hrp, serverPubkey);
        const address = arkAddressObj.encode();
        
        console.log('✅ Generated Successfully:');
        console.log('  - Address:', address);
        console.log('  - VTXO Key:', uint8ArrayToHex(arkAddressObj.vtxoTaprootKey));
        console.log('  - Tweaked Key:', uint8ArrayToHex(vtxoScript.tweakedPublicKey));
        
        return {
            address,
            vtxoKey: uint8ArrayToHex(arkAddressObj.vtxoTaprootKey),
            tweakedPublicKey: uint8ArrayToHex(vtxoScript.tweakedPublicKey),
            serverInfo: {
                signerPubkey: info.signerPubkey,
                unilateralExitDelay: info.unilateralExitDelay.toString(),
                network: info.network
            }
        };
        
    } catch (error) {
        console.error('❌ Error generating address:', error.message);
        throw error;
    }
}

// Example usage
async function main() {
    const userPubkey = '123958369d3740a6cd7da98877bb6d4bdb00199aad81b7915de663bec2c617a2';
    
    console.log('🚀 Ark Protocol Address Generation Example');
    console.log('==========================================');
    console.log('User Pubkey:', userPubkey);
    console.log('');
    
    const result = await generateCorrectArkAddress(userPubkey);
    
    // Verify against expected values
    const expectedVtxoKey = '9f34725db0007bd11717b540e77032ae30622a0b681eed2597303e24b2178948';
    const expectedAddress = 'tark1qra883hysahlkt0ujcwhv0x2n278849c3m7t3a08l7fdc40f4f2nm8e5wfwmqqrm6yt30d2quacr9t3svg4qk6q7a5jewvp7yjep0z2gtpj3fd';
    
    console.log('');
    console.log('🎯 Verification:');
    console.log('VTXO Key matches expected:', result.vtxoKey === expectedVtxoKey ? '✅' : '❌');
    console.log('Address matches expected:', result.address === expectedAddress ? '✅' : '❌');
    
    if (result.vtxoKey === expectedVtxoKey && result.address === expectedAddress) {
        console.log('');
        console.log('🎉 Perfect! VTXO generation is working correctly.');
        console.log('');
        console.log('💡 Key Insights:');
        console.log('1. Always fetch server info for timelock values');
        console.log('2. Use csvTimelock parameter (not timelock)');
        console.log('3. Server pubkey must be x-only format');
        console.log('4. Timelock values significantly affect the taproot hash');
    }
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { generateCorrectArkAddress };