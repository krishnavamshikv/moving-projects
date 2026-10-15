" autoload/vimgame/levels.vim
" Comprehensive 12-Phase / 36-Sublevel Curriculum for Vim Mastery Game

let s:phases = [
      \ {'id': 1, 'name': 'Basic Navigation & Counts', 'desc': 'Moving without arrow keys, word hops, count multipliers, and line jumps'},
      \ {'id': 2, 'name': 'Insertion & Basic Edits', 'desc': 'Entering insert mode, opening lines, single-char edits, and undo/redo'},
      \ {'id': 3, 'name': 'Precision Motions', 'desc': 'Character search (f/F/t/T), bracket matching (%), and identifier search (*)'},
      \ {'id': 4, 'name': 'Operators & Repetition', 'desc': 'Verb + Noun grammar (d/c/y), count operators, and the power of the dot (.) command'},
      \ {'id': 5, 'name': 'Visual & Block Modes', 'desc': 'Character visual, line visual, and columnar block editing (<C-v>)'},
      \ {'id': 6, 'name': 'Text Objects Mastery', 'desc': 'Operating inside and around words, quotes, brackets, and tags (iw, i", i(, it)'},
      \ {'id': 7, 'name': 'Search & Substitution', 'desc': 'Pattern navigation (/, ?, n, N) and search-and-replace (:s, :%s)'},
      \ {'id': 8, 'name': 'Marks & Jump Lists', 'desc': 'Teleporting with marks (ma, ''a), jump history (<C-o>, <C-i>), and changelist (g;)'},
      \ {'id': 9, 'name': 'Registers & Clipboard', 'desc': 'Named registers ("a), black-hole register ("_), and yank preservation ("0)'},
      \ {'id': 10, 'name': 'Macros & Automation', 'desc': 'Recording keystrokes (qa), replaying (@a, @@), and batch execution with :norm'},
      \ {'id': 11, 'name': 'Windows & Buffers', 'desc': 'Splits (<C-w>s/v/w), buffer switches (:bnext/:bprev), and window organization'},
      \ {'id': 12, 'name': 'Global Commands & Sorcery', 'desc': 'Filtering with :g and :v, expression register (<C-r>=), and Unix pipes (!sort)'}
      \ ]

let s:levels = {}

" Helper to register level
function! s:reg(phase, diff, data) abort
  let a:data.phase = a:phase
  let a:data.difficulty = a:diff
  let l:key = printf('%d_%s', a:phase, a:diff)
  let s:levels[l:key] = a:data
endfunction

" ==============================================================================
" PHASE 1: Basic Navigation & Counts
" ==============================================================================
call s:reg(1, 'beginner', {
      \ 'title': 'The Four Cardinal Directions',
      \ 'concept': 'Vim navigation keeps your hands on the home row: h (left), j (down), k (up), l (right). Arrow keys are disabled!',
      \ 'instruction': 'Navigate your cursor from the START position [S] to the GOAL treasure [X] following the open pathway. Avoid the walls (#).',
      \ 'type': 'cursor',
      \ 'initial_text': [
      \   '####################',
      \   '#S....             #',
      \   '#    .             #',
      \   '#    ...           #',
      \   '#      .           #',
      \   '#      ...X        #',
      \   '####################'
      \ ],
      \ 'start_pos': [2, 2],
      \ 'target_pos': [6, 11],
      \ 'par': 17,
      \ 'hint': 'Use l to move right, j to move down, k for up, h for left. Follow the dots strictly.'
      \ })

call s:reg(1, 'intermediate', {
      \ 'title': 'Word Hops & Count Multipliers',
      \ 'concept': 'w hops forward to the start of the next word, b hops back, e hops to end of word. You can prefix counts: 5l moves 5 chars right, 3w hops 3 words forward!',
      \ 'instruction': 'Hop across the code line to land on the function parameter [SECRET_KEY] in as few strokes as possible.',
      \ 'type': 'cursor',
      \ 'initial_text': [
      \   '// Jump forward efficiently using word motions and count multipliers',
      \   'function authenticate(const string& username, const string& SECRET_KEY, int permissions) {',
      \   '    return verify_hash(SECRET_KEY);',
      \   '}'
      \ ],
      \ 'start_pos': [2, 1],
      \ 'target_pos': [2, 61],
      \ 'target_word': 'SECRET_KEY',
      \ 'par': 4,
      \ 'hint': 'Count words! Try "7w" or "6w" (or "fS") to jump to SECRET_KEY instantly.'
      \ })

