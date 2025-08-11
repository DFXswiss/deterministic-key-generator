const puppeteer = require('puppeteer');

async function testDropdownFilter() {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        
        console.log('\n=== Testing Private Key Dropdown Filter ===\n');
        
        // Navigate to the tool
        await page.goto('http://localhost:8080/src/index.html');
        await page.waitForSelector('#phrase');
        
        // Wait for networks to load
        await new Promise(r => setTimeout(r, 2000));
        
        // Get all networks from Mnemonic tab
        const mnemonicNetworks = await page.evaluate(() => {
            const options = [];
            $('#network-phrase option').each(function() {
                options.push($(this).text());
            });
            return options;
        });
        
        console.log(`Total networks in Mnemonic tab: ${mnemonicNetworks.length}`);
        
        // Switch to Private Key tab
        await page.evaluate(() => {
            $('#start-with-tabs a[href="#start-private-key"]').tab('show');
        });
        await new Promise(r => setTimeout(r, 1000));
        
        // Get all networks from Private Key tab
        const privateKeyNetworks = await page.evaluate(() => {
            const options = [];
            $('#network-private-key option').each(function() {
                options.push($(this).text());
            });
            return options;
        });
        
        console.log(`Total networks in Private Key tab: ${privateKeyNetworks.length}`);
        console.log(`Filtered out: ${mnemonicNetworks.length - privateKeyNetworks.length} networks\n`);
        
        // Check for unsupported coins that should NOT be in the dropdown
        const unsupportedCoins = [
            'ETH - Ethereum',
            'BSC - Binance Smart Chain', 
            'ETC - Ethereum Classic',
            'ATOM - Cosmos Hub',
            'LUNA - Terra',
            'RUNE - THORChain',
            'IOV - Starname',
            'XRP - Ripple',
            'XLM - Stellar',
            'NANO - Nano',
            'NAS - Nebulas',
            'TRX - Tron',
            'EOS - EOSIO',
            'FIO - Foundation for Interwallet Operability',
            'HNS - Handshake',
            'NRG - Energi',
            'XWC - Whitecoin',
            'CLO - Callisto',
            'ESN - Ethersocial Network',
            'EWT - EnergyWeb',
            'EXP - Expanse',
            'ELLA - Ellaism',
            'PIRL - Pirl',
            'MIX - MIX',
            'MUSIC - Musicoin',
            'MOAC - MOAC',
            'ERE - EtherCore',
            'POA - Poa'
        ];
        
        console.log('Checking for unsupported coins that should be filtered out:\n');
        
        let foundUnsupported = [];
        unsupportedCoins.forEach(coin => {
            if (privateKeyNetworks.includes(coin)) {
                foundUnsupported.push(coin);
            }
        });
        
        if (foundUnsupported.length === 0) {
            console.log('✅ SUCCESS: All unsupported coins have been filtered out!\n');
        } else {
            console.log('❌ FAILED: Found unsupported coins in dropdown:\n');
            foundUnsupported.forEach(coin => {
                console.log(`  - ${coin}`);
            });
            console.log('');
        }
        
        // Check that important supported coins ARE in the dropdown
        const supportedCoins = [
            'BTC - Bitcoin',
            'BTC - Bitcoin Testnet',
            'LTC - Litecoin',
            'DOGE - Dogecoin',
            'DASH - Dash',
            'BCH - Bitcoin Cash',
            'BTG - Bitcoin Gold',
            'ZEC - Zcash',
            'VTC - Vertcoin',
            'DGB - Digibyte'
        ];
        
        console.log('Checking that supported coins are still available:\n');
        
        let missingSupportedCoins = [];
        supportedCoins.forEach(coin => {
            if (!privateKeyNetworks.includes(coin)) {
                missingSupportedCoins.push(coin);
            }
        });
        
        if (missingSupportedCoins.length === 0) {
            console.log('✅ All tested supported coins are available!\n');
        } else {
            console.log('⚠️  WARNING: Some supported coins are missing:\n');
            missingSupportedCoins.forEach(coin => {
                console.log(`  - ${coin}`);
            });
            console.log('');
        }
        
        // Summary
        console.log('=== SUMMARY ===\n');
        console.log(`Mnemonic tab coins: ${mnemonicNetworks.length}`);
        console.log(`Private Key tab coins: ${privateKeyNetworks.length}`);
        console.log(`Filtered out: ${mnemonicNetworks.length - privateKeyNetworks.length}`);
        console.log(`Unsupported coins found: ${foundUnsupported.length}`);
        console.log(`Missing supported coins: ${missingSupportedCoins.length}`);
        
        if (foundUnsupported.length === 0 && missingSupportedCoins.length === 0) {
            console.log('\n✅ Filter is working correctly!');
        } else {
            console.log('\n⚠️  Filter needs adjustment');
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
    testDropdownFilter().then(() => {
        server.kill();
        process.exit(0);
    }).catch(error => {
        console.error(error);
        server.kill();
        process.exit(1);
    });
}, 2000);