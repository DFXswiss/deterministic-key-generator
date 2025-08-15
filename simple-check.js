// Einfacher Check ob alle Dateien verfügbar sind
const http = require('http');

async function checkFile(path) {
    return new Promise((resolve) => {
        const req = http.get(`http://127.0.0.1:8081${path}`, (res) => {
            resolve({
                path: path,
                status: res.statusCode,
                ok: res.statusCode === 200
            });
        });
        req.on('error', () => {
            resolve({
                path: path,
                status: 'ERROR',
                ok: false
            });
        });
    });
}

async function checkWebsite() {
    console.log('🔍 ÜBERPRÜFE WEBSITE DATEIEN');
    console.log('='.repeat(50));
    
    const files = [
        '/index.html',
        '/js/ark-sdk-bundle.js',
        '/js/ark-sdk-wrapper.js',
        '/js/index.js',
        '/css/app.css'
    ];
    
    for (const file of files) {
        const result = await checkFile(file);
        console.log(`${result.ok ? '✅' : '❌'} ${file}: ${result.status}`);
    }
    
    console.log('');
    console.log('🧪 TESTE MANUELLE ADRESSGENERIERUNG');
    console.log('='.repeat(50));
    
    // Test der SDK Wrapper Funktion direkt
    try {
        // Lade das SDK
        const { DefaultVtxo, RestArkProvider } = require('@arkade-os/sdk');
        const { secp256k1 } = require('@noble/curves/secp256k1');
        
        console.log('✅ SDK Module geladen');
        
        // nsec key decodieren (vereinfacht)
        const nsecKey = 'nsec12ngue0y6wtx0f2hhzl6ssxndmc02hqxryuavtfzgs72lt08kz3msvs6fnd';
        const hexKey = '54d1ccbc9a72ccf4aaf717f5081a6dde1eab80c3273ac5a4488795f5bcf61477';
        
        // Public Key generieren
        const publicKey = secp256k1.getPublicKey(hexKey, false);
        const userPubkey = publicKey.slice(1, 33);
        
        console.log('✅ Public Key generiert');
        
        // Server Info abrufen
        const arkProvider = new RestArkProvider('https://mutinynet.arkade.sh');
        console.log('📡 Hole Server Info...');
        const serverInfo = await arkProvider.getInfo();
        
        console.log('✅ Server Info erhalten');
        console.log('  Server Pubkey:', serverInfo.signerPubkey);
        console.log('  Exit Delay:', serverInfo.unilateralExitDelay);
        
        // Test ob die gleiche Logik funktioniert
        const serverPubkeyHex = serverInfo.signerPubkey;
        let serverPubkey;
        if (serverPubkeyHex.length === 66 && (serverPubkeyHex.startsWith('02') || serverPubkeyHex.startsWith('03'))) {
            serverPubkey = Buffer.from(serverPubkeyHex.substring(2), 'hex');
        } else {
            serverPubkey = Buffer.from(serverPubkeyHex, 'hex');
        }
        
        const exitTimelock = {
            value: BigInt(serverInfo.unilateralExitDelay),
            type: serverInfo.unilateralExitDelay < 512 ? 'blocks' : 'seconds'
        };
        
        console.log('✅ Timelock konfiguriert:', exitTimelock);
        
        // VTXO Script erstellen
        const vtxoScript = new DefaultVtxo.Script({
            pubKey: userPubkey,
            serverPubKey: serverPubkey,
            csvTimelock: exitTimelock
        });
        
        console.log('✅ VTXO Script erstellt');
        
        // Adresse generieren
        const hrp = 'tark';
        const arkAddressObj = vtxoScript.address(hrp, serverPubkey);
        const generatedAddress = arkAddressObj.encode();
        const vtxoKey = Buffer.from(arkAddressObj.vtxoTaprootKey).toString('hex');
        
        console.log('');
        console.log('🎯 ERGEBNIS:');
        console.log('Generated Address:', generatedAddress);
        console.log('VTXO Key:', vtxoKey);
        
        const expectedAddress = 'tark1qra883hysahlkt0ujcwhv0x2n278849c3m7t3a08l7fdc40f4f2nm8e5wfwmqqrm6yt30d2quacr9t3svg4qk6q7a5jewvp7yjep0z2gtpj3fd';
        const expectedVtxoKey = '9f34725db0007bd11717b540e77032ae30622a0b681eed2597303e24b2178948';
        
        console.log('');
        console.log('✅ VERIFIKATION:');
        console.log('Address Match:', generatedAddress === expectedAddress ? '✅ JA' : '❌ NEIN');
        console.log('VTXO Key Match:', vtxoKey === expectedVtxoKey ? '✅ JA' : '❌ NEIN');
        
        const success = generatedAddress === expectedAddress && vtxoKey === expectedVtxoKey;
        console.log('');
        console.log('🏆 SDK FUNKTIONIERT:', success ? '✅ PERFEKT' : '❌ PROBLEM');
        
        if (success) {
            console.log('');
            console.log('💡 DIAGNOSE: SDK funktioniert korrekt.');
            console.log('   Das Problem muss in der Browser-Implementation liegen:');
            console.log('   1. JavaScript Fehler?');
            console.log('   2. Event Handler nicht korrekt?');
            console.log('   3. HTML Selektoren geändert?');
            console.log('   4. Timing Probleme?');
        }
        
    } catch (error) {
        console.error('❌ SDK Test Fehler:', error);
    }
}

checkWebsite().catch(console.error);