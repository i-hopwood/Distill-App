@ -0,0 +1,75 @@
# Distill

A personal notes app that sorts itself.

You jot down raw notes. A local AI model adds a title, summary, priority, and category.

## Projects

- **`notesapp/`** is the web app. It is a Vue 3 + Vite installable web app (PWA).
- **`notes-poller/`** is a local service. It watches for new notes and sends them to an Ollama model.

## How it works

1. You sign in and add a note in the web app.
2. The app saves the note to Firestore.
3. The poller sees the new note in real time.
4. The poller sends the text to a local Ollama model.
5. The poller writes the title, summary, priority, and category back to the note.
6. The poller raises the priority of notes you leave untouched.

## Tech stack

- Vue 3, Vue Router, Vite, Bootstrap
- Firebase Authentication and Firestore
- Node.js, Firebase Admin SDK
- Ollama for local AI

## Setup

### 1. Create a Firebase project

- Turn on Email/Password sign-in in Authentication.
- Create a Firestore database.
- Deploy the rules in `notesapp/firestore.rules`.

### 2. Run the web app

```
cd notesapp
npm install
npm run dev
```

Create `notesapp/.env` with your Firebase web app settings:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Only users listed in the `allowedUsers` collection can read notes.

### 3. Run the poller

See [`notes-poller/README.md`](notes-poller/README.md). In short:

```
ollama pull llama3.1
cd notes-poller
cp .env.example .env
npm install
npm start
```

The poller needs a Firebase service account key saved as `notes-poller/serviceAccountKey.json`.

## Security

- Never commit `.env` files or `serviceAccountKey.json`. The `.gitignore` files block them.
- The service account key grants full admin access to your Firestore data.
- If a key ever reaches a public repo, delete it in Firebase and create a new one.
