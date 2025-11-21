// Main JavaScript for Solis Green India Website

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeMobileMenu();
    initializeFloatingCTA();
    initializeBackToTop();
    initializeModals();
    initializeFormHandling();
    initializeScrollAnimations();
    initializeHeroImages();
    initializeHeroSlider();
});

// Mobile Menu Toggle
function initializeMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mainNav = document.getElementById('mainNav');
    const navLinks = mainNav.querySelectorAll('a');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            mainNav.classList.toggle('active');
            this.setAttribute('aria-expanded', mainNav.classList.contains('active'));
        });
    }

    // Close mobile menu when clicking on links
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mainNav.classList.remove('active');
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!mainNav.contains(event.target) && !mobileMenuBtn.contains(event.target)) {
            mainNav.classList.remove('active');
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
        }
    });
}

// Floating CTA Functionality
function initializeFloatingCTA() {
    const ctaMainBtn = document.getElementById('ctaMainBtn');
    const quickFormBtn = document.getElementById('quickFormBtn');
    const ctaOptions = document.querySelector('.cta-options');

    if (ctaMainBtn) {
        ctaMainBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            ctaOptions.classList.toggle('active');
        });
    }

    if (quickFormBtn) {
        quickFormBtn.addEventListener('click', function(e) {
            e.preventDefault();
            openModal('quickQuoteModal');
            ctaOptions.classList.remove('active');
        });
    }

    // Close CTA options when clicking outside
    document.addEventListener('click', function() {
        ctaOptions.classList.remove('active');
    });

    // Prevent closing when clicking inside CTA
    ctaOptions.addEventListener('click', function(e) {
        e.stopPropagation();
    });
}

// Back to Top Button
function initializeBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');

    if (backToTopBtn) {
        // Show/hide button based on scroll position
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopBtn.classList.add('show');
                backToTopBtn.setAttribute('aria-hidden', 'false');
            } else {
                backToTopBtn.classList.remove('show');
                backToTopBtn.setAttribute('aria-hidden', 'true');
            }
        });

        // Smooth scroll to top
        backToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// Modal Functionality
function initializeModals() {
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.close-modal');

    // Close modal when clicking close button
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            closeAllModals();
        });
    });

    // Close modal when clicking outside
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeAllModals();
            }
        });
    });

    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        modal.setAttribute('aria-hidden', 'false');
    }
}

function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
    });
    document.body.style.overflow = 'auto';
}

// Form Handling with FormSubmit + WhatsApp Backup
function initializeFormHandling() {
    const forms = document.querySelectorAll('form.quick-quote-form');

    forms.forEach(form => {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const data = {
                name: formData.get('name'),
                phone: formData.get('phone'),
                service: formData.get('service'),
                location: formData.get('location'),
                timestamp: new Date().toLocaleString('en-IN')
            };

            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;

            // Validate form
            if (!validateForm(this)) {
                showNotification('Please fill all required fields correctly.', 'error');
                return;
            }

            try {
                // Show loading state
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
                submitBtn.disabled = true;
                submitBtn.classList.add('loading');

                // Try FormSubmit first
                const formSubmitSuccess = await submitToFormSubmit(data, form);
                
                if (formSubmitSuccess) {
                    // Success state
                    submitBtn.innerHTML = '<i class="fas fa-check"></i> Sent Successfully!';
                    showNotification('Thank you! We will call you within 30 minutes.', 'success');
                    
                    // Track conversion
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'conversion', {
                            'send_to': 'G-R4VD9LGY29/quote_request',
                            'value': 1.0,
                            'currency': 'INR'
                        });
                    }
                    
                    // Reset form after delay
                    setTimeout(() => {
                        form.reset();
                        submitBtn.innerHTML = originalText;
                        submitBtn.disabled = false;
                        submitBtn.classList.remove('loading');
                        closeAllModals();
                    }, 3000);

                } else {
                    // Fallback to WhatsApp
                    fallbackToWhatsApp(data);
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('loading');
                }

            } catch (error) {
                console.error('Form submission failed:', error);
                
                // Fallback to WhatsApp on error
                fallbackToWhatsApp(data);
                
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                submitBtn.classList.remove('loading');
            }
        });

        // Real-time validation
        const inputs = form.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });

            input.addEventListener('input', function() {
                clearFieldError(this);
            });
        });
    });
}

