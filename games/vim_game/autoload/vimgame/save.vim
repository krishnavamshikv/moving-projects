" autoload/vimgame/save.vim
" Save state management and progress persistence for Vim Mastery Game

let s:save_file = expand('~/.vimgame_save.json')
if !filewritable(expand('~'))
  let s:save_file = expand('<sfile>:p:h:h:h') . '/.vimgame_save.json'
endif

function! vimgame#save#get_save_file() abort
  return s:save_file
endfunction

function! vimgame#save#load() abort
  if filereadable(s:save_file)
    try
      let l:content = join(readfile(s:save_file), '')
      let l:data = json_decode(l:content)
      if type(l:data) == v:t_dict
        return l:data
      endif
    catch
      " Fallback on error
    endtry
  endif
  return {
        \ 'version': 1,
        \ 'current_phase': 1,
        \ 'current_difficulty': 'beginner',
        \ 'completed': {},
        \ 'best_strokes': {},
        \ 'medals': {}
        \ }
endfunction

function! vimgame#save#save(data) abort
  try
    let l:json = json_encode(a:data)
    call writefile([l:json], s:save_file)
    return 1
  catch
    return 0
  endtry
endfunction

function! vimgame#save#record_completion(phase, diff, strokes, medal) abort
  let l:data = vimgame#save#load()
  let l:key = printf('%d_%s', a:phase, a:diff)
  
  let l:data.completed[l:key] = 1
  
  if !has_key(l:data.best_strokes, l:key) || a:strokes < l:data.best_strokes[l:key]
    let l:data.best_strokes[l:key] = a:strokes
  endif
  
  " Upgrade medal if better (gold > silver > bronze)
  let l:medal_rank = {'gold': 3, 'silver': 2, 'bronze': 1, 'none': 0}
  let l:curr_medal = get(l:data.medals, l:key, 'none')
  if get(l:medal_rank, a:medal, 0) > get(l:medal_rank, l:curr_medal, 0)
    let l:data.medals[l:key] = a:medal
  endif

  call vimgame#save#save(l:data)
endfunction

function! vimgame#save#get_stats() abort
  let l:data = vimgame#save#load()
  let l:total_levels = 36
  let l:completed_count = len(keys(l:data.completed))
  let l:gold_count = 0
  let l:silver_count = 0
  let l:bronze_count = 0
  
  for l:m in values(l:data.medals)
    if l:m ==# 'gold'
      let l:gold_count += 1
    elseif l:m ==# 'silver'
      let l:silver_count += 1
    elseif l:m ==# 'bronze'
      let l:bronze_count += 1
    endif
  endfor
  
  return {
        \ 'total': l:total_levels,
        \ 'completed': l:completed_count,
        \ 'gold': l:gold_count,
        \ 'silver': l:silver_count,
        \ 'bronze': l:bronze_count,
        \ 'percentage': (l:completed_count * 100) / l:total_levels
        \ }
endfunction
