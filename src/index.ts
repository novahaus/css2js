/// <reference types="node" />
import { readFile, writeFile } from "node:fs/promises";
import { Buffer } from "node:buffer";
import { parse } from "./parser";

async function getFileContent(path: string): Promise<string | undefined> {
  try {
    const filePath = new URL(path, import.meta.url);
    const contents = await readFile(filePath, { encoding: "utf8" });

    return contents;
  } catch (err) {
    if (err instanceof Error) throw new Error(err.message);
  }
}

async function writeJsFile(content: string, outputPath: string): Promise<void> {
  const controller = new AbortController();
  const { signal } = controller;

  const output = new Uint8Array(Buffer.from(`module.exports=${content}`));
  const file = writeFile(outputPath, output, { signal });

  await file;
}

async function main(entriesFile: string, outputFile: string) {
  try {
    const code = await getFileContent(entriesFile);
    if (!code) return;

    const parseContent = parse(code);
    await writeJsFile(JSON.stringify(parseContent), outputFile);
  } catch (err) {
    if (err instanceof Error) throw new Error(err.message);
  }
}

export default main;
