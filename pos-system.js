// Check if user is logged in
let currentUser = JSON.parse(localStorage.getItem('currentUser'));
if (!currentUser) {
    alert('Please login first!');
    window.location.href = 'index.html';
}

// Display admin name
document.getElementById('adminName').textContent = currentUser.username;

// Load products from localStorage
let products = JSON.parse(localStorage.getItem('products')) || [];
let cart = [];
let allProducts = [...products];

// Load products on page load
loadProducts(products);

function loadProducts(productsToShow) {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = '';
    
    if (productsToShow.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999; padding: 40px;">No products found</p>';
        return;
    }
    
    productsToShow.forEach(product => {
        // Calculate available stock (total stock - cart quantity)
        const cartItem = cart.find(item => item.id === product.id);
        const cartQuantity = cartItem ? cartItem.quantity : 0;
        const availableStock = product.stock - cartQuantity;
        
        const card = document.createElement('div');
        card.className = 'product-card';
        
        // Disable if no stock available
        if (availableStock <= 0) {
            card.style.opacity = '0.5';
            card.style.cursor = 'not-allowed';
        }
        
        // Stock color: Red if low (<=5), Green if good
        const stockColor = availableStock <= 0 ? '#dc3545' : availableStock <= 5 ? '#ff6b6b' : '#28a745';
        
        // Show product image if available
        const productImage = product.image 
            ? `<img src="${product.image}" alt="${product.name}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 10px;">`
            : `<div class="product-icon">${product.icon}</div>`;
        
        card.innerHTML = `
            ${productImage}
            <h4>${product.name}</h4>
            <div class="category">${product.category}</div>
            <div class="price">Rs. ${product.price.toLocaleString()}</div>
            <div class="stock" style="color: ${stockColor}; font-weight: 600;">
                Available: ${availableStock}
            </div>
        `;
        
        // Add click to add to cart (if stock available)
        if (availableStock > 0) {
            card.style.cursor = 'pointer';
            card.onclick = () => addToCart(product);
        }
        
        grid.appendChild(card);
    });
}

function searchProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    
    let filtered = allProducts.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm) || 
                            p.category.toLowerCase().includes(searchTerm);
        const matchesCategory = category === 'all' || p.category === category;
        return matchesSearch && matchesCategory;
    });
    
    loadProducts(filtered);
}

function filterByCategory() {
    searchProducts();
}

function addToCart(product) {
    // Get current cart quantity for this product
    const cartItem = cart.find(item => item.id === product.id);
    const cartQuantity = cartItem ? cartItem.quantity : 0;
    
    // Check available stock
    if (product.stock - cartQuantity <= 0) {
        alert('❌ Product out of stock!');
        return;
    }
    
    if (cartItem) {
        if (cartItem.quantity >= product.stock) {
            alert('❌ Cannot add more than available stock!');
            return;
        }
        cartItem.quantity++;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    updateCart();
    updateProductDisplay();
}

function updateCart() {
    const cartItemsDiv = document.getElementById('cartItems');
    
    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<p class="empty-cart">No items in cart</p>';
        updateSummary();
        return;
    }
    
    cartItemsDiv.innerHTML = '';
    
    cart.forEach((item, index) => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        
        cartItem.innerHTML = `
            <div class="cart-item-info">
                <h4>${item.icon} ${item.name}</h4>
                <div class="item-price">Rs. ${item.price.toLocaleString()} × ${item.quantity} = Rs. ${(item.price * item.quantity).toLocaleString()}</div>
            </div>
            <div class="cart-item-controls">
                <button class="qty-btn" onclick="decreaseQuantity(${index})">−</button>
                <span class="qty-display">${item.quantity}</span>
                <button class="qty-btn" onclick="increaseQuantity(${index})">+</button>
                <button class="remove-btn" onclick="removeFromCart(${index})">🗑️</button>
            </div>
        `;
        
        cartItemsDiv.appendChild(cartItem);
    });
    
    updateSummary();
}

function increaseQuantity(index) {
    const item = cart[index];
    const product = products.find(p => p.id === item.id);
    
    if (item.quantity >= product.stock) {
        alert('❌ Cannot add more than available stock!');
        return;
    }
    
    cart[index].quantity++;
    updateCart();
    updateProductDisplay();
}

function decreaseQuantity(index) {
    if (cart[index].quantity > 1) {
        cart[index].quantity--;
        updateCart();
        updateProductDisplay();
    } else {
        removeFromCart(index);
    }
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
    updateProductDisplay();
}

function updateProductDisplay() {
    // Reload products to show updated available stock
    loadProducts(allProducts);
    // Check for low stock
    checkLowStock();
}

function updateSummary() {
    const printerSettings = JSON.parse(localStorage.getItem('printerSettings')) || {};
    const currency = printerSettings.currency || 'Rs.';
    const taxPercentage = printerSettings.taxPercentage || 0;
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = (subtotal * taxPercentage) / 100;
    const total = subtotal + tax;
    
    document.getElementById('subtotal').textContent = `${currency} ${subtotal.toLocaleString()}`;
    document.getElementById('tax').textContent = `${currency} ${tax.toLocaleString()} (${taxPercentage}%)`;
    document.getElementById('total').textContent = `${currency} ${total.toLocaleString()}`;
    
    calculateChange();
}

function calculateChange() {
    const printerSettings = JSON.parse(localStorage.getItem('printerSettings')) || {};
    const currency = printerSettings.currency || 'Rs.';
    const taxPercentage = printerSettings.taxPercentage || 0;
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = (subtotal * taxPercentage) / 100;
    const total = subtotal + tax;
    const paid = parseFloat(document.getElementById('customerPaid').value) || 0;
    const change = paid - total;
    
    const changeElement = document.getElementById('change');
    if (change >= 0) {
        changeElement.textContent = `${currency} ${change.toLocaleString()}`;
        changeElement.style.color = '#28a745';
    } else {
        changeElement.textContent = `${currency} ${Math.abs(change).toLocaleString()} (Short)`;
        changeElement.style.color = '#dc3545';
    }
}

let selectedClient = null;
let currentSaleData = null;

function checkout() {
    if (cart.length === 0) {
        alert('❌ Cart is empty!');
        return;
    }
    
    const printerSettings = JSON.parse(localStorage.getItem('printerSettings')) || {};
    const taxPercentage = printerSettings.taxPercentage || 0;
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = (subtotal * taxPercentage) / 100;
    const total = subtotal + tax;
    
    // Customer paid is optional - if empty or less than total, assume exact payment
    let paid = parseFloat(document.getElementById('customerPaid').value) || 0;
    if (paid === 0 || paid < total) {
        paid = total; // Assume exact payment if not entered or less than total
    }
    
    // Store sale data for later use
    currentSaleData = {
        cart: [...cart],
        subtotal,
        tax,
        total,
        paid,
        change: paid - total
    };
    
    // Show payment method modal
    showPaymentModal();
}

function showPaymentModal() {
    document.getElementById('paymentModal').classList.add('active');
    document.getElementById('creditSection').style.display = 'none';
    selectedClient = null;
}

function closePaymentModal() {
    document.getElementById('paymentModal').classList.remove('active');
}

function selectPaymentMethod(method) {
    if (method === 'cash') {
        // Process cash payment
        processCashPayment();
    } else if (method === 'credit') {
        // Show credit section
        document.getElementById('creditSection').style.display = 'block';
        loadClients();
    }
}

function processCashPayment() {
    closePaymentModal();
    completeSale('cash', null);
}

function completeSale(paymentMethod, clientId) {
    const printerSettings = JSON.parse(localStorage.getItem('printerSettings')) || {};
    const autoPrint = printerSettings.autoPrint !== false;
    
    // Update stock
    currentSaleData.cart.forEach(cartItem => {
        const product = products.find(p => p.id === cartItem.id);
        if (product) {
            product.stock -= cartItem.quantity;
        }
    });
    
    // Save updated products to localStorage
    localStorage.setItem('products', JSON.stringify(products));
    
    // Save transaction
    saveTransaction(paymentMethod, clientId);
    
    // If credit sale, update client balance
    if (paymentMethod === 'credit' && clientId !== null) {
        updateClientBalance(clientId, currentSaleData.total);
    }
    
    alert('✅ Checkout successful!');
    
    // Auto print if enabled
    if (autoPrint) {
        printReceipt();
    }
    
    // Clear cart
    setTimeout(() => {
        clearCart();
    }, 1000);
}

function saveTransaction(paymentMethod, clientId) {
    const printerSettings = JSON.parse(localStorage.getItem('printerSettings')) || {};
    const currency = printerSettings.currency || 'Rs.';
    const receiptNumber = 'R' + Date.now().toString().slice(-8);
    
    const transaction = {
        id: Date.now(),
        receiptNumber: receiptNumber,
        date: new Date().toISOString(),
        items: currentSaleData.cart.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            total: item.price * item.quantity
        })),
        subtotal: currentSaleData.subtotal,
        tax: currentSaleData.tax,
        total: currentSaleData.total,
        paid: currentSaleData.paid,
        change: currentSaleData.change,
        paymentMethod: paymentMethod,
        clientId: clientId,
        admin: currentUser.username
    };
    
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    
    // Store receipt number for current sale
    currentSaleData.receiptNumber = receiptNumber;
    
    // Add to superadmin activity log
    const paymentText = paymentMethod === 'cash' ? 'Cash' : 'Credit';
    addToActivityLog({
        type: 'sale',
        text: `${paymentText} sale by ${currentUser.username} - ${currency} ${transaction.total.toLocaleString()}`,
        details: `Receipt #${receiptNumber} - ${transaction.items.length} items sold`,
        amount: transaction.total,
        receiptNumber: receiptNumber,
        admin: currentUser.username,
        timestamp: new Date().toISOString()
    });
}

