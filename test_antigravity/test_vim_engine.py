import unittest
from vim_defender import VimBuffer, VimEngine

class TestVimEngine(unittest.TestCase):
    def setUp(self):
        sample_code = [
            "def calculate_metrics(items, factor=1.5):",
            "    total = 0",
            '    message = "processing data"',
            "    for item in items:",
            "        total += item * factor",
            "    return total",
        ]
        self.buf = VimBuffer(sample_code)
        self.engine = VimEngine(self.buf)

    def test_basic_motions(self):
        self.assertEqual((self.buf.row, self.buf.col), (0, 0))
        # Move right
        self.engine.feed_key('l')
        self.assertEqual(self.buf.col, 1)
        # Move down
        self.engine.feed_key('j')
        self.assertEqual((self.buf.row, self.buf.col), (1, 1))
        # Move left
        self.engine.feed_key('h')
        self.assertEqual(self.buf.col, 0)
        # Move up
        self.engine.feed_key('k')
        self.assertEqual(self.buf.row, 0)

    def test_word_motions(self):
        # Line 0: "def calculate_metrics(items, factor=1.5):"
        # Start at 0
        self.engine.feed_key('w')
        self.assertEqual(self.buf.col, 4) # at 'c' of calculate_metrics
        self.engine.feed_key('e')
        self.assertEqual(self.buf.col, 20) # at 's' of calculate_metrics
        self.engine.feed_key('b')
        self.assertEqual(self.buf.col, 4) # back at 'c'
        self.engine.feed_key('$')
        self.assertEqual(self.buf.col, len(self.buf.lines[0]) - 1)
        self.engine.feed_key('0')
        self.assertEqual(self.buf.col, 0)
        self.engine.feed_key('^')
        self.assertEqual(self.buf.col, 0)

    def test_count_multipliers(self):
        # 3w
        self.engine.feed_key('3')
        self.engine.feed_key('w')
        # def (0) -> calculate_metrics (4) -> ( (21) -> items (22)
        self.assertEqual(self.buf.col, 22)

        # 2j
        self.engine.feed_key('2')
        self.engine.feed_key('j')
        self.assertEqual(self.buf.row, 2)

    def test_find_motions(self):
        # Move to line 2: '    message = "processing data"'
        self.buf.row = 2
        self.buf.col = 0
        # f"
        self.engine.feed_key('f')
        self.engine.feed_key('"')
        self.assertEqual(self.buf.col, 14)

        # ; repeats find
        self.engine.feed_key(';')
        self.assertEqual(self.buf.col, 30)

        # , reverses find
        self.engine.feed_key(',')
        self.assertEqual(self.buf.col, 14)

    def test_gg_and_G(self):
        self.engine.feed_key('G')
        self.assertEqual(self.buf.row, 5)
        self.engine.feed_key('g')
        self.engine.feed_key('g')
        self.assertEqual(self.buf.row, 0)

    def test_operators_and_text_objects(self):
        # Line 2: '    message = "processing data"'
        self.buf.row = 2
        self.buf.col = 16 # inside "processing data"

        # ci"
        res = self.engine.feed_key('c')
        self.assertIsNone(res)
        res = self.engine.feed_key('i')
        self.assertIsNone(res)
        res = self.engine.feed_key('"')
        self.assertIsNotNone(res)
        self.assertEqual(res.get('type'), 'operator')
        self.assertEqual(res.get('command'), 'ci"')
        self.assertEqual(res.get('span'), (2, 15, 29))

        # dw on line 1: '    total = 0'
        self.buf.row = 1
        self.buf.col = 4
        self.engine.feed_key('d')
        res = self.engine.feed_key('w')
        self.assertIsNotNone(res)
        self.assertEqual(res.get('command'), 'dw')

    def test_search(self):
        self.engine.feed_key('/')
        for ch in 'return':
            self.engine.feed_key(ch)
        res = self.engine.feed_key('\n')
        self.assertIsNotNone(res)
        self.assertEqual(self.buf.row, 5) # 'return total' is on row 5

    def test_x_and_D_operators(self):
        self.buf.row = 1
        self.buf.col = 4
        res = self.engine.feed_key('x')
        self.assertEqual(res.get('command'), 'x')
        self.assertEqual(res.get('span'), (1, 4, 4))

        res = self.engine.feed_key('D')
        self.assertEqual(res.get('command'), 'D')
        self.assertEqual(res.get('span')[0], 1)

    def test_dd_operator(self):
        self.buf.row = 3
        self.buf.col = 5
        self.engine.feed_key('d')
        res = self.engine.feed_key('d')
        self.assertIsNotNone(res)
        self.assertEqual(res.get('command'), 'dd')
        self.assertEqual(res.get('row'), 3)

    def test_cursor_clamping_and_boundaries(self):
        self.buf.row = 0
        self.buf.col = 0
        self.engine.feed_key('h')
        self.assertEqual(self.buf.col, 0)
        self.engine.feed_key('k')
        self.assertEqual(self.buf.row, 0)
        # Move past bottom
        for _ in range(20):
            self.engine.feed_key('j')
        self.assertEqual(self.buf.row, 5)

