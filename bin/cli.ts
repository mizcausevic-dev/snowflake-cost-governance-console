#!/usr/bin/env node
import { loadConsole, renderMarkdown } from "../src/index.js";

const [, , inputPath, formatFlag, format] = process.argv;

if (!inputPath) {
  console.error("Usage: snowflake-cost-governance-console <input.json> [--format markdown|json]");
  process.exit(1);
}

const costConsole = await loadConsole(inputPath);
console.log(formatFlag === "--format" && format === "json" ? JSON.stringify(costConsole, null, 2) : renderMarkdown(costConsole));
