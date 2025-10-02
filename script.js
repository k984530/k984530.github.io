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

    // Reduce star count on mobile for performance
    const isMobile = window.innerWidth <= 768;
    const starMultiplier = isMobile ? 0.15 : 1;
    const starSizeMultiplier = isMobile ? 5 : 1;
    const spawnMargin = isMobile ? 0 : 300;

    // Create far stars (1000 stars or 200 on mobile) - distant, slow - distributed across entire screen
    for (let i = 0; i < 1000 * starMultiplier; i++) {
        const star = document.createElement('div');
        star.className = 'star star-far';
        const startX = -spawnMargin + Math.random() * (window.innerWidth + spawnMargin * 2);
        const startY = -spawnMargin + Math.random() * (window.innerHeight + spawnMargin * 2);
        star.style.left = startX + 'px';
        star.style.top = startY + 'px';
        star.style.animationDelay = (Math.random() * 3) + 's';
        star.style.animationDuration = (0.5 + Math.random() * 1.5) + 's';
        star.style.width = (0.15 * starSizeMultiplier) + 'px';
        star.style.height = (0.15 * starSizeMultiplier) + 'px';
        star.dataset.speed = '0.3';
        star.dataset.translateX = '0';
        star.dataset.translateY = '0';
        star.dataset.translateZ = '0';
        star.dataset.zSpeed = '0.5';
        starsContainer1?.appendChild(star);
    }

    // Create medium stars (600 stars or 120 on mobile) - middle distance - distributed across entire screen
    for (let i = 0; i < 600 * starMultiplier; i++) {
        const star = document.createElement('div');
        star.className = 'star star-mid';
        const startX = -spawnMargin + Math.random() * (window.innerWidth + spawnMargin * 2);
        const startY = -spawnMargin + Math.random() * (window.innerHeight + spawnMargin * 2);
        star.style.left = startX + 'px';
        star.style.top = startY + 'px';
        star.style.animationDelay = (Math.random() * 4) + 's';
        star.style.animationDuration = (0.6 + Math.random() * 2) + 's';
        star.style.width = (0.25 * starSizeMultiplier) + 'px';
        star.style.height = (0.25 * starSizeMultiplier) + 'px';
        star.dataset.speed = '0.5';
        star.dataset.translateX = '0';
        star.dataset.translateY = '0';
        star.dataset.translateZ = '0';
        star.dataset.zSpeed = '1';
        starsContainer2?.appendChild(star);
    }

    // Create near stars (200 stars or 40 on mobile) - close, fast - distributed across entire screen
    for (let i = 0; i < 200 * starMultiplier; i++) {
        const star = document.createElement('div');
        star.className = 'star star-near';
        const startX = -spawnMargin + Math.random() * (window.innerWidth + spawnMargin * 2);
        const startY = -spawnMargin + Math.random() * (window.innerHeight + spawnMargin * 2);
        star.style.left = startX + 'px';
        star.style.top = startY + 'px';
        star.style.animationDelay = (Math.random() * 5) + 's';
        star.style.animationDuration = (0.7 + Math.random() * 2.5) + 's';
        star.style.width = (0.4 * starSizeMultiplier) + 'px';
        star.style.height = (0.4 * starSizeMultiplier) + 'px';
        star.dataset.speed = '1';
        star.dataset.translateX = '0';
        star.dataset.translateY = '0';
        star.dataset.translateZ = '0';
        star.dataset.zSpeed = '2';
        starsContainer3?.appendChild(star);
    }

    starsCreated = true;
}

// Initialize stars on page load (only once)
createStars();

// Initialize nebula positions
document.querySelectorAll('.nebula').forEach((nebula, index) => {
    nebula.dataset.translateX = '0';
    nebula.dataset.translateY = '0';
    nebula.dataset.driftSpeed = (0.005 + index * 0.002).toString();
});

// Move stars and nebulae continuously - creating 3D parallax depth effect
const isMobileDevice = window.innerWidth <= 768;
let frameCounter = 0;

function moveStars() {
    frameCounter++;

    // On mobile, update every 2 frames for better performance
    if (isMobileDevice && frameCounter % 2 !== 0) {
        requestAnimationFrame(moveStars);
        return;
    }

    // Move stars
    document.querySelectorAll('.star').forEach(star => {
        const speed = parseFloat(star.dataset.speed) || 0.3;
        const zSpeed = parseFloat(star.dataset.zSpeed) || 0.5;
        let translateX = parseFloat(star.dataset.translateX) || 0;
        let translateY = parseFloat(star.dataset.translateY) || 0;
        let translateZ = parseFloat(star.dataset.translateZ) || -500;

        translateX -= speed; // Move left based on speed
        translateY += speed; // Move down based on speed
        translateZ += zSpeed; // Move forward toward viewer

        // Calculate scale based on Z position for depth effect
        const scale = Math.max(0.5, 1 + translateZ / 200);

        star.style.transform = `translate3d(${translateX}px, ${translateY}px, ${translateZ}px) scale(${scale})`;
        star.dataset.translateX = translateX;
        star.dataset.translateY = translateY;
        star.dataset.translateZ = translateZ;

        // Reset if completely off screen or too close
        const baseLeft = parseFloat(star.style.left);
        const baseTop = parseFloat(star.style.top);
        const currentLeft = baseLeft + translateX;
        const currentTop = baseTop + translateY;

        if (currentTop > window.innerHeight + 200 || currentLeft < -200 || currentTop < -200 || currentLeft > window.innerWidth + 200 || translateZ > 200) {
            // Respawn across entire screen area evenly
            star.style.left = (Math.random() * window.innerWidth) + 'px';
            star.style.top = (Math.random() * window.innerHeight) + 'px';

            star.style.transform = `translate3d(0, 0, 0) scale(1)`;
            star.dataset.translateX = '0';
            star.dataset.translateY = '0';
            star.dataset.translateZ = '0';
        }
    });

    // Move nebulae continuously (no reset - infinite drift)
    document.querySelectorAll('.nebula').forEach(nebula => {
        const driftSpeed = parseFloat(nebula.dataset.driftSpeed) || 0.005;
        let translateX = parseFloat(nebula.dataset.translateX) || 0;
        let translateY = parseFloat(nebula.dataset.translateY) || 0;

        translateX -= driftSpeed;
        translateY += driftSpeed * 0.75;

        nebula.style.transform = `translate(${translateX}px, ${translateY}px)`;
        nebula.dataset.translateX = translateX;
        nebula.dataset.translateY = translateY;
    });

    requestAnimationFrame(moveStars);
}

// Start continuous star movement
moveStars();