function printReceipt() {
    if (cart.length === 0) {
        alert('❌ Cart is empty!');
        return;
    }
    
    const printerSettings = JSON.parse(localStorage.getItem('printerSettings')) || {};
    const shopSettings = JSON.parse(localStorage.getItem('shopSettings')) || {};
    const currency = printerSettings.currency || 'Rs.';
    const taxPercentage = printerSettings.taxPercentage || 0;
    const showShopInfo = printerSettings.showShopInfo !== false;
    
    const now = new Date();
    const receiptNumber = 'R' + Date.now().toString().slice(-8);
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = (subtotal * taxPercentage) / 100;
    const total = subtotal + tax;
    const paid = parseFloat(document.getElementById('customerPaid').value) || 0;
    const change = paid - total;
    
    // Create receipt content with proper formatting
    let receiptHTML = `
        <html>
        <head>
            <style>
                body {
                    font-family: 'Courier New', monospace;
                    width: 300px;
                    margin: 0 auto;
                    padding: 10px;
                    font-size: 12px;
                }
                .shop-name {
                    text-align: center;
                    font-size: 18px;
                    font-weight: bold;
                    margin: 5px 0;
                }
                .shop-details {
                    text-align: center;
                    font-size: 9px;
                    margin: 2px 0;
                    line-height: 1.2;
                }
                .header-row {
                    display: flex;
                    justify-content: space-between;
                    margin: 5px 0;
                    font-size: 10px;
                }
                .receipt-number {
                    text-align: center;
                    font-size: 14px;
                    font-weight: bold;
                    margin: 8px 0;
                }
                .divider {
                    border-top: 1px dashed #000;
                    margin: 8px 0;
                }
                .items-table {
                    width: 100%;
                    margin: 5px 0;
                }
                .items-table td {
                    padding: 2px 0;
                    font-size: 11px;
                }
                .item-name {
                    width: 45%;
                }
                .item-qty {
                    width: 15%;
                    text-align: center;
                }
                .item-price {
                    width: 20%;
                    text-align: right;
                }
                .item-total {
                    width: 20%;
                    text-align: right;
                }
                .total-row {
                    text-align: right;
                    margin: 3px 0;
                    font-size: 11px;
                }
                .grand-total {
                    text-align: right;
                    font-size: 14px;
                    font-weight: bold;
                    margin: 5px 0;
                    border-top: 2px solid #000;
                    padding-top: 5px;
                }
                .footer {
                    text-align: center;
                    margin-top: 10px;
                    font-size: 11px;
                }
            </style>
        </head>
        <body>
    `;
    
    // Shop name (center, bold)
    if (showShopInfo && shopSettings.shopName) {
        receiptHTML += `<div class="shop-name">${shopSettings.shopName.toUpperCase()}</div>`;
        
        // Address (very small, center)
        if (shopSettings.address) {
            receiptHTML += `<div class="shop-details">${shopSettings.address}</div>`;
        }
        
        // Mobile number (very small, center)
        if (shopSettings.contact) {
            receiptHTML += `<div class="shop-details">Tel: ${shopSettings.contact}</div>`;
        }
    } else {
        receiptHTML += `<div class="shop-name">POS SYSTEM</div>`;
    }
    
    receiptHTML += `<div class="divider"></div>`;
    
    // Date (left) and Time (right)
    receiptHTML += `
        <div class="header-row">
            <span>Date: ${now.toLocaleDateString()}</span>
            <span>Time: ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
    `;
    
    // Receipt number (center, slightly bigger)
    receiptHTML += `<div class="receipt-number">Receipt #${receiptNumber}</div>`;
    
    receiptHTML += `<div class="divider"></div>`;
    
    // Items table
    receiptHTML += `
        <table class="items-table">
            <thead>
                <tr style="border-bottom: 1px solid #000;">
                    <td class="item-name"><strong>Item</strong></td>
                    <td class="item-qty"><strong>Qty</strong></td>
                    <td class="item-price"><strong>Price</strong></td>
                    <td class="item-total"><strong>Total</strong></td>
                </tr>
            </thead>
            <tbody>
    `;
    
    cart.forEach(item => {
        receiptHTML += `
            <tr>
                <td class="item-name">${item.name}</td>
                <td class="item-qty">${item.quantity}</td>
                <td class="item-price">${currency} ${item.price.toLocaleString()}</td>
                <td class="item-total">${currency} ${(item.price * item.quantity).toLocaleString()}</td>
            </tr>
        `;
    });
    
    receiptHTML += `
            </tbody>
        </table>
        <div class="divider"></div>
    `;
    
    // Totals
    receiptHTML += `<div class="total-row">Subtotal: ${currency} ${subtotal.toLocaleString()}</div>`;
    
    if (taxPercentage > 0) {
        receiptHTML += `<div class="total-row">Tax (${taxPercentage}%): ${currency} ${tax.toLocaleString()}</div>`;
    }
    
    receiptHTML += `
        <div class="grand-total">TOTAL: ${currency} ${total.toLocaleString()}</div>
        <div class="total-row">Paid: ${currency} ${paid.toLocaleString()}</div>
        <div class="total-row">Change: ${currency} ${change.toLocaleString()}</div>
        <div class="divider"></div>
    `;
    
    // Footer message
    if (printerSettings.footer) {
        receiptHTML += `<div class="footer">${printerSettings.footer}</div>`;
    } else {
        receiptHTML += `<div class="footer">Thank you for your purchase!<br>Please visit again</div>`;
    }
    
    receiptHTML += `
        </body>
        </html>
    `;
    
    // Open print window
    const printWindow = window.open('', '', 'width=400,height=600');
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    
    // Auto print after a short delay
    setTimeout(() => {
        printWindow.print();
    }, 250);
}

function clearCart() {
    if (cart.length === 0) {
        alert('Cart is already empty!');
        return;
    }
    
    if (confirm('🗑️ Clear all items from cart?')) {
        cart = [];
        document.getElementById('customerPaid').value = '';
        updateCart();
        updateProductDisplay(); // Reload products to show updated stock
        alert('✅ Cart cleared!');
    }
}

// Add activity to superadmin log
function addToActivityLog(activity) {
    let activityLog = JSON.parse(localStorage.getItem('activityLog')) || [];
    activityLog.unshift(activity); // Add to beginning
    
    // Keep only last 100 activities
    if (activityLog.length > 100) {
        activityLog = activityLog.slice(0, 100);
    }
    
    localStorage.setItem('activityLog', JSON.stringify(activityLog));
}

// Client Management Functions
function loadClients() {
    const clients = JSON.parse(localStorage.getItem('clients')) || [];
    const clientsList = document.getElementById('clientsList');
    
    if (clients.length === 0) {
        clientsList.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">No clients found. Add a new client.</p>';
        return;
    }
    
    displayClients(clients);
}

function displayClients(clients) {
    const clientsList = document.getElementById('clientsList');
    clientsList.innerHTML = '';
    
    clients.forEach((client, index) => {
        const clientDiv = document.createElement('div');
        clientDiv.className = 'client-item';
        clientDiv.onclick = () => selectClient(index);
        
        const balance = client.balance || 0;
        const balanceColor = balance > 0 ? '#dc3545' : '#28a745';
        
        clientDiv.innerHTML = `
            <h4>${client.name}</h4>
            <p>📞 ${client.contact}</p>
            <p style="color: ${balanceColor}; font-weight: 600;">Balance: Rs. ${balance.toLocaleString()}</p>
        `;
        
        clientsList.appendChild(clientDiv);
    });
}

function searchClients() {
    const searchTerm = document.getElementById('clientSearch').value.toLowerCase();
    const clients = JSON.parse(localStorage.getItem('clients')) || [];
    
    const filtered = clients.filter(client => 
        client.name.toLowerCase().includes(searchTerm) || 
        client.contact.includes(searchTerm)
    );
    
    displayClients(filtered);
}

function selectClient(index) {
    const clients = JSON.parse(localStorage.getItem('clients')) || [];
    selectedClient = { ...clients[index], index };
    
    // Highlight selected client
    document.querySelectorAll('.client-item').forEach((item, i) => {
        if (i === index) {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    });
    
    // Show selected client info
    const balance = selectedClient.balance || 0;
    document.getElementById('selectedClientInfo').style.display = 'block';
    document.getElementById('selectedClientName').textContent = `Name: ${selectedClient.name}`;
    document.getElementById('selectedClientContact').textContent = `Contact: ${selectedClient.contact}`;
    document.getElementById('selectedClientBalance').textContent = `Current Balance: Rs. ${balance.toLocaleString()}`;
    document.getElementById('confirmCreditBtn').style.display = 'block';
}

function confirmCreditSale() {
    if (!selectedClient) {
        alert('Please select a client!');
        return;
    }
    
    closePaymentModal();
    completeSale('credit', selectedClient.index);
}

function updateClientBalance(clientIndex, amount) {
    let clients = JSON.parse(localStorage.getItem('clients')) || [];
    const printerSettings = JSON.parse(localStorage.getItem('printerSettings')) || {};
    const currency = printerSettings.currency || 'Rs.';
    
    if (!clients[clientIndex].balance) {
        clients[clientIndex].balance = 0;
    }
    
    const previousBalance = clients[clientIndex].balance;
    clients[clientIndex].balance += amount;
    
    // Add transaction to client ledger
    if (!clients[clientIndex].ledger) {
        clients[clientIndex].ledger = [];
    }
    
    // Create detailed ledger entry
    const ledgerEntry = {
        id: Date.now(),
        date: new Date().toISOString(),
        type: 'credit_sale',
        description: `Credit Sale - ${currentSaleData.cart.length} items`,
        items: currentSaleData.cart.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            total: item.price * item.quantity
        })),
        debit: amount, // Amount owed by client
        credit: 0,
        balance: clients[clientIndex].balance,
        previousBalance: previousBalance,
        admin: currentUser.username,
        transactionId: currentSaleData.transactionId || Date.now()
    };
    
    clients[clientIndex].ledger.unshift(ledgerEntry); // Add to beginning
    
    // Also keep simplified transactions for backward compatibility
    if (!clients[clientIndex].transactions) {
        clients[clientIndex].transactions = [];
    }
    
    clients[clientIndex].transactions.push({
        date: new Date().toISOString(),
        amount: amount,
        type: 'credit_sale',
        items: currentSaleData.cart.length,
        admin: currentUser.username
    });
    
    localStorage.setItem('clients', JSON.stringify(clients));
}

function showAddClientModal() {
    document.getElementById('addClientModal').classList.add('active');
}

function closeAddClientModal() {
    document.getElementById('addClientModal').classList.remove('active');
}

// Add Client Form
document.getElementById('addClientForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const newClient = {
        name: document.getElementById('newClientName').value,
        contact: document.getElementById('newClientContact').value,
        address: document.getElementById('newClientAddress').value || '',
        balance: 0,
        ledger: [],
        transactions: [],
        createdDate: new Date().toISOString(),
        createdBy: currentUser.username
    };
    
    let clients = JSON.parse(localStorage.getItem('clients')) || [];
    clients.push(newClient);
    localStorage.setItem('clients', JSON.stringify(clients));
    
    closeAddClientModal();
    
    // Reload clients in management modal if open
    if (document.getElementById('clientManagementModal').classList.contains('active')) {
        loadClientsInManagement();
    }
    
    this.reset();
    alert('✅ Client added successfully!');
});

// Toggle Sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('posSidebar');
    sidebar.classList.toggle('minimized');
    
    // Save state to localStorage
    localStorage.setItem('sidebarMinimized', sidebar.classList.contains('minimized'));
}

