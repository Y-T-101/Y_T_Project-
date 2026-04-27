// Authentication JavaScript
(function() {
    'use strict';

    // Check if user is already logged in
    const session = localStorage.getItem('aiChatSession');
    if (session) {
        window.location.href = 'chat.html';
    }

    // Load theme
    const theme = localStorage.getItem('aiChatTheme') || 'dark';
    document.documentElement.setAttribute('data-theme', theme);

    // Sign In Form
    const signinForm = document.getElementById('signin');
    if (signinForm) {
        signinForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            // Get users from localStorage
            const users = JSON.parse(localStorage.getItem('aiChatUsers') || '[]');
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                const sessionData = { id: user.id, name: user.name, email: user.email };
                localStorage.setItem('aiChatSession', JSON.stringify(sessionData));
                window.location.href = 'chat.html';
            } else {
                alert('Invalid email or password');
            }
        });
    }

    // Sign Up Form
    const signupForm = document.getElementById('signup');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirm = document.getElementById('confirm').value;

            if (password !== confirm) {
                alert('Passwords do not match');
                return;
            }

            if (password.length < 6) {
                alert('Password must be at least 6 characters');
                return;
            }

            // Get existing users
            const users = JSON.parse(localStorage.getItem('aiChatUsers') || '[]');

            // Check if email exists
            if (users.find(u => u.email === email)) {
                alert('Email already registered');
                return;
            }

            // Create new user
            const newUser = {
                id: Date.now().toString(),
                name,
                email,
                password
            };

            users.push(newUser);
            localStorage.setItem('aiChatUsers', JSON.stringify(users));

            // Auto login
            const sessionData = { id: newUser.id, name: newUser.name, email: newUser.email };
            localStorage.setItem('aiChatSession', JSON.stringify(sessionData));
            window.location.href = 'chat.html';
        });
    }
})();
