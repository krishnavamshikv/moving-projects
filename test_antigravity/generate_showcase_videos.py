#!/usr/bin/env python3
import math
import subprocess
from PIL import Image, ImageDraw, ImageFont

WIDTH, HEIGHT = 1920, 1080
FPS = 24
DURATION_FRAMES = 72 # 3 seconds per shot

try:
    font_title = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 90)
    font_sub = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 36)
    font_mono = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf", 30)
except Exception:
    font_title = font_sub = font_mono = ImageFont.load_default()

def render_pipe(output_path):
    cmd = [
        "ffmpeg", "-y", "-f", "rawvideo", "-vcodec", "rawvideo",
        "-s", f"{WIDTH}x{HEIGHT}", "-pix_fmt", "rgb24", "-r", str(FPS),
        "-i", "-", "-c:v", "libx264", "-preset", "ultrafast", "-pix_fmt", "yuv420p",
        output_path
    ]
    return subprocess.Popen(cmd, stdin=subprocess.PIPE, stderr=subprocess.DEVNULL)

# -------------------------------------------------------------
# SHOT 1: Cinematic Sci-Fi Title
# -------------------------------------------------------------
print("Rendering Shot 1: Intro Title...")
p1 = render_pipe("/home/kv/workspace/test_antigravity/shot1_intro.mp4")
for f in range(DURATION_FRAMES):
    img = Image.new("RGB", (WIDTH, HEIGHT), (10, 12, 20))
    d = ImageDraw.Draw(img)
    
    # Animated particle stars
    for i in range(60):
        sx = (i * 137 + f * (i % 5 + 1) * 2) % WIDTH
        sy = (i * 219 + f * (i % 3 + 1)) % HEIGHT
        rad = (i % 3) + 1
        d.ellipse([sx - rad, sy - rad, sx + rad, sy + rad], fill=(150, 180, 220))
        
    # Central glow
    glow_rad = int(350 + 20 * math.sin(f * 0.1))
    d.ellipse([WIDTH//2 - glow_rad, HEIGHT//2 - glow_rad//2, WIDTH//2 + glow_rad, HEIGHT//2 + glow_rad//2], fill=(25, 40, 70))
    
    # Text
    t1 = "ANTIGRAVITY x RESOLVE"
    t2 = "AUTONOMOUS VIDEO EDITING PIPELINE"
    
    b1 = d.textbbox((0, 0), t1, font=font_title)
    w1, h1 = b1[2] - b1[0], b1[3] - b1[1]
    b2 = d.textbbox((0, 0), t2, font=font_sub)
    w2 = b2[2] - b2[0]
    
    # Subtle zoom
    d.text(((WIDTH - w1) // 2, (HEIGHT - h1) // 2 - 30), t1, fill=(255, 255, 255), font=font_title)
    d.text(((WIDTH - w2) // 2, (HEIGHT - h1) // 2 + h1 + 30), t2, fill=(0, 210, 255), font=font_sub)
    
    p1.stdin.write(img.tobytes())
p1.stdin.close()
p1.wait()

# -------------------------------------------------------------
# SHOT 2: Synthwave 3D Perspective Grid
# -------------------------------------------------------------
print("Rendering Shot 2: Synthwave 3D Grid...")
p2 = render_pipe("/home/kv/workspace/test_antigravity/shot2_grid.mp4")
horizon_y = 520
vanish_x = WIDTH // 2

for f in range(DURATION_FRAMES):
    img = Image.new("RGB", (WIDTH, HEIGHT), (12, 8, 24))
    d = ImageDraw.Draw(img)
    
    # Glowing Neon Sun at Horizon
    sun_r = 160
    d.ellipse([vanish_x - sun_r, horizon_y - sun_r, vanish_x + sun_r, horizon_y + sun_r], fill=(255, 60, 120))
    # Sun horizontal stripes
    for s_y in range(horizon_y - 60, horizon_y + sun_r, 18):
        d.line([vanish_x - sun_r, s_y, vanish_x + sun_r, s_y], fill=(12, 8, 24), width=4)
        
    # Perspective Grid: Vanishing lines
    for vx in range(-WIDTH, 2 * WIDTH, 120):
        d.line([vanish_x, horizon_y, vx, HEIGHT], fill=(0, 235, 255), width=2)
        
    # Perspective Grid: Moving Horizontal Lines
    offset = (f * 8) % 60
    for i in range(1, 15):
        # Exponential spacing for 3D depth
        dist = (i * 60 + offset)
        py = horizon_y + int((dist ** 1.35) * 0.45)
        if py <= HEIGHT:
            d.line([0, py, WIDTH, py], fill=(255, 0, 180), width=2)
            
    # HUD Label
    d.text((80, 80), "// SCENE 02: PROCEDURAL SYNTHESIS", fill=(0, 255, 220), font=font_mono)
    d.text((80, 125), "FPS: 24.0 | RENDER ENGINE: DIRECT MCP", fill=(255, 255, 255), font=font_sub)
    
    p2.stdin.write(img.tobytes())
p2.stdin.close()
p2.wait()

# -------------------------------------------------------------
# SHOT 3: Neural Data HUD & Frequency Spectrum
# -------------------------------------------------------------
print("Rendering Shot 3: Neural Data HUD...")
p3 = render_pipe("/home/kv/workspace/test_antigravity/shot3_hud.mp4")

for f in range(DURATION_FRAMES):
    img = Image.new("RGB", (WIDTH, HEIGHT), (8, 14, 20))
    d = ImageDraw.Draw(img)
    
    # Grid background lines
    for x in range(0, WIDTH, 160):
        d.line([x, 0, x, HEIGHT], fill=(20, 30, 42), width=1)
    for y in range(0, HEIGHT, 120):
        d.line([0, y, WIDTH, y], fill=(20, 30, 42), width=1)
        
    # Reticle / Target circle
    cx, cy = WIDTH // 2, HEIGHT // 2
    r1 = 260
    angle_offset = f * 0.08
    d.arc([cx - r1, cy - r1, cx + r1, cy + r1], start=int(math.degrees(angle_offset)), end=int(math.degrees(angle_offset) + 240), fill=(0, 240, 255), width=3)
    d.arc([cx - r1 + 30, cy - r1 + 30, cx + r1 - 30, cy + r1 - 30], start=int(math.degrees(-angle_offset * 1.5)), end=int(math.degrees(-angle_offset * 1.5) + 160), fill=(255, 180, 0), width=2)
    
    # Animated Audio Spectrum bars at bottom
    num_bars = 48
    bar_w = 24
    start_x = (WIDTH - (num_bars * (bar_w + 8))) // 2
    for b in range(num_bars):
        h = int(50 + 180 * math.sin(f * 0.2 + b * 0.35) * math.cos(b * 0.15))
        bx = start_x + b * (bar_w + 8)
        by = HEIGHT - 180
        # Gradient effect
        d.rectangle([bx, by - abs(h), bx + bar_w, by], fill=(0, 255, 170))
        
    # HUD text readouts
    d.text((80, 80), "// SCENE 03: REAL-TIME TIMELINE TELEMETRY", fill=(0, 255, 170), font=font_mono)
    d.text((80, 130), f"TIMECODE: 01:00:06:{f:02d} | BUFFER: STABLE", fill=(200, 220, 240), font=font_sub)
    d.text((WIDTH - 500, 80), "RESOLVE STUDIO 20.2", fill=(255, 180, 0), font=font_mono)
    d.text((WIDTH - 500, 130), "GPU: CUDA ACCELERATED", fill=(200, 220, 240), font=font_sub)
    
    p3.stdin.write(img.tobytes())
p3.stdin.close()
p3.wait()

# -------------------------------------------------------------
# SHOT 4: High-End Outro
# -------------------------------------------------------------
print("Rendering Shot 4: Outro...")
p4 = render_pipe("/home/kv/workspace/test_antigravity/shot4_outro.mp4")

for f in range(DURATION_FRAMES):
    # Fade to black over last 18 frames
    fade = 1.0
    if f > (DURATION_FRAMES - 18):
        fade = (DURATION_FRAMES - f) / 18.0
        
    c_bg = int(12 * fade)
    img = Image.new("RGB", (WIDTH, HEIGHT), (c_bg, c_bg, c_bg + 4))
    d = ImageDraw.Draw(img)
    
    c_white = int(255 * fade)
    c_accent = int(220 * fade)
    
    ot1 = "MISSION COMPLETE"
    ot2 = "Autonomous Multi-Track NLE Orchestration"
    ot3 = "Built with Antigravity Model Context Protocol"
    
    bo1 = d.textbbox((0, 0), ot1, font=font_title)
    wo1, ho1 = bo1[2] - bo1[0], bo1[3] - bo1[1]
    
    bo2 = d.textbbox((0, 0), ot2, font=font_sub)
    wo2 = bo2[2] - bo2[0]
    
    bo3 = d.textbbox((0, 0), ot3, font=font_sub)
    wo3 = bo3[2] - bo3[0]
    
    d.text(((WIDTH - wo1) // 2, HEIGHT // 2 - 100), ot1, fill=(c_white, c_white, c_white), font=font_title)
    d.text(((WIDTH - wo2) // 2, HEIGHT // 2 + 30), ot2, fill=(0, c_accent, c_accent), font=font_sub)
    d.text(((WIDTH - wo3) // 2, HEIGHT // 2 + 85), ot3, fill=(int(180*fade), int(180*fade), int(180*fade)), font=font_sub)
    
    p4.stdin.write(img.tobytes())
p4.stdin.close()
p4.wait()

print("All 4 showcase shots generated successfully!")
