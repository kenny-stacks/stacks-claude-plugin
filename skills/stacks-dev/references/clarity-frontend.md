# Stacks.js Frontend Integration

Quick reference for @stacks/connect v8+ and contract interactions with React.

## Setup

```bash
npm install @stacks/connect @stacks/transactions @stacks/network
```

## Wallet Integration (v8+ API)

```typescript
import { connect, disconnect, isConnected, getLocalStorage } from "@stacks/connect";

// Connect
const response = await connect();
const data = getLocalStorage();
const address = data?.stxAddress;

// Check connection
if (isConnected()) { /* ... */ }

// Disconnect
disconnect();
```

## Contract Calls

### Read-Only

```typescript
import { fetchCallReadOnlyFunction, cvToValue, Cl } from "@stacks/transactions";

const result = await fetchCallReadOnlyFunction({
  contractAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
  contractName: "my-token",
  functionName: "get-balance",
  functionArgs: [Cl.principal(address)],
  network: getNetwork(),
  senderAddress: address,
  validateWithAbi: true,
});
return cvToValue(result).value;
```

### Write (With Signing)

```typescript
import { openContractCall } from "@stacks/connect";

await openContractCall({
  contractAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
  contractName: "my-token",
  functionName: "transfer",
  functionArgs: [Cl.uint(amount), Cl.principal(recipient), Cl.none()],
  onFinish: (data) => console.log("TX:", data.txId),
});
```

## Post-Conditions (CRITICAL)

Always include post-conditions for STX/token operations to protect users.

```typescript
import { Pc, PostConditionMode } from "@stacks/transactions";

await openContractCall({
  // ... contract details ...
  postConditions: [
    Pc.principal(senderAddress)
      .willSendEq(amount)
      .ft('ST1...contract.token', 'token-name')
  ],
  postConditionMode: PostConditionMode.Deny, // ALWAYS use Deny
});
```

### Common Patterns

```typescript
// STX
Pc.principal(address).willSendEq(1000000).ustx()

// Fungible tokens
Pc.principal(address).willSendEq(100).ft('SP...contract', 'token-name')

// NFT
Pc.principal(address).willSendAsset().nft('SP...contract::nft', Cl.uint(tokenId))

// Receive (sender sends <= 0)
Pc.principal(address).willSendLte(0).ft('SP...contract', 'token')
```

## Network Configuration

```typescript
import { StacksMainnet, StacksTestnet, StacksDevnet } from "@stacks/network";

export function getNetwork() {
  switch (process.env.NEXT_PUBLIC_STACKS_NETWORK) {
    case "mainnet": return new StacksMainnet();
    case "testnet": return new StacksTestnet();
    default: return new StacksDevnet({ url: 'http://localhost:20443' });
  }
}
```

## Transaction Status Polling

`onFinish` fires on BROADCAST, not confirmation. Poll for actual status:

```typescript
async function pollTransactionStatus(txId: string): Promise<string> {
  const maxAttempts = 30;
  const interval = 2000; // 2 seconds

  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(`https://api.devnet.hiro.so/extended/v1/tx/${txId}`);
    const tx = await res.json();

    if (tx.tx_status === 'success') return 'success';
    if (tx.tx_status === 'abort_by_response' || tx.tx_status === 'abort_by_post_condition') {
      return 'failed';
    }

    await new Promise(r => setTimeout(r, interval));
  }
  return 'timeout';
}
```

## React Patterns

### Auth Context

```typescript
import { createContext, useContext, useState, useEffect } from "react";
import { connect, disconnect, isConnected, getLocalStorage } from "@stacks/connect";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [address, setAddress] = useState(null);

  useEffect(() => {
    if (isConnected()) {
      setAddress(getLocalStorage()?.stxAddress || null);
    }
  }, []);

  const handleConnect = async () => {
    await connect();
    setAddress(getLocalStorage()?.stxAddress || null);
  };

  return (
    <AuthContext.Provider value={{ address, connect: handleConnect, disconnect: () => { disconnect(); setAddress(null); } }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

### Contract Call Hook

```typescript
import { useState } from "react";
import { openContractCall } from "@stacks/connect";

export function useContractCall() {
  const [loading, setLoading] = useState(false);
  const [txId, setTxId] = useState(null);

  async function call(options) {
    setLoading(true);
    await openContractCall({
      ...options,
      network: getNetwork(),
      onFinish: (data) => { setTxId(data.txId); setLoading(false); },
      onCancel: () => setLoading(false),
    });
  }

  return { call, loading, txId };
}
```

## External References

- [Connect Wallet](https://docs.stacks.co/stacks-connect/connect-wallet)
- [@stacks/transactions](https://docs.stacks.co/reference/stacks.js/stacks-transactions)
- [Post-Conditions](https://docs.stacks.co/post-conditions/implementation)
- [Stacks.js Starters](https://github.com/hirosystems/stacks.js-starters)

---

*Reference file for stacks-dev skill - Frontend integration*
