#!/usr/bin/env python3
import math
import struct
import wave

SAMPLE_RATE = 48000
DURATION = 12.0 # 12 seconds
TOTAL_SAMPLES = int(SAMPLE_RATE * DURATION)

def make_pluck(freq, duration_sec=0.4, amp=0.25):
    n = int(SAMPLE_RATE * duration_sec)
    samples = []
    for i in range(n):
        t = i / SAMPLE_RATE
        # Decay
        env = math.exp(-t * 12.0)
        # Fundamental + resonant wooden mallet harmonics
        sig = 0.7 * math.sin(2 * math.pi * freq * t) + \
              0.25 * math.sin(2 * math.pi * (freq * 2.76) * t) + \
              0.1 * math.sin(2 * math.pi * (freq * 5.4) * t)
        samples.append(sig * env * amp)
    return samples

def make_click(duration_sec=0.03, amp=0.3):
    n = int(SAMPLE_RATE * duration_sec)
    samples = []
    for i in range(n):
        t = i / SAMPLE_RATE
        env = math.exp(-t * 150.0)
        sig = math.sin(2 * math.pi * 1800 * t) * (1 if i % 2 == 0 else -1)
        samples.append(sig * env * amp)
    return samples

# Initialize buffer with silence
audio_l = [0.0] * TOTAL_SAMPLES
audio_r = [0.0] * TOTAL_SAMPLES

# BPM = 120 -> 1 beat = 0.5s
# Arpeggio pattern (D major / B minor: B3, D4, F#4, A4, B4, D5, E5)
pitches = [246.94, 293.66, 369.99, 440.0, 493.88, 587.33, 659.25]
pattern = [0, 1, 2, 4, 3, 2, 4, 5, 1, 2, 3, 4, 2, 1, 3, 0]

step_time = 0.25 # 8th notes
num_steps = int(DURATION / step_time)

for step in range(num_steps):
    start_t = step * step_time
    start_idx = int(start_t * SAMPLE_RATE)
    pitch = pitches[pattern[step % len(pattern)]]
    
    # Pluck
    pluck = make_pluck(pitch, duration_sec=0.45, amp=0.22 if step % 2 == 0 else 0.15)
    for j, val in enumerate(pluck):
        if start_idx + j < TOTAL_SAMPLES:
            # Gentle stereo panning alternating
            pan = 0.5 + 0.15 * math.sin(step * 0.8)
            audio_l[start_idx + j] += val * (1.0 - pan)
            audio_r[start_idx + j] += val * pan

# Transition Clicks / Pops at scene cut points (every 3 seconds = 0s, 3s, 6s, 9s)
for cut_t in [0.05, 3.0, 6.0, 9.0]:
    c_idx = int(cut_t * SAMPLE_RATE)
    click = make_click(0.04, amp=0.35)
    for j, val in enumerate(click):
        if c_idx + j < TOTAL_SAMPLES:
            audio_l[c_idx + j] += val
            audio_r[c_idx + j] += val

# Warm subtle sub-bass drone
for i in range(TOTAL_SAMPLES):
    t = i / SAMPLE_RATE
    bass = 0.12 * math.sin(2 * math.pi * 61.74 * t) # B1 drone
    # Master fade in/out
    fade = 1.0
    if t < 0.2:
        fade = t / 0.2
    elif t > 11.5:
        fade = (12.0 - t) / 0.5
    
    audio_l[i] = (audio_l[i] + bass) * fade
    audio_r[i] = (audio_r[i] + bass) * fade

# Write 16-bit stereo WAV
wav_path = "/home/kv/workspace/test_antigravity/vox_soundtrack.wav"
with wave.open(wav_path, "wb") as f:
    f.setnchannels(2)
    f.setsampwidth(2)
    f.setframerate(SAMPLE_RATE)
    
    raw_bytes = bytearray()
    for l, r in zip(audio_l, audio_r):
        # Soft limiter
        clamped_l = max(-0.95, min(0.95, l))
        clamped_r = max(-0.95, min(0.95, r))
        int_l = int(clamped_l * 32767)
        int_r = int(clamped_r * 32767)
        raw_bytes.extend(struct.pack("<hh", int_l, int_r))
    f.writeframes(raw_bytes)

print(f"Generated Vox soundtrack at {wav_path}")
