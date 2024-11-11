#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const packageJson = require('./package.json'); // Load the package.json file

// Check for flags
const args = process.argv.slice(2);

if (args.includes('--version')) {
  console.log(`Version: ${packageJson.version}`);
  process.exit(0);
}

if (args.includes('--about')) {
  console.log(`Name: ${packageJson.name}`);
  console.log(`Version: ${packageJson.version}`);
  console.log(`Author: ${packageJson.author}`);
  console.log(`License: ${packageJson.license}`);
  process.exit(0);
}

if (args.includes('--help')) {
  console.log(`
Usage: remove-console-logs [options]

Options:
  --version          Show the current version of the package.
  --about            Display information about the package (name, version, author, license).
  --help             Display this help message.
  --no-save          Preview changes without saving.
  --target=<target>  Specify which console statement to remove (default is "log").
                     Examples: --target=log, --target=error, --target=warn, --target=all.
  --verbose          Display detailed output of files modified and console statements removed.
  `);
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
  let removedStatements = 0;

  lines.forEach(line => {
    const trimmedLine = line.trim();
    if (regex.test(trimmedLine)) {
      removedStatements++;
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

  return {
    modifiedContent: result
      .join('\n')
      .replace(/\.catch\(\s*\(\s*error\s*\)\s*=>\s*\)/g, '.catch((error) => { })'),
    removedStatements,
  };
}

function processFile(filePath, regex, saveChanges, verbose) {
  const fileContent = fs.readFileSync(filePath, 'utf8');

  if (!fileContent.includes('console.')) {
    return { modified: false, removedStatements: 0 };
  }

  const { modifiedContent, removedStatements } = safelyRemoveConsoleStatements(fileContent, regex);

  if (fileContent !== modifiedContent) {
    if (saveChanges) {
      fs.writeFileSync(filePath, modifiedContent);
    }
    if (verbose) {
      console.log(`File: ${filePath}, Consoles Removed: ${removedStatements}`);
    }
    return { modified: true, removedStatements };
  }

  return { modified: false, removedStatements: 0 };
}

function traverseDirectory(dir, regex, saveChanges, verbose) {
  const files = fs.readdirSync(dir);
  let totalFilesModified = 0;
  let totalStatementsRemoved = 0;
  const verboseData = [];

  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!isExcludedDir(fullPath)) {
        const { filesModified, statementsRemoved, data } = traverseDirectory(fullPath, regex, saveChanges, verbose);
        totalFilesModified += filesModified;
        totalStatementsRemoved += statementsRemoved;
        verboseData.push(...data);
      }
    } else if (fileExtensions.includes(path.extname(fullPath))) {
      const { modified, removedStatements } = processFile(fullPath, regex, saveChanges, verbose);
      if (modified) {
        totalFilesModified++;
        totalStatementsRemoved += removedStatements;
        if (verbose) {
          verboseData.push({ filePath: fullPath, removedStatements });
        }
      }
    }
  });

  return { filesModified: totalFilesModified, statementsRemoved: totalStatementsRemoved, data: verboseData };
}

const saveChanges = !args.includes('--no-save');
const verbose = args.includes('--verbose');
let target = 'log';

const targetArgIndex = args.findIndex(arg => arg.startsWith('--target='));
if (targetArgIndex !== -1) {
  target = args[targetArgIndex].split('=')[1];
}

const regex = buildRegex(target === 'all' ? 'all' : target);
const startDir = process.cwd();

const { filesModified, statementsRemoved, data } = traverseDirectory(startDir, regex, saveChanges, verbose);

if (verbose && data.length > 0) {
  console.log(`\nSummary:\n`);
  console.log(`Sr.\tFilepath\t\t\tNumber of Consoles`);
  data.forEach((entry, index) => {
    console.log(`${index + 1}\t${entry.filePath}\t${entry.removedStatements}`);
  });
}

console.log(`\nOperation completed. ${statementsRemoved} console statements were removed from ${filesModified} files.`);