// FormSubmit Integration
async function submitToFormSubmit(data, form) {
    try {
        // Create FormData for FormSubmit
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('phone', data.phone);
        formData.append('service', data.service);
        formData.append('location', data.location || 'Not specified');
        formData.append('timestamp', data.timestamp);
        formData.append('_subject', `🔆 New Solar Quote - ${data.name}`);
        formData.append('_template', 'table');
        formData.append('_captcha', 'false');
        formData.append('_replyto', data.email || '');
        
        // Add hidden success URL
        formData.append('_next', window.location.origin + '/thank-you.html');

        const response = await fetch('https://formsubmit.co/ajax/solisgreenindia@gmail.com', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const result = await response.json();
            console.log('FormSubmit success:', result);
            return true;
        } else {
            console.warn('FormSubmit failed, falling back to WhatsApp');
            return false;
        }
    } catch (error) {
        console.warn('FormSubmit error, falling back to WhatsApp:', error);
        return false;
    }
}

// WhatsApp Fallback
function fallbackToWhatsApp(data) {
    const message = `🔆 SOLIS GREEN INDIA - Quote Request 🔆

Name: ${data.name}
Phone: ${data.phone}
Service Needed: ${data.service}
Location: ${data.location}
Timestamp: ${data.timestamp}

URGENT: Please contact for solar installation quote.`;

    const whatsappUrl = `https://wa.me/918301849474?text=${encodeURIComponent(message)}`;
    
    // Open WhatsApp in new tab
    window.open(whatsappUrl, '_blank');
    
    showNotification('Opening WhatsApp to send your details. We will contact you soon!', 'success');
    
    // Track WhatsApp fallback
    if (typeof gtag !== 'undefined') {
        gtag('event', 'whatsapp_fallback', {
            'event_category': 'Form',
            'event_label': 'FormSubmit to WhatsApp Fallback'
        });
    }
}

// Form Validation
function validateForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');

    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });

    return isValid;
}

function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';

    // Clear previous error
    clearFieldError(field);

    // Required field validation
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'This field is required';
    }

    // Email validation
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        }
    }

    // Phone validation
    if (field.type === 'tel' && value) {
        const phoneRegex = /^[0-9]{10}$/;
        const cleanPhone = value.replace(/\D/g, '');
        if (!phoneRegex.test(cleanPhone)) {
            isValid = false;
            errorMessage = 'Please enter a valid 10-digit phone number';
        }
    }

    if (!isValid) {
        showFieldError(field, errorMessage);
    } else {
        markFieldSuccess(field);
    }

    return isValid;
}

function showFieldError(field, message) {
    field.classList.add('error');
    field.classList.remove('success');
    
    let errorElement = field.parentNode.querySelector('.field-error');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        field.parentNode.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
    errorElement.style.color = '#dc3545';
    errorElement.style.fontSize = '0.8rem';
    errorElement.style.marginTop = '5px';
}

function markFieldSuccess(field) {
    field.classList.remove('error');
    field.classList.add('success');
}

function clearFieldError(field) {
    field.classList.remove('error', 'success');
    
    const errorElement = field.parentNode.querySelector('.field-error');
    if (errorElement) {
        errorElement.remove();
    }
}

// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        max-width: 400px;
        animation: slideInRight 0.3s ease;
    `;

    notification.querySelector('.notification-content').style.cssText = `
        display: flex;
        align-items: center;
        gap: 10px;
    `;

    notification.querySelector('.notification-close').style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        margin-left: auto;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    `;

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    const autoRemove = setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);

    // Close on click
    notification.querySelector('.notification-close').addEventListener('click', () => {
        clearTimeout(autoRemove);
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    });
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-triangle',
        info: 'info-circle',
        warning: 'exclamation-circle'
    };
    return icons[type] || 'info-circle';
}

