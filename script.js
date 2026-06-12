// ==================== DIAGNOSTIC GLOBAL ERROR HANDLING ====================
window.addEventListener('error', (event) => {
    console.error('Captured unhandled error:', event.error || event.message);
    alert(`[Enso Debug Alert]\nError: ${event.message}\nFile: ${event.filename}\nLine: ${event.lineno}:${event.colno}`);
});

console.log('Enso script loaded successfully. Diagnostic logging active.');

// ==================== SUPABASE INITIALIZATION ====================
// Sanitize SUPABASE_URL by stripping any trailing slash that could break request formatting
const SUPABASE_URL = (window.ENV?.SUPABASE_URL || '').trim().replace(/\/+$/, '');
const SUPABASE_ANON_KEY = (window.ENV?.SUPABASE_ANON_KEY || '').trim();

let supabase = null;

console.log('Supabase Config:', { SUPABASE_URL, hasKey: !!SUPABASE_ANON_KEY });

// Initialize Supabase safely to prevent crashing if the library is blocked or failed to load
if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    if (window.supabase) {
        try {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('Supabase client initialized successfully.');
        } catch (initErr) {
            console.error('Error creating Supabase client:', initErr);
            alert(`[Enso Client Init Error]\nMessage: ${initErr.message}`);
        }
    } else {
        console.error('Supabase library (supabase-js) is not loaded or was blocked by an adblocker/network issue.');
        alert('[Enso Library Error]\nThe Supabase database library failed to load. Please check if an adblocker is blocking npm/jsdelivr CDNs.');
    }
} else {
    console.warn('Supabase credentials not found in window.ENV.');
}

// ==================== SCROLL ANIMATIONS ====================
// Add js-loaded class to enable animations
document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('js-loaded');
});

// Intersection Observer for scroll-triggered animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -80px 0px'
};

const animateOnScroll = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animated');
            // Stop observing after animation
            animateOnScroll.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all elements with animate-on-scroll class
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => {
        // Add a small delay to ensure smooth loading
        setTimeout(() => {
            animateOnScroll.observe(el);
        }, 100);
    });
});

// ==================== SMOOTH SCROLL ====================
// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;

        e.preventDefault();
        const target = document.querySelector(href);

        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });

            // Update URL without jumping
            if (history.pushState) {
                history.pushState(null, null, href);
            }
        }
    });
});

