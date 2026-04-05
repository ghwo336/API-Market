import * as fs from "fs";
import * as path from "path";

const artifactPath = path.resolve(
  __dirname,
  "../artifacts/contracts/ApiMarketEscrow.sol/ApiMarketEscrow.json"
);

const outputPath = path.resolve(
  __dirname,
  "../../shared/src/abi/ApiMarketEscrow.json"
);

const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf-8"));
fs.writeFileSync(outputPath, JSON.stringify(artifact.abi, null, 2));
console.log(`ABI copied to ${outputPath}`);
