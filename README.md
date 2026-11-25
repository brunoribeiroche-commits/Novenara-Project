# Novenara Project

Cove Way is the first playable prototype for Novenara Project, an elemental fantasy RPG. An ordinary courier arrives on a remote river island as House Vessar's annexation reaches everyday life.

## Run locally

From the repository root:

```sh
python3 -m http.server 8000 --directory dist
```

Open http://localhost:8000/ for the original opening or http://localhost:8000/grid/ for the tactical-grid variant. No dependencies or build step are required.

```sh
node --test
```

The village currently supports movement, dialogue and the parcel delivery. The grid variant demonstrates movement range, not combat. The three ferry-fare quests are planned, not implemented.

- [Courier art sheet and animation guide](docs/COURIER-ANIMATION-HOW-TO.md)
- [Legacy V4 courier atlas](docs/COURIER-MODEL.md)
- [Grid prototype](docs/GRID-VILLAGE.md)
- [Visual style guide](docs/VISUAL-STYLE-GUIDE.md)
