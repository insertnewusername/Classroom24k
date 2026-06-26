/**
 * script.js - Classroom 24k - Firebase + Recently Played (Clean)
 */


// ========== 0. DOMAIN LOCK (CASE-INSENSITIVE) ==========
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
// ========== 1. GOOGLE ANALYTICS ==========
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

// ========== 2. FIREBASE SDK (load dynamically) ==========
(function loadFirebase() {
    const scripts = [
        'https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js',
        'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js',
        'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js'
    ];
    scripts.forEach(src => {
        const s = document.createElement('script');
        s.src = src;
        s.async = false;
        document.head.appendChild(s);
    });
})();

// ========== 3. FIREBASE CONFIG ==========
const firebaseConfig = {
    apiKey: "AIzaSyAdbHtBDapzbWg_-W1cPPoTBz_oTfny380",
    authDomain: "classroom24k.firebaseapp.com",
    projectId: "classroom24k",
    storageBucket: "classroom24k.firebasestorage.app",
    messagingSenderId: "360262202722",
    appId: "1:360262202722:web:6decacd62f56fccf0c283b",
    measurementId: "G-T7KSPP2T0H"
};

let auth, db;

function initFirebase() {
    if (typeof firebase === 'undefined') {
        setTimeout(initFirebase, 300);
        return;
    }
    firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
    setupAuthListener();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFirebase);
} else {
    initFirebase();
}

// ========== 4. GAME METADATA ==========
const GAME_META = {
    "bloxd-io": { title: "Bloxd.io", img: "https://cdn2.spatial.io/assets/v1/static/external_games/bloxd-io.jpeg" },
    "slope": { title: "Slope", img: "https://slope2unblocked.github.io/images/logo.png" },
    "tag": { title: "Tag", img: "https://abinbins.github.io/thumb/tag.png" },
    "bumper-cars-soccer": { title: "Bumper Cars", img: "https://abinbins.github.io/thumb/bumper-cars-soccer.png" },
    "rocket-soccer-derby": { title: "Rocket Derby Soccer", img: "https://aiptcomics.com/wp-content/uploads/2020/07/rocket-league.jpg" },
    "retro-bowl": { title: "Retro Bowl", img: "assets/retro-bowl.png" },
    "8-ball-pool": { title: "8 Ball Pool", img: "https://abinbins.github.io/thumb/8-ball-pool.png" },
    "champions-league": { title: "Champions League", img: "https://abinbins.github.io/thumb/soccer-skills-champions-league.png" },
    "rowdy-city-wrestling": { title: "Rowdy City Wrestling", img: "https://abinbins.github.io/thumb/rowdy-city-wrestling.png" },
    "smash-karts": { title: "Smash Karts", img: "https://abinbins.github.io/thumb/smash-karts.png" },
    "rowdy-wrestling": { title: "Rowdy Wrestling", img: "https://abinbins.github.io/thumb/rowdy-wrestling.png" },
    "polytrack": { title: "Polytrack", img: "https://www.kizgame.com/thumbs/polytrack_small.webp" },
    "cookie-clicker": { title: "Cookie Clicker", img: "https://abinbins.github.io/thumb/cookie-clicker.png" },
    "world-cup": { title: "World Cup", img: "https://abinbins.github.io/thumb/soccer-skills-world-cup.png" },
    "basketball-stars": { title: "Basketball Stars", img: "https://abinbins.github.io/thumb/basketball-stars.png" },
    "euro-cup": { title: "Euro Cup", img: "https://abinbins.github.io/thumb/soccer-skills-euro-cup.png" },
    "basket-random": { title: "Basket Random", img: "https://abinbins.github.io/thumb/basket-random.png" },
    "stick-fighter": { title: "Stick Fighter", img: "https://abinbins.github.io/thumb/stick-fighter.png" },
    "stickman-hook": { title: "Stickman Hook", img: "https://abinbins.github.io/thumb/stickman-hook.png" },
    "tiny-fishing": { title: "Tiny Fishing", img: "https://abinbins.github.io/thumb/tiny-fishing.png" },
    "city-car-driving": { title: "City Car Driving", img: "https://abinbins.github.io/thumb/city-car-driving-stunt-master.png" },
    "raft-wars": { title: "Raft Wars", img: "https://abinbins.github.io/thumb/raft-wars.png" },
    "learn-to-fly-2": { title: "Learn to Fly 2", img: "assets/learn-to-fly-2.png" },
    "free-kick-shooter": { title: "Free Kick Shooter", img: "assets/free-kick-shooter.png" },
    "javelin-fighting": { title: "Javelin Fighting", img: "https://cdn-1.webcatalog.io/catalog/poki-javelin-fighting/poki-javelin-fighting-icon-filled-256.png" },
    "burnin-rubber-5-xs": { title: "Burnin Rubber 5 xs", img: "https://static.wikia.nocookie.net/xform-games/images/f/f5/Image347457599.png" },
    "crossy-road": { title: "Crossy Road", img: "https://abinbins.github.io/thumb/crossy-road.png" }
};

