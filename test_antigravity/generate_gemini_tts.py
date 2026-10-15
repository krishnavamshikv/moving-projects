#!/usr/bin/env python3
"""
Generate complete voiceovers using Gemini TTS (gemini-3.1-flash-tts-preview).
Supports: Fenrir, Aoede, Puck, Charon, Kore.
"""
import os
import sys
import wave
import subprocess
from google import genai
from google.genai import types

def get_api_key():
    key = os.getenv("GEMINI_API_KEY")
    if key:
        return key
    env_file = os.path.join(os.path.dirname(__file__), ".env")
    if os.path.exists(env_file):
        with open(env_file) as f:
            for line in f:
                if line.startswith("GEMINI_API_KEY="):
                    return line.strip().split("=", 1)[1].strip(' "\'')
    raise ValueError("GEMINI_API_KEY not found in environment or .env file")

def generate_voiceover(text, voice_name="Fenrir", output_stem="gemini_voiceover"):
    key = get_api_key()
    client = genai.Client(api_key=key)

    # Prompt framing to ensure full verbatim reading
    prompt = f'Read the following text aloud verbatim. Do not omit any words, and do not add commentary:\n\n"{text}"'

    print(f"Generating voiceover with voice '{voice_name}'...")
    response = client.models.generate_content(
        model="gemini-3.1-flash-tts-preview",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_modalities=["AUDIO"],
            max_output_tokens=8192,
            speech_config=types.SpeechConfig(
                voice_config=types.VoiceConfig(
                    prebuilt_voice_config=types.PrebuiltVoiceConfig(
                        voice_name=voice_name
                    )
                )
            )
        )
    )

    raw_pcm = response.candidates[0].content.parts[0].inline_data.data
    temp_wav = f"{output_stem}_temp.wav"
    out_wav = f"{output_stem}.wav"
    out_mp3 = f"{output_stem}.mp3"

    with wave.open(temp_wav, "wb") as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(24000)
        f.writeframes(raw_pcm)

    subprocess.run(["ffmpeg", "-y", "-i", temp_wav, "-ar", "48000", "-ac", "2", out_wav], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    subprocess.run(["ffmpeg", "-y", "-i", out_wav, "-b:a", "192k", out_mp3], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    if os.path.exists(temp_wav):
        os.remove(temp_wav)

    print(f"Successfully generated: {out_wav} and {out_mp3}")
    return out_wav, out_mp3

if __name__ == "__main__":
    text = sys.argv[1] if len(sys.argv) > 1 else "Inside the multi-billion dollar race to control the silicon supply chain, ninety-two percent of advanced semiconductors flow through a single bottleneck."
    voice = sys.argv[2] if len(sys.argv) > 2 else "Fenrir"
    stem = sys.argv[3] if len(sys.argv) > 3 else "gemini_fenrir_complete"
    generate_voiceover(text, voice, stem)
