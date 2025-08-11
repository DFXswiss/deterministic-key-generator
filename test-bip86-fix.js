const puppeteer = require('puppeteer');

async function testBIP86() {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        
        // Navigate to the tool
        await page.goto('http://127.0.0.1:8080/src/index.html');
        
        // Wait for page to load
        await new Promise(r => setTimeout(r, 2000));
        
        // Enter test mnemonic
        await page.evaluate(() => {
            document.querySelector('#phrase').value = 'oxygen lobster melody price ribbon home clip doll trigger glove silly market';
            $('#phrase').trigger('input');
        });
        
        // Select Bitcoin
        await page.evaluate(() => {
            $('.network option').each(function() {
                if ($(this).text() === 'BTC - Bitcoin') {
                    $('.network').val($(this).val()).trigger('change');
                    return false;
                }
            });
        });
        
        // Click on BIP86 tab
        await page.evaluate(() => {
            $('#bip86-tab a').click();
        });
        
        // Wait for addresses to generate
        await new Promise(r => setTimeout(r, 2000));
        
        // Get first few addresses
        const addresses = await page.evaluate(() => {
            const rows = document.querySelectorAll('#addresses tbody tr');
            const results = [];
            for (let i = 0; i < Math.min(5, rows.length); i++) {
                const cells = rows[i].querySelectorAll('td');
                if (cells.length >= 4) {
                    results.push({
                        path: cells[0].textContent,
                        address: cells[1].textContent,
                        pubkey: cells[2].textContent,
                        privkey: cells[3].textContent
                    });
                }
            }
            return results;
        });
        
        console.log('BIP86 Taproot Addresses:');
        console.log('========================');
        addresses.forEach(addr => {
            console.log(`Path: ${addr.path}`);
            console.log(`Address: ${addr.address}`);
            console.log(`Should start with: bc1p (mainnet) or tb1p (testnet)`);
            console.log('---');
        });
        
    } catch (error) {
        console.error('Test error:', error);
    } finally {
        await browser.close();
    }
}

testBIP86().catch(console.error);