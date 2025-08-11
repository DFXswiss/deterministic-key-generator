const puppeteer = require('puppeteer');

async function testBIP86PubkeyDisplay() {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        
        // Enable console logging
        page.on('console', msg => {
            if (msg.type() === 'error') {
                console.log('PAGE ERROR:', msg.text());
            }
        });
        
        console.log('\n=== Testing BIP86 Public Key Display ===\n');
        
        // Navigate to the tool and select BIP86 tab
        await page.goto('http://localhost:8080/src/index.html');
        await new Promise(r => setTimeout(r, 2000));
        
        // Enter test mnemonic
        const testMnemonic = 'oxygen lobster melody price ribbon home clip doll trigger glove silly market';
        console.log('Entering mnemonic:', testMnemonic);
        
        await page.evaluate((mnemonic) => {
            document.querySelector('#phrase').value = mnemonic;
            $('#phrase').trigger('input');
        }, testMnemonic);
        
        // Wait for processing
        await new Promise(r => setTimeout(r, 1000));
        
        // Select Bitcoin
        console.log('Selecting Bitcoin...');
        await page.evaluate(() => {
            $('.network option').each(function() {
                if ($(this).text() === 'BTC - Bitcoin') {
                    $('.network').val($(this).val()).trigger('change');
                    return false;
                }
            });
        });
        
        // Wait for addresses to be generated
        await new Promise(r => setTimeout(r, 2000));
        
        // Click on BIP86 tab
        console.log('Clicking BIP86 tab...');
        await page.evaluate(() => {
            $('#bip86-tab a').click();
        });
        
        // Wait for BIP86 addresses to generate
        await new Promise(r => setTimeout(r, 2000));
        
        // Check the first few addresses and their public keys
        const addresses = await page.evaluate(() => {
            const rows = document.querySelectorAll('tbody.addresses tr');
            const results = [];
            for (let i = 0; i < Math.min(5, rows.length); i++) {
                const cells = rows[i].querySelectorAll('td');
                if (cells.length >= 4) {
                    const pubkey = cells[2].textContent.trim();
                    results.push({
                        index: i,
                        path: cells[0].textContent.trim(),
                        address: cells[1].textContent.trim(),
                        pubkey: pubkey,
                        pubkeyLength: pubkey.length,
                        isHex: /^[0-9a-fA-F]+$/.test(pubkey),
                        startsWithValid: pubkey.startsWith('02') || pubkey.startsWith('03'),
                        privkey: cells[3].textContent.trim().substring(0, 10) + '...'
                    });
                }
            }
            return results;
        });
        
        console.log('\nBIP86 Addresses and Public Keys:');
        addresses.forEach(addr => {
            console.log(`\nAddress #${addr.index}:`);
            console.log(`  Path: ${addr.path}`);
            console.log(`  Address: ${addr.address}`);
            console.log(`  Public Key Length: ${addr.pubkeyLength}`);
            console.log(`  Is Valid Hex: ${addr.isHex}`);
            console.log(`  Starts with 02/03: ${addr.startsWithValid}`);
            console.log(`  Public Key (first 20 chars): ${addr.pubkey.substring(0, 20)}...`);
            
            if (addr.pubkeyLength === 66 && addr.isHex && addr.startsWithValid) {
                console.log('  ✓ Public key is correctly formatted as hex string!');
            } else {
                console.log('  ✗ Public key appears to have issues');
                if (addr.pubkeyLength < 66) {
                    console.log('    - Too short (expected 66 chars)');
                }
                if (!addr.isHex) {
                    console.log('    - Contains non-hex characters');
                }
                if (!addr.startsWithValid) {
                    console.log('    - Does not start with 02 or 03');
                }
            }
        });
        
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
    testBIP86PubkeyDisplay().then(() => {
        server.kill();
        process.exit(0);
    }).catch(error => {
        console.error(error);
        server.kill();
        process.exit(1);
    });
}, 2000);