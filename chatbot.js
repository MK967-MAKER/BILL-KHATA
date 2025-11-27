// Chatbot functionality
let selectedLanguage = null;
let chatHistory = [];

const paymentAccounts = {
    faysal: {
        name: "Faysal Bank",
        account: "3084301000009320",
        holder: "Muhammad Azam"
    },
    jazzcash: {
        name: "JazzCash",
        account: "03144305446",
        holder: "Ahmed Hassan"
    },
    easypaisa: {
        name: "EasyPaisa",
        account: "03144305446",
        holder: "Ahmed Hassan"
    },
    raast: {
        name: "Raast ID",
        account: "03000475694",
        holder: "Muhammad Azam"
    },
    nayapay: {
        name: "NayaPay",
        account: "03000475694",
        holder: "Muhammad Azam"
    }
};

const responses = {
    english: {
        greeting: "Hello! Welcome to POS System Support. How can I help you today?",
        license: "We offer two license types:\n• Monthly License (30 days) - Rs. 1,000\n• Lifetime License (Unlimited) - Rs. 5,000\n\nWhich one interests you?",
        payment: "Please select your payment method:",
        support: "Our support team is available 24/7. Your message has been forwarded to admin. They will respond shortly.",
        features: "Our POS System includes:\n• Sales Management\n• Inventory Tracking\n• Purchase Orders\n• Revenue Reports\n• User Management\n\nWould you like to know more about any feature?",
        thanks: "You're welcome! Feel free to ask if you need anything else.",
        default: "I understand. Let me forward your message to our admin team. They will get back to you soon.",
        tillId: "Till ID is not available yet. Please use other payment methods."
    },
    urdu: {
        greeting: "السلام علیکم! POS سسٹم سپورٹ میں خوش آمدید۔ میں آپ کی کیسے مدد کر سکتا ہوں؟",
        license: "ہم دو قسم کے لائسنس پیش کرتے ہیں:\n• ماہانہ لائسنس (30 دن) - 1,000 روپے\n• لائف ٹائم لائسنس (لامحدود) - 5,000 روپے\n\nآپ کو کون سا پسند ہے؟",
        payment: "براہ کرم اپنا ادائیگی کا طریقہ منتخب کریں:",
        support: "ہماری سپورٹ ٹیم 24/7 دستیاب ہے۔ آپ کا پیغام ایڈمن کو بھیج دیا گیا ہے۔ وہ جلد جواب دیں گے۔",
        features: "ہمارے POS سسٹم میں شامل ہیں:\n• سیلز مینجمنٹ\n• انوینٹری ٹریکنگ\n• خریداری آرڈرز\n• آمدنی رپورٹس\n• یوزر مینجمنٹ\n\nکیا آپ کسی فیچر کے بارے میں مزید جاننا چاہتے ہیں؟",
        thanks: "خوش آمدید! اگر آپ کو کچھ اور چاہیے تو پوچھیں۔",
        default: "میں سمجھ گیا۔ میں آپ کا پیغام ایڈمن ٹیم کو بھیج رہا ہوں۔ وہ جلد آپ سے رابطہ کریں گے۔",
        tillId: "ٹل آئی ڈی ابھی دستیاب نہیں ہے۔ براہ کرم دوسرے طریقے استعمال کریں۔"
    }
};

const quickReplies = {
    english: [
        "License Info",
        "Payment Methods",
        "Features",
        "Contact Support"
    ],
    urdu: [
        "لائسنس کی معلومات",
        "ادائیگی کے طریقے",
        "فیچرز",
        "سپورٹ سے رابطہ"
    ]
};

