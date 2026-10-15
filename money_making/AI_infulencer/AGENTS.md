# Agent Specification: AI Influencer Fashion Reviews

## 1. Overview & Objective
Build and scale a virtual Indian fashion influencer ("Kruthika") to publish high-converting fashion try-on, styling, and review short-form videos (Instagram Reels, YouTube Shorts). Monetize through Meesho reselling margins and affiliate marketing across major fashion platforms (Myntra, Amazon, Ajio).

---

## 2. Business Model & Monetization
- **Meesho Reseller Margin**: Add custom profit margins to trending Meesho products and share direct order links / product codes.
- **Affiliate Commissions**: Earn 5%–15% commission on fashion sales via affiliate networks (EarnKaro, CueLinks, Myntra/Amazon affiliate programs).
- **Brand Collaborations**: Sponsored try-on hauls once reaching micro-influencer threshold (10k+ followers).

---

## 3. Persona & Visual Identity
- **Character Name**: Kruthika
- **Persona**: 22-year-old relatable Indian college graduate & budget fashion curator.
- **Visual Reference**: Character DNA defined in [`kruthika_character_sheet.md`](file:///home/kv/workspace/money_making/AI_infulencer/kruthika_samples/kruthika_character_sheet.md).
- **Aesthetic**: Relatable girl-next-door, authentic mirror selfies, festive wear, and college budget finds.

---

## 4. End-to-End Agent Workflow

```
[Trend & Product Hunting] 
       │
       ▼
[Visual Generation (Google Flow / Image Model)]
       │
       ▼
[Motion & Video Pipeline (Video Generator / Lip Sync)]
       │
       ▼
[Scripting & Voiceover (Natural Indian English/Hinglish TTS)]
       │
       ▼
[Video Assembly & Captions (DaVinci Resolve / CapCut)]
       │
       ▼
[Posting & Affiliate Link Routing (Meesho Code / Linktree)]
```

### Sub-Pipelines:
1. **Product Selection Agent**:
   - Scrapes or monitors top-selling, high-margin ethnic and western outfits on Meesho/Myntra under ₹500–₹1,500.
2. **Visual Consistency Agent**:
   - Uses Kruthika reference images with consistent prompt anchors via Google Flow / Flux / Imagen.
3. **Audio & Script Agent**:
   - Generates natural, fast-paced 15–30s script focusing on fabric, price comparison, fit, and call-to-action ("Comment 'LINK' for Meesho code").
4. **Post-Production Agent**:
   - Edits vertical 9:16 video, overlays dynamic bouncing subtitles, adds trending audio, and renders final cut.
5. **Distribution & Monetization Agent**:
   - Sets up bio link landing page with direct purchase links, tracks order status, clicks, and earnings.

---

## 5. Tools & Stack
- **Image & Video AI**: Google Flow, Flux, Midjourney / SDXL (ControlNet), Kling / Runway / Hedra / LivePortrait.
- **Audio**: ElevenLabs / Kokoro (relatable Indian accent).
- **Editing**: DaVinci Resolve (available via MCP), CapCut.
- **Affiliate & Reselling**: Meesho Partner App, EarnKaro, Bitly / Beacons.ai link-in-bio.
