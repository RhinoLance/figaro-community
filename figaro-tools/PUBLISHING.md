# Publishing Checklist

Use this checklist to publish `figaro-tools` safely.

## Prerequisites

1. Ensure you can authenticate to npm (`npm login`).
2. Confirm package name availability or ownership (`npm view figaro-tools`).
3. Review pending changes and commit them.

## Pre-publish checks

1. Run tests and packaging checks:

```bash
npm run publish:check
```

2. Validate the CLI from a package tarball if desired:

```bash
npm pack
npx --yes --package ./figaro-tools-<version>.tgz figaro-ftd-validate --help
```

## Publish

1. Bump version in package.json as needed (`npm version patch|minor|major`).
2. Publish to npm:

```bash
npm run publish:public
```

## Post-publish verification

1. Confirm the package exists:

```bash
npm view figaro-tools version
```

2. Smoke test from npm:

```bash
npx figaro-ftd-validate --help
```
