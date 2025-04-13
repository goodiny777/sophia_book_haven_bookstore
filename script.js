// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Shopping Cart Functionality
    let cart = [];
    
    // Load cart from localStorage if available
    if (localStorage.getItem('bookHavenCart')) {
        cart = JSON.parse(localStorage.getItem('bookHavenCart'));
    }
    
    // Cart buttons
    const viewCartBtns = document.querySelectorAll('#view-cart-btn, #view-cart-btn-top');
    const cartModal = document.getElementById('cart-modal');
    const closeModal = document.querySelector('.close-modal');
    const clearCartBtn = document.getElementById('clear-cart-btn');
    const processOrderBtn = document.getElementById('process-order-btn');
    const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');
    
    // Add event listeners to "View Cart" buttons
    viewCartBtns.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', openCartModal);
        }
    });
    
    // Close modal when clicking on X
    if (closeModal) {
        closeModal.addEventListener('click', closeCartModal);
    }
    
    // Close modal when clicking outside of it
    window.addEventListener('click', function(event) {
        if (cartModal && event.target === cartModal) {
            closeCartModal();
        }
    });
    
    // Add to Cart button functionality
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const name = this.getAttribute('data-name');
            const price = parseFloat(this.getAttribute('data-price'));
            
            addToCart(id, name, price);
            showNotification('Item added to cart');
        });
    });
    
    // Clear Cart button
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', function() {
            clearCart();
            renderCart();
            showNotification('Cart cleared');
        });
    }
    
    // Process Order button
    if (processOrderBtn) {
        processOrderBtn.addEventListener('click', function() {
            if (cart.length === 0) {
                showNotification('Your cart is empty');
                return;
            }
            processOrder();
        });
    }
    
    // Category filter buttons in Gallery
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Filter items
            filterItems(filter);
        });
    });
    
    // Form functionality
    const feedbackForm = document.getElementById('feedback-form');
    const subjectField = document.getElementById('subject');
    const specialOrderFields = document.getElementById('special-order-fields');
    
    // Show special order fields when "Special Order Request" is selected
    if (subjectField && specialOrderFields) {
        subjectField.addEventListener('change', function() {
            if (this.value === 'special-order') {
                specialOrderFields.classList.remove('hidden');
            } else {
                specialOrderFields.classList.add('hidden');
            }
        });
    }
    
    // Form submission
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const formDataObj = {};
            formData.forEach((value, key) => {
                formDataObj[key] = value;
            });
            
            // Save to localStorage
            localStorage.setItem('feedbackData', JSON.stringify(formDataObj));
            
            // Show success message
            showNotification('Thank you for your feedback!');
            
            // Reset form
            this.reset();
            if (specialOrderFields) {
                specialOrderFields.classList.add('hidden');
            }
        });
    }
    
    // Newsletter subscription form
    const newsletterForms = document.querySelectorAll('#newsletter-form');
    newsletterForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get email
            const email = this.querySelector('input[type="email"]').value;
            
            // Save to localStorage
            const subscribers = JSON.parse(localStorage.getItem('subscribers') || '[]');
            if (!subscribers.includes(email)) {
                subscribers.push(email);
                localStorage.setItem('subscribers', JSON.stringify(subscribers));
                showNotification('Thanks for subscribing!');
            } else {
                showNotification('You are already subscribed.');
            }
            
            // Reset form
            this.reset();
        });
    });
    
    // Testimonial slider functionality
    const sliderControls = document.querySelectorAll('.slider-control');
    sliderControls.forEach(control => {
        control.addEventListener('click', function() {
            const slideIndex = this.getAttribute('data-slide');
            showSlide(parseInt(slideIndex));
        });
    });
    
    // Functions
    
    // Open cart modal
    function openCartModal() {
        if (cartModal) {
            renderCart();
            cartModal.style.display = 'block';
        }
    }
    
    // Close cart modal
    function closeCartModal() {
        if (cartModal) {
            cartModal.style.display = 'none';
        }
    }
    
    // Add item to cart
    function addToCart(id, name, price) {
        // Check if item already exists in cart
        const existingItem = cart.find(item => item.id === id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: id,
                name: name,
                price: price,
                quantity: 1
            });
        }
        
        // Save cart to localStorage
        saveCart();
    }
    
    // Save cart to localStorage
    function saveCart() {
        localStorage.setItem('bookHavenCart', JSON.stringify(cart));
    }
    
    // Clear cart
    function clearCart() {
        cart = [];
        saveCart();
    }
    
    // Process order
    function processOrder() {
        showNotification('Thank you for your order!');
        clearCart();
        renderCart();
        setTimeout(closeCartModal, 1500);
    }
    
    // Render cart items
    function renderCart() {
        const cartItems = document.getElementById('cart-items');
        const totalAmount = document.getElementById('total-amount');
        
        if (!cartItems || !totalAmount) return;
        
        cartItems.innerHTML = '';
        
        if (cart.length === 0) {
            cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
            totalAmount.textContent = '0.00';
            return;
        }
        
        let total = 0;
        
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            const cartItemElement = document.createElement('div');
            cartItemElement.className = 'cart-item';
            cartItemElement.innerHTML = `
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>$${item.price.toFixed(2)} × ${item.quantity}</p>
                </div>
                <div class="cart-item-total">
                    $${itemTotal.toFixed(2)}
                </div>
                <button class="remove-item" data-id="${item.id}">×</button>
            `;
            
            cartItems.appendChild(cartItemElement);
        });
        
        totalAmount.textContent = total.toFixed(2);
        
        // Add event listeners to remove buttons
        const removeButtons = document.querySelectorAll('.remove-item');
        removeButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                removeFromCart(id);
                renderCart();
            });
        });
    }
    
    // Remove item from cart
    function removeFromCart(id) {
        cart = cart.filter(item => item.id !== id);
        saveCart();
    }
    
    // Filter items in gallery
    function filterItems(filter) {
        const items = document.querySelectorAll('.item-row[data-category]');
        
        items.forEach(item => {
            if (filter === 'all' || item.getAttribute('data-category') === filter) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });
    }
    
    // Show notification
    function showNotification(message) {
        // Create notification element if it doesn't exist
        let notification = document.querySelector('.notification');
        
        if (!notification) {
            notification = document.createElement('div');
            notification.className = 'notification';
            document.body.appendChild(notification);
        }
        
        // Set message
        notification.textContent = message;
        notification.classList.add('show');
        
        // Hide notification after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
    
    // Show testimonial slide
    function showSlide(index) {
        const slides = document.querySelectorAll('.testimonial-slide');
        const controls = document.querySelectorAll('.slider-control');
        
        if (slides.length === 0 || controls.length === 0) return;
        
        // Hide all slides
        slides.forEach(slide => {
            slide.style.display = 'none';
        });
        
        // Remove active class from all controls
        controls.forEach(control => {
            control.classList.remove('active');
        });
        
        // Show the selected slide
        slides[index].style.display = 'block';
        
        // Add active class to selected control
        controls[index].classList.add('active');
    }
    
    // Initialize testimonial slider
    const testimonialSlides = document.querySelectorAll('.testimonial-slide');
    if (testimonialSlides.length > 0) {
        showSlide(0);
    }
    
    // Animate "Add to Cart" buttons
    addToCartBtns.forEach(btn => {
        btn.addEventListener('mousedown', function() {
            this.classList.add('btn-pressed');
        });
        
        btn.addEventListener('mouseup', function() {
            this.classList.remove('btn-pressed');
        });
        
        btn.addEventListener('mouseleave', function() {
            this.classList.remove('btn-pressed');
        });
    });
});
