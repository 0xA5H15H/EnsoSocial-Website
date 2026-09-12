// ==================== STORE LINKS ====================
// On iPhone/iPad, "Download" links go straight to the App Store instead of scrolling to #download.
// Runs before the smooth-scroll binding below so the rewritten links aren't treated as anchors.
const APP_STORE_URL = 'https://apps.apple.com/app/id6805994959';

if (/iphone|ipad|ipod/i.test(navigator.userAgent)) {
    document.querySelectorAll('[data-ios-store]').forEach(link => {
        link.href = APP_STORE_URL;
        link.rel = 'noopener';
    });
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

// ==================== HEADER ====================
// Condense the header once the page has scrolled past the top.
const siteHeader = document.querySelector('.site-header');

if (siteHeader) {
    let ticking = false;
    const updateHeader = () => {
        siteHeader.classList.toggle('is-scrolled', window.scrollY > 24);
        ticking = false;
    };
    window.addEventListener('scroll', () => {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(updateHeader);
        }
    }, { passive: true });
    updateHeader();
}

// ==================== POSTS TOUR ====================
// Wider screens: the pinned phone shows whichever step sits in the middle of the viewport.
// Phones: a Stories | Moments | Memories switch over one phone. It turns on its own every 6s while
// on screen, until the visitor taps a tab or swipes the phone — then it's theirs for the visit.
const tour = document.querySelector('.tour');

if (tour) {
    const steps = [...tour.querySelectorAll('.tour-step')];
    const screens = [...tour.querySelectorAll('.tour-screen')];
    const tabs = [...tour.querySelectorAll('.tour-tab')];
    const asSwitch = window.matchMedia('(max-width: 700px)');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let current = 0;
    let autoTimer = null;
    let inView = false;
    let visitorTookOver = false;

    const setStep = (index) => {
        current = index;
        steps.forEach((step, i) => step.classList.toggle('is-active', i === index));
        screens.forEach((screen, i) => screen.classList.toggle('is-current', i === index));
        tabs.forEach((tab, i) => {
            tab.classList.toggle('is-active', i === index);
            tab.setAttribute('aria-selected', String(i === index));
        });
    };

    const syncAuto = () => {
        const run = asSwitch.matches && inView && !visitorTookOver && !document.hidden && !reduceMotion.matches;
        if (run && !autoTimer) autoTimer = setInterval(() => setStep((current + 1) % steps.length), 6000);
        if (!run && autoTimer) {
            clearInterval(autoTimer);
            autoTimer = null;
        }
    };

    const takeOver = (index) => {
        visitorTookOver = true;
        syncAuto();
        setStep((index + steps.length) % steps.length);
    };

    tabs.forEach((tab, i) => tab.addEventListener('click', () => takeOver(i)));

    // Swipe the phone left/right to move between steps
    const visual = tour.querySelector('.tour-visual');
    let touchX = null;
    visual.addEventListener('touchstart', (event) => { touchX = event.touches[0].clientX; }, { passive: true });
    visual.addEventListener('touchend', (event) => {
        if (touchX === null || !asSwitch.matches) return;
        const dx = event.changedTouches[0].clientX - touchX;
        touchX = null;
        if (Math.abs(dx) > 40) takeOver(current + (dx < 0 ? 1 : -1));
    });

    const stepObserver = new IntersectionObserver((entries) => {
        if (asSwitch.matches) return;   // on phones the switch decides, not the scroll position
        entries.forEach(entry => {
            if (entry.isIntersecting) setStep(steps.indexOf(entry.target));
        });
    }, { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach(step => stepObserver.observe(step));

    new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        syncAuto();
    }, { threshold: 0.3 }).observe(tour);

    document.addEventListener('visibilitychange', syncAuto);
    [asSwitch, reduceMotion].forEach(query => {
        if (query.addEventListener) query.addEventListener('change', syncAuto);
        else query.addListener(syncAuto);
    });
}

// ==================== THEME CAROUSEL ====================
// Five fixed slots (0–4, centre = 2); each phone's data-slot says where it sits.
// Every few seconds the fan turns one step to the right, so the left neighbour takes the centre.
// Clicking a side phone brings it straight to the centre, and the turning carries on from there.
// A phone that would run off one end fades out, jumps unseen to the other end and fades back in,
// so nothing ever sweeps across the fan. Turning pauses off screen and in background tabs, never
// runs with reduced motion, and the whole thing is a plain swipe row on phones.
const themeFan = document.querySelector('.theme-fan');

