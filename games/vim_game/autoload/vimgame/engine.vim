" autoload/vimgame/engine.vim
" Core game loop, event listeners, validation, and level progression

let s:state = {
      \ 'phase': 1,
      \ 'difficulty': 'beginner',
      \ 'level': {},
      \ 'strokes': 0,
      \ 'won': 0,
      \ 'show_hint': 0,
      \ 'checkpoint_reached': 0,
      \ 'phase_name': '',
      \ 'last_line': 1,
      \ 'last_col': 1,
      \ 'last_tick': 0
      \ }

function! vimgame#engine#get_state() abort
  return s:state
endfunction

function! vimgame#engine#start_level(phase, diff) abort
  let l:lvl = vimgame#levels#get(a:phase, a:diff)
  if empty(l:lvl)
    echohl WarningMsg | echo "Level not found!" | echohl None
    return
  endif

  let s:state.phase = a:phase
  let s:state.difficulty = a:diff
  let s:state.level = l:lvl
  let s:state.strokes = 0
  let s:state.won = 0
  let s:state.show_hint = 0
  let s:state.checkpoint_reached = 0
  
  let l:phases = vimgame#levels#get_phases()
  let s:state.phase_name = l:phases[a:phase - 1].name

  " Setup window layout
  call vimgame#ui#setup_windows()

  " Populate Play Buffer
  let l:play_win = vimgame#ui#get_play_win()
  call win_gotoid(l:play_win)

  setlocal modifiable
  silent! %delete _
  call setline(1, l:lvl.initial_text)
  call cursor(l:lvl.start_pos[0], l:lvl.start_pos[1])
  
  " Set helpful line numbering (both absolute and relative for count jumping!)
  setlocal number
  setlocal relativenumber
  setlocal cursorline
  setlocal nowrap

  let s:state.last_line = line('.')
  let s:state.last_col = col('.')
  let s:state.last_tick = b:changedtick

  " Enforce habit rules & input mappings
  call s:setup_habits()
  call s:setup_hotkeys()
  call s:setup_autocmds()

  " Custom level setups if defined
  if has_key(l:lvl, 'custom_setup')
    execute l:lvl.custom_setup
  endif

  " Render HUD
  call vimgame#ui#render_hud(s:state)
endfunction

function! s:setup_habits() abort
  " Disable arrow keys with guidance
  nnoremap <buffer><silent> <Up> :call <SID>warn_arrow('k')<CR>
  nnoremap <buffer><silent> <Down> :call <SID>warn_arrow('j')<CR>
  nnoremap <buffer><silent> <Left> :call <SID>warn_arrow('h')<CR>
  nnoremap <buffer><silent> <Right> :call <SID>warn_arrow('l')<CR>
  inoremap <buffer><silent> <Up> <Esc>:call <SID>warn_arrow('k')<CR>
  inoremap <buffer><silent> <Down> <Esc>:call <SID>warn_arrow('j')<CR>
  inoremap <buffer><silent> <Left> <Esc>:call <SID>warn_arrow('h')<CR>
  inoremap <buffer><silent> <Right> <Esc>:call <SID>warn_arrow('l')<CR>
  
  " Disable mouse clicks in game buffer
  setlocal mouse=
endfunction

function! s:warn_arrow(alt) abort
  echohl ErrorMsg
  echo printf(" [!] Arrow keys blocked! Use '%s' instead to build muscle memory.", a:alt)
  echohl None
endfunction

function! s:setup_hotkeys() abort
  let mapleader = " "
  nnoremap <buffer><silent> <Leader>r :call vimgame#engine#reset_level()<CR>
  nnoremap <buffer><silent> <Leader>h :call vimgame#engine#toggle_hint()<CR>
  nnoremap <buffer><silent> <Leader>m :call vimgame#dashboard#open()<CR>
  nnoremap <buffer><silent> <Leader>n :call vimgame#engine#next_level()<CR>
  nnoremap <buffer><silent> <Leader>p :call vimgame#engine#prev_level()<CR>
  nnoremap <buffer><silent> <Leader>q :call vimgame#engine#quit()<CR>
  nnoremap <buffer><silent> <CR> :call <SID>handle_enter()<CR>
endfunction

function! s:setup_autocmds() abort
  augroup VimGamePlay
    autocmd! * <buffer>
    autocmd CursorMoved,CursorMovedI <buffer> call s:on_cursor_moved()
    autocmd TextChanged,TextChangedI <buffer> call s:on_text_changed()
  augroup END
endfunction

function! s:on_cursor_moved() abort
  if s:state.won
    return
  endif

  let l:cur_line = line('.')
  let l:cur_col = col('.')

  if l:cur_line != s:state.last_line || l:cur_col != s:state.last_col
    let s:state.strokes += 1
    let s:state.last_line = l:cur_line
    let s:state.last_col = l:cur_col
    call vimgame#engine#check_win()
    call vimgame#ui#render_hud(s:state)
  endif
endfunction

function! s:on_text_changed() abort
  if s:state.won
    return
  endif

  if b:changedtick != s:state.last_tick
    let s:state.strokes += 1
    let s:state.last_tick = b:changedtick
    call vimgame#engine#check_win()
    call vimgame#ui#render_hud(s:state)
  endif
endfunction

