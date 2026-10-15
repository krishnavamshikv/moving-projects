#!/usr/bin/env python3
"""
Vim Defender - Terminal TUI Vim Training Game
An authentic arcade-style defense game to train Vim muscle memory in a real code buffer.
"""

import curses
import json
import math
import os
import random
import re
import sys
import time
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Set, Tuple

# ---------------------------------------------------------------------------
# High Score Persistence
# ---------------------------------------------------------------------------
SCORE_FILE = os.path.expanduser("~/.vim_defender_scores.json")

def load_high_scores() -> dict:
    if os.path.exists(SCORE_FILE):
        try:
            with open(SCORE_FILE, "r") as f:
                return json.load(f)
        except Exception:
            pass
    return {"high_score": 0, "max_combo": 0, "bugs_cleared": 0, "stages_unlocked": 1}

def save_high_scores(data: dict):
    try:
        with open(SCORE_FILE, "w") as f:
            json.dump(data, f, indent=2)
    except Exception:
        pass


# ---------------------------------------------------------------------------
# Authentic Code Templates
# ---------------------------------------------------------------------------
CODE_TEMPLATES = {
    "python": [
        "# Core data processor and pipeline orchestrator",
        "import sys, os, time",
        "from typing import List, Dict, Optional",
        "",
        "def process_pipeline(batch_id: int, options: dict) -> bool:",
        '    status = "INITIALIZING"',
        "    buffer_size = 4096",
        "    retries = 3",
        "    data_stream = fetch_stream(batch_id, timeout=10)",
        '    print(f"Starting processing for batch: {batch_id}")',
        "",
        "    while retries > 0:",
        "        try:",
        "            packet = data_stream.read(buffer_size)",
        "            if not packet:",
        "                break",
        "            metrics = calculate_metrics(packet, factor=1.5)",
        '            log_event("PACKET_OK", metrics.summary())',
        "        except TimeoutError as err:",
        "            retries -= 1",
        '            log_warning(f"Retry attempt remaining: {retries}")',
        "",
        '    status = "COMPLETED"',
        "    return True",
    ],
    "rust": [
        "// Async task dispatcher with lock-free ring buffer",
        "use std::sync::atomic::{AtomicUsize, Ordering};",
        "use std::time::Duration;",
        "",
        "pub struct Dispatcher {",
        "    capacity: usize,",
        "    head: AtomicUsize,",
        "    tail: AtomicUsize,",
        '    tag: String,',
        "}",
        "",
        "impl Dispatcher {",
        "    pub fn new(capacity: usize) -> Self {",
        "        Self {",
        "            capacity,",
        "            head: AtomicUsize::new(0),",
        "            tail: AtomicUsize::new(0),",
        '            tag: String::from("RING_BUFFER"),',
        "        }",
        "    }",
        "",
        "    pub fn push(&self, value: u64) -> Result<(), &'static str> {",
        "        let current_head = self.head.load(Ordering::Acquire);",
        "        if current_head >= self.capacity {",
        '            return Err("Buffer capacity exceeded");',
        "        }",
        "        self.head.store(current_head + 1, Ordering::Release);",
        "        Ok(())",
        "    }",
        "}",
    ],
    "javascript": [
        "// High-throughput WebSocket message router",
        'const EventEmitter = require("events");',
        'const { Buffer } = require("buffer");',
        "",
        "class MessageRouter extends EventEmitter {",
        "    constructor(port = 8080, maxConnections = 500) {",
        "        super();",
        "        this.port = port;",
        "        this.activeSessions = new Map();",
        '        this.state = "IDLE";',
        "    }",
        "",
        "    handleIncoming(socket, payload) {",
        "        const timestamp = Date.now();",
        "        if (!payload || payload.length === 0) {",
        '            this.emit("error", "Empty payload received");',
        "            return false;",
        "        }",
        '        const header = payload.slice(0, 4).toString("hex");',
        '        this.activeSessions.set(socket.id, { timestamp, header });',
        '        this.emit("message", { socketId: socket.id, size: payload.length });',
        "        return true;",
        "    }",
        "}",
    ],
    "c": [
        "/* Memory allocator pool with sentinel guards */",
        "#include <stdio.h>",
        "#include <stdlib.h>",
        "#include <stdint.h>",
        "#include <string.h>",
        "",
        "typedef struct BlockHeader {",
        "    size_t size;",
        "    uint32_t magic_sentinel;",
        "    struct BlockHeader* next;",
        "} BlockHeader;",
        "",
        "BlockHeader* init_pool(size_t total_bytes) {",
        "    void* memory = malloc(total_bytes);",
        "    if (memory == NULL) {",
        '        fprintf(stderr, "Fatal: Out of memory pool\\n");',
        "        return NULL;",
        "    }",
        "    BlockHeader* root = (BlockHeader*)memory;",
        "    root->size = total_bytes - sizeof(BlockHeader);",
        "    root->magic_sentinel = 0xDEADBEEF;",
        "    root->next = NULL;",
        "    return root;",
        "}",
    ]
}

CODE_TEMPLATES_SHORT = {
    "python": [
        "# Pipeline health checker",
        "def check_health(retries: int = 3) -> bool:",
        '    status = "INITIALIZING"',
        "    buffer_limit = 1024",
        "    total_packets = 0",
        "    if retries <= 0:",
        '        return "OFFLINE"',
        "    for attempt in range(retries):",
        "        total_packets += attempt * 2",
        '        status = "HEALTHY"',
        '    print(f"System status: {status}, packets: {total_packets}")',
        "    return True",
    ],
    "rust": [
        "// Fast counter guard",
        "pub struct Counter {",
        "    pub count: usize,",
        "    pub active: bool,",
        "}",
        "impl Counter {",
        "    pub fn new() -> Self {",
        "        Self { count: 0, active: true }",
        "    }",
        "    pub fn increment(&mut self) {",
        "        self.count += 1;",
        "    }",
        "}",
    ],
    "javascript": [
        "// Route session validator",
        "function validateSession(req, res) {",
        '    const token = req.headers["authorization"];',
        "    if (!token) {",
        '        res.status(401).send("Unauthorized");',
        "        return false;",
        "    }",
        "    const payload = parseJwt(token);",
        "    const expiry = payload.exp || 0;",
        "    if (Date.now() > expiry) return false;",
        '    console.log(`Session user: ${payload.uid}`);',
        "    return true;",
        "}",
    ],
    "c": [
        "/* Basic linked node allocator */",
        "#include <stdio.h>",
        "#include <stdlib.h>",
        "typedef struct Node {",
        "    int value;",
        "    struct Node* next;",
        "} Node;",
        "Node* create_node(int val) {",
        "    Node* n = (Node*)malloc(sizeof(Node));",
        "    n->value = val;",
        "    n->next = NULL;",
        "    return n;",
        "}",
    ]
}

CODE_TEMPLATES_LONG = {
    "python": [
        "# Async distributed event stream pipeline and telemetry broker",
        "import asyncio, sys, os, time",
        "from typing import List, Dict, Optional, Any",
        "",
        "class EventDispatcher:",
        "    def __init__(self, cluster_id: str, max_queue: int = 500):",
        "        self.cluster_id = cluster_id",
        "        self.max_queue = max_queue",
        "        self.queue: List[dict] = []",
        '        self.state = "STANDBY"',
        "        self.processed_count = 0",
        "        self.failed_count = 0",
        "",
        "    def enqueue(self, event_type: str, payload: dict) -> bool:",
        "        if len(self.queue) >= self.max_queue:",
        '            print(f"Warning: Queue full on cluster {self.cluster_id}")',
        "            return False",
        "        packet = {",
        '            "id": self.processed_count + 1,',
        '            "type": event_type,',
        '            "data": payload,',
        '            "timestamp": time.time(),',
        "        }",
        "        self.queue.append(packet)",
        "        return True",
        "",
        "    def drain_batch(self, batch_size: int = 10) -> List[dict]:",
        "        if not self.queue:",
        '            self.state = "IDLE"',
        "            return []",
        '        self.state = "PROCESSING"',
        "        batch = self.queue[:batch_size]",
        "        self.queue = self.queue[batch_size:]",
        "        for item in batch:",
        '            if item.get("type") == "CORRUPT":',
        "                self.failed_count += 1",
        "            else:",
        "                self.processed_count += 1",
        "        return batch",
        "",
        "    def summary(self) -> str:",
        '        return f"[{self.cluster_id}] OK: {self.processed_count}, ERR: {self.failed_count}"',
        "",
        "    def reset_counters(self):",
        "        self.processed_count = 0",
        "        self.failed_count = 0",
        '        self.state = "STANDBY"',
    ],
    "rust": [
        "// High-performance ring buffer with batch consumer",
        "use std::sync::atomic::{AtomicUsize, Ordering};",
        "use std::time::{Duration, Instant};",
        "",
        "pub struct RingBuffer<T> {",
        "    buffer: Vec<Option<T>>,",
        "    capacity: usize,",
        "    head: AtomicUsize,",
        "    tail: AtomicUsize,",
        '    name: String,',
        "}",
        "",
        "impl<T: Clone> RingBuffer<T> {",
        "    pub fn new(capacity: usize, name: &str) -> Self {",
        "        Self {",
        "            buffer: vec![None; capacity],",
        "            capacity,",
        "            head: AtomicUsize::new(0),",
        "            tail: AtomicUsize::new(0),",
        "            name: name.to_string(),",
        "        }",
        "    }",
        "",
        "    pub fn push(&mut self, item: T) -> Result<(), &'static str> {",
        "        let h = self.head.load(Ordering::Acquire);",
        "        let t = self.tail.load(Ordering::Acquire);",
        "        if (h + 1) % self.capacity == t {",
        '            return Err("Queue full");',
        "        }",
        "        self.buffer[h] = Some(item);",
        "        self.head.store((h + 1) % self.capacity, Ordering::Release);",
        "        Ok(())",
        "    }",
        "",
        "    pub fn pop(&mut self) -> Option<T> {",
        "        let h = self.head.load(Ordering::Acquire);",
        "        let t = self.tail.load(Ordering::Acquire);",
        "        if h == t {",
        "            return None;",
        "        }",
        "        let item = self.buffer[t].take();",
        "        self.tail.store((t + 1) % self.capacity, Ordering::Release);",
        "        item",
        "    }",
        "}",
    ],
    "javascript": [
        "// WebSocket connection pool and heartbeat monitor",
        'const EventEmitter = require("events");',
        'const { Buffer } = require("buffer");',
        "",
        "class ConnectionPool extends EventEmitter {",
        "    constructor(maxClients = 1000, pingIntervalMs = 5000) {",
        "        super();",
        "        this.maxClients = maxClients;",
        "        this.pingIntervalMs = pingIntervalMs;",
        "        this.clients = new Map();",
        '        this.status = "INITIALIZING";',
        "    }",
        "",
        "    registerClient(socket, metadata = {}) {",
        "        if (this.clients.size >= this.maxClients) {",
        '            this.emit("error", "Pool capacity exceeded");',
        "            return false;",
        "        }",
        "        const clientId = socket.id || Date.now().toString(16);",
        "        const session = {",
        "            id: clientId,",
        "            socket,",
        "            connectedAt: Date.now(),",
        "            lastPing: Date.now(),",
        "            metadata,",
        "        };",
        "        this.clients.set(clientId, session);",
        '        this.emit("connection", session);',
        "        return clientId;",
        "    }",
        "",
        "    broadcast(payload) {",
        '        const message = JSON.stringify({ type: "BROADCAST", data: payload });',
        "        let sentCount = 0;",
        "        for (const [id, session] of this.clients.entries()) {",
        "            if (session.socket && session.socket.writable) {",
        "                session.socket.write(message);",
        "                sentCount++;",
        "            }",
        "        }",
        "        return sentCount;",
        "    }",
        "}",
    ],
    "c": [
        "/* Multi-threaded memory chunk allocator and guard slab */",
        "#include <stdio.h>",
        "#include <stdlib.h>",
        "#include <stdint.h>",
        "#include <string.h>",
        "",
        "#define CHUNK_MAGIC 0xCAFEBABE",
        "#define ALIGN_BYTES 16",
        "",
        "typedef struct ChunkHeader {",
        "    size_t requested_size;",
        "    uint32_t magic_sentinel;",
        "    struct ChunkHeader* next_free;",
        "    struct ChunkHeader* prev_free;",
        "} ChunkHeader;",
        "",
        "typedef struct MemoryArena {",
        "    uint8_t* base_address;",
        "    size_t total_capacity;",
        "    size_t allocated_bytes;",
        "    ChunkHeader* free_list;",
        "} MemoryArena;",
        "",
        "MemoryArena* arena_init(size_t capacity) {",
        "    MemoryArena* arena = (MemoryArena*)malloc(sizeof(MemoryArena));",
        "    arena->base_address = (uint8_t*)malloc(capacity);",
        "    arena->total_capacity = capacity;",
        "    arena->allocated_bytes = 0;",
        "    arena->free_list = (ChunkHeader*)arena->base_address;",
        "    arena->free_list->requested_size = capacity - sizeof(ChunkHeader);",
        "    arena->free_list->magic_sentinel = CHUNK_MAGIC;",
        "    arena->free_list->next_free = NULL;",
        "    arena->free_list->prev_free = NULL;",
        "    return arena;",
        "}",
        "",
        "void* arena_alloc(MemoryArena* arena, size_t size) {",
        "    if (arena->allocated_bytes + size > arena->total_capacity) {",
        '        fprintf(stderr, "Arena memory pool exhausted\\n");',
        "        return NULL;",
        "    }",
        "    void* ptr = arena->base_address + arena->allocated_bytes;",
        "    arena->allocated_bytes += size;",
        "    return ptr;",
        "}",
        "",
        "void arena_destroy(MemoryArena* arena) {",
        "    if (arena) {",
        "        if (arena->base_address) free(arena->base_address);",
        "        free(arena);",
        "    }",
        "}",
    ]
}


