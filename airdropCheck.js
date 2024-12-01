import Web3 from 'web3';
import {writeFileSync} from 'fs';
import data from './humans-gnosis.json' with { type: "json" };
// Connect to the Gnosis Chain or Ethereum RPC URL (replace with actual RPC URL)
const rpcUrl = 'https://rpc.gnosischain.com'; // Replace with Gnosis Chain RPC
const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));

// Define the contract address and ABIz
const contractAddress = "0x28ABd3190674Dc57e4d3bEbeEC22f78d121810d5";
const contractABI = [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "claimed",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "allTokens",
      "outputs": [
          {
              "internalType": "contract ERC20[]",
              "name": "",
              "type": "address[]"
          }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "anonymous": false,
      "inputs": [
          { "indexed": true, "internalType": "address", "name": "claimant", "type": "address" },
          { "indexed": false, "internalType": "address[]", "name": "tokens", "type": "address[]" },
          { "indexed": false, "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }
      ],
      "name": "AirdropClaimed",
      "type": "event"
    }
];

const addresses = data;
const contract = new web3.eth.Contract(contractABI, contractAddress);

async function checkClaims() {
    const claimedAddresses = [];

    for (let address of addresses) {
        try {
            const hasClaimed = await contract.methods.claimed(address).call();
            if (hasClaimed) {
                claimedAddresses.push(address);
                console.log(address);
                
            }
        } catch (error) {
            console.error(`Error checking claim for address ${address}:`, error);
        }
    }

    const dedupe = [...new Set(claimedAddresses)];
    
    // Write claimed addresses to a JSON file
    writeFileSync("airdropCheck.json", JSON.stringify(dedupe, null, 2));
    console.log("Addresses that have claimed the airdrop:", dedupe);
}

async function logAllTokens() {
  try {
      const tokens = await contract.methods.allTokens().call();
      console.log("List of tokens to be given:", tokens);
  } catch (error) {
      console.error("Error retrieving tokens:", error);
  }
}

async function listenForClaims() {
  console.log("Listening for airdrop claims...");

  try {
      // Check if the `AirdropClaimed` event is accessible
      if (contract.events && contract.events.AirdropClaimed) {
          contract.events.AirdropClaimed()
              .on("data", (event) => {
                  const { claimant, tokens, amounts } = event.returnValues;

                  // Log the claim details
                  console.log(`Airdrop claimed by ${claimant}`);
                  console.log("Tokens:", tokens);
                  console.log("Amounts:", amounts);

                  // Optionally, save each claim to a file in JSON format
                  const logEntry = {
                      claimant,
                      tokens,
                      amounts
                  };
                  appendFileSync("airdropClaimsLog.json", JSON.stringify(logEntry, null, 2) + ",\n");
              })
              .on("error", (error) => {
                  console.error("Error listening for AirdropClaimed events:", error);
              });
      } else {
          console.error("The AirdropClaimed event is not available on this contract.");
      }
  } catch (error) {
      console.error("An error occurred while setting up the event listener:", error);
  }
}


// Run the listener
listenForClaims();
checkClaims();
logAllTokens();