function initChatbot() {
    const toggleBtn = document.getElementById('chatbotToggle');
    const container = document.getElementById('chatbotContainer');
    const closeBtn = document.getElementById('closeChatbot');
    const minimizeBtn = document.getElementById('minimizeChatbot');
    const sendBtn = document.getElementById('sendMessage');
    const input = document.getElementById('chatInput');
    const attachBtn = document.getElementById('attachImage');
    const imageInput = document.getElementById('imageInput');
    
    // Set default language to English - no selection needed
    selectedLanguage = 'english';
    
    toggleBtn.addEventListener('click', () => {
        container.classList.remove('minimized');
        container.classList.add('active');
        toggleBtn.style.display = 'none';
        
        if (chatHistory.length === 0) {
            // Direct greeting without language selection
            addMessage('bot', 'Hello! Welcome to POS Support. How can I help you today?');
            showQuickReplies();
        }
    });
    
    closeBtn.addEventListener('click', () => {
        container.classList.remove('active');
        container.classList.remove('minimized');
        toggleBtn.style.display = 'flex';
    });
    
    minimizeBtn.addEventListener('click', () => {
        container.classList.toggle('minimized');
    });
    
    // Click on minimized header to expand
    const header = document.querySelector('.chatbot-header');
    header.addEventListener('click', (e) => {
        if (container.classList.contains('minimized') && 
            !e.target.classList.contains('close-btn') && 
            !e.target.classList.contains('minimize-btn')) {
            container.classList.remove('minimized');
        }
    });
    
    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    
    // Image attachment
    attachBtn.addEventListener('click', () => {
        imageInput.click();
    });
    
    imageInput.addEventListener('change', handleImageUpload);
}

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(event) {
        const imageData = event.target.result;
        sendImageMessage(imageData, file.name);
    };
    
    reader.readAsDataURL(file);
    
    // Reset input
    e.target.value = '';
}

function sendImageMessage(imageData, fileName) {
    // No language check needed - direct chat enabled
    
    // Add user image message
    addImageMessage('user', imageData, fileName);
    
    // Save image for admin
    saveImageForAdmin(imageData, fileName);
    
    // Bot response
    setTimeout(() => {
        showTypingIndicator();
        
        setTimeout(() => {
            removeTypingIndicator();
            const response = selectedLanguage === 'english' 
                ? 'Thank you for sharing the image. Our admin team will review it and respond shortly.'
                : 'تصویر شیئر کرنے کا شکریہ۔ ہماری ایڈمن ٹیم اسے دیکھے گی اور جلد جواب دے گی۔';
            addMessage('bot', response);
            showQuickReplies();
        }, 1500);
    }, 500);
}

function addImageMessage(type, imageData, fileName) {
    const messagesDiv = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.innerHTML = `
        <div class="message-bubble">
            <div class="image-message">
                <img src="${imageData}" alt="${fileName}" onclick="openImagePreview('${imageData}')">
                <div class="image-name">${fileName}</div>
            </div>
            <div class="message-time">${time}</div>
        </div>
    `;
    
    messagesDiv.appendChild(messageDiv);
    chatHistory.push({ type, image: imageData, fileName, time });
    scrollToBottom();
}

function openImagePreview(imageData) {
    const preview = document.createElement('div');
    preview.className = 'image-preview-overlay';
    preview.innerHTML = `
        <div class="image-preview-content">
            <button class="preview-close" onclick="this.parentElement.parentElement.remove()">×</button>
            <img src="${imageData}" alt="Preview">
        </div>
    `;
    document.body.appendChild(preview);
    
    preview.addEventListener('click', (e) => {
        if (e.target === preview) {
            preview.remove();
        }
    });
}

function saveImageForAdmin(imageData, fileName) {
    let adminMessages = JSON.parse(localStorage.getItem('adminMessages')) || [];
    adminMessages.push({
        type: 'image',
        image: imageData,
        fileName: fileName,
        timestamp: new Date().toISOString(),
        from: 'Chatbot User',
        language: selectedLanguage
    });
    localStorage.setItem('adminMessages', JSON.stringify(adminMessages));
}

function showLanguageSelection() {
    const messagesDiv = document.getElementById('chatMessages');
    const langMessage = document.createElement('div');
    langMessage.className = 'message bot';
    langMessage.innerHTML = `
        <div class="message-bubble">
            <div>Please select your language / اپنی زبان منتخب کریں</div>
            <div class="language-selection">
                <button class="lang-btn" onclick="selectLanguage('english')">English</button>
                <button class="lang-btn" onclick="selectLanguage('urdu')">اردو</button>
            </div>
        </div>
    `;
    messagesDiv.appendChild(langMessage);
    scrollToBottom();
}

