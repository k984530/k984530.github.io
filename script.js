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

// Fixed star positions for consistency
const starPositions = {
    small: [
        {x: 5, y: 10}, {x: 15, y: 25}, {x: 8, y: 45}, {x: 22, y: 15}, {x: 35, y: 8},
        {x: 42, y: 28}, {x: 38, y: 52}, {x: 55, y: 12}, {x: 62, y: 35}, {x: 58, y: 58},
        {x: 75, y: 18}, {x: 82, y: 42}, {x: 78, y: 65}, {x: 92, y: 22}, {x: 88, y: 48},
        {x: 12, y: 72}, {x: 25, y: 85}, {x: 45, y: 75}, {x: 65, y: 82}, {x: 85, y: 78},
        {x: 18, y: 38}, {x: 32, y: 62}, {x: 52, y: 42}, {x: 68, y: 55}, {x: 72, y: 28},
        {x: 28, y: 92}, {x: 48, y: 88}, {x: 95, y: 35}, {x: 10, y: 55}, {x: 90, y: 62},
        {x: 20, y: 5}, {x: 40, y: 95}, {x: 60, y: 5}, {x: 80, y: 95}, {x: 3, y: 30},
        {x: 97, y: 70}, {x: 50, y: 20}, {x: 30, y: 48}, {x: 70, y: 68}, {x: 85, y: 12},
        {x: 15, y: 88}, {x: 92, y: 58}, {x: 8, y: 78}, {x: 78, y: 8}, {x: 25, y: 55},
        {x: 55, y: 85}, {x: 65, y: 15}, {x: 35, y: 72}, {x: 88, y: 88}, {x: 12, y: 12}
    ],
    medium: [
        {x: 10, y: 20}, {x: 30, y: 10}, {x: 50, y: 30}, {x: 70, y: 15}, {x: 90, y: 25},
        {x: 15, y: 50}, {x: 35, y: 40}, {x: 55, y: 60}, {x: 75, y: 45}, {x: 95, y: 55},
        {x: 20, y: 75}, {x: 40, y: 70}, {x: 60, y: 85}, {x: 80, y: 75}, {x: 5, y: 65},
        {x: 25, y: 35}, {x: 45, y: 50}, {x: 65, y: 25}, {x: 85, y: 40}, {x: 12, y: 82},
        {x: 32, y: 22}, {x: 52, y: 78}, {x: 72, y: 32}, {x: 92, y: 72}, {x: 8, y: 42},
        {x: 28, y: 68}, {x: 48, y: 12}, {x: 68, y: 88}, {x: 88, y: 18}, {x: 18, y: 58}
    ],
    large: [
        {x: 20, y: 30}, {x: 40, y: 20}, {x: 60, y: 40}, {x: 80, y: 25}, {x: 15, y: 60},
        {x: 35, y: 80}, {x: 55, y: 70}, {x: 75, y: 50}, {x: 90, y: 80}, {x: 10, y: 90}
    ]
};

// Create random twinkling stars with fixed positions
function createStars() {
    const starsContainer1 = document.querySelector('.stars');
    const starsContainer2 = document.querySelector('.stars2');
    const starsContainer3 = document.querySelector('.stars3');

    // Clear existing content
    if (starsContainer1) starsContainer1.innerHTML = '';
    if (starsContainer2) starsContainer2.innerHTML = '';
    if (starsContainer3) starsContainer3.innerHTML = '';

    // Create small stars (50 stars)
    starPositions.small.forEach((pos, i) => {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = pos.x + '%';
        star.style.top = pos.y + '%';
        star.style.animationDelay = (i * 0.1) + 's';
        star.style.animationDuration = (3 + (i % 3)) + 's';
        star.style.width = '2px';
        star.style.height = '2px';
        starsContainer1?.appendChild(star);
    });

    // Create medium stars (30 stars)
    starPositions.medium.forEach((pos, i) => {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = pos.x + '%';
        star.style.top = pos.y + '%';
        star.style.animationDelay = (i * 0.2) + 's';
        star.style.animationDuration = (4 + (i % 4)) + 's';
        star.style.width = '3px';
        star.style.height = '3px';
        starsContainer2?.appendChild(star);
    });

    // Create large stars (10 stars)
    starPositions.large.forEach((pos, i) => {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = pos.x + '%';
        star.style.top = pos.y + '%';
        star.style.animationDelay = (i * 0.7) + 's';
        star.style.animationDuration = (5 + (i % 5)) + 's';
        star.style.width = '4px';
        star.style.height = '4px';
        starsContainer3?.appendChild(star);
    });
}

// Initialize stars on page load
createStars();


