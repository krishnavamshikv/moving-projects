#!/usr/bin/env python3
"""
DaVinci Resolve MCP Server
Model Context Protocol server for DaVinci Resolve Studio on Linux/macOS/Windows.
Pure Python standard library implementation - zero external dependencies required.
Extended for 9:16 vertical video clipping and automated rendering pipelines.
"""

import sys
import os
import json
import traceback

# Ensure DaVinci Resolve Scripting modules are accessible
DEFAULT_LINUX_API = "/opt/resolve/Developer/Scripting"
DEFAULT_LINUX_LIB = "/opt/resolve/libs/Fusion/fusionscript.so"

if sys.platform.startswith("linux"):
    if "RESOLVE_SCRIPT_API" not in os.environ and os.path.exists(DEFAULT_LINUX_API):
        os.environ["RESOLVE_SCRIPT_API"] = DEFAULT_LINUX_API
    if "RESOLVE_SCRIPT_LIB" not in os.environ and os.path.exists(DEFAULT_LINUX_LIB):
        os.environ["RESOLVE_SCRIPT_LIB"] = DEFAULT_LINUX_LIB
    modules_path = os.path.join(os.environ.get("RESOLVE_SCRIPT_API", DEFAULT_LINUX_API), "Modules")
    if modules_path not in sys.path and os.path.exists(modules_path):
        sys.path.append(modules_path)

def get_resolve():
    """Attempt to connect to a running DaVinci Resolve instance."""
    try:
        import DaVinciResolveScript as dvr_script
        resolve = dvr_script.scriptapp("Resolve")
        return resolve
    except Exception as e:
        return None

def get_status():
    resolve = get_resolve()
    if not resolve:
        return (
            "DaVinci Resolve is NOT currently detected.\n"
            "Ensure DaVinci Resolve is open, and go to Preferences > System > General > "
            "External scripting using -> select 'Local' or 'Network'."
        )
    
    version = resolve.GetVersionString()
    pm = resolve.GetProjectManager()
    proj = pm.GetCurrentProject() if pm else None
    proj_name = proj.GetName() if proj else "No project open"
    
    timeline = proj.GetCurrentTimeline() if proj else None
    timeline_name = timeline.GetName() if timeline else "No timeline open"
    fps = timeline.GetSetting("timelineFrameRate") if timeline else "N/A"
    
    return (
        f"Connected to DaVinci Resolve {version}\n"
        f"Active Project: {proj_name}\n"
        f"Current Timeline: {timeline_name}\n"
        f"Frame Rate: {fps} fps"
    )

def create_project(name):
    resolve = get_resolve()
    if not resolve:
        return "Error: DaVinci Resolve is not running."
    pm = resolve.GetProjectManager()
    if not pm:
        return "Error: Could not access Project Manager."
    proj = pm.CreateProject(name)
    if proj:
        return f"Successfully created and opened project: '{name}'"
    proj = pm.LoadProject(name)
    if proj:
        return f"Project '{name}' already existed and was loaded."
    return f"Failed to create project '{name}'."

def create_timeline(name):
    resolve = get_resolve()
    if not resolve:
        return "Error: DaVinci Resolve is not running."
    pm = resolve.GetProjectManager()
    proj = pm.GetCurrentProject() if pm else None
    if not proj:
        return "Error: No project is currently open in DaVinci Resolve."
    media_pool = proj.GetMediaPool()
    timeline = media_pool.CreateEmptyTimeline(name)
    if timeline:
        return f"Successfully created timeline: '{name}'"
    return f"Failed to create timeline '{name}'."

def create_vertical_timeline(name, width=1080, height=1920, fps="30"):
    """Create a new 9:16 vertical resolution timeline (e.g. 1080x1920 for Shorts/Reels/TikTok)."""
    resolve = get_resolve()
    if not resolve:
        return "Error: DaVinci Resolve is not running."
    pm = resolve.GetProjectManager()
    proj = pm.GetCurrentProject() if pm else None
    if not proj:
        return "Error: No project is currently open in DaVinci Resolve."
    media_pool = proj.GetMediaPool()
    timeline = media_pool.CreateEmptyTimeline(name)
    if not timeline:
        return f"Failed to create timeline '{name}'."
    
    # Configure 9:16 vertical resolution
    try:
        timeline.SetSetting("useCustomSettings", "1")
        timeline.SetSetting("useVerticalResolution", "1")
        timeline.SetSetting("timelineResolutionWidth", str(width))
        timeline.SetSetting("timelineResolutionHeight", str(height))
        if fps:
            timeline.SetSetting("timelineFrameRate", str(fps))
    except Exception as e:
        pass
    
    proj.SetCurrentTimeline(timeline)
    return f"Successfully created vertical 9:16 timeline: '{name}' ({width}x{height} @ {fps}fps)"

