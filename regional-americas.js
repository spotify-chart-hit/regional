const fs = require("fs");
const getToken = require("./auto-token");

const sleep = ms =>
new Promise(resolve =>
setTimeout(resolve, ms)
);

const countries = [
"GLOBAL",
"AR","BO","BR","CA","CL","CO","CR","DO","EC","SV","GT","HN","MX","NI","PA","PY","PE","UY","US","VE"
];

async function getLatestDates(token){

let daily;
let weekly;

while(true){

daily =
await fetch(
"https://charts-spotify-com-service.spotify.com/auth/v0/charts/regional-global-daily/latest",
{
headers:{
Authorization: token
}
}
);

weekly =
await fetch(
"https://charts-spotify-com-service.spotify.com/auth/v0/charts/regional-global-weekly/latest",
{
headers:{
Authorization: token
}
}
);

if(
daily.status===429
||
weekly.status===429
){

console.log(
"429 latestDate 😭"
);

await sleep(8000);

continue;

}

break;

}

const dailyJson =
await daily.json();

const weeklyJson =
await weekly.json();

return{

daily:

dailyJson
?.displayChart
?.chartMetadata
?.dimensions
?.latestDate

||

dailyJson
?.displayChart
?.date,

weekly:

weeklyJson
?.displayChart
?.chartMetadata
?.dimensions
?.latestDate

||

weeklyJson
?.displayChart
?.date

};

}

async function scrape(token){

console.log(
"SCRAPING AMERICAS 😭🔥"
);

let results=[];

for(
const country
of countries
){

for(
const type
of ["weekly","daily"]
){

try{

const url =
`https://charts-spotify-com-service.spotify.com/auth/v0/charts/regional-${country.toLowerCase()}-${type}/latest`;

console.log(
`CHECKING ${country} ${type}`
);

let response =
await fetch(
url,
{
headers:{
Authorization: token,
Accept:"application/json"
}
}
);

while(
response.status===429
){

console.log(
`429 😭 ${country} ${type}`
);

await sleep(8000);

response =
await fetch(
url,
{
headers:{
Authorization: token,
Accept:"application/json"
}
}
);

}

if(
response.status!==200
){
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

for(
const track
of tracks
){

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

if(hasJimin){

const currentRank =
track.chartEntryData
?.currentRank;

const previousRank =
track.chartEntryData
?.previousRank;

const rankChange =
previousRank
? Math.abs(
currentRank -
previousRank
)
: 0;

let direction = "=";


if(
currentRank <
previousRank
){

direction =
"up";

}

else if(
currentRank >
previousRank
){

direction =
"down";

}

results.push({

country,
type,

rank:
currentRank,

previousRank:
previousRank,

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
?.displayImageUri,

rankChange,
direction,

entryStatus:
track.chartEntryData
?.entryStatus

});

console.log(
`FOUND 😭🔥 ${country} ${track.trackMetadata?.trackName}`
);

}

}

await sleep(800);

}

catch(err){

console.log(
err.message
);

}

}

}

fs.writeFileSync(
"regional-americas.json",
JSON.stringify(
results,
null,
2
)
);

console.log(
"UPDATED regional-americas.json 😍"
);

}

async function start(){

const token =
await getToken();

let savedDates =
null;

if(
fs.existsSync(
"chart-dates-americas.json"
)
){

savedDates =
JSON.parse(
fs.readFileSync(
"chart-dates-americas.json"
)
);

}

const latest =
await getLatestDates(
token
);

const firstRun =
!savedDates
||
!fs.existsSync(
"regional-americas.json"
);

if(firstRun){

console.log(
"FIRST RUN 😍"
);

await scrape(
token
);

fs.writeFileSync(
"chart-dates-americas.json",
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

if(changed){

console.log(
"NEW CHART 😍"
);

await scrape(
token
);

fs.writeFileSync(
"chart-dates-americas.json",
JSON.stringify(
latest,
null,
2
)
);

}

else{

console.log(
"SAME CHART 😴"
);

}

}

start();
