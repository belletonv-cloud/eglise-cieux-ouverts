<script setup>
import { ref, watch } from "vue";
import { useSongStore } from "../stores/song";
import * as Tone from "tone";

const song = useSongStore();
const notes = ["Am", "F", "C", "G", "Em", "Dm", "Bb", "Eb"];

// Synthèseur d'accords
let chordSynth = null;

function initSynth() {
    if (!chordSynth) {
        chordSynth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: "sine" },
            envelope: { attack: 0.1, decay: 0.2, sustain: 0.3, release: 1 },
        }).toDestination();
    }
}

function playChord(chord) {
    initSynth();
    // Simple mapping - en vrai il faudrait un mapper complet
    const chordNotes = {
        Am: ["A3", "C4", "E4"],
        F: ["F3", "A3", "C4"],
        C: ["C3", "E3", "G3"],
        G: ["G3", "B3", "D4"],
        Em: ["E3", "G3", "B3"],
        Dm: ["D3", "F3", "A3"],
        Bb: ["Bb2", "D3", "F3"],
        Eb: ["Eb3", "G3", "Bb3"],
    };

    const notes = chordNotes[chord] || ["C3", "E3", "G3"];
    chordSynth.triggerAttackRelease(notes, "2n");
    song.$patch({ lastPlayedChord: chord });
}
</script>

<template>
    <div class="chord-editor">
        <h2>🎸 Accords</h2>

        <div class="chord-display">
            <h3>{{ song.currentSection }}</h3>
            <div class="chord-sequence">
                <button
                    v-for="chord in song.chords[song.currentSection]"
                    :key="chord"
                    @click="playChord(chord)"
                    :class="{ active: song.lastPlayedChord === chord }"
                >
                    {{ chord }}
                </button>
            </div>
        </div>

        <div class="chord-section">
            <label>Modifier la séquence</label>
            <div class="chord-grid">
                <button
                    v-for="note in notes"
                    :key="note"
                    @click="song.chords[song.currentSection].push(note)"
                    class="chord-option"
                >
                    {{ note }}
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.chord-editor {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chord-sequence {
    display: flex;
    gap: 10px;
    margin: 15px 0;
}

.chord-sequence button {
    background: #2e7d32;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
}

.chord-sequence button:hover {
    background: #4caf50;
}

.chord-sequence button.active {
    background: #ff9800;
    transform: scale(1.1);
}

.chord-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    margin-top: 10px;
}

.chord-option {
    background: #e8f5e9;
    border: 1px solid #4caf50;
    padding: 8px;
    border-radius: 4px;
    cursor: pointer;
}
</style>
