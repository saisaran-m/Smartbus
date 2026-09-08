/* ============================================
   SmartBus - Live Tracking Module
   Route progress, ETA, stop timeline
   ============================================ */

const SmartBusTracking = {
    trackingInterval: null,
    currentJourney: null,

    startTracking(journey) {
        this.currentJourney = journey;
        this.updateTracking(journey);
    },

    stopTracking() {
        if (this.trackingInterval) {
            clearInterval(this.trackingInterval);
            this.trackingInterval = null;
        }
    },

    async updateTracking(journey) {
        if (!journey) return;
        this.currentJourney = journey;

        const busId = journey.busId || SmartBus.state.selectedBus?.busId;
        if (!busId) return;

        try {
            const data = await SmartBus.apiGet(`/api/tracking/${busId}`);
            if (data) {
                this.renderTrackingData(data, journey);
            }
        } catch (e) {
            console.error('Tracking update error:', e);
            this.renderOfflineTracking(journey);
        }
    },

    renderTrackingData(data, journey) {
        // Update ETA
        const etaDisplay = document.getElementById('eta-display');
        if (etaDisplay) {
            const eta = data.estimatedArrivalMinutes || 0;
            etaDisplay.innerHTML = eta > 0 
                ? `Arriving in <strong>${eta}</strong> minutes`
                : 'At destination';
        }

        // Update progress bar
        const progressBar = document.getElementById('journey-progress-bar');
        if (progressBar) {
            const progress = data.routeProgress || 0;
            progressBar.style.width = progress + '%';
        }

        const progressText = document.getElementById('progress-text');
        if (progressText) {
            progressText.textContent = Math.round(data.routeProgress || 0) + '% complete';
        }

        // Update current/next stop info
        const currentStopEl = document.getElementById('current-stop-name');
        if (currentStopEl) currentStopEl.textContent = data.currentStop || 'Unknown';

        const nextStopEl = document.getElementById('next-stop-name');
        if (nextStopEl) nextStopEl.textContent = data.nextStop || 'N/A';

        const lastUpdatedEl = document.getElementById('last-updated');
        if (lastUpdatedEl) {
            const now = new Date();
            lastUpdatedEl.textContent = `Updated ${now.toLocaleTimeString()}`;
        }

        // Render timeline
        this.renderTimeline(data.stops, data.currentStop, journey.destination);

        // Update guardian status if enabled
        if (journey.guardianEnabled) {
            const guardianBar = document.getElementById('guardian-status-bar');
            if (guardianBar) {
                guardianBar.style.display = 'flex';
            }
        }
    },

    renderTimeline(stops, currentStop, destination) {
        const timeline = document.getElementById('route-timeline');
        if (!timeline || !stops) return;

        timeline.innerHTML = stops.map((stop, index) => {
            let statusClass = '';
            let statusIcon = '○';
            let extraInfo = '';

            if (stop.visited) {
                statusClass = 'visited';
                statusIcon = '✓';
            }
            if (stop.name === currentStop) {
                statusClass = 'current';
                statusIcon = '📍';
                extraInfo = '<span style="font-size:12px; color:var(--primary); margin-left:8px;">← Current</span>';
            }
            if (stop.name === destination) {
                extraInfo += '<span style="font-size:12px; color:var(--danger); margin-left:8px;">🏁 Destination</span>';
            }

            return `
                <div class="timeline-item ${statusClass}">
                    <span class="timeline-icon">${statusIcon}</span>
                    <span class="timeline-label">${stop.name}</span>
                    ${extraInfo}
                </div>
            `;
        }).join('');
    },

    renderOfflineTracking(journey) {
        const etaDisplay = document.getElementById('eta-display');
        if (etaDisplay) {
            etaDisplay.innerHTML = `
                <div style="color:var(--text-secondary); font-size:14px;">
                    📡 Live tracking unavailable<br>
                    <small>Last known: Stop ${journey.currentStopIndex || 0}</small>
                </div>
            `;
        }
    }
};
