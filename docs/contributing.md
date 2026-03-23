# <img src="media/header_logo.png" alt="Figaro" width="30"/> Figaro Contribution Guide

If you've made an amazing script which you're keen to share with others, 
we'd love to add it to the community library.

## How are contributions made?

Contributions are made with a pull request (PR) against this repository.

### Simple Pull Request Flow

1. Fork the [figaro-community] repository to your own GitHub account.(https://github.com/RhinoLance/figaro-community/)
2. Add your files to `script-library/`:
	 - `your-script-name.js`
	 - `your-script-name.json`
3. Commit with a clear message.
4. Open a pull request from your fork into the main repository.
5. Wait for review feedback, make updates if requested, then the PR can be merged.

Keep each PR focused on one script or one small related set of changes to make review easier.

## Script Package Definition

Each contributed script is a pair of files with the same base name:

- JavaScript runtime script: `script-library/<name>.js`
- Script metadata: `script-library/<name>.json`

Example:

- `script-library/set-clock-local.js`
- `script-library/set-clock-local.json`

### 1) JavaScript File (`.js`)

The `.js` file contains the executable task logic that runs in the Figaro scripting runtime.  Please consider the readability; use descriptive function
and variable names, and add comments as required.  Make it simple for potential 
users to understand what the script's doing.

Example:

```javascript
const now = new Date();

const pad = n => String(n).padStart(2, "0");

const timestampUTC =
	pad(now.getUTCHours()) +
	pad(now.getUTCMinutes()) +
	pad(now.getUTCSeconds());

sendCat(`TM${timestampUTC};`);
```

### 2) Metadata File (`.json`)

The `.json` file describes the script for display in the library.

Required fields:

- `title` (string): short display name
- `description` (string): one-line summary of what the script does
- `tags` (string array): searchable keywords
- `created` (string): creation date in `YYYY-MM-DD` format

Minimum example:

```json
{
	"title": "Set Clock",
	"description": "Set Clock to UTC time",
	"tags": ["time", "clock"],
	"created": "2026-03-21"
}
```

## Checklist Before Opening a PR

1. File names match exactly: `<name>.js` and `<name>.json`
2. JSON is valid and includes `title`, `description`, `tags`, and `created`
3. CAT commands in the script are complete and terminate correctly
4. Script behavior and description match
5. PR title clearly states what script was added or updated
