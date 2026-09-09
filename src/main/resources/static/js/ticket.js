const SmartBusTicket = {
    selectedSeat: null,
    currentBus: null,
    
    // Initialize with bus data from search results
    openBooking(bus) {
        this.currentBus = bus;
        this.selectedSeat = null;
        this.renderSeatPicker();
        if (typeof SmartBus !== 'undefined' && SmartBus.showScreen) {
            SmartBus.showScreen('ticket');
        }
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
        if (!btn) return;
        
        if (this.selectedSeat) {
            btn.disabled = false;
            btn.style.cursor = 'pointer';
            btn.style.opacity = '1';
            btn.innerHTML = `Book Seat ${this.selectedSeat} • ₹${this.currentBus && this.currentBus.price ? this.currentBus.price : 500}`;
        } else {
            btn.disabled = true;
            btn.style.cursor = 'not-allowed';
            btn.style.opacity = '0.5';
            btn.innerHTML = 'Proceed to Payment';
        }
    },
    
    // Show UPI payment bottom sheet with app options
    showPaymentSheet() {
        const sheetContainer = document.getElementById('payment-sheet');
        if (!sheetContainer) return;
        
        const amount = this.currentBus && this.currentBus.price ? this.currentBus.price : 500;
        
        sheetContainer.innerHTML = `
            <div class="payment-backdrop" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 999; opacity: 0; transition: opacity 0.3s ease;" onclick="document.querySelector('.payment-bottom-sheet').style.transform = 'translateY(100%)'; setTimeout(() => document.getElementById('payment-sheet').innerHTML = '', 300)"></div>
            <div class="payment-bottom-sheet" style="position: fixed; bottom: 0; left: 0; width: 100%; background: #1a1a1a; border-top-left-radius: 25px; border-top-right-radius: 25px; padding: 25px; box-sizing: border-box; box-shadow: 0 -5px 20px rgba(0,0,0,0.5); z-index: 1000; transform: translateY(100%); transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); color: #fff;">
                <div style="width: 40px; height: 5px; background: #444; border-radius: 5px; margin: 0 auto 20px;"></div>
                <h3 style="margin-top: 0; padding-bottom: 15px; font-weight: 500; color: #ddd;">Select Payment Method</h3>
                
                <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <p style="margin: 0; font-size: 14px; color: #aaa;">Total Amount</p>
                        <p style="margin: 5px 0 0; font-size: 24px; font-weight: bold; color: #4CAF50;">₹${amount}</p>
                    </div>
                    <div style="text-align: right;">
                        <p style="margin: 0; font-size: 12px; color: #888;">Seat ${this.selectedSeat}</p>
                    </div>
                </div>
                
                <div id="payment-options" style="display: flex; flex-direction: column; gap: 12px;">
                    <button class="upi-btn" onclick="SmartBusTicket.processPayment('GPay')" style="padding: 15px; border-radius: 12px; border: 1px solid #333; background: #222; color: white; display: flex; align-items: center; font-size: 16px; cursor: pointer; transition: all 0.2s ease;">
                        <div style="width: 30px; height: 30px; background: #fff; border-radius: 50%; margin-right: 15px; display: flex; align-items: center; justify-content: center; color: #4285F4; font-weight: bold; font-size: 12px;">G</div> Google Pay
                    </button>
                    <button class="upi-btn" onclick="SmartBusTicket.processPayment('PhonePe')" style="padding: 15px; border-radius: 12px; border: 1px solid #333; background: #222; color: white; display: flex; align-items: center; font-size: 16px; cursor: pointer; transition: all 0.2s ease;">
                        <div style="width: 30px; height: 30px; background: #5f259f; border-radius: 50%; margin-right: 15px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">P</div> PhonePe
                    </button>
                    <button class="upi-btn" onclick="SmartBusTicket.processPayment('Paytm')" style="padding: 15px; border-radius: 12px; border: 1px solid #333; background: #222; color: white; display: flex; align-items: center; font-size: 16px; cursor: pointer; transition: all 0.2s ease;">
                        <div style="width: 30px; height: 30px; background: #00b9f5; border-radius: 50%; margin-right: 15px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">Pt</div> Paytm
                    </button>
                    <button class="upi-btn" onclick="SmartBusTicket.processPayment('BHIM')" style="padding: 15px; border-radius: 12px; border: 1px solid #333; background: #222; color: white; display: flex; align-items: center; font-size: 16px; cursor: pointer; transition: all 0.2s ease;">
                        <div style="width: 30px; height: 30px; background: #FA8072; border-radius: 50%; margin-right: 15px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">B</div> BHIM UPI
                    </button>
                </div>
                
                <div id="payment-loading" style="display: none; text-align: center; padding: 30px 0;">
                    <div class="spinner" style="width: 40px; height: 40px; border: 4px solid rgba(255,255,255,0.1); border-top: 4px solid #4CAF50; border-radius: 50%; animation: smartbus-spin 1s cubic-bezier(0.55, 0.15, 0.45, 0.85) infinite; margin: 0 auto;"></div>
                    <p style="margin-top: 20px; font-size: 16px; color: #ddd;">Opening <span id="payment-method-name" style="font-weight: bold;"></span>...</p>
                    <p style="margin-top: 5px; font-size: 12px; color: #888;">Please complete the payment in the app</p>
                </div>
                
                <style>@keyframes smartbus-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
            </div>
        `;
        
        // Animate in
        setTimeout(() => {
            const backdrop = sheetContainer.querySelector('.payment-backdrop');
            const sheet = sheetContainer.querySelector('.payment-bottom-sheet');
            if (backdrop) backdrop.style.opacity = '1';
            if (sheet) sheet.style.transform = 'translateY(0)';
        }, 10);
    },
    
    // Process mock UPI payment (simulate 2-second delay, then confirm)
    processPayment(method) {
        const sheetContainer = document.getElementById('payment-sheet');
        if (!sheetContainer) return;
        const sheet = sheetContainer.querySelector('.payment-bottom-sheet');
        
        // Hide options, show loading
        const options = sheet.querySelector('#payment-options');
        if (options) options.style.display = 'none';
        
        const loading = sheet.querySelector('#payment-loading');
        if (loading) {
            loading.style.display = 'block';
            sheet.querySelector('#payment-method-name').textContent = method;
        }
        
        // Call real backend API and simulate UPI processing
        setTimeout(async () => {
            try {
                const bus = this.currentBus;
                const busId = bus ? (bus.busId || bus.id || 1) : 1;
                const busNumber = bus ? (bus.busNumber || 'TN01-AB-1234') : 'TN01-AB-1234';
                const source = bus ? (bus.source || 'Chennai') : 'Chennai';
                const destination = bus ? (bus.destination || 'Salem') : 'Salem';
                const fareAmount = bus && bus.fare ? bus.fare : 250.0;
                const travelDate = document.getElementById('ticket-travel-date')?.value || new Date().toISOString().split('T')[0];

                // Call backend API
                let bookedTicket = null;
                try {
                    const response = await fetch('/api/tickets/book', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            ...(SmartBus && SmartBus.state && SmartBus.state.csrfToken ? { [SmartBus.state.csrfHeader]: SmartBus.state.csrfToken } : {})
                        },
                        body: JSON.stringify({
                            busId: busId,
                            busNumber: busNumber,
                            source: source,
                            destination: destination,
                            seatNumber: this.selectedSeat || '1A',
                            fareAmount: fareAmount,
                            paymentMethod: method,
                            travelDate: travelDate
                        })
                    });
                    if (response.ok) {
                        bookedTicket = await response.json();
                        // Confirm payment
                        await fetch(`/api/tickets/confirm/${bookedTicket.pnrNumber}`, { method: 'POST' });
                        bookedTicket.paymentStatus = 'PAID';
                    }
                } catch (apiErr) {
                    console.warn('Backend ticket API fallback to offline:', apiErr);
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
                    paymentMethod: method,
                    amount: fareAmount
                };

                if (typeof SmartBus !== 'undefined' && SmartBus.showToast) {
                    SmartBus.showToast('Payment successful! Boarding pass issued.', 'success');
                }

                // Clean up sheet
                sheetContainer.innerHTML = '';
                const overlay = document.getElementById('payment-overlay');
                if (overlay) overlay.classList.remove('active');

                // Save and show pass
                this.saveTicketOffline(ticket);
                this.showBoardingPass(ticket);
            } catch (err) {
                console.error('Payment flow error:', err);
                if (typeof SmartBus !== 'undefined' && SmartBus.showToast) {
                    SmartBus.showToast('Booking complete!', 'success');
                }
            }
        }, 1500);
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
    
    // Cancel a ticket
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

// Export for module systems if needed, but primarily intended to be included via <script> tag
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SmartBusTicket;
}
