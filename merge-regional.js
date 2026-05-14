const fs = require("fs");

const files = [
  "regional-americas.json",
  "regional-europe.json",
  "regional-asia.json",
  "regional-mea.json"
];

let merged = [];

for (const file of files) {

  if (fs.existsSync(file)) {

    const data = JSON.parse(
      fs.readFileSync(file, "utf8")
    );

    merged.push(...data);
  }
}

merged.sort((a, b) => {

  if (a.country < b.country) return -1;
  if (a.country > b.country) return 1;
  return 0;

});

fs.writeFileSync(
  "regional.json",
  JSON.stringify(merged, null, 2)
);

console.log(
  "regional.json updated 😍"
);
