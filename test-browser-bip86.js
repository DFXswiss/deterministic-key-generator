const puppeteer = require('puppeteer');

async function testBrowserBIP86() {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        
        console.log('\n=== Testing BIP86 in Browser ===\n');
        console.log('Seed: pioneer force body detect verify lady hire width tissue make zebra boring\n');
        
        // Navigate to our tool
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
        
        // Get the first 5 BIP86 addresses
        const addresses = await page.evaluate(() => {
            const rows = document.querySelectorAll('tbody.addresses tr');
            const result = [];
            for (let i = 0; i < Math.min(5, rows.length); i++) {
                const cells = rows[i].querySelectorAll('td');
                result.push({
                    path: cells[0] ? cells[0].textContent.trim() : '',
                    address: cells[1] ? cells[1].textContent.trim() : '',
                    pubkey: cells[2] ? cells[2].textContent.trim() : '',
                    privkey: cells[3] ? cells[3].textContent.trim() : ''
                });
            }
            return result;
        });
        
        console.log('Our BIP86 Implementation generates:\n');
        addresses.forEach((addr, index) => {
            console.log(`Address ${index}:`);
            console.log(`Path:     ${addr.path}`);
            console.log(`Address:  ${addr.address}`);
            console.log(`PubKey:   ${addr.pubkey}`);
            console.log(`PrivKey:  ${addr.privkey}`);
            console.log('');
        });
        
        console.log('According to you, bitcoiner.guide generates:');
        console.log('Path:     m/86\'/0\'/0\'/0/0');
        console.log('Address:  bc1peyp4cj4a48hyk7q7mh7wkmhq20dd45nq26pe684kxavhkf6juw9q9qq5a5');
        console.log('PubKey:   03d0ed6676dc17e0707776590807da7abb50064234b232e12fc47defa671e32dc2');
        console.log('PrivKey:  KzXHL4tVtRoy2ydEL5xDUXsDb48ThnwoTZVNPnX8JasMaNskPHGi');
        
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
    testBrowserBIP86().then(() => {
        server.kill();
        process.exit(0);
    }).catch(error => {
        console.error(error);
        server.kill();
        process.exit(1);
    });
}, 2000);