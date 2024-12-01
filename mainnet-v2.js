import {writeFileSync} from 'fs';

const constructQuery = (lastId) => `{
  requests(
    first: 1000,
    orderBy: id,
    orderDirection: asc,
    where: {
      id_gt: "${String(lastId)}",
      status: "resolved",
      revocation: false
    }
  ) {
    requester
    id
  }
}`;

const sleep = async (ms) => new Promise(resolve => setTimeout(resolve, ms));

const allhumans = []
let lastId = ""
while (true) {
    console.log("Fetching batch...", allhumans.length, lastId)
    await sleep(100)
    const response = await fetch('https://gateway.thegraph.com/api/d5c7982a40f63da9504805d11919004d/subgraphs/id/8oHw9qNXdeCT2Dt4QPZK9qHZNAhPWNVrCKnFDarYEJF5', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: constructQuery(lastId) })
    });

    const jsonResponse = await response.json();
    const batch = jsonResponse.data?.requests;
    
    if (!batch || batch.length === 0) {
        console.log("No more data to fetch.");
        break;
    }

    lastId = batch[batch.length - 1].id;
    allhumans.push(...batch.map(request => request.requester));
    
    if (batch.length < 1000) break;
}

const dedupe = [...new Set(allhumans)];
console.log("Total addresses:", dedupe.length);
writeFileSync("poh-addresses-mainnet-v2.txt", dedupe.join("\n"));
