#!/usr/bin/env node

/**
 * Sync script content from .js files to corresponding .json files
 * 
 * Usage: node sync-scripts.js
 * 
 * This script reads all .js files in the script-library directory and updates
 * the corresponding .json files with the script content, preserving all other fields.
 */

const fs = require('fs');
const path = require('path');

const SCRIPT_LIBRARY_DIR = __dirname;

/**
 * Get all .js files in the directory
 * @returns {string[]} Array of .js filenames
 */
function getJsFiles() {
  return fs.readdirSync(SCRIPT_LIBRARY_DIR)
    .filter(file => file.endsWith('.js') && file !== 'sync-scripts.js')
    .sort();
}

/**
 * Get the corresponding .json filename for a .js file
 * @param {string} jsFile - The .js filename
 * @returns {string} The .json filename
 */
function getJsonFileName(jsFile) {
  return jsFile.replace(/\.js$/, '.json');
}

/**
 * Update JSON file with script content from JS file
 * @param {string} jsFile - The .js filename
 * @param {string} jsonFile - The .json filename
 * @returns {boolean} True if updated successfully
 */
function updateJsonFile(jsFile, jsonFile) {
  const jsPath = path.join(SCRIPT_LIBRARY_DIR, jsFile);
  const jsonPath = path.join(SCRIPT_LIBRARY_DIR, jsonFile);

  // Check if both files exist
  if (!fs.existsSync(jsPath)) {
    console.warn(`⚠ Warning: ${jsFile} not found`);
    return false;
  }

  if (!fs.existsSync(jsonPath)) {
    console.warn(`⚠ Warning: ${jsonFile} not found`);
    return false;
  }

  try {
    // Read the .js file content
    let scriptContent = fs.readFileSync(jsPath, 'utf8');

    // Read the .json file
    const jsonContent = fs.readFileSync(jsonPath, 'utf8');
    const jsonData = JSON.parse(jsonContent);

    // Update the script field with raw content
    // JSON.stringify will handle all escaping
    jsonData.script = scriptContent;

    // Write back to the .json file with pretty formatting
    fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2) + '\n', 'utf8');

    console.log(`✓ Updated ${jsonFile}`);
    return true;
  } catch (error) {
    console.error(`✗ Error updating ${jsonFile}: ${error.message}`);
    return false;
  }
}

/**
 * Main function
 */
function main() {
  console.log('Syncing .js files to .json files...\n');

  const jsFiles = getJsFiles();

  if (jsFiles.length === 0) {
    console.log('No .js files found.');
    return;
  }

  let successCount = 0;
  let failureCount = 0;

  jsFiles.forEach(jsFile => {
    const jsonFile = getJsonFileName(jsFile);
    if (updateJsonFile(jsFile, jsonFile)) {
      successCount++;
    } else {
      failureCount++;
    }
  });

  console.log(`\nSummary: ${successCount} updated, ${failureCount} failed`);

  if (failureCount === 0) {
    console.log('✓ All scripts synced successfully!');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

main();
