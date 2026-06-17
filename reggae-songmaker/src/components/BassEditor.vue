<script setup>
import { useSongStore } from "../stores/song";
import * as Tone from "tone";

const song = useSongStore();

// Patterns de basse reggae style "round"
const bassLines = {
    verse: [
        { note: "A2", dur: "4n" },
        { note: "C3", dur: "8n" },
        { note: "E3", dur: "8n" },
        { note: "G2", dur: "4n" },
    ],
    chorus: [
        { note: "C2", dur: "2n" },
        { note: "E2", dur: "2n" },
    ],
};

// Synth basse
let bassSynth = null;

function initBass() {
    if (!bassSynth) {
        bassSynth = new Tone.Synth({
            oscillator: { type: "square" },
            envelope: { attack: 0.01, decay: 0.3, sustain: 0.4, release: 0.5 },
        }).toDestination();
    }
}

function playBassNote(note) {
    initBass();
    bassSynth.triggerAttackRelease(note, "8n");
}
</script>

<template>
    <div class="bass-editor">
        <h2>🎸 Basse Ronde</h2>

        <div class="bass-controls">
            <label>Style : {{ song.currentSection }}</label>
            <div class="bass-notes">
                <button
                    v-for="note in [
                        'A2',
                        'C3',
                        'E3',
                        'G2',
                        'F2',
                        'A2',
                        'C3',
                        'G2',
                    ]"
                    :key="note"
                    @click="playBassNote(note)"
                    class="bass-btn"
                >
                    {{ note }}
                </button>
            </div>
        </div>

        <div class="bass-pattern">
            <h3>Pattern "round" suggéré</h3>
            <p class="pattern-text">
                Am : A – C – E – G<br />
                F : F – A – C<br />
                C : C – E – G<br />
                G : G – B – D
            </p>
        </div>

        <div class="bass-tips">
            <p>
                <strong>Conseils :</strong> Jouer les notes en légère
                contre-phase avec la guitare skank, très ronde avec octaves.
            </p>
        </div>
    </div>
</template>

<style scoped>
.bass-editor {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.bass-btn {
    background: #1b5e20;
    color: white;
    border: none;
    padding: 8px 12px;
    margin: 3px;
    border-radius: 4px;
    cursor: pointer;
}

.pattern-text {
    font-family: monospace;
    background: #e8f5e9;
    padding: 10px;
    border-radius: 4px;
    margin-top: 10px;
}

.bass-tips {
    margin-top: 15px;
    font-size: 13px;
    color: #555;
}
</style>
