#!/usr/bin/env python3
import math
import subprocess
from PIL import Image, ImageDraw, ImageFont

WIDTH, HEIGHT = 1920, 1080
FPS = 24
DURATION_FRAMES = 72 # 3 seconds per shot

# Typography
font_serif_large = ImageFont.truetype("/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf", 96)
font_serif_med = ImageFont.truetype("/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf", 52)
font_serif_small = ImageFont.truetype("/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf", 32)
font_sans_bold = ImageFont.truetype("/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf", 44)
font_sans_small = ImageFont.truetype("/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf", 26)
font_mono = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf", 28)

# Vox Palette
BG_PAPER = (246, 244, 237)       # Warm editorial off-white
GRID_DOTS = (226, 222, 214)      # Fine reference dots
VOX_YELLOW = (255, 230, 0)       # Signature yellow
VOX_RED = (225, 45, 45)          # Accent red
CHARCOAL = (24, 24, 24)          # Editorial deep text
INK_MUTED = (95, 95, 95)         # Sub-labels
CARD_BORDER = (210, 205, 195)

def render_pipe(output_path):
    cmd = [
        "ffmpeg", "-y", "-f", "rawvideo", "-vcodec", "rawvideo",
        "-s", f"{WIDTH}x{HEIGHT}", "-pix_fmt", "rgb24", "-r", str(FPS),
        "-i", "-", "-c:v", "libx264", "-preset", "ultrafast", "-pix_fmt", "yuv420p",
        output_path
    ]
    return subprocess.Popen(cmd, stdin=subprocess.PIPE, stderr=subprocess.DEVNULL)

def draw_paper_background(draw):
    # Dot grid
    for x in range(80, WIDTH, 80):
        for y in range(80, HEIGHT, 80):
            draw.point((x, y), fill=GRID_DOTS)
            draw.point((x+1, y), fill=GRID_DOTS)

# =========================================================================
# SHOT 1: The Vox Title Hook with Dynamic Yellow Highlighter
# =========================================================================
print("Rendering Vox Shot 1: The Title & Highlighter...")
p1 = render_pipe("/home/kv/workspace/test_antigravity/vox_shot1_title.mp4")

