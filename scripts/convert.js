#!/usr/bin/env node

/**
 * Script to convert between CommonJS and ESM module formats
 * This helps keep the codebase DRY by maintaining only one source format
 * and automatically generating the other format.
 */

const fs = require('fs');
const path = require('path');

// Check if the correct number of arguments is provided
if (process.argv.length < 4) {
  console.error('Usage: node convert.js <source-file> <target-file>');
  console.error('Example: node convert.js lib/base.js lib/base.mjs');
  process.exit(1);
}

const sourceFile = process.argv[2];
const targetFile = process.argv[3];

// Determine the conversion direction based on file extensions
const sourceExt = path.extname(sourceFile);
const targetExt = path.extname(targetFile);

const isCjsToEsm = sourceExt === '.js' && targetExt === '.mjs';
const isEsmToCjs = sourceExt === '.mjs' && targetExt === '.js';

if (!isCjsToEsm && !isEsmToCjs) {
  console.error('Conversion must be between .js and .mjs files');
  process.exit(1);
}

// Read the source file
try {
  const sourceCode = fs.readFileSync(sourceFile, 'utf8');
  let targetCode;

  if (isCjsToEsm) {
    // Convert CommonJS to ESM
    targetCode = convertCjsToEsm(sourceCode);
  } else {
    // Convert ESM to CommonJS
    targetCode = convertEsmToCjs(sourceCode);
  }

  // Create directory if it doesn't exist
  const targetDir = path.dirname(targetFile);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Write the converted code to the target file
  fs.writeFileSync(targetFile, targetCode);
  console.log(`Successfully converted ${sourceFile} to ${targetFile}`);
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}

/**
 * Convert CommonJS code to ESM
 * @param {string} code - The source code in CommonJS format
 * @returns {string} - The converted code in ESM format
 */
function convertCjsToEsm(code) {
  // Replace require statements with import statements
  let result = code.replace(/const\s+(\w+)\s+=\s+require\(['"]([^'"]+)['"]\);/g, 'import $1 from \'$2\';');

  // Replace destructured require statements with import statements
  result = result.replace(/const\s+\{\s*([^}]+)\s*\}\s+=\s+require\(['"]([^'"]+)['"]\);/g, (match, imports, module) => {
    // Handle multi-line destructured imports
    const importList = imports.split(',').map(i => i.trim()).join(', ');
    return `import { ${importList} } from '${module}';`;
  });

  // Update import paths to include .mjs extension
  result = result.replace(/from\s+['"]\.\/([^'"]+)['"];/g, (match, importPath) => {
    // Only add .mjs if there's no extension already
    if (!path.extname(importPath)) {
      return `from './${importPath}.mjs';`;
    }
    // If it has .js extension, replace with .mjs
    if (importPath.endsWith('.js')) {
      return `from './${importPath.replace(/\.js$/, '.mjs')}';`;
    }
    return match;
  });

  // Replace module.exports with export statement
  result = result.replace(/module\.exports\s+=\s+\{([^}]+)\};/g, (match, exports) => {
    const exportList = exports.split(',').map(e => e.trim()).join(',\n    ');
    return `export {\n    ${exportList}\n};`;
  });

  return result;
}

/**
 * Convert ESM code to CommonJS
 * @param {string} code - The source code in ESM format
 * @returns {string} - The converted code in CommonJS format
 */
function convertEsmToCjs(code) {
  // Replace import statements with require statements
  let result = code.replace(/import\s+(\w+)\s+from\s+['"]([^'"]+)['"];/g, 'const $1 = require(\'$2\');');

  // Replace destructured import statements with require statements
  result = result.replace(/import\s+\{\s*([^}]+)\s*\}\s+from\s+['"]([^'"]+)['"];/g, (match, imports, module) => {
    // Handle multi-line destructured imports
    const importList = imports.split(',').map(i => i.trim()).join(', ');
    return `const { ${importList} } = require('${module}');`;
  });

  // Update import paths to remove .mjs extension or replace with .js
  result = result.replace(/require\(['"]\.\/([^'"]+)\.mjs['"]\);/g, "require('./$1');");

  // Replace export statement with module.exports
  result = result.replace(/export\s+\{([^}]+)\};/g, (match, exports) => {
    const exportList = exports.split(',').map(e => e.trim()).join(',\n    ');
    return `module.exports = {\n    ${exportList}\n};`;
  });

  return result;
}