# ---------------------------------------------------------------------------
# Vim Buffer Model
# ---------------------------------------------------------------------------
class VimBuffer:
    def __init__(self, lines: List[str]):
        self.lines = [line for line in lines] if lines else [""]
        self.row = 0
        self.col = 0
        # Inline find memory (f, F, t, T)
        self.last_find_char: Optional[str] = None
        self.last_find_forward: bool = True
        self.last_find_till: bool = False
        # Search memory
        self.last_search_query: Optional[str] = None
        self.last_search_forward: bool = True

    def clamp(self):
        if not self.lines:
            self.lines = [""]
        self.row = max(0, min(len(self.lines) - 1, self.row))
        line_len = len(self.lines[self.row])
        max_col = max(0, line_len - 1) if line_len > 0 else 0
        self.col = max(0, min(max_col, self.col))

    def move_left(self, count: int = 1):
        self.col = max(0, self.col - count)
        self.clamp()

    def move_right(self, count: int = 1):
        line_len = len(self.lines[self.row])
        max_col = max(0, line_len - 1)
        self.col = min(max_col, self.col + count)
        self.clamp()

    def move_up(self, count: int = 1):
        self.row = max(0, self.row - count)
        self.clamp()

    def move_down(self, count: int = 1):
        self.row = min(len(self.lines) - 1, self.row + count)
        self.clamp()

    def move_line_start(self):
        self.col = 0

    def move_first_non_blank(self):
        line = self.lines[self.row]
        for i, ch in enumerate(line):
            if not ch.isspace():
                self.col = i
                return
        self.col = 0

    def move_line_end(self):
        self.col = max(0, len(self.lines[self.row]) - 1)

    def move_top(self):
        self.row = 0
        self.move_first_non_blank()

    def move_bottom(self):
        self.row = len(self.lines) - 1
        self.move_first_non_blank()

    @staticmethod
    def _char_type(ch: str) -> int:
        if ch.isspace():
            return 0
        if ch.isalnum() or ch == '_':
            return 1
        return 2

    def move_word_forward(self, count: int = 1):
        for _ in range(count):
            r, c = self.row, self.col
            curr_line = self.lines[r]
            if not curr_line:
                if r < len(self.lines) - 1:
                    self.row += 1
                    self.col = 0
                continue

            curr_type = self._char_type(curr_line[c])
            # Advance past current word characters
            while c < len(curr_line) and self._char_type(curr_line[c]) == curr_type:
                c += 1
            # Advance past any whitespace
            while c < len(curr_line) and curr_line[c].isspace():
                c += 1

            if c < len(curr_line):
                self.col = c
            else:
                # Wrap to next line
                if r < len(self.lines) - 1:
                    self.row = r + 1
                    self.move_first_non_blank()
                else:
                    self.col = max(0, len(curr_line) - 1)
            self.clamp()

    def move_word_end(self, count: int = 1):
        for _ in range(count):
            r, c = self.row, self.col
            curr_line = self.lines[r]
            if not curr_line or c >= len(curr_line) - 1:
                if r < len(self.lines) - 1:
                    self.row = r + 1
                    self.col = 0
                    self.move_word_end(1)
                continue

            c += 1
            # Skip whitespace
            while c < len(curr_line) and curr_line[c].isspace():
                c += 1
            if c < len(curr_line):
                curr_type = self._char_type(curr_line[c])
                while c + 1 < len(curr_line) and self._char_type(curr_line[c + 1]) == curr_type:
                    c += 1
                self.col = c
            else:
                if r < len(self.lines) - 1:
                    self.row += 1
                    self.col = 0
                    self.move_word_end(1)
            self.clamp()

    def move_word_backward(self, count: int = 1):
        for _ in range(count):
            r, c = self.row, self.col
            if c == 0:
                if r > 0:
                    self.row -= 1
                    self.col = max(0, len(self.lines[self.row]) - 1)
                continue

            curr_line = self.lines[r]
            c -= 1
            # Skip whitespace backward
            while c > 0 and curr_line[c].isspace():
                c -= 1
            target_type = self._char_type(curr_line[c])
            while c > 0 and self._char_type(curr_line[c - 1]) == target_type:
                c -= 1
            self.col = c
            self.clamp()

    def find_char_forward(self, target: str, count: int = 1, till: bool = False) -> bool:
        self.last_find_char = target
        self.last_find_forward = True
        self.last_find_till = till

        line = self.lines[self.row]
        c = self.col
        found = 0
        for idx in range(c + 1, len(line)):
            if line[idx] == target:
                found += 1
                if found == count:
                    self.col = idx - 1 if till else idx
                    self.clamp()
                    return True
        return False

    def find_char_backward(self, target: str, count: int = 1, till: bool = False) -> bool:
        self.last_find_char = target
        self.last_find_forward = False
        self.last_find_till = till

        line = self.lines[self.row]
        c = self.col
        found = 0
        for idx in range(c - 1, -1, -1):
            if line[idx] == target:
                found += 1
                if found == count:
                    self.col = idx + 1 if till else idx
                    self.clamp()
                    return True
        return False

    def repeat_find(self, reverse: bool = False) -> bool:
        if not self.last_find_char:
            return False
        forward = self.last_find_forward if not reverse else not self.last_find_forward
        if forward:
            return self.find_char_forward(self.last_find_char, 1, self.last_find_till)
        else:
            return self.find_char_backward(self.last_find_char, 1, self.last_find_till)

    def search(self, pattern: str, forward: bool = True) -> bool:
        if not pattern:
            return False
        self.last_search_query = pattern
        self.last_search_forward = forward

        total_lines = len(self.lines)
        start_r = self.row
        start_c = self.col

        lines_order = list(range(start_r, total_lines)) + list(range(0, start_r))
        if not forward:
            lines_order.reverse()

        for r in lines_order:
            line = self.lines[r]
            try:
                matches = list(re.finditer(re.escape(pattern), line))
            except Exception:
                continue

            if not matches:
                continue

            if r == start_r:
                if forward:
                    valid_matches = [m for m in matches if m.start() > start_c]
                else:
                    valid_matches = [m for m in matches if m.start() < start_c]
                if valid_matches:
                    target_match = valid_matches[0] if forward else valid_matches[-1]
                    self.row = r
                    self.col = target_match.start()
                    self.clamp()
                    return True
            else:
                target_match = matches[0] if forward else matches[-1]
                self.row = r
                self.col = target_match.start()
                self.clamp()
                return True
        return False

    def get_word_span_at_cursor(self) -> Optional[Tuple[int, int, int]]:
        line = self.lines[self.row]
        if not line or self.col >= len(line):
            return None
        c = self.col
        t = self._char_type(line[c])
        if t == 0:
            return None
        start = c
        while start > 0 and self._char_type(line[start - 1]) == t:
            start -= 1
        end = c
        while end + 1 < len(line) and self._char_type(line[end + 1]) == t:
            end += 1
        return (self.row, start, end)

    def get_delim_span(self, delim: str, inside: bool = True) -> Optional[Tuple[int, int, int]]:
        line = self.lines[self.row]
        c = self.col
        pairs = {'(': ')', '{': '}', '[': ']', '<': '>', '"': '"', "'": "'"}
        open_delim = delim
        close_delim = pairs.get(delim, delim)

        # For quotes
        if open_delim in ('"', "'"):
            indices = [i for i, ch in enumerate(line) if ch == open_delim]
            if len(indices) >= 2:
                # Find enclosing pair around cursor
                for i in range(len(indices) - 1):
                    q1, q2 = indices[i], indices[i + 1]
                    if q1 <= c <= q2:
                        if inside:
                            return (self.row, q1 + 1, q2 - 1)
                        return (self.row, q1, q2)
                # Or find nearest on line
                q1, q2 = indices[0], indices[1]
                if inside:
                    return (self.row, q1 + 1, q2 - 1)
                return (self.row, q1, q2)

        # For brackets
        open_idx = -1
        for i in range(c, -1, -1):
            if line[i] == open_delim:
                open_idx = i
                break
        if open_idx != -1:
            close_idx = -1
            depth = 1
            for i in range(open_idx + 1, len(line)):
                if line[i] == open_delim:
                    depth += 1
                elif line[i] == close_delim:
                    depth -= 1
                    if depth == 0:
                        close_idx = i
                        break
            if close_idx != -1:
                if inside:
                    return (self.row, open_idx + 1, close_idx - 1)
                return (self.row, open_idx, close_idx)
        return None


