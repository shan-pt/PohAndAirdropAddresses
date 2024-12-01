import { readFileSync, writeFileSync } from 'fs';

// Read both files and ensure clean data
const oldAddresses = [...new Set(readFileSync('human-mainnet-old.txt', 'utf8').split('\n').filter(Boolean))];
const newAddresses = [...new Set(readFileSync('poh-addresses-mainnet-v2.txt', 'utf8').split('\n').filter(Boolean))];

// Find differences
const oldSet = new Set(oldAddresses);
const newSet = new Set(newAddresses);

const onlyInOld = [...oldSet].filter(address => !newSet.has(address));
const onlyInNew = [...newSet].filter(address => !oldSet.has(address));

// Save results with clear labeling
const output = [
    `=== Addresses only in old file (${onlyInOld.length}) ===`,
    ...onlyInOld,
    `\n=== Addresses only in new file (${onlyInNew.length}) ===`,
    ...onlyInNew
].join('\n');

writeFileSync('address-differences.txt', output);

console.log('Total addresses in old file:', oldAddresses.length);
console.log('Total addresses in new file:', newAddresses.length);
console.log('Difference found:', Math.abs(oldAddresses.length - newAddresses.length));
console.log('Unique to old file:', onlyInOld.length);
console.log('Unique to new file:', onlyInNew.length);
