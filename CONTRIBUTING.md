# Contributing to THE KERNEL PANIC

🎮 Thanks for your interest in contributing!

## Quick Start

```bash
git clone https://github.com/marcellopato/the-kernel-panic.git
cd the-kernel-panic
npm install
npm run dev
```

## Project Structure

```
src/
├── main.js           # Entry point
├── core/
│   ├── Game.js       # Main game logic
│   ├── World.js      # Sector generation
│   ├── Player.js     # Player state
│   ├── GameState.js  # Save/load system
│   ├── EncounterManager.js  # Random events
│   └── NetworkManager.js     # P2P multiplayer
├── ui/
│   ├── Terminal.js   # Terminal output
│   └── CRTManager.js # Visual effects
├── audio/
│   └── SoundManager.js
└── utils/
    └── SeededRandom.js
```

## Adding New Features

### 1. New Commands

Add command handlers in `Game.js` `processCommand()` method:

```javascript
else if (cmd === 'mycommand') {
    // Your logic here
    this.look(); // Refresh display
}
```

### 2. New Encounters

Edit `EncounterManager.js`:

```javascript
const encounters = [
    // Your new encounter
    {
        trigger: (player, room) => room.type === 'your-type',
        run: async (player) => {
            // Encounter logic
        }
    }
];
```

### 3. New Items

Add items in `World.js` `items` array:

```javascript
items: ['Your Item', 'Another Item']
```

Then handle item effects in `Game.js` `useItem()`.

## Coding Standards

- Use **ES6+** (modules, arrow functions, template literals)
- Follow the existing code style (2 spaces, semicolons)
- Keep functions small and focused
- Add comments for complex logic
- Test on mobile (terminal must be responsive)

## Pull Request Process

1. **Fork** the repo
2. Create a **feature branch** (`git checkout -b feature/amazing`)
3. Make your **changes**
4. **Test** locally
5. Push and open a **PR**
6. Wait for review 🚀

## Ideas for Contributions

- 🎨 New visual themes
- 🎵 More sound effects
- 🌍 Localization (translations)
- 🏆 Leaderboard backend
- 👥 Multiplayer improvements
- 📱 Mobile UI polish
- 🔧 Bug fixes

---

Questions? Open an issue or reach out!