if (themeFan) {
    const phones = [...themeFan.querySelectorAll('.phone')];
    const count = phones.length;
    const CENTRE = 2;
    const TURN_EVERY = 3200;
    const MOVE_TIME = 1000;   // matches the transform transition in home.css
    const FADE_TIME = 450;    // matches the .is-wrapping opacity transition

    const asRow = window.matchMedia('(max-width: 700px)');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let timer = null;
    let inView = false;
    let moving = false;

    const moveBy = (delta) => {
        moving = true;
        setTimeout(() => { moving = false; }, MOVE_TIME);

        phones.forEach(phone => {
            const target = Number(phone.dataset.slot) + delta;
            if (target >= 0 && target < count) {
                phone.dataset.slot = target;
                return;
            }
            phone.classList.add('is-wrapping');
            setTimeout(() => {
                phone.dataset.slot = (target + count) % count;
                // Force layout so the jump is applied (untransitioned) before the fade-in transition returns
                void phone.offsetWidth;
                phone.classList.remove('is-wrapping');
            }, FADE_TIME);
        });
    };

    const sync = () => {
        const shouldRun = inView && !document.hidden && !asRow.matches && !reduceMotion.matches;
        if (shouldRun && !timer) timer = setInterval(() => moveBy(1), TURN_EVERY);
        if (!shouldRun && timer) {
            clearInterval(timer);
            timer = null;
        }
    };

    themeFan.addEventListener('click', (event) => {
        const phone = event.target.closest('.phone');
        if (!phone || asRow.matches || moving) return;
        const delta = CENTRE - Number(phone.dataset.slot);
        if (delta === 0) return;
        moveBy(delta);
        // Restart the clock so the next automatic turn comes a full interval after the click
        clearInterval(timer);
        timer = null;
        sync();
    });

    new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        sync();
    }, { threshold: 0.2 }).observe(themeFan);

    document.addEventListener('visibilitychange', sync);
    // Safari < 14 only has the old addListener API on media queries
    [asRow, reduceMotion].forEach(query => {
        if (query.addEventListener) query.addEventListener('change', sync);
        else query.addListener(sync);
    });
}

// ==================== PRIVACY ORBIT ====================
// Six guarantees ride a slow elliptical ring (one lap every 80s). Whichever tile reaches the top is
// highlighted and its explanation fades into the fixed centre, so the text cycles on its own (~13s
// each) and never moves while it's read. Pointing at or keyboard-focusing a tile pauses the ring and
// shows that one; a click/tap shows it until the next tile reaches the top, then the cycle carries on.
// There's also a Pause button. Below 961px it's a tap-only row of pills; with reduced motion the
// ring holds still and nothing changes on its own.
const orbit = document.querySelector('.orbit');

