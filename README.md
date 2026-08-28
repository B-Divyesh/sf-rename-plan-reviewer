# Rename Plan Reviewer

Review batch renames before you run them.

For people preparing risky spreadsheet or regex batch renames. Paste current and
new paths, then inspect the findings before exporting a plan.

Try the isolated sample at [the demo](/demo/). The demo contains a swap, a
numbering gap, and a reserved Windows name.

- Data stays in this browser.
- Works offline after the first visit.
- Exports start as dry runs.

## Run and verify

Requires Node.js 20 or newer.

```sh
npm ci
npm run dev
npm test
npm run build
```

`npm run build` writes the static PWA to `dist/`. Deploy that directory with the
included `staticwebapp.config.json` configuration.

Each visitor-facing claim is mapped to an observable demo test in
`.factory/claims.json`. Run a listed command after `npm ci` to verify one claim.

## Privacy and terms

Drafts use IndexedDB on this device. The demo uses a separate `demo:` database.
See the [privacy policy](/privacy/) and [terms](/terms/).

MIT licensed. See [LICENSE](LICENSE).
