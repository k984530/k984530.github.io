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

// Track most visible project tile
const visibleProjects = new Map();
let projectSequence = 0;

// Show More Projects Button
const showMoreBtn = document.getElementById('show-more-btn');
const moreProjectsContainer = document.getElementById('more-projects-container');
let isExpanded = false;

showMoreBtn?.addEventListener('click', () => {
    if (!isExpanded) {
        // Show more projects
        moreProjectsContainer.style.display = 'contents';
        showMoreBtn.innerHTML = 'Show Less <i class="fas fa-chevron-up"></i>';
        isExpanded = true;
        
        // Animate new items
        const newItems = moreProjectsContainer.querySelectorAll('.project-item');
        newItems.forEach((item, index) => {
            enhanceProjectItem(item);
            item.style.opacity = '0';
            item.style.animation = 'none';
            setTimeout(() => {
                item.style.animation = 'fadeIn 0.5s ease forwards';
            }, index * 50);
        });
    } else {
        // Hide projects
        moreProjectsContainer.style.display = 'none';
        showMoreBtn.innerHTML = 'Show More Apps <i class="fas fa-chevron-down"></i>';
        isExpanded = false;
        
        // Scroll back to projects section
        document.getElementById('projects').scrollIntoView({ behavior: 'smooth' });

        moreProjectsContainer.querySelectorAll('.project-item').forEach(item => {
            const id = item.dataset.projectId;
            if (id) {
                visibleProjects.delete(id);
            }
        });

        const fallback = document.querySelector('.projects-container .project-item');
        if (fallback) {
            setActiveProject(fallback);
        }
    }
});

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
    threshold: [0.15, 0.4, 0.65],
    rootMargin: '-25% 0px -35% 0px'
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