// Logout from POS
function logoutFromPOS() {
    if (confirm('Are you sure you want to logout from POS System?')) {
        // Save all POS data before logout
        const posData = {
            products: JSON.parse(localStorage.getItem('products')) || [],
            transactions: JSON.parse(localStorage.getItem('transactions')) || [],
            clients: JSON.parse(localStorage.getItem('clients')) || [],
            subdealers: JSON.parse(localStorage.getItem('subdealers')) || [],
            suppliers: JSON.parse(localStorage.getItem('suppliers')) || [],
            returns: JSON.parse(localStorage.getItem('returns')) || [],
            discounts: JSON.parse(localStorage.getItem('discounts')) || [],
            promos: JSON.parse(localStorage.getItem('promos')) || [],
            loyalty: JSON.parse(localStorage.getItem('loyalty')) || [],
            settings: JSON.parse(localStorage.getItem('settings')) || {},
            lastSavedAt: new Date().toISOString(),
            savedBy: currentUser.username
        };
        
        // Save to user-specific backup
        let userBackups = JSON.parse(localStorage.getItem('userBackups')) || {};
        userBackups[currentUser.username] = posData;
        localStorage.setItem('userBackups', JSON.stringify(userBackups));
        
        // Also save to user's data in users array
        let users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(u => u.username === currentUser.username);
        if (userIndex !== -1) {
            users[userIndex].lastPOSData = posData;
            users[userIndex].lastLogout = new Date().toISOString();
            localStorage.setItem('users', JSON.stringify(users));
        }
        
        // Clear current user session
        localStorage.removeItem('currentUser');
        
        alert('✅ Data saved successfully! Logging out...');
        
        // Redirect to login page
        window.location.href = 'index.html';
    }
}

// Load sidebar state on page load
window.addEventListener('DOMContentLoaded', function() {
    const sidebarMinimized = localStorage.getItem('sidebarMinimized') === 'true';
    if (sidebarMinimized) {
        document.getElementById('posSidebar').classList.add('minimized');
    }
    
    // Check for low stock
    checkLowStock();
});

// Check for low stock items - No alerts, just color change in product display
function checkLowStock() {
    // Hide all alerts and badges - no notifications
    const badge = document.getElementById('lowStockBadge');
    const alertDiv = document.getElementById('lowStockAlert');
    if (badge) badge.style.display = 'none';
    if (alertDiv) alertDiv.style.display = 'none';
    
    // Color change is handled in loadProducts function
}

// Show POS View (Sales)
function showPOSView() {
    // Just refresh the page or do nothing - already on POS view
    document.querySelectorAll('.sidebar-item').forEach(item => item.classList.remove('active'));
    event.target.closest('.sidebar-item').classList.add('active');
}

// Client Management Functions
function showClientManagement() {
    // Check if feature is enabled
    if (!isFeatureEnabled('userManagement')) {
        showFeatureAccessDenied('User Management');
        return;
    }
    
    document.getElementById('clientManagementModal').classList.add('active');
    loadClientsInManagement();
    
    // Update sidebar active state
    document.querySelectorAll('.sidebar-item').forEach(item => item.classList.remove('active'));
    event.target.closest('.sidebar-item').classList.add('active');
}

function closeClientManagement() {
    document.getElementById('clientManagementModal').classList.remove('active');
}

function showAddClientModalFromManagement() {
    document.getElementById('addClientModal').classList.add('active');
}

function loadClientsInManagement() {
    const clients = JSON.parse(localStorage.getItem('clients')) || [];
    displayClientsInManagement(clients);
}

function displayClientsInManagement(clients) {
    const list = document.getElementById('clientManagementList');
    list.innerHTML = '';
    
    if (clients.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">No clients found. Add a new client.</p>';
        return;
    }
    
    clients.forEach((client, index) => {
        const balance = client.balance || 0;
        const balanceColor = balance > 0 ? '#dc3545' : '#28a745';
        
        const clientCard = document.createElement('div');
        clientCard.style.cssText = 'background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 10px; border: 2px solid #e0e0e0;';
        clientCard.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h4 style="margin: 0 0 5px 0;">${client.name}</h4>
                    <p style="margin: 0; color: #666; font-size: 14px;">📞 ${client.contact}</p>
                    ${client.address ? `<p style="margin: 0; color: #666; font-size: 13px;">📍 ${client.address}</p>` : ''}
                    <p style="margin: 5px 0 0 0; color: ${balanceColor}; font-weight: 600;">Balance: Rs. ${balance.toLocaleString()}</p>
                </div>
                <div>
                    <button class="action-btn delete-btn" onclick="deleteClientFromManagement(${index})">🗑️ Delete</button>
                </div>
            </div>
        `;
        list.appendChild(clientCard);
    });
}

function searchClientsInManagement() {
    const searchTerm = document.getElementById('clientManagementSearch').value.toLowerCase();
    const clients = JSON.parse(localStorage.getItem('clients')) || [];
    
    const filtered = clients.filter(client => 
        client.name.toLowerCase().includes(searchTerm) || 
        client.contact.includes(searchTerm)
    );
    
    displayClientsInManagement(filtered);
}

function deleteClientFromManagement(index) {
    if (confirm('Delete this client? All ledger history will be lost.')) {
        let clients = JSON.parse(localStorage.getItem('clients')) || [];
        clients.splice(index, 1);
        localStorage.setItem('clients', JSON.stringify(clients));
        loadClientsInManagement();
        alert('✅ Client deleted!');
    }
}

// Inventory Management Functions
function showInventoryManagement() {
    document.getElementById('inventoryManagementModal').classList.add('active');
    loadInventoryManagement();
    
    // Update sidebar active state
    document.querySelectorAll('.sidebar-item').forEach(item => item.classList.remove('active'));
    event.target.closest('.sidebar-item').classList.add('active');
}

function closeInventoryManagement() {
    document.getElementById('inventoryManagementModal').classList.remove('active');
}

function loadInventoryManagement() {
    displayInventoryManagement(products);
}

function displayInventoryManagement(productsToShow) {
    const tbody = document.getElementById('inventoryManagementBody');
    tbody.innerHTML = '';
    
    if (productsToShow.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">No products found</td></tr>';
        return;
    }
    
    productsToShow.forEach((product, index) => {
        const stockColor = product.stock <= 0 ? '#dc3545' : product.stock <= 5 ? '#ffc107' : '#28a745';
        
        // Show image or icon
        const productDisplay = product.image 
            ? `<img src="${product.image}" alt="${product.name}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 5px; vertical-align: middle; margin-right: 8px;"> ${product.name}`
            : `${product.icon || '📦'} ${product.name}`;
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${productDisplay}</td>
            <td>${product.category}</td>
            <td>Rs. ${product.price.toLocaleString()}</td>
            <td style="color: ${stockColor}; font-weight: 600;">${product.stock}</td>
            <td>
                <button class="action-btn edit-btn" onclick="editProductStock(${index})">✏️ Edit</button>
                <button class="action-btn delete-btn" onclick="deleteProductFromInventory(${index})">🗑️ Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function searchInventory() {
    const searchTerm = document.getElementById('inventorySearch').value.toLowerCase();
    const filtered = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm) || 
        p.category.toLowerCase().includes(searchTerm)
    );
    displayInventoryManagement(filtered);
}

function showAddProductModal() {
    document.getElementById('productModalTitle').textContent = 'Add New Product';
    document.getElementById('productSubmitBtn').textContent = 'Add Product';
    document.getElementById('editProductIndex').value = '-1';
    document.getElementById('addProductForm').reset();
    document.getElementById('addProductModal').classList.add('active');
}

function closeAddProductModal() {
    document.getElementById('addProductModal').classList.remove('active');
}

function quickEditProduct(displayIndex) {
    // Find actual product index
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    
    let filtered = allProducts.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm) || 
                            p.category.toLowerCase().includes(searchTerm);
        const matchesCategory = category === 'all' || p.category === category;
        return matchesSearch && matchesCategory;
    });
    
    const product = filtered[displayIndex];
    const actualIndex = products.findIndex(p => p.id === product.id);
    
    editProductStock(actualIndex);
}

function editProductStock(index) {
    const product = products[index];
    
    document.getElementById('productModalTitle').textContent = 'Edit Product';
    document.getElementById('productSubmitBtn').textContent = 'Update Product';
    document.getElementById('editProductIndex').value = index;
    document.getElementById('productName').value = product.name;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productCostPrice').value = product.costPrice || product.price * 0.7;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productStock').value = product.stock;
    document.getElementById('productIcon').value = product.icon || '';
    
    // Set arrival date
    if (product.arrivalDate) {
        const date = new Date(product.arrivalDate);
        document.getElementById('productArrivalDate').value = date.toISOString().split('T')[0];
    } else {
        document.getElementById('productArrivalDate').value = new Date().toISOString().split('T')[0];
    }
    
    // Show current image if exists
    if (product.image) {
        document.getElementById('currentProductImage').src = product.image;
        document.getElementById('currentProductImage').style.display = 'block';
    } else {
        document.getElementById('currentProductImage').style.display = 'none';
    }
    
    document.getElementById('addProductModal').classList.add('active');
}

function deleteProductFromInventory(index) {
    if (confirm('Delete this product?')) {
        products.splice(index, 1);
        localStorage.setItem('products', JSON.stringify(products));
        loadInventoryManagement();
        updateProductDisplay();
        alert('✅ Product deleted!');
    }
}

// Preview product image
function previewProductImage(event) {
    const file = event.target.files[0];
    if (file) {
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size should be less than 5MB');
            event.target.value = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('currentProductImage').src = e.target.result;
            document.getElementById('currentProductImage').style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

// Add/Edit Product Form
document.getElementById('addProductForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const editIndex = parseInt(document.getElementById('editProductIndex').value);
    const productData = {
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value,
        price: parseFloat(document.getElementById('productPrice').value),
        stock: parseInt(document.getElementById('productStock').value),
        icon: document.getElementById('productIcon').value || '📦'
    };
    
    // Handle image upload
    const imageFile = document.getElementById('productImage').files[0];
    if (imageFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            productData.image = e.target.result;
            saveProduct(editIndex, productData);
        };
        reader.readAsDataURL(imageFile);
    } else {
        // Keep existing image if editing
        if (editIndex >= 0 && products[editIndex].image) {
            productData.image = products[editIndex].image;
        }
        saveProduct(editIndex, productData);
    }
});

function saveProduct(editIndex, productData) {
    // Add cost price, arrival date, barcode and expiry
    productData.costPrice = parseFloat(document.getElementById('productCostPrice').value) || productData.price * 0.7;
    productData.arrivalDate = document.getElementById('productArrivalDate').value || new Date().toISOString();
    productData.barcode = document.getElementById('productBarcode')?.value || '';
    productData.expiryDate = document.getElementById('productExpiry')?.value || '';
    
    if (editIndex >= 0) {
        // Update existing product
        products[editIndex] = {
            ...products[editIndex],
            ...productData
        };
        alert('✅ Product updated successfully!');
    } else {
        // Add new product
        productData.id = Date.now();
        products.push(productData);
        allProducts = [...products];
        alert('✅ Product added successfully!');
    }
    
    localStorage.setItem('products', JSON.stringify(products));
    closeAddProductModal();
    
    // Reload if inventory management is open
    if (document.getElementById('inventoryManagementModal').classList.contains('active')) {
        loadInventoryManagement();
    }
    
    updateProductDisplay();
    document.getElementById('addProductForm').reset();
    document.getElementById('currentProductImage').style.display = 'none';
    document.getElementById('productImage').value = '';
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // F1 - Focus search
    if (e.key === 'F1') {
        e.preventDefault();
        document.getElementById('searchInput').focus();
    }
    
    // F2 - Focus customer paid
    if (e.key === 'F2') {
        e.preventDefault();
        document.getElementById('customerPaid').focus();
    }
    
    // F9 - Checkout
    if (e.key === 'F9') {
        e.preventDefault();
        checkout();
    }
    
    // F10 - Print
    if (e.key === 'F10') {
        e.preventDefault();
        printReceipt();
    }
    
    // F12 - Clear cart
    if (e.key === 'F12') {
        e.preventDefault();
        clearCart();
    }
});


// Financial Reports Functions
function showFinancialReports() {
    document.getElementById('financialReportsModal').classList.add('active');
    calculateFinancials();
    loadInventoryReport();
    loadSalesReport();
    loadProfitReport();
    
    // Update sidebar active state
    document.querySelectorAll('.sidebar-item').forEach(item => item.classList.remove('active'));
    event.target.closest('.sidebar-item').classList.add('active');
}

function closeFinancialReports() {
    document.getElementById('financialReportsModal').classList.remove('active');
}

function showReportTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.report-content').forEach(content => {
        content.classList.remove('active');
    });
    document.querySelectorAll('.report-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName + 'Report').classList.add('active');
    event.target.classList.add('active');
}

function calculateFinancials() {
    const printerSettings = JSON.parse(localStorage.getItem('printerSettings')) || {};
    const currency = printerSettings.currency || 'Rs.';
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    
    // Calculate total shop cost (inventory value at cost price)
    let totalShopCost = 0;
    products.forEach(product => {
        const costPrice = product.costPrice || product.price * 0.7; // Default 70% if not set
        totalShopCost += costPrice * product.stock;
    });
    
    // Calculate total sales amount
    let totalSalesAmount = 0;
    let totalCostOfSoldItems = 0;
    
    transactions.forEach(transaction => {
        totalSalesAmount += transaction.total || 0;
        
        // Calculate cost of sold items
        transaction.items.forEach(item => {
            const product = products.find(p => p.name === item.name);
            if (product) {
                const costPrice = product.costPrice || item.price * 0.7;
                totalCostOfSoldItems += costPrice * item.quantity;
            }
        });
    });
    
    // Shop balance = Total sales - Total shop cost
    const shopBalance = totalSalesAmount;
    
    // Total profit = Sales - Cost of sold items
    const totalProfit = totalSalesAmount - totalCostOfSoldItems;
    
    // Update display
    document.getElementById('totalShopCost').textContent = `${currency} ${totalShopCost.toLocaleString()}`;
    document.getElementById('totalSalesAmount').textContent = `${currency} ${totalSalesAmount.toLocaleString()}`;
    document.getElementById('shopBalance').textContent = `${currency} ${shopBalance.toLocaleString()}`;
    document.getElementById('totalProfit').textContent = `${currency} ${totalProfit.toLocaleString()}`;
}

function loadInventoryReport() {
    const printerSettings = JSON.parse(localStorage.getItem('printerSettings')) || {};
    const currency = printerSettings.currency || 'Rs.';
    const tbody = document.getElementById('inventoryReportBody');
    tbody.innerHTML = '';
    
    let totalValue = 0;
    
    products.forEach(product => {
        const costPrice = product.costPrice || product.price * 0.7;
        const totalProductValue = costPrice * product.stock;
        totalValue += totalProductValue;
        
        const arrivalDate = product.arrivalDate 
            ? new Date(product.arrivalDate).toLocaleDateString() 
            : 'N/A';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${product.icon || '📦'} ${product.name}</td>
            <td>${product.stock}</td>
            <td>${currency} ${costPrice.toLocaleString()}</td>
            <td>${currency} ${totalProductValue.toLocaleString()}</td>
            <td>${arrivalDate}</td>
        `;
        tbody.appendChild(tr);
    });
    
    // Add total row
    const totalRow = document.createElement('tr');
    totalRow.style.cssText = 'background: #f8f9fa; font-weight: bold;';
    totalRow.innerHTML = `
        <td colspan="3">TOTAL INVENTORY VALUE</td>
        <td>${currency} ${totalValue.toLocaleString()}</td>
        <td></td>
    `;
    tbody.appendChild(totalRow);
}