function! vimgame#engine#check_win() abort
  if s:state.won
    return
  endif

  let l:lvl = s:state.level
  let l:won = 0

  if l:lvl.type ==# 'cursor'
    " Track checkpoint if required
    if has_key(l:lvl, 'checkpoint_line') && line('.') == l:lvl.checkpoint_line
      let s:state.checkpoint_reached = 1
    endif

    " 1. Exact coordinate match
    if line('.') == l:lvl.target_pos[0] && col('.') == l:lvl.target_pos[1]
      let l:won = 1
    endif

    " 2. Target word match (e.g. SECRET_KEY on line 2, MATCH_TARGET on line 8, TREASURE on line 6)
    if has_key(l:lvl, 'target_word') && line('.') == l:lvl.target_pos[0]
      if expand('<cword>') ==# l:lvl.target_word
        let l:won = 1
      endif
    endif

    " 3. End of line match (e.g. '$' lands on col('$')-1)
    if has_key(l:lvl, 'target_pos') && line('.') == l:lvl.target_pos[0]
      let l:line_last_col = col('$') - 1
      if (l:lvl.target_pos[1] == l:line_last_col || l:lvl.target_pos[1] >= l:line_last_col) && col('.') == l:line_last_col
        let l:won = 1
      endif
    endif

    " 4. Checkpoint return match
    if has_key(l:lvl, 'checkpoint_line')
      if s:state.checkpoint_reached && line('.') == get(l:lvl, 'target_line', l:lvl.target_pos[0])
        let l:won = 1
      else
        let l:won = 0
      endif
    endif

    " 5. Phase 3 Intermediate allow col 67 or 68
    if s:state.phase == 3 && s:state.difficulty ==# 'intermediate'
      if line('.') == 1 && (col('.') == 67 || col('.') == 68)
        let l:won = 1
      endif
    endif

    " Check special Phase 11 intermediate buffer switch
    if s:state.phase == 11 && s:state.difficulty ==# 'intermediate'
      if bufname('%') =~# 'secret_token'
        let l:won = 1
      endif
    endif

  elseif l:lvl.type ==# 'buffer'
    let l:cur_lines = getbufline('%', 1, '$')
    if l:cur_lines == l:lvl.target_text
      let l:won = 1
    endif

  elseif l:lvl.type ==# 'window_only'
    let l:total_windows = winnr('$')
    " Win condition: Only play buffer and HUD remain (2 windows) or play only (1 window)
    if l:total_windows <= 2
      let l:won = 1
    endif
  endif

  if l:won
    let s:state.won = 1
    
    " Calculate medal
    let l:par = l:lvl.par
    let l:medal = 'gold'
    if s:state.strokes > l:par + 6
      let l:medal = 'bronze'
    elseif s:state.strokes > l:par
      let l:medal = 'silver'
    endif

    call vimgame#save#record_completion(s:state.phase, s:state.difficulty, s:state.strokes, l:medal)
    call vimgame#ui#render_hud(s:state)
    
    echohl MoreMsg
    echo printf(" [★] LEVEL CLEARED! Medal: %s (%d strokes). Press <Enter> or <Leader>n to continue.", toupper(l:medal), s:state.strokes)
    echohl None
  endif
endfunction

function! s:handle_enter() abort
  if s:state.won
    call vimgame#engine#next_level()
  endif
endfunction

function! vimgame#engine#reset_level() abort
  call vimgame#engine#start_level(s:state.phase, s:state.difficulty)
  echohl Directory | echo "Level reset!" | echohl None
endfunction

function! vimgame#engine#toggle_hint() abort
  let s:state.show_hint = !s:state.show_hint
  call vimgame#ui#render_hud(s:state)
endfunction

function! vimgame#engine#next_level() abort
  let l:p = s:state.phase
  let l:d = s:state.difficulty

  if l:d ==# 'beginner'
    let l:next_d = 'intermediate'
    let l:next_p = l:p
  elseif l:d ==# 'intermediate'
    let l:next_d = 'hard'
    let l:next_p = l:p
  else
    let l:next_d = 'beginner'
    let l:next_p = l:p + 1
  endif

  if l:next_p > 12
    echohl Special | echo " CONGRATULATIONS! You have completed all 12 Phases of Vim Mastery! " | echohl None
    call vimgame#dashboard#open()
    return
  endif

  call vimgame#engine#start_level(l:next_p, l:next_d)
endfunction

function! vimgame#engine#prev_level() abort
  let l:p = s:state.phase
  let l:d = s:state.difficulty

  if l:d ==# 'hard'
    let l:prev_d = 'intermediate'
    let l:prev_p = l:p
  elseif l:d ==# 'intermediate'
    let l:prev_d = 'beginner'
    let l:prev_p = l:p
  else
    let l:prev_d = 'hard'
    let l:prev_p = l:p - 1
  endif

  if l:prev_p < 1
    call vimgame#dashboard#open()
    return
  endif

  call vimgame#engine#start_level(l:prev_p, l:prev_d)
endfunction

function! vimgame#engine#quit() abort
  silent! qa!
endfunction

" Phase 11 custom helper setups
function! vimgame#engine#setup_phase11_buffer() abort
  let l:secret_buf = bufnr('secret_token')
  if l:secret_buf == -1
    let l:secret_buf = bufadd('secret_token')
  endif
  call bufload(l:secret_buf)
  call setbufline(l:secret_buf, 1, [
        \ '=====================================',
        \ '  CONGRATULATIONS! BUFFER FOUND!     ',
        \ '  Passkey: VIM_BUFFER_WIZARD_2026    ',
        \ '====================================='
        \ ])
  call setbufvar(l:secret_buf, '&buflisted', 1)
endfunction

function! vimgame#engine#setup_phase11_splits() abort
  " Split extra clutter windows
  belowright 5new [Extra_Clutter_1]
  setlocal buftype=nofile bufhidden=wipe
  call setline(1, '// Clutter Split 1: Close me with <C-w>o!')
  
  belowright 5new [Extra_Clutter_2]
  setlocal buftype=nofile bufhidden=wipe
  call setline(1, '// Clutter Split 2: Close me with <C-w>o!')

  " Return to play window
  let l:play_win = vimgame#ui#get_play_win()
  call win_gotoid(l:play_win)
endfunction
