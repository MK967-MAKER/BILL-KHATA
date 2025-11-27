// Initialize license keys
function initializeLicenseKeys() {
    let licenseKeys = JSON.parse(localStorage.getItem('licenseKeys')) || [];
    
    // Don't auto-generate keys - admin will generate as needed
    
    return licenseKeys;
}

function generateKeyCode() {
    const segments = [];
    for (let i = 0; i < 4; i++) {
        const segment = Math.random().toString(36).substring(2, 7).toUpperCase();
        segments.push(segment);
    }
    return segments.join('-');
}

function loadKeys() {
    const licenseKeys = initializeLicenseKeys();
    const filter = document.getElementById('keyFilter').value;
    const grid = document.getElementById('keysGrid');
    
    // Filter keys - default to active only
    let filteredKeys = licenseKeys;
    if (filter === 'active') {
        filteredKeys = licenseKeys.filter(k => k.status === 'active');
    } else if (filter === 'inactive') {
        filteredKeys = licenseKeys.filter(k => k.status === 'inactive');
    } else if (filter === 'blocked') {
        filteredKeys = licenseKeys.filter(k => k.status === 'blocked');
    }
    
    // Update stats - only show active count
    const activeCount = licenseKeys.filter(k => k.status === 'active').length;
    
    document.getElementById('activeKeys').textContent = activeCount;
    
    // Sort keys - newest at bottom
    filteredKeys.sort((a, b) => new Date(a.createdDate) - new Date(b.createdDate));
    
    // Render keys
    grid.innerHTML = '';
    filteredKeys.forEach((key, index) => {
        const keyCard = document.createElement('div');
        keyCard.className = `key-card ${key.status}`;
        
        let statusBadge;
        if (key.status === 'active') {
            statusBadge = `<span class="key-status active">ACTIVE</span>`;
        } else if (key.status === 'blocked') {
            statusBadge = `<span class="key-status blocked">BLOCKED</span>`;
        } else {
            statusBadge = `<span class="key-status inactive">AVAILABLE</span>`;
        }
        
        let assignedInfo = '';
        if (key.status === 'active' && key.assignedTo) {
            // Find user index for profile link
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const userIndex = users.findIndex(u => u.username === key.assignedTo);
            
            if (userIndex !== -1) {
                assignedInfo = `<div class="key-info">👤 Assigned to: <strong><a href="user-profile.html?id=${userIndex}" target="_blank" style="color: #667eea; text-decoration: none; cursor: pointer;">${key.assignedTo}</a></strong></div>`;
            } else {
                assignedInfo = `<div class="key-info">👤 Assigned to: <strong>${key.assignedTo}</strong></div>`;
            }
        }
        
        const activatedInfo = key.status === 'active' && key.activatedDate
            ? `<div class="key-info">📅 Activated: ${new Date(key.activatedDate).toLocaleDateString()}</div>`
            : '';
        
        let actions;
        if (key.status === 'active') {
            actions = `
                <button class="btn-block" onclick="blockKey(${key.id})">🚫 Block</button>
                <button class="btn-deactivate" onclick="deactivateKey(${key.id})">Deactivate</button>
            `;
        } else if (key.status === 'blocked') {
            actions = `<button class="btn-unblock" onclick="unblockKey(${key.id})">✅ Unblock</button>`;
        } else {
            actions = `<button class="btn-activate" onclick="activateKey(${key.id})">Activate</button>`;
        }
        
        keyCard.innerHTML = `
            <div class="key-header">
                <span class="key-number">Key #${key.id}</span>
                ${statusBadge}
            </div>
            <div class="key-code" id="key-${key.id}">••••••••••••••••••••</div>
            <div class="key-info">📜 Type: <strong>${key.type.toUpperCase()}</strong></div>
            <div class="key-info">⏱️ Duration: ${key.duration === 'Unlimited' ? 'Unlimited' : key.duration + ' days'}</div>
            ${assignedInfo}
            ${activatedInfo}
            <div class="key-actions">
                <button class="btn-view" onclick="toggleKeyView(${key.id}, '${key.key}')">👁️ View</button>
                <button class="btn-copy" onclick="copyKey('${key.key}')">📋 Copy</button>
                ${actions}
            </div>
        `;
        
        grid.appendChild(keyCard);
    });
    
    if (filteredKeys.length === 0) {
        let message = 'No keys found';
        if (filter === 'active') {
            message = 'No active keys. Generate a new key and activate it to see it here.';
        } else if (filter === 'inactive') {
            message = 'No available keys. Generate new keys to see them here.';
        } else if (filter === 'blocked') {
            message = 'No blocked keys.';
        }
        grid.innerHTML = `<div class="no-requests"><p>${message}</p></div>`;
    }
}

