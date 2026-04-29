# Script Synchronization Tool

This directory contains automation scripts to keep JSON task definitions synchronized with their JavaScript implementation files.

## Overview

When editing task scripts, you can now:
1. **Edit the `.js` file** directly with your full development workflow
2. **Run the sync script** to automatically update the corresponding `.json` file
3. **Check in both files** together with confidence they match

## Available Scripts

### Node.js Version (Recommended)

```bash
node sync-scripts.js
```

**Requirements:** Node.js installed (v12 or later)

**Features:**
- Cross-platform compatible (Windows, macOS, Linux)
- Proper escape handling for special characters
- Detailed output with success/failure counts
- Color-coded status messages

## Workflow

1. **Make changes** to a `.js` file:
   ```javascript
   // Edit example: script-library/scan.js
   const FREQ_STEP = 50; // Changed from 100
   ```

2. **Run the sync script**:
   ```bash
   # Using Node.js
   node sync-scripts.js
   ```

3. **Verify the changes** were applied to the corresponding `.json` file

4. **Commit both files**:
   ```bash
   git add scan.js scan.json
   git commit -m "Update scan frequency step"
   ```

## What Gets Synced

The sync script:
- ✓ Updates the `script` field in the `.json` file
- ✓ Preserves all other fields (`title`, `description`, `autoRunOnConnect`, etc.)
- ✓ Properly escapes special characters (newlines, quotes, tabs, backslashes)
- ✓ Maintains proper JSON formatting

## File Pairing

The script automatically matches `.js` files to `.json` files by name:

| .js File | .json File |
|----------|-----------|
| `band-floor.js` | `band-floor.json` |
| `scan.js` | `scan.json` |
| `tune.js` | `tune.json` |
| etc. | etc. |

## Integration with Git

### Pre-commit Hook

The following git pre-commit hook to automatically sync scripts before committing:

**File: `.husky/pre-commit`** (or `.git/hooks/pre-commit.ps1` on Windows)

```bash
#!/bin/bash
cd "$(git rev-parse --git-dir)/../script-library" || exit 0
node sync-scripts.js
if [ $? -ne 0 ]; then
    echo "Script sync failed. Please resolve and try again."
    exit 1
fi
git add *.json
```

Or using a package.json script:

```json
{
  "scripts": {
    "sync:scripts": "node script-library/sync-scripts.js",
    "precommit": "npm run sync:scripts"
  }
}
```

## Troubleshooting

### Script not found error
- Ensure you're running the script from the `script-library` directory
- Check that both `.js` and `.json` files exist and are readable

### JSON parsing errors
- Verify the `.json` files are valid JSON before running
- Check that `.js` files don't contain characters that break JSON escaping

### PowerShell execution policy error
If you get "cannot be loaded because running scripts is disabled":
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## JSON Schema

The sync script respects the Figaro Task Definition (FTD) schema:

```json
{
  "title": "string",              // Required
  "description": "string",        // Required
  "script": "string",             // Required - auto-synced from .js
  "color": "string",              // Required - hex color, e.g. #FF0000
  "autoRunOnConnect": "boolean",  // Required
  "autoRunPriority": "number",    // Required
  "autoLock": "boolean",          // Required
  "runLocked": "boolean"          // Required
}
```

## Support

For issues or improvements, please refer to the project documentation or contact the maintainers.
