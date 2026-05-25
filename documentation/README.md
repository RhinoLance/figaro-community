### Validate FTD JSON

Run the validator against a single task definition:

```bash
npx figaro-ftd-validate my-task.json
```

Run the repository-wide validator (all JSON files in `script-library/`):

```bash
npm run validateScripts
```