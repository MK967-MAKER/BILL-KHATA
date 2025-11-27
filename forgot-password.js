const forgotPasswordForm = document.getElementById('forgotPasswordForm');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');

forgotPasswordForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';
    
    const username = document.getElementById('forgotUsername').value.trim();
    const reason = document.getElementById('reason').value.trim();
    
    // Check if user exists
    let users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.username === username || u.mobile === username || u.email === username);
    
    if (!user) {
        showError('User not found');
        return;
    }
    
    // Generate forget key
    const forgetKey = 'FK-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    
    // Store forget key request
    let forgetRequests = JSON.parse(localStorage.getItem('forgetRequests')) || [];
    forgetRequests.push({
        username: user.username,
        forgetKey: forgetKey,
        reason: reason,
        status: 'pending',
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('forgetRequests', JSON.stringify(forgetRequests));
    
    showSuccess(`Forget Key generated: ${forgetKey}. Please wait for admin approval.`);
    
    // Clear form
    forgotPasswordForm.reset();
});

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

function showSuccess(message) {
    successMessage.textContent = message;
    successMessage.style.display = 'block';
}

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
    
    const userMsg = document.createElement('div');
    userMsg.className = 'user-message';
    userMsg.textContent = message;
    chatbotMessages.appendChild(userMsg);
    
    chatInput.value = '';
    
    setTimeout(() => {
        const botMsg = document.createElement('div');
        botMsg.className = 'bot-message';
        botMsg.textContent = 'Your message has been sent to admin. They will respond shortly.';
        chatbotMessages.appendChild(botMsg);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        
        let adminMessages = JSON.parse(localStorage.getItem('adminMessages')) || [];
        adminMessages.push({
            message: message,
            timestamp: new Date().toISOString(),
            from: document.getElementById('forgotUsername').value || 'Guest'
        });
        localStorage.setItem('adminMessages', JSON.stringify(adminMessages));
    }, 1000);
    
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}