def _find_media_pool_item(folder, identifier):
    """Recursively search for a MediaPoolItem by name or partial path."""
    for clip in folder.GetClipList():
        if identifier.lower() in clip.GetName().lower():
            return clip
        props = clip.GetClipProperty()
        if props and "File Path" in props and identifier.lower() in str(props["File Path"]).lower():
            return clip
    for sub in folder.GetSubFolderList():
        found = _find_media_pool_item(sub, identifier)
        if found:
            return found
    return None

def append_subclip(clip_identifier, start_frame, end_frame, track_index=1):
    """Append a specific segment (in/out frames) from a media pool clip directly onto the timeline."""
    resolve = get_resolve()
    if not resolve:
        return "Error: DaVinci Resolve is not running."
    pm = resolve.GetProjectManager()
    proj = pm.GetCurrentProject() if pm else None
    if not proj:
        return "Error: No project open."
    timeline = proj.GetCurrentTimeline()
    if not timeline:
        return "Error: No timeline active."
    media_pool = proj.GetMediaPool()
    root = media_pool.GetRootFolder()
    
    target_clip = _find_media_pool_item(root, clip_identifier)
    if not target_clip:
        clips = root.GetClipList()
        if clips:
            target_clip = clips[0]
        else:
            return f"Error: Could not find clip matching '{clip_identifier}' in Media Pool."
    
    subclip_data = {
        "mediaPoolItem": target_clip,
        "startFrame": int(start_frame),
        "endFrame": int(end_frame),
        "trackIndex": int(track_index)
    }
    appended = media_pool.AppendToTimeline([subclip_data])
    if appended:
        return f"Successfully appended subclip '{target_clip.GetName()}' [frames {start_frame}-{end_frame}] to track {track_index}."
    return "Failed to append subclip to timeline."

def set_clip_transform(track_type="video", track_index=1, item_index=0, zoom_x=1.0, zoom_y=1.0, pan_x=0.0, pan_y=0.0, crop_top=0.0, crop_bottom=0.0):
    """Adjust scale/pan/tilt of a clip on the timeline for vertical reframing and face centering."""
    resolve = get_resolve()
    if not resolve:
        return "Error: DaVinci Resolve is not running."
    pm = resolve.GetProjectManager()
    proj = pm.GetCurrentProject() if pm else None
    if not proj:
        return "Error: No project open."
    timeline = proj.GetCurrentTimeline()
    if not timeline:
        return "Error: No timeline active."
    
    items = timeline.GetItemListInTrack(track_type, int(track_index))
    if not items or len(items) <= int(item_index):
        return f"Error: No clip found at track {track_index}, index {item_index}."
    
    item = items[int(item_index)]
    try:
        item.SetProperty("ZoomX", float(zoom_x))
        item.SetProperty("ZoomY", float(zoom_y))
        item.SetProperty("Pan", float(pan_x))
        item.SetProperty("Tilt", float(pan_y))
        if crop_top:
            item.SetProperty("CropTop", float(crop_top))
        if crop_bottom:
            item.SetProperty("CropBottom", float(crop_bottom))
        return f"Updated transform for clip '{item.GetName()}': Zoom=({zoom_x}, {zoom_y}), Pan/Tilt=({pan_x}, {pan_y})"
    except Exception as e:
        return f"Error setting transform properties: {str(e)}"

