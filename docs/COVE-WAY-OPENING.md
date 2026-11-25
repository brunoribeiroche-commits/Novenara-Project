# Cove Way opening: ferry arrival

**Scene goal:** Make the first minutes feel like an ordinary delivery in a remote river village. Let the player notice the annexation through a changed sign and a guard doing his job before anyone explains the larger conflict.

## What the private dock playtest covers

1. **On the ferry.** The courier, dressed in black and red and carrying the parcel, starts on the docked ferry. The ferryman is beside him and can be spoken to directly. Walking off via the gangplank also triggers the farewell: “Here we are. Mind the gap.” He points the courier toward the ticket window.
2. **At the ticket station.** Follow the pier to the stone quay. The player can inspect the notice: `HOUSE VESSAR · HARBOR OFFICE · REGISTER ALL ARRIVALS.` A lifted corner shows part of the original `COVE WAY FERRY` sign. The new paper over the old paint is the first sign that control changed.
3. **At the guard.** A House Vessar guard stands beside the booth. He tells the courier to keep the parcel tied, explains that arrivals are logged at the window, and points out the steps on the right. Notice and guard can be approached in either order.
4. **Toward the village.** Once the farewell, sign, and guard have been seen, the objective points up the eastern steps into Cove Way. This completes the **dock scene**. The new playtest does not yet transition to a connected village map or take the player through the parcel handoff.

## What belongs outside this scene

- Cove Way is in the Sixth Realm. This is a local ferry dock on an island, not a portal. House Vessar is the Third Cycle family. The first beat is an ordinary delivery, not a prophecy or a summons.
- The older village build in GitHub main has its own clerk, guard, and parcel-delivery sequence. It is a separate implementation, not already linked to this new port.
- Ferry fare, the recipient’s situation, skill rewards, and the three side quests are downstream design in the [design log](DESIGN-LOG.md). This doc does not revise their plot or claim they are playable here.
- The crab is an optional combat sandbox after the dock beats. It is not part of the story and does not imply final combat rules.
- The guard’s exact insignia and other hardware lore can change. Keep their story function even if the designs evolve.

## Build notes and acceptance

- In the private playtest, `dist/arrival.mjs` defines the conversation, objective, and three completion flags. `dist/game.mjs` handles pointer and keyboard interactions. `dist/map.mjs` holds the ferry crossing and walkable geometry.
- Arrive, cross without clipping into the river, get the farewell once, then read the sign and speak to the guard in either order. Test keyboard and click-to-walk. Verify that the exit is immediately readable without pulling attention from the story clues.
- Follow [the movement decision](MOVEMENT.md) and [the port art reference](COVE-WAY-PORT-ART.md) when expanding beyond the quay.
