const puppeteer = require('puppeteer');

async function debugMnemonicTests() {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        
        // Enable console logging
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
        
        console.log('\n=== Testing Mnemonic Tab ===\n');
        
        // Navigate to the tool
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
        await new Promise(r => setTimeout(r, 3000));
        
        // Check if addresses table exists
        const tableInfo = await page.evaluate(() => {
            const table = document.querySelector('#addresses');
            const tbody = document.querySelector('#addresses tbody');
            const rows = document.querySelectorAll('#addresses tbody tr');
            
            return {
                tableExists: table !== null,
                tbodyExists: tbody !== null,
                rowCount: rows.length,
                firstRowHTML: rows[0] ? rows[0].innerHTML.substring(0, 200) : 'no first row'
            };
        });
        console.log('Table info:', tableInfo);
        
        // Try to get first address
        if (tableInfo.rowCount > 0) {
            const firstAddress = await page.evaluate(() => {
                const firstRow = document.querySelector('#addresses tbody tr');
                if (!firstRow) return null;
                
                const cells = firstRow.querySelectorAll('td');
                if (cells.length < 4) return { error: 'Not enough cells', cellCount: cells.length };
                
                return {
                    path: cells[0] ? cells[0].textContent : '',
                    address: cells[1] ? cells[1].textContent : '',
                    pubkey: cells[2] ? cells[2].textContent : '',
                    privkey: cells[3] ? cells[3].textContent : ''
                };
            });
            console.log('First address:', firstAddress);
        }
        
        // Check for "more" button and click it to generate more addresses
        const moreButtonExists = await page.evaluate(() => {
            const btn = document.querySelector('.more');
            if (btn) {
                btn.click();
                return true;
            }
            return false;
        });
        console.log('More button clicked:', moreButtonExists);
        
        if (moreButtonExists) {
            await new Promise(r => setTimeout(r, 2000));
            
            const rowCount = await page.evaluate(() => {
                return document.querySelectorAll('#addresses tbody tr').length;
            });
            console.log('Row count after clicking more:', rowCount);
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
    debugMnemonicTests().then(() => {
        server.kill();
    }).catch(error => {
        console.error(error);
        server.kill();
    });
}, 2000);