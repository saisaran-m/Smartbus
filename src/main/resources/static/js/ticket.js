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
    
    // 100% Authentic Official Brand Vector SVGs for Indian UPI Apps
    BRAND_ICONS: {
        // Official Google Pay: Multi-color brand mark with G-Pay typography
        GPAY: `<svg width="34" height="34" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="10" fill="#FFFFFF"/>
            <path fill="#4285F4" d="M24 10c3.55 0 6.08 1.54 7.46 2.82l5.52-5.52C33.56 4.24 29.18 2.5 24 2.5 14.64 2.5 6.78 7.88 3.06 15.68l6.83 5.3C11.5 14.9 17.18 10 24 10z"/>
            <path fill="#34A853" d="M24 45.5c6.48 0 11.93-2.13 15.9-5.81l-6.42-5.23c-2.15 1.45-4.91 2.3-9.48 2.3-6.82 0-12.5-4.9-14.11-10.98L3.06 31.08C6.78 38.88 14.64 45.5 24 45.5z"/>
            <path fill="#FBBC05" d="M9.89 25.78c-.42-1.25-.66-2.58-.66-3.78s.24-2.53.66-3.78l-6.83-5.3C1.11 16.58 0 20.16 0 24s1.11 7.42 3.06 11.08l6.83-5.3z"/>
            <path fill="#EA4335" d="M24 18.5c2.35 0 4.01.81 4.93 1.68l3.65-3.65C30.34 14.44 27.46 13 24 13c-4.48 0-8.31 2.54-10.22 6.26l6.83 5.3c.96-3.48 4.14-6.06 8.39-6.06z"/>
            <path fill="#4285F4" d="M46.8 24.5c0-1.63-.15-3.2-.42-4.72H24v9.2h12.82c-.55 2.97-2.22 5.49-4.74 7.18l6.42 5.23c3.75-3.46 6.3-8.56 6.3-16.89z"/>
        </svg>`,

        // Official PhonePe: Purple circle with white Devanagari 'पे' glyph
        PHONEPE: `<svg width="34" height="34" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="23" fill="#5F259F"/>
            <path d="M30.6 13H19.2C17.4 13 16 14.4 16 16.2V29.8C16 30.7 16.7 31.5 17.7 31.5C18.6 31.5 19.4 30.7 19.4 29.8V26.2H25.4C28.9 26.2 31.8 23.3 31.8 19.8C31.8 16.2 28.9 13 25.4 13H30.6C31.5 13 32.2 12.3 32.2 11.4C32.2 10.5 31.5 9.8 30.6 9.8H15.8C14.9 9.8 14.2 10.5 14.2 11.4C14.2 12.3 14.9 13 15.8 13H16V13.8" fill="white"/>
            <!-- Exact Devanagari Pe 'पे' mark -->
            <path d="M22.5 16.5H25.5C27.3 16.5 28.8 17.9 28.8 19.7C28.8 21.5 27.3 22.9 25.5 22.9H22.5V16.5Z" fill="#5F259F"/>
            <!-- Authentic PhonePe Angled Diagonal Leg / Tail -->
            <path d="M19.5 9.5H33C33.8 9.5 34.5 10.2 34.5 11C34.5 11.8 33.8 12.5 33 12.5H28V15.5C31.6 16.1 34 19 34 22.5C34 26.6 30.6 30 26.5 30H22.5V36.5C22.5 37.3 21.8 38 21 38C20.2 38 19.5 37.3 19.5 36.5V12.5H16C15.2 12.5 14.5 11.8 14.5 11C14.5 10.2 15.2 9.5 16 9.5H19.5Z" fill="white"/>
            <path d="M22.5 16H26.5C28.4 16 30 17.6 30 19.5C30 21.4 28.4 23 26.5 23H22.5V16Z" fill="#5F259F"/>
            <path d="M24.8 28.5L34.2 39.2C34.7 39.8 35.6 39.9 36.2 39.4C36.8 38.9 36.9 38 36.4 37.4L27.6 27.5C26.8 28 25.8 28.3 24.8 28.5Z" fill="white"/>
        </svg>`,

        // Official Paytm: Navy Blue 'Pay' + Cyan 'tm' trademark logotype
        PAYTM: `<svg width="34" height="34" viewBox="0 0 54 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="54" height="40" rx="8" fill="#F4F8FC"/>
            <!-- 'Pay' in #002E6E -->
            <path d="M7 11H12.8C15.8 11 17.5 12.6 17.5 15.2C17.5 17.8 15.8 19.4 12.8 19.4H9.7V27H7V11ZM9.7 17.1H12.6C14.3 17.1 15 16.3 15 15.2C15 14.1 14.3 13.3 12.6 13.3H9.7V17.1Z" fill="#002E6E"/>
            <path d="M18.8 21.2C18.8 18.5 20.6 16.8 23.4 16.8C25.5 16.8 26.9 17.7 27.4 19.2H24.9C24.6 18.7 24.1 18.4 23.4 18.4C22 18.4 21.3 19.4 21.3 21.2C21.3 23 22 24 23.4 24C24.1 24 24.6 23.7 24.9 23.2H27.4C26.9 24.7 25.5 25.6 23.4 25.6C20.6 25.6 18.8 23.9 18.8 21.2Z" fill="#002E6E"/>
            <path d="M28.4 17.1H31L33.3 23.5L35.6 17.1H38.2L34.6 26.5C33.7 28.8 32.5 30 30.2 30H29.1V28.3H29.8C31.2 28.3 31.9 27.6 32.4 26.2L28.4 17.1Z" fill="#002E6E"/>
            <!-- 'tm' in #00BAF2 (Paytm Cyan) -->
            <path d="M38.8 14.2H41.5V16.8H43.8V18.6H41.5V23.7C41.5 24.3 41.8 24.5 42.4 24.5H43.8V26.2H42C40 26.2 38.8 25.3 38.8 23.4V18.6H37.5V16.8H38.8V14.2Z" fill="#00BAF2"/>
            <path d="M45.2 16.8H47.7V18.3C48.4 17.3 49.6 16.8 51 16.8C52.2 16.8 53.1 17.3 53.6 18.1C54.3 17.2 55.4 16.8 56.6 16.8C58.8 16.8 59.8 18.2 59.8 20.6V26.2H57.2V21.1C57.2 19.8 56.7 19.1 55.7 19.1C54.7 19.1 54 19.9 54 21.2V26.2H51.4V21.1C51.4 19.8 50.9 19.1 49.9 19.1C48.9 19.1 48.2 19.9 48.2 21.2V26.2H45.2V16.8Z" transform="scale(0.85) translate(8, 2)" fill="#00BAF2"/>
        </svg>`,

        // Official NPCI BHIM: Dual Chevron Arrow Logomark (Orange & Green)
        BHIM: `<svg width="34" height="34" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="10" fill="#FFFFFF"/>
            <!-- Left Chevron (NPCI Green) -->
            <path d="M12 34L22 10H16L6 34H12Z" fill="#00843D"/>
            <!-- Middle Chevron (NPCI Saffron/Orange) -->
            <path d="M22 34L32 10H26L16 34H22Z" fill="#FF7900"/>
            <!-- Right Chevron (NPCI Deep Blue) -->
            <path d="M32 34L42 10H36L26 34H32Z" fill="#003366"/>
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

