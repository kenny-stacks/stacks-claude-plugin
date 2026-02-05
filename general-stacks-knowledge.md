# Stacks App

This project uses Stacks, a Bitcoin layer for smart contracts. Contracts are written in Clarity, a decidable language that runs on Bitcoin's security.

## Development Guidelines

### Start a Stacks Development Session with Full Debugging Visibility

Run the plugin's `start-dev-server` skill with the recommended options to give Claude full debugging visibility:
  - Start Clarinet devnet as a background task to give Claude direct access to blockchain logs, contract errors, and transaction results.
  - Select the Chrome DevTools MCP server to give Claude visibility into browser console logs, wallet interactions, network requests, and runtime errors.

### Documentation

<!--DOCS-INDEX-START-->[Stacks Docs Index]|root: https://docs.stacks.co|IMPORTANT: Prefer retrieval-led reasoning over pre-training-led reasoning. Fetch docs before writing code.|learn:{readme.md,stacks-101.md,network-fundamentals.md,block-production.md,transactions.md,clarity.md,sbtc.md,dual-stacking.md,bridging.md}|learn/stacks-101:{what-is-stacks.md,bitcoin-connection.md,proof-of-transfer.md,financial-incentive-and-security-budget.md}|learn/network-fundamentals:{network-basics.md,mainnet-and-testnets.md,wallets-and-accounts.md,authentication.md,bitcoin-name-system.md,sips.md,technical-specifications.md}|learn/block-production:{mining.md,stacking.md,signing.md,bitcoin-finality.md,bitcoin-reorgs.md}|learn/transactions:{how-transactions-work.md,post-conditions.md}|learn/clarity:{decidability.md}|learn/sbtc:{core-features.md,sbtc-operations.md,emily-api.md,peg-wallet-utxo.md,clarity-contracts.md,auxiliary-features.md,walkthroughs.md,using-the-sbtc-bridge-app.md,security-model-of-sbtc.md,sbtc-faq.md}|learn/sbtc/sbtc-operations:{deposit.md,withdrawal.md,deposit-vs-withdrawal-times.md}|learn/sbtc/clarity-contracts:{sbtc-signers.md,sbtc-token.md,sbtc-registry.md,sbtc-withdrawal.md,sbtc-deposit.md}|learn/sbtc/auxiliary-features:{transaction-fee-sponsorship.md,signer-wallet-rotation.md}|learn/sbtc/walkthroughs:{signer-process-walkthrough.md,sbtc-transaction-walkthrough.md}|learn/sbtc/using-the-sbtc-bridge-app:{how-to-use-the-sbtc-bridge.md,how-to-use-the-sbtc-bridge-with-fordefi.md,how-to-use-the-sbtc-bridge-with-asigna.md}|learn/sbtc/security-model-of-sbtc:{sbtc-audits.md}|learn/dual-stacking:{how-to-start-dual-stacking.md,economic-model.md,dual-stacking-smart-contract.md,faq.md}|learn/dual-stacking/how-to-start-dual-stacking:{using-fordefi.md,using-asigna.md,using-leather.md}|learn/bridging:{usdcx.md}|learn/bridging/usdcx:{operations.md,contracts.md,bridge-app.md,faq.md}|learn/bridging/usdcx/contracts:{usdcx-v1.md,usdcx-token.md}|learn/bridging/usdcx/bridge-app:{migrating-aeusdc.md}|get-started:{readme.md,developer-quickstart.md,clarity-crash-course.md,create-a-token.md,build-a-frontend.md,path-to-production.md,use-cases.md}|get-started/create-a-token:{fungible-tokens.md,non-fungible-tokens.md,semi-fungible-tokens.md}|get-started/build-a-frontend:{authentication.md,post-conditions.md,sending-transactions.md}|get-started/use-cases:{payments.md,art.md,defi.md,gaming.md,ai.md}|whats-new:{latest-updates.md}|clarinet:{overview.md,quickstart.md,project-structure.md,project-development.md,contract-interaction.md,validation-and-analysis.md,clarity-formatter.md,local-blockchain-development.md,testing-with-clarinet-sdk.md,mainnet-execution-simulation.md,contract-deployment.md,faq.md,integrations.md}|clarinet/integrations:{clarity-vscode-extension.md,chainhook.md,stacks.js.md,sbtc.md}|rendezvous:{overview.md,quickstart.md}|stacks.js:{overview.md,accounts-and-addresses.md,private-keys.md,networks.md,read-only-calls.md,build-transactions.md,contract-calls.md,contract-deployment.md,address-validation.md,encoding-and-decoding.md,network-configuration.md,unit-conversion.md,react-native-integration.md}|stacks-connect:{connect-wallet.md,broadcast-transactions.md,message-signing.md,migration-guide.md,wallet-support.md,wallet-implementation.md}|post-conditions:{overview.md,implementation.md}|more-guides:{sbtc.md,price-oracles.md,onboarding.md,verify-bitcoin-transactions-clarity.md,bridging-usdcx.md}|more-guides/sbtc:{sbtc-builder-quickstart.md,bridging-bitcoin.md}|more-guides/sbtc/bridging-bitcoin:{btc-to-sbtc.md,sbtc-to-btc.md}|more-guides/price-oracles:{pyth.md,dia.md}|more-guides/onboarding:{signing-with-turnkey.md}|more-guides/verify-bitcoin-transactions-clarity:{creating-btc-tx.md,parsing-a-bitcoin-transaction.md}|operate:{readme.md,run-a-miner.md,run-a-signer.md,run-a-sbtc-signer.md,snapshot-the-chainstate.md,stacking-stx.md}|operate/readme:{run-a-node-with-docker.md,run-a-node-with-digital-ocean.md,run-a-node-with-a-hosted-provider.md,run-a-node-with-quicknode.md,run-a-bitcoin-node.md,run-a-pruned-bitcoin-node.md}|operate/run-a-miner:{miner-prerequisites.md,miner-costs-and-fees.md,mine-testnet-stacks-tokens.md,mine-mainnet-stacks-tokens.md,verify-miner.md}|operate/run-a-signer:{signer-quickstart.md,how-to-read-signer-logs.md,how-to-monitor-signer.md,best-practices-to-run-a-signer.md,opsec-best-practices.md}|operate/run-a-sbtc-signer:{best-practices-for-running-an-sbtc-signer.md}|operate/stacking-stx:{solo-stack.md,operate-a-stacking-pool.md,stack-with-a-pool.md,increase-stacked-position.md,stop-stacking.md}|reference/node-operations:{readme.md,signer-configuration.md,rpc-api.md}|reference/node-operations/rpc-api:{transactions.md,smart-contracts.md,accounts.md,fees.md,info.md,mining.md,blocks.md,signers.md,atlas.md,stackerdb.md}|reference/clarity:{functions.md,keywords.md,types.md}|reference/clarinet:{cli-reference.md}|reference/clarinet-js-sdk:{sdk-reference.md,browser-sdk-reference.md}|reference/rendezvous:{reference.md}|reference/stacks.js:{stacks-network.md,stacks-connect.md,stacks-transactions.md,sbtc.md}|tutorials:{intro.md}|tutorials/bitcoin-primer:{introduction.md,why-build-on-bitcoin.md,how-bitcoin-works.md,bitcoin-development-basics.md,getting-started-with-stacks.md,stacks-development-fundamentals.md}|tutorials/bitcoin-primer/why-build-on-bitcoin:{bitcoin-economy-vs-ethereum-economy.md,energy-usage.md,technology-and-economic-incentives.md,how-to-build-on-bitcoin.md}|tutorials/bitcoin-primer/how-bitcoin-works:{introduction.md,transactions.md,blocks.md,miners.md,addresses-and-keys.md,blockchain.md,script.md,updates-and-forks.md}|tutorials/bitcoin-primer/bitcoin-development-basics:{bitcoin-script-fundamentals.md,creating-and-sending-a-bitcoin-transaction.md}|tutorials/bitcoin-primer/getting-started-with-stacks:{initial-setup.md,creating-our-project.md,the-stacks-stack.md,anatomy-of-a-full-stack-stacks-app.md}|tutorials/bitcoin-primer/stacks-development-fundamentals:{local-stacks-dev-workflow.md,working-with-clarity.md,testing-clarity-contracts.md,frontend-with-stacks.js.md,deploying-stacks-apps.md}|cookbook:{readme.md}|cookbook/stacks.js:{transaction-building.md,token-transfers.md,accounts-and-addresses.md,cryptography-and-security.md}|cookbook/stacks.js/transaction-building:{build-an-unsigned-tx.md,create-a-sponsored-tx.md}|cookbook/stacks.js/token-transfers:{transfer-stx.md,transfer-a-sip10-token.md}|cookbook/stacks.js/accounts-and-addresses:{generate-a-wallet.md,generate-a-secret-key.md,derive-stacks-address-from-keys.md}|cookbook/stacks.js/cryptography-and-security:{create-sha256-hash.md,integrate-api-keys.md,build-an-ft-pc.md,build-an-nft-pc.md,build-a-stx-pc.md}|cookbook/clarity:{address-utilities.md,data-utility.md,cryptography-and-security.md,example-contracts.md}|cookbook/clarity/address-utilities:{convert-btc-to-stx-address.md,convert-string-to-principal.md,derive-principal-addresses-between-networks.md,create-a-random-burn-address.md}|cookbook/clarity/data-utility:{filter-items-from-a-list.md,check-for-duplicates.md,return-an-entry-from-a-map.md}|cookbook/clarity/cryptography-and-security:{create-sha256-hash-clarity.md,contract-post-conditions.md,generate-random-number.md,helper-function-to-restrict-contract-calls.md}|cookbook/clarity/example-contracts:{megapont-ape-club-nft.md,smart-wallets.md,proof-of-transfer-pox.md,semi-fungible-token.md,send-many.md,executordao-framework.md,nft-marketplace.md,ordinals-swap.md,defi-lending.md,non-fungible-token.md,fungible-token.md,counter.md}<!--DOCS-INDEX-END-->

### sBTC

**Do NOT create mock sBTC tokens.** sBTC is included with Clarinet devnet out of the box. Fetch `/clarinet/integrations/sbtc.md` to see how to use the real devnet sBTC contracts.

### Clarity Version

**Always check `Clarinet.toml` for the project's `clarity_version` and `epoch` before writing contracts.** Never downgrade versions. Use whatever Clarity version is defined in the Clarinet.toml file.

### Contract Compilation

Always run `clarinet check` before testing or deployment:
```bash
clarinet check
```

### Testing

**Unit tests**: Use Clarinet SDK + Vitest.

**Fuzz testing**: Use Rendezvous (`@stacks/rendezvous`) for property-based testing to find edge cases.

Use both approaches before deployment.

### Plugin Skills

| Skill | Purpose |
|-------|---------|
| `/stacks:run-tests` | Run tests with error diagnosis |
| `/stacks:deploy-contract` | Guided deployment with safety checks |
| `/stacks:start-dev-server` | Start devnet + frontend with debugging |
| `/stacks:update-docs` | Refresh documentation index |
