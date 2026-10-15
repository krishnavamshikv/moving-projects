# Kruthika — Official Character Sheet & Visual Identity DNA

> **Persona Role**: 22-year-old relatable Indian Fashion & Lifestyle AI Influencer  
> **Niche**: Meesho / Myntra Budget Finds, College Styling, Festive Ethnic Wear, and Try-On Hauls  
> **Folder Location**: `/home/kv/workspace/money_making/AI_infulencer/kruthika_samples/`

---

## 1. Visual DNA & Character Attributes

| Feature | Detailed Specification |
| :--- | :--- |
| **Name** | Kruthika |
| **Apparent Age** | 21–23 years old |
| **Ethnicity** | South Indian / Pan-Indian |
| **Face Shape** | Soft rounded-oval face, gentle jawline, smooth natural contours |
| **Skin Tone & Complexion**| Warm wheatish / fair-medium Indian skin tone with healthy peachy/rosy undertones and natural pore texture (no artificial airbrushing) |
| **Eyes & Brows** | Large, expressive warm dark-brown almond-shaped eyes; naturally defined, softly arched dark eyebrows |
| **Smile & Expression** | Wide, radiant, warm and approachable smile showing upper teeth; friendly and energetic girl-next-door persona |
| **Hair** | Long, voluminous, wavy dark espresso/black hair with natural flow, falling past shoulders |
| **Physique / Body Type** | Curvy feminine hourglass silhouette, medium height (~5'4" / 163 cm), naturally proportional |
| **Signature Aesthetic** | Indian Festive (Sarees, Anarkalis, Kurti sets) & Modern Contemporary Casuals (Tailored trousers, knit tops, chic loungewear) |

---

## 2. Master Reference Assets

All files are saved locally in `kruthika_samples/`:

1. **`kruthika_closeup.jpeg`**: Original reference close-up in light blue embroidered ethnic wear.
2. **`kruthika_fullbody.jpeg`**: Original reference full-length body shot in red long-sleeve bodycon dress.
3. **`kruthika_master_portrait.jpg`**: High-resolution studio front-facing portrait (Face Anchor).
4. **`kruthika_ethnic_saree.jpg`**: Full-length traditional look in royal emerald green silk saree with gold jewelry.
5. **`kruthika_casual_western.jpg`**: Full-length modern casual look in tailored beige trousers and lavender knit top in a city cafe.
6. **`kruthika_mirror_tryon.jpg`**: Realistic bedroom mirror selfie try-on in floral kurti and white palazzo pants.

---

## 3. Production Prompt Formulas (For Google Flow / Imagen / Flux)

### Master Identity Anchor (Prefix for every prompt)
```text
Candid vertical photograph of the exact same 22-year-old Indian woman (Kruthika) from reference photos, preserving identical facial features, warm wheatish skin tone, large expressive dark brown eyes, softly arched dark eyebrows, long voluminous wavy black hair, and radiant warm smile showing upper teeth. Curvy feminine silhouette. Authentic skin texture, realistic natural lighting, shot on 85mm f/1.8 lens, photorealistic 8k, no cartoonish smoothness.
```

---

### Formula A: Meesho Ethnic Kurti / Anarkali Try-On
```text
[Master Identity Anchor] She is wearing [INSERT MEESHO DRESS: e.g. a flared black cotton short peplum kurti with white floral block print, V-neck, long sleeves, paired with crisp white cotton straight-leg trousers]. Accessorized with [e.g. small oxidized silver jhumka earrings]. Standing in [e.g. a sunlit modern Indian balcony with potted plants]. Clean fashion catalogue aesthetics, sharp focus on fabric texture and print details.
```

---

### Formula B: High-Converting Mirror Selfie (Haul Review)
```text
[Master Identity Anchor] Candid full-length mirror selfie of Kruthika holding an iPhone in front of an aesthetic tall arched wooden dressing mirror in her cozy tidy bedroom. She is wearing [INSERT OUTFIT]. Warm glowing fairy lights and a cozy rug in the background. Natural smartphone camera texture, authentic reflections and shadows.
```

---

### Formula C: Google Flow / Veo Video Motion Prompts
When importing a keyframe into Google Flow for video motion:
```text
"The 22-year-old Indian woman smiles radiantly at the camera, swaying gently to show her outfit, holding her smartphone, natural subtle breathing and hair movement, smooth handheld camera motion, 24fps cinematic realism, 4k."
```

---

## 4. Negative Prompt (To Prevent Face & Body Drift)
```text
bad anatomy, distorted face, extra limbs, artificial airbrushed plastic skin, cartoon, anime, western facial features, blonde hair, blue eyes, blurry, low resolution, oversaturated, deformed hands, missing fingers.
```
