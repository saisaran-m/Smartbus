const SmartBusDriver = {
    activeBusId: null,
    watchId: null,
    isStreaming: false,
    driverMap: null,
    driverMarker: null,

    // Initialize the driver console
    init() {
        this.loadBusList();
        this.initDriverMap();
        this.bindEvents();
    },

    bindEvents() {
        const toggleBtn = document.getElementById('driver-toggle-btn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                const busSelect = document.getElementById('driver-bus-select');
                if (!busSelect || !busSelect.value) {
                    alert('Please select a bus first.');
                    return;
                }
                if (this.isStreaming) {
                    this.stopBroadcast();
                } else {
                    this.startBroadcast(busSelect.value);
                }
            });
        }

        const occupancyBtns = document.querySelectorAll('.driver-occupancy-btn');
        occupancyBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (!this.activeBusId) {
                    alert('Please start broadcasting first.');
                    return;
                }
                const level = e.currentTarget.getAttribute('data-level');
                this.updateOccupancy(level);
                
                // Update UI selection state
                occupancyBtns.forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
            });
        });
    },

    // Load available buses into dropdown
    async loadBusList() {
        const busSelect = document.getElementById('driver-bus-select');
        if (!busSelect) return;
        
        try {
            const response = await fetch('/api/buses/active', {
                headers: {
                    'Accept': 'application/json'
                }
            });
            if (!response.ok) throw new Error('Failed to fetch buses');
            const buses = await response.json();
            
            busSelect.innerHTML = '<option value="">Select your bus...</option>';
            buses.forEach(bus => {
                const option = document.createElement('option');
                option.value = bus.id;
                option.textContent = `${bus.busNumber} (${bus.source} → ${bus.destination})`;
                busSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading bus list:', error);
            busSelect.innerHTML = '<option value="">Error loading buses</option>';
        }
    },

    // Start GPS broadcasting
    startBroadcast(busId) {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser.');
            return;
        }

        this.activeBusId = busId;
        this.isStreaming = true;
        
        const toggleBtn = document.getElementById('driver-toggle-btn');
        if (toggleBtn) {
            toggleBtn.textContent = 'Stop Broadcasting';
            toggleBtn.classList.add('streaming');
        }

        const busSelect = document.getElementById('driver-bus-select');
        if (busSelect) {
            busSelect.disabled = true;
        }

        this.watchId = navigator.geolocation.watchPosition(
            this.handlePositionUpdate.bind(this),
            this.handlePositionError.bind(this),
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    },

    async handlePositionUpdate(position) {
        const { latitude, longitude, speed } = position.coords;
        const timestamp = position.timestamp;

        // Update UI
        this.updateMapPosition(latitude, longitude);
        
        const speedDisplay = document.getElementById('driver-speed-display');
        if (speedDisplay) {
            speedDisplay.textContent = this.formatSpeed(speed);
        }

        // Send to backend
        try {
            const response = await fetch('/api/driver/broadcast', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    busId: this.activeBusId,
                    lat: latitude,
                    lng: longitude,
                    speed: speed,
                    timestamp: timestamp
                })
            });
            if (!response.ok) {
                console.error('Failed to broadcast position');
            }
        } catch (error) {
            console.error('Error broadcasting position:', error);
        }
    },

    handlePositionError(error) {
        console.error('Geolocation error:', error);
    },

    // Stop GPS broadcasting
    stopBroadcast() {
        if (this.watchId !== null) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }

        this.isStreaming = false;
        this.activeBusId = null;
        
        const toggleBtn = document.getElementById('driver-toggle-btn');
        if (toggleBtn) {
            toggleBtn.textContent = 'Start Broadcasting';
            toggleBtn.classList.remove('streaming');
        }

        const busSelect = document.getElementById('driver-bus-select');
        if (busSelect) {
            busSelect.disabled = false;
        }
        
        const speedDisplay = document.getElementById('driver-speed-display');
        if (speedDisplay) {
            speedDisplay.textContent = '-- km/h';
        }
    },

    // Update occupancy level
    async updateOccupancy(level) {
        if (!this.activeBusId) return;

        try {
            const response = await fetch('/api/driver/occupancy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    busId: this.activeBusId,
                    level: level
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to update occupancy');
            }
        } catch (error) {
            console.error('Error updating occupancy:', error);
            alert('Failed to update occupancy. Please try again.');
        }
    },

    // Initialize mini Leaflet map for driver
    initDriverMap() {
        const mapContainer = document.getElementById('driver-map');
        if (!mapContainer) return;

        if (typeof L === 'undefined') {
            console.error('Leaflet is not loaded.');
            return;
        }

        // Default to a central location, will update on GPS fix
        this.driverMap = L.map('driver-map').setView([0, 0], 2);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(this.driverMap);
    },

    // Update driver marker position on map
    updateMapPosition(lat, lng) {
        if (!this.driverMap) return;

        const newLatLng = new L.LatLng(lat, lng);
        this.driverMap.setView(newLatLng, 16); // zoom in on update

        if (this.driverMarker) {
            this.driverMarker.setLatLng(newLatLng);
        } else {
            // Pulse effect can be styled in CSS via the .streaming class
            const busIcon = L.divIcon({
                className: 'driver-location-marker streaming',
                html: '<div class="pulse" style="width: 20px; height: 20px; background: #4caf50; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(76,175,80,0.5);"></div>',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });
            
            this.driverMarker = L.marker(newLatLng, { icon: busIcon }).addTo(this.driverMap);
        }
    },

    // Format speed display
    formatSpeed(speedMs) {
        if (speedMs === null || speedMs === undefined || isNaN(speedMs)) {
            return '0 km/h';
        }
        const speedKmh = Math.round(speedMs * 3.6);
        return `${speedKmh} km/h`;
    }
};

// Export to global scope so it can be called from main app initialization
window.SmartBusDriver = SmartBusDriver;
