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

    try {

      const data = JSON.parse(
        fs.readFileSync(file, "utf8")
      );

      if (Array.isArray(data)) {
        merged.push(...data);
      }

    }

    catch (err) {

      console.log(
        `Failed ${file} 😭`
      );

    }

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