call s:reg(1, 'hard', {
      \ 'title': 'Exact Line Leaps & Extremities',
      \ 'concept': ':10 or 10G jumps directly to line 10. gg jumps to the very top, G to the bottom. 0 jumps to column 1, ^ jumps to first non-blank char, $ jumps to line end.',
      \ 'instruction': 'The document has 25 lines. You start at line 1. Jump directly to Line 19 and land on the last character of that line ($).',
      \ 'type': 'cursor',
      \ 'initial_text': [
      \   '// Line 1: Header file imports',
      \   '#include <iostream>',
      \   '#include <vector>',
      \   '#include <string>',
      \   '',
      \   'struct Player {',
      \   '    std::string name;',
      \   '    int score;',
      \   '    int level;',
      \   '};',
      \   '',
      \   'class GameManager {',
      \   'public:',
      \   '    GameManager();',
      \   '    void initialize();',
      \   '    void render();',
      \   '    void update();',
      \   '    void shutdown();',
      \   '    const std::string& get_target_signature() const;',
      \   'private:',
      \   '    std::vector<Player> players;',
      \   '    bool is_running;',
      \   '};',
      \   '',
      \   '// End of declaration'
      \ ],
      \ 'start_pos': [1, 1],
      \ 'target_pos': [19, 52],
      \ 'par': 4,
      \ 'hint': 'Type "19G" (or ":19<CR>") to leap directly to line 19, then press "$" to snap to the end of the line.'
      \ })

" ==============================================================================
" PHASE 2: Insertion & Basic Edits
" ==============================================================================
call s:reg(2, 'beginner', {
      \ 'title': 'Insert vs Append',
      \ 'concept': 'i inserts BEFORE the cursor, a appends AFTER the cursor. I inserts at the line start (first non-blank), A appends at the line end.',
      \ 'instruction': 'Fix the greeting by inserting "Hello " at the beginning of the line and appending " World!" at the end.',
      \ 'type': 'buffer',
      \ 'initial_text': [
      \   'Vim'
      \ ],
      \ 'target_text': [
      \   'Hello Vim World!'
      \ ],
      \ 'start_pos': [1, 1],
      \ 'par': 22,
      \ 'hint': 'Press I, type "Hello ", press <Esc>, then press A, type " World!", press <Esc>.'
      \ })

call s:reg(2, 'intermediate', {
      \ 'title': 'Opening Lines & Instant Replacement',
      \ 'concept': 'o opens a new line BELOW and enters Insert mode. O opens a line ABOVE. r replaces the single character under the cursor without entering Insert mode. s deletes the char and enters Insert.',
      \ 'instruction': 'Fix the typo "conzt" -> "const" using "r", and insert a missing return statement below using "o".',
      \ 'type': 'buffer',
      \ 'initial_text': [
      \   'function calculateTotal(items) {',
      \   '    conzt tax = 0.08;',
      \   '}'
      \ ],
      \ 'target_text': [
      \   'function calculateTotal(items) {',
      \   '    const tax = 0.08;',
      \   '    return items * (1 + tax);',
      \   '}'
      \ ],
      \ 'start_pos': [2, 8],
      \ 'par': 34,
      \ 'hint': 'Put cursor on "z", type "rs" to replace it with "s". Then type "o" to open a newline below and type "return items * (1 + tax);". Press <Esc>.'
      \ })

call s:reg(2, 'hard', {
      \ 'title': 'Character Sniping & Undo Chaining',
      \ 'concept': 'x deletes the char under cursor, X deletes before cursor. u undos your last change, <C-r> redoes. Use u when you make mistakes!',
      \ 'instruction': 'Delete the intrusive stray "X" characters throughout this list of fruits without altering the genuine letters.',
      \ 'type': 'buffer',
      \ 'initial_text': [
      \   'apXple',
      \   'baXnana',
      \   'chXerry',
      \   'oraXnge'
      \ ],
      \ 'target_text': [
      \   'apple',
      \   'banana',
      \   'cherry',
      \   'orange'
      \ ],
      \ 'start_pos': [1, 3],
      \ 'par': 12,
      \ 'hint': 'Move cursor over each "X" and press "x". (Bonus tip: "x" then "j" then "." repeats!)'
      \ })