def setup_stacked_layout(top_item_index=0, bottom_item_index=0, zoom=1.778):
    """
    Configure a classic 9:16 stacked split-screen layout (1080x1920):
    Video Track 1 = Bottom half (Tilt -480)
    Video Track 2 = Top half (Tilt +480)
    """
    resolve = get_resolve()
    if not resolve:
        return "Error: DaVinci Resolve is not running."
    pm = resolve.GetProjectManager()
    proj = pm.GetCurrentProject() if pm else None
    if not proj:
        return "Error: No project open."
    timeline = proj.GetCurrentTimeline()
    if not timeline:
        return "Error: No timeline active."
    
    track1_items = timeline.GetItemListInTrack("video", 1)
    track2_items = timeline.GetItemListInTrack("video", 2)
    
    results = []
    if track2_items and len(track2_items) > int(top_item_index):
        top_item = track2_items[int(top_item_index)]
        top_item.SetProperty("ZoomX", float(zoom))
        top_item.SetProperty("ZoomY", float(zoom))
        top_item.SetProperty("Tilt", 480.0)
        results.append(f"Top clip '{top_item.GetName()}' positioned on Track 2 (Tilt +480, Zoom {zoom})")
    
    if track1_items and len(track1_items) > int(bottom_item_index):
        bottom_item = track1_items[int(bottom_item_index)]
        bottom_item.SetProperty("ZoomX", float(zoom))
        bottom_item.SetProperty("ZoomY", float(zoom))
        bottom_item.SetProperty("Tilt", -480.0)
        results.append(f"Bottom clip '{bottom_item.GetName()}' positioned on Track 1 (Tilt -480, Zoom {zoom})")
    
    return "\n".join(results) if results else "Warning: Insufficient tracks or clips found on Track 1 and Track 2."

def configure_render_job(output_dir, file_name, width=1080, height=1920, in_frame=None, out_frame=None):
    """Configure render settings in Deliver page for 9:16 vertical video export and add to render queue."""
    resolve = get_resolve()
    if not resolve:
        return "Error: DaVinci Resolve is not running."
    pm = resolve.GetProjectManager()
    proj = pm.GetCurrentProject() if pm else None
    if not proj:
        return "Error: No project open."
    
    os.makedirs(output_dir, exist_ok=True)
    settings = {
        "TargetDir": output_dir,
        "CustomName": file_name,
        "ExportVideo": True,
        "ExportAudio": True,
        "FormatWidth": int(width),
        "FormatHeight": int(height)
    }
    if in_frame is not None and out_frame is not None:
        settings["SelectAllFrames"] = 0
        settings["MarkIn"] = int(in_frame)
        settings["MarkOut"] = int(out_frame)
    else:
        settings["SelectAllFrames"] = 1
        
    proj.SetRenderSettings(settings)
    job_id = proj.AddRenderJob()
    if job_id:
        return f"Successfully added render job '{job_id}' -> {os.path.join(output_dir, file_name)}"
    return "Failed to add render job."

def start_render():
    """Start the DaVinci Resolve render queue."""
    resolve = get_resolve()
    if not resolve:
        return "Error: DaVinci Resolve is not running."
    pm = resolve.GetProjectManager()
    proj = pm.GetCurrentProject() if pm else None
    if not proj:
        return "Error: No project open."
    
    started = proj.StartRendering()
    if started:
        return "Render queue started successfully."
    return "Failed to start render or render already in progress."

def get_render_status():
    """Get the current render status and progress of all jobs in the render queue."""
    resolve = get_resolve()
    if not resolve:
        return "Error: DaVinci Resolve is not running."
    pm = resolve.GetProjectManager()
    proj = pm.GetCurrentProject() if pm else None
    if not proj:
        return "Error: No project open."
    
    is_rendering = proj.IsRenderingInProgress()
    job_list = proj.GetRenderJobList()
    
    status_summary = {
        "is_rendering": is_rendering,
        "jobs": []
    }
    for job in job_list:
        jid = job.get("JobId", "")
        status = proj.GetRenderJobStatus(jid) if jid else {}
        status_summary["jobs"].append({
            "JobId": jid,
            "RenderStatus": status.get("JobStatus", "Unknown"),
            "CompletionPercentage": status.get("CompletionPercentage", 0),
            "EstimatedTimeRemaining": status.get("EstimatedTimeRemainingInMs", 0)
        })
    return json.dumps(status_summary, indent=2)

