<script setup>
import { useSongStore } from "../stores/song";
import { ref, watch } from "vue";

const song = useSongStore();
const isSpeaking = ref(false);

function speakLyrics() {
    const lyrics = song.lyrics[song.currentSection];
    if (!lyrics || isSpeaking.value) return;

    isSpeaking.value = true;
    const utter = new SpeechSynthesisUtterance(lyrics);
    utter.lang = song.vocalVoice;
    utter.rate = 0.9;
    utter.pitch = song.vocalPitch;

    utter.onend = () => {
        isSpeaking.value = false;
    };

    speechSynthesis.speak(utter);
}
</script>

<template>
    <div class="vocal-synth">
        <h2>🎤 Synthèse Vocale</h2>

        <div class="vocal-controls">
            <textarea
                v-model="song.lyrics[song.currentSection]"
                :placeholder="`Lyrics pour ${song.currentSection}...`"
                rows="3"
                class="lyrics-input"
            />

            <div class="voice-controls">
                <label>Voix :</label>
                <select v-model="song.vocalVoice">
                    <option value="fr-FR">Français</option>
                    <option value="en-US">English</option>
                </select>

                <label>Pitch :</label>
                <input
                    type="range"
                    v-model="song.vocalPitch"
                    min="0.5"
                    max="2"
                    step="0.1"
                />
            </div>

            <button
                @click="speakLyrics"
                :disabled="isSpeaking"
                class="speak-btn"
            >
                {{ isSpeaking ? "🔊 En cours..." : "▶ Parler" }}
            </button>
        </div>
    </div>
</template>

<style scoped>
.vocal-synth {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.lyrics-input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    margin-bottom: 15px;
    font-family: inherit;
}

.voice-controls {
    display: flex;
    gap: 15px;
    align-items: center;
    margin-bottom: 15px;
    flex-wrap: wrap;
}

.voice-controls label {
    font-weight: 500;
}

.voice-controls select {
    padding: 5px 10px;
    border-radius: 4px;
}

.speak-btn {
    background: #9c27b0;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
}

.speak-btn:disabled {
    background: #ddd;
}
</style>
