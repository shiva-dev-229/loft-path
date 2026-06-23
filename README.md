# Lord of the Flies — Choose Your Path

> A branching, "choose your own adventure" interactive-fiction engine that retells the survival story of *Lord of the Flies*. Every passage and every fork in the story is defined as data, so the entire narrative can be rewritten without touching a line of engine code.

<p align="left">
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white">
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-4-38BDF8?logo=tailwindcss&logoColor=white">
  <img alt="Status" src="https://img.shields.io/badge/story-31_nodes_·_9_endings-e8a045">
</p>

---

## Table of contents

- [Overview](#overview)
- [Features](#features)
- [How it works](#how-it-works)
- [The story format](#the-story-format)
- [Writing your own story](#writing-your-own-story)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Available scripts](#available-scripts)
- [Tech stack](#tech-stack)
- [Credits](#credits)
- [License](#license)

---

## Overview

**Lord of the Flies — Choose Your Path** drops the player onto the island moments after the crash. From the opening passage, every decision pushes you toward one of two pulls — order or savagery — and the story branches accordingly. Some paths lead to rescue; most lead somewhere darker.

The project is built around a single idea: **the story is data, not code.** All 31 passages live in one JSON file (`src/data/story.json`). The React app is a small, reusable engine that reads that file, renders the current passage, and follows whichever choice the player picks. Replace the JSON and you have an entirely different game.

> _Add a screenshot or GIF here once deployed — e.g._ `![Gameplay](./public/screenshot.png)`

---

## Features

- **Fully data-driven narrative** — the engine never hard-codes a single line of story. Passages, choices, and endings all come from `story.json`.
- **31 story nodes, 9 distinct endings** — 3 ways to be rescued, 6 ways the island wins.
- **Dynamic progress bar** — a recursive longest-path search measures how deep the story can go and shows the player roughly how far they are from an ending.
- **Chapter counter** — increments with every decision made.
- **Path recap & breadcrumb trail** — the choices you made are summarized on screen and again on the ending card, so each playthrough tells its own story back to you.
- **Distinct win / loss endings** — a `RESCUED` screen with a calm glow, or a `YOU DIED` screen with an ominous fade.
- **Replay from the top** — reset the run and take a different path through the island.
- **Atmospheric, responsive UI** — serif typography, an amber-on-dark palette, conch-shell dividers, and fade-in transitions, all responsive from phone to desktop.

---

## How it works

The engine lives almost entirely in [`src/App.jsx`](./src/App.jsx) and is intentionally small.

1. **Node lookup.** On load, the story array is converted into a lookup map keyed by node `id`:

   ```js
   const nodeMap = Object.fromEntries(story.map(n => [n.id, n]))
   ```

2. **Progress measurement.** A depth-first helper, `computeLongestPath`, walks the branching tree from the `start` node and returns the length of the longest possible route to an ending. That number becomes the denominator for the progress bar, so progress stays meaningful no matter which branch you're on.

3. **State.** A handful of `useState` hooks track the current screen (`intro` / `game`), the current node id, and the running history of choice labels. Picking a choice appends its label to the history and swaps the current node id to the choice's `nextId`.

4. **Rendering.** Each render looks up the current node and shows one of three things:
   - an **intro screen** (before the story starts),
   - a **story node** (passage text + choice buttons + breadcrumb), or
   - an **ending screen** (result banner + final passage + full path recap + replay button).

   Ending nodes are detected by the presence of an `ending` field; everything else is treated as a normal branching passage.

Because the engine only cares about `id`, `text`, `choices`, and `ending`, it has no knowledge of *Lord of the Flies* specifically — that's all in the data.

---

## The story format

The entire narrative is an array of **node** objects in [`src/data/story.json`](./src/data/story.json). There are two kinds of node.

### Branching node

A passage the player reads, followed by the choices they can make.

```json
{
  "id": "the_civilized",
  "text": "You sit in the circle around the conch. The talk here is of being found...",
  "choices": [
    { "label": "Take charge and try to hold the group together — Leader", "nextId": "leader" },
    { "label": "Skip the politics and join the work — Builder",          "nextId": "builders" }
  ]
}
```

### Ending node

A terminal passage with no choices. The `ending` value drives which result screen appears.

```json
{
  "id": "leader_splinter",
  "text": "You strike the conch on the rock for order, again and again, but the sound of it grows thinner each time...",
  "ending": "lose"
}
```

### Field reference

| Field     | Type                  | Required | Description                                                                 |
| --------- | --------------------- | :------: | --------------------------------------------------------------------------- |
| `id`      | `string`              |   Yes    | Unique identifier for the node. The engine starts at the node with id `start`. |
| `text`    | `string`              |   Yes    | The passage shown to the player.                                            |
| `choices` | `Choice[]`            |   For branching nodes | The options presented. Omit on ending nodes.                     |
| `ending`  | `"win"` \| `"lose"`   |   For ending nodes    | Marks the node as terminal and selects the result screen. Omit on branching nodes. |

**Choice object:**

| Field    | Type     | Required | Description                                              |
| -------- | -------- | :------: | -------------------------------------------------------- |
| `label`  | `string` |   Yes    | The text shown on the choice button.                     |
| `nextId` | `string` |   Yes    | The `id` of the node this choice leads to.               |

---

## Writing your own story

Because the engine is content-agnostic, you can author a brand-new branching story with no React experience:

1. Open `src/data/story.json`.
2. Make sure exactly one node has the id `start` — that's where every playthrough begins.
3. For each passage, write a node with an `id`, the `text`, and a list of `choices`. Each choice's `nextId` must match the `id` of another node.
4. End a branch by giving a node an `ending` of `"win"` or `"lose"` instead of `choices`.
5. Save and refresh — Vite hot-reloads the change instantly.

**Authoring tips**
- Every `nextId` should point at a real node `id`, or that choice will dead-end.
- Every branch should eventually reach an `ending` node so the player can finish.
- You can reuse a `nextId` from multiple choices to let different paths converge.

---

## Project structure

```
loft-path/
├── public/                 # Static assets served as-is
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/             # Images used by the app (hero art, logos)
│   ├── data/
│   │   └── story.json      # ← the entire story lives here (31 nodes)
│   ├── App.css
│   ├── App.jsx             # ← the engine: rendering, state, progress logic
│   ├── index.css           # Global styles + animations
│   └── main.jsx            # React entry point
├── index.html
├── eslint.config.js
├── vite.config.js
└── package.json
```

---

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer
- npm (ships with Node)

### Installation

```bash
# clone the repo
git clone https://github.com/shiva-dev-229/loft-path.git
cd loft-path

# install dependencies
npm install

# start the dev server
npm run dev
```

Vite will print a local URL (usually `http://localhost:5173`). Open it in your browser and the story begins.

---

## Available scripts

| Command           | What it does                                                |
| ----------------- | ---------------------------------------------------------- |
| `npm run dev`     | Start the Vite dev server with hot-module reloading.        |
| `npm run build`   | Produce an optimized production build in `dist/`.           |
| `npm run preview` | Serve the production build locally to preview it.           |
| `npm run lint`    | Run ESLint across the project.                              |

### Deploying

This is a static front-end app, so the production build (`npm run build`) can be hosted anywhere static files are served — Vercel, Netlify, or GitHub Pages. Point the host at the `dist/` folder (or connect the repo and let it build automatically) and you'll have a public play link.

---

## Tech stack

- **[React 19](https://react.dev/)** — UI and state management via hooks.
- **[Vite](https://vite.dev/)** — dev server and build tooling.
- **[Tailwind CSS v4](https://tailwindcss.com/)** — utility-first styling.
- **[ESLint](https://eslint.org/)** — linting.

---

## Credits

Created by **Shivansh Upadhyay, Aryav Agarwal, Ayush Damodar, Haider Abbas, Vihaan Tandon & Arnav Mahajan.**

Narrative inspired by *Lord of the Flies* by William Golding.

---

## License

No license has been specified yet. Until one is added, the code is "all rights reserved" by default — others can view it but not legally reuse it. If you'd like people to be able to learn from or build on it, consider adding an [MIT license](https://choosealicense.com/licenses/mit/).
