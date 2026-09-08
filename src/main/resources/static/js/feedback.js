/* ============================================
   SmartBus - Feedback & Safety Report Module
   Multi-category ratings + safety reporting
   ============================================ */

const SmartBusFeedback = {
    ratings: {
        cleanliness: 0,
        comfort: 0,
        crowding: 0,
        punctuality: 0,
        staffBehaviour: 0,
        drivingExperience: 0
    },
    currentJourney: null,
    currentBus: null,
    selectedReportType: null,

    init(journey, bus) {
        this.currentJourney = journey || SmartBus.state.activeJourney;
        this.currentBus = bus || SmartBus.state.selectedBus;
        this.ratings = { cleanliness: 0, comfort: 0, crowding: 0, punctuality: 0, staffBehaviour: 0, drivingExperience: 0 };
        this.renderFeedbackForm();
        this.setupStarRatings();
        this.setupSafetyReport();
    },

    renderFeedbackForm() {
        const busInfo = document.getElementById('feedback-bus-info');
        if (busInfo && this.currentJourney) {
            busInfo.innerHTML = `
                <div class="card" style="border-left: 4px solid var(--primary); margin-bottom: 20px;">
                    <div class="bus-number">🚌 ${this.currentJourney.busNumber || this.currentBus?.busNumber || 'Bus'}</div>
                    <div class="bus-route">${this.currentJourney.source || ''} → ${this.currentJourney.destination || ''}</div>
                </div>
            `;
        }
    },

    setupStarRatings() {
        document.querySelectorAll('.star-rating').forEach(container => {
            const category = container.dataset.category;
            if (!category) return;

            container.innerHTML = '';
            for (let i = 1; i <= 5; i++) {
                const star = document.createElement('span');
                star.className = 'star';
                star.textContent = '⭐';
                star.dataset.value = i;
                star.style.opacity = '0.3';
                star.style.cursor = 'pointer';
                star.style.fontSize = '28px';
                star.style.transition = 'all 0.2s';

                star.addEventListener('click', () => {
                    this.setRating(category, i);
                });

                star.addEventListener('mouseenter', () => {
                    this.highlightStars(container, i);
                });

                container.addEventListener('mouseleave', () => {
                    this.highlightStars(container, this.ratings[category] || 0);
                });

                container.appendChild(star);
            }
        });
    },

    setRating(category, value) {
        this.ratings[category] = value;
        const container = document.querySelector(`.star-rating[data-category="${category}"]`);
        if (container) {
            this.highlightStars(container, value);
        }
    },

    highlightStars(container, count) {
        container.querySelectorAll('.star').forEach((star, index) => {
            if (index < count) {
                star.style.opacity = '1';
                star.style.transform = 'scale(1.1)';
            } else {
                star.style.opacity = '0.3';
                star.style.transform = 'scale(1)';
            }
        });
    },

    async submitFeedback() {
        // Validate at least one rating
        const hasRating = Object.values(this.ratings).some(r => r > 0);
        if (!hasRating) {
            SmartBus.showToast('Please rate at least one category', 'error');
            return;
        }

        const comments = document.getElementById('feedback-comments')?.value || '';
        
        const feedback = {
            journeyId: this.currentJourney?.id || 0,
            userId: SmartBus.state.user?.id || 1,
            busId: this.currentJourney?.busId || this.currentBus?.busId || 1,
            busNumber: this.currentJourney?.busNumber || this.currentBus?.busNumber || '',
            cleanliness: this.ratings.cleanliness || 3,
            comfort: this.ratings.comfort || 3,
            crowding: this.ratings.crowding || 3,
            punctuality: this.ratings.punctuality || 3,
            staffBehaviour: this.ratings.staffBehaviour || 3,
            drivingExperience: this.ratings.drivingExperience || 3,
            comments: comments
        };

        try {
            await SmartBus.apiPost('/api/feedback', feedback);
            SmartBus.showToast('Thank you for your feedback! 🙏', 'success');
            
            // Show success state
            const form = document.getElementById('feedback-form');
            if (form) {
                form.innerHTML = `
                    <div style="text-align: center; padding: 40px 20px;">
                        <div style="font-size: 64px; margin-bottom: 16px;">✅</div>
                        <h3 style="margin-bottom: 8px;">Feedback Submitted!</h3>
                        <p style="color: var(--text-secondary); margin-bottom: 24px;">
                            Your ratings help other passengers make better choices.
                        </p>
                        <button class="btn btn-primary" onclick="SmartBus.showScreen('home')">
                            🏠 Back to Home
                        </button>
                    </div>
                `;
            }
        } catch (e) {
            SmartBus.showToast('Error submitting feedback. Please try again.', 'error');
        }
    },

    // ========== SAFETY REPORT ==========
    setupSafetyReport() {
        document.querySelectorAll('.safety-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.safety-option').forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
                this.selectedReportType = option.dataset.type;
            });
        });
    },

    async submitSafetyReport() {
        if (!this.selectedReportType) {
            SmartBus.showToast('Please select a report type', 'error');
            return;
        }

        const description = document.getElementById('safety-description')?.value || '';

        const report = {
            userId: SmartBus.state.user?.id || 1,
            busId: this.currentJourney?.busId || this.currentBus?.busId || 1,
            busNumber: this.currentJourney?.busNumber || this.currentBus?.busNumber || '',
            reportType: this.selectedReportType,
            description: description
        };

        try {
            await SmartBus.apiPost('/api/safety-report', report);
            SmartBus.showToast('Safety report submitted. Thank you for helping keep buses safe.', 'success');
            
            // Show success
            const form = document.getElementById('safety-form');
            if (form) {
                form.innerHTML = `
                    <div style="text-align: center; padding: 40px 20px;">
                        <div style="font-size: 64px; margin-bottom: 16px;">📋</div>
                        <h3 style="margin-bottom: 8px;">Report Submitted</h3>
                        <p style="color: var(--text-secondary); margin-bottom: 8px;">
                            This is a passenger report. Reports are reviewed for accuracy.
                        </p>
                        <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 24px;">
                            If multiple passengers report the same issue, it will be flagged for review.
                        </p>
                        <button class="btn btn-primary" onclick="SmartBus.showScreen('home')">
                            🏠 Back to Home
                        </button>
                    </div>
                `;
            }
        } catch (e) {
            SmartBus.showToast('Error submitting report. Please try again.', 'error');
        }
    },

    // Show aggregated ratings for a bus
    async showBusRatings(busId) {
        try {
            const ratings = await SmartBus.apiGet(`/api/feedback/bus/${busId}/ratings`);
            if (ratings) {
                return ratings;
            }
        } catch (e) {
            console.error('Error loading ratings:', e);
        }
        return null;
    }
};
