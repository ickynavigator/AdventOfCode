import fs from "node:fs/promises";
import path from "node:path";

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const inputPath = path.resolve(__dirname, "input.txt");
const input = await fs.readFile(inputPath, { encoding: "utf8" });

/**
--- Part One ---
**/
function PartOne(input: string) {}
PartOne(input);

/**
--- Part Two ---
**/
function PartTwo(input: string) {}
PartTwo(input);
