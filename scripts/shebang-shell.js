import { readFile, writeFile } from "node:fs/promises";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

export async function main() {
  const mainPath = path.resolve(__dirname, `../dist/main.cjs`);

  const filePath = new URL(
    path.resolve(__dirname, mainPath),
    import.meta.url
  );

  const content = await readFile(filePath, { encoding: "utf8" });

  const controller = new AbortController();
  const { signal } = controller;

  const shebang = '#!/usr/bin/env node';
  const hasShebang = content.includes(shebang);
  const contentReplaced = content.replace(/#!\/usr\/bin\/env node/g, '');
  const output = new Uint8Array(Buffer.from(`${shebang} ${!hasShebang ? "\n" : ""}${contentReplaced}`));
  const file = writeFile(path.resolve(__dirname, mainPath), output, {
    signal,
  });

  await file;
}

main()