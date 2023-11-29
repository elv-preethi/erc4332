// Welcome to the ERC-4337 tutorial #1!
// This tutorial walks you though a simple ERC-4337 transaction: sending a User Operation
// with gas paid by a Paymaster.
//
// You can view more information about this tutorial at
// https://docs.stackup.sh/docs/get-started-with-stackup
//
// Enter `npm run dev` into your terminal to run.

// This example uses the userop.js library to build the transaction, but you can use any
// library.

import { ethers } from "ethers";
import { Presets, Client } from "userop";

const rpcUrl ="https://api.stackup.sh/v1/node/<API_KEY>";
const paymasterUrl = ""; // Optional - you can get one at https://app.stackup.sh/

async function main2() {
  const paymasterContext = { type: "payg" };
  const paymasterMiddleware = Presets.Middleware.verifyingPaymaster(
    paymasterUrl,
    paymasterContext
  );
  const opts = paymasterUrl.toString() === "" ? {} : {
    paymasterMiddleware: paymasterMiddleware,
  }

  // Initialize the account
  const signingKey = "<SK>";
  const signer = new ethers.Wallet(signingKey);
  var builder = await Presets.Builder.SimpleAccount.init(signer, rpcUrl, opts);
  const address = builder.getSender();
  console.log(`Account address: ${address}`);

  /*
  smart account needs to have the ethers for paying gas and tokens for transfer.
  use transfer command from elvmastercli to transfer to smart account, requires fee collector and tranfer limit to be set.
   */
  /*

  Transaction hash: 0x3b0d293c8eae1f7dbe65f5ac8de0d358287ded9e76c893fbe0777f6f0cff3839
  View here: https://jiffyscan.xyz/userOpHash/0xaeaad6cbe1f6c90f8c152f1dc1f44f098e45fec785f684ce971cf67c4215bbd4

  Transaction hash: 0x9984e21f0a4e2b4e2cfd180898131683408e15c38262441fd3f17ce679510af1
  View here: https://jiffyscan.xyz/userOpHash/0xd79a4e1b038765e97e4bee8b7948cb08859721c0de80b8589528700af539694f
   */

  // Create the call data
  // acct2: 0xA2Fdbe18917D5bC44519360672dC1F5730e6fF10

  const to = "0xA2Fdbe18917D5bC44519360672dC1F5730e6fF10"; // Receiving address, in this case we will send it to ourselves
  const token = "0xfEb7196121Acfa126A85571E2B4481030f06c0Ab"; // Address of the ERC-20 token
  const value = "20"; // Amount of the ERC-20 token to transfer

  // Read the ERC-20 token contract
  const ERC20_ABI = require("./erc20AbiUpgradeable.json"); // ERC-20 ABI in json format
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const erc20 = new ethers.Contract(token, ERC20_ABI, provider);
  const decimals = await Promise.all([erc20.decimals()]);
  const amount = ethers.utils.parseUnits(value, decimals);

  // Encode the calls
  const callTo = [/*token,*/ token];
  const callData = [/*erc20.interface.encodeFunctionData("approve", [to, amount]),*/
                    erc20.interface.encodeFunctionData("transfer", [to, amount])]

  // Send the User Operation to the ERC-4337 mempool
  const client = await Client.init(rpcUrl);
  const res = await client.sendUserOperation(builder.executeBatch(callTo, callData), {
    onBuild: (op) => console.log("Signed UserOperation:", op),
  });

  // Return receipt
  console.log(`UserOpHash: ${res.userOpHash}`);
  console.log("Waiting for transaction...");
  const ev = await res.wait();
  console.log(`Transaction hash: ${ev?.transactionHash ?? null}`);
  console.log(`View here: https://jiffyscan.xyz/userOpHash/${res.userOpHash}`);

}

main2().catch((err) => console.error("Error:", err));