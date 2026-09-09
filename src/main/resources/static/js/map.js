/* ============================================
   SmartBus - Google Maps Integration
   Interactive live bus tracking with official Google Maps
   ============================================ */

const SmartBusMap = {
    map: null,
    homeMap: null,
    busMarker: null,
    routeLine: null,
    stopMarkers: [],
    homeBusMarkers: [],
    currentBusId: null,
    userLocationMarker: null,
    isFullscreen: false,

    busIcon: null,
    stopIcon: null,
    visitedStopIcon: null,
    currentStopIcon: null,
    destinationIcon: null,

    // Tile layers for dynamic light / dark mode
    homeStreetsLayer: null,
    homeDarkLayer: null,

    initIcons() {
        if (this.busIcon) return;

        this.busIcon = L.divIcon({
            className: 'bus-marker-icon',
            html: '<div style="background:#FF6B00;color:white;width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 4px 12px rgba(255,107,0,0.5);border:3px solid white;animation:pulse 2s infinite;">🚌</div>',
            iconSize: [40, 40],
            iconAnchor: [20, 20],
            popupAnchor: [0, -20]
        });

        this.stopIcon = L.divIcon({
            className: 'stop-marker-icon',
            html: '<div style="background:white;width:14px;height:14px;border-radius:50%;border:3px solid #666;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>',
            iconSize: [14, 14],
            iconAnchor: [7, 7]
        });

        this.visitedStopIcon = L.divIcon({
            className: 'stop-marker-icon',
            html: '<div style="background:#28A745;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(40,167,69,0.5);"></div>',
            iconSize: [16, 16],
            iconAnchor: [8, 8]
        });

        this.currentStopIcon = L.divIcon({
            className: 'stop-marker-icon',
            html: '<div style="background:#FF6B00;width:22px;height:22px;border-radius:50%;border:3px solid white;box-shadow:0 0 0 5px rgba(255,107,0,0.35),0 3px 8px rgba(0,0,0,0.3);"></div>',
            iconSize: [22, 22],
            iconAnchor: [11, 11]
        });

        this.destinationIcon = L.divIcon({
            className: 'stop-marker-icon',
            html: '<div style="background:#DC3545;width:20px;height:20px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(220,53,69,0.5);display:flex;align-items:center;justify-content:center;color:white;font-size:10px;font-weight:bold;">🏁</div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });
    },

    // ===== HOME SCREEN RADAR MAP =====
    async initHomeMap() {
        const homeMapEl = document.getElementById('home-map');
        if (!homeMapEl) return;

        this.initIcons();

        if (this.homeMap) {
            setTimeout(() => this.homeMap.invalidateSize(), 50);
            return;
        }

        try {
            // Tamil Nadu Bounding Box: Lat 7.8°N to 14.0°N, Lng 76.0°E to 81.0°E
            const tnBounds = L.latLngBounds(
                L.latLng(7.8, 75.8),
                L.latLng(14.0, 80.8)
            );

            // Center over Tamil Nadu: Latitude 11.1271, Longitude 78.6569, Zoom 7.5
            this.homeMap = L.map('home-map', {
                zoomControl: true,
                scrollWheelZoom: true,
                touchZoom: true,
                dragging: true,
                doubleClickZoom: true,
                minZoom: 6,
                maxZoom: 18,
                maxBounds: L.latLngBounds(L.latLng(6.5, 74.0), L.latLng(15.5, 83.0)),
                maxBoundsViscosity: 0.85
            }).setView([11.1271, 78.6569], 7.5);

            // Google Roadmap Layer (with mt0-mt3 Google tile subdomains)
            const googleRoadmap = L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
                maxZoom: 20,
                subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
                attribution: '&copy; Google Maps'
            });

            // Google Satellite Hybrid Layer
            const googleSatellite = L.tileLayer('https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
                maxZoom: 20,
                subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
                attribution: '&copy; Google Maps'
            });

            // Default layer: Google Roadmap
            googleRoadmap.addTo(this.homeMap);

            // Clean, uncluttered 2-option layer switcher removed as requested
            /* L.control.layers({
                "Google Maps": googleRoadmap,
                "Google Satellite": googleSatellite
            }, null, { position: 'topright' }).addTo(this.homeMap); */

            // Google Watermark
            const GoogleWatermark = L.Control.extend({
                options: { position: 'bottomleft' },
                onAdd: function() {
                    const div = L.DomUtil.create('div', 'google-watermark');
                    div.innerHTML = '<span style="background:rgba(255,255,255,0.9);padding:3px 8px;border-radius:4px;font-size:11px;font-weight:700;color:#5f6368;box-shadow:0 1px 4px rgba(0,0,0,0.25);display:inline-block;"><span style="color:#4285F4">G</span><span style="color:#EA4335">o</span><span style="color:#FBBC05">o</span><span style="color:#4285F4">g</span><span style="color:#34A853">l</span><span style="color:#EA4335">e</span> Maps</span>';
                    return div;
                }
            });
            this.homeMap.addControl(new GoogleWatermark());

            // Load bus markers
            await this.loadHomeBuses();

            // Invalidate size multiple times to ensure perfect canvas rendering
            setTimeout(() => { if (this.homeMap) this.homeMap.invalidateSize(); }, 100);
            setTimeout(() => { if (this.homeMap) this.homeMap.invalidateSize(); }, 400);
            setTimeout(() => { if (this.homeMap) this.homeMap.invalidateSize(); }, 900);

            window.addEventListener('resize', () => {
                if (this.homeMap) this.homeMap.invalidateSize();
            });

        } catch (err) {
            console.error('Failed to initialize home map:', err);
        }
    },

    async loadHomeBuses() {
        if (!this.homeMap) return;

        // Clear existing markers
        this.homeBusMarkers.forEach(m => this.homeMap.removeLayer(m));
        this.homeBusMarkers = [];

        try {
            const buses = await SmartBus.apiGet('/api/buses/active');
            if (!buses || buses.length === 0) return;

            // Fetch tracking concurrently for all active buses
            const trackingPromises = buses.map(bus =>
                SmartBus.apiGet(`/api/tracking/${bus.id}`)
                    .then(tr => ({ bus, tracking: tr }))
                    .catch(() => null)
            );

            const results = await Promise.allSettled(trackingPromises);

            // Group by coordinate to detect overlapping buses at major stands and add micro-dispersion
            const coordCounts = {};

            results.forEach((res, index) => {
                if (res.status === 'fulfilled' && res.value && res.value.tracking) {
                    const { bus, tracking } = res.value;
                    if (tracking.currentLat && tracking.currentLng) {
                        const key = `${tracking.currentLat.toFixed(3)},${tracking.currentLng.toFixed(3)}`;
                        const count = coordCounts[key] || 0;
                        coordCounts[key] = count + 1;

                        // Slight natural dispersion so stacked buses at Koyambedu, Salem, etc. don't block each other
                        let lat = tracking.currentLat;
                        let lng = tracking.currentLng;
                        if (count > 0) {
                            const angle = count * 2.399; // golden angle
                            const radius = 0.012 * Math.sqrt(count);
                            lat += Math.sin(angle) * radius;
                            lng += Math.cos(angle) * radius;
                        }

                        // Sleek circular transit badge with 🚌 icon & bus number on hover
                        const marker = L.marker([lat, lng], {
                            icon: L.divIcon({
                                className: 'radar-bus-marker',
                                html: `<div class="radar-bus-pin" title="${bus.busNumber} (${bus.source} → ${bus.destination})">
                                         <span>🚌</span>
                                       </div>`,
                                iconSize: [34, 34],
                                iconAnchor: [17, 17]
                            })
                        }).addTo(this.homeMap);

                        marker.bindPopup(`
                            <div style="font-family:system-ui,sans-serif; min-width:210px; padding:4px;">
                                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                                    <span style="font-size:15px; font-weight:800; color:#FF6B00;">🚌 ${bus.busNumber}</span>
                                    <span style="background:#E8F5E9; color:#2E7D32; font-size:10px; font-weight:700; padding:2px 6px; border-radius:10px;">LIVE</span>
                                </div>
                                <div style="font-size:12px; color:#4B5563; margin:2px 0;"><strong>Type:</strong> ${bus.busType}</div>
                                <div style="font-size:12px; color:#1F2937; margin:3px 0; font-weight:600;">📍 ${bus.source} ➔ ${bus.destination}</div>
                                <div style="font-size:12px; color:#4B5563;">Current Stop: <strong>${tracking.currentStop || '--'}</strong></div>
                                <div style="font-size:12px; color:#059669; font-weight:600; margin-top:2px;">Next: ${tracking.nextStop || '--'} (ETA ${tracking.estimatedArrivalMinutes || 5}m)</div>
                                <div style="margin-top:5px; font-size:12px; display:flex; justify-content:space-between;">
                                    <span>Crowd: <strong style="color:#FF6B00;">${bus.crowdLevel}</strong></span>
                                    <span>⭐ <strong>${bus.rating ? bus.rating.toFixed(1) : '4.5'}</strong></span>
                                </div>
                                <button class="btn btn-primary" style="margin-top:10px; padding:8px 12px; font-size:12px; width:100%; border-radius:8px;" onclick="SmartBus.startJourneyWithBus(${bus.id}, '${bus.source}', '${bus.destination}')">
                                    📍 Track This Bus
                                </button>
                            </div>
                        `);

                        this.homeBusMarkers.push(marker);
                    }
                }
            });
        } catch (e) {
            console.error('Error loading home map buses:', e);
        }
    },

    centerTamilNadu() {
        const targetMap = this.homeMap || this.map;
        if (targetMap) {
            targetMap.setView([11.1271, 78.6569], 7.5, { animate: true, duration: 0.8 });
        }
    },

    locateUser() {
        if (!navigator.geolocation) {
            SmartBus.showToast('Geolocation is not supported by your browser', 'error');
            return;
        }

        SmartBus.showToast('Detecting your GPS location...', 'info');

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                const targetMap = this.homeMap || this.map;

                if (targetMap) {
                    targetMap.setView([lat, lng], 13, { animate: true, duration: 1.0 });

                    if (this.userLocationMarker) {
                        targetMap.removeLayer(this.userLocationMarker);
                    }

                    this.userLocationMarker = L.circleMarker([lat, lng], {
                        radius: 9,
                        fillColor: '#2563EB',
                        color: '#FFFFFF',
                        weight: 3,
                        opacity: 1,
                        fillOpacity: 0.9
                    }).addTo(targetMap);

                    this.userLocationMarker.bindPopup(`
                        <div style="font-family:system-ui,sans-serif; text-align:center;">
                            <strong>📍 You are here</strong><br>
                            <span style="font-size:11px; color:#666;">Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}</span>
                        </div>
                    `).openPopup();

                    SmartBus.showToast('Centered on your live location!', 'success');
                }
            },
            (err) => {
                SmartBus.showToast('Unable to get GPS location. Centering on Tamil Nadu...', 'info');
                this.centerTamilNadu();
            },
            { enableHighAccuracy: true, timeout: 6000 }
        );
    },

    toggleFullscreen() {
        const mapCard = document.querySelector('.map-card') || document.getElementById('home-map')?.parentElement;
        if (!mapCard) return;

        this.isFullscreen = !this.isFullscreen;
        mapCard.classList.toggle('fullscreen-mode', this.isFullscreen);

        const expandBtn = document.getElementById('map-expand-btn');
        if (expandBtn) {
            expandBtn.textContent = this.isFullscreen ? '✕ Exit' : '⛶ Expand';
        }

        setTimeout(() => {
            if (this.homeMap) this.homeMap.invalidateSize();
            if (this.map) this.map.invalidateSize();
        }, 150);

        SmartBus.showToast(this.isFullscreen ? 'Expanded map mode' : 'Normal map mode', 'info');
    },

    setMapTheme(isDark) {
        if (this.homeMap && this.homeStreetsLayer && this.homeDarkLayer) {
            if (isDark) {
                if (this.homeMap.hasLayer(this.homeStreetsLayer)) {
                    this.homeMap.removeLayer(this.homeStreetsLayer);
                }
                if (!this.homeMap.hasLayer(this.homeDarkLayer)) {
                    this.homeDarkLayer.addTo(this.homeMap);
                }
            } else {
                if (this.homeMap.hasLayer(this.homeDarkLayer)) {
                    this.homeMap.removeLayer(this.homeDarkLayer);
                }
                if (!this.homeMap.hasLayer(this.homeStreetsLayer)) {
                    this.homeStreetsLayer.addTo(this.homeMap);
                }
            }
        }
    },

    // ===== JOURNEY SCREEN MAP =====
    async initMap(busId, routeId) {
        this.currentBusId = busId;
        const mapContainer = document.getElementById('map');
        if (!mapContainer) return;

        this.initIcons();

        if (this.map) {
            this.map.remove();
            this.map = null;
        }

        this.map = L.map('map', {
            zoomControl: true,
            scrollWheelZoom: true,
            touchZoom: true,
            dragging: true,
            minZoom: 6,
            maxZoom: 18,
            maxBounds: L.latLngBounds(L.latLng(6.5, 74.0), L.latLng(15.5, 83.0)),
            maxBoundsViscosity: 0.85
        }).setView([11.8, 78.8], 8);

        // High-definition Google Maps tile layers with fast CDN subdomains
        const googleRoadmap = L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
            maxZoom: 20,
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
            attribution: '&copy; Google Maps'
        });

        const googleSatellite = L.tileLayer('https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
            maxZoom: 20,
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
            attribution: '&copy; Google Maps'
        });

        // Set Google Maps as active base layer
        googleRoadmap.addTo(this.map);

        // Strict 2-option switcher removed as requested
        /* L.control.layers({
            "Google Maps": googleRoadmap,
            "Google Satellite": googleSatellite
        }, null, { position: 'topright' }).addTo(this.map); */

        // Google Watermark
        const GoogleWatermark = L.Control.extend({
            options: { position: 'bottomleft' },
            onAdd: function() {
                const div = L.DomUtil.create('div', 'google-watermark');
                div.innerHTML = '<span style="background:rgba(255,255,255,0.85);padding:2px 6px;border-radius:4px;font-size:11px;font-weight:700;color:#5f6368;box-shadow:0 1px 3px rgba(0,0,0,0.2);display:inline-block;"><span style="color:#4285F4">G</span><span style="color:#EA4335">o</span><span style="color:#FBBC05">o</span><span style="color:#4285F4">g</span><span style="color:#34A853">l</span><span style="color:#EA4335">e</span> Maps</span>';
                return div;
            }
        });
        this.map.addControl(new GoogleWatermark());

        try {
            const coords = await SmartBus.apiGet(`/api/tracking/${busId}/coordinates`);
            if (coords && coords.length > 0) {
                this.routeLine = L.polyline(coords, {
                    color: '#FF6B00',
                    weight: 5,
                    opacity: 0.85,
                    dashArray: '10, 6'
                }).addTo(this.map);

                this.map.fitBounds(this.routeLine.getBounds(), { padding: [40, 40] });
            }
        } catch (e) {
            console.error('Error fetching route coordinates:', e);
        }

        try {
            const tracking = await SmartBus.apiGet(`/api/tracking/${busId}`);
            if (tracking) {
                this.renderStops(tracking.stops, tracking.currentStop);

                if (tracking.currentLat && tracking.currentLng) {
                    this.busMarker = L.marker([tracking.currentLat, tracking.currentLng], {
                        icon: this.busIcon,
                        zIndexOffset: 1000
                    }).addTo(this.map);

                    this.busMarker.bindPopup(`
                        <div style="font-family:system-ui,sans-serif; text-align:center;">
                            <strong>${tracking.busNumber}</strong><br>
                            <span style="color:#FF6B00;">At: ${tracking.currentStop}</span><br>
                            Next: ${tracking.nextStop || 'End'}
                        </div>
                    `);
                }
            }
        } catch (e) {
            console.error('Error fetching initial tracking data:', e);
        }

        setTimeout(() => { if (this.map) this.map.invalidateSize(); }, 150);
        setTimeout(() => { if (this.map) this.map.invalidateSize(); }, 500);
    },

    renderStops(stops, currentStopName) {
        this.stopMarkers.forEach(m => this.map && this.map.removeLayer(m));
        this.stopMarkers = [];

        if (!stops || !this.map) return;

        stops.forEach((stop, index) => {
            const isCurrent = (stop.name === currentStopName);
            const isLast = (index === stops.length - 1);

            let icon = this.stopIcon;
            if (stop.visited) icon = this.visitedStopIcon;
            if (isCurrent) icon = this.currentStopIcon;
            if (isLast && !isCurrent) icon = this.destinationIcon;

            const marker = L.marker([stop.lat, stop.lng], { icon: icon }).addTo(this.map);
            marker.bindPopup(`
                <div style="font-family:system-ui,sans-serif;">
                    <strong>${stop.name}</strong><br>
                    <span style="font-size:12px; color:#666;">Stop ${index + 1} of ${stops.length}</span><br>
                    ${isCurrent ? '<span style="color:#FF6B00; font-weight:bold;">Bus is here now</span>' : ''}
                    ${stop.visited ? '<span style="color:#28A745;">Passed</span>' : ''}
                </div>
            `);
            this.stopMarkers.push(marker);
        });
    },

    updateMapFromTracking(data) {
        if (!data || !this.map) return;

        if (data.currentLat && data.currentLng) {
            if (this.busMarker) {
                this.busMarker.setLatLng([data.currentLat, data.currentLng]);
                this.busMarker.setPopupContent(`
                    <div style="font-family:system-ui,sans-serif; text-align:center;">
                        <strong>${data.busNumber}</strong><br>
                        <span style="color:#FF6B00;">At: ${data.currentStop}</span><br>
                        Next: ${data.nextStop || 'End'}
                    </div>
                `);
            } else {
                this.busMarker = L.marker([data.currentLat, data.currentLng], {
                    icon: this.busIcon,
                    zIndexOffset: 1000
                }).addTo(this.map);
            }
        }

        if (data.stops && this.stopMarkers.length > 0) {
            data.stops.forEach((stop, index) => {
                if (index < this.stopMarkers.length) {
                    const isCurrent = (stop.name === data.currentStop);
                    const isLast = (index === data.stops.length - 1);

                    let icon = this.stopIcon;
                    if (stop.visited) icon = this.visitedStopIcon;
                    if (isCurrent) icon = this.currentStopIcon;
                    if (isLast && !isCurrent) icon = this.destinationIcon;

                    this.stopMarkers[index].setIcon(icon);
                }
            });
        }
    },

    async updateBusPosition(busId) {
        try {
            const data = await SmartBus.apiGet(`/api/tracking/${busId}`);
            if (data) {
                this.updateMapFromTracking(data);
                if (data.currentLat && data.currentLng && this.map) {
                    this.map.panTo([data.currentLat, data.currentLng], { animate: true, duration: 0.8 });
                }
            }
        } catch (e) {
            console.error('Error updating bus position on map:', e);
        }
    },

    centerOnBus() {
        if (this.busMarker && this.map) {
            this.map.setView(this.busMarker.getLatLng(), 13, { animate: true });
        }
    },

    destroy() {
        if (this.map) {
            this.map.remove();
            this.map = null;
        }
        this.busMarker = null;
        this.routeLine = null;
        this.stopMarkers = [];
    }
};

// Explicitly bind to window for cross-script access
window.SmartBusMap = SmartBusMap;
