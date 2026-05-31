# English → 한국어 Name Transliterator

A beautiful, interactive browser-based tool that converts English names into Korean (Hangul) phonetic transliterations, showing every step of the conversion process and offering instant audio pronunciation.

## What it does

Type an English name and see it broken down into three logical stages:

| Stage | Example (Michael) |
|-------|-------------------|
| **ARPAbet phonemes** | `M` `AY0` `K` `AH0` `L` |
| **Jamo tokens** | `ㅁ` `ㅏ` `ㅣ` `ㅋ` `ㅡ` `ㄹ` |
| **Hangul syllables** | `마` `이` `클` → **마이클** 🔊 |

Consonants are highlighted in blue, vowels in red — allowing you to see exactly how English phonemes map to Korean character structures.

## Features

- **Korean Audio Playback** — Listen to the correct pronunciation of the transliterated Hangul instantly using the Web Speech API (`speechSynthesis` with `ko-KR` locale), complete with a modern animated speaker button.
- **Dictionary lookup** — Uses the [CMU Pronouncing Dictionary](http://www.speech.cs.cmu.edu/cgi-bin/cmudict) for accurate phoneme sequences.
- **Rule-based fallback** — Automatically handles names not in the dictionary with G2P fallback rules.
- **Step-by-step decomposition** — Teaches *why* each syllable looks the way it does.
- **Dark / light theme** — Auto-detects OS preference, with toggle persistence across browser sessions.
- **Shareable links** — Append `?q=YourName` to pre-fill the input automatically.
- **Continuous Deployment** — Automatically built and deployed to GitHub Pages via GitHub Actions.

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
.github/
└── workflows/
    └── deploy.yml      # CI/CD deployment pipeline to GitHub Pages
src/
├── engine/
│   ├── g2p.ts          # Grapheme-to-phoneme: CMU dict + fallback rules
│   ├── phoneme-map.ts  # ARPAbet → Jamo lookup tables + IPA display
│   ├── synthesizer.ts  # Jamo → Hangul syllable assembly
│   └── index.ts        # Public API: transliterate()
└── ui/
    └── decomposition.ts  # DOM rendering for the 3-step breakdown and TTS control
index.html              # Main page template, layout and styling
```

## Tech stack

- [Vite](https://vitejs.dev/) — Build tool and fast dev server
- [TypeScript](https://www.typescriptlang.org/) — Strict mode, ES2020 target
- [cmu-pronouncing-dictionary](https://www.npmjs.com/package/cmu-pronouncing-dictionary) — Phoneme lookup
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) — Native browser speech synthesis for audio playback

## License

MIT
