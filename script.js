// Navigation
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.section');

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();

        // Scroll to corresponding section
        const targetId = item.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Update active nav based on scroll position
const updateActiveNav = () => {
    let currentSection = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const scrollPosition = window.scrollY + 200;

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });

    navItems.forEach(nav => {
        nav.classList.remove('active');
        if (nav.getAttribute('href') === `#${currentSection}`) {
            nav.classList.add('active');
        }
    });
};

window.addEventListener('scroll', updateActiveNav);
window.addEventListener('load', updateActiveNav);

// Mobile Menu Toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const sidebar = document.querySelector('.sidebar');

mobileMenuBtn?.addEventListener('click', () => {
    sidebar.classList.toggle('active');
});

// Close mobile menu when clicking nav items
navItems.forEach(item => {
    item.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('active');
        }
    });
});

// Close mobile menu when clicking content area
const content = document.querySelector('.content');
content?.addEventListener('click', () => {
    if (window.innerWidth <= 768 && sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
    }
});

// Track most visible project tile
const visibleProjects = new Map();
let projectSequence = 0;

// Show More button removed - all projects now visible by default

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeIn 0.6s ease forwards';
        }
    });
}, observerOptions);

const activeObserver = new IntersectionObserver(handleActiveEntries, {
    threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
    rootMargin: '-35% 0px -45% 0px'
});

const projectItems = Array.from(document.querySelectorAll('.project-item'));
projectItems.forEach(item => enhanceProjectItem(item));

const initialProject = projectItems[0];
if (initialProject) {
    setActiveProject(initialProject);
}

function enhanceProjectItem(item) {
    if (!item || item.dataset.projectEnhanced === 'true') {
        return;
    }

    item.dataset.projectId = item.dataset.projectId ?? String(projectSequence++);
    item.dataset.projectEnhanced = 'true';

    const link = item.querySelector('.project-link');
    const title = item.querySelector('h3')?.textContent?.trim();
    if (link && title) {
        link.setAttribute('aria-label', `View ${title}`);
    }

    observer.observe(item);
    activeObserver.observe(item);

    item.addEventListener('focusin', () => setActiveProject(item));
}

function handleActiveEntries(entries) {
    let changed = false;

    entries.forEach(entry => {
        const id = entry.target.dataset.projectId;
        if (!id) {
            return;
        }

        if (entry.isIntersecting) {
            visibleProjects.set(id, {
                element: entry.target,
                ratio: entry.intersectionRatio
            });
        } else {
            visibleProjects.delete(id);
        }

        changed = true;
    });

    if (!changed) {
        return;
    }

    let candidate = null;
    let bestRatio = -Infinity;

    visibleProjects.forEach(({ element, ratio }) => {
        if (ratio > bestRatio) {
            bestRatio = ratio;
            candidate = element;
        }
    });

    if (candidate) {
        setActiveProject(candidate);
    }
}

function setActiveProject(item) {
    if (!item) {
        return;
    }

    const rowTop = item.offsetTop;
    document.querySelectorAll('.project-item').forEach(tile => {
        const sameRow = Math.abs(tile.offsetTop - rowTop) <= 2;
        tile.classList.toggle('active-feed', sameRow);
    });
}


window.addEventListener('resize', () => {
    const activeTile = document.querySelector('.project-item.active-feed');
    if (activeTile) {
        setActiveProject(activeTile);
    }
});

let starsCreated = false;

// Create twinkling stars with random positions
function createStars() {
    if (starsCreated) return;

    const starsContainer1 = document.querySelector('.stars');
    const starsContainer2 = document.querySelector('.stars2');
    const starsContainer3 = document.querySelector('.stars3');

    // Create far stars (1000 stars) - distant, slow
    for (let i = 0; i < 1000; i++) {
        const star = document.createElement('div');
        star.className = 'star star-far';
        star.style.left = (Math.random() * window.innerWidth * 1.5) + 'px';
        star.style.top = (Math.random() * window.innerHeight * 1.5) + 'px';
        star.style.animationDelay = (Math.random() * 3) + 's';
        star.style.animationDuration = (0.5 + Math.random() * 1.5) + 's';
        star.style.width = '0.15px';
        star.style.height = '0.15px';
        star.dataset.speed = '0.02';
        starsContainer1?.appendChild(star);
    }

    // Create medium stars (600 stars) - middle distance
    for (let i = 0; i < 600; i++) {
        const star = document.createElement('div');
        star.className = 'star star-mid';
        star.style.left = (Math.random() * window.innerWidth * 1.5) + 'px';
        star.style.top = (Math.random() * window.innerHeight * 1.5) + 'px';
        star.style.animationDelay = (Math.random() * 4) + 's';
        star.style.animationDuration = (0.6 + Math.random() * 2) + 's';
        star.style.width = '0.25px';
        star.style.height = '0.25px';
        star.dataset.speed = '0.05';
        starsContainer2?.appendChild(star);
    }

    // Create near stars (200 stars) - close, fast
    for (let i = 0; i < 200; i++) {
        const star = document.createElement('div');
        star.className = 'star star-near';
        star.style.left = (Math.random() * window.innerWidth * 1.5) + 'px';
        star.style.top = (Math.random() * window.innerHeight * 1.5) + 'px';
        star.style.animationDelay = (Math.random() * 5) + 's';
        star.style.animationDuration = (0.7 + Math.random() * 2.5) + 's';
        star.style.width = '0.4px';
        star.style.height = '0.4px';
        star.dataset.speed = '0.1';
        starsContainer3?.appendChild(star);
    }

    starsCreated = true;
}

// Initialize stars on page load (only once)
createStars();

// Move stars continuously - creating parallax depth effect
let lastFrameTime = 0;
const frameInterval = 1000 / 120; // 120 FPS

function moveStars(currentTime) {
    if (currentTime - lastFrameTime >= frameInterval) {
        document.querySelectorAll('.star').forEach(star => {
            const currentLeft = parseFloat(star.style.left);
            const currentTop = parseFloat(star.style.top);
            const speed = parseFloat(star.dataset.speed) || 0.02;

            const newLeft = currentLeft - speed; // Move left based on speed
            const newTop = currentTop + speed; // Move down based on speed

            star.style.left = newLeft + 'px';
            star.style.top = newTop + 'px';

            // Reset if completely off screen
            if (newTop > window.innerHeight + 100 || newLeft < -100) {
                star.style.left = (window.innerWidth + Math.random() * 200) + 'px';
                star.style.top = (-Math.random() * 200) + 'px';
            }
        });

        lastFrameTime = currentTime;
    }

    requestAnimationFrame(moveStars);
}

// Start continuous star movement
moveStars();


