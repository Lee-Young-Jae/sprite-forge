// src/buildSprite.js  (pure ESM)
import fs from "node:fs";
import path from "node:path";

/** SVG 폴더 → sprite.svg + Svg.tsx 생성 */
export function buildSprite({
  input = "./icons",
  output = "./src/shared/ui/icon",
} = {}) {
  const ICON_DIR = path.resolve(input);
  const OUT_DIR = path.resolve(output);
  const SPRITE_SVG = path.join(OUT_DIR, "sprite.svg");
  const ICON_TSX = path.join(OUT_DIR, "SVG.tsx");

  // 1) SVG 경로 수집
  function collectSvgs(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    let svgs = [];
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        svgs = svgs.concat(collectSvgs(fullPath));
      } else if (entry.isFile() && /\.svg$/i.test(entry.name)) {
        svgs.push(fullPath);
      }
    }
    return svgs;
  }

  // 2) viewBox·inner 추출
  function parseSvg(content) {
    const viewBoxMatch = content.match(/<svg[^>]*viewBox=\"([^\"]+)\"[^>]*>/);
    const viewBox = viewBoxMatch ? viewBoxMatch[1] : "0 0 24 24";
    const inner = content
      .replace(/<\?xml[^>]*>\s*/g, "")
      .replace(/<!DOCTYPE[^>]*>\s*/g, "")
      .replace(/<svg[^>]*>/, "")
      .replace(/<\/svg>/, "")
      .trim();
    return { viewBox, inner };
  }

  // 3) 심볼 생성
  const files = collectSvgs(ICON_DIR);
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const symbols = files
    .map((file) => {
      const name = path.basename(file, ".svg");
      const raw = fs.readFileSync(file, "utf-8");
      const { viewBox, inner } = parseSvg(raw);
      return `<symbol id="${name}" viewBox="${viewBox}">${inner}</symbol>`;
    })
    .join("\n");

  // 4) sprite.svg
  const spriteSvg = `<svg xmlns="http://www.w3.org/2000/svg"
       xmlns:xlink="http://www.w3.org/1999/xlink" style="display:none">\n${symbols}\n</svg>`;
  fs.writeFileSync(SPRITE_SVG, spriteSvg, "utf-8");

  // 5) Svg.tsx
  const iconUnion = files
    .map((f) => `'${path.basename(f, ".svg")}'`)
    .join(" | ");
  const tsx = `import React from 'react';
import spriteUrl from './sprite.svg';

export type IconName = ${iconUnion};
export const SVG: React.FC<React.SVGProps<SVGSVGElement> & { name: IconName }> =
 ({ name, ...rest }) => (
   <svg {...rest} xmlnsXlink="http://www.w3.org/1999/xlink"
        xmlns="http://www.w3.org/2000/svg">
     <use href={\`\${spriteUrl}#\${name}\`} xlinkHref={\`\${spriteUrl}#\${name}\`} />
   </svg>
 );`;
  fs.writeFileSync(ICON_TSX, tsx, "utf-8");

  console.log(`[sprite.svg]·[SVG.tsx] → ${OUT_DIR}`);
  return {
    spritePath: SPRITE_SVG,
    componentPath: ICON_TSX,
    icons: files.length,
  };
}
