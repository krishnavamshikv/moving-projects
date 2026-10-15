# ⚡ Vim Defender: Terminal Arcade Vim Training Game

**Vim Defender** is a fast-paced, arcade-style terminal defense game built with standard Python `curses` to train authentic Vim muscle memory right in your terminal.

Defend a live code buffer from rogue bugs, memory leaks, and syntax errors using real Vim motions, count multipliers, operators, and text objects!

---

## 🎮 Quick Start

No external dependencies or `pip install` required — runs directly with Python 3 on Linux/macOS:

```bash
# Run directly:
./vim_defender.py

# Or via Python:
python3 vim_defender.py
```

---

## 🐣 Beginner Friendly Features

- **Mission Briefings Before Each Stage**: A clear tutorial card introduces the exact keys and motions you need before the stage starts. Timers do not start until you press `[SPACE]` or `[ENTER]`.
- **Persistent Objective & Guide Bar**: At the top of your screen, the game tells you:
  - `🎯 TARGET`: Where the bug is and what action is required.
  - `💡 SUGGESTED`: The exact recommended keystroke sequence to reach and neutralize it (e.g. `Press '3j' to reach line 4, then 'w' or 'l' to land on bug`).
- **Target Indicators in Editor**:
  - Gutter arrow `▶  4 │` highlights the line containing the threat.
  - In-code pointer `◀◀ TARGET [LAND] ⏱35.0s` points directly to the rogue token.
- **Pause Anytime (`[P]`)**: Press `P` or `p` at any time during gameplay to freeze the countdown clock and review your objective, suggested keys, and Vim controls.
- **Gentle Learning Curve**:
  - **Stage 1**: Only **1 bug at a time** with a generous **35-second timer**, so you have plenty of time to explore and practice `hjkl` and `w/b/e`.
  - Softer damage on detonation so mistakes are forgiving.

---

## 🕹️ Game Modes: 4 Phases × 3 Sub-Levels + Endless Mode

Each phase features **3 progressive sub-levels** (Basic, Intermediate, and Hard) that scale in challenge and file length:
- **Sub-Level 1 (Basic)**: Short buffer (12–14 lines), relaxed single-threat timers, perfect for mastering the core keystrokes.
- **Sub-Level 2 (Intermediate)**: Medium buffer (~24 lines), standard timers, and 2 concurrent threats.
- **Sub-Level 3 (Hard & Long)**: Large buffer (42+ lines) requiring vertical leaps (`gg`, `G`, `5j`, `10k`), fast timers, and high concurrent threats.

### Phase 1: Basic Motions (`hjkl`, `w`, `b`, `e`, `0`, `$`, `gg`, `G`)
- **1.1 Basic**: Short buffer (12-14 lines), 1 bug at a time, generous 35s timer.
- **1.2 Intermediate**: Medium buffer (24 lines), 2 concurrent bugs, 25s timer.
- **1.3 Hard & Long**: Long buffer (42+ lines), 3 concurrent threats, 18s timer. Master `gg` and `G`!

### Phase 2: Inline Find & Count Leaps (`f`, `t`, `F`, `T`, `;`, `,`, counts like `3w`, `4j`)
- **2.1 Basic**: Short buffer, single threats, 30s timer. Practice `f<char>` and `;`.
- **2.2 Intermediate**: Medium buffer, 2 concurrent threats, 22s timer.
- **2.3 Hard & Long**: Long buffer (42+ lines), 3 concurrent threats, 16s timer. Use counts (`3w`, `4j`) to cross large code regions rapidly!

### Phase 3: Operators & Deletions (`x`, `dw`, `de`, `dd`, `D`, `/search`)
- **3.1 Basic**: Short buffer, single threats (`BitFlip` [x], `DeadCode` [dw]).
- **3.2 Intermediate**: Medium buffer, adds `FatalException` [dd] and `/pattern` search lock.
- **3.3 Hard & Long**: Long buffer (42+ lines), fast 15s timers, 3 concurrent rogue tokens.

### Phase 4: Text Objects Surgery (`ci"`, `di"`, `ciw`, `diw`, `da(`, `ca{`)
- **4.1 Basic**: Short buffer, single quote/word surgery threats (`RogueString` [ci"/di"], `RogueToken` [ciw/diw]).
- **4.2 Intermediate**: Medium buffer, adds block delimiters (`ZombieBlock` [da(/ca(]).
- **4.3 Hard & Long**: Long buffer (42+ lines), intense 14s timers, 3 concurrent surgery threats.

### 5. Endless Survival Mode
- **Focus**: Complete mastery under relentless pressure.
- Infinite escalating waves across all motion and operator types, accelerating spawn rates, timers shrinking down to 4s, combo multipliers up to **x8.0**, and persistent high scores!

---

## ⌨️ Controls & Cheatsheet

| Key(s) | Vim Action | In-Game Effect |
| :--- | :--- | :--- |
| `h` / `j` / `k` / `l` | Left / Down / Up / Right | Basic cursor movement |
| `w` / `e` / `b` | Word Forward / Word End / Word Back | Rapid token traversal |
| `0` / `^` / `$` | Start of line / First non-blank / End of line | Instant horizontal line navigation |
| `gg` / `G` | Top of file / Bottom of file | Instant vertical buffer jumps |
| `f<c>` / `F<c>` | Find character forward / backward | Leap directly to character `<c>` |
| `t<c>` / `T<c>` | Till character forward / backward | Leap right before/after `<c>` |
| `;` / `,` | Repeat find / Reverse repeat | Repeat last find motion |
| `[count][motion]` | E.g. `3w`, `4j`, `2b` | Leap multiple units in one keystroke |
| `x` | Delete character under cursor | Neutralize BitFlip threats |
| `dw` / `de` | Delete to next word start / word end | Neutralize DeadCode tokens |
| `dd` | Delete entire line | Neutralize FatalException alerts |
| `ci"` / `di"` | Change / Delete inside double quotes | Neutralize RogueString threats |
| `ciw` / `diw` | Change / Delete inside word | Neutralize RogueToken threats |
| `da(` / `ca(` | Delete / Change around parentheses block | Neutralize ZombieBlock threats |
| `/pattern<Enter>` | Search pattern forward | Instant lock onto matching text |
| `<Esc>` | Normal mode reset | Cancel pending operators or search |

---

## 🏆 Scoring & Combo System

- **Fast Neutralization**: Neutralizing bugs while their timer is high awards bonus points.
- **Combo Multiplier**: Each successful neutralization increases your multiplier (`x1.0` ➔ `x1.25` ➔ ... up to `x8.0`).
- **Buffer Integrity**: Letting a threat timer hit `0s` detonates the bug, dealing damage to your buffer integrity and resetting your combo. Don't let it reach 0%!
- **High Scores**: Automatically saved to `~/.vim_defender_scores.json`.

---

## 🧪 Running Automated Tests

```bash
python3 -m unittest test_vim_engine.py
```
