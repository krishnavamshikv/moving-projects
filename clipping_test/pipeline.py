#!/usr/bin/env python3
"""
End-to-End 9:16 Vertical Video Clipping Pipeline
Orchestrates DaVinci Resolve (cutting & reframing) and Remotion (motion graphics & captions).

Usage:
    python3 pipeline.py --video /path/to/long_form.mp4 --in 1500 --out 2400 --hook "THE SECRET TO SUCCESS"
"""

import sys
import os
import json
import argparse
import subprocess
import time

# Add davinci-mcp to path
sys.path.insert(0, os.path.abspath("davinci-mcp"))
import server as dvr

def run_pipeline(video_path, start_frame, end_frame, hook_title, hook_subtitle="Wait for it 🔥", layout="crop_center", output_dir="output"):
    os.makedirs(output_dir, exist_ok=True)
    abs_video = os.path.abspath(video_path)
    base_name = os.path.splitext(os.path.basename(abs_video))[0]
    clip_id = f"{base_name}_clip_{int(time.time())}"
    
    print("\n" + "="*60)
    print(f"🎬 Starting 9:16 Clipping Pipeline: {clip_id}")
    print("="*60)
    
    # 1. Connect to DaVinci Resolve
    print("\n[Step 1/5] Checking DaVinci Resolve connection...")
    status = dvr.get_status()
    print(status)
    if "NOT currently detected" in status:
        print("\n⚠️ Note: DaVinci Resolve is not running. Resolve automation steps will be simulated.")
        print("To run live: Start DaVinci Resolve Studio and enable Preferences > General > External scripting > Local.")
    
    # 2. Setup 9:16 Vertical Timeline
    print("\n[Step 2/5] Creating 1080x1920 Vertical Timeline in DaVinci Resolve...")
    timeline_res = dvr.create_vertical_timeline(name=f"Shorts_{clip_id}", width=1080, height=1920, fps="30")
    print(" ->", timeline_res)
    
    # 3. Import Media and Insert Subclip
    print(f"\n[Step 3/5] Importing media and inserting subclip (Frames {start_frame} -> {end_frame})...")
    import_res = dvr.import_media([abs_video])
    print(" -> Import:", import_res)
    
    subclip_res = dvr.append_subclip(clip_identifier=base_name, start_frame=start_frame, end_frame=end_frame, track_index=1)
    print(" -> Subclip:", subclip_res)
    
    # 4. Reframing Layout
    print(f"\n[Step 4/5] Applying 9:16 layout ({layout})...")
    if layout == "crop_center":
        # 16:9 to 9:16 requires 1920/1080 * 1920/1080 = ~3.16x zoom or 1.78x relative
        transform_res = dvr.set_clip_transform(track_type="video", track_index=1, item_index=0, zoom_x=1.78, zoom_y=1.78, pan_x=0.0, pan_y=0.0)
        print(" -> Transform:", transform_res)
    elif layout == "stacked":
        stacked_res = dvr.setup_stacked_layout(top_item_index=0, bottom_item_index=0, zoom=1.778)
        print(" -> Stacked Layout:", stacked_res)
    
    # 5. Render Clean Master Clip from Resolve
    resolve_out_name = f"{clip_id}_clean.mp4"
    resolve_out_path = os.path.join(os.path.abspath(output_dir), resolve_out_name)
    print(f"\n[Step 5/5] Queueing Resolve Deliver Render -> {resolve_out_path}")
    render_config = dvr.configure_render_job(
        output_dir=os.path.abspath(output_dir),
        file_name=resolve_out_name,
        width=1080,
        height=1920,
        in_frame=start_frame,
        out_frame=end_frame
    )
    print(" -> Render Job:", render_config)
    
    # Generate Remotion Props JSON
    remotion_props = {
        "videoSrc": resolve_out_path,
        "hookTitle": hook_title,
        "hookSubtitle": hook_subtitle,
        "accentColor": "#FFD700",
        "showProgressBar": True,
        "watermark": "@viral_clips",
        "words": [
            {"word": "LISTEN", "startMs": 400, "endMs": 800},
            {"word": "TO", "startMs": 800, "endMs": 1050},
            {"word": "THIS", "startMs": 1050, "endMs": 1500},
            {"word": "CAREFULLY", "startMs": 1500, "endMs": 2200},
            {"word": "BECAUSE", "startMs": 2200, "endMs": 2600},
            {"word": "IT", "startMs": 2600, "endMs": 2850},
            {"word": "CAN", "startMs": 2850, "endMs": 3100},
            {"word": "CHANGE", "startMs": 3100, "endMs": 3600},
            {"word": "EVERYTHING.", "startMs": 3600, "endMs": 4400}
        ]
    }
    
    meta_json_path = os.path.join(output_dir, f"{clip_id}_remotion_meta.json")
    with open(meta_json_path, "w") as f:
        json.dump(remotion_props, f, indent=2)
    print(f"\n✨ Generated Remotion metadata: {meta_json_path}")
    
    final_output_path = os.path.join(output_dir, f"{clip_id}_FINAL.mp4")
    print(f"\n🚀 Ready for Remotion Motion Graphics Render:")
    print(f"   Command: cd remotion-clipping && node render.mjs --input {os.path.abspath(meta_json_path)} --output {os.path.abspath(final_output_path)}")
    print("="*60 + "\n")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="9:16 Video Clipping Automation")
    parser.add_argument("--video", default="sample_longform.mp4", help="Path to long-form source video")
    parser.add_argument("--in", dest="start_frame", type=int, default=1000, help="Start frame of viral moment")
    parser.add_argument("--out", dest="end_frame", type=int, default=2500, help="End frame of viral moment")
    parser.add_argument("--hook", default="THE UNTOLD STORY", help="Hook title card text")
    parser.add_argument("--subtitle", default="Watch closely 👀", help="Hook subtitle text")
    parser.add_argument("--layout", choices=["crop_center", "stacked"], default="crop_center", help="9:16 framing layout")
    parser.add_argument("--outdir", default="output", help="Output directory")
    
    args = parser.parse_args()
    run_pipeline(
        video_path=args.video,
        start_frame=args.start_frame,
        end_frame=args.end_frame,
        hook_title=args.hook,
        hook_subtitle=args.subtitle,
        layout=args.layout,
        output_dir=args.outdir
    )