for f in range(DURATION_FRAMES):
    img = Image.new("RGB", (WIDTH, HEIGHT), BG_PAPER)
    d = ImageDraw.Draw(img)
    draw_paper_background(d)
    
    # Vox Header Badge
    d.rectangle([120, 90, 280, 140], fill=CHARCOAL)
    d.text((135, 98), "VOX", fill=(255, 255, 255), font=font_sans_bold)
    d.rectangle([295, 90, 520, 140], outline=CHARCOAL, width=3)
    d.text((315, 101), "EXPLAINED", fill=CHARCOAL, font=font_sans_small)
    
    # Main Headline
    line1 = "THE $500 BILLION"
    line2 = "SILICON RACE"
    
    d.text((120, 230), line1, fill=CHARCOAL, font=font_serif_large)
    
    # Animated Highlighter for "SILICON RACE"
    b2 = d.textbbox((120, 360), line2, font=font_serif_large)
    w2 = b2[2] - b2[0]
    h2 = b2[3] - b2[1]
    
    # Sweep highlighter from frame 12 to 38
    hl_progress = min(1.0, max(0.0, (f - 12) / 26.0))
    # Ease out
    hl_w = int(w2 * (1.0 - (1.0 - hl_progress)**2)) + 20
    
    if hl_progress > 0:
        # Draw transparent yellow highlight strip
        hl_img = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
        hl_d = ImageDraw.Draw(hl_img)
        hl_d.rectangle([110, 365, 110 + hl_w, 365 + h2 + 15], fill=(255, 230, 0, 200))
        img.paste(Image.alpha_composite(Image.new("RGBA", (WIDTH, HEIGHT), (246, 244, 237, 255)), hl_img).convert("RGB"), (0, 0))
        # Re-draw text over highlight
        d = ImageDraw.Draw(img)
        draw_paper_background(d)
        d.rectangle([120, 90, 280, 140], fill=CHARCOAL)
        d.text((135, 98), "VOX", fill=(255, 255, 255), font=font_sans_bold)
        d.rectangle([295, 90, 520, 140], outline=CHARCOAL, width=3)
        d.text((315, 101), "EXPLAINED", fill=CHARCOAL, font=font_sans_small)
        d.text((120, 230), line1, fill=CHARCOAL, font=font_serif_large)
    
    d.text((120, 360), line2, fill=CHARCOAL, font=font_serif_large)
    
    # Subtitle with red accent bar
    d.rectangle([120, 520, 128, 620], fill=VOX_RED)
    d.text((150, 525), "How an invisible sliver of etched sand became the most", fill=INK_MUTED, font=font_serif_med)
    d.text((150, 580), "valuable and contested manufactured object on Earth.", fill=INK_MUTED, font=font_serif_med)
    
    # Archival Collage Card (microchip cutout aesthetic)
    card_x, card_y, card_w, card_h = 1320, 240, 480, 520
    # Paper shadow
    d.rectangle([card_x + 8, card_y + 8, card_x + card_w + 8, card_y + card_h + 8], fill=(215, 210, 200))
    d.rectangle([card_x, card_y, card_x + card_w, card_y + card_h], fill=(255, 255, 255), outline=CARD_BORDER, width=2)
    # Chip illustration inside
    d.rectangle([card_x + 30, card_y + 30, card_x + card_w - 30, card_y + 340], fill=(28, 32, 42))
    d.rectangle([card_x + 110, card_y + 110, card_x + card_w - 110, card_y + 260], outline=(0, 220, 255), width=3)
    d.text((card_x + 140, card_y + 170), "2nm CHIP", fill=(0, 220, 255), font=font_mono)
    # Card caption
    d.text((card_x + 30, card_y + 370), "FIG 1.0: TSMC N2 WAFER", fill=CHARCOAL, font=font_mono)
    d.text((card_x + 30, card_y + 420), "Scale: 1:50,000,000", fill=INK_MUTED, font=font_sans_small)
    d.text((card_x + 30, card_y + 460), "Source: Semiconductor Industry Assoc.", fill=INK_MUTED, font=font_sans_small)

    p1.stdin.write(img.tobytes())
p1.stdin.close()
p1.wait()

# =========================================================================
# SHOT 2: Newspaper / Archival Document Callout
# =========================================================================
print("Rendering Vox Shot 2: Archival Document Callout...")
p2 = render_pipe("/home/kv/workspace/test_antigravity/vox_shot2_document.mp4")

for f in range(DURATION_FRAMES):
    img = Image.new("RGB", (WIDTH, HEIGHT), BG_PAPER)
    d = ImageDraw.Draw(img)
    draw_paper_background(d)
    
    # Document Header
    d.text((120, 80), "THE GLOBAL SUPPLY ARCHIVE", fill=INK_MUTED, font=font_mono)
    d.line([120, 120, WIDTH - 120, 120], fill=CARD_BORDER, width=2)
    
    # Newspaper text columns (simulated editorial columns)
    for col_i in range(3):
        col_x = 120 + col_i * 440
        d.text((col_x, 150), f"DISPATCH #{col_i + 1}", fill=CHARCOAL, font=font_sans_small)
        d.line([col_x, 185, col_x + 380, 185], fill=CHARCOAL, width=2)
        # Body placeholder text lines
        for row in range(12):
            ry = 210 + row * 26
            line_len = 380 if (row % 4 != 3) else 240
            d.line([col_x, ry, col_x + line_len, ry], fill=(210, 205, 195), width=4)
            
    # Vox Callout Box focusing on key finding
    bx, by, bw, bh = 420, 380, 1080, 480
    # Red focus frame with tick corners
    d.rectangle([bx, by, bx + bw, by + bh], fill=(255, 255, 255), outline=VOX_RED, width=4)
    # Corner marks
    mark_len = 25
    for cx, cy in [(bx, by), (bx+bw, by), (bx, by+bh), (bx+bw, by+bh)]:
        d.rectangle([cx - 6, cy - 6, cx + 6, cy + 6], fill=VOX_RED)
        
    # Content inside callout
    d.text((bx + 60, by + 50), "GEOGRAPHIC CONCENTRATION", fill=VOX_RED, font=font_mono)
    
    stat_text = "92% OF ADVANCED CHIPS"
    b_stat = d.textbbox((bx + 60, by + 110), stat_text, font=font_serif_large)
    stat_w = b_stat[2] - b_stat[0]
    stat_h = b_stat[3] - b_stat[1]
    
    # Animate highlighter across the stat
    hl2_p = min(1.0, max(0.0, (f - 10) / 24.0))
    hl2_w = int(stat_w * (1.0 - (1.0 - hl2_p)**2))
    if hl2_p > 0:
        d.rectangle([bx + 55, by + 120, bx + 55 + hl2_w, by + 120 + stat_h + 10], fill=VOX_YELLOW)
        
    d.text((bx + 60, by + 110), stat_text, fill=CHARCOAL, font=font_serif_large)
    
    d.text((bx + 60, by + 260), "Are fabricated by one company on a single island subject to", fill=CHARCOAL, font=font_serif_med)
    d.text((bx + 60, by + 325), "earthquakes, geopolitical friction, and drought.", fill=CHARCOAL, font=font_serif_med)
    
    # Arrow callout at bottom
    d.rectangle([bx + 60, by + 400, bx + 340, by + 445], fill=CHARCOAL)
    d.text((bx + 75, by + 410), "REPORTED: HSINCHU, TAIWAN", fill=(255, 255, 255), font=font_sans_small)

    p2.stdin.write(img.tobytes())