function loadSalesReport() {
    const printerSettings = JSON.parse(localStorage.getItem('printerSettings')) || {};
    const currency = printerSettings.currency || 'Rs.';
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    const tbody = document.getElementById('salesReportBody');
    tbody.innerHTML = '';
    
    if (transactions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">No sales yet</td></tr>';
        return;
    }
    
    let totalSales = 0;
    
    transactions.reverse().forEach(transaction => {
        totalSales += transaction.total;
        const date = new Date(transaction.date);
        const paymentBadge = transaction.paymentMethod === 'cash' 
            ? '<span style="background: #28a745; color: white; padding: 2px 8px; border-radius: 3px; font-size: 11px;">CASH</span>'
            : '<span style="background: #ffc107; color: #333; padding: 2px 8px; border-radius: 3px; font-size: 11px;">CREDIT</span>';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${transaction.receiptNumber || 'N/A'}</td>
            <td>${date.toLocaleDateString()}</td>
            <td>${transaction.items.length} items</td>
            <td>${currency} ${transaction.total.toLocaleString()}</td>
            <td>${paymentBadge}</td>
            <td>${transaction.admin}</td>
        `;
        tbody.appendChild(tr);
    });
    
    // Add total row
    const totalRow = document.createElement('tr');
    totalRow.style.cssText = 'background: #f8f9fa; font-weight: bold;';
    totalRow.innerHTML = `
        <td colspan="3">TOTAL SALES</td>
        <td>${currency} ${totalSales.toLocaleString()}</td>
        <td colspan="2"></td>
    `;
    tbody.appendChild(totalRow);
}

function loadProfitReport() {
    const printerSettings = JSON.parse(localStorage.getItem('printerSettings')) || {};
    const currency = printerSettings.currency || 'Rs.';
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    const tbody = document.getElementById('profitReportBody');
    tbody.innerHTML = '';
    
    // Calculate profit per product
    const productSales = {};
    
    transactions.forEach(transaction => {
        transaction.items.forEach(item => {
            if (!productSales[item.name]) {
                productSales[item.name] = {
                    name: item.name,
                    quantity: 0,
                    salePrice: item.price,
                    totalSales: 0
                };
            }
            productSales[item.name].quantity += item.quantity;
            productSales[item.name].totalSales += item.total;
        });
    });
    
    let totalProfit = 0;
    
    Object.values(productSales).forEach(sale => {
        const product = products.find(p => p.name === sale.name);
        const costPrice = product ? (product.costPrice || sale.salePrice * 0.7) : sale.salePrice * 0.7;
        const profitPerUnit = sale.salePrice - costPrice;
        const totalProductProfit = profitPerUnit * sale.quantity;
        totalProfit += totalProductProfit;
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${sale.name}</td>
            <td>${sale.quantity}</td>
            <td>${currency} ${costPrice.toLocaleString()}</td>
            <td>${currency} ${sale.salePrice.toLocaleString()}</td>
            <td style="color: ${profitPerUnit >= 0 ? '#28a745' : '#dc3545'};">${currency} ${profitPerUnit.toLocaleString()}</td>
            <td style="color: ${totalProductProfit >= 0 ? '#28a745' : '#dc3545'}; font-weight: 600;">${currency} ${totalProductProfit.toLocaleString()}</td>
        `;
        tbody.appendChild(tr);
    });
    
    if (Object.keys(productSales).length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">No sales data available</td></tr>';
        return;
    }
    
    // Add total row
    const totalRow = document.createElement('tr');
    totalRow.style.cssText = 'background: #f8f9fa; font-weight: bold;';
    totalRow.innerHTML = `
        <td colspan="5">TOTAL PROFIT</td>
        <td style="color: ${totalProfit >= 0 ? '#28a745' : '#dc3545'};">${currency} ${totalProfit.toLocaleString()}</td>
    `;
    tbody.appendChild(totalRow);
}


// Check if feature is enabled for current user
function isFeatureEnabled(featureName) {
    if (!currentUser) return false;
    
    // Superadmin and admin have all features
    if (currentUser.role === 'superadmin' || currentUser.role === 'admin') {
        return true;
    }
    
    // Get user from localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.username === currentUser.username);
    
    if (!user || !user.features) {
        return true; // Default: all features enabled
    }
    
    return user.features[featureName] !== false;
}

// Show feature access denied message
function showFeatureAccessDenied(featureName) {
    alert(`❌ Access Denied!\n\nThe "${featureName}" feature is disabled for your account.\n\nPlease contact your administrator to enable this feature.`);
}

// Update sidebar based on features
function updateSidebarFeatures() {
    const featureMap = {
        'showInventoryManagement()': 'inventory',
        'showClientManagement()': 'clients',
        'showSubdealerManagement()': 'subdealers',
        'showFinancialReports()': 'reports',
        'showExpenseModal()': 'expenses',
        'showCashRegister()': 'cashRegister',
        'showPurchaseOrder()': 'purchaseOrders',
        'showDiscountModal()': 'discounts',
        'showReturnModal()': 'returns',
        'showSupplierModal()': 'suppliers',
        'showUserManagement()': 'users',
        'showBackupModal()': 'backup',
        'showSettingsModal()': 'settings',
        'showActivityLogs()': 'activityLogs',
        'showBarcodeModal()': 'barcode'
    };
    
    Object.entries(featureMap).forEach(([onclick, feature]) => {
        if (!isFeatureEnabled(feature)) {
            const link = document.querySelector(`[onclick="${onclick}"]`);
            if (link) {
                link.style.opacity = '0.5';
                link.style.pointerEvents = 'none';
                link.title = 'Feature disabled by administrator';
            }
        }
    });
}

// Call on page load
updateSidebarFeatures();


// License Management Functions
function showLicenseManagement() {
    document.getElementById('licenseManagementModal').classList.add('active');
    loadLicenseInfo();
    
    // Update sidebar active state
    document.querySelectorAll('.sidebar-item').forEach(item => item.classList.remove('active'));
    if (event && event.target) {
        event.target.closest('.sidebar-item').classList.add('active');
    }
}

function closeLicenseManagement() {
    document.getElementById('licenseManagementModal').classList.remove('active');
}

