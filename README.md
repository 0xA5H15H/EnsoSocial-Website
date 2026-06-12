# Enso - The First Social App That Ends Social Media

**"Your life, not a scoreboard."**

Enso is a social app that requires you to meet someone in person before you can connect online. No profile stalking. No cold DMs. No friend requests from strangers. Just real connections with people actually around you.

## About This Project

This is the waitlist landing page for Enso, launching first at the University of Toronto with 100 founding members. Built with vanilla JavaScript, HTML, CSS, and Supabase.

### What Makes Enso Different

- **In-Person First**: You can't connect online until you've met in person (tap phones to connect)
- **No Vanity Metrics**: No follower counts, like counts, or trending pages
- **Ephemeral Content**: Posts disappear after 7 days (unless tagged as Memories)
- **Feed That Ends**: After 10-15 posts, you're done for the day
- **Hyperlocal Focus**: Starting with one university, then Toronto
- **Two Ways to Meet**: Circles (planned events) and Drops (spontaneous hangouts)

## Landing Page Features

- **Dark, Modern Design** - Sleek black theme with accent colors
- **Smooth Animations** - Page load animations and scroll-triggered effects
- **Fully Responsive** - Perfect experience on desktop, tablet, and mobile
- **Form Validation** - Email validation and duplicate prevention
- **Supabase Integration** - Secure data storage with Row Level Security
- **Name & Email Collection** - Capture both name (optional) and email
- **Accessibility First** - Keyboard navigation, skip links, and ARIA labels
- **Vercel Ready** - Optimized for instant deployment

## Setup Instructions

### 1. Supabase Setup

