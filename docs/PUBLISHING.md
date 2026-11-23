# Play and publish Novenara

The GitHub repository is the source of truth. The playable app is the static tree in `dist/`: the original ferry landing at `/` and the later grid village at `/grid/`. A merged pull request does not deploy either one. This repository has no publishing automation.

## Play locally

From a checkout of the branch or commit you want to try:

```sh
node --test tests/grid-village.test.mjs
python3 -m http.server 8080 --bind 127.0.0.1 --directory dist
```

Open `http://127.0.0.1:8080/` or `http://127.0.0.1:8080/grid/`. Use an HTTP server rather than opening the HTML file directly, so the browser can load modules and JSON. Stop the server with Ctrl+C. No Node packages or build step are needed.

## Choose and package a release

1. Confirm the intended GitHub revision, host, and audience with the owner before changing a live site. A code-review approval is not a request to deploy or change access. Keep experimental PRs out of the live site unless specifically chosen.
2. Fetch and inspect the exact approved commit. Using a detached worktree keeps unrelated local changes out:

   ```sh
   git fetch origin
   REV='REPLACE_WITH_APPROVED_FULL_COMMIT_SHA'
   git worktree add --detach ../novenara-release "$REV"
   cd ../novenara-release
   node --test tests/grid-village.test.mjs
   python3 scripts/package-site.py "$REV"
   ```

   Set `REV` to the full SHA before running the commands. If packaging an older revision that lacks the script, run the script by absolute path from a checkout that has it while your working directory is in the target repository.

   **If the prototype import is still under review:** keep the publishing PR based on `main`. From the publishing-docs checkout, fetch the prototype branch explicitly, then use the local script to package that branch without checking it out or merging it:

   ```sh
   git fetch origin refs/heads/import/cove-way-prototype:refs/remotes/origin/import/cove-way-prototype
   REV="$(git rev-parse --verify origin/import/cove-way-prototype)"
   python3 scripts/package-site.py "$REV" --output "/tmp/novenara-${REV}.tar.gz"
   ```

   This is a local verification step, not deployment approval. The publishing PR can be reviewed independently of the prototype import; the script will report missing entry points if used on a docs-only revision.

3. Record the printed commit and SHA-256. The script reads `dist/` from Git, never from your working tree. It makes a host-neutral `tar.gz` containing only `dist/`, refuses to replace an existing file, and neither uploads nor publishes. Unpack and serve its `dist/` on a local port for release smoke tests, or give the unpacked directory to an approved static hosting operator. Test both entry pages, the courier art and movement, and the grid/route interaction. Keep the archive and any test screenshots outside version control.

## Existing private ChatGPT Site

The existing Cove Way preview is owner-private. Use that Site only when it is the confirmed destination; do not create another Site, turn on public access, or invite viewers as a side effect. The original known-good host checkpoint is [Cove Way v2](https://cove-way-opening.bfribeiro.chatgpt.site/), with the [grid village](https://cove-way-opening.bfribeiro.chatgpt.site/grid/) and Site source commit `c32487099033af2a02f6071c57ddbfa052a52162`. This predates the GitHub import; do not treat the Site SHA as a GitHub revision. Refresh the live status and record the actual revision pair at each new release.

1. With the owner’s authorized Sites workspace, locate the existing Site and record its current access, URL, and last-known-good site version. Open its source checkout with the supported **Sites source workflow**. Do not copy the Site’s identity/hosting manifest or credentials into GitHub.
2. Mirror the approved GitHub commit’s tracked `dist/` **exactly** into the Site source checkout’s configured static directory, including any removed files. For example, compare `git archive "$REV" dist` from GitHub with the staging tree, or compare filenames and raw file hashes. Do not change the existing Site settings, copy in unrelated private files, or use the Site as the place to author changes. Do not sync from an uncommitted working tree. A Site-source commit can have a different Git SHA from the original GitHub commit; record the mapping.
3. Use the supported Sites source helper to commit/push the Site source and produce the platform-specific archive, as required by that workflow. The generic archive above is for verification/other approved static hosting, **not** a substitute for this package. Request only the needed access; handle any temporary credential through the supported prompt and never save it in the repo, a shell argument, a file, or the release record.
4. Using the returned source SHA and platform archive, save a Site version and deploy it with the owner-private Sites operation. If the authorization or access level is unclear, stop at the tested package. Keep the destination’s current access policy unchanged. If the owner-private operation is unavailable, use the documented save-then-private-deploy flow. If it refuses this Site configuration, verify the existing policy and use only a supported procedure that explicitly preserves the same owner-only audience; otherwise stop at the saved version or tested package. Wait for a terminal deployment result rather than starting another attempt while the first is running.
5. Verify the returned URL and audience, then open both `/` and `/grid/` with authorized access. On the grid, check the dock-to-quay route, grid switch, movement range, and one landmark; on the original scene, check that the courier and landing load. Record what passed (or what could not be exercised), including whether desktop/mobile were tested. A deployment success receipt confirms publication, not that gameplay passed.

## Release receipt and rollback

For each publish, record the GitHub revision, generic artifact SHA-256, hosting source revision if different, saved version/deployment ID, URL, audience, date, and smoke-test result. No tokens or private lore belong in a receipt.

If a publish fails, check its terminal status and whether the old version is still serving before retrying. If a live regression needs rollback, confirm the rollback destination and select the recorded last-known-good **saved Site version**; redeploy that version using the supported owner-private operation and verify both routes and access again. For a different static host, roll back to the prior verified artifact. Rollback must not rewrite GitHub history or change privacy. Fix the issue in GitHub via a new PR, then use the same release process for the fix.
