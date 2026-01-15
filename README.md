# Spanish Flashcards

A React-based language learning game that tests Spanish vocabulary knowledge using spaced repetition.

## Features

- **Interactive Matching Game**: Click English words and match them to Spanish translations
- **Spaced Repetition System**: Words you know well are tested less frequently; words you struggle with appear more often
- **Progressive Difficulty**: Start with easy words and unlock harder ones as you progress
- **Mobile Optimized**: Fully responsive design that works great on both mobile and desktop
- **Persistent Progress**: Your learning stats are saved locally in your browser

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Deploy to GitHub Pages

This project is automatically deployed to GitHub Pages on every push to the `main` branch via GitHub Actions.

Visit the deployed app: [https://andrew.github.io/spanish-flashcards/](https://andrew.github.io/spanish-flashcards/)

To set up GitHub Pages for your own fork:
1. Go to your repository Settings → Pages
2. Set the source to "GitHub Actions"
3. The workflow will automatically deploy on push to main

## How to Play

1. Select an English word on the left
2. Click the Spanish word you think is the correct translation
3. Correct matches will disappear
4. Continue until all 5 pairs are matched
5. Click "Next Round" to play again with different words

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **CSS3** - Responsive styling
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