def add_marker(frame_id, color="Blue", name="Marker", note="", duration=1):
    resolve = get_resolve()
    if not resolve:
        return "Error: DaVinci Resolve is not running."
    pm = resolve.GetProjectManager()
    proj = pm.GetCurrentProject() if pm else None
    if not proj:
        return "Error: No project is currently open."
    timeline = proj.GetCurrentTimeline()
    if not timeline:
        return "Error: No timeline is currently active."
    
    if frame_id is None or frame_id < 0:
        frame_id = timeline.GetStartFrame()
    
    success = timeline.AddMarker(int(frame_id), color, name, note, int(duration))
    if success:
        return f"Added {color} marker '{name}' at frame {frame_id} (Duration: {duration}, Note: '{note}')"
    return f"Failed to add marker at frame {frame_id}."

def get_markers():
    resolve = get_resolve()
    if not resolve:
        return "Error: DaVinci Resolve is not running."
    pm = resolve.GetProjectManager()
    proj = pm.GetCurrentProject() if pm else None
    if not proj:
        return "Error: No project is currently open."
    timeline = proj.GetCurrentTimeline()
    if not timeline:
        return "Error: No timeline is currently active."
    markers = timeline.GetMarkers()
    if not markers:
        return "No markers found on current timeline."
    return json.dumps(markers, indent=2)

def import_media(file_paths):
    resolve = get_resolve()
    if not resolve:
        return "Error: DaVinci Resolve is not running."
    pm = resolve.GetProjectManager()
    proj = pm.GetCurrentProject() if pm else None
    if not proj:
        return "Error: No project is currently open."
    media_pool = proj.GetMediaPool()
    items = media_pool.ImportMedia(file_paths)
    if items:
        return f"Successfully imported {len(items)} media item(s)."
    return "Failed to import media files. Please check file paths."

def execute_dvr_script(code):
    resolve = get_resolve()
    if not resolve:
        return "Error: DaVinci Resolve is not running."
    pm = resolve.GetProjectManager()
    proj = pm.GetCurrentProject() if pm else None
    timeline = proj.GetCurrentTimeline() if proj else None
    media_pool = proj.GetMediaPool() if proj else None
    
    local_scope = {
        "resolve": resolve,
        "pm": pm,
        "project": proj,
        "timeline": timeline,
        "media_pool": media_pool,
        "output": ""
    }
    
    import io
    from contextlib import redirect_stdout
    
    f = io.StringIO()
    with redirect_stdout(f):
        try:
            exec(code, globals(), local_scope)
        except Exception as e:
            return f"Script error:\n{traceback.format_exc()}"
            
    out = f.getvalue()
    if not out and "result" in local_scope:
        out = str(local_scope["result"])
    return out if out else "Script executed successfully (no stdout produced)."

