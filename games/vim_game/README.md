# 🎮 Vim Mastery Game

> A comprehensive, terminal-native interactive game designed to forge genuine muscle memory and take you from absolute beginner to high-level Vim wizard — played entirely inside Vim.

---

## ⚡ Quick Start

Launch the game immediately with a single command (no dependencies, no setup required):

```bash
./play
```

This starts Vim with an isolated, clean runtime environment so your personal `~/.vimrc` remains completely untouched.

### Specific Level Jump
You can also leap directly into any phase and difficulty:

```bash
./play 1 beginner        # Phase 1 Beginner
./play 3 intermediate    # Phase 3 Intermediate
./play 6 hard            # Phase 6 Hard
```

### Reset Campaign Progress
```bash
./play --reset
```

---

## 🗺️ The 12-Phase Curriculum (36 Levels)

Each phase contains **3 progressive sub-levels**: Beginner, Intermediate, and Hard.

| Phase | Topic | Beginner | Intermediate | Hard |
|:---:|---|---|---|---|
| **01** | **Basic Navigation & Counts** | Single-step axis movements (`h`, `j`, `k`, `l`) through tight mazes | Word jumps & Count Multipliers (`w`, `b`, `e`, `5l`, `4h`, `3w`) | Exact line leaps & extremities (`0`, `^`, `$`, `:10`, `10G`, `gg`, `G`, relative jumps `7j`) |
| **02** | **Insertion & Basic Edits** | Append vs Insert (`i`, `a`, `I`, `A`) | Open lines & replace char (`o`, `O`, `r`, `s`) | Character sniping & undo chains (`x`, `X`, `u`, `<C-r>`) |
| **03** | **Precision Motions** | In-line char find (`f`, `F`) with counts (`2fa`) | Till & Repeat (`t`, `T`, `;`, `,`) | Bracket matching & identifier jumps (`%`, `*`, `#`) |
| **04** | **Operators & Repetition** | Delete operator & counts (`dw`, `de`, `dd`, `3dw`, `2dd`) | Change operator (`cw`, `ciw`, `cc`, `C`) | The Holy Dot Command (`.`, `4.`, `3p`) |
| **05** | **Visual & Block Modes** | Character visual mode (`v`) | Line visual mode & indentation (`V`, `>`, `<`) | Visual Block multi-cursor editing (`<C-v>`, `I`, `A`) |
| **06** | **Text Objects Mastery** | Inner/Around word objects (`iw`, `aw`, `ciw`, `daw`) | Quotes & Delimiters (`ci"`, `da'`, `di\``) | Brackets & HTML/XML tags (`ci(`, `da{`, `cit`, `dat`) |
| **07** | **Search & Substitution** | Forward/Backward regex navigation (`/`, `?`, `n`, `N`) | Line substitution (`:s/old/new/g`) | Range & Global substitution (`:%s`, capture groups `\1`) |
| **08** | **Marks & Jump Lists** | Local marks & teleports (`ma`, `'a`, `` `a ``) | Jump history & changelist (`<C-o>`, `<C-i>`, `g;`) | The context bouncing snap (`` `` ``) |
| **09** | **Registers & Clipboard** | Named registers (`"a-z`) for multiple clipboards | The Black Hole register (`"_d`) to preserve yanks | The Yank register (`"0p`) to recover past copies |
| **10** | **Macros & Automation** | Macro recording & playback (`qa ... q`, `@a`) | Repetitive replay (`@@`, `5@a`) | Batch Normal execution across lines (`:%norm`) |
| **11** | **Windows & Buffers** | Splits & Window navigation (`<C-w>s/v/h/j/k/l`) | Hidden buffer switching (`:bnext`, `:bprev`, `:b {name}`) | Window sizing & Pure Focus (`<C-w>=`, `<C-w>o`, `:only`) |
| **12** | **Global Commands & Sorcery** | Global filter deletes (`:g/pattern/d`, `:v/pattern/d`) | Global normal mode execution (`:g/TODO/norm I// `) | Expression register (`<C-r>=`) & Shell sorting (`!sort -u`) |

---

## 🖥️ Screen Layout & HUD

The screen is divided into a clean dual-pane split:

```
+---------------------------------------------+------------------------------------+
|  VIM MASTERY GAME :: PHASE 04 / 12          |  const data = [bad ugly broken     |
|  Topic: Operators & Repetition              |      "clean_data"];                |
|  Level: [BEGINNER] - Delete Operator        |  // JUNK LINE TO REMOVE            |
|---------------------------------------------|  return data;                      |
| [LEARN]                                     |                                    |
|   d is an operator: dw deletes word,        |  ~                                 |
|   dd deletes whole line. Prefix counts!     |  ~                                 |
| [MISSION]                                   |  ~                                 |
|   Delete 3 words with 3dw, and dd junk.     |  ~                                 |
| [TARGET OUTPUT]                             |  ~                                 |
| | const data = ["clean_data"];              |  ~                                 |
| | return data;                              |  ~                                 |
|---------------------------------------------|  ~                                 |
| Strokes: 7 | Par: 7 | Medal: ★★★ GOLD       |  ~                                 |
| Habit Enforcer: Arrow keys [BLOCKED]        |  ~                                 |
|---------------------------------------------+------------------------------------+
```

- **Left Pane (HUD)**: Read-only live guidance displaying concept, mission, target output preview, live keystroke counter, par threshold, medal tier, and expandable hint.
- **Right Pane (Playground)**: Interactive workspace where you execute commands.
- **Habit Enforcer**: Arrow keys and mouse clicks are actively blocked with friendly guidance to ensure genuine Vim muscle memory develops.

---

## 🕹️ In-Game Controls

Inside any level, the `<Leader>` key is set to `<Space>`:

| Keybinding | Action |
|---|---|
| `<Space>r` | **Reset Level** (reloads initial text and resets stroke counter) |
| `<Space>h` | **Toggle Hint** (reveals optimal command sequence) |
| `<Space>m` | **Campaign Map** (opens the interactive 36-level dashboard) |
| `<Space>n` | **Next Level** (advances to the next sub-level or phase) |
| `<Space>p` | **Previous Level** |
| `<Enter>` | **Advance** (when level is cleared) |
| `<Space>q` | **Save & Quit** |

---

## 🏆 Scoring & Medals

Levels are evaluated using **Vim Golf Par scoring**:

- **Gold Medal (★★★)**: Finished at or below the optimal Par keystroke count.
- **Silver Medal (★★☆)**: Finished within 6 strokes of Par.
- **Bronze Medal (★☆☆)**: Finished above Silver threshold.

Your best scores and highest medals are automatically saved to `~/.vimgame_save.json`.

---

## 📦 Using as a Standard Vim Plugin

If you want to use the game inside your regular Vim setup:

1. Clone or symlink this directory into your Vim package path:
   ```bash
   mkdir -p ~/.vim/pack/games/start
   ln -s "$(pwd)" ~/.vim/pack/games/start/vim_game
   ```
2. Open Vim and type:
   ```vim
   :VimGame
   ```
   Or jump to any level directly:
   ```vim
   :VimGameLevel 6 intermediate
   ```

---

## 🧪 Testing

Run the automated headless test suite verifying all 12 phases and 36 sub-levels:

```bash
vim --clean -Nu runtime/vimgamerc -c "autocmd! VimEnter *" -c "source tests/test_levels.vim"
```