if (orbit) {
    const nodes = [...orbit.querySelectorAll('.orbit-node')];
    const details = [...orbit.querySelectorAll('.orbit-detail')];
    const intro = orbit.querySelector('.orbit-intro');
    const toggle = orbit.querySelector('.orbit-toggle');
    const readout = orbit.querySelector('.orbit-readout');
    const asRing = window.matchMedia('(min-width: 961px)');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const LAP = 80000;
    const STEP = (2 * Math.PI) / nodes.length;
    // The first guarantee starts just before the top, so it rises into place and gets a full
    // turn (~13s) on show like every other tile, instead of handing over halfway through
    let angle = -Math.PI / 2 - STEP / 2 + 0.001;
    let frame = null;
    let lastTime = null;
    let inView = false;
    let hovering = false;
    let focused = false;
    let userPaused = false;
    let lastTop = -1;
    // Pill row (phones/tablets): the explanations cycle every 7s until a pill is tapped
    const PILL_EVERY = 7000;
    let pillTimer = null;
    let pillIndex = -1;
    let pillTapped = false;

    const ellipse = orbit.querySelector('.orbit-path ellipse');

    // The ring is sized from the tiles themselves, so a tile (even at its hover size) never pokes
    // outside the orbit box; the drawn ellipse is updated to the same radii.
    const place = () => {
        const w = orbit.clientWidth;
        const h = orbit.clientHeight;
        const rx = w / 2 - nodes[0].offsetWidth * 0.53;
        const ry = h / 2 - nodes[0].offsetHeight * 0.53;
        ellipse.setAttribute('rx', (rx / w) * 100);
        ellipse.setAttribute('ry', (ry / h) * 100);
        nodes.forEach((node, i) => {
            const a = angle + i * STEP;
            const x = w / 2 + rx * Math.cos(a);
            const y = h / 2 + ry * Math.sin(a);
            node.parentElement.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
        });
    };

    const tick = (now) => {
        if (lastTime !== null) angle += ((now - lastTime) / LAP) * 2 * Math.PI;
        lastTime = now;
        place();
        autoAdvance();
        frame = requestAnimationFrame(tick);
    };

    const sync = () => {
        const run = asRing.matches && inView && !hovering && !focused && !userPaused && !reduceMotion.matches;
        if (run && !frame) {
            lastTime = null;
            frame = requestAnimationFrame(tick);
        }
        if (!run && frame) {
            cancelAnimationFrame(frame);
            frame = null;
        }
        toggle.hidden = !asRing.matches || reduceMotion.matches;

        const cyclePills = !asRing.matches && inView && !pillTapped && !document.hidden && !reduceMotion.matches;
        if (cyclePills && !pillTimer) {
            if (pillIndex === -1) {
                pillIndex = 0;
                select(0);
            }
            pillTimer = setInterval(() => {
                pillIndex = (pillIndex + 1) % nodes.length;
                select(pillIndex);
            }, PILL_EVERY);
        }
        if (!cyclePills && pillTimer) {
            clearInterval(pillTimer);
            pillTimer = null;
        }
    };

    const layout = () => {
        if (asRing.matches) {
            place();
            if (!reduceMotion.matches) autoAdvance();
        } else {
            nodes.forEach(node => { node.parentElement.style.transform = ''; });
        }
        sync();
    };

    // Screen readers hear the explanation only when the visitor picked it, not every automatic change
    const select = (index, fromVisitor = false) => {
        readout.setAttribute('aria-live', fromVisitor ? 'polite' : 'off');
        nodes.forEach((node, i) => {
            node.classList.toggle('is-selected', i === index);
            node.setAttribute('aria-expanded', String(i === index));
        });
        details.forEach((detail, i) => { detail.hidden = i !== index; });
        intro.hidden = index !== -1;
    };

    // Index of the tile currently nearest the top of the ring (angle −π/2)
    const topIndex = () => {
        const k = Math.round((-Math.PI / 2 - angle) / STEP);
        return ((k % nodes.length) + nodes.length) % nodes.length;
    };

    // Show the top tile's explanation whenever a new tile reaches the top — unless the visitor is
    // pointing at or focused on one. A clicked tile stays shown until this next hand-over.
    const autoAdvance = () => {
        const top = topIndex();
        if (top === lastTop) return;
        lastTop = top;
        if (!hovering && !focused) select(top);
    };

    // Keyboard focus only — a mouse click focuses the button in some browsers, and that
    // shouldn't leave the ring paused until the visitor clicks somewhere else
    const isKeyboardFocus = (node) => {
        try { return node.matches(':focus-visible'); } catch (e) { return true; }
    };

    nodes.forEach((node, i) => {
        node.addEventListener('pointerenter', (event) => {
            if (event.pointerType !== 'mouse') return;
            hovering = true;
            select(i, true);
            sync();
        });
        node.addEventListener('pointerleave', (event) => {
            if (event.pointerType !== 'mouse') return;
            hovering = false;
            sync();
        });
        node.addEventListener('focus', () => {
            if (!isKeyboardFocus(node)) return;
            focused = true;
            select(i, true);
            sync();
        });
        node.addEventListener('blur', () => {
            focused = false;
            sync();
        });
        node.addEventListener('click', () => {
            select(i, true);
            if (!asRing.matches) {
                pillIndex = i;
                pillTapped = true;   // the visitor took over the pill row for this visit
                sync();
            }
        });
    });

    toggle.addEventListener('click', () => {
        userPaused = !userPaused;
        toggle.setAttribute('aria-pressed', String(userPaused));
        toggle.textContent = userPaused ? 'Resume motion' : 'Pause motion';
        sync();
    });

    new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        sync();
    }, { threshold: 0.2 }).observe(orbit);

    document.addEventListener('visibilitychange', sync);

    if (window.ResizeObserver) new ResizeObserver(layout).observe(orbit);
    else window.addEventListener('resize', layout);

    [asRing, reduceMotion].forEach(query => {
        if (query.addEventListener) query.addEventListener('change', layout);
        else query.addListener(layout);
    });

    select(-1);
    layout();
    // The ring layout only applies once body.js-loaded is set (on DOMContentLoaded), so lay out again
    // then and after load — rather than relying solely on the ResizeObserver catching the change
    document.addEventListener('DOMContentLoaded', layout);
    window.addEventListener('load', layout);
}

// ==================== PHONE APP BAR ====================
// Phones only: a small "Get the app" bar slides up once the hero has scrolled away and slides back
// down before the download section (which has its own buttons). The × hides it for the rest of the
// visit. Not shown on Android until the Play listing is live.
const appBar = document.querySelector('.app-bar');

if (appBar && !/android/i.test(navigator.userAgent)) {
    const DISMISSED_KEY = 'enso-app-bar-dismissed';
    let dismissed = false;
    try { dismissed = sessionStorage.getItem(DISMISSED_KEY) === '1'; } catch (e) { /* storage blocked */ }

    if (!dismissed) {
        const hero = document.querySelector('.hero');
        const download = document.querySelector('#download');
        const onPhone = window.matchMedia('(max-width: 700px)');
        let ticking = false;

        const update = () => {
            ticking = false;
            const show = onPhone.matches
                && hero.getBoundingClientRect().bottom < 0
                && download.getBoundingClientRect().top > window.innerHeight;
            appBar.classList.toggle('is-visible', show);
        };

        appBar.hidden = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(update);
            }
        }, { passive: true });
        update();

        appBar.querySelector('.app-bar-close').addEventListener('click', () => {
            appBar.classList.remove('is-visible');
            setTimeout(() => { appBar.hidden = true; }, 450);
            try { sessionStorage.setItem(DISMISSED_KEY, '1'); } catch (e) { /* storage blocked */ }
        });
    }
}

// ==================== SMOOTH SCROLL ====================
// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (!href.startsWith('#') || href === '#') return;

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