# ---------------------------------------------------------------------------
# Vim Command Parser & State Machine
# ---------------------------------------------------------------------------
class VimEngine:
    def __init__(self, buffer: VimBuffer):
        self.buf = buffer
        self.count_str = ""
        self.pending_op: Optional[str] = None       # 'd', 'c', 'g'
        self.pending_action: Optional[str] = None   # 'f', 'F', 't', 'T'
        self.pending_text_obj: Optional[str] = None # 'i', 'a'
        self.is_searching = False
        self.search_buffer = ""
        self.showcmd = ""

    def reset_pending(self):
        self.count_str = ""
        self.pending_op = None
        self.pending_action = None
        self.pending_text_obj = None
        self.is_searching = False
        self.search_buffer = ""
        self.showcmd = ""

    def get_count(self) -> int:
        if self.count_str:
            try:
                cnt = int(self.count_str)
                return cnt if cnt > 0 else 1
            except ValueError:
                return 1
        return 1

    def feed_key(self, ch: str) -> Optional[dict]:
        """
        Feeds a keystroke into the engine. Returns an event dictionary if an action
        occurred, e.g.:
          {'type': 'motion', 'command': 'w'}
          {'type': 'operator', 'command': 'dw', 'span': (r, c1, c2)}
          {'type': 'operator', 'command': 'ci"', 'span': (r, c1, c2)}
          {'type': 'search', 'query': 'foo'}
        """
        # ESC resets pending state
        if ch in ('\x1b', 'ESC'):
            self.reset_pending()
            return {'type': 'cancel', 'command': 'ESC'}

        # Search mode
        if self.is_searching:
            if ch in ('\n', '\r'):
                query = self.search_buffer
                self.is_searching = False
                self.showcmd = ""
                success = self.buf.search(query, forward=True)
                return {'type': 'search', 'query': query, 'success': success}
            elif ch in ('\x7f', '\b', 'KEY_BACKSPACE'):
                self.search_buffer = self.search_buffer[:-1]
                self.showcmd = "/" + self.search_buffer
                return None
            else:
                self.search_buffer += ch
                self.showcmd = "/" + self.search_buffer
                return None

        # Inline find target char expected
        if self.pending_action in ('f', 'F', 't', 'T'):
            action = self.pending_action
            count = self.get_count()
            self.pending_action = None
            self.count_str = ""
            self.showcmd = ""

            if action == 'f':
                self.buf.find_char_forward(ch, count, till=False)
            elif action == 'F':
                self.buf.find_char_backward(ch, count, till=False)
            elif action == 't':
                self.buf.find_char_forward(ch, count, till=True)
            elif action == 'T':
                self.buf.find_char_backward(ch, count, till=True)

            return {'type': 'motion', 'command': f"{action}{ch}"}

        # Text object modifier expected (e.g. ci", da()
        if self.pending_text_obj:
            mode = self.pending_text_obj # 'i' or 'a'
            op = self.pending_op or 'c'
            inside = (mode == 'i')
            cmd_name = f"{op}{mode}{ch}"

            span = None
            if ch in ('w', 'W'):
                span = self.buf.get_word_span_at_cursor()
            elif ch in ('"', "'", '(', ')', '{', '}', '[', ']', '<', '>'):
                delim = '(' if ch == ')' else ('{' if ch == '}' else ('[' if ch == ']' else ch))
                span = self.buf.get_delim_span(delim, inside=inside)

            self.reset_pending()
            return {'type': 'operator', 'command': cmd_name, 'span': span, 'op': op, 'inside': inside, 'target': ch}

        # Counting prefix
        if ch.isdigit() and (ch != '0' or self.count_str != ""):
            self.count_str += ch
            self.showcmd = self.count_str
            return None

        count = self.get_count()

        # Operator pending: 'd' or 'c'
        if self.pending_op in ('d', 'c'):
            op = self.pending_op
            # Check for text object: i or a
            if ch in ('i', 'a'):
                self.pending_text_obj = ch
                self.showcmd = f"{op}{ch}"
                return None

            # Check line delete: dd or cc
            if ch == op:
                row = self.buf.row
                span = (row, 0, max(0, len(self.buf.lines[row]) - 1))
                self.reset_pending()
                return {'type': 'operator', 'command': f"{op}{op}", 'span': span, 'row': row}

            # Check motion operator: dw, de, d$, etc.
            span = None
            r = self.buf.row
            c = self.buf.col
            if ch == 'w':
                old_c = c
                self.buf.move_word_forward(count)
                new_c = self.buf.col
                span = (r, min(old_c, new_c), max(old_c, new_c))
                self.buf.col = old_c
            elif ch == 'e':
                old_c = c
                self.buf.move_word_end(count)
                new_c = self.buf.col
                span = (r, min(old_c, new_c), max(old_c, new_c))
                self.buf.col = old_c
            elif ch == '$':
                span = (r, c, max(0, len(self.buf.lines[r]) - 1))

            self.reset_pending()
            return {'type': 'operator', 'command': f"{op}{ch}", 'span': span}

        # 'g' pending for gg
        if self.pending_op == 'g':
            if ch == 'g':
                self.buf.move_top()
                self.reset_pending()
                return {'type': 'motion', 'command': 'gg'}
            self.reset_pending()
            return None

        # Standard Normal Mode Motions & Actions
        if ch == 'h':
            self.buf.move_left(count)
            self.reset_pending()
            return {'type': 'motion', 'command': 'h'}
        elif ch == 'l':
            self.buf.move_right(count)
            self.reset_pending()
            return {'type': 'motion', 'command': 'l'}
        elif ch == 'j':
            self.buf.move_down(count)
            self.reset_pending()
            return {'type': 'motion', 'command': 'j'}
        elif ch == 'k':
            self.buf.move_up(count)
            self.reset_pending()
            return {'type': 'motion', 'command': 'k'}
        elif ch == 'w':
            self.buf.move_word_forward(count)
            self.reset_pending()
            return {'type': 'motion', 'command': 'w'}
        elif ch == 'e':
            self.buf.move_word_end(count)
            self.reset_pending()
            return {'type': 'motion', 'command': 'e'}
        elif ch == 'b':
            self.buf.move_word_backward(count)
            self.reset_pending()
            return {'type': 'motion', 'command': 'b'}
        elif ch == '0':
            self.buf.move_line_start()
            self.reset_pending()
            return {'type': 'motion', 'command': '0'}
        elif ch == '^':
            self.buf.move_first_non_blank()
            self.reset_pending()
            return {'type': 'motion', 'command': '^'}
        elif ch == '$':
            self.buf.move_line_end()
            self.reset_pending()
            return {'type': 'motion', 'command': '$'}
        elif ch == 'G':
            self.buf.move_bottom()
            self.reset_pending()
            return {'type': 'motion', 'command': 'G'}
        elif ch == 'g':
            self.pending_op = 'g'
            self.showcmd = "g"
            return None
        elif ch in ('f', 'F', 't', 'T'):
            self.pending_action = ch
            self.showcmd = f"{self.count_str}{ch}"
            return None
        elif ch == ';':
            self.buf.repeat_find(reverse=False)
            self.reset_pending()
            return {'type': 'motion', 'command': ';'}
        elif ch == ',':
            self.buf.repeat_find(reverse=True)
            self.reset_pending()
            return {'type': 'motion', 'command': ','}
        elif ch == 'x':
            r = self.buf.row
            c = self.buf.col
            span = (r, c, c)
            self.reset_pending()
            return {'type': 'operator', 'command': 'x', 'span': span}
        elif ch == 'D':
            r = self.buf.row
            c = self.buf.col
            span = (r, c, max(0, len(self.buf.lines[r]) - 1))
            self.reset_pending()
            return {'type': 'operator', 'command': 'D', 'span': span}
        elif ch == 'd':
            self.pending_op = 'd'
            self.showcmd = f"{self.count_str}d"
            return None
        elif ch == 'c':
            self.pending_op = 'c'
            self.showcmd = f"{self.count_str}c"
            return None
        elif ch == '/':
            self.is_searching = True
            self.search_buffer = ""
            self.showcmd = "/"
            return None
        elif ch == 'n':
            if self.buf.last_search_query:
                self.buf.search(self.buf.last_search_query, forward=True)
                return {'type': 'motion', 'command': 'n'}
        elif ch == 'N':
            if self.buf.last_search_query:
                self.buf.search(self.buf.last_search_query, forward=False)
                return {'type': 'motion', 'command': 'N'}

        # Unrecognized key
        self.reset_pending()
        return None


# ---------------------------------------------------------------------------
# Bug & Threat Entity
# ---------------------------------------------------------------------------
@dataclass
class Bug:
    id: int
    row: int
    start_col: int
    end_col: int
    name: str
    required_action: str  # 'LAND', 'x', 'dw', 'dd', 'ci"', 'di"', 'ciw', 'diw', 'da('
    original_text: str
    display_badge: str
    max_duration: float
    time_left: float
    points: int = 100

    def contains_cursor(self, row: int, col: int) -> bool:
        return self.row == row and self.start_col <= col <= self.end_col

    def overlaps_span(self, row: int, c1: int, c2: int) -> bool:
        if self.row != row:
            return False
        span_min = min(c1, c2)
        span_max = max(c1, c2)
        return not (self.end_col < span_min or self.start_col > span_max)


# ---------------------------------------------------------------------------
# Visual Particle / Spark Effect
# ---------------------------------------------------------------------------
@dataclass
class Spark:
    row: float
    col: float
    vr: float
    vc: float
    char: str
    life: float
    max_life: float
    color_pair: int


