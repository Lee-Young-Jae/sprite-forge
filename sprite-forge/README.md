# sprite-forge

```bash
npx sprite-forge ./icons ./src/shared/ui/icon
# → ./src/shared/ui/icon/sprite.svg + Svg.tsx 생성
```

## 옵션

- `input`: 입력 폴더 (기본값: `./icons`)
- `output`: 출력 폴더 (기본값: `./src/shared/ui/icon`)

## 출력

- `sprite.svg`: 스프라이트 이미지
- `SVG.tsx`: 스프라이트 이미지를 사용하는 React 컴포넌트

## Vite 프로젝트라면

Vite의 경우 생성된 sprite.svg 파일의 크기가 4kb 이하일 때 data URI로 인라인 처리되는데, 이를 비활성화하려면 다음과 같이 설정해야 합니다.

// vite.config.ts

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    assetsInlineLimit: 0, // ≤4kb 인라인 규칙 비활성화
  },
});
```
