const puppeteer = require('puppeteer');

async function testBIP86Seed() {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        
        console.log('\n=== Testing BIP86 with specific seed ===\n');
        console.log('Seed: pioneer force body detect verify lady hire width tissue make zebra boring\n');
        
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
        
        // Get the first address details
        const firstAddress = await page.evaluate(() => {
            const rows = document.querySelectorAll('tbody.addresses tr');
            if (rows && rows[0]) {
                const cells = rows[0].querySelectorAll('td');
                if (cells && cells.length >= 4) {
                    return {
                        path: cells[0].textContent.trim(),
                        address: cells[1].textContent.trim(),
                        pubkey: cells[2].textContent.trim(),
                        privkey: cells[3].textContent.trim()
                    };
                }
            }
            return null;
        });
        
        console.log('Our BIP86 Implementation:');
        console.log('-------------------------');
        if (firstAddress) {
            console.log('Path:        ', firstAddress.path);
            console.log('Address:     ', firstAddress.address);
            console.log('Private Key: ', firstAddress.privkey);
            console.log('Public Key:  ', firstAddress.pubkey);
        } else {
            console.log('No address generated');
        }
        
        console.log('\nExpected from bitcoiner.guide:');
        console.log('------------------------------');
        console.log('Path:         m/86\'/0\'/0\'/0/0');
        console.log('Address:      bc1p6q3lfsz7a7tlcpz5upe9dqjf9ynxnahxyqhjfqnhsfh0ew3790gsqxpv09');
        console.log('Private Key:  KzXHL4tVtRoy2ydEL5xDUXsDb48ThnwoTZVNPnX8JasMaNskPHGi');
        
        console.log('\nComparison:');
        console.log('-----------');
        if (firstAddress) {
            const addressMatch = firstAddress.address === 'bc1p6q3lfsz7a7tlcpz5upe9dqjf9ynxnahxyqhjfqnhsfh0ew3790gsqxpv09';
            const privkeyMatch = firstAddress.privkey === 'KzXHL4tVtRoy2ydEL5xDUXsDb48ThnwoTZVNPnX8JasMaNskPHGi';
            
            console.log('Address matches:     ', addressMatch ? '✓ YES' : '✗ NO');
            console.log('Private key matches: ', privkeyMatch ? '✓ YES' : '✗ NO');
            
            if (!addressMatch || !privkeyMatch) {
                console.log('\n⚠️  DISCREPANCY FOUND!');
                console.log('There is a difference between our implementation and bitcoiner.guide');
            } else {
                console.log('\n✓ All values match!');
            }
        }
        
        // Also check BIP44 for comparison
        console.log('\n\n=== BIP44 for comparison ===');
        await page.evaluate(() => {
            $('#bip44-tab a').click();
        });
        
        await new Promise(r => setTimeout(r, 1000));
        
        const bip44Address = await page.evaluate(() => {
            const rows = document.querySelectorAll('tbody.addresses tr');
            if (rows && rows[0]) {
                const cells = rows[0].querySelectorAll('td');
                if (cells && cells.length >= 4) {
                    return {
                        path: cells[0].textContent.trim(),
                        address: cells[1].textContent.trim(),
                        privkey: cells[3].textContent.trim()
                    };
                }
            }
            return null;
        });
        
        if (bip44Address) {
            console.log('BIP44 first address:');
            console.log('Path:        ', bip44Address.path);
            console.log('Address:     ', bip44Address.address);
            console.log('Private Key: ', bip44Address.privkey);
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
    testBIP86Seed().then(() => {
        server.kill();
        process.exit(0);
    }).catch(error => {
        console.error(error);
        server.kill();
        process.exit(1);
    });
}, 2000);