// ========== 5. AUTH ==========
let currentUser = null;
let pendingGameSetup = null;
let unsubscribeRecentlyPlayed = null;

function setupAuthListener() {
    if (!auth) return;
    auth.onAuthStateChanged(user => {
        currentUser = user;
        updateAuthUI(user);

        if (user) {
            const uid = user.uid;
            db.collection('users').doc(uid).set({}, { merge: true })
                .then(() => {
                    console.log('✅ User document ready');
                    if (pendingGameSetup) {
                        const { gameUrl, gameId } = pendingGameSetup;
                        pendingGameSetup = null;
                        setupGame(gameUrl, gameId);
                    }
                    loadRecentlyPlayed();
                })
                .catch(err => {
                    console.warn('⚠️ Could not create user document:', err);
                    if (pendingGameSetup) {
                        const { gameUrl, gameId } = pendingGameSetup;
                        pendingGameSetup = null;
                        setupGame(gameUrl, gameId);
                    }
                    loadRecentlyPlayed();
                });
        } else {
            if (unsubscribeRecentlyPlayed) {
                unsubscribeRecentlyPlayed();
                unsubscribeRecentlyPlayed = null;
            }
            renderRecentlyPlayedCarousel(null);
        }
    });
}

function updateAuthUI(user) {
    const section = document.getElementById('auth-section');
    if (!section) return;
    if (user) {
        section.innerHTML = `
            <span style="color:#00aaff; margin-right:10px;">${user.displayName || user.email}</span>
            <button id="signOutBtn" class="auth-btn">Sign Out</button>
        `;
        document.getElementById('signOutBtn').addEventListener('click', () => auth.signOut());
    } else {
        section.innerHTML = `
            <button id="signInBtn" class="auth-btn">Sign In</button>
        `;
        document.getElementById('signInBtn').addEventListener('click', showAuthModal);
    }
}