p2.stdin.close()
p2.wait()

# =========================================================================
# SHOT 3: The Vox Kinetic Bar / Infographic Chart
# =========================================================================
print("Rendering Vox Shot 3: Infographic & Moore's Law Chart...")
p3 = render_pipe("/home/kv/workspace/test_antigravity/vox_shot3_chart.mp4")

# Chart milestones: (Year, Transistor count, Target height)
bars = [
    ("1971", "2,300", 60),
    ("1989", "1.2M", 140),
    ("2000", "42M", 240),
    ("2012", "1.4B", 420),
    ("2026", "100B+", 640)
]

for f in range(DURATION_FRAMES):
    img = Image.new("RGB", (WIDTH, HEIGHT), BG_PAPER)
    d = ImageDraw.Draw(img)
    draw_paper_background(d)
    
    # Chart Header
    d.text((120, 80), "FIGURE 2.1 // COMPUTATIONAL EXPONENTIATION", fill=INK_MUTED, font=font_mono)
    d.text((120, 120), "Transistors per Microprocessor Die (1971 - 2026)", fill=CHARCOAL, font=font_serif_med)
    
    # Chart Baseline
    chart_y_base = 880
    chart_x_start = 220
    d.line([120, chart_y_base, WIDTH - 120, chart_y_base], fill=CHARCOAL, width=3)
    
    # Draw bars rising sequentially
    bar_width = 140
    bar_gap = 180
    
    for i, (year, label, max_h) in enumerate(bars):
        bx = chart_x_start + i * (bar_width + bar_gap)
        
        # Staggered animation: each bar starts 6 frames after previous
        bar_f_start = 4 + i * 8
        bar_progress = min(1.0, max(0.0, (f - bar_f_start) / 14.0))
        # Elastic / smooth ease out
        cur_h = int(max_h * (1.0 - (1.0 - bar_progress)**3))
        
        # Color: 2026 is Vox Yellow with red border, others are charcoal
        bar_fill = VOX_YELLOW if i == 4 else (45, 48, 55)
        bar_outline = VOX_RED if i == 4 else CHARCOAL
        
        if cur_h > 0:
            d.rectangle([bx, chart_y_base - cur_h, bx + bar_width, chart_y_base], fill=bar_fill, outline=bar_outline, width=3)
            # Label on top of bar
            d.text((bx + 10, chart_y_base - cur_h - 45), label, fill=CHARCOAL, font=font_sans_bold)
            
        # Year label below axis
        d.text((bx + 20, chart_y_base + 20), year, fill=CHARCOAL, font=font_mono)
        
    # Callout Badge on 2026 bar
    if f > 36:
        badge_p = min(1.0, (f - 36) / 12.0)
        badge_x, badge_y = 1380, 160
        d.rectangle([badge_x, badge_y, badge_x + 380, badge_y + 110], fill=VOX_RED)
        d.text((badge_x + 25, badge_y + 20), "+43,000,000x", fill=(255, 255, 255), font=font_serif_large)
        d.text((badge_x + 25, badge_y + 75), "Increase in density", fill=(255, 230, 230), font=font_sans_small)

    p3.stdin.write(img.tobytes())
