const puppeteer = require('puppeteer');

async function testBIP86() {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        
        // Enable console logging
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
        
        // Navigate to the tool
        await page.goto('http://127.0.0.1:8080/src/index.html');
        
        // Wait for page to load
        await new Promise(r => setTimeout(r, 2000));
        
        // Check if BIP86 tab exists
        const bip86TabExists = await page.evaluate(() => {
            return document.querySelector('#bip86-tab') !== null;
        });
        console.log('BIP86 tab exists:', bip86TabExists);
        
        // Enter test mnemonic
        await page.evaluate(() => {
            document.querySelector('#phrase').value = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
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
        
        // Wait a bit
        await new Promise(r => setTimeout(r, 1000));
        
        // Click on BIP86 tab
        const tabClicked = await page.evaluate(() => {
            const tab = document.querySelector('#bip86-tab a');
            if (tab) {
                tab.click();
                return true;
            }
            return false;
        });
        console.log('BIP86 tab clicked:', tabClicked);
        
        // Wait for addresses to generate
        await new Promise(r => setTimeout(r, 2000));
        
        // Check if BIP86 is active
        const bip86Active = await page.evaluate(() => {
            return $('#bip86-tab').hasClass('active');
        });
        console.log('BIP86 tab active:', bip86Active);
        
        // Get derivation path
        const derivationPath = await page.evaluate(() => {
            const pathInput = document.querySelector('#bip86-path');
            return pathInput ? pathInput.value : 'not found';
        });
        console.log('Derivation path:', derivationPath);
        
        // Get first address
        const firstAddress = await page.evaluate(() => {
            const firstRow = document.querySelector('#addresses tbody tr');
            if (firstRow) {
                const cells = firstRow.querySelectorAll('td');
                if (cells.length >= 2) {
                    return cells[1].textContent;
                }
            }
            return 'no address found';
        });
        console.log('First address:', firstAddress);
        
    } catch (error) {
        console.error('Test error:', error);
    } finally {
        await browser.close();
    }
}

testBIP86().catch(console.error);