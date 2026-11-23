# Novenara Project design log

This is the running record of what Bruno has decided, what the prototype actually does, and what is still up for discussion. Cove Way is the prototype working title; Novenara Project is the repository name.

## 2026-11-23 | Opening prototype and tutorial direction

### Built and playtested
- The courier arrives by ferry in a remote river village, checks in with the clerk and guard, and delivers the parcel uphill. A vendor is optional.
- The grid variant uses a hidden cardinal movement grid beneath natural paths and cobbles. A toggle shows the grid; the movement-range demo gives five steps before a manual reset. It is not a combat turn system.
- The approved V4 courier wears black and red, with jet-black hair and a white streak. Use the existing directional sprite atlas and walk animation as the baseline.

### Author decisions, not implemented yet
- Open with an ordinary delivery and a slice-of-life tone. This is an island in the Sixth Realm, not a gateway to another realm. House Vessar is the present Third Cycle family. The annexation first shows up in everyday life: new currency, control of river access, and restrictions on imports.
- After delivery, the recipient offers a bed but cannot pay in the new currency. The ferry fare is 10 new coins. Three quests each award 5 coins and 2 skill points once; any two pay the fare. Track the outcome separately from the reward, so a different resolution never pays twice.
- **Ledger:** Retrieve a produce-stall keeper’s ledger from a dark cellar. The ledger and her exchange receipt can explain the shortfall and answer suspicions that she skimmed.
- **Ferry marker:** An out-of-place marker now indicates a guarded private landing. Restore it and the guards later retaliate against the ferryman, or leave it and warn him. Both resolutions pay the same.
- **Medicine:** Recover the sick woman’s crate outside the village. Avoid the guards and deliver it, or declare it and lose it to the guards. The reward is the same; the woman goes untreated in the second outcome. Her eventual fate is open.
- Affinity affects the cost of learning, not whether an element is available to learn. The wheel is Fire → Air → Earth → Lightning → Water → Fire, with relative affinities 100% / 80% / 60% / 40% / 20% from the starting element. Exact unlock costs are open.
- Elemental skills should be reusable across combat, traversal or NPC interactions where they fit. Not every terrain should favor every affinity, and an exploration unlock can come at the expense of a combat unlock.

### Next design pass
Map obstacles and skill checks before building the quests. For each starter, identify a first quest that does not require quest points, then a distinct second quest after each reachable first outcome. Flag routes that depend on unpriced unlocks. Check the optional third quest separately. Combat math, exact skill trees and costs, dialogue, and the larger ending remain open.

## How to maintain this log
- Append a dated entry for new decisions, meaningful scope changes, and playtest findings. Say why a decision was made when it would change future work.
- Mark entries **Decided**, **Prototype only**, or **Open** where the distinction matters. If a decision changes, note what it supersedes rather than quietly rewriting history.
- Keep detailed mechanics or asset specs in their own linked docs. Record the relevant branch, PR or test result here when useful.
- Give subagents bounded assignments, such as implementing a route or playtesting a specific build. They should read this log first and bring back findings. The repo, not any worker’s chat history, is the durable reference.
