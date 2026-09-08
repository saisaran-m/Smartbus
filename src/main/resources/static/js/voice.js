/* ============================================
   SmartBus - Voice Assistant Module
   Speech recognition + synthesis
   English & Tamil support
   ============================================ */

const SmartBusVoice = {
    recognition: null,
    isListening: false,
    currentLanguage: 'en',
    
    translations: {
        en: {
            title: 'Voice Assistant',
            prompt: 'Tell me your destination',
            example: 'Say "Chennai to Villupuram"',
            listening: 'Listening...',
            processing: 'Processing...',
            noResult: 'Could not understand. Please try again.',
            searchingBuses: 'Searching buses for you...',
            tapToSpeak: 'Tap the microphone to speak'
        },
        ta: {
            title: 'குரல் உதவியாளர்',
            prompt: 'உங்கள் இலக்கை சொல்லுங்கள்',
            example: '"சென்னை to விழுப்புரம்" என்று சொல்லுங்கள்',
            listening: 'கேட்கிறது...',
            processing: 'செயலாக்கம்...',
            noResult: 'புரியவில்லை. மீண்டும் முயற்சிக்கவும்.',
            searchingBuses: 'பேருந்துகளைத் தேடுகிறது...',
            tapToSpeak: 'பேச மைக்ரோஃபோனை தொடவும்'
        }
    },

    init() {
        this.setupLanguageSelector();
        this.setupMicButton();
        this.updateUI();
    },

    setupLanguageSelector() {
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentLanguage = btn.dataset.lang;
                SmartBus.state.language = this.currentLanguage;
                this.updateUI();
            });
        });
    },

    setupMicButton() {
        const micBtn = document.getElementById('mic-button');
        if (micBtn) {
            micBtn.addEventListener('click', () => {
                if (this.isListening) {
                    this.stopListening();
                } else {
                    this.startListening();
                }
            });
        }

        // Also setup simulated input button
        const simBtn = document.getElementById('sim-voice-btn');
        if (simBtn) {
            simBtn.addEventListener('click', () => this.simulateVoiceInput());
        }
    },

    updateUI() {
        const t = this.translations[this.currentLanguage];
        
        const title = document.getElementById('voice-title');
        if (title) title.textContent = t.title;

        const prompt = document.getElementById('voice-prompt');
        if (prompt) prompt.textContent = t.prompt;

        const example = document.getElementById('voice-example');
        if (example) example.textContent = t.example;

        const status = document.getElementById('voice-status');
        if (status) status.textContent = t.tapToSpeak;
    },

    startListening() {
        // Check if Web Speech API is available
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            this.recognition.lang = this.currentLanguage === 'ta' ? 'ta-IN' : 'en-IN';
            this.recognition.continuous = false;
            this.recognition.interimResults = true;

            this.recognition.onstart = () => {
                this.isListening = true;
                this.setListeningState(true);
            };

            this.recognition.onresult = (event) => {
                let transcript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    transcript += event.results[i][0].transcript;
                }
                
                const resultEl = document.getElementById('voice-result');
                if (resultEl) resultEl.textContent = transcript;

                if (event.results[event.resultIndex].isFinal) {
                    this.processVoiceInput(transcript);
                }
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                if (event.error === 'not-allowed') {
                    SmartBus.showToast('Microphone access denied. Please allow microphone access.', 'error');
                } else {
                    SmartBus.showToast('Voice recognition error. Try the simulate button instead.', 'info');
                }
                this.setListeningState(false);
                this.isListening = false;
            };

            this.recognition.onend = () => {
                this.isListening = false;
                this.setListeningState(false);
            };

            this.recognition.start();
        } else {
            // Fallback: show simulation option
            SmartBus.showToast('Voice recognition not available in this browser. Use the simulate button.', 'info');
            this.simulateVoiceInput();
        }
    },

    stopListening() {
        if (this.recognition) {
            this.recognition.stop();
        }
        this.isListening = false;
        this.setListeningState(false);
    },

    setListeningState(listening) {
        const micBtn = document.getElementById('mic-button');
        const status = document.getElementById('voice-status');
        const t = this.translations[this.currentLanguage];

        if (micBtn) {
            micBtn.classList.toggle('listening', listening);
        }
        if (status) {
            status.textContent = listening ? t.listening : t.tapToSpeak;
        }
    },

    simulateVoiceInput() {
        const resultEl = document.getElementById('voice-result');
        const status = document.getElementById('voice-status');
        const t = this.translations[this.currentLanguage];

        // Simulate listening
        this.setListeningState(true);
        
        if (status) status.textContent = t.listening;

        setTimeout(() => {
            const simulatedText = 'Chennai to Villupuram';
            if (resultEl) resultEl.textContent = simulatedText;
            if (status) status.textContent = t.processing;

            setTimeout(() => {
                this.processVoiceInput(simulatedText);
                this.setListeningState(false);
            }, 1000);
        }, 1500);
    },

    processVoiceInput(text) {
        const t = this.translations[this.currentLanguage];
        const status = document.getElementById('voice-status');
        if (status) status.textContent = t.searchingBuses;

        // Parse "X to Y" pattern
        const toPattern = /(.+?)\s+(?:to|from\s+.+?\s+to)\s+(.+)/i;
        const match = text.match(toPattern);

        if (match) {
            const from = match[1].trim();
            const to = match[2].trim();

            // Fill in search fields
            const fromInput = document.getElementById('from-input');
            const toInput = document.getElementById('to-input');
            if (fromInput) fromInput.value = this.capitalizeFirst(from);
            if (toInput) toInput.value = this.capitalizeFirst(to);

            // Announce
            this.speakResult(`Searching buses from ${from} to ${to}`);

            // Search
            setTimeout(() => {
                SmartBus.searchBuses();
            }, 1500);
        } else {
            // Try to match just a destination name
            const stops = ['Chennai', 'Villupuram', 'Pondicherry', 'Trichy', 'Madurai', 'Coimbatore', 'Salem', 'Tindivanam'];
            const foundStop = stops.find(s => text.toLowerCase().includes(s.toLowerCase()));
            
            if (foundStop) {
                const toInput = document.getElementById('to-input');
                if (toInput) toInput.value = foundStop;
                this.speakResult(`Destination set to ${foundStop}. Please enter your starting point.`);
                SmartBus.showScreen('home');
                setTimeout(() => document.getElementById('from-input')?.focus(), 500);
            } else {
                const resultEl = document.getElementById('voice-result');
                if (resultEl) resultEl.textContent = t.noResult;
                if (status) status.textContent = t.tapToSpeak;
                this.speakResult('Sorry, I could not understand. Please try again.');
            }
        }
    },

    speakResult(text) {
        if (!('speechSynthesis' in window)) return;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = this.currentLanguage === 'ta' ? 'ta-IN' : 'en-IN';
        utterance.rate = 0.9;
        utterance.volume = 1;

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
    },

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }
};
