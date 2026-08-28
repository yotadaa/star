import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const here = path.dirname(fileURLToPath(import.meta.url));
const input = path.join(here, "..", "sources", "origin", "01-synthwavedd-bel-scoop.png");
const output = path.join(here, "evidence-original-bel-post.jpg");

await sharp(input)
  .extract({ left: 0, top: 0, width: 1265, height: 500 })
  .jpeg({ quality: 92, chromaSubsampling: "4:4:4" })
  .toFile(output);

console.log(await sharp(output).metadata());