function loadLicenseInfo() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.username === currentUser.username);
    
    if (!user) return;
    
    const licenseType = user.licenseType || 'trial';
    const expiryDate = user.expiryDate ? new Date(user.expiryDate) : null;
    const now = new Date();
    const daysLeft = expiryDate ? Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24)) : 0;
    
    // Update display
    document.getElementById('currentLicenseType').textContent = licenseType.toUpperCase();
    
    if (licenseType === 'lifetime') {
        document.getElementById('currentLicenseStatus').innerHTML = '✅ Active';
        document.getElementById('currentLicenseStatus').style.color = '#28a745';
        document.getElementById('currentExpiryDate').textContent = 'Never';
        document.getElementById('currentDaysLeft').textContent = 'Unlimited';
    } else if (daysLeft > 0) {
        document.getElementById('currentLicenseStatus').innerHTML = '✅ Active';
        document.getElementById('currentLicenseStatus').style.color = '#28a745';
        document.getElementById('currentExpiryDate').textContent = expiryDate.toLocaleDateString();
        document.getElementById('currentDaysLeft').textContent = daysLeft + ' days';
    } else {
        document.getElementById('currentLicenseStatus').innerHTML = '⚠️ Expired';
        document.getElementById('currentLicenseStatus').style.color = '#dc3545';
        document.getElementById('currentExpiryDate').textContent = expiryDate ? expiryDate.toLocaleDateString() : 'N/A';
        document.getElementById('currentDaysLeft').textContent = 'Expired';
    }
    
    // Update sidebar license status
    updateSidebarLicenseStatus(licenseType, daysLeft);
}

function updateSidebarLicenseStatus(licenseType, daysLeft) {
    const licenseText = document.getElementById('licenseText');
    const licenseStatus = document.getElementById('licenseStatus');
    
    if (licenseType === 'lifetime') {
        licenseText.textContent = '💎 Lifetime';
        licenseStatus.style.background = 'rgba(40, 167, 69, 0.3)';
    } else if (daysLeft > 7) {
        licenseText.textContent = '✅ Active';
        licenseStatus.style.background = 'rgba(40, 167, 69, 0.3)';
    } else if (daysLeft > 0) {
        licenseText.textContent = `⚠️ ${daysLeft}d left`;
        licenseStatus.style.background = 'rgba(255, 193, 7, 0.3)';
    } else {
        licenseText.textContent = '❌ Expired';
        licenseStatus.style.background = 'rgba(220, 53, 69, 0.3)';
    }
}

function buyLicense(type) {
    const amount = type === 'monthly' ? 1000 : 5000;
    const duration = type === 'monthly' ? '30 days' : 'Lifetime';
    
    // Close license modal and show purchase form
    closeLicenseManagement();
    showLicensePurchaseForm(type, amount, duration);
}

function generateLicenseKey() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let key = '';
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            key += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        if (i < 3) key += '-';
    }
    return key;
}

function saveLicenseRequest(type, licenseKey, amount) {
    let licenseRequests = JSON.parse(localStorage.getItem('licenseRequests')) || [];
    
    licenseRequests.push({
        username: currentUser.username,
        licenseType: type,
        licenseKey: licenseKey,
        amount: amount,
        status: 'pending',
        requestDate: new Date().toISOString()
    });
    
    localStorage.setItem('licenseRequests', JSON.stringify(licenseRequests));
}

function activateLicense() {
    const licenseKey = document.getElementById('licenseKeyInput').value.trim().toUpperCase();
    
    if (!licenseKey) {
        alert('❌ Please enter a license key!');
        return;
    }
    
    // Check if license key is valid
    const licenseKeys = JSON.parse(localStorage.getItem('licenseKeys')) || [];
    const validKey = licenseKeys.find(k => k.key === licenseKey && !k.used);
    
    if (!validKey) {
        alert('❌ Invalid or already used license key!\n\nPlease check your key and try again.');
        return;
    }
    
    // Activate license
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.username === currentUser.username);
    
    if (userIndex === -1) {
        alert('❌ User not found!');
        return;
    }
    
    // Update user license
    users[userIndex].licenseType = validKey.type;
    users[userIndex].licenseKey = licenseKey;
    
    if (validKey.type === 'lifetime') {
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 100);
        users[userIndex].expiryDate = expiryDate.toISOString();
    } else {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);
        users[userIndex].expiryDate = expiryDate.toISOString();
    }
    
    // Enable all features
    users[userIndex].features = {
        userManagement: true,
        trialSystem: true,
        licenseSystem: true,
        flashSale: true
    };
    
    // Mark key as used
    validKey.used = true;
    validKey.usedBy = currentUser.username;
    validKey.usedDate = new Date().toISOString();
    localStorage.setItem('licenseKeys', JSON.stringify(licenseKeys));
    
    // Save users
    localStorage.setItem('users', JSON.stringify(users));
    
    // Update current user
    currentUser = users[userIndex];
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    alert('🎉 License Activated Successfully!\n\nAll features are now enabled.\n\nPlease refresh the page to see changes.');
    
    closeLicenseManagement();
    loadLicenseInfo();
    
    // Refresh page after 2 seconds
    setTimeout(() => {
        location.reload();
    }, 2000);
}

// Activate 7 Days Demo Account
function activateDemoAccount() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.username === currentUser.username);
    
    if (userIndex === -1) {
        alert('❌ User not found!');
        return;
    }
    
    // Check if already activated demo
    if (users[userIndex].demoActivated) {
        alert('❌ Demo Already Used!\n\nYou have already activated your 7-day demo account.\n\nPlease purchase a license to continue using all features.');
        return;
    }
    
    if (!confirm('🎁 Activate 7 Days Free Demo?\n\nYou will get full access to all features for 7 days.\n\nThis is a one-time offer. Continue?')) {
        return;
    }
    
    // Activate demo
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);
    
    users[userIndex].licenseType = 'demo';
    users[userIndex].expiryDate = expiryDate.toISOString();
    users[userIndex].demoActivated = true;
    users[userIndex].demoStartDate = new Date().toISOString();
    
    // Enable all features
    users[userIndex].features = {
        userManagement: true,
        trialSystem: true,
        licenseSystem: true,
        flashSale: true
    };
    
    // Save users
    localStorage.setItem('users', JSON.stringify(users));
    
    // Update current user
    currentUser = users[userIndex];
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    alert('🎉 7 Days Demo Activated!\n\nAll features are now enabled for 7 days.\n\nEnjoy your free trial!');
    
    closeLicenseManagement();
    loadLicenseInfo();
    
    // Refresh page
    setTimeout(() => {
        location.reload();
    }, 1500);
}

// Open Chatbot
function openChatbot() {
    const chatbotContainer = document.getElementById('chatbotContainer');
    if (chatbotContainer) {
        chatbotContainer.classList.add('active');
        
        // Focus on input
        setTimeout(() => {
            const chatInput = document.getElementById('chatInput');
            if (chatInput) chatInput.focus();
        }, 300);
    }
}

// Check license on page load
function checkLicenseStatus() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.username === currentUser.username);
    
    if (!user) return;
    
    const licenseType = user.licenseType || 'trial';
    const expiryDate = user.expiryDate ? new Date(user.expiryDate) : null;
    const now = new Date();
    const daysLeft = expiryDate ? Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24)) : 0;
    
    // Update sidebar
    updateSidebarLicenseStatus(licenseType, daysLeft);
    
    // Show warning if expiring soon
    if (daysLeft > 0 && daysLeft <= 7 && licenseType !== 'lifetime') {
        setTimeout(() => {
            if (confirm(`⚠️ License Expiring Soon!\n\nYour license will expire in ${daysLeft} days.\n\nWould you like to renew now?`)) {
                showLicenseManagement();
            }
        }, 2000);
    } else if (daysLeft <= 0 && licenseType !== 'lifetime') {
        setTimeout(() => {
            alert('❌ License Expired!\n\nYour license has expired. Some features may be disabled.\n\nPlease purchase a license to continue.');
            showLicenseManagement();
        }, 2000);
    }
}

// Check license status on page load
checkLicenseStatus();

// Toggle Notification List
function toggleNotificationList() {
    const notificationList = document.getElementById('notificationList');
    if (notificationList.style.display === 'none') {
        notificationList.style.display = 'block';
        loadUserNotifications();
    } else {
        notificationList.style.display = 'none';
    }
}

// Load User Notifications
function loadUserNotifications() {
    const userNotifications = JSON.parse(localStorage.getItem('userNotifications')) || [];
    const myNotifications = userNotifications.filter(n => n.username === currentUser.username);
    
    const notificationList = document.getElementById('notificationList');
    const notificationBadge = document.getElementById('notificationBadge');
    
    if (!notificationList) return;
    
    // Update badge
    const unreadCount = myNotifications.filter(n => !n.read).length;
    if (unreadCount > 0) {
        notificationBadge.textContent = unreadCount;
        notificationBadge.style.display = 'inline-block';
    } else {
        notificationBadge.style.display = 'none';
    }
    
    if (myNotifications.length === 0) {
        notificationList.innerHTML = '<p style="text-align: center; color: white; font-size: 12px; padding: 10px;">No notifications</p>';
        return;
    }
    
    notificationList.innerHTML = '';
    
    myNotifications.reverse().slice(0, 10).forEach((notification, index) => {
        const actualIndex = myNotifications.length - 1 - index;
        const date = new Date(notification.timestamp);
        const isUnread = !notification.read;
        
        const notifDiv = document.createElement('div');
        notifDiv.style.cssText = `
            background: ${isUnread ? 'white' : 'rgba(255, 255, 255, 0.8)'};
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 10px;
            cursor: pointer;
            border: 2px solid ${isUnread ? '#ffc107' : 'rgba(255, 255, 255, 0.3)'};
            transition: all 0.3s;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        `;
        
        notifDiv.onmouseover = function() {
            this.style.transform = 'translateX(5px)';
            this.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.2)';
        };
        
        notifDiv.onmouseout = function() {
            this.style.transform = 'translateX(0)';
            this.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1)';
        };
        
        notifDiv.onclick = (e) => {
            e.stopPropagation();
            markNotificationAsRead(actualIndex);
        };
        
        // Icon based on notification type
        let icon = '📢';
        if (notification.type === 'admin_reply') {
            icon = '💬';
        } else if (notification.type === 'license') {
            icon = '🔑';
        } else if (notification.type === 'system') {
            icon = '⚙️';
        }
        
        notifDiv.innerHTML = `
            <div style="display: flex; align-items: start; gap: 10px;">
                <div style="font-size: 24px; flex-shrink: 0;">${icon}</div>
                <div style="flex: 1;">
                    <div style="font-weight: 600; color: #333; margin-bottom: 5px; display: flex; align-items: center; gap: 8px;">
                        ${notification.title}
                        ${isUnread ? '<span style="background: #dc3545; color: white; padding: 2px 6px; border-radius: 10px; font-size: 10px;">NEW</span>' : ''}
                    </div>
                    <div style="color: #666; font-size: 12px; margin-bottom: 5px; line-height: 1.4;">${notification.message}</div>
                    <div style="color: #999; font-size: 10px;">
                        <span>📅 ${date.toLocaleDateString()}</span>
                        <span style="margin-left: 10px;">🕐 ${date.toLocaleTimeString()}</span>
                    </div>
                </div>
            </div>
            ${isUnread ? '<div style="text-align: right; margin-top: 8px;"><small style="color: #667eea; font-weight: 600;">Click to mark as read</small></div>' : ''}
        `;
        
        notificationList.appendChild(notifDiv);
    });
    
    // Add "View All" button if more than 10 notifications
    if (myNotifications.length > 10) {
        const viewAllBtn = document.createElement('div');
        viewAllBtn.style.cssText = `
            background: rgba(255, 255, 255, 0.9);
            padding: 10px;
            border-radius: 8px;
            text-align: center;
            cursor: pointer;
            font-weight: 600;
            color: #667eea;
            margin-top: 10px;
        `;
        viewAllBtn.textContent = `View All (${myNotifications.length} total)`;
        viewAllBtn.onclick = (e) => {
            e.stopPropagation();
            showAllNotifications();
        };
        notificationList.appendChild(viewAllBtn);
    }
}

