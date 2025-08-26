# Devnet Deployment Guide

## Current Status
- ✅ Anchor.toml configured for Devnet
- ✅ Solana CLI set to Devnet
- ❌ Insufficient SOL for deployment (have 6.5 SOL, need ~40 SOL)

## Options to Complete Deployment

### Option 1: Get More Devnet SOL

**Multiple Faucets:**
- https://faucet.solana.com/
- https://solfaucet.com/
- Solana Discord #devnet-faucet channel

**Create Multiple Keypairs:**
```bash
# Create additional keypairs and airdrop to them
for i in {1..20}; do
  solana-keygen new --outfile temp-keypair-$i.json --no-bip39-passphrase
  solana airdrop 2 --keypair temp-keypair-$i.json
  solana transfer $(solana address) 1.9 --keypair temp-keypair-$i.json
done
```

**Wait for Rate Limit Reset:**
- Airdrop rate limits reset every 24 hours
- Try again tomorrow: `solana airdrop 2`

### Option 2: Use Existing Drift Protocol on Devnet

Instead of deploying your own fork, connect to the official Drift Protocol on Devnet:

**Program ID:** `dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH`

### Option 3: Deploy When You Have Sufficient SOL

Once you have ~40 SOL, run:
```bash
cd /home/tt/apexv5/apex-protocol
solana program deploy target/deploy/drift.so
```

## Next Steps After Deployment

1. **Get RPC Endpoint** from Helius, QuickNode, or Alchemy
2. **Create .env.local** with:
   ```
   NEXT_PUBLIC_RPC_ENDPOINT=your_devnet_rpc_url
   NEXT_PUBLIC_APEX_PROGRAM_ID=your_deployed_program_id
   NEXT_PUBLIC_NETWORK=devnet
   ```
3. **Update UI** to use Devnet configuration
4. **Test** wallet connection and market data on Devnet

## Recommended Approach

For immediate testing, use Option 2 (existing Drift Protocol) and get an RPC endpoint. This allows you to test the UI integration without waiting for SOL or deploying your own program.
