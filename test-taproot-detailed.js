const puppeteer = require('puppeteer');

async function testTaprootDetailed() {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        
        // Enable console logging
        page.on('console', msg => {
            const text = msg.text();
            if (text.includes('Taproot') || text.includes('tweak') || text.includes('BIP86')) {
                console.log('PAGE LOG:', text);
            }
        });
        
        console.log('\n=== Testing Taproot Tweaking ===\n');
        
        // Navigate to the tool
        await page.goto('http://localhost:8080/src/index.html');
        await page.waitForSelector('#phrase');
        
        // Enter the test seed
        const testSeed = 'pioneer force body detect verify lady hire width tissue make zebra boring';
        await page.evaluate((seed) => {
            document.querySelector('#phrase').value = seed;
            $('#phrase').trigger('input');
        }, testSeed);
        
        // Wait for processing
        await new Promise(r => setTimeout(r, 1000));
        
        // Select Bitcoin
        await page.evaluate(() => {
            $('.network option').each(function() {
                if ($(this).text() === 'BTC - Bitcoin') {
                    $('.network').val($(this).val()).trigger('change');
                    return false;
                }
            });
        });
        
        // Wait for network to load
        await new Promise(r => setTimeout(r, 2000));
        
        // Click on BIP86 tab
        await page.evaluate(() => {
            $('#bip86-tab a').click();
        });
        
        // Wait for BIP86 addresses to generate
        await new Promise(r => setTimeout(r, 2000));
        
        // Get the first BIP86 address details
        const result = await page.evaluate(() => {
            const rows = document.querySelectorAll('tbody.addresses tr');
            const firstRow = rows[0];
            if (firstRow) {
                const cells = firstRow.querySelectorAll('td');
                const address = cells[1] ? cells[1].textContent.trim() : 'no address';
                const pubkey = cells[2] ? cells[2].textContent.trim() : 'no pubkey';
                const privkey = cells[3] ? cells[3].textContent.trim() : 'no privkey';
                
                // Also test the tweaking directly
                let tweakTest = null;
                try {
                    // Get the x-only pubkey from the full pubkey
                    const fullPubkey = pubkey;
                    const xOnlyHex = fullPubkey.substring(2); // Remove 03 prefix
                    
                    // Convert to bytes
                    const xOnlyBytes = [];
                    for (let i = 0; i < xOnlyHex.length; i += 2) {
                        xOnlyBytes.push(parseInt(xOnlyHex.substr(i, 2), 16));
                    }
                    
                    // Apply tweak
                    const tweaked = applyTaprootTweak(xOnlyBytes);
                    
                    // Convert back to hex
                    let tweakedHex = '';
                    for (let i = 0; i < tweaked.length; i++) {
                        const hex = tweaked[i].toString(16);
                        tweakedHex += (hex.length === 1 ? '0' + hex : hex);
                    }
                    
                    tweakTest = {
                        originalHex: xOnlyHex,
                        tweakedHex: tweakedHex
                    };
                } catch (e) {
                    tweakTest = { error: e.message };
                }
                
                return {
                    address: address,
                    pubkey: pubkey,
                    privkey: privkey,
                    tweakTest: tweakTest
                };
            }
            return { error: 'No BIP86 addresses found' };
        });
        
        console.log('Our BIP86 Implementation:');
        console.log('-------------------------');
        console.log('Address:     ', result.address);
        console.log('Private Key: ', result.privkey);
        console.log('Public Key:  ', result.pubkey);
        
        if (result.tweakTest && !result.tweakTest.error) {
            console.log('\nTweak Test:');
            console.log('Original x-only:', result.tweakTest.originalHex);
            console.log('Tweaked x-only: ', result.tweakTest.tweakedHex);
        }
        
        console.log('\nExpected from bitcoiner.guide:');
        console.log('------------------------------');
        console.log('Address:      bc1p6q3lfsz7a7tlcpz5upe9dqjf9ynxnahxyqhjfqnhsfh0ew3790gsqxpv09');
        console.log('Private Key:  KzXHL4tVtRoy2ydEL5xDUXsDb48ThnwoTZVNPnX8JasMaNskPHGi');
        
        // Decode the expected address to get the tweaked pubkey
        console.log('\nDecoding expected address:');
        const expectedAddress = 'bc1p6q3lfsz7a7tlcpz5upe9dqjf9ynxnahxyqhjfqnhsfh0ew3790gsqxpv09';
        // The witness program for this address (after bc1p) should be the tweaked x-only pubkey
        // bc1p indicates version 1 witness program (Taproot)
        
        console.log('\nComparison:');
        console.log('-----------');
        console.log('Address matches:     ', result.address === 'bc1p6q3lfsz7a7tlcpz5upe9dqjf9ynxnahxyqhjfqnhsfh0ew3790gsqxpv09' ? '✓ YES' : '✗ NO');
        console.log('Private key matches: ', result.privkey === 'KzXHL4tVtRoy2ydEL5xDUXsDb48ThnwoTZVNPnX8JasMaNskPHGi' ? '✓ YES' : '✗ NO');
        
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
    testTaprootDetailed().then(() => {
        server.kill();
        process.exit(0);
    }).catch(error => {
        console.error(error);
        server.kill();
        process.exit(1);
    });
}, 2000);