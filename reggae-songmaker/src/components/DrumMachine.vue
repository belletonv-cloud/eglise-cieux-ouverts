<script setup>
import { useSongStore } from "../stores/song";

const song = useSongStore();

// Patterns de batterie reggae
const drumPatterns = {
    kick: [1, 0, 0, 0], // 1er temps
    snare: [0, 0, 1, 0], // 3e temps
    hihat: [0, 1, 0, 1], // contre-temps
    ghost: [0, 0, 0, 0], // ghost notes
};

// Synthétiseurs
let drums = null;
let bass = null;

function initInstruments() {
    if (!drums) {
        // Kick - synth percussif
        drums = {
            kick: new Tone.MembraneSynth({
                pitchDecay: 0.05,
                octaves: 3,
                envelope: { attack: 0.001, decay: 0.4, sustain: 0 },
            }).toDestination(),
            snare: new Tone.NoiseSynth({
                noise: { type: "white" },
                envelope: { attack: 0.001, decay: 0.2, sustain: 0 },
            }).toDestination(),
            hihat: new Tone.MetalSynth({
                frequency: 200,
                envelope: { attack: 0.001, decay: 0.1, release: 0.01 },
            }).toDestination(),
        };
    }
}

function triggerDrum(type) {
    initInstruments();
    switch (type) {
        case "kick":
            drums.kick.triggerAttackRelease("C2", "8n");
            break;
        case "snare":
            drums.snare.triggerAttackRelease("8n");
            break;
        case "hihat":
            drums.hihat.triggerAttackRelease("16n");
            break;
    }
}
</script>

<template>
    <div class="drum-machine">
        <h2>🥁 Batterie Reggae</h2>

        <div class="pattern-controls">
            <h3>Pattern : {{ song.currentSection }}</h3>

            <div class="drum-row">
                <span>Kick</span>
                <button
                    v-for="(step, i) in drumPatterns.kick"
                    :key="i"
                    @click="triggerDrum('kick')"
                    class="step-btn"
                >
                    ●
                </button>
            </div>

            <div class="drum-row">
                <span>Snare</span>
                <button
                    v-for="(step, i) in drumPatterns.snare"
                    :key="i"
                    @click="triggerDrum('snare')"
                    class="step-btn"
                >
                    ●
                </button>
            </div>

            <div class="drum-row">
                <span>Hi-Hat</span>
                <button
                    v-for="(step, i) in drumPatterns.hihat"
                    :key="i"
                    @click="triggerDrum('hihat')"
                    class="step-btn"
                >
                    ●
                </button>
            </div>
        </div>

        <div class="drum-info">
            <p><strong>Patter classique reggae :</strong></p>
            <ul>
                <li>Kick : temps 1</li>
                <li>Snare : temps 3</li>
                <li>Hi-hat : contre-temps ouvert/fermé</li>
                <li>Ghost notes : groove supplémentaire</li>
            </ul>
        </div>
    </div>
</template>

<style scoped>
.drum-machine {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.drum-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 10px 0;
}

.drum-row span {
    width: 60px;
    font-weight: bold;
}

.step-btn {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: 2px solid #2e7d32;
    background: white;
    cursor: pointer;
}

.step-btn:hover {
    background: #e8f5e9;
}

.drum-info {
    margin-top: 15px;
    font-size: 14px;
    color: #666;
}
</style>
