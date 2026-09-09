/* ============================================
   SmartBus - Smart Stop Guardian Module ⭐
   Core USP: Never miss your destination
   ============================================ */

const SmartBusGuardian = {
    alertShown: {},
    speechEnabled: true,
    notificationsEnabled: false,
    audioCtx: null,

    // Request notification permission on first use
    async requestNotificationPermission() {
        if ('Notification' in window) {
            const perm = await Notification.requestPermission();
            this.notificationsEnabled = (perm === 'granted');
            return this.notificationsEnabled;
        }
        return false;
    },

    // Send a background push notification (works even when browser minimized)
    sendNotification(title, body, urgency = 'normal') {
        if (!this.notificationsEnabled || !('Notification' in window)) return;
        try {
            const n = new Notification(title, {
                body: body,
                icon: '/images/icon-192.png',
                badge: '/images/icon-192.png',
                vibrate: urgency === 'urgent' ? [300, 100, 300, 100, 500] : [200, 100, 200],
                tag: 'smartbus-guardian-' + urgency,
                requireInteraction: urgency === 'urgent',
                silent: false
            });
            // Auto-close non-urgent notifications after 8 seconds
            if (urgency !== 'urgent') {
                setTimeout(() => n.close(), 8000);
            }
        } catch (e) {
            console.log('Notification error:', e);
        }
    },

    // Web Audio API — Synthesize proximity chimes without external audio files
    playChime(type = 'approaching') {
        try {
            if (!this.audioCtx) {
                this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            const ctx = this.audioCtx;
            const now = ctx.currentTime;

            if (type === 'approaching') {
                // Gentle ascending chime: C5 → E5 → G5
                [523.25, 659.25, 783.99].forEach((freq, i) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.value = freq;
                    gain.gain.setValueAtTime(0, now + i * 0.2);
                    gain.gain.linearRampToValueAtTime(0.3, now + i * 0.2 + 0.05);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.2 + 0.4);
                    osc.connect(gain).connect(ctx.destination);
                    osc.start(now + i * 0.2);
                    osc.stop(now + i * 0.2 + 0.5);
                });
            } else if (type === 'warning') {
                // Urgent two-tone alarm: alternating high-low
                for (let i = 0; i < 4; i++) {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'square';
                    osc.frequency.value = i % 2 === 0 ? 880 : 660;
                    gain.gain.setValueAtTime(0.25, now + i * 0.15);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.12);
                    osc.connect(gain).connect(ctx.destination);
                    osc.start(now + i * 0.15);
                    osc.stop(now + i * 0.15 + 0.15);
                }
            } else if (type === 'urgent') {
                // Loud continuous siren-like sweep
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(440, now);
                osc.frequency.linearRampToValueAtTime(880, now + 0.3);
                osc.frequency.linearRampToValueAtTime(440, now + 0.6);
                osc.frequency.linearRampToValueAtTime(880, now + 0.9);
                gain.gain.setValueAtTime(0.35, now);
                gain.gain.setValueAtTime(0.35, now + 0.8);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
                osc.connect(gain).connect(ctx.destination);
                osc.start(now);
                osc.stop(now + 1.3);
            }
        } catch (e) {
            console.log('Web Audio chime error:', e);
        }
    },

    async checkStatus(journeyId) {
        try {
            const status = await SmartBus.apiGet(`/api/journey/${journeyId}/guardian/status`);
            if (status) {
                this.handleAlert(status);
            }
        } catch (e) {
            console.error('Guardian status error:', e);
        }
    },

    handleAlert(status) {
        if (!status) return;

        const alertLevel = status.alertLevel;

        // Show alert based on level
        switch (alertLevel) {
            case 'APPROACHING_10':
                if (!this.alertShown['10']) {
                    this.showApproachingAlert(status, 10);
                    this.alertShown['10'] = true;
                    this.speak(`Your destination ${status.destination} is approaching. About 10 minutes away.`);
                    this.playChime('approaching');
                    this.sendNotification('🔔 Destination Approaching', `${status.destination} is about 10 minutes away`, 'normal');
                }
                break;

            case 'APPROACHING_5':
                if (!this.alertShown['5']) {
                    this.showWarningAlert(status, 5);
                    this.alertShown['5'] = true;
                    this.speak(`${status.destination} is 5 minutes away. Please prepare to get down.`);
                    this.playChime('warning');
                    this.sendNotification('⚠️ 5 Minutes Away!', `${status.destination} — Please prepare to get down`, 'urgent');
                    this.triggerVibration();
                }
                break;

            case 'APPROACHING_1':
                if (!this.alertShown['1']) {
                    this.showUrgentAlert(status);
                    this.alertShown['1'] = true;
                    this.speak(`YOUR STOP IS APPROACHING! ${status.destination} is the next stop. Get ready now!`);
                    this.playChime('urgent');
                    this.sendNotification('🚨 YOUR STOP IS NOW!', `GET DOWN! ${status.destination} is the next stop!`, 'urgent');
                    this.triggerVibration();
                    this.triggerVibration();
                }
                break;

            case 'MISSED':
                this.showMissedStopAlert(status);
                this.speak(`Warning! You may have missed your stop ${status.destination}. Please check.`);
                break;

            default:
                // Update guardian status bar
                const bar = document.getElementById('guardian-status-bar');
                if (bar) {
                    bar.innerHTML = `🔔 Stop Guardian Active — ${status.stopsRemaining} stops to ${status.destination} (${status.estimatedMinutes} min)`;
                }
                break;
        }
    },

    showApproachingAlert(status, minutes) {
        const alertContainer = document.getElementById('guardian-alert');
        if (!alertContainer) return;

        alertContainer.innerHTML = `
            <div class="alert-card alert-approaching" style="animation: fadeIn 0.5s;">
                <div style="font-size:40px; margin-bottom:12px;">🔔</div>
                <h3 style="margin-bottom:8px;">Your destination is approaching</h3>
                <p style="font-size:18px; margin-bottom:8px;">
                    <strong>${status.destination}</strong> is about <strong>${status.estimatedMinutes}</strong> minutes away
                </p>
                <p style="font-size:14px; color:#666;">
                    ${status.stopsRemaining} stop(s) remaining • Currently at ${status.currentStop}
                </p>
                <button class="btn btn-secondary" style="margin-top:16px;" onclick="SmartBusGuardian.dismissAlert()">
                    OK, I'm ready
                </button>
            </div>
        `;
        alertContainer.style.display = 'block';

        SmartBus.showToast(`🔔 ${status.destination} is ${status.estimatedMinutes} minutes away`, 'info');
    },

    showWarningAlert(status, minutes) {
        const alertContainer = document.getElementById('guardian-alert');
        if (!alertContainer) return;

        alertContainer.innerHTML = `
            <div class="alert-card alert-warning" style="animation: pulse 1.5s infinite;">
                <div style="font-size:48px; margin-bottom:12px;">⚠️</div>
                <h2 style="margin-bottom:8px; color:#E55C00;">${status.destination} is ${status.estimatedMinutes} minutes away</h2>
                <p style="font-size:18px; font-weight:600; margin-bottom:8px;">
                    Please prepare to get down
                </p>
                <p style="font-size:14px; color:#666;">
                    ${status.stopsRemaining} stop(s) remaining • Currently at ${status.currentStop}
                </p>
                <button class="btn btn-primary btn-lg" style="margin-top:16px;" onclick="SmartBusGuardian.dismissAlert()">
                    I'm Ready to Get Down
                </button>
            </div>
        `;
        alertContainer.style.display = 'block';

        SmartBus.showToast(`⚠️ ${status.destination} is ${minutes} minutes away!`, 'error');
    },

    showUrgentAlert(status) {
        const alertContainer = document.getElementById('guardian-alert');
        if (!alertContainer) return;

        alertContainer.innerHTML = `
            <div class="alert-card alert-danger" style="padding:32px;">
                <div style="font-size:56px; margin-bottom:16px;">🚨</div>
                <h1 style="color:#C62828; font-size:28px; margin-bottom:12px;">YOUR STOP IS APPROACHING</h1>
                <p style="font-size:22px; font-weight:700; margin-bottom:12px;">
                    ${status.destination}
                </p>
                <p style="font-size:16px; color:#C62828;">
                    Get ready to exit the bus NOW
                </p>
                <button class="btn btn-danger btn-lg btn-block" style="margin-top:20px; font-size:20px;" onclick="SmartBusGuardian.dismissAlert()">
                    ✅ I'M GETTING DOWN
                </button>
            </div>
        `;
        alertContainer.style.display = 'block';
    },

    showMissedStopAlert(status) {
        const alertContainer = document.getElementById('guardian-alert');
        if (!alertContainer) return;

        alertContainer.innerHTML = `
            <div class="alert-card alert-missed" style="padding:32px;">
                <div style="font-size:56px; margin-bottom:16px;">⚠️</div>
                <h2 style="color:#C62828; margin-bottom:12px;">YOU MAY HAVE MISSED YOUR STOP</h2>
                <p style="font-size:18px; margin-bottom:8px;">
                    You appear to have passed <strong>${status.destination}</strong>
                </p>
                <p style="font-size:14px; color:#666; margin-bottom:20px;">
                    Currently at: ${status.currentStop}
                </p>
                <div style="display:flex; flex-direction:column; gap:12px;">
                    <button class="btn btn-danger btn-lg btn-block" onclick="SmartBusGuardian.confirmMissedStop()">
                        😰 I MISSED MY STOP
                    </button>
                    <button class="btn btn-secondary btn-block" onclick="SmartBusGuardian.dismissAlert()">
                        😊 I'M STILL TRAVELLING
                    </button>
                </div>
            </div>
        `;
        alertContainer.style.display = 'block';

        SmartBus.showToast('⚠️ You may have missed your stop!', 'error');
    },

    async confirmMissedStop() {
        if (!SmartBus.state.activeJourney) return;

        try {
            await SmartBus.apiPost(`/api/journey/${SmartBus.state.activeJourney.id}/missed-stop`, {});
            const recovery = await SmartBus.apiGet(`/api/journey/${SmartBus.state.activeJourney.id}/recovery`);
            this.showRecoveryOptions(recovery);
        } catch (e) {
            SmartBus.showToast('Error getting recovery options', 'error');
        }
    },

    showRecoveryOptions(recovery) {
        this.dismissAlert();

        const container = document.getElementById('recovery-content');
        if (!container || !recovery) {
            SmartBus.showScreen('recovery');
            return;
        }

        const dest = SmartBus.state.activeJourney?.destination || 'your destination';
        container.innerHTML = `
            <div style="text-align:center; margin-bottom:20px;">
                <div style="font-size:40px; margin-bottom:8px;">📍</div>
                <p style="font-size:16px; color:var(--text-secondary);">You appear to have passed <strong>${dest}</strong></p>
            </div>

            <div class="section-title">Return Options</div>
            
            <div class="recovery-card" style="margin-bottom:16px;">
                <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
                    <span style="font-size:24px;">🚌</span>
                    <div>
                        <div style="font-weight:700;">Next Bus Back</div>
                        <div style="font-size:14px; color:var(--text-secondary);">
                            Bus ${recovery.nextBusNumber || 'TN01-XX-XXXX'} arriving in ${recovery.nextBusArrivalMinutes || 15} minutes
                        </div>
                    </div>
                </div>
            </div>

            <div class="card" style="margin-bottom:16px;">
                <div class="info-row">
                    <span class="info-label">📍 Nearest Bus Stop</span>
                    <span class="info-value">${recovery.nearestBusStop || 'Nearby stop'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">📏 Distance from ${dest}</span>
                    <span class="info-value">${recovery.distanceFromDestinationKm?.toFixed(1) || '5.0'} km</span>
                </div>
                <div class="info-row">
                    <span class="info-label">🚕 Auto/Taxi Option</span>
                    <span class="info-value">Available nearby</span>
                </div>
            </div>

            <p style="font-size:13px; color:var(--text-secondary); margin-bottom:16px;">
                ${recovery.message || 'Don\'t worry! We will help you get back to your destination.'}
            </p>

            <button class="btn btn-primary btn-block" onclick="SmartBus.findNextBus()">
                🚌 Track Return Bus
            </button>
            <button class="btn btn-secondary btn-block" style="margin-top:8px;" onclick="SmartBus.showScreen('home')">
                🏠 Back to Home
            </button>
        `;

        SmartBus.showScreen('recovery');
    },

    dismissAlert() {
        const alertContainer = document.getElementById('guardian-alert');
        if (alertContainer) {
            alertContainer.style.display = 'none';
            alertContainer.innerHTML = '';
        }
    },

    triggerVibration() {
        if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200, 100, 300]);
        }
    },

    speak(text) {
        if (!this.speechEnabled || !('speechSynthesis' in window)) return;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;

        // Use appropriate language
        if (SmartBus.state.language === 'ta') {
            utterance.lang = 'ta-IN';
        } else {
            utterance.lang = 'en-IN';
        }

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
    },

    reset() {
        this.alertShown = {};
        this.dismissAlert();
    }
};
