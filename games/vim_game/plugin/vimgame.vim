" plugin/vimgame.vim
" Vim Mastery Game Plugin Entrypoint

if exists('g:loaded_vimgame')
  finish
endif
let g:loaded_vimgame = 1

let s:plugin_root = expand('<sfile>:p:h:h')

" Ensure autoload and runtime are in rtp
if stridx(&rtp, s:plugin_root) == -1
  let &rtp = s:plugin_root . ',' . &rtp . ',' . s:plugin_root . '/runtime'
endif

" Commands
command! -nargs=0 VimGame call vimgame#dashboard#open()
command! -nargs=0 VimGameMenu call vimgame#dashboard#open()
command! -nargs=* VimGameLevel call s:start_specific_level(<f-args>)
command! -nargs=0 VimGameReset call s:reset_all_progress()

function! s:start_specific_level(...) abort
  if a:0 == 0
    call vimgame#dashboard#open()
  elseif a:0 == 1
    call vimgame#engine#start_level(str2nr(a:1), 'beginner')
  else
    call vimgame#engine#start_level(str2nr(a:1), tolower(a:2))
  endif
endfunction

function! s:reset_all_progress() abort
  let l:file = vimgame#save#get_save_file()
  if filereadable(l:file)
    call delete(l:file)
  endif
  echo "VimGame progress reset."
  call vimgame#dashboard#open()
endfunction
