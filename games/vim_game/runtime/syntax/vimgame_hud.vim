" runtime/syntax/vimgame_hud.vim
" Syntax highlighting for Vim Mastery Game HUD

if exists("b:current_syntax")
  finish
endif

syn match VimGameHeader "^===.*===$"
syn match VimGameDivider "^---.*---$"
syn match VimGameTitle "VIM MASTERY GAME.*"
syn match VimGameLabel "^\s*\[[A-Z ]\+\]"
syn match VimGameMedalGold "GOLD.*"
syn match VimGameMedalSilver "SILVER.*"
syn match VimGameMedalBronze "BRONZE.*"
syn match VimGameScore "Strokes: \d\+"
syn match VimGamePar "Par: \d\+"
syn match VimGameHabit "Arrow keys \[BLOCKED\]"
syn match VimGameVictory "^  \*.*LEVEL CLEARED.*\*  $"
syn match VimGameStar "★\+"

hi def link VimGameHeader Type
hi def link VimGameDivider Comment
hi def link VimGameTitle Title
hi def link VimGameLabel Keyword
hi def link VimGameScore Identifier
hi def link VimGamePar Constant
hi def link VimGameHabit WarningMsg
hi def link VimGameVictory ModeMsg
hi def link VimGameMedalGold Special
hi def link VimGameMedalSilver String
hi def link VimGameMedalBronze Comment
hi def link VimGameStar Special

let b:current_syntax = "vimgame_hud"
