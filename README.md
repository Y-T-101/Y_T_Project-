# AI Chat (Y-T 101)

A browser-based AI assistant experience built with vanilla HTML, CSS, and JavaScript.

## Overview

AI Chat delivers an interactive chat interface with a landing page, account sign-up/sign-in flow, and a simulated AI conversation engine. The app stores user sessions and conversation history locally for logged-in users while offering a guest mode for quick access.

## Features

- Landing page with app introduction and navigation
- User registration and sign-in powered by `localStorage`
- Guest mode with a 10-message limit
- Chat interface with message threads and AI-style replies
- Theme selection, font size control, and chat settings
- Local chat history and saved conversations for signed-in users
- Export conversations and preferences as a JSON file
- Clear chat history and delete account functions

## Pages

- `index.html` — landing page
- `signup.html` — create a new account
- `signin.html` — sign in to an existing account
- `chat.html` — main chat experience

## How It Works

- User accounts are stored in browser `localStorage` under `aiChatUsers`
- Logged-in sessions are stored as `aiChatSession`
- Chat conversations are saved per user and restored when signed in again
- AI responses are generated locally in `chat.js` using keyword-based templates
- Preferences like theme, font size, and keyboard behavior are saved locally

## Installation

1. Open the `project-3` directory.
2. Open `index.html` in a web browser.

> For the best experience, use a local server if your browser restricts local JavaScript access.

## Usage

1. Visit `index.html`.
2. Click `Start Chatting` to open the chat interface.
3. Sign up or sign in to save conversations.
4. Type messages and send them using the button or Enter key.
5. Use the sidebar to create new chats, view conversations, and open settings.
6. Export your data or clear history from settings.

## File Structure

- `index.html` — landing/marketing page
- `signup.html` — account registration page
- `signin.html` — login page
- `chat.html` — chat dashboard and settings
- `auth.js` — authentication and session handling logic
- `chat.js` — chat interface, AI response generation, and settings logic
- `styles.css` — styling for all pages

## Built With

- HTML
- CSS
- JavaScript

## Notes

- This project is fully client-side and does not use a server backend.
- All user data and chat history are stored locally in the browser.
- The AI behavior is simulated in JavaScript and can be extended to use real AI APIs.

## Recommended Improvements

- Add a backend for secure authentication and persistent storage
- Integrate a real AI service for true conversational responses
- Improve mobile responsiveness and accessibility
- Add profile image uploads and richer user profiles
