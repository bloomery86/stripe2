// Initialize GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Create Lenis instance
let lenis;

// Initialize smooth scrolling
function initSmoothScrolling() {
    const lenis = new Lenis({
        duration: 1.8,   // Increased duration for smoother stop
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Smoother easing
        smooth: true,
        smoothWheel: true,
        smoothTouch: false,
        touchMultiplier: 1.5,
        infinite: false,
        wheelMultiplier: 0.8, // Reduced wheel multiplier for smoother scrolling
        lerp: 0.1, // Added lerp for smoother interpolation
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    lenis.on('scroll', (e) => {
        // Optional: Do something on scroll events.
    });

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
}

// Cart functionality
let cart = [];
const cartModal = document.getElementById('cartModal');
const cartItemsContainer = document.querySelector('.cart-items-container');
const cartCount = document.querySelector('.cart-count');
const totalAmount = document.querySelector('.total-amount');

function openCart() {
    cartModal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeCart() {
    cartModal.classList.remove('show');
    document.body.style.overflow = '';
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

function addToCart(productId, name, price, image) {
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            name: name,
            price: price,
            image: image,
            quantity: 1
        });
    }
    
    showNotification('Produs adăugat în coș!');
    updateCart();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        const newQuantity = item.quantity + change;
        if (newQuantity > 0) {
            item.quantity = newQuantity;
            updateCart();
        } else {
            removeFromCart(productId);
        }
    }
}

function emptyCart() {
    cart = [];
    updateCart();
    showNotification('Coșul a fost golit!');
}

function formatPrice(price) {
    return parseFloat(price.toString().replace(/[^0-9.-]+/g, '')).toFixed(2);
}