function generateNewKey() {
    // Ask for license type
    const licenseType = prompt('Select license type:\n\n1 - Monthly (30 days)\n2 - Lifetime (Unlimited)\n\nEnter 1 or 2:');
    
    if (!licenseType || (licenseType !== '1' && licenseType !== '2')) {
        alert('Invalid selection. Key generation cancelled.');
        return;
    }
    
    const licenseKeys = JSON.parse(localStorage.getItem('licenseKeys')) || [];
    
    // Generate unique ID based on highest existing ID
    const newId = licenseKeys.length > 0 
        ? Math.max(...licenseKeys.map(k => k.id)) + 1 
        : 1;
    const isLifetime = licenseType === '2';
    
    const newKey = {
        id: newId,
        key: generateKeyCode(),
        status: 'inactive',
        type: isLifetime ? 'lifetime' : 'monthly',
        duration: isLifetime ? 'Unlimited' : 30,
        createdDate: new Date().toISOString(),
        activatedDate: null,
        assignedTo: null
    };
    
    licenseKeys.push(newKey);
    localStorage.setItem('licenseKeys', JSON.stringify(licenseKeys));
    
    const durationText = isLifetime ? 'Lifetime (Unlimited)' : '30 days';
    alert(`New license key generated!\n\nKey: ${newKey.key}\nType: ${newKey.type.toUpperCase()}\nDuration: ${durationText}`);
    
    // Reload keys to show new key at bottom and update counter
    loadKeys();
    
    // Scroll to bottom to show new key
    setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
}

function copyKey(keyCode) {
    navigator.clipboard.writeText(keyCode).then(() => {
        alert(`License key copied to clipboard!\n\n${keyCode}`);
    }).catch(() => {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = keyCode;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert(`License key copied!\n\n${keyCode}`);
    });
}

function activateKey(keyId) {
    const username = prompt('Enter username to assign this key:');
    if (!username) return;
    
    const licenseKeys = JSON.parse(localStorage.getItem('licenseKeys')) || [];
    const keyIndex = licenseKeys.findIndex(k => k.id === keyId);
    
    if (keyIndex !== -1) {
        licenseKeys[keyIndex].status = 'active';
        licenseKeys[keyIndex].activatedDate = new Date().toISOString();
        licenseKeys[keyIndex].assignedTo = username;
        
        localStorage.setItem('licenseKeys', JSON.stringify(licenseKeys));
        alert(`License key activated for ${username}!`);
        loadKeys();
    }
}

function deactivateKey(keyId) {
    if (!confirm('Are you sure you want to deactivate this license key?')) return;
    
    const licenseKeys = JSON.parse(localStorage.getItem('licenseKeys')) || [];
    const keyIndex = licenseKeys.findIndex(k => k.id === keyId);
    
    if (keyIndex !== -1) {
        licenseKeys[keyIndex].status = 'inactive';
        licenseKeys[keyIndex].activatedDate = null;
        licenseKeys[keyIndex].assignedTo = null;
        
        localStorage.setItem('licenseKeys', JSON.stringify(licenseKeys));
        alert('License key deactivated!');
        loadKeys();
    }
}

// Load keys on page load
loadKeys();


function blockKey(keyId) {
    if (!confirm('Are you sure you want to BLOCK this license key? The user will lose access immediately.')) return;
    
    const licenseKeys = JSON.parse(localStorage.getItem('licenseKeys')) || [];
    const keyIndex = licenseKeys.findIndex(k => k.id === keyId);
    
    if (keyIndex !== -1) {
        const previousUser = licenseKeys[keyIndex].assignedTo;
        licenseKeys[keyIndex].status = 'blocked';
        licenseKeys[keyIndex].blockedDate = new Date().toISOString();
        
        localStorage.setItem('licenseKeys', JSON.stringify(licenseKeys));
        alert(`License key BLOCKED!\n\nUser "${previousUser}" can no longer use this key.`);
        loadKeys();
    }
}

function unblockKey(keyId) {
    if (!confirm('Are you sure you want to UNBLOCK this license key?')) return;
    
    const licenseKeys = JSON.parse(localStorage.getItem('licenseKeys')) || [];
    const keyIndex = licenseKeys.findIndex(k => k.id === keyId);
    
    if (keyIndex !== -1) {
        licenseKeys[keyIndex].status = 'inactive';
        licenseKeys[keyIndex].blockedDate = null;
        
        localStorage.setItem('licenseKeys', JSON.stringify(licenseKeys));
        alert('License key UNBLOCKED and is now available for use!');
        loadKeys();
    }
}


function toggleKeyView(keyId, keyCode) {
    const keyElement = document.getElementById(`key-${keyId}`);
    
    if (keyElement.textContent === '••••••••••••••••••••') {
        // Show the key
        keyElement.textContent = keyCode;
        keyElement.style.color = '#28a745';
        
        // Hide after 5 seconds
        setTimeout(() => {
            keyElement.textContent = '••••••••••••••••••••';
            keyElement.style.color = '#667eea';
        }, 5000);
    } else {
        // Hide the key
        keyElement.textContent = '••••••••••••••••••••';
        keyElement.style.color = '#667eea';
    }
}
