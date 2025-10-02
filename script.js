// Navigation
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.section');

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remove active class from all nav items and sections
        navItems.forEach(nav => nav.classList.remove('active'));
        sections.forEach(section => section.classList.remove('active'));
        
        // Add active class to clicked nav item
        item.classList.add('active');
        
        // Show corresponding section
        const targetId = item.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            targetSection.classList.add('active');
        }
    });
});

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
    const allProjects = document.querySelectorAll('.project-item');
    const lastProject = allProjects[allProjects.length - 1];
    const secondLastProject = allProjects[allProjects.length - 2];

    entries.forEach(entry => {
        const id = entry.target.dataset.projectId;
        if (!id) {
            return;
        }

        // Skip last two projects from normal intersection handling
        if (entry.target === lastProject || entry.target === secondLastProject) {
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

// Initial page load
window.addEventListener('load', () => {
    // Ensure projects section is active by default
    const projectsSection = document.getElementById('projects');
    const projectsNavItem = document.querySelector('a[href="#projects"]');
    
    if (projectsSection && projectsNavItem) {
        projectsSection.classList.add('active');
        projectsNavItem.classList.add('active');
    }
});

window.addEventListener('resize', () => {
    const activeTile = document.querySelector('.project-item.active-feed');
    if (activeTile) {
        setActiveProject(activeTile);
    }
});

// Create random twinkling stars
function createStars() {
    const starsContainer1 = document.querySelector('.stars');
    const starsContainer2 = document.querySelector('.stars2');
    const starsContainer3 = document.querySelector('.stars3');

    // Clear existing content
    if (starsContainer1) starsContainer1.innerHTML = '';
    if (starsContainer2) starsContainer2.innerHTML = '';
    if (starsContainer3) starsContainer3.innerHTML = '';

    // Create small stars (50 stars)
    for (let i = 0; i < 50; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 5 + 's';
        star.style.animationDuration = (3 + Math.random() * 3) + 's';
        star.style.width = '2px';
        star.style.height = '2px';
        starsContainer1?.appendChild(star);
    }

    // Create medium stars (30 stars)
    for (let i = 0; i < 30; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 6 + 's';
        star.style.animationDuration = (4 + Math.random() * 4) + 's';
        star.style.width = '3px';
        star.style.height = '3px';
        starsContainer2?.appendChild(star);
    }

    // Create large stars (10 stars)
    for (let i = 0; i < 10; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 8 + 's';
        star.style.animationDuration = (5 + Math.random() * 5) + 's';
        star.style.width = '4px';
        star.style.height = '4px';
        starsContainer3?.appendChild(star);
    }
}

// Initialize stars on page load
createStars();

// Activate last rows when scrolled near bottom
window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    const allProjects = document.querySelectorAll('.project-item');
    if (allProjects.length > 0) {
        const lastProject = allProjects[allProjects.length - 1];
        const secondLastProject = allProjects[allProjects.length - 2];

        // Activate last row only at the absolute bottom (within 1px)
        if (distanceFromBottom < 1) {
            setActiveProject(lastProject);
        }
        // Activate second-to-last row when near bottom (1-50px range)
        else if (distanceFromBottom >= 1 && distanceFromBottom < 50 && secondLastProject) {
            setActiveProject(secondLastProject);
        }
    }
});