function markNotificationAsRead(index) {
    let userNotifications = JSON.parse(localStorage.getItem('userNotifications')) || [];
    const myNotifications = userNotifications.filter(n => n.username === currentUser.username);
    
    if (myNotifications[index]) {
        // Find in original array
        const notifId = myNotifications[index].id;
        const originalIndex = userNotifications.findIndex(n => n.id === notifId);
        
        if (originalIndex !== -1) {
            userNotifications[originalIndex].read = true;
            localStorage.setItem('userNotifications', JSON.stringify(userNotifications));
            loadUserNotifications();
            
            // Show success message
            const notification = myNotifications[index];
            if (notification.type === 'admin_reply') {
                // Show a small toast notification
                showToast('✅ Message marked as read', 'success');
            }
        }
    }
}

// Show All Notifications Modal
function showAllNotifications() {
    const userNotifications = JSON.parse(localStorage.getItem('userNotifications')) || [];
    const myNotifications = userNotifications.filter(n => n.username === currentUser.username);
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.style.cssText = 'display: flex; position: fixed; z-index: 10000; left: 0; top: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); align-items: center; justify-content: center;';
    
    modal.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 15px; max-width: 700px; width: 90%; max-height: 90vh; overflow-y: auto; position: relative;">
            <span onclick="this.parentElement.parentElement.remove()" style="position: absolute; right: 20px; top: 20px; font-size: 28px; cursor: pointer; color: #999;">&times;</span>
            
            <h2 style="color: #333; margin-bottom: 20px;">🔔 All Notifications</h2>
            
            <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                <button onclick="filterNotifications('all')" class="filter-btn active" data-filter="all" style="flex: 1; padding: 10px; border: 2px solid #667eea; background: #667eea; color: white; border-radius: 8px; cursor: pointer; font-weight: 600;">
                    All (${myNotifications.length})
                </button>
                <button onclick="filterNotifications('unread')" class="filter-btn" data-filter="unread" style="flex: 1; padding: 10px; border: 2px solid #667eea; background: white; color: #667eea; border-radius: 8px; cursor: pointer; font-weight: 600;">
                    Unread (${myNotifications.filter(n => !n.read).length})
                </button>
                <button onclick="markAllAsRead()" style="flex: 1; padding: 10px; border: 2px solid #28a745; background: #28a745; color: white; border-radius: 8px; cursor: pointer; font-weight: 600;">
                    ✓ Mark All Read
                </button>
            </div>
            
            <div id="allNotificationsList"></div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Load all notifications
    displayAllNotifications(myNotifications);
    
    // Close on background click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function displayAllNotifications(notifications, filter = 'all') {
    const container = document.getElementById('allNotificationsList');
    if (!container) return;
    
    let filteredNotifications = notifications;
    if (filter === 'unread') {
        filteredNotifications = notifications.filter(n => !n.read);
    }
    
    if (filteredNotifications.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">No notifications</p>';
        return;
    }
    
    container.innerHTML = '';
    
    filteredNotifications.reverse().forEach((notification, index) => {
        const actualIndex = notifications.length - 1 - index;
        const date = new Date(notification.timestamp);
        const isUnread = !notification.read;
        
        let icon = '📢';
        if (notification.type === 'admin_reply') icon = '💬';
        else if (notification.type === 'license') icon = '🔑';
        else if (notification.type === 'system') icon = '⚙️';
        
        const notifDiv = document.createElement('div');
        notifDiv.style.cssText = `
            background: ${isUnread ? '#fff3cd' : '#f8f9fa'};
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 15px;
            border: 2px solid ${isUnread ? '#ffc107' : '#e0e0e0'};
        `;
        
        notifDiv.innerHTML = `
            <div style="display: flex; align-items: start; gap: 15px;">
                <div style="font-size: 32px; flex-shrink: 0;">${icon}</div>
                <div style="flex: 1;">
                    <div style="font-weight: 600; color: #333; margin-bottom: 8px; font-size: 16px; display: flex; align-items: center; gap: 10px;">
                        ${notification.title}
                        ${isUnread ? '<span style="background: #dc3545; color: white; padding: 3px 8px; border-radius: 12px; font-size: 11px;">NEW</span>' : ''}
                    </div>
                    <div style="color: #666; font-size: 14px; margin-bottom: 10px; line-height: 1.6;">${notification.message}</div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="color: #999; font-size: 12px;">
                            📅 ${date.toLocaleDateString()} • 🕐 ${date.toLocaleTimeString()}
                        </div>
                        ${isUnread ? `<button onclick="markNotificationAsReadFromModal(${actualIndex})" style="padding: 6px 12px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 12px;">✓ Mark as Read</button>` : '<span style="color: #28a745; font-size: 12px;">✓ Read</span>'}
                    </div>
                </div>
            </div>
        `;
        
        container.appendChild(notifDiv);
    });
}

function filterNotifications(filter) {
    const userNotifications = JSON.parse(localStorage.getItem('userNotifications')) || [];
    const myNotifications = userNotifications.filter(n => n.username === currentUser.username);
    
    // Update button styles
    document.querySelectorAll('.filter-btn').forEach(btn => {
        if (btn.dataset.filter === filter) {
            btn.style.background = '#667eea';
            btn.style.color = 'white';
        } else {
            btn.style.background = 'white';
            btn.style.color = '#667eea';
        }
    });
    
    displayAllNotifications(myNotifications, filter);
}

function markNotificationAsReadFromModal(index) {
    markNotificationAsRead(index);
    
    // Refresh modal
    const userNotifications = JSON.parse(localStorage.getItem('userNotifications')) || [];
    const myNotifications = userNotifications.filter(n => n.username === currentUser.username);
    displayAllNotifications(myNotifications);
}

function markAllAsRead() {
    let userNotifications = JSON.parse(localStorage.getItem('userNotifications')) || [];
    
    userNotifications.forEach(notification => {
        if (notification.username === currentUser.username) {
            notification.read = true;
        }
    });
    
    localStorage.setItem('userNotifications', JSON.stringify(userNotifications));
    loadUserNotifications();
    
    // Refresh modal if open
    const modal = document.querySelector('.modal.active');
    if (modal) {
        const myNotifications = userNotifications.filter(n => n.username === currentUser.username);
        displayAllNotifications(myNotifications);
    }
    
    showToast('✅ All notifications marked as read', 'success');
}

// Simple toast notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: ${type === 'success' ? '#28a745' : '#667eea'};
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 10001;
        font-weight: 600;
        animation: slideIn 0.3s ease;
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Load notifications on page load
loadUserNotifications();

// Auto-refresh notifications every 10 seconds
setInterval(() => {
    loadUserNotifications();
}, 10000);

// Check other category
function checkOtherCategory() {
    const category = document.getElementById('productCategory').value;
    const customGroup = document.getElementById('customCategoryGroup');
    
    if (category === 'Other') {
        customGroup.style.display = 'block';
        document.getElementById('customCategory').required = true;
    } else {
        customGroup.style.display = 'none';
        document.getElementById('customCategory').required = false;
    }
}

// License Purchase Form Functions
function showLicensePurchaseForm(type, amount, duration) {
    document.getElementById('licensePurchaseFormModal').classList.add('active');
    document.getElementById('selectedLicenseInfo').innerHTML = `
        <strong>${type.toUpperCase()} License</strong><br>
        Amount: Rs. ${amount.toLocaleString()}<br>
        Duration: ${duration}
    `;
    
    // Store license info
    sessionStorage.setItem('pendingLicense', JSON.stringify({ type, amount, duration }));
}

function closeLicensePurchaseForm() {
    document.getElementById('licensePurchaseFormModal').classList.remove('active');
}

function closeThankYouModal() {
    document.getElementById('thankYouModal').classList.remove('active');
}

// Handle purchase form submission
document.getElementById('licensePurchaseForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const pendingLicense = JSON.parse(sessionStorage.getItem('pendingLicense'));
    const licenseKey = generateLicenseKey();
    
    const applicationData = {
        username: currentUser.username,
        shopName: document.getElementById('shopNameInput').value,
        ownerName: document.getElementById('ownerNameInput').value,
        mobile: document.getElementById('mobileInput').value,
        cnic: document.getElementById('cnicInput').value,
        address: document.getElementById('addressInput').value,
        licenseType: pendingLicense.type,
        licenseKey: licenseKey,
        amount: pendingLicense.amount,
        status: 'pending',
        requestDate: new Date().toISOString()
    };
    
    // Save to license requests
    let licenseRequests = JSON.parse(localStorage.getItem('licenseRequests')) || [];
    licenseRequests.push(applicationData);
    localStorage.setItem('licenseRequests', JSON.stringify(licenseRequests));
    
    // Close form and show thank you
    closeLicensePurchaseForm();
    document.getElementById('thankYouModal').classList.add('active');
    
    // Reset form
    this.reset();
    sessionStorage.removeItem('pendingLicense');
});

