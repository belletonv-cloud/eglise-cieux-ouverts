# 🎵 Reggae Songmaker

App de création d'instru reggae style Les Guetteurs / Melchior.

## Fonctionnalités

- **Transport** : contrôle tempo (70-90 BPM), play/stop, sélection sections
- **ChordEditor** : gestion des accords par section (intro, couplet, refrain, pont)
- **DrumMachine** : pattern batterie reggae (kick/snare/hihat)
- **BassEditor** : ligne de basse "round" style reggae
- **Mixer** : contrôle volumes drums/bass/chords
- **VocalSynth** : synthèse vocale avec SpeechSynthesis API

## Accords inclus

```
Couplet : Am – F – C – G
Refrain  : C – G – Am – F
Pont     : F – G – Am – Am | F – G – C – C
```

## Démarrage

```bash
npm install
npm run dev
```

Ouvrir http://localhost:3001

⚠️ **Important** : Cette app nécessite une interaction utilisateur (click) pour démarrer l'audio grâce aux politiques du navigateur.

## Structure du projet

```
src/
├── main.js           # Entry point
├── stores/
│   └── song.js       # Store Pinia
├── components/
│   ├── Transport.vue
│   ├── ChordEditor.vue
│   ├── DrumMachine.vue
│   ├── BassEditor.vue
│   ├── Mixer.vue
│   └── VocalSynth.vue
└── style.css
```

## Prochaines étapes

- [ ] Séquenceur complet avec boucle
- [ ] Instruments audio plus réalistes (samples)
- [ ] Export MIDI/WAV
- [ ] Guitare skank en temps réel
- [ ] Pattern ghost notes configurable