const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');

loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    
    // Check for superadmin first
    if (username === 'superadmin' && password === 'super123') {
        const superadminUser = {
            username: 'superadmin',
            password: 'super123',
            mobile: '03000475694',
            email: 'superadmin@pos.com',
            role: 'superadmin',
            profileEnabled: true
        };
        localStorage.setItem('currentUser', JSON.stringify(superadminUser));
        window.location.href = 'superadmin.html';
        return;
    }
    
    // Check for admin login
    const admins = JSON.parse(localStorage.getItem('admins')) || [];
    const admin = admins.find(a => 
        (a.username === username || a.email === username) 
        && a.password === password
    );
    
    if (admin) {
        const adminUser = {
            ...admin,
            role: 'admin',
            profileEnabled: true,
            lastLogin: new Date().toISOString()
        };
        localStorage.setItem('currentUser', JSON.stringify(adminUser));
        
        // Restore user's previous POS data if exists
        restoreUserPOSData(username);
        
        window.location.href = 'pos-system.html';
        return;
    }
    
    // Check for regular user login
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => 
        (u.username === username || u.mobile === username || u.email === username) 
        && u.password === password
    );
    
    if (user) {
        const userData = {
            ...user,
            lastLogin: new Date().toISOString()
        };
        localStorage.setItem('currentUser', JSON.stringify(userData));
        
        // Restore user's previous POS data if exists
        restoreUserPOSData(username);
        
        // Redirect based on account type
        if (user.accountType === 'user') {
            window.location.href = 'user-pos.html';
        } else {
            window.location.href = 'pos-system.html';
        }
        return;
    }
    
    // Invalid credentials
    alert('❌ Invalid username or password');
});

// Chatbot functionality
const chatbot = document.getElementById('chatbot');
const chatbotToggle = document.getElementById('chatbotToggle');
const closeChatbot = document.getElementById('closeChatbot');
const chatInput = document.getElementById('chatInput');
const sendMessage = document.getElementById('sendMessage');
const chatbotMessages = document.getElementById('chatbotMessages');

chatbotToggle.addEventListener('click', () => {
    chatbot.classList.add('active');
    chatbotToggle.style.display = 'none';
});

closeChatbot.addEventListener('click', () => {
    chatbot.classList.remove('active');
    chatbotToggle.style.display = 'block';
});

sendMessage.addEventListener('click', sendChatMessage);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendChatMessage();
});

function sendChatMessage() {
    const message = chatInput.value.trim();
    if (!message) return;
    
    // Add user message
    const userMsg = document.createElement('div');
    userMsg.className = 'user-message';
    userMsg.textContent = message;
    chatbotMessages.appendChild(userMsg);
    
    chatInput.value = '';
    
    // Simulate sending to admin
    setTimeout(() => {
        const botMsg = document.createElement('div');
        botMsg.className = 'bot-message';
        botMsg.textContent = 'Your message has been sent to admin. They will respond shortly.';
        chatbotMessages.appendChild(botMsg);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        
        // Store message for admin
        let adminMessages = JSON.parse(localStorage.getItem('adminMessages')) || [];
        adminMessages.push({
            message: message,
            timestamp: new Date().toISOString(),
            from: usernameInput.value || 'Guest'
        });
        localStorage.setItem('adminMessages', JSON.stringify(adminMessages));
    }, 1000);
    
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}


// Restore user's POS data from previous session
function restoreUserPOSData(username) {
    const userBackups = JSON.parse(localStorage.getItem('userBackups')) || {};
    
    if (userBackups[username]) {
        const userData = userBackups[username];
        
        // Restore all data
        localStorage.setItem('products', JSON.stringify(userData.products || []));
        localStorage.setItem('transactions', JSON.stringify(userData.transactions || []));
        localStorage.setItem('clients', JSON.stringify(userData.clients || []));
        localStorage.setItem('subdealers', JSON.stringify(userData.subdealers || []));
        localStorage.setItem('suppliers', JSON.stringify(userData.suppliers || []));
        localStorage.setItem('returns', JSON.stringify(userData.returns || []));
        localStorage.setItem('discounts', JSON.stringify(userData.discounts || []));
        localStorage.setItem('promos', JSON.stringify(userData.promos || []));
        localStorage.setItem('loyalty', JSON.stringify(userData.loyalty || []));
        localStorage.setItem('settings', JSON.stringify(userData.settings || {}));
    }
}