" ==============================================================================
" PHASE 3: Precision Motions
" ==============================================================================
call s:reg(3, 'beginner', {
      \ 'title': 'In-Line Character Search (f and F)',
      \ 'concept': 'f{char} jumps forward to the next occurrence of {char} on the current line. F{char} jumps backwards. Combine with counts: 2fa jumps to the 2nd "a".',
      \ 'instruction': 'Teleport your cursor to the letter "Q" in this long string in a single motion.',
      \ 'type': 'cursor',
      \ 'initial_text': [
      \   'abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      \ ],
      \ 'start_pos': [1, 1],
      \ 'target_pos': [1, 53],
      \ 'par': 2,
      \ 'hint': 'Type "fQ" to leap directly to the capital Q in only 2 keystrokes!'
      \ })

call s:reg(3, 'intermediate', {
      \ 'title': 'Till & Repeat (t, T, ;, ,)',
      \ 'concept': 't{char} jumps till just BEFORE {char}. ; repeats the last f/F/t/T search forward, and , repeats it backward.',
      \ 'instruction': 'Move your cursor to the comma right before "database_url", then hop along each parameter delimiter using ";" until reaching the closing parenthesis.',
      \ 'type': 'cursor',
      \ 'initial_text': [
      \   'connect(api_key, auth_token, database_url, timeout_ms, retry_count);'
      \ ],
      \ 'start_pos': [1, 1],
      \ 'target_pos': [1, 67],
      \ 'par': 6,
      \ 'hint': 'Type "t," to jump before the first comma, then use ";" to repeat the jump forward across each comma, then "f)" to hit the parenthesis.'
      \ })

call s:reg(3, 'hard', {
      \ 'title': 'Bracket Matching & Identifier Search (%, *, #)',
      \ 'concept': '% hops to the matching bracket (), {}, []. * jumps to the next occurrence of the word under cursor, # jumps to the previous occurrence.',
      \ 'instruction': 'From the opening brace of "outer_fn", use % to jump to its closing brace, then use * to jump to the next "MATCH_TARGET".',
      \ 'type': 'cursor',
      \ 'initial_text': [
      \   'void outer_fn() {',
      \   '    int MATCH_TARGET = 100;',
      \   '    if (check()) {',
      \   '        do_work();',
      \   '    }',
      \   '}',
      \   'void helper() {',
      \   '    verify(MATCH_TARGET);',
      \   '}'
      \ ],
      \ 'start_pos': [1, 17],
      \ 'target_pos': [8, 12],
      \ 'target_word': 'MATCH_TARGET',
      \ 'par': 4,
      \ 'hint': 'Press "%" to snap from the opening brace on line 1 to the closing brace on line 6. Then jump to line 2 or use "/" or "*" to find MATCH_TARGET.'
      \ })

" ==============================================================================
" PHASE 4: Operators & Count Repetition
" ==============================================================================
call s:reg(4, 'beginner', {
      \ 'title': 'Delete Operator & Multipliers',
      \ 'concept': 'd is an operator: dw deletes a word, d$ deletes to end of line, dd deletes a whole line. Prefix with count: 3dw deletes 3 words, 2dd deletes 2 lines.',
      \ 'instruction': 'Delete the 3 bad words ("bad ugly broken") and delete the commented junk line using count operators.',
      \ 'type': 'buffer',
      \ 'initial_text': [
      \   'const data = [bad ugly broken "clean_data"];',
      \   '// JUNK LINE TO REMOVE',
      \   'return data;'
      \ ],
      \ 'target_text': [
      \   'const data = ["clean_data"];',
      \   'return data;'
      \ ],
      \ 'start_pos': [1, 15],
      \ 'par': 7,
      \ 'hint': 'Place cursor on "bad" and type "3dw" (or "d3w") to delete all 3 words at once, then "jdd" to delete the junk line.'
      \ })

call s:reg(4, 'intermediate', {
      \ 'title': 'Change Operator (c, ciw, C)',
      \ 'concept': 'c deletes the motion and immediately switches into Insert mode! cw changes word, cc changes whole line, C changes to line end.',
      \ 'instruction': 'Change the error message "failed unexpectedly" to "succeeded" using C, and change "status_error" to "status_ok" using cw.',
      \ 'type': 'buffer',
      \ 'initial_text': [
      \   'let status = status_error;',
      \   'let msg = "failed unexpectedly";'
      \ ],
      \ 'target_text': [
      \   'let status = status_ok;',
      \   'let msg = "succeeded";'
      \ ],
      \ 'start_pos': [1, 14],
      \ 'par': 28,
      \ 'hint': 'Type "cwstatus_ok<Esc>", then "jf\"" then "Csucceeded\";<Esc>".'
      \ })

call s:reg(4, 'hard', {
      \ 'title': 'The Holy Dot (.) Command',
      \ 'concept': 'The dot command (.) repeats your last change! Combine with motions like j or n to perform lightning-fast batch edits.',
      \ 'instruction': 'Append a semicolon ";" to the end of all 4 lines. Execute the change ONCE on line 1, then repeat with . across the others.',
      \ 'type': 'buffer',
      \ 'initial_text': [
      \   'const a = 1',
      \   'const b = 2',
      \   'const c = 3',
      \   'const d = 4'
      \ ],
      \ 'target_text': [
      \   'const a = 1;',
      \   'const b = 2;',
      \   'const c = 3;',
      \   'const d = 4;'
      \ ],
      \ 'start_pos': [1, 1],
      \ 'par': 10,
      \ 'hint': 'Type "A;<Esc>" on line 1. Then press "j." then "j." then "j.". Total strokes: under 10!'
      \ })

" ==============================================================================
" PHASE 5: Visual & Block Modes
" ==============================================================================
call s:reg(5, 'beginner', {
      \ 'title': 'Character Visual Mode (v)',
      \ 'concept': 'v enters Character Visual mode. Highlight text with motions (w, e, $, f) and press d to delete, y to yank, or c to replace.',
      \ 'instruction': 'Highlight the text inside the parentheses "DEBUG_MODE_EXTRA_VERBOSE" with v and delete it.',
      \ 'type': 'buffer',
      \ 'initial_text': [
      \   'initialize_system(DEBUG_MODE_EXTRA_VERBOSE);'
      \ ],
      \ 'target_text': [
      \   'initialize_system();'
      \ ],
      \ 'start_pos': [1, 19],
      \ 'par': 7,
      \ 'hint': 'Cursor is at "D". Press "v", then "t)" to highlight up to the parenthesis, then "d" to delete.'
      \ })

call s:reg(5, 'intermediate', {
      \ 'title': 'Line Visual Mode (V)',
      \ 'concept': 'V enters Line Visual mode. Select whole lines at once. Press > to indent, < to unindent, d to delete, or p to replace.',
      \ 'instruction': 'Select the 3 inner lines of the function using V, and indent them by one level using ">".',
      \ 'type': 'buffer',
      \ 'initial_text': [
      \   'function run() {',
      \   'let x = 10;',
      \   'let y = 20;',
      \   'return x + y;',
      \   '}'
      \ ],
      \ 'target_text': [
      \   'function run() {',
      \   '    let x = 10;',
      \   '    let y = 20;',
      \   '    return x + y;',
      \   '}'
      \ ],
      \ 'start_pos': [2, 1],
      \ 'par': 4,
      \ 'hint': 'Press "V", press "2j" to select all 3 lines, then press ">".'
      \ })

call s:reg(5, 'hard', {
      \ 'title': 'Visual Block Mode (<C-v>) Multi-Cursor Magic',
      \ 'concept': '<C-v> enters Visual Block mode. Select a vertical rectangular column! Press "I" to insert at column start, type your text, then press <Esc> to apply to all lines.',
      \ 'instruction': 'Prepend "// " to comment out all 4 lines simultaneously using Visual Block insert.',
      \ 'type': 'buffer',
      \ 'initial_text': [
      \   'step_one();',
      \   'step_two();',
      \   'step_three();',
      \   'step_four();'
      \ ],
      \ 'target_text': [
      \   '// step_one();',
      \   '// step_two();',
      \   '// step_three();',
      \   '// step_four();'
      \ ],
      \ 'start_pos': [1, 1],
      \ 'par': 8,
      \ 'hint': 'Press <C-v>, then "3j" to select the column down. Press "I" (capital I), type "// ", then hit <Esc>!'
      \ })

" ==============================================================================
" PHASE 6: Text Objects Mastery
" ==============================================================================
call s:reg(6, 'beginner', {
      \ 'title': 'Word Objects (iw and aw)',
      \ 'concept': 'Text objects let you operate on words regardless of cursor position! "iw" is inner word, "aw" is a word (including trailing space). "ciw" changes word, "daw" deletes word.',
      \ 'instruction': 'Replace the word "REPLACE_ME" with "ACTIVE" using "ciw" without navigating to the first character.',
      \ 'type': 'buffer',
      \ 'initial_text': [
      \   'status = STATE_REPLACE_ME_NOW;'
      \ ],
      \ 'target_text': [
      \   'status = STATE_ACTIVE_NOW;'
      \ ],
      \ 'start_pos': [1, 18],
      \ 'par': 12,
      \ 'hint': 'Cursor is in the middle of REPLACE_ME. Just type "ciwACTIVE<Esc>"!'
      \ })

call s:reg(6, 'intermediate', {
      \ 'title': 'Quote & Delimiter Objects (i", a", i'')',
      \ 'concept': 'i" targets everything inside double quotes. a" includes the quotes. "ci"" rewrites string contents instantly without touching quotes!',
      \ 'instruction': 'Change the string contents from "temporary placeholder text" to "production url" using "ci\"".',
      \ 'type': 'buffer',
      \ 'initial_text': [
      \   'const API_ENDPOINT = "temporary placeholder text";'
      \ ],
      \ 'target_text': [
      \   'const API_ENDPOINT = "production url";'
      \ ],
      \ 'start_pos': [1, 1],
      \ 'par': 19,
      \ 'hint': 'Type "ci\"production url<Esc>". Vim automatically finds the quotes on the line!'
      \ })

call s:reg(6, 'hard', {
      \ 'title': 'Brackets & Tag Objects (ci(, da{, cit)',
      \ 'concept': 'i( or i) selects inside parentheses, i{ or iB inside braces, and it selects inside XML/HTML tags. "da{" deletes the braces and their content.',
      \ 'instruction': 'Empty the contents of the inner <span> tag using "cit", leaving empty <span></span>.',
      \ 'type': 'buffer',
      \ 'initial_text': [
      \   '<div class="card">',
      \   '    <span class="badge">OLD DEPRECATED CONTENT</span>',
      \   '</div>'
      \ ],
      \ 'target_text': [
      \   '<div class="card">',
      \   '    <span class="badge"></span>',
      \   '</div>'
      \ ],
      \ 'start_pos': [2, 30],
      \ 'par': 5,
      \ 'hint': 'With cursor inside the span, type "cit<Esc>" (or "dit"). Instant surgical deletion!'
      \ })

" ==============================================================================
" PHASE 7: Search & Substitution
" ==============================================================================
call s:reg(7, 'beginner', {
      \ 'title': 'Forward & Backward Search (/, ?, n, N)',
      \ 'concept': '/{pattern} searches forward, ?{pattern} searches backward. n repeats search in same direction, N in opposite direction.',
      \ 'instruction': 'Search for "TREASURE" using / and jump to its third occurrence in the document.',
      \ 'type': 'cursor',
      \ 'initial_text': [
      \   '1: Here is a stone',
      \   '2: TREASURE chest is empty',
      \   '3: Some more stones and sand',
      \   '4: Another fake TREASURE box',
      \   '5: Keep walking through the ruins',
      \   '6: The real TREASURE is here!'
      \ ],
      \ 'start_pos': [1, 1],
      \ 'target_pos': [6, 13],
      \ 'target_word': 'TREASURE',
      \ 'par': 12,
      \ 'hint': 'Type "/TREASURE<CR>", then press "n" to hit the second, then "n" again to reach the third.'
      \ })

call s:reg(7, 'intermediate', {
      \ 'title': 'Current Line Substitution (:s/old/new/g)',
      \ 'concept': ':s/target/replacement/g substitutes every match on the current line. The "g" flag replaces globally across the line.',
      \ 'instruction': 'Replace all occurrences of "var" with "const" on the current line using :s.',
      \ 'type': 'buffer',
      \ 'initial_text': [
      \   'var x = 1; var y = 2; var z = 3;'
      \ ],
      \ 'target_text': [
      \   'const x = 1; const y = 2; const z = 3;'
      \ ],
      \ 'start_pos': [1, 1],
      \ 'par': 18,
      \ 'hint': 'Type ":s/var/const/g<CR>".'
      \ })

call s:reg(7, 'hard', {
      \ 'title': 'Global Buffer Substitution & Regex Ranges (:%s)',
      \ 'concept': ':%s/old/new/g replaces throughout the entire file. Use regex capture groups \(...\) and \1 to rearrange text!',
      \ 'instruction': 'Convert all "key: value" lines into JSON format "\"key\": \"value\"," using a single :%s command.',
      \ 'type': 'buffer',
      \ 'initial_text': [
      \   'name: Alice',
      \   'role: Admin',
      \   'city: Zurich'
      \ ],
      \ 'target_text': [
      \   '"name": "Alice",',
      \   '"role": "Admin",',
      \   '"city": "Zurich",'
      \ ],
      \ 'start_pos': [1, 1],
      \ 'par': 35,
      \ 'hint': 'Type ":%s/\v(\w+): (\w+)/\"\1\": \"\2\",/<CR>" (or using standard regex "\(\w\+\)").'
      \ })

" ==============================================================================
" PHASE 8: Marks & Jump Lists
" ==============================================================================
call s:reg(8, 'beginner', {
      \ 'title': 'Local Marks (m{a-z} and ''{a-z})',
      \ 'concept': 'ma sets mark "a" at current cursor. ''a jumps to line of mark "a", `a jumps to exact line and column of mark "a".',
      \ 'instruction': 'Mark your starting position with "ma". Then jump down to inspect line 15, and teleport back to mark a using `a or ''a.',
      \ 'type': 'cursor',
      \ 'initial_text': [
      \   '// Start Anchor Point (create mark ma here)',
      \   'int root_config = 42;',
      \   '// Line 3',
      \   '// Line 4',
      \   '// Line 5',
      \   '// Line 6',
      \   '// Line 7',
      \   '// Line 8',
      \   '// Line 9',
      \   '// Line 10',
      \   '// Line 11',
      \   '// Line 12',
      \   '// Line 13',
      \   '// Line 14',
      \   '// Line 15: Checkpoint reached'
      \ ],
      \ 'start_pos': [1, 5],
      \ 'checkpoint_line': 15,
      \ 'target_line': 1,
      \ 'target_pos': [1, 5],
      \ 'par': 9,
      \ 'hint': 'Press "ma", jump down with "15G", then snap back with "`a" or "''a".'
      \ })

call s:reg(8, 'intermediate', {
      \ 'title': 'Jump List & Changelist (<C-o>, <C-i>, g;)',
      \ 'concept': 'Vim remembers your jump history! <C-o> jumps backward in time, <C-i> jumps forward. g; jumps to the last modified location.',
      \ 'instruction': 'Jump to line 8 with 8G, jump to line 1 with gg, then return to line 8 using <C-o>.',
      \ 'type': 'cursor',
      \ 'initial_text': [
      \   '// Step 1: Top of file',
      \   '// Step 2',
      \   '// Step 3',
      \   '// Step 4',
      \   '// Step 5',
      \   '// Step 6',
      \   '// Step 7',
      \   '// Step 8: TARGET CHECKPOINT'
      \ ],
      \ 'start_pos': [1, 1],
      \ 'target_pos': [8, 1],
      \ 'par': 5,
      \ 'hint': 'Type "8G", then "gg", then press "<C-o>" to return straight to line 8!'
      \ })

call s:reg(8, 'hard', {
      \ 'title': 'The Backtick-Backtick Snap (``)',
      \ 'concept': '`` returns to the exact position before your last jump. Combine with / search or G leaps for instant two-way context switching.',
      \ 'instruction': 'Search for "NEEDLE" with /NEEDLE, then instantly bounce back to your starting line using ``.',
      \ 'type': 'cursor',
      \ 'initial_text': [
      \   'function source_anchor() {',
      \   '    // Origin cursor is right here',
      \   '    run_tests();',
      \   '}',
      \   '',
      \   'function far_away() {',
      \   '    int NEEDLE = 999;',
      \   '}'
      \ ],
      \ 'start_pos': [2, 10],
      \ 'checkpoint_line': 7,
      \ 'target_line': 2,
      \ 'target_pos': [2, 10],
      \ 'par': 10,
      \ 'hint': 'Type "/NEEDLE<CR>" to jump to the needle, then press "``" to bounce back.'
      \ })

" ==============================================================================
" PHASE 9: Registers & Clipboard
" ==============================================================================
call s:reg(9, 'beginner', {
      \ 'title': 'Named Registers ("a through "z)',
      \ 'concept': 'Prefix any delete or yank with "{reg} to save to a specific register! "ayw yanks word into register a. "ap pastes from register a.',
      \ 'instruction': 'Yank "ALPHA" into register a ("ayw) and "BETA" into register b ("byw), then paste them into the target line.',
      \ 'type': 'buffer',
      \ 'initial_text': [
      \   'ALPHA',
      \   'BETA',
      \   'Result: '
      \ ],
      \ 'target_text': [
      \   'ALPHA',
      \   'BETA',
      \   'Result: ALPHA BETA'
      \ ],
      \ 'start_pos': [1, 1],
      \ 'par': 17,
      \ 'hint': '"ayw to yank ALPHA. "j" to line 2. "byw to yank BETA. "j$" then "\"ap" then "a <Esc>" then "\"bp".'
      \ })

call s:reg(9, 'intermediate', {
      \ 'title': 'The Black Hole Register ("_)',
      \ 'concept': 'Deleting normally overwrites the unnamed register. Use the black hole register "_d to delete text without losing your yanked snippet!',
      \ 'instruction': 'Yank "PRESERVED", delete "RUBBISH" using the black hole register "_dw, and paste "PRESERVED" over "REPLACE".',
      \ 'type': 'buffer',
      \ 'initial_text': [
      \   'PRESERVED',
      \   'RUBBISH',
      \   'REPLACE'
      \ ],
      \ 'target_text': [
      \   'PRESERVED',
      \   'REPLACE',
      \   'PRESERVED'
      \ ],
      \ 'start_pos': [1, 1],
      \ 'par': 14,
      \ 'hint': 'Yank line 1 with "yy". Move to line 2, delete line with "\"_dd". Move down to line 3 and paste below with "p".'
      \ })

call s:reg(9, 'hard', {
      \ 'title': 'The Yank Register ("0)',
      \ 'concept': 'Register 0 always holds the most recently YANKED text, even if you subsequently delete other text with d or x! "0p pastes it.',
      \ 'instruction': 'Yank the secret key "xyz123", then delete the two decoy lines with dd, and paste the secret key on line 2 using "0p.',
      \ 'type': 'buffer',
      \ 'initial_text': [
      \   'SECRET: xyz123',
      \   'DECOY LINE ONE',
      \   'DECOY LINE TWO',
      \   'Config: '
      \ ],
      \ 'target_text': [
      \   'SECRET: xyz123',
      \   'Config: xyz123'
      \ ],
      \ 'start_pos': [1, 9],
      \ 'par': 16,
      \ 'hint': 'Type "yiw" to yank xyz123. Move down and "2dd" to delete the decoys. Then "$" and "\"0p" to paste from register 0.'
      \ })

" ==============================================================================
" PHASE 10: Macros & Automation
" ==============================================================================
call s:reg(10, 'beginner', {
      \ 'title': 'Macro Recording & Playback (qa ... q, @a)',
      \ 'concept': 'qa begins recording your actions into register a. q stops recording. @a replays the macro!',
      \ 'instruction': 'Record a macro that wraps a line in double quotes, and replay it on the second line.',
      \ 'type': 'buffer',
      \ 'initial_text': [
      \   'first_item',
      \   'second_item'
      \ ],
      \ 'target_text': [
      \   '"first_item"',
      \   '"second_item"'
      \ ],
      \ 'start_pos': [1, 1],
      \ 'par': 15,
      \ 'hint': 'Type "qaI\"<Esc>A\"<Esc>q" on line 1. Then "j@a" on line 2.'
      \ })

call s:reg(10, 'intermediate', {
      \ 'title': 'Repetition & Consecutive Replay (@@, 5@a)',
      \ 'concept': '@@ replays the most recently executed macro. You can also prefix with a count: 3@a executes macro "a" three times!',
      \ 'instruction': 'Record a macro on item 1 to prepend "- " and append ";", then run it across the remaining 3 items in one command.',
      \ 'type': 'buffer',
      \ 'initial_text': [
      \   'apple',
      \   'banana',
      \   'cherry',
      \   'date'
      \ ],
      \ 'target_text': [
      \   '- apple;',
      \   '- banana;',
      \   '- cherry;',
      \   '- date;'
      \ ],
      \ 'start_pos': [1, 1],
      \ 'par': 18,
      \ 'hint': 'Type "qaI- <Esc>A;<Esc>jq" on line 1. Then type "3@a" to process the remaining lines automatically!'
      \ })

call s:reg(10, 'hard', {
      \ 'title': 'Batch Normal Mode Execution (:norm)',
      \ 'concept': ':\''<,\''>norm @a or :%norm executes a normal mode sequence across every line in a range! Lightning speed for large refactors.',
      \ 'instruction': 'Format all 4 data rows into markdown checklist items "[ ] {item}" using a single ":%norm I[ ] " command.',
      \ 'type': 'buffer',
      \ 'initial_text': [
      \   'Buy groceries',
      \   'Finish report',
      \   'Push commits',
      \   'Review PRs'
      \ ],
      \ 'target_text': [
      \   '[ ] Buy groceries',
      \   '[ ] Finish report',
      \   '[ ] Push commits',
      \   '[ ] Review PRs'
      \ ],
      \ 'start_pos': [1, 1],
      \ 'par': 15,
      \ 'hint': 'Type ":%norm I[ ] <CR>". All lines update simultaneously!'
      \ })

" ==============================================================================
" PHASE 11: Windows & Buffers
" ==============================================================================
call s:reg(11, 'beginner', {
      \ 'title': 'Window Splits & Navigation (<C-w>)',
      \ 'concept': '<C-w>s splits horizontally, <C-w>v splits vertically. <C-w>h/j/k/l jumps between windows, and <C-w>c closes the current window.',
      \ 'instruction': 'Split your window vertically with ":vsplit", jump into the new split with <C-w>l, and type "SPLIT_ACTIVE" on line 1.',
      \ 'type': 'buffer',
      \ 'initial_text': [
      \   'ORIGINAL'
      \ ],
      \ 'target_text': [
      \   'SPLIT_ACTIVE'
      \ ],
      \ 'start_pos': [1, 1],
      \ 'par': 22,
      \ 'hint': 'Type ":vsplit<CR>", <C-w>l, then "ccSPLIT_ACTIVE<Esc>". (Note: both splits share the buffer, so changes sync!)'
      \ })

call s:reg(11, 'intermediate', {
      \ 'title': 'Buffer Switching (:bnext, :bprev, :ls)',
      \ 'concept': ':ls lists all loaded buffers. :bnext (:bn) switches to next buffer, :bprev (:bp) to previous. You can also jump by name: :b {name}.',
      \ 'instruction': 'A hidden buffer named "secret_token" is loaded in the background. Switch to it using ":b secret_token" to discover the passkey.',
      \ 'type': 'cursor',
      \ 'initial_text': [
      \   '// Active Buffer: index.js',
      \   '// Use :b secret_token to switch to the hidden buffer!'
      \ ],
      \ 'start_pos': [1, 1],
      \ 'target_pos': [1, 1],
      \ 'custom_setup': 'call vimgame#engine#setup_phase11_buffer()',
      \ 'par': 18,
      \ 'hint': 'Type ":b secret_token<CR>".'
      \ })

call s:reg(11, 'hard', {
      \ 'title': 'Window Sizing & Only (<C-w>=, <C-w>o)',
      \ 'concept': '<C-w>o (:only) closes all other windows except the current one! <C-w>= equalizes sizes. Use :only when you want pure focus.',
      \ 'instruction': 'Multiple clutter splits have opened. Clean up the screen by closing all other windows using <C-w>o or :only.',
      \ 'type': 'window_only',
      \ 'initial_text': [
      \   '// Workspace is cluttered with splits. Make this window the ONLY one!'
      \ ],
      \ 'custom_setup': 'call vimgame#engine#setup_phase11_splits()',
      \ 'start_pos': [1, 1],
      \ 'par': 3,
      \ 'hint': 'Press "<C-w>o" (or type ":only<CR>").'
      \ })

" ==============================================================================
" PHASE 12: Global Commands & Sorcery
" ==============================================================================
call s:reg(12, 'beginner', {
      \ 'title': 'The Global Filter (:g/pattern/d)',
      \ 'concept': ':g/pattern/d deletes all lines matching pattern! :v/pattern/d (or :g!/pattern/d) deletes all lines NOT matching pattern.',
      \ 'instruction': 'Delete all debugging log lines containing "DEBUG:" using a single :g command.',
      \ 'type': 'buffer',
      \ 'initial_text': [
      \   'DEBUG: sensor initialized',
      \   'target_value = 100;',
      \   'DEBUG: temperature 42C',
      \   'process_target(target_value);',
      \   'DEBUG: shutdown sequence'
      \ ],
      \ 'target_text': [
      \   'target_value = 100;',
      \   'process_target(target_value);'
      \ ],
      \ 'start_pos': [1, 1],
      \ 'par': 12,
      \ 'hint': 'Type ":g/DEBUG/d<CR>". Done in one command!'
      \ })

call s:reg(12, 'intermediate', {
      \ 'title': 'Global Normal Execution (:g/pattern/norm ...)',
      \ 'concept': ':g/pattern/norm {commands} executes normal mode commands on every matching line! A staple of high-level Vim productivity.',
      \ 'instruction': 'Find all lines with "TODO:" and comment them out using ":g/TODO/norm I// ".',
      \ 'type': 'buffer',
      \ 'initial_text': [
      \   'function build() {',
      \   '    TODO: check cache',
      \   '    compile_sources();',
      \   '    TODO: upload artifacts',
      \   '    return true;',
      \   '}'
      \ ],
      \ 'target_text': [
      \   'function build() {',
      \   '    // TODO: check cache',
      \   '    compile_sources();',
      \   '    // TODO: upload artifacts',
      \   '    return true;',
      \   '}'
      \ ],
      \ 'start_pos': [1, 1],
      \ 'par': 18,
      \ 'hint': 'Type ":g/TODO/norm I// <CR>".'
      \ })

call s:reg(12, 'hard', {
      \ 'title': 'Expression Register & Shell Filters',
      \ 'concept': '<C-r>= evaluates math or Vim script expressions right in Insert or Command mode! And :%!sort -u passes the buffer through Unix utilities.',
      \ 'instruction': 'Sort and deduplicate these messy server names in place using the external filter "!sort -u" or ":sort u".',
      \ 'type': 'buffer',
      \ 'initial_text': [
      \   'zeta_node',
      \   'alpha_node',
      \   'beta_node',
      \   'alpha_node',
      \   'gamma_node'
      \ ],
      \ 'target_text': [
      \   'alpha_node',
      \   'beta_node',
      \   'gamma_node',
      \   'zeta_node'
      \ ],
      \ 'start_pos': [1, 1],
      \ 'par': 9,
      \ 'hint': 'Type ":sort u<CR>" (or ":%!sort -u<CR>").'
      \ })

" Public getters
function! vimgame#levels#get_phases() abort
  return s:phases
endfunction

function! vimgame#levels#get(phase, diff) abort
  let l:key = printf('%d_%s', a:phase, a:diff)
  return get(s:levels, l:key, {})
endfunction

function! vimgame#levels#all_keys() abort
  return keys(s:levels)
endfunction
