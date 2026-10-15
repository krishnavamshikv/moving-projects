" autoload/vimgame/ui.vim
" UI & HUD renderer for Vim Mastery Game

let s:hud_buf = -1
let s:hud_win = -1
let s:play_buf = -1
let s:play_win = -1

function! vimgame#ui#get_play_win() abort
  return s:play_win
endfunction

function! vimgame#ui#get_hud_win() abort
  return s:hud_win
endfunction

function! vimgame#ui#setup_windows() abort
  " Wipe previous game buffers if they exist
  silent! bwipeout! [VimGame_Playground]
  silent! bwipeout! [VimGame_HUD]
  silent! only
  
  " Create play buffer first
  enew
  let s:play_buf = bufnr('%')
  let s:play_win = win_getid()
  setlocal buftype=acwrite
  setlocal noswapfile
  silent! file [VimGame_Playground]
  
  " Create left HUD window
  vertical topleft 46new
  let s:hud_buf = bufnr('%')
  let s:hud_win = win_getid()
  setlocal buftype=nofile
  setlocal bufhidden=wipe
  setlocal noswapfile
  setlocal nomodifiable
  setlocal nobuflisted
  setlocal nonumber
  setlocal norelativenumber
  setlocal signcolumn=no
  setlocal foldcolumn=0
  setlocal winfixwidth
  setlocal filetype=vimgame_hud
  silent! file [VimGame_HUD]
  
  " Return focus to play window
  call win_gotoid(s:play_win)
endfunction

function! vimgame#ui#render_hud(state) abort
  if !win_gotoid(s:hud_win)
    return
  endif

  let l:lvl = a:state.level
  let l:strokes = a:state.strokes
  let l:par = l:lvl.par
  let l:show_hint = a:state.show_hint
  let l:won = a:state.won
  
  " Calculate Medal
  let l:medal = '★★★ GOLD'
  let l:medal_type = 'gold'
  if l:strokes > l:par + 6
    let l:medal = '★☆☆ BRONZE'
    let l:medal_type = 'bronze'
  elseif l:strokes > l:par
    let l:medal = '★★☆ SILVER'
    let l:medal_type = 'silver'
  endif
  
  let l:diff_upper = toupper(l:lvl.difficulty)
  let l:lines = []
  
  " HUD Header
  call add(l:lines, '==============================================')
  call add(l:lines, printf('  VIM MASTERY GAME  ::  PHASE %02d / 12', l:lvl.phase))
  call add(l:lines, '==============================================')
  call add(l:lines, printf(' Topic: %s', a:state.phase_name))
  call add(l:lines, printf(' Level: [%s] - %s', l:diff_upper, l:lvl.title))
  call add(l:lines, '----------------------------------------------')
  
  " Concept & Instructions
  call add(l:lines, ' [LEARN]')
  for l:chunk in s:wrap_text(l:lvl.concept, 42)
    call add(l:lines, '   ' . l:chunk)
  endfor
  call add(l:lines, '')
  call add(l:lines, ' [MISSION]')
  for l:chunk in s:wrap_text(l:lvl.instruction, 42)
    call add(l:lines, '   ' . l:chunk)
  endfor
  call add(l:lines, '----------------------------------------------')
  
  " Target preview
  if l:lvl.type ==# 'buffer'
    call add(l:lines, ' [TARGET OUTPUT]')
    for l:tl in l:lvl.target_text
      call add(l:lines, ' | ' . l:tl)
    endfor
  elseif l:lvl.type ==# 'cursor'
    if has_key(l:lvl, 'target_word')
      call add(l:lines, printf(' [TARGET]: Land on [%s] (Line %d)', l:lvl.target_word, l:lvl.target_pos[0]))
    elseif has_key(l:lvl, 'checkpoint_line')
      call add(l:lines, printf(' [TARGET]: Visit Line %d, return to Line %d', l:lvl.checkpoint_line, get(l:lvl, 'target_line', l:lvl.target_pos[0])))
    elseif has_key(l:lvl, 'target_pos') && l:lvl.target_pos[1] >= 50 && l:lvl.phase == 1 && l:lvl.difficulty ==# 'hard'
      call add(l:lines, printf(' [TARGET]: End of Line %d (press $)', l:lvl.target_pos[0]))
    else
      call add(l:lines, printf(' [TARGET LOCATION]: Line %d, Col %d', l:lvl.target_pos[0], l:lvl.target_pos[1]))
    endif
  elseif l:lvl.type ==# 'window_only'
    call add(l:lines, ' [TARGET]: Make playground the ONLY window!')
  endif
  call add(l:lines, '----------------------------------------------')
  
  " Real-time Scorecard
  call add(l:lines, printf(' Strokes: %-4d | Par: %-4d | Medal: %s', l:strokes, l:par, l:medal))
  call add(l:lines, ' Habit Enforcer: Arrow keys [BLOCKED]')
  call add(l:lines, '----------------------------------------------')
  
  " Hint
  if l:show_hint
    call add(l:lines, ' [HINT]')
    for l:h in s:wrap_text(l:lvl.hint, 42)
      call add(l:lines, '   ' . l:h)
    endfor
    call add(l:lines, '----------------------------------------------')
  else
    call add(l:lines, ' [HINT]: Press <Leader>h to reveal')
    call add(l:lines, '----------------------------------------------')
  endif

  " Victory status banner
  if l:won
    call add(l:lines, '')
    call add(l:lines, '  ******************************************  ')
    call add(l:lines, '  *          LEVEL CLEARED!               *  ')
    call add(l:lines, printf('  *     AWARDED: %-25s*  ', l:medal))
    call add(l:lines, printf('  *     FINAL STROKES: %-19d*  ', l:strokes))
    call add(l:lines, '  *  Press <Enter> or <Leader>n for Next  *  ')
    call add(l:lines, '  ******************************************  ')
    call add(l:lines, '')
  endif
  
  " Controls
  call add(l:lines, ' [COMMANDS]')
  call add(l:lines, '  <Leader>r : Reset Level     <Leader>h : Hint')
  call add(l:lines, '  <Leader>n : Next Level      <Leader>p : Prev')
  call add(l:lines, '  <Leader>m : Campaign Menu   <Leader>q : Quit')
  call add(l:lines, '==============================================')
  
  " Update buffer contents
  setlocal modifiable
  silent! %delete _
  call setline(1, l:lines)
  setlocal nomodifiable
  
  " Switch back to play window
  call win_gotoid(s:play_win)
endfunction

function! s:wrap_text(str, max_len) abort
  let l:words = split(a:str, ' ')
  let l:lines = []
  let l:cur = ''
  for l:w in l:words
    if empty(l:cur)
      let l:cur = l:w
    elseif len(l:cur) + 1 + len(l:w) <= a:max_len
      let l:cur .= ' ' . l:w
    else
      call add(l:lines, l:cur)
      let l:cur = l:w
    endif
  endfor
  if !empty(l:cur)
    call add(l:lines, l:cur)
  endif
  return l:lines
endfunction
