#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const packageJson = require('./package.json'); // Load the package.json file

// Check for the --version flag
const args = process.argv.slice(2);
if (args.includes('--version')) {
  console.log(`remove-console-logs version ${packageJson.version}`);
  process.exit(0);
}

// Directories to exclude
const excludeDirs = [
  'node_modules',
  'dist',
  '.next',
  '.git',
  'build',
  '.nuxt',
  'public/build',
  'out',
  '.vercel',
  '.output',
  '.svelte-kit'
];

const fileExtensions = ['.js', '.ts', '.jsx', '.tsx', '.mjs'];

function isExcludedDir(filePath) {
  return excludeDirs.some(dir => filePath.includes(dir));
}

function buildRegex(target) {
  return target === 'all'
    ? /\bconsole\.\w+\s*\([^)]*\)\s*;?/g
    : new RegExp(`\\bconsole\\.${target}\\s*\\([^)]*\\);?`, 'g');
}

function safelyRemoveConsoleStatements(fileContent, regex) {
  const lines = fileContent.split('\n');
  const result = [];
  let preserveComma = false;

  lines.forEach(line => {
    const trimmedLine = line.trim();
    if (regex.test(trimmedLine)) {
      if (trimmedLine.startsWith('console')) {
        if (trimmedLine.includes('.catch(')) {
          result.push(trimmedLine.replace(regex, '{ /* handle error */ }'));
        }
        preserveComma = trimmedLine.endsWith(',');
        return;
      }

      const modifiedLine = line.replace(regex, '').trim();
      if (modifiedLine) {
        if (preserveComma && modifiedLine.endsWith('}')) {
          result.push(modifiedLine.replace(/}$/, '},'));
          preserveComma = false;
        } else {
          result.push(modifiedLine);
        }
      }
    } else {
      result.push(line);
    }
  });

  return result
    .join('\n')
    .replace(/\.catch\(\s*\(\s*error\s*\)\s*=>\s*\)/g, '.catch((error) => { console.log(error); })');
}

function processFile(filePath, regex, saveChanges) {
  const fileContent = fs.readFileSync(filePath, 'utf8');

  if (!fileContent.includes('console.')) {
    return;
  }

  const modifiedContent = safelyRemoveConsoleStatements(fileContent, regex);

  if (fileContent !== modifiedContent) {
    if (saveChanges) {
      fs.writeFileSync(filePath, modifiedContent);
      console.log(`Modified and saved: ${filePath}`);
    } else {
      console.log(`Would modify: ${filePath}`);
    }
  }
}

function traverseDirectory(dir, regex, saveChanges) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!isExcludedDir(fullPath)) {
        traverseDirectory(fullPath, regex, saveChanges);
      }
    } else if (fileExtensions.includes(path.extname(fullPath))) {
      processFile(fullPath, regex, saveChanges);
    }
  });
}

const saveChanges = !args.includes('--no-save');
let target = 'log';

const targetArgIndex = args.findIndex(arg => arg.startsWith('--target='));
if (targetArgIndex !== -1) {
  target = args[targetArgIndex].split('=')[1];
}

const regex = buildRegex(target === 'all' ? 'all' : target);
const startDir = process.cwd();

traverseDirectory(startDir, regex, saveChanges);
console.log(`Search and replace completed. Target: ${target}, Save changes: ${saveChanges}`);