p3.stdin.close()
p3.wait()

# =========================================================================
# SHOT 4: Minimalist Supply Chain Map & "Explained." Outro
# =========================================================================
print("Rendering Vox Shot 4: Map & Explained Outro...")
p4 = render_pipe("/home/kv/workspace/test_antigravity/vox_shot4_outro.mp4")

# Major Hubs: (Name, Role, Screen X, Screen Y)
hubs = [
    ("SAN JOSE", "Design / IP", 380, 480),
    ("EINDHOVEN", "Photolithography (ASML)", 900, 420),
    ("HSINCHU", "Fabrication (TSMC)", 1480, 560),
]

for f in range(DURATION_FRAMES):
    img = Image.new("RGB", (WIDTH, HEIGHT), BG_PAPER)
    d = ImageDraw.Draw(img)
    draw_paper_background(d)
    
    # Title
    d.text((120, 80), "THE TRIANGLE OF PRODUCTION", fill=INK_MUTED, font=font_mono)
    d.text((120, 120), "Three points that hold the modern world together.", fill=CHARCOAL, font=font_serif_med)
    
    # Draw animated dashed connecting lines between hubs
    p_line = min(1.0, f / 30.0)
    # San Jose to Eindhoven
    x1, y1 = hubs[0][2], hubs[0][3]
    x2, y2 = hubs[1][2], hubs[1][3]
    cur_x2 = int(x1 + (x2 - x1) * p_line)
    cur_y2 = int(y1 + (y2 - y1) * p_line)
    d.line([x1, y1, cur_x2, cur_y2], fill=VOX_RED, width=3)
    
    # Eindhoven to Hsinchu
    if f > 15:
        p_line2 = min(1.0, (f - 15) / 30.0)
        x3, y3 = hubs[2][2], hubs[2][3]
        cur_x3 = int(x2 + (x3 - x2) * p_line2)
        cur_y3 = int(y2 + (y3 - y2) * p_line2)
        d.line([x2, y2, cur_x3, cur_y3], fill=VOX_RED, width=3)
        
    # Draw Hub Nodes
    for name, role, hx, hy in hubs:
        # Concentric circles
        d.ellipse([hx - 16, hy - 16, hx + 16, hy + 16], fill=VOX_YELLOW, outline=CHARCOAL, width=3)
        d.ellipse([hx - 6, hy - 6, hx + 6, hy + 6], fill=VOX_RED)
        # Labels
        d.text((hx - 60, hy + 30), name, fill=CHARCOAL, font=font_sans_bold)
        d.text((hx - 60, hy + 75), role, fill=INK_MUTED, font=font_mono)
        
    # Final Vox signature card at bottom
    outro_box_w, outro_box_h = 700, 110
    ox, oy = (WIDTH - outro_box_w) // 2, 850
    d.rectangle([ox, oy, ox + outro_box_w, oy + outro_box_h], fill=CHARCOAL)
    d.rectangle([ox + 30, oy + 25, ox + 90, oy + 85], fill=VOX_YELLOW)
    d.text((ox + 115, oy + 32), "Vox", fill=(255, 255, 255), font=font_sans_bold)
    d.text((ox + 215, oy + 32), "•", fill=VOX_YELLOW, font=font_sans_bold)
    d.text((ox + 250, oy + 32), "EXPLAINED.", fill=(255, 255, 255), font=font_serif_med)

    p4.stdin.write(img.tobytes())
p4.stdin.close()
p4.wait()

print("All 4 Vox video shots rendered successfully!")
