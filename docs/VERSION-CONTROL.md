# Version-control strategy (proposed)

**Status: awaiting Bruno’s approval.** The initial prototype import is already authorized; this proposal governs future changes.

| Decision | Proposed default |
|---|---|
| Main branch | Keep `main` playable. It is the baseline, not a scratchpad. No force-pushes or automatic merges. |
| Commit cadence | Commit when one coherent, reviewable change works or reaches a useful testable checkpoint, not on a timer. Keep unrelated changes separate. Push draft checkpoints to a feature branch if needed. |
| Branch and PR size | One review question per PR. A quest branch, mechanic, map change, or visible asset redesign gets its own branch and PR even if the diff is small. Keep supporting tests, assets, and docs in the same PR as the behavior they protect. Split unrelated work; do not split a single playable change just to fit a line count. |
| Small changes | A typo, link fix, or internal cleanup with no effect on behavior, balance, or canon can share a small maintenance PR. No separate per-item approval is needed for these once Bruno approves this policy, within work he has authorized. |
| Work in progress | Open PRs as drafts. Include what changed, why, checks run, and a screenshot or private playtest link when the change is visible. Mark ready only when reviewable. |
| Merge | Run existing tests and smoke-test the affected route or interaction. For gameplay, art direction, balance, and canon, wait for Bruno’s approval before merging. Squash by default for a readable history; keep a short series if the individual commits are useful. Merging does not deploy or make a preview public. |
| Rollback and releases | Revert broken changes with a new commit rather than rewriting history. Tag meaningful playable milestones, not every commit. |

## Example

A cellar quest gets a branch such as `feature/cellar-ledger`. Separate commits can add the route, then the quest interaction and its tests. The PR describes the whole playable change and links to the relevant design-log entry. A separate ferry-marker change gets a separate PR, so Bruno can approve one without taking the other.

## Project record

Keep the design log (`docs/DESIGN-LOG.md`, in its own PR) with the code. Update it when a decision or meaningful playtest result changes the plan; do not log every keystroke. Use issues for actionable work and PRs for implementation discussion. Give any subagent a bounded assignment and point it to the log so the project never relies on a worker remembering a past chat.
