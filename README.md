# Enso Social — Waitlist Landing Page

> **"Your life, not a scoreboard."**
> 
> Enso is a social app built on real human interaction, requiring you to meet in person before connecting online. This is the waitlist landing page for the Toronto pilot launch.

---

## Project Structure

```text
EnsoSocial-Website/
├── index.html          # Main landing page with a modern dark theme
├── styles.css          # Core styles, toast notifications, loading states & responsive layouts
├── script.js           # Form handling, Supabase client client-side database interaction, validation
├── env.js              # Environment credentials (gitignored)
├── env.example.js      # Template showing expected environment keys
├── build.sh            # Automated build script that generates env.js on Vercel
├── vercel.json         # Vercel routing, build commands, and security headers
├── terms.html          # User terms of service page
├── privacy.html        # Privacy policy page
└── .gitignore          # Rules to exclude environment files and cache from Git
```

---

## Features

- **Premium Dark Design**: Fully custom palette using dynamic micro-animations, glassmorphism elements, and responsive layout scaling.
- **Robust Client Validation**: Real-time form checks, visual error highlighting, and loading state animations.
- **Supabase Integration**: Stores user sign-ups securely via client-side libraries.
- **Error Tracking & Diagnostics**: Integrated client-side error reporter that logs submission failures directly to the database.
- **Secured Credentials**: Environment variables are built dynamically during deployment to prevent accidental leaks.
- **Legal Compliance Pages**: Custom matching Terms of Service and Privacy Policy pages.

---

## Database Architecture

The project is backed by **Supabase (PostgreSQL)**, consisting of the following tables:

### 1. `beta_signups`
Stores waitlist signups.
- `id` (UUID, Primary Key) - Auto-generated unique identifier
- `name` (TEXT, Optional) - User's name
- `email` (TEXT, Unique, Required) - User's email address
- `signed_up_at` (TIMESTAMPTZ) - Auto-generated timestamp

### 2. `error_logs`
Logs failed signup attempts for developers to debug without exposing logs to the public client.
- `id` (UUID, Primary Key) - Auto-generated unique identifier
- `error_code` (TEXT) - SQL error code or connection status code
- `error_message` (TEXT) - Technical details of the error
- `attempted_email` (TEXT) - The email address attempted during signup
- `user_agent` (TEXT) - Client browser environment information
- `created_at` (TIMESTAMPTZ) - Auto-generated timestamp

### Row-Level Security (RLS) Policies
Both tables have RLS enabled with security rules applied:
- `Allow public inserts`: Anyone (`anon` role) can submit new signups and report errors.
- `Allow authenticated reads`: Only logged-in administrators/authenticated roles can query or view the database contents.

---

## Local Development Setup

To test the waitlist page locally on your computer:

1. Create a copy of `env.example.js` and name it `env.js`:
   ```bash
   cp env.example.js env.js
   ```
2. Populate `env.js` with your active Supabase project credentials:
   ```javascript
   window.ENV = {
       SUPABASE_URL: 'https://your-project-ref.supabase.co',
       SUPABASE_ANON_KEY: 'your-public-anon-key'
   };
   ```
3. Run a simple local server to preview the site:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx http-server
   ```

---

## Vercel Production Deployment

The project is pre-configured to build securely on Vercel.

1. Push your code to your GitHub repository.
2. Link your repository in the **Vercel Dashboard**.
3. Under **Project Settings > Environment Variables**, add:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_ANON_KEY`: Your Supabase anon public API key
4. Deploy the project. The custom `build.sh` script will automatically generate your `env.js` file dynamically on Vercel's build servers, keeping your API keys hidden from GitHub.
