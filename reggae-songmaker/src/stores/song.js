// Song store - gestion du morceau reggae
import { defineStore } from "pinia";
import * as Tone from "tone";

export const useSongStore = defineStore("song", {
  state: () => ({
    bpm: 78,
    isPlaying: false,
    currentSection: "intro",

    // Accords par section
    chords: {
      intro: ["Am", "F", "C", "G"],
      verse: ["Am", "F", "C", "G"],
      chorus: ["C", "G", "Am", "F"],
      bridge: ["F", "G", "Am", "Am", "F", "G", "C", "C"],
    },

    // Volumes
    volumes: {
      drums: 0.8,
      bass: 0.7,
      chords: 0.6,
      vocals: 0.9,
    },

    // Vocal synth
    lyrics: {
      intro: "Instrumental...",
      verse: "Yeah, mon frère, tu regardes le monde...\nMais qui te regarde ?",
      chorus: "Oh, Cieux Ouverts!\nTon amour me libère",
      bridge: "Dans la nuit, ta lumière brille\nSans fin, tu guides nos pas",
      outro: "Yeah...",
    },
    vocalVoice: "fr-FR",
    vocalPitch: 1.0,
  }),

  actions: {
    setBpm(value) {
      this.bpm = value;
      Tone.Transport.bpm.value = value;
    },

    async togglePlayback() {
      if (!this.isPlaying) {
        await Tone.start();
        Tone.Transport.bpm.value = this.bpm;
        this.isPlaying = true;
        Tone.Transport.start();
      } else {
        this.isPlaying = false;
        Tone.Transport.pause();
      }
    },

    stop() {
      this.isPlaying = false;
      Tone.Transport.stop();
    },

    setVolume(track, value) {
      this.volumes[track] = value;
    },
  },
});
