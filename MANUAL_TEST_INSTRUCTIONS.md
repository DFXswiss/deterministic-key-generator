# Manual Browser Test Instructions

## Prerequisites
- Server running at http://127.0.0.1:8081
- Modern browser (Chrome, Firefox, Safari)

## Test Cases

### Test 1: nsec Format Support
1. Open http://127.0.0.1:8081/index.html
2. Click on "Private Key" tab
3. Select "BTC - Bitcoin Ark Testnet" from dropdown
4. Enter private key: `nsec1kk0aks7njd72wy2adjrc4qqx4dd5alzjpuvmku8urnx8ljqrwusqzus34y`
5. Click "GENERATE" or press Enter

**Expected Results:**
- Public Key: `03fa0d588d1afebe820db2f2cf503050ef0ca55e8ea8c4098fa7961c91959a496d`
- Standard Ark Address: `tark1q8aq6kydrtltaqsdktev75ps2rhsef27365vgzv057tpeyv4nfyk6nx0k32`
- Protocol VTXO Address: `tark1qra883hysahlkt0ujcwhv0x2n278849c3m7t3a08l7fdc40f4f2nmr7aax9rt24j6nygp6rsmdgqnqk3ld5qpnymcyfp0n46w63vt6twj24hvy`
- VTXO Taproot Key: `8fdde98a35aab2d4c880e870db500982d1fb6800cc9bc11217ceba76a2c5e96e`
- Server Pubkey: `03fa73c6e4876ffb2dfc961d763cca9abc73d4b88efcb8f5e7ff92dc55e9aa553d`
- Exit Delay: `172544 seconds`

### Test 2: WIF Format (Original Test Key)
1. Open http://127.0.0.1:8081/index.html
2. Click on "Private Key" tab  
3. Select "BTC - Bitcoin Ark Testnet" from dropdown
4. Enter private key: `KxJFqytJx5vuzMMxv9mjPGW88n8t4P6ywfJJ78UfR9AsV5XaD4fH`
5. Click "GENERATE" or press Enter

**Expected Results:**
- Protocol VTXO Address: `tark1qra883hysahlkt0ujcwhv0x2n278849c3m7t3a08l7fdc40f4f2nm8e5wfwmqqrm6yt30d2quacr9t3svg4qk6q7a5jewvp7yjep0z2gtpj3fd`
- VTXO Taproot Key: `9f34725db0007bd11717b540e77032ae30622a0b681eed2597303e24b2178948`

### Test 3: Hex Format
1. Open http://127.0.0.1:8081/index.html
2. Click on "Private Key" tab
3. Select "BTC - Bitcoin Ark Testnet" from dropdown
4. Enter private key: `b59fdb43d3937ca7115d6c878a8006ab5b4efc520f19bb70fc1ccc7fc8037720`
5. Click "GENERATE" or press Enter

**Expected Results:**
- Same as Test 1 (nsec format)

## Verification Checklist

- [ ] nsec format is recognized and processed correctly
- [ ] WIF format works as before
- [ ] Hex format (64 characters) works
- [ ] Server info is automatically fetched when Ark Testnet is selected
- [ ] Protocol VTXO Address matches expected value
- [ ] VTXO Taproot Key matches expected value
- [ ] Exit Delay shows "172544 seconds" (not blocks)
- [ ] All Ark-specific fields are visible when Ark Testnet is selected

## Common Issues

1. **Address not generated**: Make sure to click "GENERATE" or press Enter after entering the private key
2. **Server info not fetched**: Check browser console for CORS errors. Server at https://mutinynet.arkade.sh must be accessible
3. **Wrong address format**: Clear browser cache (Ctrl+Shift+R) to ensure latest JavaScript is loaded

## Success Criteria

✅ All three input formats (nsec, WIF, hex) produce the correct Protocol VTXO Address
✅ The VTXO Taproot Key matches the expected value
✅ Server parameters are automatically fetched and displayed