function getNotificationColor(type) {
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        info: '#17a2b8',
        warning: '#ffc107'
    };
    return colors[type] || '#17a2b8';
}

// Scroll Animations
function initializeScrollAnimations() {
    const animatedElements = document.querySelectorAll('.service-card, .district-card, .feature-item, .testimonial-card');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        observer.observe(element);
    });
}

// Hero Image Loading with Fallbacks
function initializeHeroImages() {
    const heroImages = document.querySelectorAll('.hero-bg-image');
    
    heroImages.forEach((img, index) => {
        img.addEventListener('error', function() {
            console.warn(`Hero image ${index + 1} failed to load, using fallback`);
            // Fallback to solid color background
            this.style.display = 'none';
            const slide = this.closest('.hero-slide');
            if (slide) {
                slide.style.background = index === 0 ? '#1a5276' : 
                                      index === 1 ? '#27ae60' : '#8e44ad';
            }
        });

        img.addEventListener('load', function() {
            console.log(`Hero image ${index + 1} loaded successfully`);
        });
    });
}

// Hero Slider Functionality
function initializeHeroSlider() {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.slider-prev');
    const nextBtn = document.querySelector('.slider-next');
    
    if (slides.length === 0) return;
    
    let currentSlide = 0;
    let slideInterval;

    function showSlide(index) {
        // Hide all slides
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        // Show current slide
        slides[index].classList.add('active');
        dots[index].classList.add('active');
        
        currentSlide = index;
    }

    function nextSlide() {
        let next = currentSlide + 1;
        if (next >= slides.length) next = 0;
        showSlide(next);
    }

    function prevSlide() {
        let prev = currentSlide - 1;
        if (prev < 0) prev = slides.length - 1;
        showSlide(prev);
    }

    // Event listeners
    if (nextBtn) {
        nextBtn.addEventListener('click', nextSlide);
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', prevSlide);
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => showSlide(index));
    });

    // Auto slide
    function startAutoSlide() {
        slideInterval = setInterval(nextSlide, 5000);
    }

    function stopAutoSlide() {
        clearInterval(slideInterval);
    }

    // Start auto slide
    startAutoSlide();

    // Pause on hover
    const slider = document.querySelector('.hero-slider');
    if (slider) {
        slider.addEventListener('mouseenter', stopAutoSlide);
        slider.addEventListener('mouseleave', startAutoSlide);
    }

    // Initialize first slide
    showSlide(0);
}

// Enhanced Tracking
function trackEvent(category, action, label, value = null) {
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            event_category: category,
            event_label: label,
            value: value
        });
    }
    
    // Console log for debugging
    console.log(`Event Tracked: ${category} - ${action} - ${label}`, value);
}

// Initialize enhanced tracking
document.addEventListener('DOMContentLoaded', function() {
    // Track form interactions
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', () => {
            trackEvent('Form', 'submit', form.id || 'unknown-form');
        });
    });
    
    // Track phone clicks
    document.querySelectorAll('a[href^="tel:"]').forEach(link => {
        link.addEventListener('click', () => {
            trackEvent('Contact', 'phone_click', link.textContent.trim());
        });
    });
    
    // Track WhatsApp clicks
    document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
        link.addEventListener('click', () => {
            trackEvent('Contact', 'whatsapp_click', link.textContent.trim());
        });
    });
    
    // Track CTA clicks
    document.querySelectorAll('#quickFormBtn, .cta-button').forEach(button => {
        button.addEventListener('click', () => {
            trackEvent('CTA', 'button_click', button.textContent.trim());
        });
    });
});

// Performance optimization - Debounce scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Update back to top with debouncing
window.addEventListener('scroll', debounce(function() {
    const backToTopBtn = document.getElementById('backToTop');
    if (backToTopBtn) {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    }
}, 10));

// Service Worker Registration (Optional - for future PWA)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful');
            })
            .catch(function(error) {
                console.log('ServiceWorker registration failed: ', error);
            });
    });
}

console.log('Solis Green India website initialized successfully');
