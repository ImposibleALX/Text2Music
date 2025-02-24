import { SplendidGrandPiano } from "https://unpkg.com/smplr/dist/index.mjs";

import notesMap from './notes.js';

let context = new (window.AudioContext || window.webkitAudioContext)();
let piano = null;
let bpm = 80;
let isPianoLoaded = false;

document.addEventListener("DOMContentLoaded", async () => {
    const bpmSlider = document.getElementById("bpm");
    const bpmValue = document.getElementById("bpmValue");
    const inputText = document.getElementById("inputText");
    const charCount = document.getElementById("charCount");
    const errorMessage = document.getElementById("errorMessage");
    const playButton = document.getElementById("playButton");

    bpmSlider.addEventListener("input", () => {
        bpm = bpmSlider.value;
        bpmValue.innerText = bpm;
    });

    inputText.addEventListener("input", debounce(() => {
        charCount.innerText = inputText.value.length;
    }, 50));

    playButton.addEventListener("click", generateMelody);

    await preloadPiano(); // Preload piano antes de usarlo
});

function debounce(func, delay) {
    let timeout;
    return (...args) => {
        if (timeout) cancelAnimationFrame(timeout);
        timeout = requestAnimationFrame(() => func(...args));
    };
}

async function preloadPiano() {
    piano = new SplendidGrandPiano(context, { decayTime: 0.5 });
    await piano.ready; // Espera a que el piano cargue correctamente
    isPianoLoaded = true;
}

function generateMelody() {
    if (context.state === "suspended") {
        context.resume().then(() => setTimeout(playMelody, 0)); 
    } else {
        setTimeout(playMelody, 0);
    }
}

function playMelody() {
    if (!isPianoLoaded) return;

    const inputText = document.getElementById("inputText").value.toLowerCase();
    if (!inputText.length) {
        document.getElementById("errorMessage").innerText = "⚠️ Please enter text before generating a melody ⚠️";
        return;
    }
    
    document.getElementById("errorMessage").innerText = "";
    
    const now = context.currentTime;
    const noteDuration = (60 / bpm) / 2;
    let time = now;
    
    for (const char of inputText) {
        let note = notesMap[char];
        if (note) {
            piano.start({ note, time, duration: 0.3, velocity: 80 });
            time += noteDuration;
        } else if (char === ' ') {
            time += noteDuration;
        }
    }
}

