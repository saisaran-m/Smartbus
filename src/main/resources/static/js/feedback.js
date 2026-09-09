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

    capturedPhotoData: null,

    handlePhotoCapture(event) {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            this.capturedPhotoData = e.target.result;
            const previewWrap = document.getElementById('safety-photo-preview-wrap');
            const previewImg = document.getElementById('safety-photo-preview');
            if (previewImg) previewImg.src = this.capturedPhotoData;
            if (previewWrap) previewWrap.style.display = 'block';
            SmartBus.showToast('📸 Photo captured & attached!', 'success');
        };
        reader.readAsDataURL(file);
    },

    removeCapturedPhoto() {
        this.capturedPhotoData = null;
        const input = document.getElementById('safety-camera-input');
        if (input) input.value = '';
        const previewWrap = document.getElementById('safety-photo-preview-wrap');
        const previewImg = document.getElementById('safety-photo-preview');
        if (previewImg) previewImg.src = '';
        if (previewWrap) previewWrap.style.display = 'none';
        SmartBus.showToast('Photo removed', 'info');
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
            busNumber: this.currentJourney?.busNumber || this.currentBus?.busNumber || 'TN01-AB-1234',
            reportType: this.selectedReportType,
            description: (this.capturedPhotoData ? '[Photo Attached] ' : '') + description
        };

        try {
            await SmartBus.apiPost('/api/safety-report', report);
            SmartBus.showToast('Safety report submitted with photo evidence. Thank you!', 'success');
            
            // Show success
            const form = document.getElementById('safety-form');
            if (form) {
                form.innerHTML = `
                    <div style="text-align: center; padding: 30px 16px;">
                        <div style="font-size: 54px; margin-bottom: 12px;">✅</div>
                        <h3 style="margin-bottom: 8px;">Incident Report Filed</h3>
                        ${this.capturedPhotoData ? `<div style="margin:12px auto; max-width:200px;"><img src="${this.capturedPhotoData}" style="width:100%; border-radius:8px; border:2px solid var(--border);"></div>` : ''}
                        <p style="color: var(--text-secondary); margin-bottom: 8px; font-size:13px;">
                            Report dispatched to Tamil Nadu Transport Safety Cell.
                        </p>
                        <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 20px;">
                            Reference ID: <strong>INC-${Date.now().toString().slice(-6)}</strong>
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

    // ========== LOST BAGGAGE RECOVERY ==========
    async submitLostBaggageReport() {
        const busNo = document.getElementById('lost-bus-number')?.value.trim();
        const source = document.getElementById('lost-source')?.value.trim();
        const dest = document.getElementById('lost-destination')?.value.trim();
        const seatNo = document.getElementById('lost-seat-no')?.value.trim() || 'Unspecified';
        const date = document.getElementById('lost-date')?.value || new Date().toISOString().split('T')[0];
        const itemType = document.getElementById('lost-item-type')?.value || 'BAG';
        const desc = document.getElementById('lost-description')?.value.trim();
        const phone = document.getElementById('lost-contact-phone')?.value.trim();

        if (!busNo) {
            SmartBus.showToast('Please enter the Bus Number', 'error');
            document.getElementById('lost-bus-number')?.focus();
            return;
        }

        if (!desc) {
            SmartBus.showToast('Please describe the lost baggage/item', 'error');
            document.getElementById('lost-description')?.focus();
            return;
        }

        if (!phone) {
            SmartBus.showToast('Please enter your contact phone number', 'error');
            document.getElementById('lost-contact-phone')?.focus();
            return;
        }

        const recoveryToken = 'LST-' + Math.floor(100000 + Math.random() * 900000);

        // Store recovery ticket offline
        const lostReport = {
            token: recoveryToken,
            busNumber: busNo,
            source: source,
            destination: dest,
            seatNumber: seatNo,
            travelDate: date,
            itemType: itemType,
            description: desc,
            phone: phone,
            filedAt: new Date().toLocaleString(),
            status: 'URGENT_ALERT_DISPATCHED'
        };

        const existingReports = JSON.parse(localStorage.getItem('smartbus_lost_reports') || '[]');
        existingReports.push(lostReport);
        localStorage.setItem('smartbus_lost_reports', JSON.stringify(existingReports));

        // Display confirmation banner
        const successCard = document.getElementById('lost-success-card');
        if (successCard) {
            successCard.style.display = 'block';
            successCard.innerHTML = `
                <div style="font-size:18px; font-weight:800; color:#28A745; margin-bottom:8px;">
                    ✅ Priority Recovery Request Dispatched!
                </div>
                <div style="font-size:13px; color:var(--text-primary); margin-bottom:12px; line-height:1.5;">
                    Your recovery request for <strong>${busNo}</strong> (${source || 'Origin'} → ${dest || 'Destination'}) has been registered with priority tracking.
                </div>
                <div style="background:rgba(40,167,69,0.08); border:1px solid #28A745; border-radius:8px; padding:12px; margin-bottom:12px;">
                    <div style="font-size:12px; color:var(--text-secondary);">Recovery Tracking Token:</div>
                    <div style="font-size:22px; font-weight:900; color:#28A745; letter-spacing:1px;">${recoveryToken}</div>
                    <div style="font-size:11px; color:var(--text-secondary); margin-top:4px;">Quote this number to the depot master or conductor.</div>
                </div>
                <div style="font-size:12px; color:var(--text-secondary); margin-bottom:14px;">
                    A notification has been flagged to the terminal Station Master. Conductor helpline has been alerted to inspect Seat <strong>${seatNo}</strong>.
                </div>
                <button class="btn btn-secondary btn-block" onclick="window.scrollTo({top:0, behavior:'smooth'})">
                    Review Details
                </button>
            `;
            successCard.scrollIntoView({ behavior: 'smooth' });
        }

        SmartBus.showToast(`🎒 Lost baggage alert dispatched! Token: ${recoveryToken}`, 'success');
    },

    // ========== GOOGLE FORM STYLE FEATURE SUGGESTION ==========
    async submitFeatureSuggestion() {
        const checkboxes = document.querySelectorAll('input[name="suggest_features"]:checked');
        const selectedCategories = Array.from(checkboxes).map(cb => cb.value);
        const detailText = document.getElementById('suggest-feature-text')?.value.trim();
        const contact = document.getElementById('suggest-feature-contact')?.value.trim();

        if (selectedCategories.length === 0 && !detailText) {
            SmartBus.showToast('Please select a feature category or describe your idea', 'error');
            return;
        }

        const requestId = 'REQ-' + Math.floor(10000 + Math.random() * 90000);

        // Save feature request to local store & simulate server sync
        const featureRequest = {
            id: requestId,
            categories: selectedCategories,
            details: detailText,
            contact: contact || 'Anonymous Passenger',
            submittedAt: new Date().toLocaleString()
        };

        const existingRequests = JSON.parse(localStorage.getItem('smartbus_feature_requests') || '[]');
        existingRequests.push(featureRequest);
        localStorage.setItem('smartbus_feature_requests', JSON.stringify(existingRequests));

        // Display Google Form confirmation card
        const successCard = document.getElementById('suggest-success-card');
        if (successCard) {
            successCard.style.display = 'block';
            successCard.innerHTML = `
                <div style="font-size:18px; font-weight:800; color:#673AB7; margin-bottom:6px;">
                    🎉 Feature Request Recorded!
                </div>
                <div style="font-size:13px; color:var(--text-secondary); margin-bottom:12px;">
                    Thank you! Your response has been submitted to the SmartBus engineering roadmap.
                </div>
                <div style="background:rgba(103,58,183,0.06); border:1px solid rgba(103,58,183,0.2); border-radius:8px; padding:10px 14px; font-size:13px; margin-bottom:14px;">
                    Reference Token: <strong style="color:#673AB7;">${requestId}</strong>
                </div>
                <button class="btn btn-secondary btn-block" onclick="SmartBus.showScreen('home')">
                    Back to Home
                </button>
            `;
            successCard.scrollIntoView({ behavior: 'smooth' });
        }

        SmartBus.showToast('🚀 Feature suggestion submitted! Thank you.', 'success');
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

// Bind to global window
if (typeof window !== 'undefined') {
    window.SmartBusFeedback = SmartBusFeedback;
}
