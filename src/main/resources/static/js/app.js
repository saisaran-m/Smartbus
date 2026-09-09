/* ============================================
   SmartBus - Main Application JavaScript
   SPA Router, State Management, API Layer
   ============================================ */

const SmartBus = {
    state: {
        currentScreen: 'home',
        user: null,
        selectedBus: null,
        activeJourney: null,
        searchResults: [],
        seniorMode: false,
        language: 'en',
        csrfToken: '',
        csrfHeader: ''
    },

    screens: ['home', 'search', 'journey', 'guardian', 'recovery', 'voice', 'senior', 'feedback', 'safety', 'nextbus', 'ai', 'fare', 'ticket', 'boardingpass', 'mytickets', 'driver', 'lostbaggage', 'howtouse'],

    init() {
        this.state.csrfToken = document.querySelector('meta[name="_csrf"]')?.content || '';
        this.state.csrfHeader = document.querySelector('meta[name="_csrf_header"]')?.content || 'X-CSRF-TOKEN';
        
        // Initialize Night Mode / Theme
        if (window.SmartBusTheme) {
            SmartBusTheme.init();
        }

        // Register Service Worker for Mobile PWA / APK install
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(reg => console.log('SmartBus PWA Service Worker Registered', reg.scope))
                    .catch(err => console.log('SW Registration error:', err));
            });
        }

        this.setupNavigation();
        this.setupAutocomplete();
        this.setupSearchForm();
        this.loadUserInfo();
        this.showScreen('home');

        // Initialize Live Google Map Radar on Home
        setTimeout(() => {
            if (window.SmartBusMap) {
                SmartBusMap.initHomeMap();
            }
        }, 150);

        // Check for active journey on load
        this.checkActiveJourney();
    },

    // ========== NAVIGATION ==========
    showScreen(screenId) {
        this.screens.forEach(s => {
            const el = document.getElementById('screen-' + s);
            if (el) el.classList.remove('active');
        });
        const target = document.getElementById('screen-' + screenId);
        if (target) {
            target.classList.add('active');
            this.state.currentScreen = screenId;
        }

        // Update bottom nav active state (Mobile)
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        const navMap = { home: 0, search: 1, journey: 2, ai: 3, fare: 4 };
        const navItems = document.querySelectorAll('.nav-item');
        if (navMap[screenId] !== undefined && navItems[navMap[screenId]]) {
            navItems[navMap[screenId]].classList.add('active');
        }

        // Update desktop header nav active state
        document.querySelectorAll('.desktop-nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.screen === screenId) {
                link.classList.add('active');
            }
        });

        if (screenId === 'home' && window.SmartBusMap && SmartBusMap.homeMap) {
            setTimeout(() => SmartBusMap.homeMap.invalidateSize(), 80);
        }

        window.scrollTo(0, 0);
    },

    setupNavigation() {
        // Bottom nav clicks
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const screen = item.dataset.screen;
                if (screen) this.showScreen(screen);
            });
        });

        // Feature card clicks
        document.querySelectorAll('.feature-card').forEach(card => {
            card.addEventListener('click', () => {
                const screen = card.dataset.screen;
                if (screen) {
                    if (screen === 'nextbus') {
                        this.findNextBus();
                        return;
                    }
                    if ((screen === 'journey') && !this.state.activeJourney) {
                        this.showToast('Please select a bus first to track journey', 'info');
                        if (!document.getElementById('from-input').value) document.getElementById('from-input').value = 'Chennai';
                        if (!document.getElementById('to-input').value) document.getElementById('to-input').value = 'Villupuram';
                        this.searchBuses();
                        return;
                    }
                    if (screen === 'feedback' && !this.state.activeJourney) {
                        this.showToast('Start a journey first to give feedback', 'info');
                        return;
                    }
                    this.showScreen(screen);
                    if (screen === 'voice') SmartBusVoice.init();
                    if (screen === 'senior') this.initSeniorMode();
                }
            });
        });

        // Back buttons
        document.querySelectorAll('.back-btn').forEach(btn => {
            btn.addEventListener('click', () => this.showScreen('home'));
        });

        // Senior mode toggle
        const seniorToggle = document.getElementById('senior-toggle');
        if (seniorToggle) {
            seniorToggle.addEventListener('click', () => this.toggleSeniorMode());
        }
    },

    // ========== API LAYER ==========
    async api(url, options = {}) {
        const defaults = {
            headers: {
                'Content-Type': 'application/json',
                [this.state.csrfHeader]: this.state.csrfToken
            }
        };
        const config = { ...defaults, ...options };
        if (options.headers) {
            config.headers = { ...defaults.headers, ...options.headers };
        }
        
        try {
            const response = await fetch(url, config);
            if (response.status === 403 || response.status === 401) {
                window.location.href = '/login';
                return null;
            }
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `HTTP ${response.status}`);
            }
            const text = await response.text();
            return text ? JSON.parse(text) : null;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    async apiGet(url) {
        return this.api(url);
    },

    async apiPost(url, body) {
        return this.api(url, {
            method: 'POST',
            body: JSON.stringify(body)
        });
    },

    // ========== USER ==========
    async loadUserInfo() {
        try {
            const user = await this.apiGet('/api/auth/me');
            if (user) {
                this.state.user = user;
                const greeting = document.getElementById('user-greeting');
                if (greeting) greeting.textContent = 'Hello, ' + (user.fullName || user.username);
                if (user.seniorCitizenMode) {
                    document.body.classList.add('senior-mode');
                    this.state.seniorMode = true;
                }
            }
        } catch (e) {
            console.log('User info not loaded:', e);
        }
    },

    async toggleSeniorMode() {
        try {
            await this.apiPost('/api/auth/senior-mode', {});
            this.state.seniorMode = !this.state.seniorMode;
            document.body.classList.toggle('senior-mode');
            this.showToast(this.state.seniorMode ? 'Senior Mode ON - Larger text & buttons' : 'Senior Mode OFF', 'success');
        } catch (e) {
            this.state.seniorMode = !this.state.seniorMode;
            document.body.classList.toggle('senior-mode');
            this.showToast(this.state.seniorMode ? 'Senior Mode ON' : 'Senior Mode OFF', 'success');
        }
    },

    // ========== CITY CHIPS ==========
    selectCityChip(cityName) {
        const fromInput = document.getElementById('from-input');
        const toInput = document.getElementById('to-input');
        if (!fromInput || !toInput) return;

        if (!fromInput.value.trim()) {
            fromInput.value = cityName;
            toInput.focus();
            this.showToast(`Selected "${cityName}" as origin. Now select destination.`, 'info');
        } else if (!toInput.value.trim() || toInput.value.trim().toLowerCase() === cityName.toLowerCase()) {
            if (fromInput.value.trim().toLowerCase() !== cityName.toLowerCase()) {
                toInput.value = cityName;
                this.showToast(`Selected "${cityName}" as destination. Tap Find Buses!`, 'info');
            } else {
                toInput.focus();
            }
        } else {
            toInput.value = cityName;
            this.showToast(`Destination set to "${cityName}".`, 'info');
        }
    },

    // ========== AUTOCOMPLETE ==========
    setupAutocomplete() {
        const stops = [
            'Chennai', 'Salem', 'Coimbatore', 'Madurai', 'Trichy', 'Tirunelveli',
            'Kanyakumari', 'Ooty', 'Villupuram', 'Vellore', 'Thanjavur', 'Pondicherry',
            'Erode', 'Dindigul', 'Hosur', 'Tiruppur', 'Rameswaram', 'Kanchipuram',
            'Theni', 'Karur', 'Namakkal', 'Dharmapuri', 'Krishnagiri', 'Pudukkottai',
            'Sivakasi', 'Virudhunagar', 'Tenkasi', 'Thoothukudi', 'Nagapattinam',
            'Tiruvarur', 'Mayiladuthurai', 'Cuddalore', 'Tiruvannamalai', 'Chengalpattu',
            'Tiruvallur', 'Ranipet', 'Tirupathur', 'Kallakurichi', 'Ariyalur',
            'Perambalur', 'Sivaganga', 'Pollachi', 'Mettupalayam', 'Coonoor',
            'Palani', 'Kumbakonam', 'Nagercoil', 'Tambaram', 'Tindivanam',
            'Ulundurpettai', 'Attur', 'Kovilpatti', 'Sankari', 'Bhavani',
            'Paramakudi', 'Ramanathapuram', 'Mandapam', 'Valliyur', 'Ambur',
            'Sriperumbudur', 'Mahabalipuram', 'Koyambedu', 'Chidambaram'
        ];

        ['from-input', 'to-input'].forEach(inputId => {
            const input = document.getElementById(inputId);
            if (!input) return;

            const dropdown = document.createElement('div');
            dropdown.className = 'autocomplete-dropdown';
            dropdown.style.display = 'none';
            input.parentElement.appendChild(dropdown);

            let selectedIndex = -1;

            const selectItem = (val) => {
                input.value = val;
                dropdown.style.display = 'none';
                selectedIndex = -1;
                // Auto focus to next field if from-input filled
                if (inputId === 'from-input') {
                    const to = document.getElementById('to-input');
                    if (to && !to.value) to.focus();
                }
            };

            const renderDropdown = () => {
                const val = input.value.trim().toLowerCase();
                if (val.length < 1) {
                    dropdown.style.display = 'none';
                    return;
                }
                const matches = stops.filter(s => s.toLowerCase().includes(val));
                if (matches.length === 0) {
                    dropdown.style.display = 'none';
                    return;
                }
                selectedIndex = -1;
                dropdown.innerHTML = matches.map((s, idx) =>
                    `<div class="autocomplete-item" data-index="${idx}" data-value="${s}">
                        <span>📍</span> <span>${s}</span>
                     </div>`
                ).join('');
                dropdown.style.display = 'block';

                dropdown.querySelectorAll('.autocomplete-item').forEach(item => {
                    const handleSelect = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        selectItem(item.dataset.value);
                    };
                    item.addEventListener('mousedown', handleSelect);
                    item.addEventListener('touchstart', handleSelect);
                    item.addEventListener('click', handleSelect);
                });
            };

            input.addEventListener('input', renderDropdown);

            input.addEventListener('keydown', (e) => {
                const items = dropdown.querySelectorAll('.autocomplete-item');
                if (dropdown.style.display === 'block' && items.length > 0) {
                    if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        selectedIndex = (selectedIndex + 1) % items.length;
                        items.forEach((it, i) => it.classList.toggle('active', i === selectedIndex));
                        items[selectedIndex].scrollIntoView({ block: 'nearest' });
                    } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        selectedIndex = (selectedIndex - 1 + items.length) % items.length;
                        items.forEach((it, i) => it.classList.toggle('active', i === selectedIndex));
                        items[selectedIndex].scrollIntoView({ block: 'nearest' });
                    } else if (e.key === 'Enter') {
                        e.preventDefault();
                        if (selectedIndex >= 0 && selectedIndex < items.length) {
                            selectItem(items[selectedIndex].dataset.value);
                        } else if (items.length > 0) {
                            selectItem(items[0].dataset.value);
                        }
                    } else if (e.key === 'Escape') {
                        dropdown.style.display = 'none';
                    }
                }
            });

            input.addEventListener('blur', () => {
                setTimeout(() => {
                    dropdown.style.display = 'none';
                }, 250);
            });

            input.addEventListener('focus', () => {
                if (input.value.trim().length >= 1) {
                    renderDropdown();
                }
            });
        });
    },

    // ========== BUS SEARCH ==========
    setupSearchForm() {
        const searchBtn = document.getElementById('search-btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.searchBuses());
        }
    },

    async searchBuses() {
        const from = document.getElementById('from-input')?.value?.trim();
        const to = document.getElementById('to-input')?.value?.trim();

        if (!from || !to) {
            this.showToast('Please enter both From and To locations', 'error');
            return;
        }

        const searchBtn = document.getElementById('search-btn');
        if (searchBtn) {
            searchBtn.disabled = true;
            searchBtn.innerHTML = '⏳ Searching...';
        }

        try {
            const results = await this.apiGet(`/api/buses/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
            this.state.searchResults = results || [];
            this.renderSearchResults(from, to);
            this.showScreen('search');
        } catch (e) {
            this.showToast('Error searching buses. Please try again.', 'error');
        } finally {
            if (searchBtn) {
                searchBtn.disabled = false;
                searchBtn.innerHTML = '🔍 Find Buses';
            }
        }
    },

    renderSearchResults(from, to) {
        const container = document.getElementById('search-results');
        const title = document.getElementById('search-route-title');
        if (title) title.textContent = `${from} → ${to}`;

        if (!container) return;

        if (this.state.searchResults.length === 0) {
            container.innerHTML = `
                <div class="card" style="text-align:center; padding:30px;">
                    <div style="font-size:44px; margin-bottom:12px;">🚌</div>
                    <h3>No buses found for "${from} → ${to}"</h3>
                    <p style="color:var(--text-secondary); margin-top:6px; font-size:14px;">Try one of these active Tamil Nadu routes:</p>
                    <div style="display:flex; flex-direction:column; gap:10px; margin-top:16px;">
                        <button class="btn btn-secondary" onclick="SmartBus.quickSearch('Chennai', 'Salem')">Chennai → Salem (6 Buses)</button>
                        <button class="btn btn-secondary" onclick="SmartBus.quickSearch('Chennai', 'Villupuram')">Chennai → Villupuram (5 Buses)</button>
                        <button class="btn btn-secondary" onclick="SmartBus.quickSearch('Salem', 'Coimbatore')">Salem → Coimbatore (3 Buses)</button>
                        <button class="btn btn-secondary" onclick="SmartBus.quickSearch('Chennai', 'Pondicherry')">Chennai → Pondicherry (4 Buses)</button>
                    </div>
                </div>`;
            return;
        }

        container.innerHTML = this.state.searchResults.map((bus, i) => `
            <div class="card bus-card" data-index="${i}">
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <div>
                        <div class="bus-number">🚌 ${bus.busNumber}</div>
                        <div class="bus-route">${bus.source} → ${bus.destination}</div>
                        <div style="font-size:13px; color:var(--text-secondary); margin-top:2px;">${bus.busType}</div>
                    </div>
                    <span class="crowd-badge crowd-${bus.crowdLevel.toLowerCase()}">${bus.crowdLevel}</span>
                </div>
                <div style="display:flex; gap:20px; margin:12px 0; font-size:14px;">
                    <div><span style="color:var(--text-secondary);">Depart:</span> <strong>${bus.departureTime}</strong></div>
                    <div><span style="color:var(--text-secondary);">Arrive:</span> <strong>${bus.arrivalTime}</strong></div>
                    <div><span style="color:var(--text-secondary);">ETA:</span> <strong>${bus.estimatedMinutesToArrival} min</strong></div>
                </div>
                <div style="display:flex; gap:4px; align-items:center; margin-bottom:8px;">
                    <span class="rating">⭐ ${bus.rating?.toFixed(1) || '4.0'}</span>
                </div>
                <div class="mini-ratings">
                    <span>🧹 ${bus.cleanlinessRating?.toFixed(1) || '4.0'}</span>
                    <span>💺 ${bus.comfortRating?.toFixed(1) || '4.0'}</span>
                    <span>🛡️ ${bus.safetyRating?.toFixed(1) || '4.0'}</span>
                    ${bus.nextStop ? `<span>▶ Next: ${bus.nextStop}</span>` : ''}
                </div>
                <div class="capacity-meter" title="Crowd capacity: ${bus.crowdLevel}">
                    <div class="capacity-meter-fill ${bus.crowdLevel.toLowerCase()}"></div>
                </div>
                <div style="display:flex; gap:8px; margin-top:14px;">
                    <button class="btn btn-secondary" style="flex:1; font-size:14px; padding:10px 14px;" onclick="SmartBus.selectBus(${i})">
                        📍 Track Bus
                    </button>
                    <button class="btn btn-primary" style="flex:1.2; font-size:14px; padding:10px 14px;" onclick="SmartBus.bookBusTicket(${i})">
                        🎫 Book Seat
                    </button>
                </div>
            </div>
        `).join('');
    },

    // ========== BUS SELECTION & JOURNEY ==========
    async selectBus(index) {
        const bus = this.state.searchResults[index];
        if (!bus) return;
        this.state.selectedBus = bus;

        try {
            let journey = null;
            try {
                journey = await this.apiPost('/api/journey/start', {
                    busId: bus.busId || bus.id || 1,
                    source: bus.source,
                    destination: bus.destination
                });
            } catch (postErr) {
                console.warn('POST start journey error, attempting fallback:', postErr);
            }

            if (!journey) {
                try {
                    journey = await this.apiGet('/api/journey/active');
                } catch (actErr) {}
            }

            // Client-side journey state fallback if network/auth was disrupted
            if (!journey) {
                journey = {
                    id: Date.now(),
                    busId: bus.busId || bus.id || 1,
                    busNumber: bus.busNumber,
                    source: bus.source,
                    destination: bus.destination,
                    routeId: bus.routeId || 1,
                    currentStopIndex: bus.currentStopIndex || 0,
                    startTime: new Date().toISOString(),
                    status: 'ACTIVE'
                };
            }

            this.state.activeJourney = journey;
            this.showJourneyScreen(journey, bus);
            this.showToast('Live tracking started for ' + bus.busNumber, 'success');
        } catch (e) {
            console.error('Track bus error:', e);
            // Even on extreme exception, open journey map for selected bus
            const mockJourney = {
                id: Date.now(),
                busId: bus.busId || bus.id || 1,
                busNumber: bus.busNumber,
                source: bus.source,
                destination: bus.destination,
                routeId: bus.routeId || 1,
                currentStopIndex: 0,
                startTime: new Date().toISOString(),
                status: 'ACTIVE'
            };
            this.state.activeJourney = mockJourney;
            this.showJourneyScreen(mockJourney, bus);
            this.showToast('Displaying route tracking for ' + bus.busNumber, 'info');
        }
    },

    bookBusTicket(index) {
        const bus = this.state.searchResults[index];
        if (!bus) return;
        const ticketModule = window.SmartBusTicket || (typeof SmartBusTicket !== 'undefined' ? SmartBusTicket : null);
        if (ticketModule) {
            const busInfoEl = document.getElementById('ticket-bus-details');
            if (busInfoEl) {
                busInfoEl.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <div style="font-size:18px; font-weight:800; color:var(--primary);">🚌 ${bus.busNumber}</div>
                            <div style="font-size:14px; font-weight:600; margin-top:2px;">${bus.source} → ${bus.destination}</div>
                            <div style="font-size:12px; color:var(--text-secondary); margin-top:2px;">${bus.busType} • Departs: ${bus.departureTime}</div>
                        </div>
                        <span class="crowd-badge crowd-${bus.crowdLevel.toLowerCase()}">${bus.crowdLevel}</span>
                    </div>
                `;
            }
            ticketModule.openBooking(bus);
        } else {
            // Lazy load ticket.js if somehow missing
            const s = document.createElement('script');
            s.src = '/js/ticket.js?v=2.1';
            s.onload = () => {
                if (window.SmartBusTicket) {
                    window.SmartBusTicket.openBooking(bus);
                }
            };
            document.head.appendChild(s);
            this.showToast('Loading ticketing system...', 'info');
        }
    },


    showJourneyScreen(journey, bus) {
        // Set journey info
        const infoContainer = document.getElementById('journey-info');
        if (infoContainer) {
            infoContainer.innerHTML = `
                <div class="bus-number">🚌 ${journey.busNumber || bus?.busNumber || ''}</div>
                <div class="bus-route">${journey.source} → ${journey.destination}</div>
                <div style="font-size:13px; color:var(--text-secondary); margin-top:4px;">
                    ${bus?.busType || 'Bus'} • Started ${new Date(journey.startTime).toLocaleTimeString()}
                </div>
            `;
        }

        this.showScreen('journey');

        // Initialize map and tracking
        SmartBusMap.initMap(journey.busId || bus?.busId, journey.routeId);
        SmartBusTracking.startTracking(journey);
    },

    async advanceJourney() {
        if (!this.state.activeJourney) return;
        const id = this.state.activeJourney.id;

        try {
            // Advance both journey and bus position
            const journey = await this.apiPost(`/api/journey/${id}/advance`, {});
            this.state.activeJourney = journey;

            // Also advance bus tracking
            if (journey.busId || this.state.selectedBus?.busId) {
                const busId = journey.busId || this.state.selectedBus.busId;
                await this.apiPost(`/api/tracking/${busId}/advance`, {});
                SmartBusTracking.updateTracking(journey);
                SmartBusMap.updateBusPosition(busId);
            }

            // Check guardian if enabled
            if (journey.guardianEnabled) {
                SmartBusGuardian.checkStatus(id);
            }

            this.showToast('Bus moved to next stop', 'info');
        } catch (e) {
            this.showToast('Error advancing journey', 'error');
        }
    },

    async completeJourney() {
        if (!this.state.activeJourney) return;
        try {
            await this.apiPost(`/api/journey/${this.state.activeJourney.id}/complete`, {});
            this.showToast('Journey completed! Rate your experience.', 'success');
            SmartBusTracking.stopTracking();
            this.showScreen('feedback');
            SmartBusFeedback.init(this.state.activeJourney, this.state.selectedBus);
        } catch (e) {
            this.showToast('Error completing journey', 'error');
        }
    },

    async enableGuardian() {
        if (!this.state.activeJourney) return;
        try {
            await this.apiPost(`/api/journey/${this.state.activeJourney.id}/guardian/enable`, {
                destination: this.state.activeJourney.destination
            });
            this.state.activeJourney.guardianEnabled = true;
            this.showToast('🔔 Stop Guardian is ON! You will be alerted before your destination.', 'success');
            
            const guardianBtn = document.getElementById('guardian-enable-btn');
            if (guardianBtn) {
                guardianBtn.innerHTML = '🔔 Stop Guardian: ON';
                guardianBtn.classList.remove('btn-primary');
                guardianBtn.classList.add('btn-success');
                guardianBtn.disabled = true;
            }

            const guardianStatus = document.getElementById('guardian-status-bar');
            if (guardianStatus) {
                guardianStatus.style.display = 'flex';
                guardianStatus.innerHTML = '🔔 Stop Guardian Active — Monitoring your destination';
            }
        } catch (e) {
            this.showToast('Error enabling guardian', 'error');
        }
    },

    // ========== NEXT BUS ==========
    async findNextBus() {
        let from = document.getElementById('from-input')?.value?.trim() || this.state.activeJourney?.source || '';
        let to = document.getElementById('to-input')?.value?.trim() || this.state.activeJourney?.destination || '';

        if (!from || !to) {
            from = 'Chennai';
            to = 'Villupuram';
            if (document.getElementById('from-input')) document.getElementById('from-input').value = from;
            if (document.getElementById('to-input')) document.getElementById('to-input').value = to;
        }

        try {
            const nextBus = await this.apiGet(`/api/buses/next?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
            this.renderNextBus(nextBus);
            this.showScreen('nextbus');
        } catch (e) {
            this.showToast('No more buses available for this route', 'info');
        }
    },

    renderNextBus(bus) {
        const container = document.getElementById('nextbus-content');
        if (!container || !bus) return;
        container.innerHTML = `
            <div class="card" style="text-align:center; padding:24px; margin-bottom:16px;">
                <div style="font-size:16px; color:var(--text-secondary);">Your selected bus has departed.</div>
            </div>
            <div class="section-title">NEXT AVAILABLE BUS</div>
            <div class="card bus-card">
                <div class="bus-number">🚌 ${bus.busNumber}</div>
                <div class="bus-route">${bus.source} → ${bus.destination}</div>
                <div style="margin:12px 0;">
                    <div class="info-row"><span class="info-label">Arrival</span><span class="info-value">${bus.estimatedMinutesToArrival} minutes</span></div>
                    <div class="info-row"><span class="info-label">Type</span><span class="info-value">${bus.busType}</span></div>
                    <div class="info-row"><span class="info-label">Crowd</span><span class="info-value"><span class="crowd-badge crowd-${bus.crowdLevel.toLowerCase()}">${bus.crowdLevel}</span></span></div>
                    <div class="info-row"><span class="info-label">Rating</span><span class="info-value">⭐ ${bus.rating?.toFixed(1)}</span></div>
                </div>
                <button class="btn btn-primary btn-block" onclick="SmartBus.selectBus(0); SmartBus.state.searchResults = [${JSON.stringify(bus).replace(/"/g, '&quot;')}];">
                    🚌 Track This Bus
                </button>
            </div>`;
    },

    // ========== ACTIVE JOURNEY CHECK ==========
    async checkActiveJourney() {
        try {
            const journey = await this.apiGet('/api/journey/active');
            if (journey) {
                this.state.activeJourney = journey;
                // Update nav indicator
                const journeyNav = document.querySelector('.nav-item[data-screen="journey"]');
                if (journeyNav) journeyNav.style.color = 'var(--primary)';
            }
        } catch (e) {
            // No active journey, that's fine
        }
    },

    // ========== SENIOR MODE SCREEN ==========
    initSeniorMode() {
        if (!this.state.seniorMode) {
            document.body.classList.add('senior-mode');
            this.state.seniorMode = true;
        }
    },

    seniorFindBus() {
        this.showScreen('home');
        document.getElementById('from-input')?.focus();
    },

    seniorMyJourney() {
        if (this.state.activeJourney) {
            this.showScreen('journey');
        } else {
            this.showToast('No active journey. Find a bus first.', 'info');
        }
    },

    seniorMyStop() {
        if (this.state.activeJourney && this.state.activeJourney.guardianEnabled) {
            SmartBusGuardian.checkStatus(this.state.activeJourney.id);
        } else if (this.state.activeJourney) {
            this.enableGuardian();
        } else {
            this.showToast('Start a journey first', 'info');
        }
    },

    // ========== TOAST NOTIFICATIONS ==========
    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    },

    quickSearch(from, to) {
        const fromInput = document.getElementById('from-input');
        const toInput = document.getElementById('to-input');
        if (fromInput) fromInput.value = from;
        if (toInput) toInput.value = to;
        this.searchBuses();
    },

    async startJourneyWithBus(busId, source, destination) {
        try {
            const journey = await this.apiPost('/api/journey/start', {
                busId: busId,
                source: source,
                destination: destination
            });
            this.state.activeJourney = journey;
            this.showJourneyScreen(journey, { busId, busNumber: journey.busNumber, source, destination });
            this.showToast('Journey started on ' + (journey.busNumber || 'bus'), 'success');
        } catch (e) {
            this.showToast('Error starting journey: ' + e.message, 'error');
        }
    },

    // ========== INNOVATIVE FEATURE: WHATSAPP SHARE ==========
    shareJourneyOnWhatsApp() {
        const journey = this.state.activeJourney;
        if (!journey) {
            this.showToast('Start a journey first to share live status', 'info');
            return;
        }
        const busNum = journey.busNumber || 'TN Bus';
        const src = journey.source || 'Tamil Nadu';
        const dst = journey.destination || 'Destination';
        const msg = encodeURIComponent(
            `🚌 *SmartBus Live Journey Tracking*\n` +
            `Bus: ${busNum}\n` +
            `Route: ${src} ➔ ${dst}\n` +
            `Status: Travelling in Tamil Nadu\n` +
            `Track Live: ${window.location.origin}\n` +
            `Protected by Smart Stop Guardian 🔔`
        );
        window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank');
        this.showToast('Opening WhatsApp to share live trip...', 'success');
    },

    // ========== INNOVATIVE FEATURE: EMERGENCY SOS & SIREN ==========
    sirenContext: null,
    sirenOsc: null,
    sirenGain: null,
    isSirenPlaying: false,

    openSosModal() {
        const modal = document.getElementById('sos-modal');
        if (modal) modal.style.display = 'flex';
    },

    closeSosModal() {
        const modal = document.getElementById('sos-modal');
        if (modal) modal.style.display = 'none';
        if (this.isSirenPlaying) this.toggleSiren();
    },

    toggleSiren() {
        const btn = document.getElementById('siren-toggle-btn');
        if (!this.isSirenPlaying) {
            try {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                this.sirenContext = new AudioContext();
                this.sirenOsc = this.sirenContext.createOscillator();
                this.sirenGain = this.sirenContext.createGain();

                this.sirenOsc.type = 'sawtooth';
                this.sirenOsc.frequency.setValueAtTime(600, this.sirenContext.currentTime);

                // Siren frequency modulation (wailing police siren)
                const now = this.sirenContext.currentTime;
                for (let i = 0; i < 30; i++) {
                    this.sirenOsc.frequency.linearRampToValueAtTime(1200, now + (i * 0.8) + 0.4);
                    this.sirenOsc.frequency.linearRampToValueAtTime(600, now + (i * 0.8) + 0.8);
                }

                this.sirenGain.gain.setValueAtTime(0.3, this.sirenContext.currentTime);
                this.sirenOsc.connect(this.sirenGain);
                this.sirenGain.connect(this.sirenContext.destination);

                this.sirenOsc.start();
                this.isSirenPlaying = true;
                if (btn) {
                    btn.textContent = '⏹ STOP SIREN ALARM';
                    btn.style.background = '#000';
                }
                this.showToast('🚨 EMERGENCY SIREN ACTIVATED!', 'error');
            } catch (e) {
                console.error('Audio siren error:', e);
            }
        } else {
            try {
                if (this.sirenOsc) {
                    this.sirenOsc.stop();
                    this.sirenOsc.disconnect();
                }
                if (this.sirenContext) this.sirenContext.close();
            } catch (e) {}
            this.isSirenPlaying = false;
            if (btn) {
                btn.textContent = '🔊 SOUND LOUD SIREN';
                btn.style.background = '#DC3545';
            }
        }
    },

    // ========== INNOVATIVE FEATURE: RURAL FARE CALCULATOR ==========
    async calculateFareWidget() {
        const from = document.getElementById('fare-from')?.value?.trim();
        const to = document.getElementById('fare-to')?.value?.trim();
        const type = document.getElementById('fare-type')?.value;
        const senior = document.getElementById('fare-senior')?.checked || false;

        if (!from || !to) {
            this.showToast('Please enter both From and To stations', 'error');
            return;
        }

        try {
            const data = await this.apiGet(`/api/fare/calculate?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&type=${encodeURIComponent(type)}&senior=${senior}`);
            const resultCard = document.getElementById('fare-result-card');
            if (resultCard && data) {
                resultCard.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
                        <div>
                            <div style="font-size:18px; font-weight:800; color:#1A1A2E;">${data.from} ➔ ${data.to}</div>
                            <div style="font-size:13px; color:var(--text-secondary); margin-top:2px;">Approx Road Distance: <strong>${data.distanceKm} km</strong></div>
                        </div>
                        <div style="text-align:right;">
                            <div style="font-size:28px; font-weight:800; color:#28A745;">₹${data.finalFare}</div>
                            <div style="font-size:11px; color:var(--text-secondary);">${data.busType}</div>
                        </div>
                    </div>

                    <div style="background:#F8F9FA; padding:12px; border-radius:8px; font-size:13px; margin-bottom:12px;">
                        <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                            <span>Ordinary / Town Bus:</span> <strong>₹${data.ordinaryFare}</strong>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                            <span>Express (Mofussil):</span> <strong>₹${data.expressFare}</strong>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                            <span>SETC Ultra Deluxe:</span> <strong>₹${data.deluxeFare}</strong>
                        </div>
                        <div style="display:flex; justify-content:space-between;">
                            <span>AC Sleeper / Volvo:</span> <strong>₹${data.acFare}</strong>
                        </div>
                    </div>

                    ${data.isSenior ? `<div style="color:#2E7D32; font-weight:700; font-size:13px; margin-bottom:12px;">👴 50% Senior Citizen Concession Applied (Saved ₹${data.discountApplied})!</div>` : ''}

                    <button class="btn btn-primary btn-block" onclick="SmartBus.quickSearch('${data.from}', '${data.to}')">
                        🔍 Find Available Buses for This Route
                    </button>
                `;
                resultCard.style.display = 'block';
                resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        } catch (e) {
            this.showToast('Error calculating fare: ' + e.message, 'error');
        }
    }
};