function selectLanguage(lang) {
    selectedLanguage = lang;
    addMessage('bot', responses[lang].greeting);
    showQuickReplies();
}

function showQuickReplies() {
    const messagesDiv = document.getElementById('chatMessages');
    const quickReplyDiv = document.createElement('div');
    quickReplyDiv.className = 'message bot';
    quickReplyDiv.innerHTML = `
        <div class="message-bubble">
            <div class="quick-replies">
                ${quickReplies[selectedLanguage].map(reply => 
                    `<button class="quick-reply-btn" onclick="handleQuickReply('${reply}')">${reply}</button>`
                ).join('')}
            </div>
        </div>
    `;
    messagesDiv.appendChild(quickReplyDiv);
    scrollToBottom();
}

function handleQuickReply(reply) {
    addMessage('user', reply);
    
    setTimeout(() => {
        showTypingIndicator();
        
        setTimeout(() => {
            removeTypingIndicator();
            
            if (reply.includes('License') || reply.includes('لائسنس')) {
                addMessage('bot', responses[selectedLanguage].license);
                showQuickReplies();
            } else if (reply.includes('Payment') || reply.includes('ادائیگی')) {
                addMessage('bot', responses[selectedLanguage].payment);
                showPaymentOptions();
            } else if (reply.includes('Features') || reply.includes('فیچرز')) {
                showDetailedFeatures();
            } else if (reply.includes('Support') || reply.includes('سپورٹ')) {
                addMessage('bot', responses[selectedLanguage].support);
                saveMessageForAdmin(reply);
                showQuickReplies();
            }
        }, 1500);
    }, 500);
}

function showPaymentOptions() {
    const messagesDiv = document.getElementById('chatMessages');
    const paymentDiv = document.createElement('div');
    paymentDiv.className = 'message bot';
    paymentDiv.innerHTML = `
        <div class="message-bubble">
            <div class="payment-options">
                <button class="payment-btn" onclick="showPaymentDetails('faysal')">🏦 Faysal Bank</button>
                <button class="payment-btn" onclick="showPaymentDetails('jazzcash')">📱 JazzCash</button>
                <button class="payment-btn" onclick="showPaymentDetails('easypaisa')">💳 EasyPaisa</button>
                <button class="payment-btn" onclick="showPaymentDetails('raast')">🔄 Raast ID</button>
                <button class="payment-btn" onclick="showPaymentDetails('nayapay')">💰 NayaPay</button>
                <button class="payment-btn" onclick="showPaymentDetails('till')">🏪 Till ID</button>
            </div>
        </div>
    `;
    messagesDiv.appendChild(paymentDiv);
    scrollToBottom();
}

function showPaymentDetails(method) {
    if (method === 'till') {
        addMessage('bot', responses[selectedLanguage].tillId);
        showQuickReplies();
        return;
    }
    
    const account = paymentAccounts[method];
    const details = `${account.name}\n━━━━━━━━━━━━━━━\nAccount: ${account.account}\nAccount Holder: ${account.holder}\n━━━━━━━━━━━━━━━\n\nPlease send payment and share screenshot with admin for verification.`;
    
    addMessage('bot', details);
    showQuickReplies();
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // No language check needed - direct chat enabled
    
    addMessage('user', message);
    input.value = '';
    
    setTimeout(() => {
        showTypingIndicator();
        
        setTimeout(() => {
            removeTypingIndicator();
            const response = getResponse(message);
            addMessage('bot', response);
            saveMessageForAdmin(message);
            showQuickReplies();
        }, 1500);
    }, 500);
}

function getResponse(message) {
    const msg = message.toLowerCase();
    
    if (msg.includes('license') || msg.includes('لائسنس') || msg.includes('price') || msg.includes('قیمت')) {
        return responses[selectedLanguage].license;
    } else if (msg.includes('payment') || msg.includes('ادائیگی') || msg.includes('pay')) {
        return responses[selectedLanguage].payment;
    } else if (msg.includes('feature') || msg.includes('فیچر')) {
        return responses[selectedLanguage].features;
    } else if (msg.includes('thank') || msg.includes('شکریہ')) {
        return responses[selectedLanguage].thanks;
    } else {
        return responses[selectedLanguage].default;
    }
}