TOOLS = [
    {
        "name": "resolve_get_status",
        "description": "Check connection status to DaVinci Resolve, active project, current timeline, and frame rate.",
        "inputSchema": {
            "type": "object",
            "properties": {}
        }
    },
    {
        "name": "resolve_create_project",
        "description": "Create or load a project in DaVinci Resolve.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "name": {"type": "string", "description": "The name of the project to create or open"}
            },
            "required": ["name"]
        }
    },
    {
        "name": "resolve_create_timeline",
        "description": "Create a new standard timeline in the active DaVinci Resolve project.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "name": {"type": "string", "description": "The name of the new timeline"}
            },
            "required": ["name"]
        }
    },
    {
        "name": "resolve_create_vertical_timeline",
        "description": "Create a new 9:16 vertical resolution timeline (1080x1920) optimized for Shorts, Reels, and TikTok.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "name": {"type": "string", "description": "Timeline name"},
                "width": {"type": "integer", "description": "Timeline width (default 1080)", "default": 1080},
                "height": {"type": "integer", "description": "Timeline height (default 1920)", "default": 1920},
                "fps": {"type": "string", "description": "Timeline frame rate (default '30')", "default": "30"}
            },
            "required": ["name"]
        }
    },
    {
        "name": "resolve_append_subclip",
        "description": "Insert a specific frame range (start_frame to end_frame) from a media pool item into the timeline.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "clip_identifier": {"type": "string", "description": "Name or file path substring of the clip in Media Pool"},
                "start_frame": {"type": "integer", "description": "Source in frame"},
                "end_frame": {"type": "integer", "description": "Source out frame"},
                "track_index": {"type": "integer", "description": "Target video track index (default 1)", "default": 1}
            },
            "required": ["clip_identifier", "start_frame", "end_frame"]
        }
    },
    {
        "name": "resolve_set_clip_transform",
        "description": "Set pan, tilt, zoom, and crop properties of a timeline clip for vertical reframing / face centering.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "track_type": {"type": "string", "description": "Track type ('video')", "default": "video"},
                "track_index": {"type": "integer", "description": "Track index (1-based)", "default": 1},
                "item_index": {"type": "integer", "description": "Clip index on the track (0-based)", "default": 0},
                "zoom_x": {"type": "number", "description": "Horizontal zoom scale (e.g. 1.78 or 3.16)", "default": 1.0},
                "zoom_y": {"type": "number", "description": "Vertical zoom scale", "default": 1.0},
                "pan_x": {"type": "number", "description": "Pan X offset in pixels", "default": 0.0},
                "pan_y": {"type": "number", "description": "Tilt Y offset in pixels", "default": 0.0},
                "crop_top": {"type": "number", "description": "Top crop in pixels", "default": 0.0},
                "crop_bottom": {"type": "number", "description": "Bottom crop in pixels", "default": 0.0}
            }
        }
    },
    {
        "name": "resolve_setup_stacked_layout",
        "description": "Set up a 9:16 stacked split-screen layout (Top 50% on Video Track 2, Bottom 50% on Video Track 1).",
        "inputSchema": {
            "type": "object",
            "properties": {
                "top_item_index": {"type": "integer", "description": "Clip index on Track 2 (default 0)", "default": 0},
                "bottom_item_index": {"type": "integer", "description": "Clip index on Track 1 (default 0)", "default": 0},
                "zoom": {"type": "number", "description": "Scale factor to fill 50% vertical half (default 1.778)", "default": 1.778}
            }
        }
    },
    {
        "name": "resolve_configure_render_job",
        "description": "Configure the Deliver page settings for vertical video export and add the job to the render queue.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "output_dir": {"type": "string", "description": "Absolute directory path where rendered file will be saved"},
                "file_name": {"type": "string", "description": "Output filename (e.g. 'viral_clip_01.mp4')"},
                "width": {"type": "integer", "description": "Render width in pixels (default 1080)", "default": 1080},
                "height": {"type": "integer", "description": "Render height in pixels (default 1920)", "default": 1920},
                "in_frame": {"type": "integer", "description": "Optional Mark In frame for sub-range export"},
                "out_frame": {"type": "integer", "description": "Optional Mark Out frame for sub-range export"}
            },
            "required": ["output_dir", "file_name"]
        }
    },
    {
        "name": "resolve_start_render",
        "description": "Start rendering all queued jobs in the DaVinci Resolve Deliver queue.",
        "inputSchema": {
            "type": "object",
            "properties": {}
        }
    },
    {
        "name": "resolve_get_render_status",
        "description": "Check current rendering progress, percentage complete, and status of render jobs.",
        "inputSchema": {
            "type": "object",
            "properties": {}
        }
    },
    {
        "name": "resolve_add_marker",
        "description": "Add a marker with note, color, and name to the active timeline.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "frame_id": {"type": "integer", "description": "Frame number to place the marker. Use -1 for current start frame."},
                "color": {"type": "string", "description": "Color of the marker (e.g. 'Blue', 'Cyan', 'Green', 'Yellow', 'Red', 'Pink', 'Purple')", "default": "Blue"},
                "name": {"type": "string", "description": "Marker label/title", "default": "Marker"},
                "note": {"type": "string", "description": "Detailed notes or transcript", "default": ""},
                "duration": {"type": "integer", "description": "Marker duration in frames", "default": 1}
            },
            "required": ["frame_id"]
        }
    },
    {
        "name": "resolve_get_markers",
        "description": "Retrieve all markers on the active timeline.",
        "inputSchema": {
            "type": "object",
            "properties": {}
        }
    },
    {
        "name": "resolve_import_media",
        "description": "Import media files (videos, audio, images) into the DaVinci Resolve Media Pool.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "file_paths": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "List of absolute file paths to media files"
                }
            },
            "required": ["file_paths"]
        }
    },
    {
        "name": "resolve_execute_script",
        "description": "Execute arbitrary Python code against DaVinci Resolve. Exposes 'resolve', 'pm', 'project', 'timeline', 'media_pool' variables.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "code": {"type": "string", "description": "Python code snippet to execute directly inside DaVinci Resolve context"}
            },
            "required": ["code"]
        }
    }
]

