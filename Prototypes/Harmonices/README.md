# Harmonices

A synthesizer and sequencer about the links between geometry and sound. It is a single HTML file with no build step: open `index.html` in a browser and press **Play** (or Space).

## Run it with MIDI, Bluetooth and Ableton Link

Browsers cannot speak Ableton Link, and MIDI and Bluetooth need the page to run from a secure address. The small bridge in `bridge/` handles both:

```
cd Prototypes/Harmonices/bridge
npm install        # builds the Link module (needs Node 18+ and build tools: Xcode on Mac, Build Tools on Windows)
npm start
```

Then open **http://localhost:20809** in Chrome or Edge. The bridge listens on 127.0.0.1 only and accepts WebSocket connections from localhost pages only.

## The page

- **Sound**: the three oscillators are drawn on top of each other. A shape's size is its volume, and the wave that traces it sits translucent behind it. Drag a shape out/in for volume and around for rotation. The selected oscillator has handles: ◆ corners, ● rounding/star, ✚ hub (eccentricity), ■ stretch. In *Circles* mode handles 2 and 3 are the circles (out = radius or FM index, around = speed). Muted oscillators are locked until you unmute them.
  - *Shape* engine: a point travels round a polygon. Its height is the waveform, turned into a band-limited wavetable with an FFT. *Even speed* traces the edge, *Even angle* with eccentricity gives phase distortion. *XY* sends x to the left channel and y to the right, as in oscilloscope music.
  - *Circles* engine: up to three circles with speed ratios (whole numbers, Fibonacci ratios, φ, √2, π, e). *Epicycle* is additive synthesis and *FM* is frequency modulation.
  - Each oscillator has a high-pass and low-pass filter, drawn over its own overtones. The filter is applied to the geometry too, so a closing low-pass rounds the shape.
- **Sequencer**, drawn rather than set with sliders. Muted oscillators are locked here too:
  - *Polygons*: polyrhythm of polygons; drag corners for pitch and rotation.
  - *Euclidean*: tap steps on and off.
  - *Fibonacci*: Fibonacci mod m with draggable seeds.
  - *Golden angle*: a sunflower whose turn snaps to 137.5°.
- **Modulation**: two LFOs (circle, diamond, square, saw, random, golden) that move rotation, rounding/star, stretch, eccentricity, circle radius/FM index, low-pass or volume on one oscillator or all three with a phase spread.
- **Keyboard**: on-screen spectral keys, computer keys (A W S E D F T G Y H U J K, Z/X for octave), MIDI (channels 1–3 → osc 1–3, pitch bend, sustain, CC1/74 cutoff, CC71 resonance, CC7 volume, MIDI clock follow), Bluetooth MIDI over Web Bluetooth, and Ableton Link through the bridge.
  - Arpeggiator patterns: Up, Down, Up/down, Star polygon {n/k}, Golden, Fibonacci, Random and As played. Rates from 1/4 to 1/32 with triplets, plus octaves, gate, swing and latch.
- **Echo and room**: tempo-synced echo whose repeats send ripples through the shapes, and a convolution room that makes the shapes glow brighter and longer.
- **Recordings**: record everything you hear. Takes are drawn as a spiral with two bars per turn and can be played back, exported as WebM/Opus (MP4 in Safari) or, in the standalone page, as 16-bit WAV.
- **Tone wheel**: the scale as a polygon.
  - Tap a note to add it to the scale or take it out.
  - Drag around to transpose: one step is a semitone in chromatic order and a fifth in fifths order.
  - *Mode* keeps the root and rotates the pattern of steps, for example major → Dorian → Phrygian.
- **Settings** (top right):
  - *Patches*: save, save as new, export/import `.harmonices.json`, and a library with factory patches. On claude.ai patches are saved privately to your account; in the standalone page they are saved in the browser.
  - *About*: the background on circles and sine waves, shapes and timbre, Fourier, FM, rhythm as pitch, Fibonacci, the golden angle and the octave of light.

## Shortcuts

Space plays and stops. Ctrl/Cmd+S saves the patch. Escape closes Settings.