function addMessage(type, text) {
    const messagesDiv = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.innerHTML = `
        <div class="message-bubble">
            <div>${text}</div>
            <div class="message-time">${time}</div>
        </div>
    `;
    
    messagesDiv.appendChild(messageDiv);
    chatHistory.push({ type, text, time });
    scrollToBottom();
}

function showTypingIndicator() {
    const messagesDiv = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = `
        <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;
    messagesDiv.appendChild(typingDiv);
    scrollToBottom();
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) indicator.remove();
}

function scrollToBottom() {
    const messagesDiv = document.getElementById('chatMessages');
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function saveMessageForAdmin(message) {
    let adminMessages = JSON.parse(localStorage.getItem('adminMessages')) || [];
    adminMessages.push({
        message: message,
        timestamp: new Date().toISOString(),
        from: 'Chatbot User',
        language: selectedLanguage
    });
    localStorage.setItem('adminMessages', JSON.stringify(adminMessages));
}

// Initialize chatbot when page loads
document.addEventListener('DOMContentLoaded', initChatbot);


function showDetailedFeatures() {
    const featuresText = selectedLanguage === 'english' 
        ? 'Our POS System Features:'
        : 'ہمارے POS سسٹم کی خصوصیات:';
    
    addMessage('bot', featuresText);
    
    const messagesDiv = document.getElementById('chatMessages');
    const featuresDiv = document.createElement('div');
    featuresDiv.className = 'message bot';
    featuresDiv.innerHTML = `
        <div class="message-bubble">
            <div class="features-list">
                <div class="feature-item">
                    <span class="feat-icon">📊</span>
                    <div>
                        <strong>Sales Management</strong>
                        <p>Create invoices, track sales, manage customers</p>
                    </div>
                </div>
                <div class="feature-item">
                    <span class="feat-icon">🛒</span>
                    <div>
                        <strong>Purchase Orders</strong>
                        <p>Manage suppliers, create purchase orders</p>
                    </div>
                </div>
                <div class="feature-item">
                    <span class="feat-icon">📦</span>
                    <div>
                        <strong>Inventory Management</strong>
                        <p>Track stock levels, low stock alerts</p>
                    </div>
                </div>
                <div class="feature-item">
                    <span class="feat-icon">📈</span>
                    <div>
                        <strong>Reports & Analytics</strong>
                        <p>Sales reports, profit analysis, trends</p>
                    </div>
                </div>
                <div class="feature-item">
                    <span class="feat-icon">👥</span>
                    <div>
                        <strong>Customer Management</strong>
                        <p>Customer database, purchase history</p>
                    </div>
                </div>
                <div class="feature-item">
                    <span class="feat-icon">💰</span>
                    <div>
                        <strong>Financial Reports</strong>
                        <p>Revenue tracking, expense management</p>
                    </div>
                </div>
                <div class="feature-item">
                    <span class="feat-icon">🏪</span>
                    <div>
                        <strong>Multi-Store Support</strong>
                        <p>Manage multiple locations from one system</p>
                    </div>
                </div>
                <div class="feature-item">
                    <span class="feat-icon">📤</span>
                    <div>
                        <strong>Data Export</strong>
                        <p>Export transactions to Excel/CSV</p>
                    </div>
                </div>
                <div class="feature-item">
                    <span class="feat-icon">🔔</span>
                    <div>
                        <strong>Notifications</strong>
                        <p>Real-time alerts and reminders</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    messagesDiv.appendChild(featuresDiv);
    scrollToBottom();
    
    setTimeout(() => {
        const followUp = selectedLanguage === 'english'
            ? 'Would you like to know more about any specific feature?'
            : 'کیا آپ کسی خاص فیچر کے بارے میں مزید جاننا چاہتے ہیں؟';
        addMessage('bot', followUp);
        showQuickReplies();
    }, 1000);
}
