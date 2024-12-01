import { readFileSync, writeFileSync } from 'fs';

// Function to read and parse a file into an array of addresses
const readAddressesFromFile = (filename) => {
    const data = readFileSync(filename, 'utf-8');
    return data.split('\n').filter(line => line.trim() !== ''); // Split by new lines and filter empty lines
};

// Read addresses from both files
const addressesV1 = readAddressesFromFile('poh-addresses-mainnet-v2.txt');
const addressesV2 = readAddressesFromFile('human-mainnet-old.txt');

// Create sets for easier comparison
const setV1 = new Set(addressesV1);
const setV2 = new Set(addressesV2);

// Find addresses unique to each set
const uniqueToV1 = [...setV1].filter(address => !setV2.has(address));
const uniqueToV2 = [...setV2].filter(address => !setV1.has(address));

// Combine unique addresses from both files
const uniqueAddresses = uniqueToV1.concat(uniqueToV2);

// Log or write the unique addresses to a new file
console.log("Unique Addresses:", uniqueAddresses);
writeFileSync('unique-addresses.txt', uniqueAddresses.join('\n'));
