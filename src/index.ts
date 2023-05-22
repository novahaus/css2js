/// <reference types="node" />
import { readFile, writeFile } from "node:fs/promises";
import path from "path";
import { program } from "commander";
import { Buffer } from "node:buffer";
import { parse } from "./parser";

program
  .version("1.0.0")
  .description("A CLI form convert css to js")
  .parse(process.argv);

program.parse();
const [entriesFile, outputFile] = program.args;

async function getFileContent(pathFile: string): Promise<string | undefined> {
  try {
    const filePath = new URL(
      path.resolve(pathFile),
      import.meta.url
    );
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
  const file = writeFile(path.resolve(outputPath), output, {
    signal,
  });

  await file;
}

export async function main(entriesFile: string, outputFile: string) {
  try {
    const code = await getFileContent(entriesFile);
    if (!code) return;

    const parseContent = parse(code);
    await writeJsFile(JSON.stringify(parseContent), outputFile);
  } catch (err) {
    if (err instanceof Error) throw new Error(err.message);
  }
}

main(
  entriesFile,
  !!outputFile ? outputFile : entriesFile.replace(".css", ".js")
);
