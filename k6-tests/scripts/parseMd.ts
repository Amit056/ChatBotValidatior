import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve paths safely
const inputPath = path.resolve(__dirname, '../testCase/cpReport.md');
const outputPath = path.resolve(__dirname, '../data/queries.json');

// Read file
const fileContent: string = fs.readFileSync(inputPath, 'utf-8');

// Extract queries using regex
const matches = [...fileContent.matchAll(/query:\s*(.*)/gi)];

const queries: string[] = matches.map((m) => m[1].trim());

// Write JSON output
fs.writeFileSync(
  outputPath,
  JSON.stringify({ queries }, null, 2),
  'utf-8'
);

console.log('✅ Queries extracted');