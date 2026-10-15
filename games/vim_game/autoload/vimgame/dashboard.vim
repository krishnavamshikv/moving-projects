" autoload/vimgame/dashboard.vim
" Interactive Campaign Dashboard & Level Selector

let s:dash_buf = -1

function! vimgame#dashboard#open() abort
  silent! bwipeout! [VimGame_Campaign_Map]
  silent! only
  enew
  let s:dash_buf = bufnr('%')
  setlocal buftype=nofile
  setlocal bufhidden=wipe
  setlocal noswapfile
  setlocal nonumber
  setlocal norelativenumber
  setlocal signcolumn=no
  setlocal foldcolumn=0
  setlocal filetype=vimgame_dashboard
  silent! file [VimGame_Campaign_Map]

  call s:render()
  call s:setup_maps()
endfunction

function! s:render() abort
  let l:stats = vimgame#save#get_stats()
  let l:save = vimgame#save#load()
  let l:phases = vimgame#levels#get_phases()
  let l:diffs = ['beginner', 'intermediate', 'hard']
  
  let l:lines = []
  call add(l:lines, '================================================================================')
  call add(l:lines, '           V I M   M A S T E R Y   G A M E   ::   C A M P A I G N   M A P       ')
  call add(l:lines, '================================================================================')
  call add(l:lines, printf('  Progress: %d/36 Levels (%d%%)  |  Gold: %d ★  |  Silver: %d ★  |  Bronze: %d ★',
        \ l:stats.completed, l:stats.percentage, l:stats.gold, l:stats.silver, l:stats.bronze))
  call add(l:lines, '--------------------------------------------------------------------------------')
  call add(l:lines, '  PHASE | TOPIC NAME                     | BEGINNER     | INTERMEDIATE | HARD   ')
  call add(l:lines, '--------+--------------------------------+--------------+--------------+--------')

  for l:p in l:phases
    let l:b_key = printf('%d_beginner', l:p.id)
    let l:i_key = printf('%d_intermediate', l:p.id)
    let l:h_key = printf('%d_hard', l:p.id)

    let l:b_badge = s:format_badge(l:save, l:b_key)
    let l:i_badge = s:format_badge(l:save, l:i_key)
    let l:h_badge = s:format_badge(l:save, l:h_key)

    call add(l:lines, printf('   %02d   | %-30s | %-12s | %-12s | %-6s',
          \ l:p.id, strpart(l:p.name, 0, 30), l:b_badge, l:i_badge, l:h_badge))
  endfor

  call add(l:lines, '================================================================================')
  call add(l:lines, '  [HOW TO PLAY]')
  call add(l:lines, '   Move your cursor with [j] / [k] onto any Phase row, then press:')
  call add(l:lines, '     [b] : Play Beginner       [i] : Play Intermediate       [h] : Play Hard')
  call add(l:lines, '     [<Enter>] : Play first uncompleted level in this phase')
  call add(l:lines, '     [q] : Quit to terminal')
  call add(l:lines, '================================================================================')

  setlocal modifiable
  silent! %delete _
  call setline(1, l:lines)
  setlocal nomodifiable
  
  " Place cursor on first phase row (line 8)
  call cursor(8, 4)
endfunction

function! s:format_badge(save, key) abort
  let l:medal = get(a:save.medals, a:key, '')
  let l:strokes = get(a:save.best_strokes, a:key, 0)
  if l:medal ==# 'gold'
    return printf('GOLD ★ (%d)', l:strokes)
  elseif l:medal ==# 'silver'
    return printf('SILVER★(%d)', l:strokes)
  elseif l:medal ==# 'bronze'
    return printf('BRONZE★(%d)', l:strokes)
  else
    return '[READY]'
  endif
endfunction

function! s:setup_maps() abort
  nnoremap <buffer><silent> j :call <SID>move_down()<CR>
  nnoremap <buffer><silent> k :call <SID>move_up()<CR>
  nnoremap <buffer><silent> b :call <SID>launch_diff('beginner')<CR>
  nnoremap <buffer><silent> i :call <SID>launch_diff('intermediate')<CR>
  nnoremap <buffer><silent> h :call <SID>launch_diff('hard')<CR>
  nnoremap <buffer><silent> <CR> :call <SID>launch_default()<CR>
  nnoremap <buffer><silent> q :qa!<CR>
endfunction

function! s:move_down() abort
  let l:cur = line('.')
  if l:cur < 8
    call cursor(8, 4)
  elseif l:cur < 19
    call cursor(l:cur + 1, 4)
  endif
endfunction

function! s:move_up() abort
  let l:cur = line('.')
  if l:cur > 19
    call cursor(19, 4)
  elseif l:cur > 8
    call cursor(l:cur - 1, 4)
  endif
endfunction

function! s:get_selected_phase() abort
  let l:line_str = getline('.')
  let l:match = matchlist(l:line_str, '^\s*\(\d\+\)\s*|')
  if !empty(l:match) && !empty(l:match[1])
    return str2nr(l:match[1])
  endif
  
  let l:cur = line('.')
  if l:cur >= 8 && l:cur <= 19
    return l:cur - 7
  elseif l:cur > 19
    return 12
  else
    return 1
  endif
endfunction

function! s:launch_diff(diff) abort
  let l:phase = s:get_selected_phase()
  call vimgame#engine#start_level(l:phase, a:diff)
endfunction

function! s:launch_default() abort
  let l:phase = s:get_selected_phase()
  let l:save = vimgame#save#load()
  
  for l:d in ['beginner', 'intermediate', 'hard']
    let l:k = printf('%d_%s', l:phase, l:d)
    if !has_key(l:save.completed, l:k)
      call vimgame#engine#start_level(l:phase, l:d)
      return
    endif
  endfor
  " All completed, launch beginner by default
  call vimgame#engine#start_level(l:phase, 'beginner')
endfunction
