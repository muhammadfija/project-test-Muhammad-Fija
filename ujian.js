// ujian.js

// 1. Header - Fixed position with scroll behavior
const header = document.querySelector('header');
let lastScrollTop = 0;

window.addEventListener('scroll', function() {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > lastScrollTop) {
        // Scrolling down - hide header
        header.style.top = '-100px';
    } else {
        // Scrolling up - show header with slight transparency
        header.style.top = '0';
        header.style.backgroundColor = 'rgba(255, 130, 37, 0.8)';
    }
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // For Mobile or negative scrolling
});

// Active state for navigation menu
const navLinks = document.querySelectorAll('nav ul li a');
navLinks.forEach(link => {
    if (link.href === window.location.href) {
        link.classList.add('active');
    }
});

// 2. Banner - Parallax Effect
window.addEventListener('scroll', function() {
    const scrollPosition = window.pageYOffset;
    const heroText = document.querySelector('.hero h1');
    const heroSubtext = document.querySelector('.hero p');
    const backgroundImage = document.querySelector('.background-image');

    heroText.style.transform = `translateY(${scrollPosition * 0.5}px)`;
    heroSubtext.style.transform = `translateY(${scrollPosition * 0.7}px)`;
    backgroundImage.style.transform = `translateY(${scrollPosition * 0.2}px)`;
});

// 3. List Post - Sorting, Pagination, and Lazy Loading
let currentPage = 1;
let pageSize = 10;
let sortOrder = '-published_at';

// Event listener for page size change
document.querySelector('.pagination-controls select:nth-of-type(1)').addEventListener('change', function(event) {
    pageSize = parseInt(event.target.value);
    fetchPosts();
});

// Event listener for sort order change
document.querySelector('.pagination-controls select:nth-of-type(2)').addEventListener('change', function(event) {
    sortOrder = event.target.value;
    fetchPosts();
});

// Fetch posts from API
function fetchPosts() {
    fetch(`https://suitmedia-backend.suitdev.com/api/ideas?page[number]=${currentPage}&page[size]=${pageSize}&append[]=small_image&append[]=medium_image&sort=${sortOrder}`)
        .then(response => response.json())
        .then(data => {
            renderPosts(data);
        });
}

// Render posts to the DOM
function renderPosts(data) {
    const postsGrid = document.querySelector('.posts-grid');
    postsGrid.innerHTML = '';

    data.data.forEach(post => {
        const postElement = document.createElement('div');
        postElement.classList.add('post');

        postElement.innerHTML = `
            <img src="${post.small_image}" data-src="${post.medium_image}" alt="${post.title}">
            <div class="post-content">
                <p class="date">${new Date(post.published_at).toLocaleDateString()}</p>
                <h3>${post.title}</h3>
                <a href="#">Read More</a>
            </div>
        `;

        postsGrid.appendChild(postElement);
    });

    lazyLoadImages();
}

// Lazy loading images
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    const config = {
        rootMargin: '0px 0px 200px 0px',
        threshold: 0.01
    };

    let observer = new IntersectionObserver(function(entries, self) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                preloadImage(entry.target);
                self.unobserve(entry.target);
            }
        });
    }, config);

    images.forEach(image => {
        observer.observe(image);
    });
}

// Preload image for lazy loading
function preloadImage(img) {
    const src = img.getAttribute('data-src');
    if (!src) return;
    img.src = src;
    img.removeAttribute('data-src');
}

// Event listeners for pagination buttons
document.querySelectorAll('.pagination-button').forEach(button => {
    button.addEventListener('click', function(event) {
        event.preventDefault();
        if (event.target.innerText === '<<') {
            currentPage = 1;
        } else if (event.target.innerText === '>>') {
            currentPage = Math.ceil(100 / pageSize);
        } else {
            currentPage = parseInt(event.target.innerText);
        }
        fetchPosts();
    });
});

// Initial Fetch of Posts
fetchPosts();