1. Create a free account at [supabase.com](https://supabase.com)

2. Create a new project

3. Once your project is created, go to the SQL Editor and run this query to create the beta_signups table:

```sql
CREATE TABLE beta_signups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    signed_up_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add an index on email for faster lookups
CREATE INDEX idx_beta_signups_email ON beta_signups(email);

-- Add an index on signup date for sorting
CREATE INDEX idx_beta_signups_date ON beta_signups(signed_up_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE beta_signups ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow inserts from anyone (for the signup form)
CREATE POLICY "Allow public inserts" ON beta_signups
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Create a policy to allow reading only for authenticated users (optional - for admin panel later)
CREATE POLICY "Allow authenticated reads" ON beta_signups
    FOR SELECT
    TO authenticated
    USING (true);
```

4. Get your Supabase credentials:
   - Go to Project Settings > API
   - Copy your `Project URL` (this is your SUPABASE_URL)
   - Copy your `anon/public` key (this is your SUPABASE_ANON_KEY)

### 2. Local Development (Optional)

If you want to test locally before deploying:

1. Create a file called `env.js` with your credentials:

```javascript
window.ENV = {
    SUPABASE_URL: 'your-project-url-here',
    SUPABASE_ANON_KEY: 'your-anon-key-here'
};
```

2. Open `index.html` in your browser or use a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server
```

### 3. Deploy to Vercel

1. Install Vercel CLI (optional):
```bash
npm i -g vercel
```

2. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)

3. Go to [vercel.com](https://vercel.com) and sign up/login

4. Click "New Project" and import your repository

5. Add environment variables:
   - Click on "Environment Variables"
   - Add `SUPABASE_URL` with your Supabase project URL
   - Add `SUPABASE_ANON_KEY` with your Supabase anon key

6. Before deploying, update the `env.js` file on Vercel to inject environment variables. You have two options:

   **Option A: Use Vercel's build process**

   Add a `build.sh` script and update vercel.json to run it. The script would replace placeholders in env.js.

   **Option B: Manual update** (Simpler for now)

   After deployment, go to your Vercel project settings and update the `env.js` file directly with your Supabase credentials in the Vercel file editor, or use Vercel environment variables in a different way.

   **Option C: Use Vercel Environment Variables directly** (Recommended)

   Update your `script.js` to read from Vercel's environment variables instead. Vercel automatically exposes environment variables prefixed with `VITE_`, `NEXT_PUBLIC_`, or you can access them server-side.

   For a static site like this, the easiest approach is to:
   - Keep the current setup
   - Manually update `env.js` after first deployment with your credentials
   - Or use a build script to inject them

7. Click "Deploy"

### Quick Vercel Deployment (Recommended Approach)

For the simplest deployment:

1. Push code to GitHub
2. Import to Vercel
3. After deployment, edit `env.js` directly in Vercel's dashboard:
   - Go to your project in Vercel
   - Click on "Deployments"
   - Click on the latest deployment
   - Find `env.js` in the file browser
   - Update it with your actual Supabase credentials
   - Vercel will automatically redeploy

Alternatively, before pushing to GitHub, update `env.js` with your actual credentials (just be careful not to commit sensitive keys to public repositories).

## Project Structure

```
Enso-Prod/
├── index.html          # Main landing page with dark theme
├── styles.css          # All styles, animations, and responsive design
├── script.js           # Form handling, Supabase integration, and scroll animations
├── env.js              # Environment configuration
├── vercel.json         # Vercel deployment configuration
├── .gitignore          # Git ignore file
└── README.md           # This file
```

## Design Features

### Animations
- **Hero Animation** - Smooth fade-in on page load
- **Scroll Animations** - Elements animate into view as you scroll
- **Pulse Effect** - Gentle "echo" pulse animation in the hero section
- **Hover Effects** - Interactive hover states on cards and buttons
- **Smooth Scrolling** - Silky smooth anchor link navigation

### Color Scheme
- **Background**: Pure black (#000000)
- **Foreground**: Light gray (#F6F7F8)
- **Accent**: Purple (#A78BFA)
- **Muted Text**: Gray tones for hierarchy

All colors can be customized in the CSS variables at the top of `styles.css`.

## Viewing Signups

To view your beta signups:

1. Go to your Supabase project dashboard
2. Click on "Table Editor" in the sidebar
3. Select the `beta_signups` table
4. You'll see all signups with names (if provided), emails, and timestamps

You can also export this data as CSV from Supabase.

### Database Schema

The `beta_signups` table has the following fields:
- `id` (UUID) - Unique identifier (auto-generated)
- `name` (TEXT) - User's name (optional)
- `email` (TEXT) - User's email (required, unique)
- `signed_up_at` (TIMESTAMP) - Signup timestamp (auto-generated)

## Customization

### Change Colors

Edit the CSS variables at the top of `styles.css`:

```css
:root {
    --bg: #000000;           /* Background color */
    --fg: #F6F7F8;           /* Text color */
    --accent: #00FFC6;       /* Accent color (buttons, highlights) */
    --accent-hover: #00E6B3; /* Accent hover state */
    /* ... other variables */
}
```

Try different accent colors:
- Purple: `#A78BFA` (default)
- Violet: `#8B5CF6`
- Blue: `#3B82F6`
- Pink: `#EC4899`
- Cyan: `#00FFC6`

### Change Copy

Edit the text directly in `index.html`:
- Hero title: line 36
- Hero subtitle: line 37
- Hero description: lines 38-42
- Section titles and content throughout the file

### Add More Fields

To collect more than just email:

1. Add new input fields in `index.html`
2. Update the table schema in Supabase
3. Update the insert statement in `script.js`

## Troubleshooting

**Form not submitting:**
- Check browser console for errors
- Verify Supabase credentials are correct
- Ensure the `beta_signups` table exists in Supabase

**"Service is not configured" error:**
- Make sure `env.js` has your actual Supabase credentials
- Check that `env.js` is loaded before `script.js` in `index.html`

**Duplicate email error:**
- This is expected behavior - the app will show a friendly message
- Emails are unique in the database

## Next Steps

- Set up email notifications when someone signs up (using Supabase Functions)
- Create an admin panel to view and manage signups
- Add analytics tracking
- Set up automated email campaigns for beta invites

## License

Private project - All rights reserved

## Support

For issues or questions, contact the development team. #
