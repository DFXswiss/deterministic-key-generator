const puppeteer = require('puppeteer');

async function testFullFlow() {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        
        // Enable console logging for errors
        page.on('console', msg => {
            const text = msg.text();
            if (text.includes('Error') || text.includes('error')) {
                console.log('PAGE ERROR:', text);
            }
        });
        page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
        
        console.log('\n=== Testing Full BIP86 Flow ===\n');
        
        // Navigate to the tool
        await page.goto('http://localhost:8080/src/index.html');
        await page.waitForSelector('#phrase');
        
        // Test the full flow
        const result = await page.evaluate(() => {
            try {
                // Set up bitcoinjs-lib
                const bitcoin = libs.bitcoin;
                const bip39 = libs.bip39;
                
                // Test seed
                const mnemonic = 'pioneer force body detect verify lady hire width tissue make zebra boring';
                const seed = bip39.mnemonicToSeed(mnemonic);
                const root = bitcoin.HDNode.fromSeedBuffer(seed);
                
                // Derive BIP86 path: m/86'/0'/0'/0/0
                const path = "m/86'/0'/0'/0/0";
                const child = root.derivePath(path);
                
                // Get the keypair
                const keyPair = child.keyPair;
                const pubkey = keyPair.getPublicKeyBuffer();
                const pubkeyHex = pubkey.toString('hex');
                
                // Get x-only pubkey
                const xOnlyPubkey = [];
                for (let i = 1; i < 33; i++) {
                    xOnlyPubkey.push(pubkey[i]);
                }
                
                // Apply tweak
                const tweakedPubkey = applyTaprootTweak(xOnlyPubkey);
                const tweakedHex = tweakedPubkey.map(b => b.toString(16).padStart(2, '0')).join('');
                
                // Try to generate address
                let address = null;
                let addressError = null;
                try {
                    const data = [1].concat(bech32m.toWords(tweakedPubkey));
                    address = bech32m.encode('bc', data);
                } catch (e) {
                    addressError = e.message;
                }
                
                return {
                    pubkeyHex: pubkeyHex,
                    xOnlyHex: xOnlyPubkey.map(b => b.toString(16).padStart(2, '0')).join(''),
                    tweakedHex: tweakedHex,
                    address: address,
                    addressError: addressError,
                    privkey: keyPair.toWIF()
                };
                
            } catch (e) {
                return { error: e.message, stack: e.stack };
            }
        });
        
        console.log('Full flow test result:');
        console.log('----------------------');
        if (result.error) {
            console.log('ERROR:', result.error);
            console.log('Stack:', result.stack);
        } else {
            console.log('Public Key:      ', result.pubkeyHex);
            console.log('X-only pubkey:   ', result.xOnlyHex);
            console.log('Tweaked pubkey:  ', result.tweakedHex);
            console.log('Address:         ', result.address);
            console.log('Private Key:     ', result.privkey);
            
            if (result.addressError) {
                console.log('Address Error:   ', result.addressError);
            }
            
            console.log('\nExpected from bitcoiner.guide:');
            console.log('------------------------------');
            console.log('Address:          bc1peyp4cj4a48hyk7q7mh7wkmhq20dd45nq26pe684kxavhkf6juw9q9qq5a5');
            console.log('Tweaked pubkey:   c9035c4abda9ee4b781eddfceb6ee053dadad26056839d1eb637597b2752e38a');
            
            console.log('\nComparison:');
            console.log('-----------');
            console.log('Tweaked pubkey matches:', result.tweakedHex === 'c9035c4abda9ee4b781eddfceb6ee053dadad26056839d1eb637597b2752e38a' ? '✓ YES' : '✗ NO');
            console.log('Address matches:       ', result.address === 'bc1peyp4cj4a48hyk7q7mh7wkmhq20dd45nq26pe684kxavhkf6juw9q9qq5a5' ? '✓ YES' : '✗ NO');
        }
        
    } catch (error) {
        console.error('Test error:', error);
    } finally {
        await browser.close();
    }
}

// Start HTTP server first
const { spawn } = require('child_process');
const path = require('path');

const server = spawn('python3', ['-m', 'http.server', '8080', '--bind', '127.0.0.1'], {
    cwd: path.join(__dirname),
    detached: false,
    stdio: 'ignore'
});

// Wait for server to start
setTimeout(() => {
    testFullFlow().then(() => {
        server.kill();
        process.exit(0);
    }).catch(error => {
        console.error(error);
        server.kill();
        process.exit(1);
    });
}, 2000);