// ==================== TOAST NOTIFICATION SYSTEM ====================
function createToast(text, type) {
    // Remove any existing toast
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;

    const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
    toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-content">${text}</div>
        <button class="toast-close" aria-label="Close notification">&times;</button>
    `;

    document.body.appendChild(toast);

    // Trigger entrance animation
    requestAnimationFrame(() => {
        toast.classList.add('toast-visible');
    });

    // Close button handler
    toast.querySelector('.toast-close').addEventListener('click', () => {
        dismissToast(toast);
    });

    // Auto-dismiss after 6 seconds for success, 8 for errors
    const duration = type === 'success' ? 6000 : 8000;
    setTimeout(() => {
        dismissToast(toast);
    }, duration);
}

function dismissToast(toast) {
    if (!toast || !toast.parentNode) return;
    toast.classList.remove('toast-visible');
    toast.classList.add('toast-exit');
    setTimeout(() => {
        if (toast.parentNode) toast.remove();
    }, 400);
}

// ==================== ERROR LOGGING ====================
async function logError(errorCode, errorMessage, attemptedEmail) {
    if (!supabase) return;

    try {
        await supabase
            .from('error_logs')
            .insert([{
                error_code: errorCode || 'UNKNOWN',
                error_message: errorMessage || 'No message',
                attempted_email: attemptedEmail || '',
                user_agent: navigator.userAgent,
                created_at: new Date().toISOString()
            }]);
    } catch (logErr) {
        // Silently fail — don't let error logging break the user experience
        console.error('Failed to log error:', logErr);
    }
}

// ==================== FORM HANDLING ====================
const form = document.getElementById('beta-signup-form');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const submitBtn = document.getElementById('submit-btn');
const btnText = document.querySelector('.btn-text');
const btnLoader = document.querySelector('.btn-loader');
const messageDiv = document.getElementById('message');

// Show message to user (in-form message + toast)
function showMessage(text, type) {
    // Show in-form message
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';

    // Scroll message into view
    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Also show a toast notification
    createToast(text, type);

    // Auto-hide in-form success messages after 6 seconds
    if (type === 'success') {
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 6000);
    }
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Set loading state
function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    btnText.style.display = isLoading ? 'none' : 'inline';
    btnLoader.style.display = isLoading ? 'inline' : 'none';

    if (isLoading) {
        submitBtn.classList.add('loading');
    } else {
        submitBtn.classList.remove('loading');
    }
}

// Handle form submission
async function handleSubmit(e) {
    e.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();

    console.log('Form submission intercepted. Data:', { name, email });

    // Hide any previous messages
    messageDiv.style.display = 'none';

    // Validate email (required)
    if (!email) {
        showMessage('Please enter your email address.', 'error');
        emailInput.focus();
        return;
    }

    if (!isValidEmail(email)) {
        showMessage('That doesn\'t look like a valid email. Mind double-checking?', 'error');
        emailInput.focus();
        return;
    }

    // Check if Supabase is initialized
    if (!supabase) {
        showMessage('We\'re having trouble connecting right now. Please try again in a moment.', 'error');
        console.error('Supabase is not initialized. Check your environment variables.');
        await logError('SUPABASE_NOT_INIT', 'Supabase client not initialized', email);
        return;
    }

    setLoading(true);

    try {
        // Prepare data object
        const signupData = {
            email: email,
            signed_up_at: new Date().toISOString()
        };

        // Add name if provided
        if (name) {
            signupData.name = name;
        }

        // Insert into Supabase
        const { data, error } = await supabase
            .from('beta_signups')
            .insert([signupData]);

        if (error) {
            // Handle duplicate email error
            if (error.code === '23505') {
                showMessage("You're already on the list! We'll be in touch soon. 🎉", 'success');
                // Clear form on duplicate (they're already signed up)
                nameInput.value = '';
                emailInput.value = '';
            } else {
                console.error('Supabase error details:', error);
                await logError(error.code, error.message, email);
                showMessage('Something went wrong on our end. We\'ve logged the issue — please try again shortly.', 'error');
            }
        } else {
            showMessage('You\'re in! Welcome to the founding crew. We\'ll reach out when it\'s time. 🚀', 'success');

            // Clear form on success
            nameInput.value = '';
            emailInput.value = '';

            console.log('New signup recorded successfully');
        }
    } catch (error) {
        console.error('Error submitting form:', error);
        await logError('NETWORK_ERROR', error.message || 'Network or fetch error', email);
        showMessage('Couldn\'t reach our servers. Check your connection and try again.', 'error');
    } finally {
        setLoading(false);
    }
}

// Add form submit event listener
if (form) {
    form.addEventListener('submit', handleSubmit);
}

// ==================== DEVELOPMENT WARNINGS ====================
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        console.warn('⚠️ Supabase credentials not found. Please set up your environment variables.');
        console.log('Copy env.example.js to env.js and add your Supabase credentials.');
    } else {
        console.log('✅ Supabase initialized successfully');
    }
}

// ==================== ACCESSIBILITY ====================
// Add keyboard navigation improvements
document.addEventListener('keydown', (e) => {
    // Escape key closes messages and toasts
    if (e.key === 'Escape') {
        if (messageDiv.style.display === 'block') {
            messageDiv.style.display = 'none';
        }
        const toast = document.querySelector('.toast-notification');
        if (toast) dismissToast(toast);
    }
});

// ==================== PERFORMANCE ====================
// Preload critical resources on hover (optional enhancement)
const ctaButtons = document.querySelectorAll('.cta-button');
ctaButtons.forEach(button => {
    button.addEventListener('mouseenter', () => {
        // Prefetch or prepare any resources needed for the signup form
        // This is a placeholder for future optimizations
    }, { once: true });
});
