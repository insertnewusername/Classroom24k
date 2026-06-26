/**
 * script.js - Classroom 24k - Final Master (Security & Loading Fix)
 */

// --- 0. DOMAIN LOCK (Anti-Steal) ---
(function() {
    const authorized = "insertnewusername.github.io/Classroom24k.github.io";
    const currentLoc = window.location.hostname + window.location.pathname;

    // Allows 'localhost' for your development, but breaks on any other domain
    if (!currentLoc.includes(authorized) && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
        document.body.innerHTML = `
            <div style="background:#081221; color:white; height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; font-family:sans-serif; text-align:center; padding: 20px;">
                <h1 style="color:#00aaff; font-size: 3rem;">ACCESS DENIED</h1>
                <p style="font-size: 1.2rem; opacity: 0.8;">This website content is protected and exclusive to Classroom 24k.</p>
            </div>`;
        throw new Error("Script terminated: Unauthorized Domain.");
    }
})();

// --- 1. GOOGLE ANALYTICS ---
(function() {
    var gtagScript = document.createElement('script');
    gtagScript.async = true;
    gtagScript.src = "https://www.googletagmanager.com/gtag/js?id=G-2D22NMRV2Z";
    document.head.appendChild(gtagScript);
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-2D22NMRV2Z');
})();

// --- 2. UNIVERSAL NAVIGATION ---
function generateNav() {
    const nav = document.querySelector('nav');
    if (!nav) return;
    nav.innerHTML = `
        <div class="search-container">
            <input type="text" id="gameSearch" placeholder="Search" 
                   onkeydown="if(event.key==='Enter') filterGames()">
        </div>
        <div class="nav-links">
            <a href="index.html">Home</a>
            <a href="popular.html">Popular</a>
            <a href="driving.html">Driving</a>
            <a href="multiplayer.html">Multiplayer</a>
            <a href="sports.html">Sports</a>
            <a href="stickman.html">Stickman</a>
        </div>
    `;
}

// --- 3. SEARCH LOGIC ---
function filterGames() {
    let inputField = document.getElementById('gameSearch');
    if (!inputField) return;
    
    let input = inputField.value.toLowerCase();
    const isMainLibrary = window.location.pathname.endsWith('index.html') || 
                          window.location.pathname === '/' || 
                          window.location.pathname.endsWith('.html') === false;
    
    if (document.getElementById('game-container') || !isMainLibrary) {
        if (input.length > 0) {
            window.location.href = "index.html?search=" + encodeURIComponent(input);
            return;
        }
    }

    let cards = document.getElementsByClassName('game-card');
    const featured = document.querySelector('.featured-banner');
    const carousels = document.querySelectorAll('.carousel-container');
    const libraryHeaders = document.querySelectorAll('.full-library-section h2');

    if (input.length > 0) {
        if (featured) featured.style.display = "none";
        carousels.forEach(c => c.style.display = "none");
        libraryHeaders.forEach(h => h.style.display = "none");
    } else {
        if (featured) featured.style.display = "";
        carousels.forEach(c => c.style.display = "");
        libraryHeaders.forEach(h => h.style.display = "");
    }

    for (let card of cards) {
        let title = card.querySelector('h3').innerText.toLowerCase();
        card.style.display = title.includes(input) ? "flex" : "none";
    }
}

// --- 4. CAROUSEL LOGIC ---
function scrollCarousel(direction, btn) {
    const wrapper = btn.closest('.carousel-container');
    const track = wrapper.querySelector('.carousel-track');
    const scrollStep = 900; 
    track.scrollBy({ left: direction * scrollStep, behavior: 'smooth' });
}

// --- 5. GAME LOADING ---
function setupGame(gameUrl) {
    const container = document.getElementById('game-container');
    if (!container) return;
    
    container.innerHTML = `
        <div class="iframe-hover-zone" onclick="loadIframe('${gameUrl}')">
            <div class="play-content">
                <div class="play-icon" style="font-size:80px; margin-bottom:10px;">▶</div>
                <div class="play-text" style="font-size:2rem; letter-spacing:4px;">PLAY NOW</div>
            </div>
        </div>`;
}

function loadIframe(url) {
    const container = document.getElementById('game-container');
    container.innerHTML = `<iframe id="game-frame" src="${url}" allowfullscreen="true"></iframe>`;
}

// FIXED: Always request fullscreen on the container so the CSS border-hide works
function openFullscreen() {
    const container = document.getElementById("game-container");
    if (container) {
        if (container.requestFullscreen) container.requestFullscreen();
        else if (container.webkitRequestFullscreen) container.webkitRequestFullscreen();
        else if (container.msRequestFullscreen) container.msRequestFullscreen();
    }
}

// --- 6. INITIALIZATION ---
window.addEventListener('DOMContentLoaded', () => {
    generateNav();
    
    const urlParams = new URLSearchParams(window.location.search);
    const searchVal = urlParams.get('search');
    if (searchVal) {
        const input = document.getElementById('gameSearch');
        if (input) { 
            input.value = searchVal; 
            setTimeout(filterGames, 150); 
        }
    }

    document.querySelectorAll('.left-btn').forEach(btn => {
        btn.onclick = () => scrollCarousel(-1, btn);
    });
    document.querySelectorAll('.right-btn').forEach(btn => {
        btn.onclick = () => scrollCarousel(1, btn);
    });
});
