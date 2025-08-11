#!/usr/bin/env node

/**
 * Simple test runner without external dependencies
 * Tests basic functionality using Node.js built-in modules
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Test configuration
const PORT = 8080;
const BASE_URL = `http://localhost:${PORT}`;

// Test results
let testResults = {
    passed: 0,
    failed: 0,
    errors: []
};

// Simple HTTP GET request
function httpGet(url) {
    return new Promise((resolve, reject) => {
        // Replace localhost with 127.0.0.1 to avoid IPv6 issues
        const fixedUrl = url.replace('localhost', '127.0.0.1');
        http.get(fixedUrl, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: data }));
        }).on('error', reject);
    });
}

// Test functions
async function testPageLoad() {
    console.log('Testing: Page loads successfully...');
    try {
        const response = await httpGet(`${BASE_URL}/src/index.html`);
        if (response.status === 200) {
            console.log('✓ Main page loads');
            testResults.passed++;
            return true;
        } else {
            throw new Error(`Page returned status ${response.status}`);
        }
    } catch (error) {
        console.error('✗ Main page load failed:', error.message);
        testResults.failed++;
        testResults.errors.push({ test: 'Page Load', error: error.message });
        return false;
    }
}

async function testFileStructure() {
    console.log('Testing: Required files exist...');
    const requiredFiles = [
        'src/index.html',
        'src/js/index.js'
    ];
    
    // Optional files (check but don't fail if missing)
    const optionalFiles = [
        'src/js/bitcoinjs-3.3.2.min.js',
        'src/js/jquery-3.2.1.min.js'
    ];
    
    let allExist = true;
    for (const file of requiredFiles) {
        const filePath = path.join(__dirname, '..', file);
        if (fs.existsSync(filePath)) {
            console.log(`✓ ${file} exists`);
            testResults.passed++;
        } else {
            console.error(`✗ ${file} missing`);
            testResults.failed++;
            testResults.errors.push({ test: 'File Structure', error: `${file} not found` });
            allExist = false;
        }
    }
    
    // Check optional files (just log, don't fail)
    for (const file of optionalFiles) {
        const filePath = path.join(__dirname, '..', file);
        if (fs.existsSync(filePath)) {
            console.log(`✓ ${file} exists (optional)`);
        } else {
            console.log(`⚠ ${file} missing (optional, tests may be limited)`);
        }
    }
    
    return allExist;
}

async function testHTMLStructure() {
    console.log('Testing: HTML structure...');
    try {
        const htmlPath = path.join(__dirname, '..', 'src', 'index.html');
        const html = fs.readFileSync(htmlPath, 'utf8');
        
        // Check for essential elements
        const checks = [
            { name: 'Private Key tab', pattern: /id="private-key-tab"/ },
            { name: 'Private Key input', pattern: /id="private-key-input"/ },
            { name: 'Generate button', pattern: /id="generate-private-key"/ },
            { name: 'Ark address function', pattern: /generateArkAddress/ },
            { name: 'Bech32m encoder', pattern: /bech32m\.encode/ },
            { name: 'Network selector', pattern: /id="network-private-key"/ }
        ];
        
        let allPassed = true;
        for (const check of checks) {
            if (check.pattern.test(html)) {
                console.log(`✓ ${check.name} found`);
                testResults.passed++;
            } else {
                console.error(`✗ ${check.name} not found`);
                testResults.failed++;
                testResults.errors.push({ test: 'HTML Structure', error: `${check.name} missing` });
                allPassed = false;
            }
        }
        return allPassed;
    } catch (error) {
        console.error('✗ HTML structure test failed:', error.message);
        testResults.failed++;
        testResults.errors.push({ test: 'HTML Structure', error: error.message });
        return false;
    }
}

async function testJavaScriptSyntax() {
    console.log('Testing: JavaScript syntax...');
    try {
        const htmlPath = path.join(__dirname, '..', 'src', 'index.html');
        const html = fs.readFileSync(htmlPath, 'utf8');
        
        // Extract JavaScript code from HTML
        const scriptMatches = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi);
        if (!scriptMatches) {
            throw new Error('No script tags found');
        }
        
        // Basic syntax checks
        let syntaxValid = true;
        const syntaxChecks = [
            { name: 'Balanced braces', check: (code) => {
                const opens = (code.match(/{/g) || []).length;
                const closes = (code.match(/}/g) || []).length;
                return opens === closes;
            }},
            { name: 'Balanced parentheses', check: (code) => {
                const opens = (code.match(/\(/g) || []).length;
                const closes = (code.match(/\)/g) || []).length;
                return opens === closes;
            }},
            { name: 'Balanced brackets', check: (code) => {
                const opens = (code.match(/\[/g) || []).length;
                const closes = (code.match(/\]/g) || []).length;
                return opens === closes;
            }}
        ];
        
        for (const scriptTag of scriptMatches) {
            const code = scriptTag.replace(/<\/?script[^>]*>/gi, '');
            
            for (const check of syntaxChecks) {
                if (check.check(code)) {
                    console.log(`✓ ${check.name}`);
                    testResults.passed++;
                } else {
                    console.error(`✗ ${check.name} failed`);
                    testResults.failed++;
                    testResults.errors.push({ test: 'JavaScript Syntax', error: check.name });
                    syntaxValid = false;
                }
            }
        }
        
        return syntaxValid;
    } catch (error) {
        console.error('✗ JavaScript syntax test failed:', error.message);
        testResults.failed++;
        testResults.errors.push({ test: 'JavaScript Syntax', error: error.message });
        return false;
    }
}

// Generate test report
function generateReport() {
    const report = {
        summary: {
            total: testResults.passed + testResults.failed,
            passed: testResults.passed,
            failed: testResults.failed,
            timestamp: new Date().toISOString()
        },
        errors: testResults.errors
    };
    
    // Create test-results directory
    const resultsDir = path.join(__dirname, '..', 'test-results');
    if (!fs.existsSync(resultsDir)) {
        fs.mkdirSync(resultsDir, { recursive: true });
    }
    
    // Write JSON report
    fs.writeFileSync(
        path.join(resultsDir, 'simple-test-report.json'),
        JSON.stringify(report, null, 2)
    );
    
    // Print summary
    console.log('\n========================================');
    console.log('TEST SUMMARY');
    console.log('========================================');
    console.log(`Total tests: ${report.summary.total}`);
    console.log(`Passed: ${report.summary.passed}`);
    console.log(`Failed: ${report.summary.failed}`);
    console.log('========================================\n');
    
    return report.summary.failed === 0;
}

// Main test runner
async function runTests() {
    console.log('Starting simple test suite...\n');
    
    // Run tests that don't require a server
    await testFileStructure();
    await testHTMLStructure();
    await testJavaScriptSyntax();
    
    // Try to test with server if available
    try {
        // Start a simple HTTP server binding to 127.0.0.1
        console.log(`\nStarting HTTP server on port ${PORT}...`);
        const serverProcess = require('child_process').spawn('python3', 
            ['-m', 'http.server', PORT, '--bind', '127.0.0.1'], 
            { cwd: path.join(__dirname, '..'), detached: true, stdio: 'ignore' }
        );
        
        // Wait for server to start
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Run server-dependent tests
        await testPageLoad();
        
        // Kill the server
        try {
            process.kill(-serverProcess.pid);
        } catch (e) {
            // Server might have already stopped
        }
    } catch (error) {
        console.log('Note: Server tests skipped (server not available)');
    }
    
    // Generate report
    const success = generateReport();
    process.exit(success ? 0 : 1);
}

// Run tests
runTests().catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
});