from unittest.mock import MagicMock
from vim_defender import (
    VimDefenderGame,
    STAGES,
    PHASES,
    CODE_TEMPLATES_SHORT,
    CODE_TEMPLATES,
    CODE_TEMPLATES_LONG,
)

class TestGameLogic(unittest.TestCase):
    def setUp(self):
        mock_scr = MagicMock()
        mock_scr.getmaxyx.return_value = (30, 100)
        self.game = VimDefenderGame(mock_scr)

    def test_stage_startup(self):
        # Default starts with briefing for beginners
        self.game.start_stage(0)
        self.assertEqual(self.game.state, "STAGE_BRIEFING")
        self.assertEqual(self.game.stage_idx, 0)
        self.assertGreaterEqual(len(self.game.bugs), 1)

        # Direct start without briefing
        self.game.start_stage(0, show_briefing=False)
        self.assertEqual(self.game.state, "PLAYING")
        self.assertEqual(self.game.integrity, 100.0)

    def test_bug_squash_and_combo(self):
        self.game.start_stage(0, show_briefing=False)
        bug = self.game.bugs[0]
        # Move cursor to bug coordinate
        self.game.buffer.row = bug.row
        self.game.buffer.col = bug.start_col
        # Hit detection with LAND
        self.game.handle_hit_detection({'type': 'motion', 'command': 'l'})
        self.assertEqual(self.game.stage_bugs_cleared, 1)
        self.assertGreater(self.game.score, 0)
        self.assertGreater(self.game.combo, 1.0)

    def test_guidance_generation(self):
        self.game.start_stage(0, show_briefing=False)
        obj_text, guide_text = self.game.get_guidance()
        self.assertIn("Line", obj_text)
        self.assertTrue(len(guide_text) > 0)

    def test_phase_and_stages_structure(self):
        self.assertEqual(len(STAGES), 13) # 12 campaign + 1 endless
        self.assertEqual(len(PHASES), 4) # 4 distinct phases
        for p in PHASES:
            self.assertEqual(len(p["stage_indices"]), 3) # 3 sub-levels per phase

    def test_buffer_tiers(self):
        # Short templates should be 12-14 lines
        for lang, lines in CODE_TEMPLATES_SHORT.items():
            self.assertTrue(12 <= len(lines) <= 15, f"{lang} short template has {len(lines)} lines")

        # Medium templates should be 20-30 lines
        for lang, lines in CODE_TEMPLATES.items():
            self.assertTrue(20 <= len(lines) <= 30, f"{lang} medium template has {len(lines)} lines")

        # Long templates should be 40+ lines
        for lang, lines in CODE_TEMPLATES_LONG.items():
            self.assertTrue(len(lines) >= 40, f"{lang} long template has {len(lines)} lines")

    def test_buffer_tier_loading_in_stages(self):
        # Stage 0: Sub 1.1 (Short)
        self.game.start_stage(0, show_briefing=False)
        self.assertTrue(12 <= len(self.game.buffer.lines) <= 15)

        # Stage 1: Sub 1.2 (Medium)
        self.game.start_stage(1, show_briefing=False)
        self.assertTrue(20 <= len(self.game.buffer.lines) <= 30)

        # Stage 2: Sub 1.3 (Hard, Long)
        self.game.start_stage(2, show_briefing=False)
        self.assertTrue(len(self.game.buffer.lines) >= 40)

    def test_progressive_difficulty_within_phase(self):
        # Within Phase 1 (stages 0, 1, 2):
        stg_basic = STAGES[0]
        stg_inter = STAGES[1]
        stg_hard = STAGES[2]

        # Target bugs should increase
        self.assertLess(stg_basic["target_bugs"], stg_inter["target_bugs"])
        self.assertLess(stg_inter["target_bugs"], stg_hard["target_bugs"])

        # Bug duration should decrease (harder/faster)
        self.assertGreater(stg_basic["bug_duration"], stg_inter["bug_duration"])
        self.assertGreater(stg_inter["bug_duration"], stg_hard["bug_duration"])

    def test_phase_menu_navigation(self):
        # Start at main menu
        self.game.state = "MENU"
        self.game.scores_data["stages_unlocked"] = 13 # all unlocked for testing

        # Press '1' to enter Phase 1 sub-level selection
        self.game.handle_menu_input(ord('1'))
        self.assertEqual(self.game.state, "PHASE_MENU")
        self.assertEqual(self.game.selected_phase, 0)
        self.assertEqual(self.game.selected_sub_idx, 0)

        # Navigate down to Intermediate (sub_idx 1)
        self.game.handle_phase_menu_input(ord('j'))
        self.assertEqual(self.game.selected_sub_idx, 1)

        # Press '3' to select Hard (sub_idx 2) and launch
        self.game.handle_phase_menu_input(ord('3'))
        self.assertEqual(self.game.stage_idx, 2) # Stage 2 is Phase 1 Hard
        self.assertEqual(self.game.state, "STAGE_BRIEFING")

        # Return to menu
        self.game.state = "PHASE_MENU"
        self.game.handle_phase_menu_input(ord('b'))
        self.assertEqual(self.game.state, "MENU")

if __name__ == '__main__':
    unittest.main()

