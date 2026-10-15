" runtime/syntax/vimgame_dashboard.vim
" Syntax highlighting for Vim Mastery Campaign Dashboard

if exists("b:current_syntax")
  finish
endif

syn match DashBorder "^[=\-+]\+$"
syn match DashTitle "V I M   M A S T E R Y.*"
syn match DashHeaderLine "^  PHASE |.*"
syn match DashGold "GOLD ★ (\d\+)"
syn match DashSilver "SILVER★(\d\+)"
syn match DashBronze "BRONZE★(\d\+)"
syn match DashReady "\[READY\]"
syn match DashKey "\[[a-zA-Z<>]\+\]"
syn match DashStar "★"

hi def link DashBorder Comment
hi def link DashTitle Title
hi def link DashHeaderLine Statement
hi def link DashGold Special
hi def link DashSilver String
hi def link DashBronze Comment
hi def link DashReady Identifier
hi def link DashKey Keyword
hi def link DashStar Special

let b:current_syntax = "vimgame_dashboard"
