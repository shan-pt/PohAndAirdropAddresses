import fetch from 'node-fetch';
import fs from 'fs'; // Import the file system module

async function fetchRequests(skip = 0, first = 500) { // Keep default batch size to 500
  const query = `
  query indexQuery($skip: Int = 0, $first: Int = 500) {
    submissions(
      orderBy: creationTime, 
      orderDirection: desc, 
      skip: $skip, 
      first: $first, 
      where: { 
        and: [
          { removed: false },       
          { registered: true }      
        ]
      }
    ) {
      id
      ...submissionCardSubmission
    }
  }

  fragment submissionCardSubmission on Submission {
    id
    status
    removed
    registered
    submissionTime
    name
    disputed
  }
  `;

  const variables = {
    skip: skip,
    first: first
  };

  const response = await fetch('https://api.studio.thegraph.com/query/61738/proof-of-humanity-mainnet/version/latest', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query, variables })
  });

  const result = await response.json();

  // Debugging: Log the result to see the response structure
  console.log("GraphQL Response:", JSON.stringify(result, null, 2));

  // Check for errors in the response
  if (result.errors) {
    throw new Error(result.errors.map(error => error.message).join(', '));
  }

  return result.data.submissions; // Access submissions directly
}

async function fetchAllRequests() {
  let allRequests = [];
  let skip = 0;
  const limit = 500; // Number of records to fetch per request
  const maxSkip = 5000; // Maximum skip limit

  while (true) {
    if (skip >= maxSkip) {
      console.log(`Reached maximum skip limit of ${maxSkip}, stopping fetch.`);
      break; // Stop fetching if skip limit is reached
    }

    const requests = await fetchRequests(skip, limit);
    
    if (!requests || requests.length === 0) {
      console.log('No more requests found, stopping pagination.');
      break; // Exit if no more requests
    }

    allRequests = allRequests.concat(requests); // Combine results
    console.log(`Fetched ${requests.length} requests, total: ${allRequests.length}`);
    
    skip += limit; // Move to the next page
  }

  return allRequests;
}

async function writeIdsToFiles(allRequests) {
  const allIds = allRequests.map(request => request.id); // Extract all IDs
  const batches = [];

  // Split allIds into batches of 500
  for (let i = 0; i < allIds.length; i += 500) {
    batches.push(allIds.slice(i, i + 500));
  }

  const files = batches.map((_, index) => `minnetAddresses_${index * 500}_${(index + 1) * 500}.txt`);

  for (let i = 0; i < files.length; i++) {
    fs.writeFile(files[i], batches[i].join('\n'), (err) => {
      if (err) {
        console.error(`Error writing to file ${files[i]}:`, err);
      } else {
        console.log(`Unique IDs saved to ${files[i]}`);
      }
    });
  }
}

fetchAllRequests()
  .then(allRequests => {
    writeIdsToFiles(allRequests);
  })
  .catch(error => {
    console.error('Error fetching data:', error);
  });
