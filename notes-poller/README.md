# notes-poller

Local service that watches Firestore for notes with `noteAIReviewed: false`,
sends the raw text to a local Ollama model, and writes the title/summary/
priority/category back onto the note.

## Setup

1. Install Ollama (https://ollama.com) and pull a model:
   ```
   ollama pull llama3.1
   ```

2. Get a Firebase service account key:
   - Firebase Console -> Project Settings -> Service Accounts
   - "Generate new private key" -> save the downloaded file as
     `serviceAccountKey.json` in this folder (already gitignored - never
     commit this file, it grants full admin access to your Firestore data)

3. Copy `.env.example` to `.env` and adjust if your Ollama model/host differs.

4. Install dependencies and run:
   ```
   npm install
   npm start
   ```

The service stays running and reacts in real time - no cron/polling loop
needed, it uses Firestore's live listener.
