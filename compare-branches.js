#!/usr/bin/env node

// Script to compare address generation between branches
const { execSync } = require('child_process');
const puppeteer = require('puppeteer');

const TEST_MNEMONIC = "oxygen lobster melody price ribbon home clip doll trigger glove silly market";

async function testBranch(branchName) {
    console.log(`\n=== Testing ${branchName} branch ===`);
    
    // Switch to branch
    execSync(`git checkout ${branchName}`, { stdio: 'pipe' });
    
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
        await page.goto('http://localhost:8080/src/index.html');
        
        // Enter mnemonic
        await page.evaluate((mnemonic) => {
            document.querySelector('#phrase').value = mnemonic;
            const event = new Event('input', { bubbles: true });
            document.querySelector('#phrase').dispatchEvent(event);
        }, TEST_MNEMONIC);
        
        // Wait for addresses to generate
        await page.waitForSelector('.address', { timeout: 5000 });
        
        // Get first 5 addresses
        const addresses = await page.evaluate(() => {
            const rows = document.querySelectorAll('#addresses tbody tr');
            const result = [];
            for (let i = 0; i < Math.min(5, rows.length); i++) {
                const cells = rows[i].querySelectorAll('td');
                if (cells.length >= 4) {
                    result.push({
                        path: cells[0].textContent,
                        address: cells[1].textContent,
                        pubkey: cells[2].textContent,
                        privkey: cells[3].textContent
                    });
                }
            }
            return result;
        });
        
        // Get derivation path
        const derivationPath = await page.$eval('#bip44-path', el => el.value);
        
        console.log(`Derivation Path: ${derivationPath}`);
        console.log('First 5 addresses:');
        addresses.forEach(addr => {
            console.log(`  ${addr.path}: ${addr.address}`);
        });
        
        await browser.close();
        return addresses;
        
    } catch (error) {
        console.error(`Error testing ${branchName}:`, error.message);
        await browser.close();
        return [];
    }
}

async function compare() {
    // Save current branch
    const currentBranch = execSync('git branch --show-current').toString().trim();
    
    try {
        const masterAddresses = await testBranch('master');
        const developAddresses = await testBranch('develop');
        
        console.log('\n=== COMPARISON ===');
        
        if (masterAddresses.length === 0 || developAddresses.length === 0) {
            console.log('Could not generate addresses on one or both branches');
            return;
        }
        
        let different = false;
        for (let i = 0; i < Math.min(masterAddresses.length, developAddresses.length); i++) {
            if (masterAddresses[i].address !== developAddresses[i].address) {
                different = true;
                console.log(`\nDifference at index ${i}:`);
                console.log(`  Master:  ${masterAddresses[i].address}`);
                console.log(`  Develop: ${developAddresses[i].address}`);
            }
        }
        
        if (!different) {
            console.log('No differences found - addresses are identical');
        }
        
    } finally {
        // Restore original branch
        execSync(`git checkout ${currentBranch}`, { stdio: 'pipe' });
        console.log(`\nRestored to branch: ${currentBranch}`);
    }
}

// Check if puppeteer is installed
try {
    require.resolve('puppeteer');
    compare();
} catch (e) {
    console.log('Puppeteer not installed. Running simpler comparison...');
    
    // Simpler comparison without puppeteer
    const currentBranch = execSync('git branch --show-current').toString().trim();
    
    console.log('\n=== Checking code differences ===');
    
    // Check for differences in address generation code
    const diff = execSync('git diff master develop src/index.html src/js/index.js | grep -E "address|Address|bitcoin\\.address" | head -20', { encoding: 'utf8' });
    
    console.log('Key differences in address generation code:');
    console.log(diff);
    
    console.log(`\nCurrent branch: ${currentBranch}`);
    console.log('\nTo test manually:');
    console.log('1. Open http://localhost:8080/src/index.html');
    console.log('2. Enter mnemonic: oxygen lobster melody price ribbon home clip doll trigger glove silly market');
    console.log('3. Check the generated addresses');
    console.log('4. Run: git checkout master');
    console.log('5. Refresh the page and compare addresses');
}