# ---------------------------------------------------------------------------
# Stage Definitions
# ---------------------------------------------------------------------------
STAGES = [
    # -----------------------------------------------------------------------
    # PHASE 1: BASIC MOTIONS
    # -----------------------------------------------------------------------
    {
        "id": 1,
        "phase_id": 1,
        "sub_level": "Basic (Novice)",
        "title": "Level 1.1: Basic Motions (Novice)",
        "description": "Learn the essential motions: h, j, k, l, 0, $ on a short buffer.",
        "difficulty": "Basic",
        "length": "Short (12 lines)",
        "buffer_tier": "short",
        "allowed_actions": ["LAND"],
        "target_bugs": 5,
        "max_concurrent": 1,
        "spawn_interval": 3.0,
        "bug_duration": 35.0,
        "briefing": [
            "PHASE 1: BASIC MOTIONS — LEVEL 1.1: BASIC (NOVICE)",
            "A short, friendly buffer designed to build single-key directional instincts.",
            "",
            "🎯 GOAL: Move your cursor directly onto 5 glitches to squash them.",
            "⚡ PACING: 1 bug at a time │ Generous 35s timer │ Short buffer (12 lines)",
            "",
            "⌨️  MOTIONS TO PRACTICE:",
            "  • [h / l] : Move Left / Right by 1 character",
            "  • [j / k] : Move Down / Up by 1 line",
            "  • [0 / $] : Jump directly to beginning / end of line",
            "",
            "💡 TIP: Follow the '💡 SUGGESTED' bar at the top! Simply landing on the bug squashes it.",
        ],
        "hint": "Navigate onto the bug using hjkl or 0/$ to squash it!",
    },
    {
        "id": 2,
        "phase_id": 1,
        "sub_level": "Intermediate",
        "title": "Level 1.2: Basic Motions (Intermediate)",
        "description": "Master word jumps (w, b, e) across a medium-length buffer.",
        "difficulty": "Intermediate",
        "length": "Medium (24 lines)",
        "buffer_tier": "medium",
        "allowed_actions": ["LAND"],
        "target_bugs": 8,
        "max_concurrent": 2,
        "spawn_interval": 3.0,
        "bug_duration": 25.0,
        "briefing": [
            "PHASE 1: BASIC MOTIONS — LEVEL 1.2: INTERMEDIATE",
            "A medium buffer introducing fast word navigation.",
            "",
            "🎯 GOAL: Squash 8 glitches before their timers expire.",
            "⚡ PACING: Up to 2 concurrent bugs │ 25s timer │ Medium buffer (24 lines)",
            "",
            "⌨️  MOTIONS TO PRACTICE:",
            "  • [w] : Jump forward to the start of the next word",
            "  • [b] : Jump backward to the start of the previous word",
            "  • [e] : Jump forward to the end of the word",
            "  • [j / k] : Move lines vertically",
            "",
            "💡 TIP: Use 'w' and 'b' to jump across words rather than tapping 'l' repeatedly!",
        ],
        "hint": "Use 'w' and 'b' to jump across words quickly to reach bugs!",
    },
    {
        "id": 3,
        "phase_id": 1,
        "sub_level": "Hard (Endurance)",
        "title": "Level 1.3: Basic Motions (Hard / Endurance)",
        "description": "Multi-screen scrolling buffer with gg and G file leaps.",
        "difficulty": "Hard",
        "length": "Long (42 lines)",
        "buffer_tier": "long",
        "allowed_actions": ["LAND"],
        "target_bugs": 12,
        "max_concurrent": 3,
        "spawn_interval": 2.5,
        "bug_duration": 18.0,
        "briefing": [
            "PHASE 1: BASIC MOTIONS — LEVEL 1.3: HARD (ENDURANCE)",
            "A long 40+ line codebase that extends well beyond a single screen!",
            "",
            "🎯 GOAL: Squash 12 glitches scattered across the entire file.",
            "⚡ PACING: Up to 3 concurrent bugs │ Fast 18s timer │ Long buffer (42 lines)",
            "",
            "⌨️  MOTIONS TO PRACTICE:",
            "  • [gg] : Jump immediately to the top of the file (Line 1)",
            "  • [G]  : Jump immediately to the bottom of the file (Last line)",
            "  • [w / b / e] : Rapid token jumping across lines",
            "",
            "💡 TIP: Use 'gg' and 'G' to leap between the top and bottom of the file in one keystroke!",
        ],
        "hint": "Master 'gg' and 'G' to leap across the long file!",
    },

    # -----------------------------------------------------------------------
    # PHASE 2: IN-LINE FIND & COUNTS
    # -----------------------------------------------------------------------
    {
        "id": 4,
        "phase_id": 2,
        "sub_level": "Basic (Novice)",
        "title": "Level 2.1: In-line Find (Novice)",
        "description": "Forward in-line character search with f<char> and repeat ;.",
        "difficulty": "Basic",
        "length": "Short (14 lines)",
        "buffer_tier": "short",
        "allowed_actions": ["LAND", "LEAP"],
        "target_bugs": 6,
        "max_concurrent": 1,
        "spawn_interval": 3.2,
        "bug_duration": 30.0,
        "briefing": [
            "PHASE 2: IN-LINE FIND — LEVEL 2.1: BASIC (NOVICE)",
            "Learn precision in-line jumping with the 'f' (find) command.",
            "",
            "🎯 GOAL: Leap directly to 6 distant glitches.",
            "⚡ PACING: 1 bug at a time │ 30s timer │ Short buffer (14 lines)",
            "",
            "⌨️  MOTIONS TO PRACTICE:",
            "  • [f<char>] : Jump forward directly to <char> (e.g. f\" or f;)",
            "  • [;]       : Repeat the last find motion forward",
            "",
            "💡 TIP: Type 'f' followed by the target punctuation or letter to jump to it instantly!",
        ],
        "hint": "Use f<char> to jump directly to targets, and ; to repeat!",
    },
    {
        "id": 5,
        "phase_id": 2,
        "sub_level": "Intermediate",
        "title": "Level 2.2: In-line Find (Intermediate)",
        "description": "Backward find (F, T), till jumps (t), and reverse repeat (,).",
        "difficulty": "Intermediate",
        "length": "Medium (24 lines)",
        "buffer_tier": "medium",
        "allowed_actions": ["LAND", "LEAP"],
        "target_bugs": 9,
        "max_concurrent": 2,
        "spawn_interval": 3.0,
        "bug_duration": 22.0,
        "briefing": [
            "PHASE 2: IN-LINE FIND — LEVEL 2.2: INTERMEDIATE",
            "Master bidirectional in-line leaps and 'till' motions.",
            "",
            "🎯 GOAL: Neutralize 9 glitches across medium-length code lines.",
            "⚡ PACING: Up to 2 concurrent bugs │ 22s timer │ Medium buffer (24 lines)",
            "",
            "⌨️  MOTIONS TO PRACTICE:",
            "  • [t<char>] : Jump 'till' one character before <char>",
            "  • [F<char>] : Jump backward to <char>",
            "  • [T<char>] : Jump backward 'till' one character after <char>",
            "  • [,]       : Repeat the last find motion in reverse",
            "",
            "💡 TIP: If you overshoot a find, press ',' to step backward immediately!",
        ],
        "hint": "Use F/T to search backwards and , to reverse repeat!",
    },
    {
        "id": 6,
        "phase_id": 2,
        "sub_level": "Hard (Endurance)",
        "title": "Level 2.3: In-line Find & Counts (Hard)",
        "description": "Numeric multipliers (3w, 4j) combined with precision find.",
        "difficulty": "Hard",
        "length": "Long (42 lines)",
        "buffer_tier": "long",
        "allowed_actions": ["LAND", "LEAP"],
        "target_bugs": 14,
        "max_concurrent": 3,
        "spawn_interval": 2.5,
        "bug_duration": 16.0,
        "briefing": [
            "PHASE 2: IN-LINE FIND — LEVEL 2.3: HARD (ENDURANCE)",
            "Combine numeric count prefixes with precision in-line leaps across 40+ lines.",
            "",
            "🎯 GOAL: Neutralize 14 glitches under tight time pressure.",
            "⚡ PACING: Up to 3 concurrent bugs │ 16s timer │ Long buffer (42 lines)",
            "",
            "⌨️  MOTIONS TO PRACTICE:",
            "  • [3j / 4k] : Type a count before vertical motions to leap rows",
            "  • [2w / 3b] : Type a count before word motions",
            "  • [f<char>] : Fast precision lock-on",
            "",
            "💡 TIP: Check the '💡 SUGGESTED' guide—it shows the fastest count combo (e.g. '5j')!",
        ],
        "hint": "Use counts like 3w and 4j to traverse large distances in one leap!",
    },

    # -----------------------------------------------------------------------
    # PHASE 3: OPERATORS & DELETIONS
    # -----------------------------------------------------------------------
    {
        "id": 7,
        "phase_id": 3,
        "sub_level": "Basic (Novice)",
        "title": "Level 3.1: Operators (Novice)",
        "description": "Zap characters with x and delete words with dw.",
        "difficulty": "Basic",
        "length": "Short (14 lines)",
        "buffer_tier": "short",
        "allowed_actions": ["LAND", "x", "dw"],
        "target_bugs": 6,
        "max_concurrent": 2,
        "spawn_interval": 3.2,
        "bug_duration": 26.0,
        "briefing": [
            "PHASE 3: OPERATORS — LEVEL 3.1: BASIC (NOVICE)",
            "Landing on bugs is no longer enough—now you must delete them!",
            "",
            "🎯 GOAL: Execute the specific deletion operator required by each bug.",
            "⚡ PACING: Up to 2 concurrent bugs │ 26s timer │ Short buffer (14 lines)",
            "",
            "⌨️  OPERATORS TO PRACTICE:",
            "  • [x]  : Zap the bad character under cursor (neutralizes [x] BitFlip)",
            "  • [dw] : Delete word from cursor to next word (neutralizes [dw] DeadCode)",
            "",
            "💡 TIP: Move to the target first. The HUD will say 'READY: Press dw now'!",
        ],
        "hint": "Press 'x' to zap bad characters and 'dw' to delete rogue words!",
    },
    {
        "id": 8,
        "phase_id": 3,
        "sub_level": "Intermediate",
        "title": "Level 3.2: Operators (Intermediate)",
        "description": "Whole line deletion (dd), delete to end of line (D), and change word (cw).",
        "difficulty": "Intermediate",
        "length": "Medium (24 lines)",
        "buffer_tier": "medium",
        "allowed_actions": ["LAND", "x", "dw", "dd"],
        "target_bugs": 10,
        "max_concurrent": 2,
        "spawn_interval": 3.0,
        "bug_duration": 20.0,
        "briefing": [
            "PHASE 3: OPERATORS — LEVEL 3.2: INTERMEDIATE",
            "Eradicate entire corrupted lines and rogue expressions.",
            "",
            "🎯 GOAL: Neutralize 10 threats using line and word deletion operators.",
            "⚡ PACING: Up to 2 concurrent bugs │ 20s timer │ Medium buffer (24 lines)",
            "",
            "⌨️  OPERATORS TO PRACTICE:",
            "  • [dd] : Wipe an entire corrupted line (neutralizes [dd] FatalException)",
            "  • [D]  : Delete from cursor to end of line",
            "  • [dw] : Delete word",
            "",
            "💡 TIP: For 'dd', you just need to be anywhere on that line—press 'dd' to wipe it!",
        ],
        "hint": "Press 'dd' anywhere on a corrupted line to neutralize FatalException!",
    },
    {
        "id": 9,
        "phase_id": 3,
        "sub_level": "Hard (Endurance)",
        "title": "Level 3.3: Operators & Search (Hard)",
        "description": "Full operator suite + /search pattern lock across 42 lines.",
        "difficulty": "Hard",
        "length": "Long (42 lines)",
        "buffer_tier": "long",
        "allowed_actions": ["LAND", "x", "dw", "dd", "/"],
        "target_bugs": 15,
        "max_concurrent": 3,
        "spawn_interval": 2.5,
        "bug_duration": 15.0,
        "briefing": [
            "PHASE 3: OPERATORS — LEVEL 3.3: HARD (ENDURANCE)",
            "High-speed operator execution across a sprawling 40+ line codebase!",
            "",
            "🎯 GOAL: Neutralize 15 threats using deletions and /search.",
            "⚡ PACING: Up to 3 concurrent bugs │ 15s timer │ Long buffer (42 lines)",
            "",
            "⌨️  TECHNIQUES TO PRACTICE:",
            "  • [/pattern] : Press '/', type text, and press Enter to search directly",
            "  • [dd / dw / x] : Rapid neutralization once on target",
            "",
            "💡 TIP: When a threat is far down the file, type '/' and the bug token to lock on instantly!",
        ],
        "hint": "Use /search to instantly jump to threats, then execute the operator!",
    },

    # -----------------------------------------------------------------------
    # PHASE 4: TEXT OBJECTS SURGERY
    # -----------------------------------------------------------------------
    {
        "id": 10,
        "phase_id": 4,
        "sub_level": "Basic (Novice)",
        "title": "Level 4.1: Text Objects Quotes (Novice)",
        "description": "Change/delete inside string quotes with ci\" and di\".",
        "difficulty": "Basic",
        "length": "Short (14 lines)",
        "buffer_tier": "short",
        "allowed_actions": ["LAND", "ci\"", "di\""],
        "target_bugs": 7,
        "max_concurrent": 2,
        "spawn_interval": 3.2,
        "bug_duration": 24.0,
        "briefing": [
            "PHASE 4: TEXT OBJECTS — LEVEL 4.1: BASIC (NOVICE)",
            "Vim superpower: operate inside quotes without counting characters!",
            "",
            "🎯 GOAL: Neutralize 7 rogue string corruptions.",
            "⚡ PACING: Up to 2 concurrent bugs │ 24s timer │ Short buffer (14 lines)",
            "",
            "⌨️  TEXT OBJECTS TO PRACTICE:",
            "  • [ci\"] : Change inside double quotes",
            "  • [di\"] : Delete inside double quotes",
            "",
            "💡 TIP: You do NOT need to be on the quote marks—anywhere inside the string works!",
        ],
        "hint": "Step inside quotes and press ci\" or di\" to extract corrupted strings!",
    },
    {
        "id": 11,
        "phase_id": 4,
        "sub_level": "Intermediate",
        "title": "Level 4.2: Text Objects Words & Blocks (Intermediate)",
        "description": "Word text objects (ciw, diw) and parenthesis blocks (da(, di().",
        "difficulty": "Intermediate",
        "length": "Medium (24 lines)",
        "buffer_tier": "medium",
        "allowed_actions": ["LAND", "dw", "ci\"", "di\"", "ciw", "diw", "da("],
        "target_bugs": 11,
        "max_concurrent": 2,
        "spawn_interval": 3.0,
        "bug_duration": 18.0,
        "briefing": [
            "PHASE 4: TEXT OBJECTS — LEVEL 4.2: INTERMEDIATE",
            "Surgically extract words and parenthesized code blocks.",
            "",
            "🎯 GOAL: Neutralize 11 threats using word and block text objects.",
            "⚡ PACING: Up to 2 concurrent bugs │ 18s timer │ Medium buffer (24 lines)",
            "",
            "⌨️  TEXT OBJECTS TO PRACTICE:",
            "  • [ciw / diw] : Change / delete inside current word",
            "  • [da( / ca(] : Delete / change around parentheses block",
            "",
            "💡 TIP: 'ciw' works from ANY character of the word—no need to move to the beginning!",
        ],
        "hint": "Use ciw/diw inside words and da( inside parentheses!",
    },
    {
        "id": 12,
        "phase_id": 4,
        "sub_level": "Hard (Endurance)",
        "title": "Level 4.3: Full Text Objects Surgery (Hard)",
        "description": "Complete text objects arsenal across complex nested code.",
        "difficulty": "Hard",
        "length": "Long (42 lines)",
        "buffer_tier": "long",
        "allowed_actions": ["LAND", "dw", "dd", "ci\"", "di\"", "ciw", "diw", "da("],
        "target_bugs": 16,
        "max_concurrent": 3,
        "spawn_interval": 2.5,
        "bug_duration": 14.0,
        "briefing": [
            "PHASE 4: TEXT OBJECTS — LEVEL 4.3: HARD (ENDURANCE)",
            "The final exam before Endless Mode! Full surgical mastery under extreme pressure.",
            "",
            "🎯 GOAL: Neutralize 16 complex corruptions across a 40+ line codebase.",
            "⚡ PACING: Up to 3 concurrent bugs │ Fast 14s timer │ Long buffer (42 lines)",
            "",
            "⌨️  TEXT OBJECTS TO PRACTICE:",
            "  • [ci\" / di\"] : String quotes",
            "  • [ciw / diw] : Word tokens",
            "  • [da( / ca(] : Parenthesis blocks",
            "  • [dd / dw]   : Line and word deletions",
            "",
            "💡 TIP: Trust your muscle memory! Step inside the structure and execute the combo!",
        ],
        "hint": "Combine all text objects to neutralize complex code threats rapidly!",
    },

    # -----------------------------------------------------------------------
    # ENDLESS SURVIVAL MODE
    # -----------------------------------------------------------------------
    {
        "id": 13,
        "phase_id": 5,
        "sub_level": "Survival",
        "title": "Endless Survival Mode",
        "description": "Infinite escalating waves with all Vim motions, operators, and text objects.",
        "difficulty": "Uncapped",
        "length": "Endless",
        "buffer_tier": "long",
        "allowed_actions": ["LAND", "x", "dw", "dd", "ci\"", "di\"", "ciw", "diw", "da("],
        "target_bugs": 999999,
        "max_concurrent": 4,
        "spawn_interval": 2.5,
        "bug_duration": 14.0,
        "briefing": [
            "⚡ ENDLESS SURVIVAL MODE ⚡",
            "The ultimate Vim trial! Infinite escalating waves of rogue code bugs.",
            "",
            "🎯 OBJECTIVE:",
            "  • Maintain your combo multiplier up to x8.0 by neutralizing threats quickly.",
            "  • As your score climbs, bugs spawn faster and timers decrease down to 4s!",
            "  • Press [P] at any time if you need to pause and catch your breath.",
            "",
            "Good luck, Master Defender!",
        ],
        "hint": "Maintain your combo multiplier by neutralizing bugs rapidly without missing!",
    },
]

