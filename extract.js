import { ethers } from 'ethers'; // Use import statement for ethers v6
import axios from 'axios'; // Use import statement for axios
import fs from 'fs'; // Use import statement for fs


// Replace with your own GnosisScan API key
const API_KEY = '6CZ2C66UY5K1ZAMB1V8U8S5GFAUX2ZG1NW'; // Add your API key here
const CONTRACT_ADDRESS = '0xa4AC94C4fa65Bb352eFa30e3408e64F72aC857bc';

// Function to fetch transactions from the GnosisScan API
async function fetchTransactions() {
  try {
    // GnosisScan API URL
    const url = `https://api.gnosisscan.io/api?module=account&action=txlist&address=${CONTRACT_ADDRESS}&startblock=0&endblock=99999999&sort=asc&apikey=${API_KEY}`;
    
    // Fetch data
    const response = await axios.get(url);
    const data = response.data;

    if (data.status === '1') {
      return data.result; // Return list of transactions
    } else {
      console.error('Error fetching data:', data.message);
      return [];
    }
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

// Function to extract user addresses and save to a file
async function extractUserAddresses() {
  const transactions = await fetchTransactions();
  
  const userAddresses = new Set(); // Use a set to avoid duplicates

  // Iterate through each transaction
  transactions.forEach((tx) => {
    userAddresses.add(tx.from); // Add `from` address to the set
  });

  // Save to file
  fs.writeFileSync('addresses.txt', Array.from(userAddresses).join('\n'));

  console.log('Unique User Addresses saved to addresses.txt');
}

// Run the function to extract addresses
extractUserAddresses();