// ============================================
// ============================================
// SmartBus Theme (Dark Mode / Night Theme / System Default)
// ============================================
const SmartBusTheme = {
    mode: 'dark', // 'light', 'dark', 'system'

    init() {
        const saved = localStorage.getItem('smartbus_theme_mode') || localStorage.getItem('smartbus_theme') || 'dark';
        this.applyTheme(saved, false);
    },

    applyTheme(mode, showNotification = true) {
        this.mode = mode;
        localStorage.setItem('smartbus_theme_mode', mode);

        let isDark = false;
        if (mode === 'system') {
            isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        } else {
            isDark = (mode === 'dark');
        }

        if (isDark) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }

        // Update drawer label & toggle button
        const drawerSub = document.getElementById('drawer-current-theme');
        if (drawerSub) {
            drawerSub.textContent = mode === 'dark' ? 'Dark Theme' : (mode === 'light' ? 'Light Theme' : 'System Default');
        }

        const toggleBtn = document.getElementById('theme-toggle');
        if (toggleBtn) {
            toggleBtn.innerHTML = isDark ? '☀️ Day' : '🌙 Night';
        }

        if (window.SmartBusMap && SmartBusMap.setMapTheme) {
            SmartBusMap.setMapTheme(isDark);
        }

        if (showNotification) {
            SmartBus.showToast(isDark ? '🌙 Dark Mode activated' : '☀️ Light Mode activated', 'info');
        }
    },

    toggle() {
        const isCurrentDark = document.body.classList.contains('dark-mode');
        this.applyTheme(isCurrentDark ? 'light' : 'dark', true);
    }
};