def handle_call_tool(name, args):
    if name == "resolve_get_status":
        return get_status()
    elif name == "resolve_create_project":
        return create_project(args.get("name"))
    elif name == "resolve_create_timeline":
        return create_timeline(args.get("name"))
    elif name == "resolve_create_vertical_timeline":
        return create_vertical_timeline(
            args.get("name"),
            args.get("width", 1080),
            args.get("height", 1920),
            args.get("fps", "30")
        )
    elif name == "resolve_append_subclip":
        return append_subclip(
            args.get("clip_identifier"),
            args.get("start_frame"),
            args.get("end_frame"),
            args.get("track_index", 1)
        )
    elif name == "resolve_set_clip_transform":
        return set_clip_transform(
            args.get("track_type", "video"),
            args.get("track_index", 1),
            args.get("item_index", 0),
            args.get("zoom_x", 1.0),
            args.get("zoom_y", 1.0),
            args.get("pan_x", 0.0),
            args.get("pan_y", 0.0),
            args.get("crop_top", 0.0),
            args.get("crop_bottom", 0.0)
        )
    elif name == "resolve_setup_stacked_layout":
        return setup_stacked_layout(
            args.get("top_item_index", 0),
            args.get("bottom_item_index", 0),
            args.get("zoom", 1.778)
        )
    elif name == "resolve_configure_render_job":
        return configure_render_job(
            args.get("output_dir"),
            args.get("file_name"),
            args.get("width", 1080),
            args.get("height", 1920),
            args.get("in_frame"),
            args.get("out_frame")
        )
    elif name == "resolve_start_render":
        return start_render()
    elif name == "resolve_get_render_status":
        return get_render_status()
    elif name == "resolve_add_marker":
        return add_marker(
            args.get("frame_id"),
            args.get("color", "Blue"),
            args.get("name", "Marker"),
            args.get("note", ""),
            args.get("duration", 1)
        )
    elif name == "resolve_get_markers":
        return get_markers()
    elif name == "resolve_import_media":
        return import_media(args.get("file_paths", []))
    elif name == "resolve_execute_script":
        return execute_dvr_script(args.get("code", ""))
    else:
        return f"Unknown tool: {name}"

def send_response(resp):
    payload = json.dumps(resp)
    sys.stdout.write(payload + "\n")
    sys.stdout.flush()

def main():
    while True:
        line = sys.stdin.readline()
        if not line:
            break
        line = line.strip()
        if not line:
            continue
        try:
            req = json.loads(line)
        except json.JSONDecodeError:
            continue

        req_id = req.get("id")
        method = req.get("method")
        params = req.get("params", {})

        if method == "initialize":
            send_response({
                "jsonrpc": "2.0",
                "id": req_id,
                "result": {
                    "protocolVersion": "2024-11-05",
                    "capabilities": {
                        "tools": {}
                    },
                    "serverInfo": {
                        "name": "davinci-resolve-mcp",
                        "version": "1.1.0"
                    }
                }
            })
        elif method == "notifications/initialized":
            pass
        elif method == "ping":
            send_response({"jsonrpc": "2.0", "id": req_id, "result": {}})
        elif method == "tools/list":
            send_response({
                "jsonrpc": "2.0",
                "id": req_id,
                "result": {
                    "tools": TOOLS
                }
            })
        elif method == "tools/call":
            tool_name = params.get("name")
            tool_args = params.get("arguments", {})
            try:
                result_text = handle_call_tool(tool_name, tool_args)
                send_response({
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "result": {
                        "content": [
                            {
                                "type": "text",
                                "text": str(result_text)
                            }
                        ]
                    }
                })
            except Exception as e:
                send_response({
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "result": {
                        "content": [
                            {
                                "type": "text",
                                "text": f"Error executing tool: {traceback.format_exc()}"
                            }
                        ],
                        "isError": True
                    }
                })
        else:
            if req_id is not None:
                send_response({
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "error": {
                        "code": -32601,
                        "message": f"Method '{method}' not found"
                    }
                })

if __name__ == "__main__":
    main()