// Notification System
function loadNotifications() {
    const notifications = JSON.parse(localStorage.getItem('notifications')) || [];
    const userNotifications = notifications.filter(n => 
        n.to === 'all' || n.to === currentUser.username
    ).filter(n => !n.read);
    
    const notificationList = document.getElementById('notificationList');
    const badge = document.getElementById('notificationBadge');
    
    if (userNotifications.length === 0) {
        notificationList.innerHTML = '<div style="color: rgba(255,255,255,0.7); font-size: 12px; text-align: center; padding: 10px;">No new notifications</div>';
        badge.style.display = 'none';
        return;
    }
    
    badge.textContent = userNotifications.length;
    badge.style.display = 'block';
    
    notificationList.innerHTML = '';
    userNotifications.slice(0, 3).forEach((notif, index) => {
        const notifDiv = document.createElement('div');
        notifDiv.style.cssText = 'background: rgba(255,255,255,0.1); padding: 10px; border-radius: 5px; margin-bottom: 8px; font-size: 12px; color: white; cursor: pointer;';
        notifDiv.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 3px;">${notif.title}</div>
            <div style="opacity: 0.9;">${notif.message}</div>
            <div style="opacity: 0.7; font-size: 10px; margin-top: 5px;">${new Date(notif.timestamp).toLocaleString()}</div>
        `;
        notifDiv.onclick = () => markNotificationAsRead(notif.id);
        notificationList.appendChild(notifDiv);
    });
    
    if (userNotifications.length > 3) {
        const moreDiv = document.createElement('div');
        moreDiv.style.cssText = 'text-align: center; color: rgba(255,255,255,0.7); font-size: 11px; margin-top: 5px;';
        moreDiv.textContent = `+${userNotifications.length - 3} more notifications`;
        notificationList.appendChild(moreDiv);
    }
}

function markNotificationAsRead(notifId) {
    let notifications = JSON.parse(localStorage.getItem('notifications')) || [];
    const notif = notifications.find(n => n.id === notifId);
    if (notif) {
        notif.read = true;
        localStorage.setItem('notifications', JSON.stringify(notifications));
        loadNotifications();
    }
}

// Send notification (for superadmin)
function sendNotification(to, title, message) {
    let notifications = JSON.parse(localStorage.getItem('notifications')) || [];
    notifications.push({
        id: Date.now(),
        to: to, // 'all' or username
        title: title,
        message: message,
        timestamp: new Date().toISOString(),
        read: false,
        from: 'Superadmin'
    });
    localStorage.setItem('notifications', JSON.stringify(notifications));
}

// Load notifications on page load
loadNotifications();

// Refresh notifications every 30 seconds
setInterval(loadNotifications, 30000);


// ==========================================
// SUBDEALER MANAGEMENT WITH WORKERS & BRANCHES
// ==========================================

let currentSubdealerIndex = -1;

// Show Subdealer Management
function showSubdealerManagement() {
    document.getElementById('subdealerManagementModal').classList.add('active');
    loadSubdealersInManagement();
    
    // Update sidebar active state
    document.querySelectorAll('.sidebar-item').forEach(item => item.classList.remove('active'));
    if (event && event.target) {
        event.target.closest('.sidebar-item').classList.add('active');
    }
}

function closeSubdealerManagement() {
    document.getElementById('subdealerManagementModal').classList.remove('active');
}

function loadSubdealersInManagement() {
    const subdealers = JSON.parse(localStorage.getItem('subdealers')) || [];
    displaySubdealersInManagement(subdealers);
}

function displaySubdealersInManagement(subdealers) {
    const tbody = document.getElementById('subdealerManagementBody');
    tbody.innerHTML = '';
    
    if (subdealers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px; color: #999;">No subdealers found. Add a new subdealer.</td></tr>';
        return;
    }
    
    subdealers.forEach((subdealer, index) => {
        const balance = subdealer.balance || 0;
        const balanceColor = balance > 0 ? '#dc3545' : '#28a745';
        const workersCount = (subdealer.workers || []).length;
        const branchesCount = (subdealer.branches || []).length;
        
        const tr = document.createElement('tr');
        tr.style.cursor = 'pointer';
        tr.onclick = () => openSubdealerDetails(index);
        tr.innerHTML = `
            <td>
                <div style="font-weight: 600;">${subdealer.name}</div>
                <small style="color: #666;">👷 ${workersCount} Workers | 🏢 ${branchesCount} Branches</small>
            </td>
            <td>📞 ${subdealer.contact}</td>
            <td>🏪 ${subdealer.shopName}</td>
            <td style="color: ${balanceColor}; font-weight: 600;">Rs. ${balance.toLocaleString()}</td>
            <td>
                <button class="action-btn edit-btn" onclick="event.stopPropagation(); openSubdealerDetails(${index})">👷 Workers</button>
                <button class="action-btn edit-btn" onclick="event.stopPropagation(); showSubdealerLedger(${index})" style="background: #28a745;">📒 Ledger</button>
                <button class="action-btn delete-btn" onclick="event.stopPropagation(); deleteSubdealer(${index})">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function searchSubdealers() {
    const searchTerm = document.getElementById('subdealerSearch').value.toLowerCase();
    const subdealers = JSON.parse(localStorage.getItem('subdealers')) || [];
    
    const filtered = subdealers.filter(s => 
        s.name.toLowerCase().includes(searchTerm) || 
        s.contact.includes(searchTerm) ||
        s.shopName.toLowerCase().includes(searchTerm)
    );
    
    displaySubdealersInManagement(filtered);
}

// Add Subdealer Modal
function showAddSubdealerModal() {
    document.getElementById('addSubdealerModal').classList.add('active');
}

function closeAddSubdealerModal() {
    document.getElementById('addSubdealerModal').classList.remove('active');
    document.getElementById('addSubdealerForm').reset();
}

// Add Subdealer Form Handler
document.getElementById('addSubdealerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const subdealerData = {
        id: Date.now(),
        name: document.getElementById('subdealerName').value,
        contact: document.getElementById('subdealerContact').value,
        shopName: document.getElementById('subdealerShop').value,
        address: document.getElementById('subdealerAddress').value,
        balance: 0,
        workers: [],
        branches: [],
        ledger: [],
        createdAt: new Date().toISOString(),
        createdBy: currentUser.username
    };
    
    let subdealers = JSON.parse(localStorage.getItem('subdealers')) || [];
    subdealers.push(subdealerData);
    localStorage.setItem('subdealers', JSON.stringify(subdealers));
    
    closeAddSubdealerModal();
    loadSubdealersInManagement();
    alert('✅ Subdealer added successfully!');
});

function deleteSubdealer(index) {
    if (confirm('⚠️ Delete this subdealer?\n\nAll workers, branches and ledger history will be lost!')) {
        let subdealers = JSON.parse(localStorage.getItem('subdealers')) || [];
        subdealers.splice(index, 1);
        localStorage.setItem('subdealers', JSON.stringify(subdealers));
        loadSubdealersInManagement();
        alert('✅ Subdealer deleted!');
    }
}

// ==========================================
// SUBDEALER WORKERS & BRANCHES MANAGEMENT
// ==========================================

function openSubdealerDetails(index) {
    currentSubdealerIndex = index;
    const subdealers = JSON.parse(localStorage.getItem('subdealers')) || [];
    const subdealer = subdealers[index];
    
    if (!subdealer) {
        alert('❌ Subdealer not found!');
        return;
    }
    
    // Update modal header info
    document.getElementById('workerSubdealerName').textContent = subdealer.name;
    document.getElementById('workerSubdealerShop').textContent = subdealer.shopName;
    document.getElementById('workerSubdealerContact').textContent = subdealer.contact;
    
    // Load workers and branches
    loadWorkers();
    loadBranches();
    updateWorkerBranchDropdown();
    
    // Show modal
    document.getElementById('subdealerWorkersModal').classList.add('active');
}

function closeSubdealerWorkers() {
    document.getElementById('subdealerWorkersModal').classList.remove('active');
    currentSubdealerIndex = -1;
}

// Tab switching for workers/branches
function showWorkerTab(tabName) {
    document.querySelectorAll('#subdealerWorkersModal .report-content').forEach(content => {
        content.classList.remove('active');
    });
    document.querySelectorAll('#subdealerWorkersModal .report-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.getElementById(tabName + 'Tab').classList.add('active');
    event.target.classList.add('active');
}

// ==========================================
// WORKERS MANAGEMENT
// ==========================================

function loadWorkers() {
    const subdealers = JSON.parse(localStorage.getItem('subdealers')) || [];
    const subdealer = subdealers[currentSubdealerIndex];
    
    if (!subdealer) return;
    
    const workers = subdealer.workers || [];
    const tbody = document.getElementById('workersTableBody');
    tbody.innerHTML = '';
    
    if (workers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px; color: #999;">No workers added yet. Click "Add Worker" to add.</td></tr>';
        return;
    }
    
    workers.forEach((worker, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${worker.workerId}</strong></td>
            <td>${worker.name}</td>
            <td>📞 ${worker.contact}</td>
            <td><span style="background: #667eea; color: white; padding: 3px 10px; border-radius: 12px; font-size: 12px;">${worker.role}</span></td>
            <td><span style="background: #28a745; color: white; padding: 3px 10px; border-radius: 12px; font-size: 12px;">🏢 ${worker.branch || 'Not Assigned'}</span></td>
            <td>
                <button class="action-btn edit-btn" onclick="editWorker(${index})">✏️ Edit</button>
                <button class="action-btn delete-btn" onclick="deleteWorker(${index})">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function showAddWorkerModal() {
    document.getElementById('workerModalTitle').textContent = 'Add New Worker';
    document.getElementById('workerSubmitBtn').textContent = 'Add Worker';
    document.getElementById('editWorkerIndex').value = '-1';
    document.getElementById('addWorkerForm').reset();
    
    // Generate Worker ID
    const subdealers = JSON.parse(localStorage.getItem('subdealers')) || [];
    const subdealer = subdealers[currentSubdealerIndex];
    const workersCount = (subdealer?.workers || []).length;
    document.getElementById('workerID').value = 'WRK' + String(workersCount + 1).padStart(3, '0');
    
    updateWorkerBranchDropdown();
    document.getElementById('addWorkerModal').classList.add('active');
}

function closeAddWorkerModal() {
    document.getElementById('addWorkerModal').classList.remove('active');
}

function updateWorkerBranchDropdown() {
    const subdealers = JSON.parse(localStorage.getItem('subdealers')) || [];
    const subdealer = subdealers[currentSubdealerIndex];
    const branches = subdealer?.branches || [];
    
    const select = document.getElementById('workerBranch');
    select.innerHTML = '<option value="">Select Branch</option><option value="Main Branch">Main Branch</option>';
    
    branches.forEach(branch => {
        const option = document.createElement('option');
        option.value = branch.name;
        option.textContent = branch.name;
        select.appendChild(option);
    });
}

function editWorker(index) {
    const subdealers = JSON.parse(localStorage.getItem('subdealers')) || [];
    const subdealer = subdealers[currentSubdealerIndex];
    const worker = subdealer.workers[index];
    
    document.getElementById('workerModalTitle').textContent = 'Edit Worker';
    document.getElementById('workerSubmitBtn').textContent = 'Update Worker';
    document.getElementById('editWorkerIndex').value = index;
    
    document.getElementById('workerID').value = worker.workerId;
    document.getElementById('workerName').value = worker.name;
    document.getElementById('workerContact').value = worker.contact;
    document.getElementById('workerRole').value = worker.role;
    document.getElementById('workerSalary').value = worker.salary || '';
    
    updateWorkerBranchDropdown();
    document.getElementById('workerBranch').value = worker.branch || '';
    
    document.getElementById('addWorkerModal').classList.add('active');
}

function deleteWorker(index) {
    if (confirm('Delete this worker?')) {
        let subdealers = JSON.parse(localStorage.getItem('subdealers')) || [];
        subdealers[currentSubdealerIndex].workers.splice(index, 1);
        localStorage.setItem('subdealers', JSON.stringify(subdealers));
        loadWorkers();
        alert('✅ Worker deleted!');
    }
}

// Worker Form Handler
document.getElementById('addWorkerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const editIndex = parseInt(document.getElementById('editWorkerIndex').value);
    
    const workerData = {
        workerId: document.getElementById('workerID').value,
        name: document.getElementById('workerName').value,
        contact: document.getElementById('workerContact').value,
        role: document.getElementById('workerRole').value,
        branch: document.getElementById('workerBranch').value,
        salary: parseFloat(document.getElementById('workerSalary').value) || 0,
        addedAt: new Date().toISOString(),
        addedBy: currentUser.username
    };
    
    let subdealers = JSON.parse(localStorage.getItem('subdealers')) || [];
    
    if (editIndex >= 0) {
        // Update existing worker
        subdealers[currentSubdealerIndex].workers[editIndex] = {
            ...subdealers[currentSubdealerIndex].workers[editIndex],
            ...workerData
        };
        alert('✅ Worker updated successfully!');
    } else {
        // Add new worker
        if (!subdealers[currentSubdealerIndex].workers) {
            subdealers[currentSubdealerIndex].workers = [];
        }
        subdealers[currentSubdealerIndex].workers.push(workerData);
        alert('✅ Worker added successfully!');
    }
    
    localStorage.setItem('subdealers', JSON.stringify(subdealers));
    closeAddWorkerModal();
    loadWorkers();
});

// ==========================================
// BRANCHES MANAGEMENT
// ==========================================

function loadBranches() {
    const subdealers = JSON.parse(localStorage.getItem('subdealers')) || [];
    const subdealer = subdealers[currentSubdealerIndex];
    
    if (!subdealer) return;
    
    const branches = subdealer.branches || [];
    const workers = subdealer.workers || [];
    const tbody = document.getElementById('branchesTableBody');
    tbody.innerHTML = '';
    
    if (branches.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px; color: #999;">No branches added yet. Click "Add Branch" to add.</td></tr>';
        return;
    }
    
    branches.forEach((branch, index) => {
        // Count workers in this branch
        const branchWorkers = workers.filter(w => w.branch === branch.name).length;
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>🏢 ${branch.name}</strong></td>
            <td>📍 ${branch.location}</td>
            <td>${branch.manager || 'Not Assigned'}</td>
            <td><span style="background: #17a2b8; color: white; padding: 3px 10px; border-radius: 12px; font-size: 12px;">👷 ${branchWorkers} Workers</span></td>
            <td>
                <button class="action-btn edit-btn" onclick="editBranch(${index})">✏️ Edit</button>
                <button class="action-btn delete-btn" onclick="deleteBranch(${index})">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function showAddBranchModal() {
    document.getElementById('branchModalTitle').textContent = 'Add New Branch';
    document.getElementById('branchSubmitBtn').textContent = 'Add Branch';
    document.getElementById('editBranchIndex').value = '-1';
    document.getElementById('addBranchForm').reset();
    document.getElementById('addBranchModal').classList.add('active');
}

function closeAddBranchModal() {
    document.getElementById('addBranchModal').classList.remove('active');
}

function editBranch(index) {
    const subdealers = JSON.parse(localStorage.getItem('subdealers')) || [];
    const subdealer = subdealers[currentSubdealerIndex];
    const branch = subdealer.branches[index];
    
    document.getElementById('branchModalTitle').textContent = 'Edit Branch';
    document.getElementById('branchSubmitBtn').textContent = 'Update Branch';
    document.getElementById('editBranchIndex').value = index;
    
    document.getElementById('branchName').value = branch.name;
    document.getElementById('branchLocation').value = branch.location;
    document.getElementById('branchManager').value = branch.manager || '';
    document.getElementById('branchContact').value = branch.contact;
    
    document.getElementById('addBranchModal').classList.add('active');
}

function deleteBranch(index) {
    const subdealers = JSON.parse(localStorage.getItem('subdealers')) || [];
    const branch = subdealers[currentSubdealerIndex].branches[index];
    
    // Check if workers are assigned to this branch
    const assignedWorkers = (subdealers[currentSubdealerIndex].workers || []).filter(w => w.branch === branch.name);
    
    if (assignedWorkers.length > 0) {
        if (!confirm(`⚠️ Warning!\n\n${assignedWorkers.length} workers are assigned to this branch.\n\nDeleting will unassign them. Continue?`)) {
            return;
        }
        
        // Unassign workers from this branch
        subdealers[currentSubdealerIndex].workers.forEach(worker => {
            if (worker.branch === branch.name) {
                worker.branch = '';
            }
        });
    }
    
    if (confirm('Delete this branch?')) {
        subdealers[currentSubdealerIndex].branches.splice(index, 1);
        localStorage.setItem('subdealers', JSON.stringify(subdealers));
        loadBranches();
        loadWorkers();
        updateWorkerBranchDropdown();
        alert('✅ Branch deleted!');
    }
}

// Branch Form Handler
document.getElementById('addBranchForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const editIndex = parseInt(document.getElementById('editBranchIndex').value);
    
    const branchData = {
        name: document.getElementById('branchName').value,
        location: document.getElementById('branchLocation').value,
        manager: document.getElementById('branchManager').value,
        contact: document.getElementById('branchContact').value,
        addedAt: new Date().toISOString(),
        addedBy: currentUser.username
    };
    
    let subdealers = JSON.parse(localStorage.getItem('subdealers')) || [];
    
    if (editIndex >= 0) {
        // Update existing branch - also update workers with old branch name
        const oldBranchName = subdealers[currentSubdealerIndex].branches[editIndex].name;
        
        if (oldBranchName !== branchData.name) {
            // Update workers with new branch name
            subdealers[currentSubdealerIndex].workers?.forEach(worker => {
                if (worker.branch === oldBranchName) {
                    worker.branch = branchData.name;
                }
            });
        }
        
        subdealers[currentSubdealerIndex].branches[editIndex] = {
            ...subdealers[currentSubdealerIndex].branches[editIndex],
            ...branchData
        };
        alert('✅ Branch updated successfully!');
    } else {
        // Add new branch
        if (!subdealers[currentSubdealerIndex].branches) {
            subdealers[currentSubdealerIndex].branches = [];
        }
        subdealers[currentSubdealerIndex].branches.push(branchData);
        alert('✅ Branch added successfully!');
    }
    
    localStorage.setItem('subdealers', JSON.stringify(subdealers));
    closeAddBranchModal();
    loadBranches();
    loadWorkers();
    updateWorkerBranchDropdown();
});

// ==========================================
// SUBDEALER LEDGER
// ==========================================

function showSubdealerLedger(index) {
    currentSubdealerIndex = index;
    const subdealers = JSON.parse(localStorage.getItem('subdealers')) || [];
    const subdealer = subdealers[index];
    
    if (!subdealer) {
        alert('❌ Subdealer not found!');
        return;
    }
    
    document.getElementById('subdealerLedgerName').textContent = `📒 ${subdealer.name} - Ledger`;
    
    const balance = subdealer.balance || 0;
    const balanceColor = balance > 0 ? '#dc3545' : '#28a745';
    
    document.getElementById('subdealerLedgerInfo').innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
            <div>
                <strong>Shop Name:</strong><br>
                <span style="font-size: 16px;">🏪 ${subdealer.shopName}</span>
            </div>
            <div>
                <strong>Contact:</strong><br>
                <span style="font-size: 16px;">📞 ${subdealer.contact}</span>
            </div>
            <div>
                <strong>Current Balance:</strong><br>
                <span style="font-size: 20px; font-weight: bold; color: ${balanceColor};">Rs. ${balance.toLocaleString()}</span>
            </div>
        </div>
    `;
    
    loadSubdealerLedger();
    document.getElementById('subdealerLedgerModal').classList.add('active');
}

function closeSubdealerLedger() {
    document.getElementById('subdealerLedgerModal').classList.remove('active');
}

function loadSubdealerLedger() {
    const subdealers = JSON.parse(localStorage.getItem('subdealers')) || [];
    const subdealer = subdealers[currentSubdealerIndex];
    
    if (!subdealer) return;
    
    const ledger = subdealer.ledger || [];
    const tbody = document.getElementById('subdealerLedgerBody');
    tbody.innerHTML = '';
    
    if (ledger.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px; color: #999;">No transactions yet.</td></tr>';
        return;
    }
    
    let runningBalance = 0;
    
    ledger.forEach(entry => {
        if (entry.type === 'debit') {
            runningBalance += entry.amount;
        } else {
            runningBalance -= entry.amount;
        }
        
        const date = new Date(entry.date);
        const balanceColor = runningBalance > 0 ? '#dc3545' : '#28a745';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${date.toLocaleDateString()}</td>
            <td>${entry.description}</td>
            <td style="color: #dc3545; font-weight: 600;">${entry.type === 'debit' ? 'Rs. ' + entry.amount.toLocaleString() : '-'}</td>
            <td style="color: #28a745; font-weight: 600;">${entry.type === 'credit' ? 'Rs. ' + entry.amount.toLocaleString() : '-'}</td>
            <td style="color: ${balanceColor}; font-weight: 600;">Rs. ${runningBalance.toLocaleString()}</td>
            <td>${entry.admin}</td>
        `;
        tbody.appendChild(tr);
    });
}

function showAddSubdealerTransaction() {
    document.getElementById('addSubdealerTransactionModal').classList.add('active');
}

function closeAddSubdealerTransaction() {
    document.getElementById('addSubdealerTransactionModal').classList.remove('active');
    document.getElementById('addSubdealerTransactionForm').reset();
}

// Transaction Form Handler
document.getElementById('addSubdealerTransactionForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const transactionData = {
        type: document.getElementById('transactionType').value,
        amount: parseFloat(document.getElementById('transactionAmount').value),
        description: document.getElementById('transactionDescription').value,
        date: new Date().toISOString(),
        admin: currentUser.username
    };
    
    let subdealers = JSON.parse(localStorage.getItem('subdealers')) || [];
    
    if (!subdealers[currentSubdealerIndex].ledger) {
        subdealers[currentSubdealerIndex].ledger = [];
    }
    
    subdealers[currentSubdealerIndex].ledger.push(transactionData);
    
    // Update balance
    if (transactionData.type === 'debit') {
        subdealers[currentSubdealerIndex].balance = (subdealers[currentSubdealerIndex].balance || 0) + transactionData.amount;
    } else {
        subdealers[currentSubdealerIndex].balance = (subdealers[currentSubdealerIndex].balance || 0) - transactionData.amount;
    }
    
    localStorage.setItem('subdealers', JSON.stringify(subdealers));
    
    closeAddSubdealerTransaction();
    showSubdealerLedger(currentSubdealerIndex);
    alert('✅ Transaction added successfully!');
});