// ============================================
// 'Where is my Train' Style Drawer Menu
// ============================================
const SmartBusDrawer = {
    open() {
        const backdrop = document.getElementById('drawer-backdrop');
        const menu = document.getElementById('drawer-menu');
        if (backdrop) backdrop.classList.add('active');
        if (menu) menu.classList.add('active');
        document.body.style.overflow = 'hidden';
    },

    close() {
        const backdrop = document.getElementById('drawer-backdrop');
        const menu = document.getElementById('drawer-menu');
        if (backdrop) backdrop.classList.remove('active');
        if (menu) menu.classList.remove('active');
        document.body.style.overflow = '';
    }
};

// ============================================
// 'Where is my Train' Style Theme Selection Dialog
// ============================================
const SmartBusThemeDialog = {
    tempSelected: 'dark',

    open() {
        const overlay = document.getElementById('theme-modal-overlay');
        if (!overlay) return;

        this.tempSelected = localStorage.getItem('smartbus_theme_mode') || 'dark';

        const radio = document.getElementById(`theme-radio-${this.tempSelected}`);
        if (radio) radio.checked = true;

        overlay.style.display = 'flex';
    },

    close() {
        const overlay = document.getElementById('theme-modal-overlay');
        if (overlay) overlay.style.display = 'none';
    },

    select(mode) {
        this.tempSelected = mode;
        const radio = document.getElementById(`theme-radio-${mode}`);
        if (radio) radio.checked = true;
    },

    save() {
        SmartBusTheme.applyTheme(this.tempSelected, true);
        this.close();
    }
};