# Phase organization metadata
PHASES = [
    {
        "id": 1,
        "title": "Phase 1: Basic Motions",
        "description": "hjkl single-step, w/b/e word jumps, 0/$, and gg/G file leaps",
        "stage_indices": [0, 1, 2],
    },
    {
        "id": 2,
        "title": "Phase 2: In-line Find & Counts",
        "description": "f/t/F/T, ;, ,, and count multipliers (3w, 4j, 2k)",
        "stage_indices": [3, 4, 5],
    },
    {
        "id": 3,
        "title": "Phase 3: Operators & Deletions",
        "description": "x zap, dw word-cut, dd line-cut, and /search pattern lock",
        "stage_indices": [6, 7, 8],
    },
    {
        "id": 4,
        "title": "Phase 4: Text Objects Surgery",
        "description": "ci\"/di\" quotes, ciw/diw words, and da(/ca( blocks",
        "stage_indices": [9, 10, 11],
    },
]


# ---------------------------------------------------------------------------
# Main Game Class
# ---------------------------------------------------------------------------
class VimDefenderGame:
    def __init__(self, stdscr):
        self.stdscr = stdscr
        self.scores_data = load_high_scores()
        self.high_score = self.scores_data.get("high_score", 0)

        # Game state
        self.state = "MENU" # MENU, PHASE_MENU, PLAYING, PAUSED, GAME_OVER, STAGE_CLEAR, HELP
        self.stage_idx = 0
        self.selected_menu_idx = 0
        self.selected_phase = 0
        self.selected_sub_idx = 0
        self.integrity = 100.0
        self.max_integrity = 100.0
        self.score = 0
        self.combo = 1.0
        self.combo_timer = 0.0
        self.bugs_cleared = 0
        self.stage_bugs_cleared = 0

        # Buffer & Engine
        self.buffer: Optional[VimBuffer] = None
        self.engine: Optional[VimEngine] = None
        self.bugs: List[Bug] = []
        self.sparks: List[Spark] = []
        self.next_bug_id = 1
        self.last_spawn_time = 0.0
        self.last_key_time = time.time()
        self.last_error_flash = 0.0
        self.notification = ""
        self.notification_timer = 0.0

        # Colors initialization
        self.init_curses()

    def init_curses(self):
        try:
            curses.curs_set(0) # Hide terminal cursor, we render custom Vim block cursor
            self.stdscr.nodelay(True) # Non-blocking input
            self.stdscr.keypad(True)
            curses.start_color()
            curses.use_default_colors()
        except Exception:
            pass

        # Color pairs
        # 1: Normal editor text
        # 2: Line numbers
        # 3: Statusline NORMAL
        # 4: Keywords
        # 5: Strings
        # 6: Comments
        # 7: Warning Bug (Yellow)
        # 8: Critical Bug (Red Alert)
        # 9: Bug Badge
        # 10: Sparks / FX
        # 11: Success / Green
        # 12: Accent Cyan
        try:
            curses.init_pair(1, curses.COLOR_WHITE, -1)
            curses.init_pair(2, curses.COLOR_CYAN, -1)
            curses.init_pair(3, curses.COLOR_BLACK, curses.COLOR_GREEN)
            curses.init_pair(4, curses.COLOR_BLUE, -1)
            curses.init_pair(5, curses.COLOR_GREEN, -1)
            curses.init_pair(6, curses.COLOR_WHITE, -1) # with dim attribute
            curses.init_pair(7, curses.COLOR_YELLOW, -1)
            curses.init_pair(8, curses.COLOR_RED, -1)
            curses.init_pair(9, curses.COLOR_BLACK, curses.COLOR_RED)
            curses.init_pair(10, curses.COLOR_YELLOW, -1)
            curses.init_pair(11, curses.COLOR_GREEN, -1)
            curses.init_pair(12, curses.COLOR_CYAN, -1)
            curses.init_pair(13, curses.COLOR_BLACK, curses.COLOR_WHITE) # Cursor
            curses.init_pair(14, curses.COLOR_BLACK, curses.COLOR_YELLOW) # Search highlight
        except Exception:
            pass

    def start_stage(self, stage_idx: int, show_briefing: bool = True):
        self.stage_idx = stage_idx
        stage_cfg = STAGES[stage_idx]
        tier = stage_cfg.get("buffer_tier", "medium")
        if tier == "short":
            pool = CODE_TEMPLATES_SHORT
        elif tier == "long":
            pool = CODE_TEMPLATES_LONG
        else:
            pool = CODE_TEMPLATES

        lang = random.choice(list(pool.keys()))
        code_lines = pool[lang]

        self.buffer = VimBuffer(code_lines)
        self.engine = VimEngine(self.buffer)
        self.bugs.clear()
        self.sparks.clear()
        self.integrity = 100.0
        self.combo = 1.0
        self.combo_timer = 0.0
        self.stage_bugs_cleared = 0
        self.state = "STAGE_BRIEFING" if show_briefing else "PLAYING"
        self.last_spawn_time = time.time()
        self.last_key_time = time.time()

        # Initial spawn
        self.spawn_bug()
        if stage_cfg.get("max_concurrent", 1) > 1:
            self.spawn_bug()

    def get_guidance(self) -> Tuple[str, str]:
        if not self.bugs or not self.buffer:
            return ("Buffer clean! Scanning for next threat...", "Stand by...")

        bug = min(self.bugs, key=lambda b: b.time_left)
        cur_r = self.buffer.row
        cur_c = self.buffer.col
        diff_r = bug.row - cur_r

        vertical_action = ""
        if diff_r > 0:
            vertical_action = f"{diff_r}j" if diff_r > 1 else "j"
        elif diff_r < 0:
            vertical_action = f"{abs(diff_r)}k" if abs(diff_r) > 1 else "k"

        on_same_line = (diff_r == 0)
        is_on_bug = (on_same_line and bug.start_col <= cur_c <= bug.end_col)

        horizontal_action = ""
        if on_same_line:
            if cur_c < bug.start_col:
                dist = bug.start_col - cur_c
                target_char = self.buffer.lines[bug.row][bug.start_col] if bug.start_col < len(self.buffer.lines[bug.row]) else ""
                if self.stage_idx >= 3 and target_char in ('"', "'", '(', '{', ';', ':'):
                    horizontal_action = f"f{target_char}"
                else:
                    words_est = max(1, dist // 4)
                    horizontal_action = f"{words_est}w" if words_est > 1 else "w"
            elif cur_c > bug.end_col:
                dist = cur_c - bug.end_col
                words_est = max(1, dist // 4)
                horizontal_action = f"{words_est}b" if words_est > 1 else "b"

        action = bug.required_action
        if action == "LAND":
            obj_desc = f"Move cursor onto bug on Line {bug.row + 1} (⏱{bug.time_left:.1f}s)"
            if not on_same_line:
                suggest = f"Press '{vertical_action}' to reach line {bug.row + 1}, then 'w' or 'l'"
            elif not is_on_bug:
                suggest = f"On target line! Press '{horizontal_action}' or 'l' to land on bug"
            else:
                suggest = "ON TARGET! Squash confirmed!"
        elif action == "x":
            obj_desc = f"Zap character on Line {bug.row + 1} (⏱{bug.time_left:.1f}s)"
            if not is_on_bug:
                nav = (vertical_action + " " if vertical_action else "") + horizontal_action
                suggest = f"Navigate using '{nav}' to land on character"
            else:
                suggest = "READY: Press 'x' now to zap the bad character!"
        elif action == "dw":
            obj_desc = f"Delete rogue word '{bug.original_text}' on Line {bug.row + 1}"
            if not is_on_bug:
                nav = (vertical_action + " " if vertical_action else "") + horizontal_action
                suggest = f"Navigate using '{nav}' to reach word start"
            else:
                suggest = "READY: Press 'dw' now to delete the rogue word!"
        elif action == "dd":
            obj_desc = f"Wipe corrupted Line {bug.row + 1} (⏱{bug.time_left:.1f}s)"
            if not on_same_line:
                suggest = f"Press '{vertical_action}' to move to line {bug.row + 1}, then press 'dd'"
            else:
                suggest = "READY: You are on corrupted line! Press 'dd' now to wipe it!"
        elif action in ('ci"', 'di"'):
            obj_desc = f"Neutralize string on Line {bug.row + 1} (⏱{bug.time_left:.1f}s)"
            if not is_on_bug:
                nav = (vertical_action + " " if vertical_action else "") + 'f"'
                suggest = f"Jump inside string quotes using '{nav}', then press '{action}'"
            else:
                suggest = f"READY: You are inside quotes! Press '{action}' now!"
        elif action in ('da(', 'ca('):
            obj_desc = f"Neutralize block on Line {bug.row + 1} (⏱{bug.time_left:.1f}s)"
            if not is_on_bug:
                nav = (vertical_action + " " if vertical_action else "") + horizontal_action
                suggest = f"Move inside parentheses using '{nav}', then press '{action}'"
            else:
                suggest = f"READY: You are inside block! Press '{action}' now!"
        else:
            obj_desc = f"Neutralize threat on Line {bug.row + 1} [{action}]"
            suggest = f"Move to target line with '{vertical_action}', then execute '{action}'"

        return (obj_desc, suggest)

    def spawn_bug(self):
        stage_cfg = STAGES[self.stage_idx]
        max_concurrent = stage_cfg.get("max_concurrent", 4)
        if not self.buffer or len(self.bugs) >= max_concurrent:
            return

        allowed = stage_cfg["allowed_actions"]

        # Pick an appropriate line and token
        # Avoid lines already heavily occupied
        occupied_rows = {b.row for b in self.bugs}
        available_rows = [r for r in range(len(self.buffer.lines)) if r not in occupied_rows and len(self.buffer.lines[r].strip()) > 3]
        if not available_rows:
            available_rows = list(range(len(self.buffer.lines)))

        target_row = random.choice(available_rows)
        line = self.buffer.lines[target_row]

        # Determine action type
        candidate_actions = [a for a in allowed if a != "LEAP"]
        action = random.choice(candidate_actions) if candidate_actions else "LAND"

        start_c = 0
        end_c = 0
        bug_name = "GLITCH"
        badge = "[LAND]"
        points = 100

        # Scan for potential string quotes on line
        quote_match = re.search(r'(".*?"|\'.*?\')', line)
        paren_match = re.search(r'(\(.*?\))', line)

        if action in ('ci"', 'di"') and quote_match:
            start_c = quote_match.start()
            end_c = quote_match.end() - 1
            bug_name = "RogueString"
            badge = f"[{action}]"
            points = 250
        elif action in ('da(', 'ca(') and paren_match:
            start_c = paren_match.start()
            end_c = paren_match.end() - 1
            bug_name = "ZombieBlock"
            badge = f"[{action}]"
            points = 300
        elif action == "dd":
            start_c = 0
            end_c = max(0, len(line) - 1)
            bug_name = "FatalException"
            badge = "[dd]"
            points = 200
        elif action in ("dw", "ciw", "diw"):
            words = list(re.finditer(r'\b\w+\b', line))
            if words:
                w = random.choice(words)
                start_c = w.start()
                end_c = w.end() - 1
                bug_name = "DeadCode" if action == "dw" else "RogueToken"
                badge = f"[{action}]"
                points = 150
            else:
                action = "LAND"
                badge = "[LAND]"
                start_c = 0
                end_c = max(0, len(line) - 1)
        elif action == "x":
            non_spaces = [i for i, ch in enumerate(line) if not ch.isspace()]
            if non_spaces:
                pos = random.choice(non_spaces)
                start_c = pos
                end_c = pos
                bug_name = "BitFlip"
                badge = "[x]"
                points = 120
            else:
                action = "LAND"
                badge = "[LAND]"
                start_c = 0
                end_c = max(0, len(line) - 1)
        else: # LAND
            words = list(re.finditer(r'\S+', line))
            if words:
                w = random.choice(words)
                start_c = w.start()
                end_c = w.end() - 1
            else:
                start_c = 0
                end_c = max(0, len(line) - 1)
            bug_name = "SyntaxGlitch"
            badge = "[LAND]"
            points = 100

        duration = stage_cfg["bug_duration"]
        if self.stage_idx == len(STAGES) - 1: # Endless ramps up
            reduction = min(6.0, self.stage_bugs_cleared * 0.1)
            duration = max(4.0, duration - reduction)

        bug = Bug(
            id=self.next_bug_id,
            row=target_row,
            start_col=start_c,
            end_col=end_c,
            name=bug_name,
            required_action=action,
            original_text=line[start_c:end_c + 1] if end_c >= start_c else "",
            display_badge=badge,
            max_duration=duration,
            time_left=duration,
            points=points,
        )
        self.next_bug_id += 1
        self.bugs.append(bug)

    def trigger_sparks(self, row: int, col: int, color_pair: int = 10):
        chars = ['*', '+', '#', '@', '%', '^']
        for _ in range(16):
            angle = random.uniform(0, 2 * math.pi)
            speed = random.uniform(2.0, 6.0)
            vr = math.sin(angle) * speed * 0.5
            vc = math.cos(angle) * speed
            life = random.uniform(0.3, 0.7)
            self.sparks.append(Spark(
                row=float(row),
                col=float(col),
                vr=vr,
                vc=vc,
                char=random.choice(chars),
                life=life,
                max_life=life,
                color_pair=color_pair,
            ))

    def resolve_bug(self, bug: Bug, reason: str):
        self.bugs.remove(bug)
        self.trigger_sparks(bug.row, (bug.start_col + bug.end_col) // 2, color_pair=11)

        # Score & combo calculation
        time_factor = max(0.2, bug.time_left / bug.max_duration)
        earned = int(bug.points * self.combo * (1.0 + time_factor))
        self.score += earned
        self.combo = min(8.0, self.combo + 0.25)
        self.combo_timer = 5.0 # 5 seconds to keep combo
        self.bugs_cleared += 1
        self.stage_bugs_cleared += 1

        self.notification = f"+{earned} PTS! [{reason}] 🔥 Combo x{self.combo:.2f}"
        self.notification_timer = 1.5

        if self.score > self.high_score:
            self.high_score = self.score
            self.scores_data["high_score"] = self.high_score

        # Check stage completion
        stage_cfg = STAGES[self.stage_idx]
        if self.stage_idx < len(STAGES) - 1 and self.stage_bugs_cleared >= stage_cfg["target_bugs"]:
            self.state = "STAGE_CLEAR"
            if self.stage_idx + 1 >= self.scores_data.get("stages_unlocked", 1):
                self.scores_data["stages_unlocked"] = min(len(STAGES), self.stage_idx + 2)
            save_high_scores(self.scores_data)

    def handle_hit_detection(self, event: Optional[dict]):
        if not self.buffer:
            return

        cursor_r = self.buffer.row
        cursor_c = self.buffer.col

        for bug in list(self.bugs):
            # Check LAND action
            if bug.required_action == "LAND" and bug.contains_cursor(cursor_r, cursor_c):
                self.resolve_bug(bug, "SQUASHED!")
                return

            if event and event.get('type') == 'operator':
                cmd = event.get('command', '')
                span = event.get('span')

                # Direct match
                if cmd == bug.required_action:
                    if span and bug.overlaps_span(span[0], span[1], span[2]):
                        self.resolve_bug(bug, f"OPERATOR {cmd}!")
                        return
                    elif bug.contains_cursor(cursor_r, cursor_c):
                        self.resolve_bug(bug, f"OPERATOR {cmd}!")
                        return
                elif bug.required_action == 'dw' and cmd in ('dw', 'de', 'cw', 'ce'):
                    if span and bug.overlaps_span(span[0], span[1], span[2]):
                        self.resolve_bug(bug, "DELETED WORD!")
                        return
                elif bug.required_action == 'dd' and cmd in ('dd', 'cc'):
                    if event.get('row') == bug.row:
                        self.resolve_bug(bug, "WIPED LINE!")
                        return
                elif bug.required_action in ('ci"', 'di"') and cmd in ('ci"', 'di"', "ci'", "di'"):
                    if span and bug.overlaps_span(span[0], span[1], span[2]):
                        self.resolve_bug(bug, "EXTRACTED STRING!")
                        return
                elif bug.required_action in ('da(', 'ca(') and cmd in ('da(', 'ca(', 'di(', 'ci('):
                    if span and bug.overlaps_span(span[0], span[1], span[2]):
                        self.resolve_bug(bug, "PURGED BLOCK!")
                        return
                elif bug.required_action == 'x' and cmd == 'x':
                    if bug.contains_cursor(cursor_r, cursor_c):
                        self.resolve_bug(bug, "ZAPPED CHAR!")
                        return

    def update_physics(self, dt: float):
        # Update combo timer
        if self.combo_timer > 0:
            self.combo_timer -= dt
            if self.combo_timer <= 0:
                self.combo = 1.0

        # Update notification timer
        if self.notification_timer > 0:
            self.notification_timer -= dt

        # Update bug timers
        for bug in list(self.bugs):
            bug.time_left -= dt
            if bug.time_left <= 0:
                # Bug detonates! Damage player (gentle for beginners)
                self.bugs.remove(bug)
                damage = 10.0 if self.stage_idx == 0 else 15.0
                self.integrity = max(0.0, self.integrity - damage)
                self.combo = 1.0
                self.combo_timer = 0.0
                self.trigger_sparks(bug.row, (bug.start_col + bug.end_col) // 2, color_pair=8)
                self.notification = f"⚠️ THREAT DETONATED! -{int(damage)}% INTEGRITY!"
                self.notification_timer = 2.0
                try:
                    curses.flash()
                except Exception:
                    pass

                if self.integrity <= 0.0:
                    self.state = "GAME_OVER"
                    save_high_scores(self.scores_data)

        # Update sparks
        for spark in list(self.sparks):
            spark.life -= dt
            if spark.life <= 0:
                self.sparks.remove(spark)
            else:
                spark.row += spark.vr * dt
                spark.col += spark.vc * dt

        # Spawn new bugs
        stage_cfg = STAGES[self.stage_idx]
        interval = stage_cfg["spawn_interval"]
        if time.time() - self.last_spawn_time >= interval:
            self.spawn_bug()
            self.last_spawn_time = time.time()

    # -----------------------------------------------------------------------
    # Rendering Methods
    # -----------------------------------------------------------------------
    def render(self):
        self.stdscr.erase()
        h, w = self.stdscr.getmaxyx()

        if h < 20 or w < 70:
            msg = "Terminal too small! Please resize to at least 70x20."
            try:
                self.stdscr.addstr(h // 2, max(0, (w - len(msg)) // 2), msg, curses.color_pair(8) | curses.A_BOLD)
            except Exception:
                pass
            self.stdscr.refresh()
            return

        if self.state == "MENU":
            self.render_menu(h, w)
        elif self.state == "PHASE_MENU":
            self.render_phase_menu(h, w)
        elif self.state == "HELP":
            self.render_help(h, w)
        elif self.state == "STAGE_BRIEFING":
            self.render_stage_briefing(h, w)
        elif self.state == "PLAYING":
            self.render_playing(h, w)
        elif self.state == "PAUSED":
            self.render_playing(h, w)
            self.render_paused(h, w)
        elif self.state == "STAGE_CLEAR":
            self.render_stage_clear(h, w)
        elif self.state == "GAME_OVER":
            self.render_game_over(h, w)

        self.stdscr.refresh()

    def render_menu(self, h: int, w: int):
        banner = [
            "  ██    ██ ██ ███    ███   ██████  ███████ ███████ ███████ ███    ██ ██████  ███████ ██████  ",
            "  ██    ██ ██ ████  ████   ██   ██ ██      ██      ██      ████   ██ ██   ██ ██      ██   ██ ",
            "  ██    ██ ██ ██ ████ ██   ██   ██ █████   █████   █████   ██ ██  ██ ██   ██ █████   ██████  ",
            "   ██  ██  ██ ██  ██  ██   ██   ██ ██      ██      ██      ██  ██ ██ ██   ██ ██      ██   ██ ",
            "    ████   ██ ██      ██   ██████  ███████ ██      ███████ ██   ████ ██████  ███████ ██   ██ ",
        ]
        start_y = 1 if h < 26 else 2
        for idx, line in enumerate(banner):
            x = max(0, (w - len(line)) // 2)
            try:
                self.stdscr.addstr(start_y + idx, x, line[:w - x - 1], curses.color_pair(12) | curses.A_BOLD)
            except Exception:
                pass

        sub = "⚡ Terminal Arcade Vim Muscle-Memory Trainer ⚡"
        try:
            self.stdscr.addstr(start_y + len(banner) + 1, max(0, (w - len(sub)) // 2), sub, curses.color_pair(7) | curses.A_BOLD)
        except Exception:
            pass

        unlocked = self.scores_data.get("stages_unlocked", 1)
        menu_items = [
            ("1. Phase 1: Basic Motions (hjkl, w/b/e, 0/$, gg/G)", 0),
            ("2. Phase 2: In-line Find & Counts (f/t/F/T, ;, ,, 3w/4j)", 1),
            ("3. Phase 3: Operators & Slashes (x, dw, dd, D, /search)", 2),
            ("4. Phase 4: Text Objects Surgery (ci\", di\", ciw, diw, da()", 3),
            ("5. Endless Survival Mode (Infinite escalating waves)", 4),
            ("H. How to Play & Controls Cheatsheet", 98),
            ("Q. Quit Game", 99),
        ]

        step = 1 if h < 26 else 2
        menu_y = start_y + len(banner) + (2 if h < 26 else 3)
        for i, (text, code) in enumerate(menu_items):
            if code < 4:
                first_stage = PHASES[code]["stage_indices"][0]
                is_locked = (first_stage + 1 > unlocked)
            elif code == 4:
                endless_stage = len(STAGES) - 1
                is_locked = (endless_stage + 1 > unlocked)
            else:
                is_locked = False

            disp_text = f"  {text}  "
            if is_locked:
                disp_text += " [🔒 LOCKED]"

            x = max(2, (w - len(disp_text)) // 2)
            attr = curses.color_pair(1)
            if i == self.selected_menu_idx:
                attr = curses.color_pair(13) | curses.A_BOLD # Highlighted
            elif is_locked:
                attr = curses.color_pair(6) | curses.A_DIM

            try:
                self.stdscr.addstr(menu_y + i * step, x, disp_text[:w - x - 1], attr)
            except Exception:
                pass

        # High score footer
        footer = f"🏆 High Score: {self.high_score:,} PTS   |   Bugs Cleared: {self.scores_data.get('bugs_cleared', 0):,}   |   Use [j/k] to navigate, [Enter] to select"
        try:
            self.stdscr.addstr(h - 2, max(0, (w - len(footer)) // 2), footer[:w - 1], curses.color_pair(11))
        except Exception:
            pass

    def render_phase_menu(self, h: int, w: int):
        phase = PHASES[self.selected_phase]
        unlocked = self.scores_data.get("stages_unlocked", 1)

        box_w = min(78, w - 4)
        box_h = 18
        start_y = max(1, (h - box_h) // 2)
        start_x = max(1, (w - box_w) // 2)

        # Header border
        title = f" 📂 {phase['title'].upper()} 📂 "
        top_border = "╔" + ("═" * (box_w - 2)) + "╗"
        try:
            self.stdscr.addstr(start_y, start_x, top_border, curses.color_pair(12) | curses.A_BOLD)
            self.stdscr.addstr(start_y, start_x + max(0, (box_w - len(title)) // 2), title[:box_w - 2], curses.color_pair(7) | curses.A_BOLD)
        except Exception:
            pass

        # Subtitle
        desc = f"║  {phase['description']}".ljust(box_w - 1) + "║"
        sep = "╠" + ("═" * (box_w - 2)) + "╣"
        try:
            self.stdscr.addstr(start_y + 1, start_x, desc[:box_w], curses.color_pair(6) | curses.A_DIM)
            self.stdscr.addstr(start_y + 2, start_x, sep, curses.color_pair(12))
        except Exception:
            pass

        cur_y = start_y + 3
        sub_names = ["BASIC", "INTERMEDIATE", "HARD"]
        tier_badges = ["Short (12-14 lines)", "Medium (~24 lines)", "Long (42+ lines, Vertical Leap)"]

        for sub_idx, stage_idx in enumerate(phase["stage_indices"]):
            stg = STAGES[stage_idx]
            is_locked = (stage_idx + 1 > unlocked)
            is_cleared = (unlocked > stage_idx + 1)
            is_selected = (sub_idx == self.selected_sub_idx)

            if is_locked:
                status = "[🔒 LOCKED]"
                header_attr = curses.color_pair(6) | curses.A_DIM
                detail_attr = curses.color_pair(6) | curses.A_DIM
            elif is_cleared:
                status = "[✓ CLEARED]"
                header_attr = curses.color_pair(11) | curses.A_BOLD
                detail_attr = curses.color_pair(1)
            else:
                status = "[▶ READY]"
                header_attr = curses.color_pair(7) | curses.A_BOLD
                detail_attr = curses.color_pair(1)

            if is_selected:
                selector = "▶ "
                card_attr = curses.color_pair(13) | curses.A_BOLD
            else:
                selector = "  "
                card_attr = header_attr

            line1 = f"║ {selector}[{sub_idx + 1}] {sub_names[sub_idx]}: {stg['title']}".ljust(box_w - 15) + f" {status} ║"
            line2 = f"║     Buffer: {tier_badges[sub_idx]} │ Goal: {stg['target_bugs']} bugs │ Timer: {int(stg['bug_duration'])}s".ljust(box_w - 1) + "║"
            line3 = f"║     Hint: {stg['hint']}".ljust(box_w - 1) + "║"

            try:
                self.stdscr.addstr(cur_y, start_x, line1[:box_w], card_attr)
                self.stdscr.addstr(cur_y + 1, start_x, line2[:box_w], detail_attr)
                self.stdscr.addstr(cur_y + 2, start_x, line3[:box_w], curses.color_pair(6) | curses.A_DIM)
                if sub_idx < 2:
                    dash_sep = "╟" + ("─" * (box_w - 2)) + "╢"
                    self.stdscr.addstr(cur_y + 3, start_x, dash_sep, curses.color_pair(2))
            except Exception:
                pass
            cur_y += 4

        # Footer
        bottom_sep = "╠" + ("═" * (box_w - 2)) + "╣"
        footer_nav = "║   [j/k] Navigate │ [1/2/3] Quick Launch │ [Enter] Start │ [B/Esc] Back".ljust(box_w - 1) + "║"
        bottom_border = "╚" + ("═" * (box_w - 2)) + "╝"
        try:
            self.stdscr.addstr(cur_y, start_x, bottom_sep, curses.color_pair(12))
            self.stdscr.addstr(cur_y + 1, start_x, footer_nav, curses.color_pair(11) | curses.A_BOLD)
            self.stdscr.addstr(cur_y + 2, start_x, bottom_border, curses.color_pair(12) | curses.A_BOLD)
        except Exception:
            pass

    def render_help(self, h: int, w: int):
        title = "=== VIM DEFENDER: CONTROLS & CHEATSHEET ==="
        try:
            self.stdscr.addstr(1, max(0, (w - len(title)) // 2), title, curses.color_pair(12) | curses.A_BOLD)
        except Exception:
            pass

        sections = [
            ("NAVIGATION MOTIONS", [
                "h, j, k, l   : Move Left, Down, Up, Right",
                "w, e, b      : Jump Forward to word start, word end, Backward to word start",
                "0, ^, $      : Jump to line start, first non-whitespace, line end",
                "gg, G        : Jump to top of buffer, bottom of buffer",
                "f<c>, t<c>   : Jump Forward to / Till character <c> on current line",
                "F<c>, T<c>   : Jump Backward to / Till character <c> on current line",
                ";  and  ,    : Repeat last find forward / reverse",
                "2w, 3j, 5l   : Numeric count multipliers (leap multiple steps at once)",
            ]),
            ("OPERATORS & TEXT OBJECTS", [
                "x            : Zap character under cursor (neutralize BitFlip bugs)",
                "dw, de, cw   : Delete/Change word (neutralize DeadCode rogue tokens)",
                "dd           : Delete entire line (neutralize FatalException alerts)",
                "ci\", di\"    : Change / Delete inside quotes (neutralize RogueString)",
                "ciw, diw     : Change / Delete inside word token",
                "da(, ca(     : Delete / Change around parentheses block",
                "/pattern     : Real-time search to instantly lock onto threats",
                "<Esc>        : Clear pending command / cancel search",
            ]),
            ("GAMEPLAY OBJECTIVE", [
                "• Bugs spawn across real code lines with countdown timers.",
                "• Execute the specified Vim action before a bug timer hits 0!",
                "• Fast eliminations maintain your Combo Multiplier up to x8.0.",
                "• If a bug explodes, Buffer Integrity drops. Don't let it reach 0%!",
            ])
        ]

        cur_y = 3
        for sec_title, lines in sections:
            try:
                self.stdscr.addstr(cur_y, 4, f"▶ {sec_title}", curses.color_pair(7) | curses.A_BOLD)
                cur_y += 1
                for line in lines:
                    self.stdscr.addstr(cur_y, 6, line[:w - 8], curses.color_pair(1))
                    cur_y += 1
                cur_y += 1
            except Exception:
                pass

        exit_msg = "Press [Enter] or [Esc] to return to Main Menu"
        try:
            self.stdscr.addstr(h - 2, max(0, (w - len(exit_msg)) // 2), exit_msg, curses.color_pair(13) | curses.A_BOLD)
        except Exception:
            pass

    def render_stage_briefing(self, h: int, w: int):
        stage_cfg = STAGES[self.stage_idx]
        box_w = min(76, w - 4)
        briefing_lines = stage_cfg.get("briefing", [])
        box_h = len(briefing_lines) + 8
        start_y = max(1, (h - box_h) // 2)
        start_x = max(1, (w - box_w) // 2)

        # Header border
        title = f" 📋 MISSION BRIEFING: {stage_cfg['title'].upper()} "
        top_border = "╔" + ("═" * (box_w - 2)) + "╗"
        try:
            self.stdscr.addstr(start_y, start_x, top_border, curses.color_pair(12) | curses.A_BOLD)
            self.stdscr.addstr(start_y, start_x + max(0, (box_w - len(title)) // 2), title[:box_w - 2], curses.color_pair(7) | curses.A_BOLD)
        except Exception:
            pass

        cur_y = start_y + 1
        for line in briefing_lines:
            content = f"║  {line}".ljust(box_w - 1) + "║"
            attr = curses.color_pair(1)
            if "WHAT TO DO:" in line or "CONTROLS" in line or "GOAL:" in line:
                attr = curses.color_pair(7) | curses.A_BOLD
            elif "TIP:" in line:
                attr = curses.color_pair(11) | curses.A_BOLD
            elif "Welcome" in line or "Stage" in line:
                attr = curses.color_pair(12) | curses.A_BOLD
            try:
                self.stdscr.addstr(cur_y, start_x, content[:box_w], attr)
            except Exception:
                pass
            cur_y += 1

        # Separator
        sep = "╠" + ("═" * (box_w - 2)) + "╣"
        try:
            self.stdscr.addstr(cur_y, start_x, sep, curses.color_pair(12))
            cur_y += 1
        except Exception:
            pass

        # Action prompts
        prompt1 = "║   [SPACE / ENTER]  Start Mission (Timer begins when you start!)".ljust(box_w - 1) + "║"
        prompt2 = "║   [M / ESC]        Return to Main Menu".ljust(box_w - 1) + "║"
        bottom_border = "╚" + ("═" * (box_w - 2)) + "╝"
        try:
            self.stdscr.addstr(cur_y, start_x, prompt1, curses.color_pair(11) | curses.A_BOLD)
            self.stdscr.addstr(cur_y + 1, start_x, prompt2, curses.color_pair(6))
            self.stdscr.addstr(cur_y + 2, start_x, bottom_border, curses.color_pair(12) | curses.A_BOLD)
        except Exception:
            pass

    def render_paused(self, h: int, w: int):
        box_w = min(68, w - 6)
        box_h = 13
        start_y = max(2, (h - box_h) // 2)
        start_x = max(2, (w - box_w) // 2)

        obj_desc, suggest = self.get_guidance()
        lines = [
            "╔" + ("═" * (box_w - 2)) + "╗",
            "║" + " ⏸️  GAME PAUSED ".center(box_w - 2) + "║",
            "╠" + ("═" * (box_w - 2)) + "╣",
            "║  Timer is frozen. Review your objective and controls:".ljust(box_w - 1) + "║",
            "║".ljust(box_w - 1) + "║",
            f"║  🎯 GOAL : {obj_desc}".ljust(box_w - 1)[:box_w - 1] + "║",
            f"║  💡 KEYS : {suggest}".ljust(box_w - 1)[:box_w - 1] + "║",
            "║".ljust(box_w - 1) + "║",
            "║  Navigation: [h/j/k/l] arrows | [w/b/e] words | [0/$] line ends".ljust(box_w - 1) + "║",
            "║".ljust(box_w - 1) + "║",
            "║  [P / SPACE] Resume Game               [M / ESC] Return to Menu".ljust(box_w - 1) + "║",
            "╚" + ("═" * (box_w - 2)) + "╝",
        ]

        for i, l in enumerate(lines):
            try:
                attr = curses.color_pair(7) | curses.A_BOLD if (i in (1, 5, 6)) else curses.color_pair(12) | curses.A_BOLD
                self.stdscr.addstr(start_y + i, start_x, l[:box_w], attr)
            except Exception:
                pass

    def render_playing(self, h: int, w: int):
        stage_cfg = STAGES[self.stage_idx]
        # Line 0: Top HUD Bar
        hud_bar = f" {stage_cfg['title']} │ SCORE: {self.score:,} │ HIGH: {self.high_score:,} │ COMBO: x{self.combo:.2f} 🔥 "
        try:
            self.stdscr.addstr(0, 0, hud_bar.ljust(w - 1)[:w - 1], curses.color_pair(13) | curses.A_BOLD)
        except Exception:
            pass

        # Line 1: Integrity & Stage Progress Bar
        bar_len = 20
        filled = int(bar_len * (self.integrity / self.max_integrity))
        integrity_str = "█" * filled + "░" * (bar_len - filled)
        int_color = curses.color_pair(11) if self.integrity > 50 else (curses.color_pair(7) if self.integrity > 25 else curses.color_pair(8))

        status_top = f"INTEGRITY: [{integrity_str}] {int(self.integrity)}%"
        if self.stage_idx < len(STAGES) - 1:
            req = stage_cfg['target_bugs']
            status_top += f" │ PROGRESS: {self.stage_bugs_cleared}/{req} BUGS"
        else:
            status_top += f" │ BUGS CLEARED: {self.stage_bugs_cleared}"

        try:
            self.stdscr.addstr(1, 2, status_top[:w - 4], int_color | curses.A_BOLD)
        except Exception:
            pass

        # Notification banner if active
        if self.notification_timer > 0:
            try:
                self.stdscr.addstr(1, max(2, w - len(self.notification) - 3), self.notification[:w - 2], curses.color_pair(11) | curses.A_BOLD)
            except Exception:
                pass

        # Line 2 & 3: Prominent Beginner Objective & Suggested Keys Guide
        obj_text, guide_text = self.get_guidance()
        try:
            self.stdscr.addstr(2, 2, f"🎯 TARGET: {obj_text}"[:w - 4], curses.color_pair(7) | curses.A_BOLD)
            self.stdscr.addstr(3, 2, f"💡 SUGGESTED: {guide_text}"[:w - 4], curses.color_pair(11) | curses.A_BOLD)
            self.stdscr.addstr(4, 0, "─" * (w - 1), curses.color_pair(2))
        except Exception:
            pass

        # Editor Window
        code_start_y = 5
        max_lines_to_show = h - 9

        if self.buffer:
            cursor_r = self.buffer.row
            cursor_c = self.buffer.col

            # Scroll offset calculation
            scroll_offset = max(0, cursor_r - (max_lines_to_show // 2))
            scroll_offset = min(scroll_offset, max(0, len(self.buffer.lines) - max_lines_to_show))

            for view_idx in range(max_lines_to_show):
                line_idx = scroll_offset + view_idx
                if line_idx >= len(self.buffer.lines):
                    # Tilde line like real Vim
                    try:
                        self.stdscr.addstr(code_start_y + view_idx, 0, "~", curses.color_pair(2))
                    except Exception:
                        pass
                    continue

                line_content = self.buffer.lines[line_idx]
                is_cur_line = (line_idx == cursor_r)
                line_bugs = [b for b in self.bugs if b.row == line_idx]

                # Line number display with unmissable target indicator arrow!
                if line_bugs:
                    is_urgent = any(b.time_left < 5.0 for b in line_bugs)
                    lineno_str = f"▶{line_idx + 1:2d} │"
                    lineno_attr = (curses.color_pair(8) if is_urgent else curses.color_pair(7)) | curses.A_BOLD
                else:
                    lineno_str = f" {line_idx + 1:2d} │"
                    lineno_attr = curses.color_pair(7) | curses.A_BOLD if is_cur_line else curses.color_pair(2)

                try:
                    self.stdscr.addstr(code_start_y + view_idx, 0, lineno_str, lineno_attr)
                except Exception:
                    pass

                # Render code characters with syntax and bug overlays
                col_offset = 6

                for col_idx, ch in enumerate(line_content):
                    screen_x = col_offset + col_idx
                    if screen_x >= w - 1:
                        break

                    # Determine character color
                    char_attr = curses.color_pair(1)
                    # Check if inside a bug span
                    in_bug = None
                    for b in line_bugs:
                        if b.start_col <= col_idx <= b.end_col:
                            in_bug = b
                            break

                    if in_bug:
                        # Blinking warning or red alert with reverse highlighting
                        if in_bug.time_left < 4.0:
                            char_attr = curses.color_pair(9) | curses.A_BOLD | curses.A_REVERSE
                        else:
                            char_attr = curses.color_pair(7) | curses.A_BOLD | curses.A_REVERSE
                    else:
                        # Simple syntax heuristics
                        if line_content.strip().startswith(('#', '//', '/*')):
                            char_attr = curses.color_pair(6) | curses.A_DIM
                        elif ch in ('"', "'"):
                            char_attr = curses.color_pair(5)
                        elif ch in ('(', ')', '{', '}', '[', ']'):
                            char_attr = curses.color_pair(12)

                    # Highlight cursor
                    if is_cur_line and col_idx == cursor_c:
                        char_attr = curses.color_pair(13) | curses.A_BOLD

                    try:
                        self.stdscr.addch(code_start_y + view_idx, screen_x, ch, char_attr)
                    except Exception:
                        pass

                # If cursor is at empty line or past length
                if is_cur_line and cursor_c >= len(line_content):
                    screen_x = col_offset + cursor_c
                    if screen_x < w - 1:
                        try:
                            self.stdscr.addch(code_start_y + view_idx, screen_x, ' ', curses.color_pair(13) | curses.A_BOLD)
                        except Exception:
                            pass

                # Render Bug Threat Badges at end of line with clear TARGET pointer
                if line_bugs:
                    badge_x = col_offset + len(line_content) + 2
                    for b in line_bugs:
                        badge_str = f" ◀◀ TARGET [{b.display_badge}] ⏱{b.time_left:.1f}s "
                        badge_color = curses.color_pair(9) if b.time_left < 4.0 else curses.color_pair(7) | curses.A_REVERSE
                        if badge_x + len(badge_str) < w - 1:
                            try:
                                self.stdscr.addstr(code_start_y + view_idx, badge_x, badge_str, badge_color | curses.A_BOLD)
                                badge_x += len(badge_str) + 1
                            except Exception:
                                pass

        # Render Sparks / Particle FX
        for spark in self.sparks:
            sy = int(spark.row) - (scroll_offset if self.buffer else 0) + code_start_y
            sx = int(spark.col) + 6
            if 0 <= sy < h - 4 and 6 <= sx < w - 1:
                try:
                    self.stdscr.addch(sy, sx, spark.char, curses.color_pair(spark.color_pair) | curses.A_BOLD)
                except Exception:
                    pass

        # Dynamic Hint Bar
        hint_y = h - 3
        try:
            self.stdscr.addstr(hint_y, 2, f"Mission Goal: {stage_cfg['hint']}"[:w - 4], curses.color_pair(6) | curses.A_DIM)
        except Exception:
            pass

        # Bottom Vim Statusline
        mode_str = "-- SEARCH --" if (self.engine and self.engine.is_searching) else "-- NORMAL --"
        r_pos = (self.buffer.row + 1) if self.buffer else 1
        c_pos = (self.buffer.col + 1) if self.buffer else 1
        pos_str = f"Ln {r_pos}, Col {c_pos}"
        showcmd = f"[{self.engine.showcmd}]" if (self.engine and self.engine.showcmd) else ""
        status_line = f" {mode_str} │ buffer.code [RO] {showcmd} │ [P] Pause "
        right_info = f" {pos_str} │ Vim Defender "

        fill_space = max(0, w - len(status_line) - len(right_info) - 1)
        full_status = status_line + (" " * fill_space) + right_info
        try:
            self.stdscr.addstr(h - 2, 0, full_status[:w - 1], curses.color_pair(3) | curses.A_BOLD)
        except Exception:
            pass

        # Command / Search Input Line at bottom
        cmdline_y = h - 1
        if self.engine and self.engine.is_searching:
            try:
                self.stdscr.addstr(cmdline_y, 0, f"/{self.engine.search_buffer}", curses.color_pair(1))
            except Exception:
                pass
        elif self.engine and self.engine.showcmd:
            try:
                self.stdscr.addstr(cmdline_y, w - len(self.engine.showcmd) - 2, self.engine.showcmd, curses.color_pair(1))
            except Exception:
                pass
                pass

    def render_stage_clear(self, h: int, w: int):
        box_w = 60
        box_h = 14
        start_y = max(1, (h - box_h) // 2)
        start_x = max(1, (w - box_w) // 2)

        stage_cfg = STAGES[self.stage_idx]
        next_stage_idx = self.stage_idx + 1
        if next_stage_idx < len(STAGES):
            next_title = STAGES[next_stage_idx]['title']
            next_info = f"║ Up Next: {next_title:<47}║"
            prompt = "║ [SPACE / ENTER] Proceed to Next Stage                    ║"
        else:
            next_info = "║ All 12 Campaign Stages Cleared! Endless Unlocked!       ║"
            prompt = "║ [SPACE / ENTER] Return to Main Menu                      ║"

        lines = [
            "╔══════════════════════════════════════════════════════════╗",
            "║                  🎉 STAGE COMPLETED! 🎉                 ║",
            "╠══════════════════════════════════════════════════════════╣",
            f"║ Stage: {stage_cfg['title']:<49}║",
            f"║ Total Score: {self.score:<43,} pts ║",
            f"║ Buffer Integrity Preserved: {int(self.integrity):<26}% ║",
            f"║ Bugs Neutralized This Stage: {self.stage_bugs_cleared:<25} ║",
            "║                                                          ║",
            next_info,
            "║                                                          ║",
            prompt,
            "║ [M] Return to Main Menu                                  ║",
            "╚══════════════════════════════════════════════════════════╝",
        ]

        for i, line in enumerate(lines):
            try:
                self.stdscr.addstr(start_y + i, start_x, line[:w - start_x - 1], curses.color_pair(11) | curses.A_BOLD)
            except Exception:
                pass

    def render_game_over(self, h: int, w: int):
        box_w = 60
        box_h = 14
        start_y = max(1, (h - box_h) // 2)
        start_x = max(1, (w - box_w) // 2)

        lines = [
            "╔══════════════════════════════════════════════════════════╗",
            "║                  💀 BUFFER CORRUPTED! 💀                 ║",
            "╠══════════════════════════════════════════════════════════╣",
            "║ Buffer Integrity dropped to 0%! Threats detonated.       ║",
            f"║ Final Score: {self.score:<43,} pts ║",
            f"║ All-Time High Score: {self.high_score:<35,} pts ║",
            f"║ Total Bugs Cleared: {self.bugs_cleared:<36} ║",
            "║                                                          ║",
            "║ Tip: Practice fast motions like 3w, f<char>, and cw!     ║",
            "║                                                          ║",
            "║ [R] Retry Current Stage                                  ║",
            "║ [M / ENTER] Return to Main Menu                          ║",
            "╚══════════════════════════════════════════════════════════╝",
        ]

        for i, line in enumerate(lines):
            try:
                self.stdscr.addstr(start_y + i, start_x, line[:w - start_x - 1], curses.color_pair(8) | curses.A_BOLD)
            except Exception:
                pass

    # -----------------------------------------------------------------------
    # Main Event Loop
    # -----------------------------------------------------------------------
    def run(self):
        last_time = time.time()

        while True:
            now = time.time()
            dt = min(0.1, now - last_time)
            last_time = now

            if self.state == "PLAYING":
                self.update_physics(dt)

            # Draw current frame
            self.render()

            # Read keyboard input
            try:
                ch_code = self.stdscr.getch()
            except Exception:
                ch_code = -1

            if ch_code != -1:
                self.last_key_time = time.time()
                if self.state == "MENU":
                    self.handle_menu_input(ch_code)
                elif self.state == "PHASE_MENU":
                    self.handle_phase_menu_input(ch_code)
                elif self.state == "HELP":
                    if ch_code in (10, 13, 27, ord('q'), ord('Q')):
                        self.state = "MENU"
                elif self.state == "STAGE_BRIEFING":
                    if ch_code in (10, 13, ord(' '), ord('s'), ord('S')):
                        self.state = "PLAYING"
                        self.last_spawn_time = time.time()
                        self.last_key_time = time.time()
                    elif ch_code in (27, ord('m'), ord('M'), ord('q'), ord('Q')):
                        self.state = "MENU"
                elif self.state == "PAUSED":
                    if ch_code in (ord('p'), ord('P'), ord(' '), 10, 13):
                        self.state = "PLAYING"
                        self.last_key_time = time.time()
                    elif ch_code in (27, ord('m'), ord('M'), ord('q'), ord('Q')):
                        self.state = "MENU"
                elif self.state == "STAGE_CLEAR":
                    if ch_code in (10, 13, ord(' ')):
                        next_stage = self.stage_idx + 1
                        if next_stage < len(STAGES):
                            self.start_stage(next_stage)
                        else:
                            self.state = "MENU"
                    elif ch_code in (ord('m'), ord('M'), 27):
                        self.state = "MENU"
                elif self.state == "GAME_OVER":
                    if ch_code in (ord('r'), ord('R')):
                        self.start_stage(self.stage_idx)
                    elif ch_code in (ord('m'), ord('M'), 10, 13, 27):
                        self.state = "MENU"
                elif self.state == "PLAYING":
                    # Check pause key 'p' or 'P' (when not in search query entry)
                    if ch_code in (ord('p'), ord('P')) and not (self.engine and self.engine.is_searching) and not (self.engine and self.engine.pending_op):
                        self.state = "PAUSED"
                        continue

                    # Exit to menu if Ctrl-C or Ctrl-Q
                    if ch_code == 3 or ch_code == 17:
                        self.state = "MENU"
                        continue

                    # Feed character into Vim engine
                    char_repr = ""
                    if ch_code == 27:
                        char_repr = 'ESC'
                    elif ch_code in (10, 13):
                        char_repr = '\n'
                    elif ch_code in (curses.KEY_BACKSPACE, 127, 8):
                        char_repr = '\b'
                    elif 32 <= ch_code <= 126:
                        char_repr = chr(ch_code)
                    else:
                        continue

                    event = self.engine.feed_key(char_repr)
                    self.handle_hit_detection(event)

            # Sleep slightly to throttle CPU loop (~50 FPS)
            time.sleep(0.02)

    def handle_menu_input(self, code: int):
        menu_codes = [0, 1, 2, 3, 4, 98, 99]
        unlocked = self.scores_data.get("stages_unlocked", 1)

        if code in (curses.KEY_UP, ord('k'), ord('K')):
            self.selected_menu_idx = (self.selected_menu_idx - 1) % len(menu_codes)
        elif code in (curses.KEY_DOWN, ord('j'), ord('J')):
            self.selected_menu_idx = (self.selected_menu_idx + 1) % len(menu_codes)
        elif code in (ord('1'), ord('2'), ord('3'), ord('4')):
            phase_idx = code - ord('1')
            first_stage = PHASES[phase_idx]["stage_indices"][0]
            if first_stage + 1 <= unlocked:
                self.selected_phase = phase_idx
                self.selected_sub_idx = 0
                self.state = "PHASE_MENU"
        elif code == ord('5'):
            endless_idx = len(STAGES) - 1
            if endless_idx + 1 <= unlocked:
                self.start_stage(endless_idx)
        elif code in (ord('h'), ord('H'), ord('?')):
            self.state = "HELP"
        elif code in (ord('q'), ord('Q')):
            sys.exit(0)
        elif code in (10, 13, ord(' ')):
            target = menu_codes[self.selected_menu_idx]
            if target < 4:
                first_stage = PHASES[target]["stage_indices"][0]
                if first_stage + 1 <= unlocked:
                    self.selected_phase = target
                    self.selected_sub_idx = 0
                    self.state = "PHASE_MENU"
            elif target == 4:
                endless_idx = len(STAGES) - 1
                if endless_idx + 1 <= unlocked:
                    self.start_stage(endless_idx)
            elif target == 98:
                self.state = "HELP"
            elif target == 99:
                sys.exit(0)

    def handle_phase_menu_input(self, code: int):
        phase = PHASES[self.selected_phase]
        indices = phase["stage_indices"]
        unlocked = self.scores_data.get("stages_unlocked", 1)

        if code in (curses.KEY_UP, ord('k'), ord('K')):
            self.selected_sub_idx = (self.selected_sub_idx - 1) % len(indices)
        elif code in (curses.KEY_DOWN, ord('j'), ord('J')):
            self.selected_sub_idx = (self.selected_sub_idx + 1) % len(indices)
        elif code in (ord('1'), ord('2'), ord('3')):
            sub = code - ord('1')
            if sub < len(indices):
                self.selected_sub_idx = sub
                target_stage = indices[sub]
                if target_stage + 1 <= unlocked:
                    self.start_stage(target_stage)
        elif code in (10, 13, ord(' ')):
            target_stage = indices[self.selected_sub_idx]
            if target_stage + 1 <= unlocked:
                self.start_stage(target_stage)
        elif code in (27, ord('b'), ord('B'), ord('m'), ord('M'), ord('q'), ord('Q'), curses.KEY_BACKSPACE, 127, 8):
            self.state = "MENU"


def main():
    try:
        curses.wrapper(lambda stdscr: VimDefenderGame(stdscr).run())
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
