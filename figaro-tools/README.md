# figaro-tools

CLI tools for working with Figaro task definition files.

## Install

```bash
npm install --save-dev figaro-tools
```

Scripts can also be run without installing by prepending the command with:
`--yes --package`
e.g.
```bash
npx --yes --package figaro-tools@latest figaro-ftd-validate my-task.json
```

## Validate a task file

```bash
npx figaro-ftd-validate my-task.json
```

## Validate all JSON files in a directory

```bash
npx figaro-ftd-validate .
```

If no path argument is provided, the command validates all `.json` files in the current directory.

