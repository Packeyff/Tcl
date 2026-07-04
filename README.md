# ◆ Vault Command — Destiny 2 Loadout Manager

A self-contained, DIM-style loadout manager for Destiny 2 in a single `index.html` — no build step, no server, no dependencies. Open the file in any browser and everything works, running on a realistic demo inventory persisted in `localStorage`.

## Features

**Inventory management**
- Three characters (Titan / Hunter / Warlock) + Vault, with per-slot weapon and armor rows
- Transfer items by drag & drop (onto the vault, the character screen, or a character tab), or via the item popup
- Equip with double-click or from the popup — enforces class restrictions and Destiny's one-exotic-weapon / one-exotic-armor rule, auto-swapping replacements like DIM does
- Max-power calculation per character (average of best-in-slot across your whole account)

**DIM-style search language**
`is:exotic` `is:weapon` `is:locked` `is:equipped` `slot:power` `type:handcannon` `element:solar` `class:titan` `tag:favorite` `tag:none` `perk:incandescent` `owner:vault` `power:>2000` — all combinable, all negatable with a `-` prefix (e.g. `is:weapon -is:exotic power:>=2000`). Press `/` to jump to search.

**Item tools**
- Tags (favorite / keep / infuse / junk / archive), notes, lock/unlock
- Compare view: side-by-side table of every item of the same type (weapons) or slot (armor) with best-stat highlighting
- Organizer: sortable spreadsheet view of the whole account with multi-select bulk tagging, locking, and vaulting

**Loadouts**
- Save current equipment as a loadout, or build one by hand slot-by-slot
- One-click apply: pulls items from the vault or other characters, resolves equip conflicts, and equips everything

**Loadout Optimizer**
- Pick an exotic (or let it choose) and set stat priorities; it searches every owned armor combination for the class — vault included — and returns the best legal build with stat tiers

**🎮 Mission Control (auto-loadout by activity)**
- Pick an activity — Vanguard Ops, Nightfall, Grandmaster, Raid, Dungeon, Expert Lost Sector, Onslaught, Gambit, Crucible, Trials — and the engine scores everything you own against that activity's profile: elemental surges, champion counters (seasonal mods **and** intrinsic exotics like Wish-Ender or Arbalest), weapon roles (boss DPS, add clear, dueling, invader-killing), and the ideal stat spread
- Every pick comes with the reasons it was chosen
- **Auto-equip toggle**: with it on, selecting a mission instantly changes your equipped loadout — the feature this app is built around
- Any recommendation can be equipped with one click or saved as a permanent loadout

**Quality of life**
- Everything persists in `localStorage`; export/import JSON backups; reset to fresh demo data from Settings

## Connecting a real Bungie account (roadmap)

This build runs on demo data so every feature is usable immediately. Live sync works the same way DIM does:

1. Register an application at [bungie.net/en/Application](https://www.bungie.net/en/Application) to get an API key and OAuth client ID
2. Sign in with your Bungie account (OAuth)
3. The app then reads your real characters/inventory and performs equips and transfers through the Bungie.net Platform API

Two honest limitations of *any* third-party app, including DIM: Destiny only allows equipment changes while you're in orbit, in social spaces, or otherwise out of combat — the API rejects most equips mid-activity — and Bungie doesn't expose which mission you're launching from the in-game director, so activity selection happens in the app (which can then equip your gear before you launch).