window.SmartBusDrawer = SmartBusDrawer;
window.SmartBusThemeDialog = SmartBusThemeDialog;

// ============================================
// SmartBus AI (Transit AI Assistant with Voice)
// ============================================
const SmartBusAI = {
    voiceEnabled: true,
    recognition: null,
    isListening: false,
    currentLang: 'en-IN',

    setLanguage(lang) {
        this.currentLang = lang === 'ta' ? 'ta-IN' : 'en-IN';
        SmartBus.state.language = lang;

        document.querySelectorAll('.ai-lang-chip').forEach(chip => {
            chip.classList.toggle('active', chip.dataset.lang === lang);
        });

        const langName = lang === 'ta' ? 'தமிழ் (Tamil)' : 'English';
        SmartBus.showToast(`AI Language set to: ${langName}`, 'info');

        // If currently recording, restart with new language
        if (this.isListening) {
            this.stopVoiceInput();
            setTimeout(() => this.startVoiceInput(), 200);
        }
    },

    toggleVoice() {
        this.voiceEnabled = !this.voiceEnabled;
        const btn = document.getElementById('ai-voice-toggle');
        if (btn) {
            btn.textContent = this.voiceEnabled ? '🔊 Audio ON' : '🔇 Audio OFF';
            btn.classList.toggle('btn-secondary', this.voiceEnabled);
        }
        SmartBus.showToast(this.voiceEnabled ? 'Voice read-aloud enabled' : 'Voice read-aloud disabled', 'info');
    },

    toggleVoiceInput() {
        if (this.isListening) {
            this.stopVoiceInput();
        } else {
            this.startVoiceInput();
        }
    },

    startVoiceInput() {
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRec) {
            SmartBus.showToast('Voice speech input is not supported on this browser. Try Google Chrome or Edge.', 'error');
            return;
        }

        try {
            if (this.recognition) {
                try { this.recognition.abort(); } catch (e) {}
            }

            this.recognition = new SpeechRec();
            this.recognition.lang = this.currentLang || 'en-IN';
            this.recognition.continuous = false;
            this.recognition.interimResults = true;
            this.recognition.maxAlternatives = 1;

            const micBtn = document.getElementById('ai-mic-btn');
            const banner = document.getElementById('ai-listening-banner');
            const input = document.getElementById('ai-input');

            this.recognition.onstart = () => {
                this.isListening = true;
                if (micBtn) {
                    micBtn.classList.add('listening');
                    micBtn.title = 'Listening... Tap to stop';
                }
                if (banner) banner.style.display = 'flex';
                SmartBus.showToast('Listening... Speak now', 'info');
            };

            this.recognition.onresult = (event) => {
                let finalTranscript = '';
                let interimTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }

                if (input) {
                    input.value = finalTranscript || interimTranscript;
                }

                if (finalTranscript.trim().length > 0) {
                    this.stopVoiceInput();
                    setTimeout(() => {
                        this.sendUserMessage();
                    }, 350);
                }
            };

            this.recognition.onerror = (event) => {
                console.warn('Speech recognition event error:', event.error);
                this.stopVoiceInput();
                if (event.error !== 'no-speech') {
                    SmartBus.showToast('Microphone issue: ' + event.error, 'error');
                }
            };

            this.recognition.onend = () => {
                this.stopVoiceInput();
            };

            this.recognition.start();
        } catch (e) {
            console.error('Error starting speech recognition:', e);
            this.stopVoiceInput();
            SmartBus.showToast('Could not start microphone: ' + e.message, 'error');
        }
    },

    stopVoiceInput() {
        this.isListening = false;
        if (this.recognition) {
            try { this.recognition.stop(); } catch (e) {}
        }
        const micBtn = document.getElementById('ai-mic-btn');
        const banner = document.getElementById('ai-listening-banner');
        if (micBtn) {
            micBtn.classList.remove('listening');
            micBtn.title = 'Tap to speak (குரல் மூலம் பேசுங்கள்)';
        }
        if (banner) banner.style.display = 'none';
    },

    ask(questionText) {
        const input = document.getElementById('ai-input');
        if (input) input.value = questionText;
        this.sendUserMessage();
    },

    async sendUserMessage() {
        const input = document.getElementById('ai-input');
        if (!input) return;
        const msg = input.value.trim();
        if (!msg) return;

        input.value = '';
        this.appendMessage(msg, 'user');

        // Typing indicator
        const typingId = 'ai-typing-' + Date.now();
        const chatBox = document.getElementById('ai-chat-messages');
        if (chatBox) {
            const typingEl = document.createElement('div');
            typingEl.id = typingId;
            typingEl.className = 'ai-msg ai-bot';
            typingEl.innerHTML = '<div class="ai-bubble" style="color:#888;">🤖 SmartBus AI is thinking...</div>';
            chatBox.appendChild(typingEl);
            chatBox.scrollTop = chatBox.scrollHeight;
        }

        try {
            const lang = SmartBus.state.language || 'en';
            const res = await SmartBus.apiPost('/api/ai/chat', { message: msg, language: lang });
            const typingEl = document.getElementById(typingId);
            if (typingEl) typingEl.remove();

            if (res && res.reply) {
                this.appendBotMessage(res);

                // Voice playback if enabled
                if (this.voiceEnabled && (res.speechText || res.reply)) {
                    this.speak(res.speechText || res.reply.replace(/[*#]/g, ''));
                }
            }
        } catch (e) {
            const typingEl = document.getElementById(typingId);
            if (typingEl) typingEl.remove();
            this.appendMessage('Sorry, I encountered an error. Please try asking again.', 'bot');
        }
    },

    appendMessage(text, sender) {
        const chatBox = document.getElementById('ai-chat-messages');
        if (!chatBox) return;

        const msgDiv = document.createElement('div');
        msgDiv.className = `ai-msg ai-${sender}`;
        msgDiv.innerHTML = `<div class="ai-bubble">${this.formatText(text)}</div>`;
        chatBox.appendChild(msgDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    },

    appendBotMessage(data) {
        const chatBox = document.getElementById('ai-chat-messages');
        if (!chatBox) return;

        const msgDiv = document.createElement('div');
        msgDiv.className = 'ai-msg ai-bot';

        let actionHtml = '';
        if (data.action && data.action.startsWith('action_search:')) {
            const parts = data.action.split(':');
            const from = parts[1] ? (parts[1].charAt(0).toUpperCase() + parts[1].slice(1)) : 'Chennai';
            const to = parts[2] ? (parts[2].charAt(0).toUpperCase() + parts[2].slice(1)) : 'Gingee';
            actionHtml = `
                <button class="btn btn-primary" style="margin-top:10px; padding:8px 16px; font-size:13px; border-radius:18px; box-shadow:0 3px 10px rgba(255,107,0,0.35);" onclick="SmartBus.quickSearch('${from}', '${to}')">
                    🔍 View ${from} ➔ ${to} Buses on Live Map
                </button>
            `;
        } else if (data.action === 'action_fare') {
            actionHtml = `
                <button class="btn btn-primary" style="margin-top:10px; padding:8px 16px; font-size:13px; border-radius:18px;" onclick="SmartBus.showScreen('fare')">
                    💰 Open Fare Calculator
                </button>
            `;
        } else if (data.action === 'action_guide') {
            actionHtml = `
                <button class="btn btn-primary" style="margin-top:10px; padding:8px 16px; font-size:13px; border-radius:18px;" onclick="SmartBus.showScreen('home')">
                    🔍 Search Buses Now
                </button>
            `;
        } else if (data.action === 'action_guardian') {
            actionHtml = `
                <button class="btn btn-primary" style="margin-top:10px; padding:8px 16px; font-size:13px; border-radius:18px;" onclick="SmartBus.showScreen('journey')">
                    🔔 Open Stop Guardian Screen
                </button>
            `;
        } else if (data.action === 'action_sos') {
            actionHtml = `
                <button class="btn btn-danger" style="margin-top:10px; padding:8px 16px; font-size:13px; border-radius:18px;" onclick="SmartBus.openSosModal()">
                    🚨 Open Emergency SOS Panel
                </button>
            `;
        } else if (data.action === 'action_senior') {
            actionHtml = `
                <button class="btn btn-secondary" style="margin-top:10px; padding:8px 16px; font-size:13px; border-radius:18px;" onclick="SmartBus.toggleSeniorMode()">
                    👴 Enable Senior Citizen Mode
                </button>
            `;
        }

        let suggestionsHtml = '';
        if (data.suggestions && data.suggestions.length > 0) {
            suggestionsHtml = `
                <div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:10px;">
                    ${data.suggestions.map(s => `<span class="ai-chip" style="padding:5px 10px; font-size:11.5px; border-radius:14px;" onclick="SmartBusAI.ask('${s.replace(/'/g, "\\'")}')">${s}</span>`).join('')}
                </div>
            `;
        }

        msgDiv.innerHTML = `
            <div class="ai-bubble">
                <div>${this.formatText(data.reply)}</div>
                ${actionHtml}
                ${suggestionsHtml}
            </div>
        `;
        chatBox.appendChild(msgDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    },

    formatText(text) {
        if (!text) return '';
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    },

    speak(text) {
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        // Check language
        if (/[\u0B80-\u0BFF]/.test(text)) {
            utterance.lang = 'ta-IN';
        } else {
            utterance.lang = 'en-IN';
        }
        window.speechSynthesis.speak(utterance);
    }
};

window.SmartBus = SmartBus;
window.SmartBusAI = SmartBusAI;
window.SmartBusTheme = SmartBusTheme;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => SmartBus.init());

