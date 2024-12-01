import { log } from 'console';
import { writeFileSync } from 'fs';

const constructQuery = (lastId) => `{
  requests( 
    where: {id_gt: "${String(lastId)}", status_in:["resolved"]}, 
    first: 1000,  
    orderBy: id, 
    orderDirection: asc
  ) {
    id
    requester
  }
}`;

const sleep = async (ms) => new Promise(resolve => setTimeout(resolve, ms));

const allhumans = [];
let lastId = "";

while (true) {
    console.log("Fetching batch...", allhumans.length, lastId);
    await sleep(100);
    const response = await fetch('https://api.studio.thegraph.com/query/64099/poh-origin-gnosis/v0.0.4', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: constructQuery(lastId) })
    });

    // Check if the response is OK
    if (!response.ok) {
        console.error(`HTTP error! Status: ${response.status}`);
        const errorMessage = await response.text(); // Read the error message
        console.error(errorMessage);
        break; // Exit the loop on error
    }

    const jsonResponse = await response.json();

    // Log the entire response for debugging
    console.log("Full Response:", JSON.stringify(jsonResponse, null, 2));

    // Check if data and requests are present
    const batch = jsonResponse.data?.requests;
    if (!batch || batch.length === 0) {
        console.log("No more data to fetch or batch is empty.");
        break;
    }

    console.log(batch);
    lastId = batch[batch.length - 1].id;
    allhumans.push(...batch.map(request => request.requester));
    
    // If the batch length is less than 1000, we are done
    if (batch.length !== 1000) break;
}

console.log(allhumans.length);
const dedupe = [...new Set(allhumans)];
console.log(dedupe.length);
writeFileSync("humans-v2-gnosis.txt", dedupe.join("\n"));
