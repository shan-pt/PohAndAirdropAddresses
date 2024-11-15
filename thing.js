import {writeFileSync} from 'fs';
const constructQuery = (lastId) => `{
  requests(
    where: {id_gt: "${String(lastId)}", resolutionTime_not: 0, type: "Registration"},
    orderBy: id,
    orderDirection: asc,
    first: 1000
  ) {
    requester
    id
  }
}
`

const sleep = async (ms) => new Promise(resolve => setTimeout(resolve, ms));

const allhumans = []
let lastId = ""
while (true) {
    console.log("Fetching batch...", allhumans.length, lastId)
    await sleep(100)
    const response = await fetch('https://api.studio.thegraph.com/query/61738/proof-of-humanity-mainnet/version/latest', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: constructQuery(lastId) })
    });

    const batch = (await response.json()).data.requests
    lastId = batch[batch.length - 1].id
    allhumans.push(...batch.map(request => request.requester))
    if (batch.length !== 1000) break
}

console.log(allhumans.length)
const dedupe = [...new Set(allhumans)]
console.log(dedupe.length) 
writeFileSync("humans.txt", dedupe.join("\n"))
