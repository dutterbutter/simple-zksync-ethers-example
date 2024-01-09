// Start writing your scripts here

import { Provider, types, utils, Wallet } from "zksync-ethers";
import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

const provider =
  Provider.getDefaultProvider(types.Network.Sepolia) ||
  new Provider("https://sepolia.era.zksync.dev");
const ethProvider = ethers.getDefaultProvider("sepolia");
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);

const paymasterAddress = "0x03F9f8F5fEf5B729842ccD8A9171b8beF5Ad8FB9";
const greeterContract = "0x785086b2E1818a8480a7c747E82878C4D9b5D87B";
const greeterABI = new ethers.Interface(require("./greeter.json").abi);

async function main() {
  console.log(
    `Wallet address BEFORE setGreeting call: ${await wallet.getBalance()}`
  );

  let greeterContractInstance = new ethers.Contract(
    greeterContract,
    greeterABI,
    wallet
  );
  let greeter = await greeterContractInstance.greet();
  console.log("Greeter message: ",greeter);

  let paymaster_params = {
    customData: {
      gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
      paymasterParams: utils.getPaymasterParams(paymasterAddress, {
        type: "General",
        innerInput: new Uint8Array(),
      }),
    },
  };
  let tx_rec = await greeterContractInstance.setGreeting(
    "Bonjour yall!",
    paymaster_params
  );
  await tx_rec.wait();
  greeter = await greeterContractInstance.greet();
  console.log("New Greeter message: ", greeter);
  
  console.log(
    `Wallet address AFTER setGreeting call: ${await wallet.getBalance()}`
  );
}

main()
  .then()
  .catch((error) => {
    console.log(`Error: ${error}`);
  });

// === CONFIG ===

// By default zkSync Sepolia Testnet will be used (e.g. when calling getWallet() or getProvider())
// Customize default network in utils/chains.ts `defaultChain`

// === EXAMPLES ===

// Token interaction examples: getting balance, token info, transfer
// examples/token.ts

// Bridge examples: deposit and withdraw
// examples/bridge.ts

// Events examples: watch contract events, watch latest transactions
// examples/events.ts
