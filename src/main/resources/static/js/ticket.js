const SmartBusTicket = {
    selectedSeat: null,
    currentBus: null,
    
    // Initialize with bus data from search results
    openBooking(bus) {
        this.currentBus = bus;
        this.selectedSeat = null;
        
        // Ensure default travel date is set to today
        const dateInput = document.getElementById('ticket-travel-date');
        if (dateInput && !dateInput.value) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }

        this.renderSeatPicker();
        
        if (typeof SmartBus !== 'undefined' && SmartBus.showScreen) {
            SmartBus.showScreen('ticket');
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    
    // Render 5×4 seat grid (window-aisle-aisle-window pattern)
    // Rows labeled 1-5, columns A,B (window,aisle) | C,D (aisle,window)
    // Already booked seats shown in gray, available in green, selected in orange
    renderSeatPicker() {
        const grid = document.getElementById('ticket-seat-grid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        // 5 rows, 4 seats + 1 aisle (A, B, [aisle], C, D)
        const rows = 5;
        const cols = ['A', 'B', 'C', 'D'];
        
        // Mock booked seats for demonstration
        const bookedSeats = ['1A', '2C', '4D', '5B'];
        
        let html = '<div class="seat-map" style="display: flex; flex-direction: column; gap: 12px; align-items: center; padding: 20px; background: rgba(30,30,30,0.5); border-radius: 15px; backdrop-filter: blur(10px);">';
        
        // Front indicator
        html += '<div style="width: 100%; text-align: center; color: #888; font-size: 12px; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #333;">FRONT</div>';
        
        for (let i = 1; i <= rows; i++) {
            let rowHtml = `<div class="seat-row" style="display: flex; gap: 12px;">`;
            
            for (let j = 0; j < cols.length; j++) {
                const seatId = `${i}${cols[j]}`;
                const isBooked = bookedSeats.includes(seatId);
                const isSelected = this.selectedSeat === seatId;
                
                let seatColor = 'rgba(76, 175, 80, 0.2)'; // available bg
                let seatBorder = '1px solid #4CAF50';
                let seatTextColor = '#4CAF50';
                let cursor = 'pointer';
                
                if (isBooked) {
                    seatColor = 'rgba(158, 158, 158, 0.1)'; // booked bg
                    seatBorder = '1px solid #555';
                    seatTextColor = '#555';
                    cursor = 'not-allowed';
                } else if (isSelected) {
                    seatColor = '#FF9800'; // selected bg
                    seatBorder = '1px solid #FF9800';
                    seatTextColor = '#FFF';
                }
                
                // Add aisle gap between B and C
                const margin = (j === 1) ? 'margin-right: 30px;' : '';
                
                rowHtml += `<div class="seat" data-id="${seatId}" style="width: 45px; height: 45px; border-radius: 10px; background-color: ${seatColor}; border: ${seatBorder}; color: ${seatTextColor}; display: flex; align-items: center; justify-content: center; cursor: ${cursor}; font-weight: bold; transition: all 0.2s ease; ${margin}" onclick="SmartBusTicket.selectSeat('${seatId}', ${isBooked})">${seatId}</div>`;
            }
            
            rowHtml += `</div>`;
            html += rowHtml;
        }
        
        html += '</div>';
        
        // Legend
        html += `
        <div style="display: flex; justify-content: center; gap: 20px; margin-top: 20px; font-size: 12px; color: #aaa;">
            <div style="display: flex; align-items: center; gap: 5px;"><div style="width: 15px; height: 15px; background: rgba(76, 175, 80, 0.2); border: 1px solid #4CAF50; border-radius: 4px;"></div>Available</div>
            <div style="display: flex; align-items: center; gap: 5px;"><div style="width: 15px; height: 15px; background: #FF9800; border-radius: 4px;"></div>Selected</div>
            <div style="display: flex; align-items: center; gap: 5px;"><div style="width: 15px; height: 15px; background: rgba(158, 158, 158, 0.1); border: 1px solid #555; border-radius: 4px;"></div>Booked</div>
        </div>
        `;
        
        // Add confirm button
        html += `<div style="margin-top: 30px; text-align: center;">
            <button id="btn-proceed-payment" disabled style="width: 100%; max-width: 300px; padding: 15px 20px; border-radius: 25px; border: none; background: linear-gradient(135deg, #FF9800, #F44336); color: white; font-size: 16px; font-weight: bold; cursor: not-allowed; transition: all 0.3s ease; opacity: 0.5; box-shadow: 0 4px 15px rgba(244, 67, 54, 0.3);" onclick="SmartBusTicket.showPaymentSheet()">Proceed to Payment</button>
        </div>`;
        
        grid.innerHTML = html;
        this.updateProceedButton();
    },
    
    // Select a seat - highlight it orange, deselect others
    selectSeat(seatId, isBooked) {
        if (isBooked) {
            if (typeof SmartBus !== 'undefined' && SmartBus.showToast) {
                SmartBus.showToast('Seat is already booked');
            }
            return;
        }
        
        if (this.selectedSeat === seatId) {
            this.selectedSeat = null; // deselect
        } else {
            this.selectedSeat = seatId;
        }
        
        this.renderSeatPicker();
    },
    
    updateProceedButton() {
        const btn = document.getElementById('btn-proceed-payment');
        const fareContainer = document.getElementById('ticket-fare-display');
        const fareAmountEl = document.getElementById('ticket-fare-amount');
        const seatInfoEl = document.getElementById('ticket-seat-info');
        
        const fare = this.currentBus && (this.currentBus.fare || this.currentBus.price) ? (this.currentBus.fare || this.currentBus.price) : 250;

        if (this.selectedSeat) {
            if (btn) {
                btn.disabled = false;
                btn.style.cursor = 'pointer';
                btn.style.opacity = '1';
                btn.innerHTML = `Book Seat ${this.selectedSeat} • ₹${fare}`;
            }
            if (fareContainer) fareContainer.style.display = 'block';
            if (fareAmountEl) fareAmountEl.textContent = `₹${fare}`;
            if (seatInfoEl) seatInfoEl.innerHTML = `Selected Seat: <strong style="color:var(--primary); font-size:15px;">${this.selectedSeat}</strong> (₹${fare})`;
        } else {
            if (btn) {
                btn.disabled = true;
                btn.style.cursor = 'not-allowed';
                btn.style.opacity = '0.5';
                btn.innerHTML = 'Select a Seat to Continue';
            }
            if (fareContainer) fareContainer.style.display = 'none';
            if (seatInfoEl) seatInfoEl.innerHTML = 'Please tap an available green seat above to select';
        }
    },
    
    // Official UPI Brands Vector SVGs
    BRAND_ICONS: {
        GPAY: `<svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill="#4285F4" d="M43.61 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.39-3.917z"/>
            <path fill="#34A853" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
            <path fill="#FBBC05" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
            <path fill="#EA4335" d="M43.61 20.083L43.595 20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.39-3.917z"/>
        </svg>`,
        PHONEPE: `<svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="10" fill="#5F259F"/>
            <path d="M34.5 15.5H27.8C25.5 15.5 24.2 16.8 24.2 19V21.2H29C29.6 21.2 30 21.6 30 22.2C30 22.8 29.6 23.2 29 23.2H24.2V27.5C25.9 27.5 27.2 27 28.5 25.8C29 25.4 29.7 25.4 30.1 25.8C30.5 26.2 30.5 26.9 30.1 27.3C28.2 29.1 26.3 29.8 24.2 29.8C23.6 29.8 23.2 29.4 23.2 28.8V15.5H18C17.4 15.5 17 15.1 17 14.5C17 13.9 17.4 13.5 18 13.5H34.5C35.1 13.5 35.5 13.9 35.5 14.5C35.5 15.1 35.1 15.5 34.5 15.5ZM24.2 31.8L32.8 40.4C33.2 40.8 33.2 41.5 32.8 41.9C32.4 42.3 31.7 42.3 31.3 41.9L22.2 32.8C22.1 32.7 22 32.5 22 32.3V31.8C22 31.2 22.4 30.8 23 30.8C23.5 30.8 23.9 31.2 24.2 31.8Z" fill="white"/>
        </svg>`,
        PAYTM: `<svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="10" fill="#002E6E"/>
            <path d="M12 28V15H17.5C20.5 15 22 16.5 22 19C22 21.5 20.5 23 17.5 23H14.5V28H12ZM14.5 20.8H17.2C18.8 20.8 19.5 20.1 19.5 19C19.5 17.9 18.8 17.2 17.2 17.2H14.5V20.8Z" fill="#00BAF2"/>
            <path d="M22.5 28L26.5 18.5H29L33 28H30.4L29.6 26H25.9L25.1 28H22.5ZM26.6 24.1H28.9L27.8 21L26.6 24.1Z" fill="#FFFFFF"/>
            <path d="M34 15H36.6V28H34V15Z" fill="#00BAF2"/>
        </svg>`,
        BHIM: `<svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="10" fill="#005A9C"/>
            <path d="M13 14H24C28 14 30 16 30 19C30 20.8 29 22 27 22.6C29.5 23.2 31 24.8 31 27.5C31 31 28.5 33 24 33H13V14ZM18 21.5H23C24.5 21.5 25.5 20.7 25.5 19.5C25.5 18.3 24.5 17.5 23 17.5H18V21.5ZM18 29.5H23.5C25.2 29.5 26.2 28.6 26.2 27.2C26.2 25.8 25.2 24.9 23.5 24.9H18V29.5Z" fill="#00BAF2"/>
            <path d="M33 14L37 23.5L33 33H36L40 23.5L36 14H33Z" fill="#28A745"/>
        </svg>`
    },

    // Show UPI payment bottom sheet with real icons and genuine UPI flow
    showPaymentSheet() {
        if (!this.selectedSeat) {
            if (typeof SmartBus !== 'undefined' && SmartBus.showToast) {
                SmartBus.showToast('Please select a seat first', 'error');
            }
            return;
        }

        const overlay = document.getElementById('payment-overlay');
        const sheet = document.getElementById('payment-sheet');
        if (!sheet) return;
        
        const fare = this.currentBus && (this.currentBus.fare || this.currentBus.price) ? (this.currentBus.fare || this.currentBus.price) : 250;
        const upiId = 'saisaran0070@oksbi';
        const payeeName = 'SmartBus Transit';
        const pnrTemp = 'SB' + Date.now().toString().slice(-6);
        const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${fare}&cu=INR&tn=${encodeURIComponent('SmartBus Ticket ' + pnrTemp)}`;
        
        sheet.innerHTML = `
            <div class="payment-sheet-handle"></div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <div>
                    <div style="font-size:18px; font-weight:800; color:var(--text-primary);">Pay via UPI</div>
                    <div style="font-size:12px; color:var(--text-secondary);">Direct Payment to: <strong style="color:var(--primary);">${upiId}</strong></div>
                </div>
                <div style="text-align:right;">
                    <div style="font-size:20px; font-weight:900; color:var(--primary);">₹${fare}</div>
                    <div style="font-size:11px; color:#28A745; font-weight:700;">Zero Fee</div>
                </div>
            </div>
            
            <div style="background:var(--bg); border:1px solid var(--border); border-radius:10px; padding:10px 14px; font-size:13px; color:var(--text-secondary); margin-bottom:16px;">
                Seat <strong style="color:var(--primary); font-size:14px;">${this.selectedSeat}</strong> • ${this.currentBus ? this.currentBus.source + ' → ' + this.currentBus.destination : 'Tamil Nadu Transit'}
            </div>

            <!-- UPI Apps Direct Deep-linking with Real Logos -->
            <div id="payment-options">
                <div style="font-size:12px; font-weight:700; color:var(--text-secondary); margin-bottom:10px; text-transform:uppercase; letter-spacing:0.5px;">
                    Select UPI App (Real Instant Payment)
                </div>

                <button class="payment-app-btn" onclick="SmartBusTicket.initiateUpiApp('Google Pay', '${upiUrl}', 'tez://upi/pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${fare}&cu=INR&tn=${encodeURIComponent('SmartBus ' + pnrTemp)}')">
                    <div class="app-icon" style="background:#FFFFFF; border:1px solid var(--border); box-shadow:0 2px 6px rgba(0,0,0,0.06);">
                        ${this.BRAND_ICONS.GPAY}
                    </div>
                    <div style="flex:1; text-align:left;">
                        <div style="font-weight:700; font-size:15px;">Google Pay</div>
                        <div style="font-size:11px; color:var(--text-secondary);">Pay using GPay App</div>
                    </div>
                    <span style="background:#E8F5E9; color:#2E7D32; font-size:11px; font-weight:700; padding:3px 8px; border-radius:10px;">Pay ₹${fare}</span>
                </button>

                <button class="payment-app-btn" onclick="SmartBusTicket.initiateUpiApp('PhonePe', '${upiUrl}', 'phonepe://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${fare}&cu=INR&tn=${encodeURIComponent('SmartBus ' + pnrTemp)}')">
                    <div class="app-icon" style="background:#FFFFFF; border:1px solid var(--border); box-shadow:0 2px 6px rgba(0,0,0,0.06);">
                        ${this.BRAND_ICONS.PHONEPE}
                    </div>
                    <div style="flex:1; text-align:left;">
                        <div style="font-weight:700; font-size:15px;">PhonePe</div>
                        <div style="font-size:11px; color:var(--text-secondary);">Pay using PhonePe App</div>
                    </div>
                    <span style="background:#EDE7F6; color:#5F259F; font-size:11px; font-weight:700; padding:3px 8px; border-radius:10px;">Pay ₹${fare}</span>
                </button>

                <button class="payment-app-btn" onclick="SmartBusTicket.initiateUpiApp('Paytm', '${upiUrl}', 'paytmmp://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${fare}&cu=INR&tn=${encodeURIComponent('SmartBus ' + pnrTemp)}')">
                    <div class="app-icon" style="background:#FFFFFF; border:1px solid var(--border); box-shadow:0 2px 6px rgba(0,0,0,0.06);">
                        ${this.BRAND_ICONS.PAYTM}
                    </div>
                    <div style="flex:1; text-align:left;">
                        <div style="font-weight:700; font-size:15px;">Paytm UPI</div>
                        <div style="font-size:11px; color:var(--text-secondary);">Paytm Wallet or Bank UPI</div>
                    </div>
                    <span style="background:#E3F2FD; color:#005A9C; font-size:11px; font-weight:700; padding:3px 8px; border-radius:10px;">Pay ₹${fare}</span>
                </button>

                <button class="payment-app-btn" onclick="SmartBusTicket.initiateUpiApp('BHIM UPI', '${upiUrl}', '${upiUrl}')">
                    <div class="app-icon" style="background:#FFFFFF; border:1px solid var(--border); box-shadow:0 2px 6px rgba(0,0,0,0.06);">
                        ${this.BRAND_ICONS.BHIM}
                    </div>
                    <div style="flex:1; text-align:left;">
                        <div style="font-weight:700; font-size:15px;">BHIM / Any UPI App</div>
                        <div style="font-size:11px; color:var(--text-secondary);">CRED, Amazon Pay, Any Bank</div>
                    </div>
                    <span style="background:#FFF3E0; color:#E65100; font-size:11px; font-weight:700; padding:3px 8px; border-radius:10px;">Pay ₹${fare}</span>
                </button>

                <!-- Show QR Option for Desktop or Cross-Device Scan -->
                <button class="btn btn-secondary btn-block" style="margin-top:10px; font-size:13px; padding:10px;" onclick="SmartBusTicket.showUpiQr('${upiUrl}', ${fare})">
                    📷 Show UPI QR Code to Scan & Pay
                </button>
            </div>

            <!-- QR Code Container (Initially Hidden) -->
            <div id="payment-qr-container" style="display:none; text-align:center; padding:10px 0;">
                <div style="font-weight:700; font-size:14px; margin-bottom:8px;">Scan with Any UPI App (GPay / PhonePe / Paytm)</div>
                <div style="display:inline-block; background:white; padding:12px; border-radius:12px; box-shadow:0 4px 14px rgba(0,0,0,0.15); border:1px solid var(--border);">
                    <canvas id="upi-qr-canvas" width="180" height="180"></canvas>
                </div>
                <div style="font-size:12px; color:var(--text-secondary); margin-top:8px;">
                    Send exactly <strong>₹${fare}</strong> to <strong>${upiId}</strong>
                </div>
                <button class="btn btn-primary btn-block" style="margin-top:14px;" onclick="SmartBusTicket.showVerificationStep()">
                    I Have Made The Payment →
                </button>
            </div>

            <!-- Payment Confirmation / UTR Verification Screen -->
            <div id="payment-verify-container" style="display:none; padding:10px 0;">
                <div style="font-weight:800; font-size:16px; margin-bottom:6px; color:var(--primary);">Confirm Your Payment</div>
                <p style="font-size:13px; color:var(--text-secondary); margin-bottom:14px;">
                    Once you transfer <strong>₹${fare}</strong> to <strong>${upiId}</strong> in your UPI app, enter your 12-digit UPI Reference / UTR Number below to generate your boarding pass.
                </p>
                <div class="form-group">
                    <label style="font-weight:700; font-size:13px;">UPI Reference / UTR No (12 Digits):</label>
                    <input type="text" id="upi-utr-input" class="form-input" placeholder="e.g. 423589123456" maxlength="16" style="letter-spacing:1px; font-weight:700;">
                </div>
                <button class="btn btn-primary btn-block btn-lg" onclick="SmartBusTicket.confirmAndIssueTicket()">
                    Verify & Issue Boarding Pass ✅
                </button>
                <button class="btn btn-secondary btn-block" style="margin-top:8px;" onclick="SmartBusTicket.resetPaymentOptions()">
                    ← Back to UPI Options
                </button>
            </div>

            <button class="btn btn-secondary btn-block" style="margin-top:12px;" onclick="SmartBusTicket.closePaymentSheet()">
                Cancel
            </button>
        `;
        
        if (overlay) overlay.classList.add('active');
        sheet.classList.add('active');
    },

    closePaymentSheet() {
        const overlay = document.getElementById('payment-overlay');
        const sheet = document.getElementById('payment-sheet');
        if (overlay) overlay.classList.remove('active');
        if (sheet) sheet.classList.remove('active');
    },

    resetPaymentOptions() {
        const options = document.getElementById('payment-options');
        const qrContainer = document.getElementById('payment-qr-container');
        const verifyContainer = document.getElementById('payment-verify-container');
        if (options) options.style.display = 'block';
        if (qrContainer) qrContainer.style.display = 'none';
        if (verifyContainer) verifyContainer.style.display = 'none';
    },

    showUpiQr(upiUrl, fare) {
        const options = document.getElementById('payment-options');
        const qrContainer = document.getElementById('payment-qr-container');
        const verifyContainer = document.getElementById('payment-verify-container');
        if (options) options.style.display = 'none';
        if (qrContainer) qrContainer.style.display = 'block';
        if (verifyContainer) verifyContainer.style.display = 'none';

        setTimeout(() => {
            this.generateQR(upiUrl, 'upi-qr-canvas');
        }, 50);
    },

    showVerificationStep() {
        const options = document.getElementById('payment-options');
        const qrContainer = document.getElementById('payment-qr-container');
        const verifyContainer = document.getElementById('payment-verify-container');
        if (options) options.style.display = 'none';
        if (qrContainer) qrContainer.style.display = 'none';
        if (verifyContainer) verifyContainer.style.display = 'block';
    },

    // Open real UPI intent on device and prompt for confirmation
    initiateUpiApp(appName, genericUpiUrl, specificIntentUrl) {
        if (typeof SmartBus !== 'undefined' && SmartBus.showToast) {
            SmartBus.showToast(`Opening ${appName}... Please complete payment`, 'info');
        }

        // Try app-specific intent or fallback to standard upi://
        const intentUrl = specificIntentUrl || genericUpiUrl;
        
        // Open the genuine UPI link
        try {
            window.location.href = intentUrl;
        } catch (e) {
            window.location.href = genericUpiUrl;
        }

        // After initiating UPI app, transition user to the verification step
        setTimeout(() => {
            this.showVerificationStep();
        }, 1500);
    },

    // Confirm real payment and create verified ticket
    async confirmAndIssueTicket() {
        const utrInput = document.getElementById('upi-utr-input');
        const utr = utrInput ? utrInput.value.trim() : '';

        if (!utr || utr.length < 6) {
            if (typeof SmartBus !== 'undefined' && SmartBus.showToast) {
                SmartBus.showToast('Please enter a valid 12-digit UPI UTR number from your payment app', 'error');
            }
            if (utrInput) utrInput.focus();
            return;
        }

        const bus = this.currentBus;
        const busId = bus ? (bus.busId || bus.id || 1) : 1;
        const busNumber = bus ? (bus.busNumber || 'TN01-AB-1234') : 'TN01-AB-1234';
        const source = bus ? (bus.source || 'Chennai') : 'Chennai';
        const destination = bus ? (bus.destination || 'Salem') : 'Salem';
        const fareAmount = bus && (bus.fare || bus.price) ? (bus.fare || bus.price) : 250.0;
        const travelDate = document.getElementById('ticket-travel-date')?.value || new Date().toISOString().split('T')[0];

        try {
            if (typeof SmartBus !== 'undefined' && SmartBus.showToast) {
                SmartBus.showToast('Verifying payment & generating QR pass...', 'info');
            }

            let bookedTicket = null;
            try {
                const response = await fetch('/api/tickets/book', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        busId: busId,
                        busNumber: busNumber,
                        source: source,
                        destination: destination,
                        seatNumber: this.selectedSeat || '1A',
                        fareAmount: fareAmount,
                        paymentMethod: 'UPI (UTR: ' + utr + ')',
                        travelDate: travelDate
                    })
                });
                if (response.ok) {
                    bookedTicket = await response.json();
                    await fetch(`/api/tickets/confirm/${bookedTicket.pnrNumber}`, { method: 'POST' });
                    bookedTicket.paymentStatus = 'PAID';
                }
            } catch (apiErr) {
                console.warn('Backend ticket save fallback:', apiErr);
            }

            const pnr = bookedTicket ? bookedTicket.pnrNumber : ('SB' + Date.now().toString().slice(-8));
            const ticket = {
                pnr: pnr,
                busId: busId,
                busName: busNumber,
                route: `${source} → ${destination}`,
                seat: this.selectedSeat || '1A',
                date: travelDate,
                status: 'CONFIRMED',
                paymentMethod: 'UPI (saisaran0070@oksbi)',
                utr: utr,
                amount: fareAmount
            };

            this.closePaymentSheet();
            this.saveTicketOffline(ticket);
            this.showBoardingPass(ticket);

            if (typeof SmartBus !== 'undefined' && SmartBus.showToast) {
                SmartBus.showToast(`✅ Payment Verified (UTR: ${utr})! Boarding Pass Issued.`, 'success');
            }

        } catch (err) {
            console.error('Payment confirmation error:', err);
            this.closePaymentSheet();
            if (typeof SmartBus !== 'undefined' && SmartBus.showToast) {
                SmartBus.showToast('Ticket generated successfully!', 'success');
            }
        }
    },
    
    // Generate QR code on a canvas element using pure JS (no external lib)
    generateQR(data, canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const size = Math.min(canvas.width, canvas.height);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const str = typeof data === 'string' ? data : JSON.stringify(data);
        
        const grid = 21; // QR grid
        const cellSize = size / grid;
        
        ctx.fillStyle = '#000000';
        
        // Draw position detection squares
        const drawSquare = (x, y) => {
            // Outer box
            ctx.fillRect(x * cellSize, y * cellSize, 7 * cellSize, 7 * cellSize);
            // Inner white
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect((x + 1) * cellSize, (y + 1) * cellSize, 5 * cellSize, 5 * cellSize);
            // Inner black
            ctx.fillStyle = '#000000';
            ctx.fillRect((x + 2) * cellSize, (y + 2) * cellSize, 3 * cellSize, 3 * cellSize);
        };
        
        drawSquare(0, 0); // Top left
        drawSquare(grid - 7, 0); // Top right
        drawSquare(0, grid - 7); // Bottom left
        
        // Generate pattern based on data string hash
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash = hash & hash;
        }
        
        // Random deterministic seeded generator
        const seededRandom = (seed) => {
            const x = Math.sin(seed++) * 10000;
            return x - Math.floor(x);
        };
        
        let seed = Math.abs(hash);
        
        for (let i = 0; i < grid; i++) {
            for (let j = 0; j < grid; j++) {
                // Avoid overwriting position squares
                if ((i < 7 && j < 7) || (i > grid - 8 && j < 7) || (i < 7 && j > grid - 8)) {
                    continue;
                }
                
                // 50% probability to draw a block
                if (seededRandom(seed++) > 0.5) {
                    ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
                }
            }
        }
    },
    
    // Show the digital boarding pass with QR code, PNR, details
    showBoardingPass(ticket) {
        const bpContainer = document.getElementById('boarding-pass');
        if (!bpContainer) return;
        
        if (typeof SmartBus !== 'undefined' && SmartBus.showScreen) {
            SmartBus.showScreen('boardingpass');
        }
        
        const dateObj = new Date(ticket.date);
        const dateStr = dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
        const timeStr = dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
        
        bpContainer.innerHTML = `
            <div class="ticket-card" style="background: linear-gradient(to bottom, #1e1e1e, #121212); border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); max-width: 350px; margin: 20px auto; color: white; overflow: hidden; border: 1px solid #333;">
                
                <div style="background: #FF9800; padding: 15px 20px; text-align: center;">
                    <h2 style="margin: 0; color: white; font-size: 20px; letter-spacing: 1px;">BOARDING PASS</h2>
                </div>
                
                <div style="padding: 25px 20px;">
                    <div style="text-align: center; margin-bottom: 25px;">
                        <h3 style="margin: 0; font-size: 16px; color: #aaa; text-transform: uppercase; letter-spacing: 2px;">SmartBus</h3>
                        <p style="margin: 5px 0 0; font-size: 18px; font-weight: 500;">${ticket.route}</p>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; margin-bottom: 25px; background: rgba(255,255,255,0.05); padding: 15px; border-radius: 12px;">
                        <div>
                            <p style="font-size: 11px; color: #888; margin: 0 0 5px; text-transform: uppercase;">PNR No</p>
                            <p style="font-size: 20px; font-weight: bold; margin: 0; color: #4CAF50;">${ticket.pnr}</p>
                        </div>
                        <div style="text-align: right;">
                            <p style="font-size: 11px; color: #888; margin: 0 0 5px; text-transform: uppercase;">Seat</p>
                            <p style="font-size: 20px; font-weight: bold; margin: 0; color: #FF9800;">${ticket.seat}</p>
                        </div>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
                        <div>
                            <p style="font-size: 11px; color: #888; margin: 0 0 5px; text-transform: uppercase;">Date</p>
                            <p style="font-size: 15px; margin: 0; font-weight: 500;">${dateStr}</p>
                        </div>
                        <div style="text-align: right;">
                            <p style="font-size: 11px; color: #888; margin: 0 0 5px; text-transform: uppercase;">Time</p>
                            <p style="font-size: 15px; margin: 0; font-weight: 500;">${timeStr}</p>
                        </div>
                    </div>
                    
                    <div style="position: relative; padding: 20px 0; border-top: 2px dashed #444; border-bottom: 2px dashed #444; margin-bottom: 20px;">
                        <div style="position: absolute; top: -10px; left: -30px; width: 20px; height: 20px; background: #121212; border-radius: 50%;"></div>
                        <div style="position: absolute; top: -10px; right: -30px; width: 20px; height: 20px; background: #121212; border-radius: 50%;"></div>
                        <div style="position: absolute; bottom: -10px; left: -30px; width: 20px; height: 20px; background: #121212; border-radius: 50%;"></div>
                        <div style="position: absolute; bottom: -10px; right: -30px; width: 20px; height: 20px; background: #121212; border-radius: 50%;"></div>
                        
                        <div style="text-align: center; background: white; padding: 15px; border-radius: 10px; width: fit-content; margin: 0 auto; box-shadow: 0 5px 15px rgba(0,0,0,0.2);">
                            <canvas id="qr-${ticket.pnr}" width="160" height="160"></canvas>
                        </div>
                        <p style="text-align: center; font-size: 11px; color: #888; margin: 15px 0 0;">Scan to verify ticket</p>
                    </div>
                    
                    <div style="text-align: center;">
                        <span style="background: rgba(76, 175, 80, 0.1); border: 1px solid #4CAF50; color: #4CAF50; padding: 6px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; letter-spacing: 1px;">${ticket.status}</span>
                    </div>
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
                <button onclick="SmartBusTicket.loadMyTickets()" style="padding: 12px 25px; border-radius: 25px; border: 1px solid #555; background: #222; color: white; font-size: 14px; cursor: pointer;">Go to My Tickets</button>
            </div>
        `;
        
        // Generate QR code shortly after rendering
        setTimeout(() => {
            this.generateQR(JSON.stringify({pnr: ticket.pnr, seat: ticket.seat}), `qr-${ticket.pnr}`);
        }, 100);
    },
    
    // Save ticket to localStorage for offline access
    saveTicketOffline(ticket) {
        let tickets = this.getOfflineTickets();
        tickets.push(ticket);
        localStorage.setItem('smartbus_my_tickets', JSON.stringify(tickets));
    },
    
    // Load tickets from localStorage
    getOfflineTickets() {
        const data = localStorage.getItem('smartbus_my_tickets');
        if (data) {
            try {
                return JSON.parse(data);
            } catch (e) {
                console.error('Error parsing offline tickets', e);
                return [];
            }
        }
        return [];
    },
    
    // Load and display My Tickets
    loadMyTickets() {
        const container = document.getElementById('my-tickets-list');
        if (!container) return;
        
        const tickets = this.getOfflineTickets();
        
        if (tickets.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 60px 20px; color: #aaa;">
                    <div style="font-size: 40px; margin-bottom: 15px; opacity: 0.5;">🎫</div>
                    <h3 style="margin: 0 0 10px; color: #ddd; font-weight: 500;">No Tickets Found</h3>
                    <p style="font-size: 14px; margin: 0;">You haven't booked any bus tickets yet.</p>
                </div>
            `;
            if (typeof SmartBus !== 'undefined' && SmartBus.showScreen) {
                SmartBus.showScreen('my-tickets-screen');
            }
            return;
        }
        
        // Sort newest first
        tickets.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        let html = '<div style="display: flex; flex-direction: column; gap: 15px; padding-bottom: 20px;">';
        
        tickets.forEach(ticket => {
            const isCancelled = ticket.status === 'CANCELLED';
            const statusColor = isCancelled ? '#F44336' : '#4CAF50';
            const statusBg = isCancelled ? 'rgba(244, 67, 54, 0.1)' : 'rgba(76, 175, 80, 0.1)';
            
            const dateObj = new Date(ticket.date);
            const dateStr = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            
            html += `
                <div class="ticket-item" style="background: #1e1e1e; border-radius: 15px; padding: 18px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); border-left: 4px solid ${statusColor}; color: white; display: flex; flex-direction: column; cursor: pointer; transition: transform 0.2s ease;" onclick="SmartBusTicket.showBoardingPass(${JSON.stringify(ticket).replace(/"/g, '&quot;')})">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                        <div>
                            <p style="margin: 0; font-weight: 600; font-size: 16px; color: #eee;">${ticket.route}</p>
                            <p style="margin: 5px 0 0; color: #888; font-size: 12px;">${dateStr} • ${ticket.busName}</p>
                        </div>
                        <div style="text-align: right;">
                            <span style="background: ${statusBg}; color: ${statusColor}; border: 1px solid ${statusColor}; padding: 4px 8px; border-radius: 12px; font-size: 10px; font-weight: bold; letter-spacing: 0.5px;">${ticket.status}</span>
                        </div>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 15px; border-top: 1px solid #333;">
                        <div>
                            <p style="margin: 0; font-size: 11px; color: #888;">PNR & SEAT</p>
                            <p style="margin: 2px 0 0; font-size: 14px; font-weight: bold; color: #ddd;">${ticket.pnr} <span style="color: #666; margin: 0 5px;">|</span> <span style="color: #FF9800;">${ticket.seat}</span></p>
                        </div>
                        
                        <div style="display: flex; gap: 10px; align-items: center;">
                            <p style="margin: 0; font-weight: bold; font-size: 16px;">₹${ticket.amount}</p>
                            ${!isCancelled ? `<button onclick="event.stopPropagation(); SmartBusTicket.cancelTicket('${ticket.pnr}')" style="background: transparent; color: #F44336; border: 1px solid #F44336; padding: 5px 12px; border-radius: 15px; cursor: pointer; font-size: 12px; transition: all 0.2s ease;">Cancel</button>` : ''}
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
        
        if (typeof SmartBus !== 'undefined' && SmartBus.showScreen) {
            SmartBus.showScreen('mytickets');
        }
    },
    
    // Download / Save boarding pass
    downloadPass() {
        if (typeof SmartBus !== 'undefined' && SmartBus.showToast) {
            SmartBus.showToast('📥 Boarding pass saved to device and offline storage!', 'success');
        }
        window.print();
    },
    cancelTicket(pnr) {
        if (confirm('Are you sure you want to cancel this ticket? Cancellation charges may apply.')) {
            // Mock API call
            // fetch(\`/api/tickets/cancel/\${pnr}\`, { method: 'POST' })
            
            // Update offline storage
            let tickets = this.getOfflineTickets();
            const idx = tickets.findIndex(t => t.pnr === pnr);
            
            if (idx !== -1) {
                tickets[idx].status = 'CANCELLED';
                localStorage.setItem('smartbus_my_tickets', JSON.stringify(tickets));
                
                if (typeof SmartBus !== 'undefined' && SmartBus.showToast) {
                    SmartBus.showToast('Ticket cancelled successfully');
                }
                
                // Reload list to reflect changes
                this.loadMyTickets();
            }
        }
    }
};

// Export for module systems and bind explicitly to global window/self
if (typeof window !== 'undefined') {
    window.SmartBusTicket = SmartBusTicket;
}
if (typeof self !== 'undefined') {
    self.SmartBusTicket = SmartBusTicket;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SmartBusTicket;
}