function updateCart() {
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll('.cart-count').forEach(count => {
        count.textContent = totalItems;
    });
    
    // Update cart items display
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-basket"></i>
                <p>Coșul tău este gol</p>
            </div>
        `;
        totalAmount.textContent = '0.00 RON';
        return;
    }
    
    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item" data-id="${item.id}">
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-details">
                <h3 class="cart-item-title">${item.name}</h3>
                <div class="cart-item-price">${item.price} RON</div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn minus" onclick="updateQuantity('${item.id}', -1)">-</button>
                    <span class="quantity-value">${item.quantity}</span>
                    <button class="quantity-btn plus" onclick="updateQuantity('${item.id}', 1)">+</button>
                </div>
            </div>
            <button class="remove-item" onclick="removeFromCart('${item.id}')">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
    
    // Update total
    const total = cart.reduce((sum, item) => {
        return sum + (formatPrice(item.price) * item.quantity);
    }, 0);
    
    totalAmount.textContent = `${total.toFixed(2)} RON`;
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Load cart from localStorage
function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCart();
    }
}

// Flower Care Guide Functions
function toggleCareGuide(guideId) {
    const guide = document.getElementById(guideId);
     if (!guide) return;
     
     const content = guide.querySelector('.care-guide-content');
     const icon = guide.querySelector('.toggle-icon');
     
     if (!content || !icon) return;
     
     const isActive = content.classList.contains('active');

     // Close all other guides
     document.querySelectorAll('.care-guide-content').forEach(item => {
          if (item !== content) {
              item.classList.remove('active');
              const otherIcon = item.closest('.care-guide-item').querySelector('.toggle-icon');
              if (otherIcon) {
                otherIcon.classList.remove('fa-minus');
                otherIcon.classList.add('fa-plus');
              }
            }
       });
     
     // Toggle current guide
     content.classList.toggle('active', !isActive);
     
     // Add staggered animation to list items
     const listItems = content.querySelectorAll('li');
     listItems.forEach((item, index) => {
         item.style.setProperty('--item-index', index);
     });
     
   
     if (content.classList.contains('active')) {
         icon.classList.remove('fa-plus');
         icon.classList.add('fa-minus');
     } else {
         icon.classList.remove('fa-minus');
         icon.classList.add('fa-plus');
     }
}



function downloadCareGuide(guideType) {
    const guides = {
        'classic': 'Ghid Trandafiri Clasici.pdf',
        'garden': 'Ghid Trandafiri de Grădină.pdf',
        'spray': 'Ghid Trandafiri Spray.pdf'
    };
    
    const filename = guides[guideType];
    showNotification(`Ghidul de îngrijire ${filename} se descarcă...`);
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initSmoothScrolling();

    // Hero Section Animations
    const heroTl = gsap.timeline();
    
    heroTl.fromTo('.hero-content', 
        {
            opacity: 0,
            y: 50
        },
        {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: 'power3.out',
            delay: 0.5
        }
    );

    // Parallax effect for hero background
    const heroBackground = document.querySelector('.hero-background');
    if (heroBackground) {
        gsap.to('.hero-background', {
            yPercent: 20,
            ease: 'none',
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: 1.5,
                invalidateOnRefresh: true
            }
        });
    }

    // Staggered text animations
    const heroElements = gsap.utils.toArray('.hero-content > *');
    heroElements.forEach((element, index) => {
        const speed = element.dataset.speed || 1;
        
        gsap.to(element, {
            y: `-${30 * speed}`,
            ease: 'none',
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: 1.5,
                invalidateOnRefresh: true
            }
        });
    });

    // Mobile Menu Toggle
    const burgerMenu = document.querySelector('.burger-menu');
    const mainNav = document.querySelector('.main-nav');

    if (burgerMenu && mainNav) {
        burgerMenu.addEventListener('click', () => {
            console.log('Burger menu clicked'); // Debug log
            burgerMenu.classList.toggle('active');
            mainNav.classList.toggle('active');
            document.body.style.overflow = mainNav.classList.contains('active') ? 'hidden' : '';
        });

        // Close menu when clicking a link
        const navLinks = document.querySelectorAll('.main-nav a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                burgerMenu.classList.remove('active');
                mainNav.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    } else {
        console.error('Burger menu or main nav elements not found'); // Debug log
    }

    // Add to cart buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const productId = button.dataset.id;
            const productName = button.dataset.name;
            const productPrice = button.dataset.price;
            const productImage = button.dataset.image;
            
            addToCart(productId, productName, productPrice, productImage);
        });
    });

    // Cart open/close
    document.querySelectorAll('.cart-icon').forEach(icon => {
        icon.addEventListener('click', (e) => {
            e.preventDefault();
            openCart();
        });
    });

    document.querySelector('.close-cart').addEventListener('click', closeCart);

    cartModal.addEventListener('click', (e) => {
        if (e.target === cartModal) {
            closeCart();
        }
    });

    // Add empty cart button
    const cartHeader = document.querySelector('.cart-modal-header');
    const emptyCartButton = document.createElement('button');
    emptyCartButton.className = 'empty-cart-btn';
    emptyCartButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
    emptyCartButton.title = 'Golește coșul';
    emptyCartButton.onclick = emptyCart;
    cartHeader.appendChild(emptyCartButton);

    // Load saved cart
    loadCart();

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                lenis.scrollTo(target, {
                    offset: -70,
                    duration: 1.2,
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                });
            }
        });
    });

    // Initialize FAQ functionality
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.closest('.faq-item');
            
            // Close other FAQ items
            document.querySelectorAll('.faq-item').forEach(item => {
                if (item !== faqItem && item.classList.contains('active')) {
                    item.classList.remove('active');
                }
            });
            
            // Toggle current FAQ item
            faqItem.classList.toggle('active');
        });
    });

    // Modern Parallax Effect for Services Section
    const servicesSection = document.querySelector('.services-section');
    const parallaxBg = document.querySelector('.services-parallax-bg');

    if (servicesSection && parallaxBg) {
        // Create a more sophisticated parallax effect
        gsap.to('.services-parallax-bg', {
            yPercent: 30,
            scale: 1.1,
            rotate: 1,
            ease: "none",
            scrollTrigger: {
                trigger: ".services-section",
                start: "top bottom",
                end: "bottom top",
                scrub: 1,
                toggleActions: "play none none reverse"
            }
        });

        // Add floating animation to service cards
        gsap.utils.toArray('.service-card').forEach((card, i) => {
            gsap.to(card, {
                y: 20,
                duration: 2,
                ease: "sine.inOut",
                repeat: -1,
                yoyo: true,
                delay: i * 0.2
            });
        });

        // Smooth reveal animation when scrolling into view
        const servicesGrid = document.querySelector('.services-grid');
        if (servicesGrid) {
            gsap.from('.service-card', {
                scrollTrigger: {
                    trigger: '.services-grid',
                    start: 'top center+=100',
                    toggleActions: 'play none none reverse'
                },
                y: 100,
                opacity: 0,
                duration: 1,
                stagger: {
                    amount: 0.6,
                    ease: "power2.out"
                }
            });
        }

        // Add a subtle rotation effect to the background
        gsap.to('.services-parallax-bg', {
            rotation: 1,
            duration: 20,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true
        });

        // Mouse parallax effect
        servicesSection.addEventListener('mousemove', (e) => {
            const { clientX, clientY } = e;
            const { left, top, width, height } = servicesSection.getBoundingClientRect();
            
            const xPos = (clientX - left) / width - 0.5;
            const yPos = (clientY - top) / height - 0.5;
            
            gsap.to('.services-parallax-bg', {
                duration: 1,
                x: xPos * 20,
                y: yPos * 20,
                rotationY: xPos * 5,
                rotationX: -yPos * 5,
                ease: "power2.out"
            });
        });

        // Reset position on mouse leave
        servicesSection.addEventListener('mouseleave', () => {
            gsap.to('.services-parallax-bg', {
                duration: 1,
                x: 0,
                y: 0,
                rotationY: 0,
                rotationX: 0,
                ease: "power2.out"
            });
        });
    }

    // Throttle scroll event for better performance
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                ticking = false;
            });
            ticking = true;
        }
    });

      // Gallery Functionality
      const gallery = {
          init() {
              this.container = document.querySelector('.gallery-grid');
              this.filters = document.querySelectorAll('.filter-btn');
              this.colorDots = document.querySelectorAll('.color-dot');
              this.modal = document.querySelector('.flower-modal');
              this.closeModal = document.querySelector('.close-modal');
              this.items = document.querySelectorAll('.gallery-item');
              
              this.bindEvents();
              this.initializeGallery();
          },
  
          bindEvents() {
              // Filter buttons
              this.filters.forEach(btn => {
                  btn.addEventListener('click', (e) => {
                      this.handleFilter(e.target);
                  });
              });
  
              // Color dots
              this.colorDots.forEach(dot => {
                  dot.addEventListener('click', (e) => {
                      this.handleColorFilter(e.target);
                  });
              });
  
              // Modal
              document.querySelectorAll('.view-details').forEach(btn => {
                  btn.addEventListener('click', (e) => {
                      this.openModal(e.target.dataset.item);
                  });
              });
  
              this.closeModal?.addEventListener('click', () => this.hideModal());
  
              // Close modal on outside click
              this.modal?.addEventListener('click', (e) => {
                  if (e.target === this.modal) {
                      this.hideModal();
                  }
              });
          },
  
          initializeGallery() {
              // Initialize masonry layout without animations
              this.container = document.querySelector('.gallery-grid');
              if (!this.container) return;
          },
  
          handleFilter(filterBtn) {
              const filterType = filterBtn.dataset.filter || filterBtn.dataset.occasion;
              
              // Update active state
              this.filters.forEach(btn => btn.classList.remove('active'));
              filterBtn.classList.add('active');
  
              // Filter items without animation
              this.items.forEach(item => {
                  const matches = filterType === 'all' || item.dataset.category === filterType;
                  item.style.display = matches ? 'block' : 'none';
              });
          },
  
          handleColorFilter(colorDot) {
              const color = colorDot.dataset.color;
              
              // Toggle active state
              colorDot.classList.toggle('active');
              
              // Get all active colors
              const activeColors = Array.from(document.querySelectorAll('.color-dot.active'))
                                      .map(dot => dot.dataset.color);
  
              // Filter items
              this.items.forEach(item => {
                  const itemColors = item.dataset.colors.split(',');
                  const matches = activeColors.length === 0 || 
                                activeColors.some(color => itemColors.includes(color));
                  
                  item.style.display = matches ? 'block' : 'none';
              });
          },
  
           openModal(itemId) {
                const flowerData = this.getFlowerData(itemId);
                if (!flowerData) return;

                // Populate modal content
                const modal = document.querySelector('.flower-modal');
                modal.querySelector('.modal-image img').src = flowerData.image;
                modal.querySelector('.modal-info h3').textContent = flowerData.title;
                modal.querySelector('.flower-description').textContent = flowerData.description;
                
                // Populate care instructions
                const careList = modal.querySelector('.flower-care ul');
                careList.innerHTML = flowerData.care.map(care => `<li>${care}</li>`).join('');
                
                // Populate story
                modal.querySelector('.flower-story p').textContent = flowerData.story;

                // Show modal with animation
                 modal.classList.add('active');
                document.body.style.overflow = 'hidden';

                // Animate modal content
                gsap.fromTo('.modal-content',
                    { y: 20, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out' }
                );
            },
  
            hideModal() {
                const modal = document.querySelector('.flower-modal');
                gsap.to('.modal-content', {
                    y: 20,
                    opacity: 0,
                    duration: 0.2,
                    ease: 'power2.in',
                    onComplete: () => {
                        modal.classList.remove('active');
                        document.body.style.overflow = '';
                    }
                });
            },
  
          getFlowerData(itemId) {
              // Sample flower data - replace with your actual data
              const flowerDatabase = {
                  '1': {
                      title: 'Buchet Regal de Trandafiri',
                      image: 'images/gallery/red-roses.jpg',
                      description: 'Un aranjament spectaculos realizat din trandafiri Ecuador Premium, cunoscuți pentru dimensiunea lor impresionantă și durata lungă de viață.',
                      care: [
                          'Schimbați apa la fiecare 2-3 zile',
                          'Păstrați buchetul departe de lumina directă a soarelui',
                          'Tăiați tijele la un unghi de 45° la fiecare schimbare a apei',
                          'Mențineți la temperatura camerei, departe de curenți de aer'
                      ],
                      story: 'Trandafirii Ecuador sunt cultivați la peste 2.800m altitudine în Anzii Ecuadorieni. Clima unică și solul vulcanic bogat contribuie la creșterea unor trandafiri cu tije lungi și boboci mari, care au devenit un simbol al luxului și eleganței în floristica modernă.'
                  },
                  // Add more flower data as needed
              };
  
              return flowerDatabase[itemId];
          }
      };

    // Initialize gallery
    gallery.init();
});