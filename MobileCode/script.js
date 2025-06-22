// Smooth scrolling for navigation links
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

// Navbar background on scroll
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = '0 1px 3px rgba(0,0,0,0.12)';
    }
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Apply animation to feature cards
document.querySelectorAll('.feature-card').forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = `all 0.6s ease ${index * 0.1}s`;
    observer.observe(card);
});

// Apply animation to pricing cards
document.querySelectorAll('.pricing-card').forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = `all 0.6s ease ${index * 0.1}s`;
    observer.observe(card);
});

// Terminal typing animation
const terminalLines = [
    { text: '$ ssh user@server', delay: 1000 },
    { text: '$ cd /var/www', delay: 500 },
    { text: '$ git pull origin main', delay: 500 },
    { text: 'Already up to date.', delay: 500, isOutput: true }
];

function typeTerminalLine(element, text, callback) {
    let index = 0;
    const interval = setInterval(() => {
        if (index < text.length) {
            element.textContent += text[index];
            index++;
        } else {
            clearInterval(interval);
            if (callback) callback();
        }
    }, 50);
}

// Start terminal animation when visible
const terminalContent = document.querySelector('.terminal-content');
const terminalObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.animated) {
            entry.target.dataset.animated = 'true';
            entry.target.innerHTML = '';
            
            let currentLine = 0;
            function animateNextLine() {
                if (currentLine < terminalLines.length) {
                    const line = terminalLines[currentLine];
                    const p = document.createElement('p');
                    if (line.isOutput) {
                        p.className = 'output';
                    } else {
                        const prompt = document.createElement('span');
                        prompt.className = 'prompt';
                        prompt.textContent = '$';
                        p.appendChild(prompt);
                        p.appendChild(document.createTextNode(' '));
                    }
                    entry.target.appendChild(p);
                    
                    setTimeout(() => {
                        typeTerminalLine(p, line.text.replace('$ ', ''), () => {
                            currentLine++;
                            setTimeout(animateNextLine, line.delay);
                        });
                    }, 200);
                }
            }
            animateNextLine();
        }
    });
}, { threshold: 0.5 });

if (terminalContent) {
    terminalObserver.observe(terminalContent);
}

// Mobile menu toggle
const mobileMenuButton = document.createElement('button');
mobileMenuButton.innerHTML = '☰';
mobileMenuButton.className = 'mobile-menu-button';
mobileMenuButton.style.cssText = `
    display: none;
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--text-dark);
`;

const navLinks = document.querySelector('.nav-links');
const navWrapper = document.querySelector('.nav-wrapper');
navWrapper.appendChild(mobileMenuButton);

mobileMenuButton.addEventListener('click', () => {
    navLinks.classList.toggle('mobile-active');
});

// Add mobile menu styles
const style = document.createElement('style');
style.textContent = `
    @media (max-width: 768px) {
        .mobile-menu-button {
            display: block !important;
        }
        
        .nav-links {
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            flex-direction: column;
            padding: 1rem;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .nav-links.mobile-active {
            display: flex;
        }
    }
`;
document.head.appendChild(style);

// Pricing card hover effects
document.querySelectorAll('.pricing-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', () => {
        if (card.classList.contains('popular')) {
            card.style.transform = 'scale(1.05)';
        } else {
            card.style.transform = 'translateY(0) scale(1)';
        }
    });
});

// Button click animations
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            background: rgba(255,255,255,0.5);
            top: ${y}px;
            left: ${x}px;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
        `;
        
        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    });
});

// Add ripple animation
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);

// Number counter animation
function animateValue(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            current = end;
            clearInterval(timer);
        }
        
        if (element.dataset.format === 'decimal') {
            element.textContent = current.toFixed(1);
        } else if (element.dataset.format === 'percent') {
            element.textContent = current.toFixed(1) + '%';
        } else {
            element.textContent = Math.floor(current).toLocaleString() + '+';
        }
    }, 16);
}

// Animate stats when visible
const stats = document.querySelectorAll('.stat-number');
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.animated) {
            entry.target.dataset.animated = 'true';
            const text = entry.target.textContent;
            
            if (text.includes('K')) {
                animateValue(entry.target, 0, 10, 1000);
            } else if (text.includes('.')) {
                entry.target.dataset.format = 'decimal';
                animateValue(entry.target, 0, 4.8, 1000);
            } else if (text.includes('%')) {
                entry.target.dataset.format = 'percent';
                animateValue(entry.target, 0, 99.9, 1000);
            }
        }
    });
}, { threshold: 0.5 });

stats.forEach(stat => {
    statsObserver.observe(stat);
});