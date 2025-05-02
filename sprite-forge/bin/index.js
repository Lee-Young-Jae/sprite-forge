#!/usr/bin/env node
import { buildSprite } from "../src/buildSprite.js"; // ESM import

// 최소한의 옵션 파싱 (예: 콘솔 인자 2개: 입력, 출력)
const [input = "./icons", output = "./src/shared/ui/icon"] =
  process.argv.slice(2);

buildSprite({ input, output })
  .then(() => console.log("✔ Done"))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
