# Promptly Chatbot

Promptly Chatbot is a modern, full-stack chat application that allows users to interact in real-time with an AI assistant powered by the Gemini API. The app is designed to provide a seamless, conversational experience for brainstorming, problem-solving, and productivity. With a sleek, responsive UI, users can manage multiple chat sessions, revisit chat history, and enjoy a personalized onboarding experience. Authentication and chat storage are securely managed using Firebase.

## Features
- User authentication (login/logout)
- Multiple chat sessions (each with its own history)
- **Real-time chat with an AI assistant using the Gemini API**
- Sidebar with chat previews and timestamps
- Welcome message and prompt suggestions for new chats
- Responsive, modern UI with dark mode

## Technology Stack
- **Frontend:** React, Next.js, TypeScript, Tailwind CSS
- **Backend/API:** Next.js API routes
- **AI Assistant:** Gemini API for generating intelligent, context-aware responses
- **Authentication & Database:** **Firebase** (Firestore for chat storage, Firebase Auth for user management)

## Firebase Usage
- **Authentication:** Secure user login and session management
- **Firestore:** Stores chat messages, chat sessions, and user data

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd promptly-chatbot
   ```
2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```
3. **Configure Firebase:**
   - Create a Firebase project at [firebase.google.com](https://firebase.google.com/)
   - Enable Firestore and Authentication (Email/Password or your preferred method)
   - Add your Firebase config to the project (see `.env.example` or your environment setup)

4. **Configure Gemini API:**
   - Obtain Gemini API credentials and add them to your environment configuration as needed.

5. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open the app:**
   Visit [http://localhost:3000](http://localhost:3000) in your browser.

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](LICENSE)
