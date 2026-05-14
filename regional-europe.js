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
"SCRAPING EUROPE 😭🔥"
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

console.log(
`429 😭 ${country} ${type}`
);

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

previousRank:

track.chartEntryData
?.previousRank,

peakRank:

track.chartEntryData
?.peakRank,

appearances:

track.chartEntryData
?.appearancesOnChart,

streams:

track.chartEntryData
?.rankingMetric
?.value,

track:

track.trackMetadata
?.trackName,

artists:

artists.map(
a => a.name
),

image:

track.trackMetadata
?.displayImageUri

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

console.log(
"UPDATED regional-europe.json 😍"
);

}

async function start() {

const token =
await getToken();

const latest =
await getLatestDates(
token
);

let savedDates =
null;

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

const firstRun =

!savedDates

||

!fs.existsSync(
"regional-europe.json"
);


if (

firstRun

) {

console.log(
"FIRST RUN 😍"
);

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

return;

}

const changed =

latest.daily !==
savedDates.daily

||

latest.weekly !==
savedDates.weekly;

if (

changed

) {

console.log(
"NEW CHART 😍"
);

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

}

else {

console.log(
"SAME CHART 😴"
);

}

}

start();
