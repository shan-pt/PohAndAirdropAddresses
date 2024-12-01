import Web3 from "web3";
import {writeFileSync} from 'fs';
// Set up Web3 with the Gnosis Chain RPC URL
const web3 = new Web3("https://rpc.gnosischain.com");

import data from "./humans-gnosis_airdrop_claim.json" with { type: "json" };

// Define the contract ABI and addresses
const contractAddresses = {
  market1: [
    "0x6b8c2ae8DBa895620475259e95377FDe08FBF02a",
    "0x68984a7D283fF918e530368E6AAaD1fC2af88692",
  ],
  market2: [
    "0xCFA9DE128850CA2f6CA8b7AB962cEA9900b2Bc4C",
    "0x398806edC8b3F7D38bDd3b51F62FE69d5A5c3366",
  ],
  market3: [
    "0x4bB4eb73f8B8c5Fd9A3c5357cb812A2E7502e3B9",
    "0xF0138D15be0D339A5faf423ea44C225B32B871E1",
    "0x4558966e5eD3dD88Da455601c86c90e1399a96e2",
    "0x7Ad7122f4511b11e625C4D7d4366b6FC1BDce366",
  ],
  market4: [
    "0x06c48691e4a34f114AaAcdD508A3FB7cf26d33aA",
    "0x394eB1d67A544cfF7E75f61dF9d6210DBA0C3bFa",
  ],
  market5: [
    "0x8F2df6B567C9770D0C70b56B92BD6e4C06ec58cE",
    "0x7A0f174DAeB30b4a424C1FE49e21FED17259fab0",
  ],
  market6: [
    "0x8e4c786ff3C9960bd389B6Ab6F7042d9f6a17433",
    "0x83785a4825b9236225A63322AE3aD63e0346D54B",
    "0xf487E5978277EAc1B25a707ab26d1292a963DD27",
  ],
  market7: [
    "0xd75041dc327bdf4A5eEde3be919F6842C5Df5e20",
    "0x84A078629C590A6AE20fDeEE5a44CA19A01FA3E3",
  ],
  market8: [
    "0x80cFa427a022d735C74c407F6A1d546F8280Be26",
    "0x83717Dcf8F5C64E135e87446EB515fA70185f2D9",
  ],
};
const contractABI = [
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "owner", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "spender", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "from", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "to", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }
    ],
    "name": "Transfer",
    "type": "event"
  }
];

// Load user addresses from airdropCheck.json
const userAddresses = data;

// Define the start date
const startDate = new Date("2024-11-01T00:00:00Z"); // UTC date for Lisbon time
let fromBlock;

async function getBlockForDate(targetDate) {
  const latestBlock = await web3.eth.getBlock("latest");
  const avgBlockTime = BigInt(5); // Average block time in seconds, converted to BigInt
  const timeDiff = BigInt(Math.floor((Date.now() - targetDate.getTime()) / 1000)); // Convert to seconds and then to BigInt
  const blockDiff = timeDiff / avgBlockTime; // Now `blockDiff` is also BigInt

  return latestBlock.number - blockDiff; // No more type mismatch
}

// Main function to check activity and return results as JSON
async function checkActivity() {
  const finalResults = []; // Array to store results for each user address

  try {
    // Estimate starting block for November 1, 2024
    fromBlock = await getBlockForDate(startDate);

    // Iterate over each user address
    for (const userAddress of userAddresses) {
      const userResult = { [userAddress]: {} }; // Initialize results for current user

      // Check each market for the current user address
      for (const [market, addresses] of Object.entries(contractAddresses)) {
        let marketActivity = false; // Default to no activity for this market

        // Check each contract address in the current market
        for (const contractAddress of addresses) {
          const contract = new web3.eth.Contract(contractABI, contractAddress);

          // Check for Transfer events
          const transferEvents = await contract.getPastEvents("Transfer", {
            filter: { from: userAddress, to: userAddress },
            fromBlock: fromBlock,
            toBlock: "latest"
          });

          // Check for Approval events
          const approvalEvents = await contract.getPastEvents("Approval", {
            filter: { owner: userAddress },
            fromBlock: fromBlock,
            toBlock: "latest"
          });

          // If any events are found, set marketActivity to true and break
          if (transferEvents.length > 0 || approvalEvents.length > 0) {
            marketActivity = true;
            break; // Exit loop as we only need one positive match
          }
        }

        // Add the market result (true or false) for the user
        userResult[userAddress][market] = marketActivity;
      }

      // Add user result to final results array
      finalResults.push(userResult);
    }
    const dedupe = [...new Set(finalResults)];
    
    // Write claimed addresses to a JSON file
    writeFileSync("checkTokenActive.json", JSON.stringify(dedupe, null, 2));
    console.log("Addresses that have claimed the airdrop:", dedupe);
   

  } catch (error) {
    console.error("Error checking activity:", error);
  }
}

// Run the function
checkActivity();