// ========== 6. AUTH MODAL ==========
function showAuthModal() {
    const existing = document.getElementById('authModal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'authModal';
    modal.style.cssText = `
        position: fixed; top:0; left:0; width:100%; height:100%;
        background: rgba(8, 18, 33, 0.85); backdrop-filter: blur(6px);
        display:flex; align-items:center; justify-content:center; z-index:9999;
        animation: fadeIn 0.3s ease;
    `;
    modal.innerHTML = `
        <div style="background:#0d1b2e; padding:30px 35px 35px; border-radius:20px; width:380px; max-width:92%; border:2px solid #00aaff; box-shadow:0 0 40px rgba(0,170,255,0.2); position:relative;">
            <button id="authCloseBtn" style="position:absolute; top:12px; right:16px; background:transparent; border:none; color:#aaa; font-size:24px; cursor:pointer; transition:0.2s;">✕</button>
            <h2 style="color:#00aaff; margin:0 0 20px 0; text-align:center; letter-spacing:1px;">Welcome Back</h2>
            <input id="authEmail" type="email" placeholder="Email" style="width:100%; padding:12px 16px; margin:10px 0; background:#081221; border:1px solid #1c426e; border-radius:8px; color:white; font-size:1rem; box-sizing:border-box; outline:none; transition:0.3s;" onfocus="this.style.borderColor='#00aaff'" onblur="this.style.borderColor='#1c426e'">
            <input id="authPassword" type="password" placeholder="Password" style="width:100%; padding:12px 16px; margin:10px 0; background:#081221; border:1px solid #1c426e; border-radius:8px; color:white; font-size:1rem; box-sizing:border-box; outline:none; transition:0.3s;" onfocus="this.style.borderColor='#00aaff'" onblur="this.style.borderColor='#1c426e'">
            <div style="display:flex; gap:12px; justify-content:center; margin-top:18px;">
                <button id="authLoginBtn" class="auth-btn" style="flex:1;">Sign In</button>
                <button id="authSignupBtn" class="auth-btn" style="flex:1; background:#1c426e;">Sign Up</button>
            </div>
            <div style="margin:20px 0 12px; text-align:center; color:#888; font-size:0.9rem;">— or —</div>
            <button id="googleSignInBtn" class="auth-btn" style="width:100%; background:#fff; color:#333; border:1px solid #ddd; display:flex; align-items:center; justify-content:center; gap:10px; padding:10px; font-weight:500; transition:0.3s;" onmouseover="this.style.background='#f0f0f0'" onmouseout="this.style.background='#fff'">
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" style="width:22px; height:22px;">
                Sign in with Google
            </button>
            <div id="authMessage" style="color:#ff6b6b; margin-top:15px; text-align:center; font-size:0.95rem;"></div>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('authCloseBtn').addEventListener('click', () => modal.remove());
    document.getElementById('authLoginBtn').addEventListener('click', () => {
        const email = document.getElementById('authEmail').value;
        const password = document.getElementById('authPassword').value;
        auth.signInWithEmailAndPassword(email, password)
            .then(() => modal.remove())
            .catch(err => document.getElementById('authMessage').textContent = err.message);
    });
    document.getElementById('authSignupBtn').addEventListener('click', () => {
        const email = document.getElementById('authEmail').value;
        const password = document.getElementById('authPassword').value;
        auth.createUserWithEmailAndPassword(email, password)
            .then(() => modal.remove())
            .catch(err => document.getElementById('authMessage').textContent = err.message);
    });
    document.getElementById('googleSignInBtn').addEventListener('click', () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider)
            .then(() => modal.remove())
            .catch(err => document.getElementById('authMessage').textContent = err.message);
    });
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

// ========== 7. FIREBASE: LOG GAME ==========
function logGamePlayed(gameId) {
    console.log('🔥 logGamePlayed called with:', gameId);
    if (!auth || !currentUser) {
        console.warn('⚠️ No auth or currentUser – skipping log');
        return Promise.resolve();
    }
    const uid = currentUser.uid;
    console.log('👤 User UID:', uid);

    // Get the current document, merge new game into the map, then update
    return db.collection('users').doc(uid).get()
        .then(doc => {
            let recentMap = {};
            if (doc.exists && doc.data().recentlyPlayed) {
                recentMap = doc.data().recentlyPlayed;
            }
            // Add/update the new game with server timestamp
            recentMap[gameId] = firebase.firestore.FieldValue.serverTimestamp();

            return db.collection('users').doc(uid).update({
                recentlyPlayed: recentMap
            });
        })
        .then(() => {
            console.log('✅ Game logged successfully:', gameId);
            // Trim after update
            return trimRecentlyPlayed(uid);
        })
        .then(() => {
            // Reload carousel after 1.5s to ensure Firestore syncs
            setTimeout(() => {
                loadRecentlyPlayed();
            }, 1500);
        })
        .catch(err => console.error('❌ Failed to log game:', err));
}

// ========== 9. RECENTLY PLAYED CAROUSEL ==========
function loadRecentlyPlayed() {
    if (unsubscribeRecentlyPlayed) {
        unsubscribeRecentlyPlayed();
        unsubscribeRecentlyPlayed = null;
    }

    if (!auth || !currentUser) {
        renderRecentlyPlayedCarousel(null);
        return;
    }

    const uid = currentUser.uid;
    const docRef = db.collection('users').doc(uid);

    // First, force a fresh read from the server
    docRef.get({ source: 'server' })
        .then(doc => {
            if (doc.exists && doc.data().recentlyPlayed) {
                const data = doc.data().recentlyPlayed;
                const sorted = Object.entries(data)
                    .sort((a, b) => (b[1]?.seconds || 0) - (a[1]?.seconds || 0))
                    .map(([gameId]) => gameId);
                renderRecentlyPlayedCarousel(sorted);
            } else {
                renderRecentlyPlayedCarousel([]);
            }
        })
        .catch(() => {
            // Fallback to cache
            docRef.get()
                .then(doc => {
                    if (doc.exists && doc.data().recentlyPlayed) {
                        const data = doc.data().recentlyPlayed;
                        const sorted = Object.entries(data)
                            .sort((a, b) => (b[1]?.seconds || 0) - (a[1]?.seconds || 0))
                            .map(([gameId]) => gameId);
                        renderRecentlyPlayedCarousel(sorted);
                    } else {
                        renderRecentlyPlayedCarousel([]);
                    }
                });
        });

    // Real‑time listener for updates
    unsubscribeRecentlyPlayed = docRef.onSnapshot({ includeMetadataChanges: true }, doc => {
        console.log('📄 Snapshot data (live):', doc.data());
        if (doc.exists && doc.data().recentlyPlayed) {
            const data = doc.data().recentlyPlayed;
            const sorted = Object.entries(data)
                .sort((a, b) => (b[1]?.seconds || 0) - (a[1]?.seconds || 0))
                .map(([gameId]) => gameId);
            renderRecentlyPlayedCarousel(sorted);
        } else {
            renderRecentlyPlayedCarousel([]);
        }
    }, error => {
        console.warn('⚠️ Real‑time listener error:', error);
    });
}

function renderRecentlyPlayedCarousel(gameIds) {
    console.log('🖼️ renderRecentlyPlayedCarousel with:', gameIds);
    const container = document.getElementById('recently-played-container');
    if (!container) return;
    container.innerHTML = '';

    if (!gameIds || gameIds.length === 0) {
        const msg = document.createElement('div');
        msg.style.cssText = 'padding: 40px; text-align:center; color:#aaa; font-size:1.2rem;';
        msg.textContent = currentUser ? 'No games played yet. Go play something!' : 'Sign in to see your recently played games.';
        container.appendChild(msg);
        return;
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'carousel-wrapper';

    const track = document.createElement('div');
    track.className = 'carousel-track';

    // Add game cards
    gameIds.forEach(gameId => {
        const meta = GAME_META[gameId];
        if (!meta) return;
        const card = document.createElement('a');
        card.className = 'game-card';
        card.href = gameId + '.html';
        card.innerHTML = `
            <div class="game-img-container"><img src="${meta.img}" alt="${meta.title}"></div>
            <div class="game-info"><h3>${meta.title}</h3></div>
        `;
        track.appendChild(card);
    });

    // Add "More" card
    const moreCard = document.createElement('a');
    moreCard.className = 'game-card';
    moreCard.href = 'recently-played.html';
    moreCard.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: #0d1b2e;
        border: 2px dashed #00aaff;
        color: #00aaff;
        font-weight: bold;
        text-transform: uppercase;
        text-decoration: none;
        transition: 0.3s;
        width: 200px;
        height: 210px;
        border-radius: 12px;
        flex-shrink: 0;
    `;
    moreCard.innerHTML = `
        <div style="font-size: 2rem; margin-bottom: 5px;">+</div>
        <div>More</div>
    `;
    moreCard.onmouseover = () => {
        moreCard.style.borderColor = '#ffffff';
        moreCard.style.color = '#ffffff';
        moreCard.style.transform = 'scale(1.05)';
    };
    moreCard.onmouseout = () => {
        moreCard.style.borderColor = '#00aaff';
        moreCard.style.color = '#00aaff';
        moreCard.style.transform = 'scale(1)';
    };
    track.appendChild(moreCard);

    // Scroll buttons
    const leftBtn = document.createElement('button');
    leftBtn.className = 'scroll-btn left-btn';
    leftBtn.innerHTML = '&#10094;';
    leftBtn.onclick = () => scrollCarousel(-1, leftBtn);

    const rightBtn = document.createElement('button');
    rightBtn.className = 'scroll-btn right-btn';
    rightBtn.innerHTML = '&#10095;';
    rightBtn.onclick = () => scrollCarousel(1, rightBtn);

    wrapper.appendChild(leftBtn);
    wrapper.appendChild(track);
    wrapper.appendChild(rightBtn);
    container.appendChild(wrapper);
}

// ========== 10. NAVIGATION ==========
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
        <div id="auth-section"></div>
    `;
}

// ========== 11. GAME LOADING (with queuing) ==========
function setupGame(gameUrl, gameId) {
    console.log('🎮 setupGame called with:', gameUrl, gameId);
    if (!auth || !currentUser) {
        console.warn('⏳ Firebase or user not ready – queuing setup for later');
        pendingGameSetup = { gameUrl, gameId };
        return;
    }
    if (gameId) {
        logGamePlayed(gameId);
    }
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

function openFullscreen() {
    const container = document.getElementById("game-container");
    if (container) {
        if (container.requestFullscreen) container.requestFullscreen();
        else if (container.webkitRequestFullscreen) container.webkitRequestFullscreen();
        else if (container.msRequestFullscreen) container.msRequestFullscreen();
    }
}

// ========== 12. RECENTLY PLAYED FULL PAGE ==========
function loadAllRecentlyPlayed() {
    if (!auth || !currentUser) {
        const grid = document.getElementById('recently-played-grid');
        if (grid) {
            grid.innerHTML = `<div style="padding:40px; text-align:center; color:#aaa; font-size:1.2rem;">Sign in to see your recently played games.</div>`;
        }
        return;
    }
    const uid = currentUser.uid;
    db.collection('users').doc(uid).get()
        .then(doc => {
            if (doc.exists && doc.data().recentlyPlayed) {
                const data = doc.data().recentlyPlayed;
                const sorted = Object.entries(data)
                    .sort((a, b) => (b[1]?.seconds || 0) - (a[1]?.seconds || 0))
                    .map(([gameId]) => gameId);
                renderAllRecentlyPlayed(sorted);
            } else {
                renderAllRecentlyPlayed([]);
            }
        })
        .catch(err => {
            console.warn('⚠️ Error loading all recently played:', err);
            const grid = document.getElementById('recently-played-grid');
            if (grid) {
                grid.innerHTML = `<div style="padding:40px; text-align:center; color:#aaa; font-size:1.2rem;">Could not load games. <button onclick="loadAllRecentlyPlayed()" style="background:#00aaff; color:#081221; border:none; padding:8px 20px; border-radius:30px; cursor:pointer; font-weight:bold; margin-top:10px;">Retry</button></div>`;
            }
        });
}

function renderAllRecentlyPlayed(gameIds) {
    const grid = document.getElementById('recently-played-grid');
    if (!grid) return;
    grid.innerHTML = '';

    if (!gameIds || gameIds.length === 0) {
        grid.innerHTML = `<div style="padding:40px; text-align:center; color:#aaa; font-size:1.2rem;">No games played yet. Go play something!</div>`;
        return;
    }

    gameIds.forEach(gameId => {
        const meta = GAME_META[gameId];
        if (!meta) return;
        const card = document.createElement('a');
        card.className = 'game-card';
        card.href = gameId + '.html';
        card.innerHTML = `
            <div class="game-img-container"><img src="${meta.img}" alt="${meta.title}"></div>
            <div class="game-info"><h3>${meta.title}</h3></div>
        `;
        grid.appendChild(card);
    });
}

// ========== 13. SEARCH ==========
function filterGames() {
    let inputField = document.getElementById('gameSearch');
    if (!inputField) return;
    let input = inputField.value.toLowerCase();
    const isMainLibrary = window.location.pathname.endsWith('index.html') || 
                          window.location.pathname === '/' || 
                          !window.location.pathname.includes('.html');
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
        let title = card.querySelector('h3')?.innerText?.toLowerCase() || '';
        card.style.display = title.includes(input) ? "flex" : "none";
    }
}

// ========== 14. CAROUSEL SCROLL ==========
function scrollCarousel(direction, btn) {
    const wrapper = btn.closest('.carousel-wrapper');
    const track = wrapper.querySelector('.carousel-track');
    const scrollStep = 900;
    track.scrollBy({ left: direction * scrollStep, behavior: 'smooth' });
}

// ========== 15. INIT ==========
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
});
