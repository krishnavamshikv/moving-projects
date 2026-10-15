" tests/test_levels.vim
" Automated test suite for Vim Mastery Game

set nomore
let s:failures = 0
let s:passes = 0

function! s:assert(cond, msg) abort
  if !a:cond
    let s:failures += 1
    echohl ErrorMsg | echo "FAIL: " . a:msg | echohl None
  else
    let s:passes += 1
  endif
endfunction

function! s:run_tests() abort
  echomsg "=== Running Vim Mastery Game Test Suite ==="

  " Test 1: Validate all 12 phases
  let l:phases = vimgame#levels#get_phases()
  call s:assert(len(l:phases) == 12, "Curriculum contains exactly 12 phases")

  " Test 2: Validate all 36 levels
  let l:diffs = ['beginner', 'intermediate', 'hard']
  let l:total_found = 0
  for l:p in range(1, 12)
    for l:d in l:diffs
      let l:lvl = vimgame#levels#get(l:p, l:d)
      let l:lbl = printf('Phase %d [%s]', l:p, l:d)
      
      call s:assert(!empty(l:lvl), l:lbl . " exists in registry")
      if !empty(l:lvl)
        let l:total_found += 1
        call s:assert(!empty(l:lvl.title), l:lbl . " has title")
        call s:assert(!empty(l:lvl.concept), l:lbl . " has concept explanation")
        call s:assert(!empty(l:lvl.instruction), l:lbl . " has mission instruction")
        call s:assert(l:lvl.par > 0, l:lbl . " has valid par (" . l:lvl.par . ")")
        call s:assert(!empty(l:lvl.initial_text), l:lbl . " has initial text")
        call s:assert(len(l:lvl.start_pos) == 2, l:lbl . " has start_pos")
        
        if l:lvl.type ==# 'buffer'
          call s:assert(has_key(l:lvl, 'target_text'), l:lbl . " buffer type has target_text")
        elseif l:lvl.type ==# 'cursor'
          call s:assert(has_key(l:lvl, 'target_pos'), l:lbl . " cursor type has target_pos")
        endif
      endif
    endfor
  endfor
  call s:assert(l:total_found == 36, "Exactly 36 sub-levels verified")

  " Test 3: Save and Load subsystem
  let l:test_data = vimgame#save#load()
  call s:assert(type(l:test_data) == v:t_dict, "Save data loads as dictionary")
  call vimgame#save#record_completion(1, 'beginner', 12, 'gold')
  let l:stats = vimgame#save#get_stats()
  call s:assert(l:stats.completed >= 1, "Save recorded completion")
  call s:assert(l:stats.gold >= 1, "Save recorded gold medal")

  " Test 4: Engine Level Launch & State
  call vimgame#engine#start_level(1, 'beginner')
  let l:st = vimgame#engine#get_state()
  call s:assert(l:st.phase == 1 && l:st.difficulty ==# 'beginner', "Engine loaded Phase 1 Beginner")
  call s:assert(l:st.won == 0, "Initial level state is not won")
  call s:assert(l:st.strokes == 0, "Initial stroke count is zero")

  " Test 5: Engine Win Detection (Cursor level)
  let l:target = l:st.level.target_pos
  call cursor(l:target[0], l:target[1])
  call vimgame#engine#check_win()
  let l:st_after = vimgame#engine#get_state()
  call s:assert(l:st_after.won == 1, "Cursor reaching target coordinates triggers WIN")

  " Test 6: Engine Win Detection (Buffer edit level)
  call vimgame#engine#start_level(2, 'beginner')
  let l:st2 = vimgame#engine#get_state()
  call setline(1, l:st2.level.target_text)
  call vimgame#engine#check_win()
  let l:st2_after = vimgame#engine#get_state()
  call s:assert(l:st2_after.won == 1, "Buffer matching target text triggers WIN")

  " Test 7: Phase 1 Intermediate word match
  call vimgame#engine#start_level(1, 'intermediate')
  execute 'normal! fS'
  call vimgame#engine#check_win()
  let l:st_p1_i = vimgame#engine#get_state()
  call s:assert(l:st_p1_i.won == 1, "Phase 1 Intermediate: landing on SECRET_KEY triggers WIN")

  " Test 8: Phase 1 Hard end-of-line leap
  call vimgame#engine#start_level(1, 'hard')
  execute 'normal! 19G$'
  call vimgame#engine#check_win()
  let l:st_p1_h = vimgame#engine#get_state()
  call s:assert(l:st_p1_h.won == 1, "Phase 1 Hard: 19G$ triggers WIN")

  " Summary
  if s:failures == 0
    echomsg printf("ALL %d ASSERTIONS PASSED SUCCESSFULLY!", s:passes)
    qall!
  else
    echomsg printf("%d TEST FAILURES DETECTED", s:failures)
    cquit 1
  endif
endfunction

call s:run_tests()
