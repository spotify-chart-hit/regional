const fs =
require("fs");

const getToken =
require("./auto-token");

const sleep = ms =>
new Promise(
resolve =>
setTimeout(resolve, ms)
);

const countries = [

"GB","FR","DE","IT","ES",
"PT","NL","BE","CH","AT",
"SE","NO","DK","FI","PL",
"RO","CZ","HU","SK","UA",
"LT","LV","LU","IS","GR"

];

async function getLatestDates(
token
) {

const daily =
await fetch(

"https://charts-spotify-com-service.spotify.com/auth/v0/charts/regional-global-daily/latest",

{

headers: {

Authorization:
token

}

}

);

const weekly =
await fetch(

"https://charts-spotify-com-service.spotify.com/auth/v0/charts/regional-global-weekly/latest",

{

headers: {

Authorization:
token

}

}

);

const dailyJson =
await daily.json();

const weeklyJson =
await weekly.json();

return {

daily:
dailyJson.latestDate,

weekly:
weeklyJson.latestDate

};

}

async function scrape(
token
) {

console.log(
"\nSCRAPING EUROPE 😭🔥\n"
);

let results = [];

for (

const country
of countries

) {

for (

const type
of ["weekly","daily"]

) {

try {

const url =

`https://charts-spotify-com-service.spotify.com/auth/v0/charts/regional-${country.toLowerCase()}-${type}/latest`;

console.log(
`CHECKING ${country} ${type}`
);

let response =
await fetch(

url,

{

headers: {

Authorization:
token,

Accept:
"application/json"

}

}

);

while (

response.status ===
429

) {

await sleep(
8000
);

response =
await fetch(

url,

{

headers: {

Authorization:
token,

Accept:
"application/json"

}

}

);

}

if (

response.status !==
200

) {

continue;

}

const data =
await response.json();

const tracks =

data.entries
||

data.chartEntryViewResponses
||

[];

for (

const track
of tracks

) {

const artists =

track.trackMetadata
?.artists
||

[];

const hasJimin =

artists.some(

artist =>

artist.name
?.toLowerCase()

===
"jimin"

);

if (

hasJimin

) {

results.push({

country,
type,

rank:

track.chartEntryData
?.currentRank,

track:

track.trackMetadata
?.trackName,

artists:

artists.map(
a => a.name
)

});

console.log(

`FOUND 😭🔥 ${country} ${track.trackMetadata?.trackName}`

);

}

}

await sleep(
800
);

}

catch (

err

) {

console.log(
err.message
);

}

}

}

fs.writeFileSync(

"regional-europe.json",

JSON.stringify(
results,
null,
2
)

);

}

async function start() {

const token =
await getToken();

let savedDates = {};

if (

fs.existsSync(
"chart-dates-europe.json"
)

) {

savedDates =
JSON.parse(

fs.readFileSync(
"chart-dates-europe.json"
)

);

}

const latest =
await getLatestDates(
token
);

const firstRun =

!savedDates.daily
||

!savedDates.weekly;

if (

firstRun

) {

await scrape(
token
);

fs.writeFileSync(

"chart-dates-europe.json",

JSON.stringify(
latest,
null,
2
)

);

savedDates =
latest;

}

while (true) {

const current =
await getLatestDates(
token
);

const changed =

current.daily !==
savedDates.daily

||

current.weekly !==
savedDates.weekly;

if (

changed

) {

await scrape(
token
);

fs.writeFileSync(

"chart-dates-europe.json",

JSON.stringify(
current,
null,
2
)

);

savedDates =
current;

}

await sleep(
5 * 60 * 1000
);

}

}

start();

