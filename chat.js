// Chat JavaScript
(function () {
    'use strict';

    // Check authentication - allow guest access with limited features
    const session = localStorage.getItem('aiChatSession');
    const currentUser = session ? JSON.parse(session) : null;
    const isGuest = !currentUser;

    // Guest limitations
    const MAX_GUEST_MESSAGES = 10;
    let guestMessageCount = 0;

    // DOM Elements
    const sidebar = document.getElementById('sidebar');
    const sidebarResize = document.getElementById('sidebar-resize');
    const openSidebarBtn = document.getElementById('open-sidebar');
    const conversationsList = document.getElementById('conversations-list');
    const welcomeState = document.getElementById('welcome-state');
    const messagesContainer = document.getElementById('messages-container');
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    const newChatBtn = document.getElementById('new-chat-btn');
    const menuToggle = document.getElementById('menu-toggle');
    const closeSidebarBtn = document.getElementById('close-sidebar');
    const themeToggle = document.getElementById('theme-toggle');
    const logoutBtn = document.getElementById('logout-btn');
    const profileSettingsBtn = document.getElementById('profile-settings-btn');
    const sunIcon = document.getElementById('sun-icon');
    const moonIcon = document.getElementById('moon-icon');
    const userName = document.getElementById('user-name');
    const userEmail = document.getElementById('user-email');
    const avatarInitials = document.getElementById('avatar-initials');
    const modelSelect = document.getElementById('model-select');

    // Settings Modal Elements
    const settingsModal = document.getElementById('settings-modal');
    const closeSettingsBtn = document.getElementById('close-settings');
    const cancelSettingsBtn = document.getElementById('cancel-settings');
    const saveSettingsBtn = document.getElementById('save-settings');
    const userProfile = document.querySelector('.user-profile');
    const settingsNameInput = document.getElementById('settings-name');
    const settingsEmailInput = document.getElementById('settings-email');
    const settingsBioInput = document.getElementById('settings-bio');
    const settingsRoleInput = document.getElementById('settings-role');
    const settingsLocationInput = document.getElementById('settings-location');
    const settingsThemeSelect = document.getElementById('settings-theme');
    const settingsLanguageSelect = document.getElementById('settings-language');
    const settingsFontSizeSelect = document.getElementById('settings-font-size');
    const settingsEnterSendCheck = document.getElementById('settings-enter-send');
    const settingsModelSelect = document.getElementById('settings-model');
    const settingsToneSelect = document.getElementById('settings-tone');
    const settingsSaveHistoryCheck = document.getElementById('settings-save-history');
    const settingsCompactProfileCheck = document.getElementById('settings-compact-profile');
    const settingsAvatarInitials = document.getElementById('settings-avatar-initials');
    const settingsAccountType = document.getElementById('settings-account-type');
    const settingsMemberSince = document.getElementById('settings-member-since');

    const exportDataBtn = document.getElementById('export-data-btn');
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    const deleteAccountBtn = document.getElementById('delete-account-btn');

    // State
    let conversations = [];
    let activeConversationId = null;
    let isTyping = false;

    // Initialize
    function init() {
        loadTheme();
        loadFontSize();
        loadUserData();
        loadConversations();
        renderConversations();
        setupEventListeners();
        autoResizeTextarea();
        updateThemeIcon();

        // Show guest banner if not logged in
        if (isGuest) {
            showGuestBanner();
        }
    }

    function loadFontSize() {
        const fontSize = localStorage.getItem('aiChatFontSize') || 'medium';
        document.body.classList.remove('font-small', 'font-medium', 'font-large');
        document.body.classList.add(`font-${fontSize}`);
    }

    // Show guest limitation banner
    function showGuestBanner() {
        // Add guest banner to the UI
        const banner = document.createElement('div');
        banner.className = 'guest-banner';
        banner.innerHTML = `
            <div class="guest-banner-content">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <span>You're using AI Chat as a guest. <a href="signin.html">Sign in</a> to save your conversations and unlock full features.</span>
                <button class="guest-banner-close" onclick="this.parentElement.parentElement.remove()">Ã—</button>
            </div>
        `;

        // Insert banner at the top of main content
        const mainContent = document.querySelector('.main-content');
        mainContent.insertBefore(banner, mainContent.firstChild);
    }

    // Event Listeners
    function setupEventListeners() {
        sendBtn.addEventListener('click', sendMessage);
        messageInput.addEventListener('keydown', handleInputKeydown);
        messageInput.addEventListener('input', autoResizeTextarea);
        newChatBtn.addEventListener('click', startNewChat);
        menuToggle.addEventListener('click', toggleSidebar);
        if (closeSidebarBtn) {
            closeSidebarBtn.addEventListener('click', collapseSidebar);
        }
        if (openSidebarBtn) {
            openSidebarBtn.addEventListener('click', expandSidebar);
        }
        themeToggle.addEventListener('click', toggleTheme);
        logoutBtn.addEventListener('click', handleLogout);
        if (profileSettingsBtn) {
            profileSettingsBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                openSettingsModal();
            });
        }

        // Settings Modal Event Listeners
        if (userProfile) {
            userProfile.addEventListener('click', function (e) {
                if (e.target.closest('#theme-toggle') || e.target.closest('#logout-btn') || e.target.closest('#profile-settings-btn')) {
                    return;
                }
                openSettingsModal();
            });
        }
        if (closeSettingsBtn) {
            closeSettingsBtn.addEventListener('click', closeSettingsModal);
        }
        if (cancelSettingsBtn) {
            cancelSettingsBtn.addEventListener('click', closeSettingsModal);
        }
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', saveSettings);
        }
        if (settingsModal) {
            settingsModal.addEventListener('click', (e) => {
                if (e.target === settingsModal) {
                    closeSettingsModal();
                }
            });
        }

        // Data Management Listeners
        if (exportDataBtn) {
            exportDataBtn.addEventListener('click', exportData);
        }
        if (clearHistoryBtn) {
            clearHistoryBtn.addEventListener('click', clearAllHistory);
        }
        if (deleteAccountBtn) {
            deleteAccountBtn.addEventListener('click', deleteAccount);
        }

        // Update avatar preview when name changes
        if (settingsNameInput) {
            settingsNameInput.addEventListener('input', updateSettingsAvatarPreview);
        }

        // Suggestion cards
        document.querySelectorAll('.suggestion-card').forEach(card => {
            card.addEventListener('click', () => {
                const prompt = card.dataset.prompt;
                messageInput.value = prompt;
                autoResizeTextarea();
                sendMessage();
            });
        });

        // Close sidebar on overlay click
        document.addEventListener('click', (e) => {
            if (sidebar.classList.contains('open') &&
                !sidebar.contains(e.target) &&
                !menuToggle.contains(e.target)) {
                closeSidebar();
            }
        });
    }

    // User Data
    function loadUserData() {
        if (currentUser) {
            userName.textContent = currentUser.name;
            avatarInitials.textContent = currentUser.name.charAt(0).toUpperCase();
            if (userEmail) {
                userEmail.textContent = currentUser.email || 'No email';
            }
        } else {
            userName.textContent = 'Guest';
            avatarInitials.textContent = 'G';
            if (userEmail) {
                userEmail.textContent = 'Guest mode';
            }
        }
    }

    // Theme Functions
    function loadTheme() {
        const theme = localStorage.getItem('aiChatTheme') || 'dark';
        document.documentElement.setAttribute('data-theme', theme);
    }

    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('aiChatTheme', newTheme);
        updateThemeIcon();
    }

    function updateThemeIcon() {
        const theme = document.documentElement.getAttribute('data-theme');
        if (theme === 'light') {
            sunIcon.classList.add('hidden');
            moonIcon.classList.remove('hidden');
        } else {
            sunIcon.classList.remove('hidden');
            moonIcon.classList.add('hidden');
        }
    }

    // Sidebar Functions
    function toggleSidebar() {
        sidebar.classList.toggle('open');
        let overlay = document.querySelector('.sidebar-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'sidebar-overlay';
            document.body.appendChild(overlay);
            overlay.addEventListener('click', closeSidebar);
        }
        overlay.classList.toggle('active');
    }

    function closeSidebar() {
        sidebar.classList.remove('open');
        const overlay = document.querySelector('.sidebar-overlay');
        if (overlay) {
            overlay.classList.remove('active');
        }
    }

    function collapseSidebar() {
        // Save current width before collapsing
        const currentWidth = sidebar.offsetWidth;
        if (currentWidth > 0) {
            sidebar.dataset.lastWidth = currentWidth;
        }
        sidebar.classList.add('collapsed');
        sidebar.style.width = '0';
        if (sidebarResize) {
            sidebarResize.style.display = 'none';
        }
        if (openSidebarBtn) {
            openSidebarBtn.classList.remove('hidden');
        }
    }

    function expandSidebar() {
        sidebar.classList.remove('collapsed');
        // Restore previous width or use default
        const lastWidth = sidebar.dataset.lastWidth || '260';
        sidebar.style.width = lastWidth + 'px';
        if (sidebarResize) {
            sidebarResize.style.display = 'block';
        }
        if (openSidebarBtn) {
            openSidebarBtn.classList.add('hidden');
        }
    }

    // Sidebar Resize Functionality
    let isResizing = false;
    let startX = 0;
    let startWidth = 0;
    const MIN_WIDTH = 200;
    const MAX_WIDTH = 500;

    function initResize(e) {
        isResizing = true;
        startX = e.clientX;
        startWidth = sidebar.offsetWidth;
        sidebarResize.classList.add('resizing');
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        e.preventDefault();
    }

    function resize(e) {
        if (!isResizing) return;

        const diff = e.clientX - startX;
        const newWidth = Math.min(Math.max(startWidth + diff, MIN_WIDTH), MAX_WIDTH);
        sidebar.style.width = newWidth + 'px';
    }

    function stopResize() {
        if (isResizing) {
            isResizing = false;
            sidebarResize.classList.remove('resizing');
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }
    }

    // Initialize resize event listeners
    if (sidebarResize) {
        sidebarResize.addEventListener('mousedown', initResize);
        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', stopResize);
    }

    // Conversation Functions
    function loadConversations() {
        if (currentUser) {
            const userConversations = localStorage.getItem(`aiChatConversations_${currentUser.id}`);
            conversations = userConversations ? JSON.parse(userConversations) : [];
        } else {
            // Guests can still have temporary conversations in memory
            conversations = [];
        }
    }

    function saveConversations() {
        if (currentUser) {
            localStorage.setItem(`aiChatConversations_${currentUser.id}`, JSON.stringify(conversations));
        }
        // Guest conversations are not saved
    }

    function renderConversations() {
        // Hide conversations list for guests
        if (isGuest) {
            conversationsList.innerHTML = `
                <div class="guest-sidebar-message">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    <span>Sign in to view conversation history</span>
                </div>
            `;
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const lastWeek = new Date(today);
        lastWeek.setDate(lastWeek.getDate() - 7);

        const groups = {
            today: [],
            yesterday: [],
            lastWeek: [],
            older: []
        };

        conversations.forEach(conv => {
            const convDate = new Date(conv.updatedAt);
            convDate.setHours(0, 0, 0, 0);

            if (convDate >= today) {
                groups.today.push(conv);
            } else if (convDate >= yesterday) {
                groups.yesterday.push(conv);
            } else if (convDate >= lastWeek) {
                groups.lastWeek.push(conv);
            } else {
                groups.older.push(conv);
            }
        });

        let html = '';

        if (groups.today.length > 0) {
            html += createConversationGroup('Today', groups.today);
        }
        if (groups.yesterday.length > 0) {
            html += createConversationGroup('Yesterday', groups.yesterday);
        }
        if (groups.lastWeek.length > 0) {
            html += createConversationGroup('Last 7 Days', groups.lastWeek);
        }
        if (groups.older.length > 0) {
            html += createConversationGroup('Older', groups.older);
        }

        conversationsList.innerHTML = html;

        document.querySelectorAll('.conversation-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.closest('.conversation-item-delete')) {
                    deleteConversation(item.dataset.id);
                } else {
                    loadConversation(item.dataset.id);
                }
            });
        });
    }

    function createConversationGroup(title, conversations) {
        let html = `<div class="conversation-group">
            <div class="conversation-group-title">${title}</div>`;

        conversations.forEach(conv => {
            const isActive = conv.id === activeConversationId;
            html += `
                <div class="conversation-item ${isActive ? 'active' : ''}" data-id="${conv.id}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <span class="conversation-item-text">${escapeHtml(conv.title)}</span>
                    <button class="btn-icon conversation-item-delete" title="Delete">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>`;
        });

        html += '</div>';
        return html;
    }

    function startNewChat() {
        activeConversationId = null;
        welcomeState.classList.remove('hidden');
        messagesContainer.classList.add('hidden');
        messagesContainer.innerHTML = '';
        renderConversations();
        closeSidebar();
        messageInput.focus();
    }

    function loadConversation(id) {
        if (isGuest) {
            showGuestNotification('Sign in to access conversation history');
            return;
        }

        const conv = conversations.find(c => c.id === id);
        if (!conv) return;

        activeConversationId = id;
        welcomeState.classList.add('hidden');
        messagesContainer.classList.remove('hidden');

        messagesContainer.innerHTML = conv.messages.map(msg => createMessageHTML(msg.role, msg.content)).join('');

        renderConversations();
        closeSidebar();

        const chatMessages = document.getElementById('chat-messages');
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function deleteConversation(id) {
        if (!confirm('Delete this conversation?')) return;

        conversations = conversations.filter(c => c.id !== id);
        saveConversations();

        if (activeConversationId === id) {
            startNewChat();
        } else {
            renderConversations();
        }
    }

    // Show notification for guests
    function showGuestNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'guest-notification';
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">Ã—</button>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    // Message Functions
    function sendMessage() {
        // Check guest message limit
        if (isGuest && guestMessageCount >= MAX_GUEST_MESSAGES) {
            showGuestNotification(`Guest limit reached (${MAX_GUEST_MESSAGES} messages). Please sign in to continue.`);
            return;
        }

        const content = messageInput.value.trim();
        if (!content || isTyping) return;

        if (!activeConversationId) {
            const newConv = {
                id: Date.now().toString(),
                title: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
                messages: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            conversations.unshift(newConv);
            activeConversationId = newConv.id;
        }

        const conv = conversations.find(c => c.id === activeConversationId);
        if (!conv) return;

        conv.messages.push({ role: 'user', content });
        conv.updatedAt = new Date().toISOString();

        welcomeState.classList.add('hidden');
        messagesContainer.classList.remove('hidden');

        messagesContainer.insertAdjacentHTML('beforeend', createMessageHTML('user', content));

        messageInput.value = '';
        autoResizeTextarea();

        showTypingIndicator();
        isTyping = true;

        setTimeout(() => {
            const selectedModel = modelSelect ? modelSelect.value : 'gpt-3.5';
            const response = generateAIResponse(content, selectedModel);
            hideTypingIndicator();
            conv.messages.push({ role: 'ai', content: response });
            messagesContainer.insertAdjacentHTML('beforeend', createMessageHTML('ai', response));
            isTyping = false;

            // Only save for logged-in users
            if (!isGuest) {
                saveConversations();
                renderConversations();
            }

            // Increment guest message count
            if (isGuest) {
                guestMessageCount++;
            }

            const chatMessages = document.getElementById('chat-messages');
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 1000 + Math.random() * 1500);

        if (conv.messages.length === 1) {
            conv.title = content.substring(0, 50) + (content.length > 50 ? '...' : '');
        }

        // Only save for logged-in users
        if (!isGuest) {
            saveConversations();
            renderConversations();
        }

        const chatMessages = document.getElementById('chat-messages');
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function createMessageHTML(role, content) {
        const avatar = role === 'user'
            ? `<div class="message-avatar">${currentUser ? currentUser.name.charAt(0).toUpperCase() : 'G'}</div>`
            : `<div class="message-avatar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
               </div>`;

        const name = role === 'user' ? (currentUser ? 'You' : 'Guest') : 'AI Chat';

        return `
            <div class="message ${role}">
                ${avatar}
                <div class="message-content">
                    <div class="message-role">${name}</div>
                    <div class="message-text">${formatMessage(content)}</div>
                </div>
            </div>
        `;
    }

    function formatMessage(content) {
        let formatted = escapeHtml(content);
        formatted = formatted.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>');
        formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
        formatted = formatted.split('\n\n').map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
        return formatted;
    }

    function showTypingIndicator() {
        const indicator = `
            <div class="message ai" id="typing-message">
                <div class="message-avatar">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                </div>
                <div class="message-content">
                    <div class="message-role">AI Chat</div>
                    <div class="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        `;
        messagesContainer.insertAdjacentHTML('beforeend', indicator);
        const chatMessages = document.getElementById('chat-messages');
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function hideTypingIndicator() {
        const typingMessage = document.getElementById('typing-message');
        if (typingMessage) {
            typingMessage.remove();
        }
    }

    // AI Response Generator
    function generateAIResponse(userMessage, model) {
        const lowerMessage = userMessage.toLowerCase();

        if (lowerMessage.includes('quantum computing')) {
            return `Quantum computing is a type of computing that uses quantum mechanics to process information in fundamentally different ways than classical computers.

**Key Concepts:**

1. **Qubits** - Unlike classical bits (0 or 1), qubits can exist in multiple states simultaneously (superposition).

2. **Superposition** - A qubit can be both 0 and 1 at the same time until measured.

3. **Entanglement** - Qubits can be connected so that the state of one instantly affects the other, regardless of distance.

4. **Quantum Gates** - Operations that manipulate qubits to perform calculations.

**Simple Analogy:**
Imagine a coin. A classical bit is like a coin that's either heads OR tails. A qubit is like a spinning coin - it's both heads AND tails until you stop it (measure it).

This allows quantum computers to solve certain problems exponentially faster than classical computers, particularly in cryptography, drug discovery, and optimization problems.`;
            // Model-specific logic (placeholder for real API integration)
            switch (model) {
                case 'gpt-4':
                    // You can add GPT-4 specific logic here
                    break;
                case 'gpt-4-vision':
                    // Placeholder for GPT-4 Vision
                    break;
                case 'gpt-3.5':
                    // GPT-3.5 logic (default)
                    break;
                case 'gpt-3':
                    // Placeholder for GPT-3
                    break;
                case 'llama-2':
                    // Placeholder for Llama 2
                    break;
                case 'gemini-pro':
                    // Placeholder for Gemini Pro
                    break;
                case 'mistral':
                    // Placeholder for Mistral
                    break;
                default:
                    break;
            }
        }

        if (lowerMessage.includes('email')) {
            return `Here's a professional email template you can customize:

**Subject:** [Clear, specific subject line]

Dear [Recipient's Name],

I hope this email finds you well.

[State your main purpose clearly in 1-2 sentences]

[Provide necessary context or background information]

[Include any specific requests or action items]

I would appreciate your response by [date] if possible. Please let me know if you need any additional information.

Thank you for your time and consideration.

Best regards,
[Your Name]
[Your Position]
[Your Contact Information]

---

**Tips for professional emails:**
â€¢ Keep it concise and to the point
â€¢ Use a clear subject line
â€¢ Proofread before sending
â€¢ Maintain a professional tone
â€¢ Include a proper greeting and closing`;
        }

        if (lowerMessage.includes('breakfast') || lowerMessage.includes('healthy')) {
            return `Here are some healthy breakfast ideas to start your day:

**Quick Options (5-10 minutes):**
â€¢ Overnight oats with berries and nuts
â€¢ Greek yogurt parfait with granola
â€¢ Avocado toast with egg
â€¢ Smoothie bowl with spinach, banana, and protein

**Make-Ahead Options:**
â€¢ Egg muffins with vegetables
â€¢ Chia seed pudding
â€¢ Overnight quinoa breakfast bowl
â€¢ Breakfast burritos (freeze & reheat)

**Weekend Specials:**
â€¢ Vegetable omelet with whole grain toast
â€¢ Whole wheat pancakes with fresh fruit
â€¢ Greek yogurt with homemade granola

**Nutritional Tips:**
â€¢ Include protein (eggs, Greek yogurt, nuts)
â€¢ Add fiber (oats, fruits, vegetables)
â€¢ Healthy fats (avocado, nuts, seeds)
â€¢ Limit added sugars

Would you like specific recipes for any of these options?`;
        }

        if (lowerMessage.includes('python') && lowerMessage.includes('sort')) {
            return `Here's a Python function to sort a list:

\`\`\`python
def sort_list(items, reverse=False):
    """
    Sort a list in ascending or descending order.
    
    Args:
        items: List to be sorted
        reverse: If True, sort in descending order
    
    Returns:
        A new sorted list
    """
    return sorted(items, reverse=reverse)

# Example usage:
numbers = [3, 1, 4, 1, 5, 9, 2, 6]
print(sort_list(numbers))  # [1, 1, 2, 3, 4, 5, 6, 9]
print(sort_list(numbers, reverse=True))  # [9, 6, 5, 4, 3, 2, 1, 1, 1]

# Sort in place:
numbers.sort()
\`\`\`

**Other sorting options:**

\`\`\`python
# Sort by a key function
words = ['banana', 'pie', 'Washington', 'book']
print(sorted(words, key=str.lower))

# Sort list of dictionaries
students = [
    {'name': 'Alice', 'grade': 85},
    {'name': 'Bob', 'grade': 92}
]
sorted_students = sorted(students, key=lambda x: x['grade'])
\`\`\`

The \`sorted()\` function returns a new list, while \`list.sort()\` modifies the original list in place.`;
        }

        const defaultResponses = [
            `That's an interesting question! Let me think about this...

Based on my understanding, I can provide some insights on this topic. 

Could you provide more specific details about what you're looking for? This will help me give you a more targeted and useful response.

In the meantime, here are some general thoughts that might be helpful:
â€¢ Consider the context and your specific goals
â€¢ Break down complex problems into smaller parts
â€¢ Research multiple perspectives on the topic

Feel free to ask follow-up questions!`,

            `Great question! Here's what I can share:

This is a topic with many facets to consider. Let me break it down:

1. **Understanding the basics** - It's important to start with foundational concepts
2. **Practical application** - Theory is useful, but real-world implementation matters
3. **Continuous learning** - This field is always evolving

Is there a specific aspect you'd like me to elaborate on? I'm happy to dive deeper into any particular area that interests you.`,

            `I appreciate you asking! Let me provide a thoughtful response:

This is definitely worth exploring. Here are some key points to consider:

â€¢ The importance of understanding your specific needs
â€¢ Evaluating different approaches and methodologies
â€¢ Considering both short-term and long-term implications

What specifically would you like to know more about? I can provide more detailed information based on your interests.`
        ];

        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    }

    // Utility Functions
    function autoResizeTextarea() {
        messageInput.style.height = 'auto';
        messageInput.style.height = Math.min(messageInput.scrollHeight, 200) + 'px';
    }

    function handleInputKeydown(e) {
        const enterToSend = localStorage.getItem('aiChatEnterSend') !== 'false';
        if (e.key === 'Enter') {
            if (enterToSend) {
                if (!e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            } else {
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    sendMessage();
                }
            }
        }
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function handleLogout() {
        localStorage.removeItem('aiChatSession');
        window.location.href = 'signin.html';
    }

    // Settings Modal Functions
    function openSettingsModal() {
        // Populate settings with current user data
        if (currentUser) {
            settingsNameInput.value = currentUser.name || '';
            settingsEmailInput.value = currentUser.email || '';
            settingsBioInput.value = currentUser.bio || '';
            if (settingsRoleInput) settingsRoleInput.value = currentUser.role || '';
            if (settingsLocationInput) settingsLocationInput.value = currentUser.location || '';
            settingsAvatarInitials.textContent = currentUser.name.charAt(0).toUpperCase();
            settingsAccountType.textContent = currentUser.plan || 'Free Plan';

            // Show member since date
            if (currentUser.createdAt) {
                const memberDate = new Date(currentUser.createdAt);
                settingsMemberSince.textContent = memberDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long'
                });
            } else {
                settingsMemberSince.textContent = 'Recently joined';
            }
        } else {
            // Guest mode
            settingsNameInput.value = 'Guest';
            settingsEmailInput.value = '';
            settingsBioInput.value = '';
            if (settingsRoleInput) settingsRoleInput.value = '';
            if (settingsLocationInput) settingsLocationInput.value = '';
            settingsAvatarInitials.textContent = 'G';
            settingsAccountType.textContent = 'Free Plan';
            settingsMemberSince.textContent = 'Guest';
        }

        // Set preferences
        settingsThemeSelect.value = localStorage.getItem('aiChatTheme') || 'dark';
        settingsLanguageSelect.value = localStorage.getItem('aiChatLanguage') || 'en';
        settingsFontSizeSelect.value = localStorage.getItem('aiChatFontSize') || 'medium';
        settingsEnterSendCheck.checked = localStorage.getItem('aiChatEnterSend') !== 'false';
        settingsModelSelect.value = modelSelect.value;
        if (settingsToneSelect) settingsToneSelect.value = localStorage.getItem('aiChatTone') || 'balanced';
        if (settingsSaveHistoryCheck) settingsSaveHistoryCheck.checked = localStorage.getItem('aiChatSaveHistory') !== 'false';
        if (settingsCompactProfileCheck) settingsCompactProfileCheck.checked = localStorage.getItem('aiChatCompactProfile') === 'true';

        // Show modal
        settingsModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        // Focus on name input
        setTimeout(() => settingsNameInput.focus(), 100);
    }

    function closeSettingsModal() {
        settingsModal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    function updateSettingsAvatarPreview() {
        const name = settingsNameInput.value.trim();
        if (name) {
            settingsAvatarInitials.textContent = name.charAt(0).toUpperCase();
        } else {
            settingsAvatarInitials.textContent = 'U';
        }
    }

    function saveSettings() {
        const newName = settingsNameInput.value.trim();
        const newEmail = settingsEmailInput.value.trim();
        const newBio = settingsBioInput.value.trim();
        const newRole = settingsRoleInput ? settingsRoleInput.value.trim() : '';
        const newLocation = settingsLocationInput ? settingsLocationInput.value.trim() : '';
        const newTheme = settingsThemeSelect.value;
        const newLang = settingsLanguageSelect.value;
        const newFontSize = settingsFontSizeSelect.value;
        const newEnterSend = settingsEnterSendCheck.checked;
        const newModel = settingsModelSelect.value;
        const newTone = settingsToneSelect ? settingsToneSelect.value : 'balanced';
        const saveHistory = settingsSaveHistoryCheck ? settingsSaveHistoryCheck.checked : true;
        const compactProfile = settingsCompactProfileCheck ? settingsCompactProfileCheck.checked : false;

        // Validate name
        if (!newName) {
            showGuestNotification('Please enter a display name');
            settingsNameInput.focus();
            return;
        }

        // Save user data
        if (currentUser) {
            currentUser.name = newName;
            currentUser.email = newEmail;
            currentUser.bio = newBio;
            currentUser.role = newRole;
            currentUser.location = newLocation;
            localStorage.setItem('aiChatSession', JSON.stringify(currentUser));
        }

        // Save preferences
        localStorage.setItem('aiChatTheme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        updateThemeIcon();

        localStorage.setItem('aiChatLanguage', newLang);
        localStorage.setItem('aiChatFontSize', newFontSize);
        loadFontSize();

        localStorage.setItem('aiChatEnterSend', newEnterSend);
        localStorage.setItem('aiChatTone', newTone);
        localStorage.setItem('aiChatSaveHistory', saveHistory);
        localStorage.setItem('aiChatCompactProfile', compactProfile);
        modelSelect.value = newModel;

        // Update UI
        userName.textContent = newName;
        avatarInitials.textContent = newName.charAt(0).toUpperCase();
        if (userEmail) {
            userEmail.textContent = newEmail || 'No email';
        }
        document.body.classList.toggle('font-small', newFontSize === 'small');
        document.body.classList.toggle('font-medium', newFontSize === 'medium');
        document.body.classList.toggle('font-large', newFontSize === 'large');

        showGuestNotification('Settings saved successfully!');
        closeSettingsModal();
    }

    function exportData() {
        const data = {
            user: currentUser,
            conversations: conversations,
            preferences: {
                theme: localStorage.getItem('aiChatTheme'),
                language: localStorage.getItem('aiChatLanguage'),
                fontSize: localStorage.getItem('aiChatFontSize'),
                enterSend: localStorage.getItem('aiChatEnterSend')
            }
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-chat-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showGuestNotification('Data exported successfully!');
    }

    function clearAllHistory() {
        if (!confirm('Are you sure you want to clear ALL chat history? This cannot be undone.')) return;

        conversations = [];
        saveConversations();
        startNewChat();
        showGuestNotification('Chat history cleared.');
    }

    function deleteAccount() {
        if (!confirm('CRITICAL: Delete your account and all data? This action is permanent.')) return;

        localStorage.removeItem('aiChatSession');
        localStorage.removeItem(`aiChatConversations_${currentUser?.id}`);
        localStorage.removeItem('aiChatTheme');
        localStorage.removeItem('aiChatLanguage');
        localStorage.removeItem('aiChatFontSize');
        localStorage.removeItem('aiChatEnterSend');

        window.location.href = 'signup.html';
    }

    // Initialize the app
    init();
})();
