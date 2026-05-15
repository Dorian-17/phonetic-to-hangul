# English → 한국어

A browser-based tool that converts English names into Korean (Hangul) phonetic transliterations, showing every step of the conversion process.

## What it does

Type an English name and see it broken down into three stages:

| Stage | Example (Michael) |
|-------|-------------------|
| **ARPAbet phonemes** | `M` `AY0` `K` `AH0` `L` |
| **Jamo tokens** | `ㅁ` `ㅏ` `ㅣ` `ㅋ` `ㅡ` `ㄹ` |
| **Hangul syllables** | `마` `이` `클` → **마이클** |

Consonants are highlighted in blue, vowels in red — so you can see exactly which phoneme maps to which Korean character.

## Features

- **Dictionary lookup** — uses the [CMU Pronouncing Dictionary](http://www.speech.cs.cmu.edu/cgi-bin/cmudict) for accurate phoneme sequences
- **Rule-based fallback** — handles names not in the dictionary with G2P rules
- **Step-by-step decomposition** — teaches *why* each syllable looks the way it does
- **Dark / light theme** — auto-detects OS preference, toggle persists across sessions
- **Shareable links** — append `?q=YourName` to pre-fill the input

## Getting started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## How the conversion works

```
English text
    ↓  G2P (CMU dict or rule-based)
ARPAbet phonemes  (e.g. M AY0 K AH0 L)
    ↓  phoneme-map lookup
Jamo tokens  (e.g. ㅁ ㅏ ㅣ ㅋ ㅡ ㄹ)
    ↓  syllable assembly (초성 + 중성 + 받침)
Hangul syllables  (e.g. 마이클)
```

The synthesizer groups jamo into syllable blocks following Korean orthographic rules — each block requires an onset consonant (초성) and a vowel (중성), with an optional coda consonant (받침).

## Project structure

```
src/
├── engine/
│   ├── g2p.ts          # Grapheme-to-phoneme: CMU dict + fallback rules
│   ├── phoneme-map.ts  # ARPAbet → Jamo lookup tables + IPA display
│   ├── synthesizer.ts  # Jamo → Hangul syllable assembly
│   └── index.ts        # Public API: transliterate()
└── ui/
    └── decomposition.ts  # DOM rendering for the 3-step breakdown
```

## Tech stack

- [Vite](https://vitejs.dev/) — build tool and dev server
- [TypeScript](https://www.typescriptlang.org/) — strict mode, ES2020 target
- [cmu-pronouncing-dictionary](https://www.npmjs.com/package/cmu-pronouncing-dictionary) — phoneme lookup

## License

MIT
