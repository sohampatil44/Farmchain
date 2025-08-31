let currentSpeech = null;
let isPaused = false;
let currentLanguage = 'en';

function initSpeechSynthesis() {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
}

function speakText(text, lang = null) {
    // Only allow TTS when Marathi is selected
    if (currentLanguage !== 'mr') {
        return;
    }
    
    if (currentSpeech) {
        window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Use Marathi TTS
    utterance.lang = 'hi-IN';
    
    utterance.rate = 0.9;
    utterance.volume = 1;
    utterance.pitch = 1;

    utterance.onstart = () => {
        currentSpeech = utterance;
        isPaused = false;
        highlightSpeakingElement(text);
        updateSpeechControls();
    };

    utterance.onend = () => {
        currentSpeech = null;
        isPaused = false;
        removeSpeakingHighlight();
        updateSpeechControls();
    };

    utterance.onpause = () => {
        isPaused = true;
        updateSpeechControls();
    };

    utterance.onresume = () => {
        isPaused = false;
        updateSpeechControls();
    };

    window.speechSynthesis.speak(utterance);
}

function stopSpeech() {
    if (currentSpeech) {
        window.speechSynthesis.cancel();
        currentSpeech = null;
        isPaused = false;
        removeSpeakingHighlight();
        updateSpeechControls();
    }
}

function pauseSpeech() {
    if (currentSpeech && !isPaused) {
        window.speechSynthesis.pause();
    }
}

function resumeSpeech() {
    if (currentSpeech && isPaused) {
        window.speechSynthesis.resume();
    }
}

function updateSpeechControls() {
    const stopBtn = document.getElementById('stop-speech');
    const pauseBtn = document.getElementById('pause-speech');
    const resumeBtn = document.getElementById('resume-speech');

    // Only show speech controls when Marathi is selected
    if (currentLanguage === 'mr') {
        if (currentSpeech) {
            stopBtn.disabled = false;
            pauseBtn.disabled = isPaused;
            resumeBtn.disabled = !isPaused;
        } else {
            stopBtn.disabled = true;
            pauseBtn.disabled = true;
            resumeBtn.disabled = true;
        }
    } else {
        // Hide/disable speech controls when English is selected
        stopBtn.disabled = true;
        pauseBtn.disabled = true;
        resumeBtn.disabled = true;
    }
}

function highlightSpeakingElement(text) {
    removeSpeakingHighlight();
    const elements = document.querySelectorAll('.speakable');
    elements.forEach(element => {
        if (element.textContent.trim() === text.trim()) {
            element.classList.add('speaking');
        }
    });
}

function removeSpeakingHighlight() {
    const elements = document.querySelectorAll('.speaking');
    elements.forEach(element => {
        element.classList.remove('speaking');
    });
}

function addSpeechListeners() {
    const speakableElements = document.querySelectorAll('.speakable');
    
    speakableElements.forEach(element => {
        element.removeEventListener('click', handleSpeechClick);
        element.addEventListener('click', handleSpeechClick);
    });
}

function handleSpeechClick(e) {
    // Only allow TTS when Marathi is selected
    if (currentLanguage !== 'mr') {
        return;
    }
    
    const text = e.target.textContent.trim();
    
    if (e.target.tagName === 'BUTTON' && e.target.type === 'submit') {
        return;
    }
    
    if (e.target.classList.contains('lang-btn')) {
        return;
    }
    
    if (e.target.classList.contains('btn') && e.target.tagName === 'A' && e.target.href) {
        e.preventDefault();
        e.stopPropagation();
        speakText(text);
        const href = e.target.href;
        setTimeout(() => {
            window.location.href = href;
        }, 1000);
        return;
    }
    
    if (e.target.tagName === 'A' && e.target.href) {
        return;
    }
    
    speakText(text);
}

function setLanguage(lang) {
    currentLanguage = lang;
    document.getElementById('html').lang = lang;
    
    const elements = document.querySelectorAll('[data-' + lang + ']');
    elements.forEach(element => {
        element.textContent = element.getAttribute('data-' + lang);
    });
    
    const langButtons = document.querySelectorAll('.lang-btn');
    langButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-lang') === lang) {
            btn.classList.add('active');
        }
    });
    
    // Stop any current speech when switching languages
    if (currentSpeech) {
        stopSpeech();
    }
    
    // Update speech controls visibility
    updateSpeechControls();
}

function initSpeech() {
    initSpeechSynthesis();
    addSpeechListeners();
    
    document.getElementById('stop-speech').addEventListener('click', stopSpeech);
    document.getElementById('pause-speech').addEventListener('click', pauseSpeech);
    document.getElementById('resume-speech').addEventListener('click', resumeSpeech);
    
    updateSpeechControls();
}

window.FarmChainSpeech = {
    speakText,
    stopSpeech,
    pauseSpeech,
    resumeSpeech,
    setLanguage,
    initSpeech
};

document.addEventListener('DOMContentLoaded', initSpeech);
