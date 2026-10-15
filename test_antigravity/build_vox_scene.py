#!/usr/bin/env python3
import json
import subprocess

script = """
resolve.OpenPage('edit')

media_pool = project.GetMediaPool()
root = media_pool.GetRootFolder()

# Create Vox bin
vox_bin = media_pool.AddSubFolder(root, "03_Vox_Explainer")
media_pool.SetCurrentFolder(vox_bin)

# Import files
vox_files = [
    "/home/kv/workspace/test_antigravity/vox_shot1_title.mp4",
    "/home/kv/workspace/test_antigravity/vox_shot2_document.mp4",
    "/home/kv/workspace/test_antigravity/vox_shot3_chart.mp4",
    "/home/kv/workspace/test_antigravity/vox_shot4_outro.mp4",
    "/home/kv/workspace/test_antigravity/vox_soundtrack.wav"
]
imported_items = media_pool.ImportMedia(vox_files)
print(f"Imported {len(imported_items)} assets into {vox_bin.GetName()}")

# Filter video and audio
video_clips = [item for item in imported_items if item.GetName().endswith(".mp4")]
audio_clips = [item for item in imported_items if item.GetName().endswith(".wav")]
video_clips = sorted(video_clips, key=lambda x: x.GetName())

# Create Timeline
timeline = media_pool.CreateTimelineFromClips("Vox Explained: Silicon Race", video_clips)
if timeline:
    project.SetCurrentTimeline(timeline)
    print(f"Created and activated timeline: {timeline.GetName()}")

    # Append Audio Track
    if audio_clips:
        media_pool.AppendToTimeline(audio_clips)
        print("Appended Vox soundtrack to Audio Track 1")

    # Colorize Timeline Clips
    items = timeline.GetItemListInTrack("video", 1)
    colors = ["Yellow", "Orange", "Cyan", "Red"]
    for idx, item in enumerate(items):
        c = colors[idx % len(colors)]
        item.SetClipColor(c)
        print(f"Set {item.GetName()} color to {c}")

    # Add Chapter Markers
    start_frame = timeline.GetStartFrame()
    markers = [
        (start_frame, "Yellow", "01: The $500B Race", "Title card with dynamic yellow highlighter", 72),
        (start_frame + 72, "Orange", "02: 92% Concentration", "Archival document quote focus and callout", 72),
        (start_frame + 144, "Cyan", "03: Moores Law Infographic", "Kinetic rising bar chart and metric counter", 72),
        (start_frame + 216, "Red", "04: Production Triangle", "Global supply chain map and Vox Explained outro", 72)
    ]
    for fid, color, name, note, dur in markers:
        timeline.AddMarker(fid, color, name, note, dur)
        print(f"Added {color} marker: {name}")

    # Reset playhead to start
    start_tc = timeline.GetStartTimecode()
    timeline.SetCurrentTimecode(start_tc)
    print("Playhead reset to start timecode:", start_tc)

print("Vox explainer construction complete!")
"""

req = {
    "jsonrpc": "2.0",
    "id": 26,
    "method": "tools/call",
    "params": {
        "name": "resolve_execute_script",
        "arguments": {"code": script}
    }
}

p = subprocess.run(
    ["python3", "/home/kv/workspace/test_antigravity/davinci-mcp/server.py"],
    input=json.dumps(req),
    text=True,
    capture_output=True
)
print(p.stdout)
