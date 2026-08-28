# Demo sandbox

Open `/demo/` (or `/?demo=1`) to load the supplied risky rename plan. It has a
swap, a numbering issue, and a Windows reserved destination so the reviewer is
already populated on arrival.

The demo uses the IndexedDB database `demo:rename-plan-reviewer`, never reads
the real `rename-plan-reviewer` database, and does not run license restoration
or verification. **Reset demo** deletes and reloads only that demo database.
**Start for real** returns to `/`; demo data is not copied to the real draft.
