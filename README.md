# taco-push-demo

See this demo in action:
[https://taco-push-demo.vercel.app/](https://taco-push-demo.vercel.app/)

## Installation

```bash
pnpm install
pnpm start
```

## Prerequisites

- In order to run this demo will need a MetaMask with an account funded with some
  $MATIC.

- Additionally, will need to create a Channel in push protocol: please, choose staging
  environment + Polygon Mumbai testnet. Docs
  [here](https://push.org/docs/notifications/tutorials/create-your-channel/)

## What you will do

This demo joins [Threshold Access Control
(TACo 🌮)](https://docs.threshold.network/app-development/threshold-access-control-tac)
with [Push Protocol](https://push.org/).

With this demo, you will:

1. Create a new TACo Access Policy for your information.
2. Encrypt a text message.
3. Get the ciphertext.
4. Decrypt the ciphertext, only if you comply with the onchain condition.
5. Everytime the information is decrypted, a Push notification is sent to the encryptor
   address.
