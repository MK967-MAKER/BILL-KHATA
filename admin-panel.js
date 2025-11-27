// Get current admin from localStorage
let currentAdmin = JSON.parse(localStorage.getItem('currentUser'));

// Check if admin is logged in
if (!currentAdmin || currentAdmin.role !== 'admin') {
    alert('Please login as admin first!');
    window.location.href = 'index.html';
}

// Display admin info
document.getElementById('adminName').textContent = currentAdmin.username;
document.getElementById('adminUsername').textContent = currentAdmin.username;

// Initialize dashboard
function initDashboard() {
    loadInventory();
    loadClients();
    loadSalesHistory();
    loadSettings();
}

function showSection(sectionName) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    document.getElementById(sectionName).classList.add('active');
    event.target.classList.add('active');
    
    const titles = {
        inventory: 'Inventory Management',
        clients: 'Clients & Ledger',
        sales: 'Sales History',
        settings: 'Shop Settings'
    };
    
    document.getElementById('pageTitle').textContent = titles[sectionName];
}

function loadInventory() {
    let products = JSON.parse(localStorage.getItem('products')) || getDefaultProducts();
    localStorage.setItem('products', JSON.stringify(products));
    
    const tbody = document.getElementById('inventoryTableBody');
    tbody.innerHTML = '';
    
    products.forEach((product, index) => {
        let statusClass = 'status-active';
        let statusText = 'In Stock';
        
        if (product.stock === 0) {
            statusClass = 'status-expired';
            statusText = 'Out of Stock';
        } else if (product.stock <= 5) {
            statusClass = 'status-expiring';
            statusText = 'Low Stock';
        }
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${product.icon || '📦'} ${product.name}</td>
            <td>${product.category}</td>
            <td>Rs. ${product.price.toLocaleString()}</td>
            <td>${product.stock}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>
                <button class="action-btn edit-btn" onclick="editProduct(${index})">✏️ Edit</button>
                <button class="action-btn delete-btn" onclick="deleteProduct(${index})">🗑️ Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function getDefaultProducts() {
    return [
        { id: 1, name: 'Laptop', category: 'Electronics', price: 45000, stock: 10, icon: '💻' },
        { id: 2, name: 'Mouse', category: 'Accessories', price: 800, stock: 50, icon: '🖱️' },
        { id: 3, name: 'Keyboard', category: 'Accessories', price: 1500, stock: 30, icon: '⌨️' },
        { id: 4, name: 'Monitor', category: 'Electronics', price: 25000, stock: 15, icon: '🖥️' },
        { id: 5, name: 'USB Cable', category: 'Accessories', price: 200, stock: 100, icon: '🔌' },
        { id: 6, name: 'Headphones', category: 'Audio', price: 3500, stock: 25, icon: '🎧' },
        { id: 7, name: 'Webcam', category: 'Electronics', price: 5000, stock: 20, icon: '📷' },
        { id: 8, name: 'Speaker', category: 'Audio', price: 4500, stock: 18, icon: '🔊' },
        { id: 9, name: 'Phone', category: 'Mobile', price: 35000, stock: 12, icon: '📱' },
        { id: 10, name: 'Tablet', category: 'Mobile', price: 28000, stock: 8, icon: '📲' }
    ];
}

function loadSalesHistory() {
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    const tbody = document.getElementById('salesTableBody');
    
    // Calculate stats
    const totalRevenue = transactions.reduce((sum, t) => sum + t.total, 0);
    const today = new Date().toDateString();
    const todaySales = transactions
        .filter(t => new Date(t.date).toDateString() === today)
        .reduce((sum, t) => sum + t.total, 0);
    
    document.getElementById('totalRevenue').textContent = `Rs. ${totalRevenue.toLocaleString()}`;
    document.getElementById('totalTransactions').textContent = transactions.length;
    document.getElementById('todaySales').textContent = `Rs. ${todaySales.toLocaleString()}`;
    
    tbody.innerHTML = '';
    
    if (transactions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">No sales yet</td></tr>';
        return;
    }
    
    transactions.reverse().forEach((transaction, index) => {
        const date = new Date(transaction.date);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${date.toLocaleDateString()}</td>
            <td>${date.toLocaleTimeString()}</td>
            <td>${transaction.items.length} items</td>
            <td>Rs. ${transaction.total.toLocaleString()}</td>
            <td>${transaction.admin}</td>
            <td>
                <button class="action-btn edit-btn" onclick="viewTransaction(${transactions.length - 1 - index})">👁️ View</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function viewTransaction(index) {
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    const transaction = transactions[index];
    
    let itemsList = transaction.items.map(item => 
        `${item.name} × ${item.quantity} = Rs. ${item.total.toLocaleString()}`
    ).join('\n');
    
    alert(`Transaction Details:\n\nDate: ${new Date(transaction.date).toLocaleString()}\n\nItems:\n${itemsList}\n\nTotal: Rs. ${transaction.total.toLocaleString()}\nPaid: Rs. ${transaction.paid.toLocaleString()}\nChange: Rs. ${transaction.change.toLocaleString()}`);
}

function loadSettings() {
    const shopSettings = JSON.parse(localStorage.getItem('shopSettings')) || {};
    const printerSettings = JSON.parse(localStorage.getItem('printerSettings')) || {};
    
    // Shop settings
    document.getElementById('shopName').value = shopSettings.shopName || '';
    document.getElementById('ownerName').value = currentAdmin.username;
    document.getElementById('shopContact').value = shopSettings.contact || '';
    document.getElementById('shopAddress').value = shopSettings.address || '';
    
    // Printer settings
    document.getElementById('receiptHeader').value = printerSettings.header || 'Welcome!';
    document.getElementById('receiptFooter').value = printerSettings.footer || 'Thank you for your purchase!';
    document.getElementById('currencySymbol').value = printerSettings.currency || 'Rs.';
    document.getElementById('taxPercentage').value = printerSettings.taxPercentage || 0;
    document.getElementById('showShopInfo').checked = printerSettings.showShopInfo !== false;
    document.getElementById('autoPrint').checked = printerSettings.autoPrint !== false;
    
    // Account settings
    document.getElementById('settingsEmail').value = currentAdmin.email || '';
}

function showAddProductModal() {
    document.getElementById('addProductModal').classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function editProduct(index) {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products[index];
    
    const newStock = prompt(`Edit stock for ${product.name}\nCurrent stock: ${product.stock}`, product.stock);
    if (newStock !== null) {
        products[index].stock = parseInt(newStock);
        localStorage.setItem('products', JSON.stringify(products));
        loadInventory();
        alert('✅ Product updated!');
    }
}

function deleteProduct(index) {
    if (confirm('Delete this product?')) {
        let products = JSON.parse(localStorage.getItem('products')) || [];
        products.splice(index, 1);
        localStorage.setItem('products', JSON.stringify(products));
        loadInventory();
        alert('✅ Product deleted!');
    }
}

function loadClients() {
    const clients = JSON.parse(localStorage.getItem('clients')) || [];
    const tbody = document.getElementById('clientsTableBody');
    
    tbody.innerHTML = '';
    
    if (clients.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">No clients found</td></tr>';
        return;
    }
    
    clients.forEach((client, index) => {
        const balance = client.balance || 0;
        const balanceColor = balance > 0 ? '#dc3545' : '#28a745';
        const lastTransaction = client.ledger && client.ledger.length > 0 
            ? new Date(client.ledger[0].date).toLocaleDateString() 
            : 'N/A';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${client.name}</strong></td>
            <td>${client.contact}</td>
            <td style="color: ${balanceColor}; font-weight: 600;">Rs. ${balance.toLocaleString()}</td>
            <td>${lastTransaction}</td>
            <td>
                <button class="action-btn edit-btn" onclick="viewClientLedger(${index})">📋 Ledger</button>
                <button class="action-btn delete-btn" onclick="deleteClient(${index})">🗑️ Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function viewClientLedger(index) {
    const clients = JSON.parse(localStorage.getItem('clients')) || [];
    const client = clients[index];
    
    document.getElementById('ledgerClientName').textContent = `${client.name} - Ledger`;
    
    const balance = client.balance || 0;
    const balanceColor = balance > 0 ? '#dc3545' : '#28a745';
    
    document.getElementById('ledgerClientInfo').innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
            <div>
                <strong>Contact:</strong><br>${client.contact}
            </div>
            <div>
                <strong>Address:</strong><br>${client.address || 'N/A'}
            </div>
            <div>
                <strong style="color: ${balanceColor};">Current Balance:</strong><br>
                <span style="font-size: 20px; color: ${balanceColor};">Rs. ${balance.toLocaleString()}</span>
            </div>
        </div>
    `;
    
    const ledger = client.ledger || [];
    const tbody = document.getElementById('ledgerTableBody');
    tbody.innerHTML = '';
    
    if (ledger.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">No transactions yet</td></tr>';
    } else {
        ledger.forEach(entry => {
            const tr = document.createElement('tr');
            const debitColor = entry.debit > 0 ? '#dc3545' : '';
            const creditColor = entry.credit > 0 ? '#28a745' : '';
            
            tr.innerHTML = `
                <td>${new Date(entry.date).toLocaleString()}</td>
                <td>${entry.description}</td>
                <td style="color: ${debitColor};">${entry.debit > 0 ? 'Rs. ' + entry.debit.toLocaleString() : '-'}</td>
                <td style="color: ${creditColor};">${entry.credit > 0 ? 'Rs. ' + entry.credit.toLocaleString() : '-'}</td>
                <td><strong>Rs. ${entry.balance.toLocaleString()}</strong></td>
                <td>${entry.admin}</td>
            `;
            tbody.appendChild(tr);
        });
    }
    
    document.getElementById('clientLedgerModal').classList.add('active');
}

function closeLedgerModal() {
    document.getElementById('clientLedgerModal').classList.remove('active');
}

function deleteClient(index) {
    if (confirm('Delete this client? All ledger history will be lost.')) {
        let clients = JSON.parse(localStorage.getItem('clients')) || [];
        clients.splice(index, 1);
        localStorage.setItem('clients', JSON.stringify(clients));
        loadClients();
        alert('✅ Client deleted!');
    }
}

function closeClientModal() {
    // This function can be used if needed
}

// Add Product Form
document.getElementById('addProductForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    let products = JSON.parse(localStorage.getItem('products')) || [];
    
    const newProduct = {
        id: Date.now(),
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value,
        price: parseFloat(document.getElementById('productPrice').value),
        stock: parseInt(document.getElementById('productStock').value),
        icon: document.getElementById('productIcon').value || '📦'
    };
    
    products.push(newProduct);
    localStorage.setItem('products', JSON.stringify(products));
    
    closeModal('addProductModal');
    loadInventory();
    this.reset();
    alert('✅ Product added successfully!');
});

// Shop Settings Form
document.getElementById('shopSettingsForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const shopSettings = {
        shopName: document.getElementById('shopName').value,
        contact: document.getElementById('shopContact').value,
        address: document.getElementById('shopAddress').value
    };
    
    localStorage.setItem('shopSettings', JSON.stringify(shopSettings));
    alert('✅ Shop settings saved!');
});

// Printer Settings Form
document.getElementById('printerSettingsForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const printerSettings = {
        header: document.getElementById('receiptHeader').value,
        footer: document.getElementById('receiptFooter').value,
        currency: document.getElementById('currencySymbol').value,
        taxPercentage: parseFloat(document.getElementById('taxPercentage').value) || 0,
        showShopInfo: document.getElementById('showShopInfo').checked,
        autoPrint: document.getElementById('autoPrint').checked
    };
    
    localStorage.setItem('printerSettings', JSON.stringify(printerSettings));
    alert('✅ Printer settings saved!');
});

// Admin Settings Form
document.getElementById('adminSettingsForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const newEmail = document.getElementById('settingsEmail').value;
    const newPassword = document.getElementById('settingsPassword').value;
    
    let admins = JSON.parse(localStorage.getItem('admins')) || [];
    const adminIndex = admins.findIndex(a => a.username === currentAdmin.username);
    
    if (adminIndex !== -1) {
        admins[adminIndex].email = newEmail;
        if (newPassword) {
            admins[adminIndex].password = newPassword;
        }
        localStorage.setItem('admins', JSON.stringify(admins));
        
        // Update current session
        currentAdmin.email = newEmail;
        if (newPassword) currentAdmin.password = newPassword;
        localStorage.setItem('currentUser', JSON.stringify(currentAdmin));
        
        alert('✅ Account updated successfully!');
        document.getElementById('settingsPassword').value = '';
    }
});

// Initialize dashboard on load
initDashboard();
