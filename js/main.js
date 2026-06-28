/* ============================================================================
   Navigation and UI Controls
   ============================================================================ */

// Resolve links from the actual site root. This works at /, under a GitHub
// Pages project path, and when index.html is opened directly from disk.
const scriptUrl = document.currentScript && document.currentScript.src;
const SITE_ROOT = scriptUrl ? new URL('../', scriptUrl) : new URL('./', window.location.href);

// Initialize navigation on page load
document.addEventListener('DOMContentLoaded', function() {
  initializeNavigation();
  initializeTheme();
  initializeSearch();
  registerServiceWorker();
});

// Navigation initialization
function initializeNavigation() {
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function() {
      hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      hamburger.setAttribute('aria-expanded', String(mobileMenu.classList.contains('active')));
    });

    // Close menu when a link is clicked
    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(link => {
      link.addEventListener('click', function() {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
      if (!event.target.closest('header')) {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });

    hamburger.setAttribute('aria-expanded', 'false');
  }

  // Every page gets a dependable Back control without duplicating markup.
  const navRight = document.querySelector('.nav-right');
  if (navRight && !document.querySelector('.back-button')) {
    const backButton = document.createElement('button');
    backButton.className = 'back-button';
    backButton.type = 'button';
    backButton.textContent = '← Back';
    backButton.setAttribute('aria-label', 'Go back');
    backButton.addEventListener('click', function() {
      if (document.referrer && new URL(document.referrer).origin === window.location.origin) {
        window.history.back();
      } else {
        window.location.href = SITE_ROOT.href;
      }
    });
    navRight.insertBefore(backButton, navRight.firstChild);
  }
}

// Theme management
function initializeTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  const html = document.documentElement;
  
  // Check for saved theme preference or system preference
  const savedTheme = localStorage.getItem('theme');
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = savedTheme === 'dark' || (savedTheme === null && systemDark);
  
  if (isDark) {
    html.classList.add('dark-mode');
  } else {
    html.classList.add('light-mode');
  }

  updateThemeButton(themeToggle, isDark);
  
  // Theme toggle button
  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      html.classList.toggle('dark-mode');
      html.classList.toggle('light-mode');
      
      const isDarkMode = html.classList.contains('dark-mode');
      localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
      updateThemeButton(themeToggle, isDarkMode);
    });
  }
}

function updateThemeButton(button, isDark) {
  if (!button) return;
  button.textContent = isDark ? '☀️' : '🌙';
  button.title = isDark ? 'Use light mode' : 'Use dark mode';
  button.setAttribute('aria-label', button.title);
}

// Search initialization and functionality
function initializeSearch() {
  const searchInput = document.querySelector('.search-bar input, #search-input');
  const searchResults = document.getElementById('search-results');
  
  if (searchInput) {
    searchInput.addEventListener('input', function(e) {
      const query = e.target.value.toLowerCase();
      
      if (query.length > 0) {
        const results = performSearch(query);
        displaySearchResults(results);
      } else if (searchResults) {
        searchResults.innerHTML = '';
      }
    });
  }
}

// Search database
const searchDatabase = [
  { title: 'All City Guides', path: '/', keywords: ['home', 'cities', 'guide'] },
  { title: 'Paris City Guide', path: '/paris/', keywords: ['paris', 'france', 'sights'] },
  { title: 'Navigo Card', path: '/paris/navigo.html', keywords: ['navigo', 'card', 'metro', 'pass'] },
  { title: 'Metro Guide', path: '/paris/metro.html', keywords: ['metro', 'transport', 'station'] },
  { title: 'Metro Etiquette', path: '/paris/metro-etiquette.html', keywords: ['metro', 'etiquette', 'transport'] },
  { title: 'Seine Cruise', path: '/paris/seine-cruise.html', keywords: ['cruise', 'seine', 'river', 'boat'] },
  { title: 'Dior Museum', path: '/paris/dior.html', keywords: ['dior', 'museum', 'fashion', 'art'] },
  { title: 'Eiffel Tower', path: '/paris/eiffel.html', keywords: ['eiffel', 'tower', 'monument'] },
  { title: 'Arc de Triomphe', path: '/paris/arc.html', keywords: ['arc', 'triomphe', 'monument'] },
  { title: 'Notre-Dame', path: '/paris/notre-dame.html', keywords: ['notre', 'dame', 'cathedral', 'church'] },
  { title: 'Louvre', path: '/paris/louvre.html', keywords: ['louvre', 'museum', 'art'] },
  { title: 'Montmartre', path: '/paris/montmartre.html', keywords: ['montmartre', 'neighborhood', 'paris'] },
  { title: 'Amsterdam City Guide', path: '/amsterdam/', keywords: ['amsterdam', 'netherlands', 'sights'] },
  { title: 'Anne Frank House', path: '/amsterdam/anne-frank.html', keywords: ['anne', 'frank', 'house', 'museum', 'holocaust'] },
  { title: 'Dam Square', path: '/amsterdam/dam-square.html', keywords: ['dam', 'square', 'monument'] },
  { title: 'Amsterdam Canals', path: '/amsterdam/canals.html', keywords: ['canal', 'water', 'boat', 'cruise'] },
  { title: 'Amsterdam Transport', path: '/amsterdam/transport.html', keywords: ['tram', 'metro', 'ferry', 'ovpay'] },
  { title: 'Amsterdam Sightseeing', path: '/amsterdam/sightseeing.html', keywords: ['museum', 'neighbourhood', 'sights'] },
  { title: 'Jordaan', path: '/amsterdam/jordaan.html', keywords: ['jordaan', 'neighbourhood', 'market', 'canal'] },
  { title: 'Rijksmuseum', path: '/amsterdam/rijksmuseum.html', keywords: ['rijksmuseum', 'rembrandt', 'vermeer', 'museum', 'art'] },
  { title: 'Berlin City Guide', path: '/berlin/', keywords: ['berlin', 'germany', 'sights'] },
  { title: 'Brandenburg Gate', path: '/berlin/brandenburg-gate.html', keywords: ['gate', 'pariser', 'platz', 'landmark'] },
  { title: 'Reichstag', path: '/berlin/reichstag.html', keywords: ['reichstag', 'bundestag', 'dome'] },
  { title: 'Holocaust Memorial', path: '/berlin/jewish-memorial.html', keywords: ['holocaust', 'memorial', 'jewish'] },
  { title: 'Museum Island', path: '/berlin/museum-island.html', keywords: ['museum', 'island', 'art', 'history'] },
  { title: 'East Side Gallery', path: '/berlin/east-side-gallery.html', keywords: ['wall', 'murals', 'gallery'] },
  { title: 'Berlin Wall Memorial', path: '/berlin/wall-memorial.html', keywords: ['wall', 'memorial', 'bernauer'] },
  { title: 'Checkpoint Charlie', path: '/berlin/checkpoint-charlie.html', keywords: ['checkpoint', 'charlie', 'cold', 'war', 'wall'] },
  { title: 'Berlin Sightseeing', path: '/berlin/sightseeing.html', keywords: ['berlin', 'sightseeing', 'neighbourhood', 'park'] },
  { title: 'Berlin Transport', path: '/berlin/transport.html', keywords: ['ubahn', 'sbahn', 'tram', 'bvg'] },
  { title: 'Prague City Guide', path: '/prague/', keywords: ['prague', 'czechia', 'czech', 'sights'] },
  { title: 'Prague Airport', path: '/prague/airport.html', keywords: ['prague', 'airport', 'vaclav', 'havel', 'trolleybus', 'terminal'] },
  { title: 'Old Town Square', path: '/prague/old-town.html', keywords: ['old', 'town', 'square', 'prague'] },
  { title: 'Charles Bridge', path: '/prague/charles-bridge.html', keywords: ['charles', 'bridge', 'monument'] },
  { title: 'Prague Castle', path: '/prague/castle.html', keywords: ['castle', 'fortress', 'prague'] },
  { title: 'Astronomical Clock', path: '/prague/clock.html', keywords: ['clock', 'astronomical', 'ancient'] },
  { title: 'Prague Jewish Quarter', path: '/prague/jewish-quarter.html', keywords: ['jewish', 'quarter', 'josefov', 'synagogue', 'cemetery'] },
  { title: 'Prague Sightseeing', path: '/prague/sightseeing.html', keywords: ['prague', 'sightseeing', 'neighbourhood', 'viewpoint'] },
  { title: 'Prague Transport', path: '/prague/transport.html', keywords: ['tram', 'metro', 'ticket', 'pid'] },
  { title: 'Confirmed Bookings', path: '/bookings/', keywords: ['booked', 'booking', 'seine', 'dior', 'anne', 'date', 'time'] },
  { title: 'Money Guide', path: '/money/', keywords: ['money', 'card', 'cash', 'atm', 'currency'] },
  { title: 'Halifax Clarity', path: '/money/halifax.html', keywords: ['halifax', 'clarity', 'credit', 'card'] },
  { title: 'Cash Requirements', path: '/money/cash.html', keywords: ['cash', 'euro', 'koruna'] },
  { title: 'Using ATMs', path: '/money/atms.html', keywords: ['atm', 'cash', 'withdrawal'] },
  { title: 'Avoid Dynamic Currency Conversion', path: '/money/dcc.html', keywords: ['dcc', 'dynamic', 'currency', 'conversion', 'local'] },
  { title: 'Currencies', path: '/money/currencies.html', keywords: ['currency', 'euro', 'eur', 'koruna', 'czk'] },
  { title: 'Safety Guide', path: '/safety/', keywords: ['safety', 'pickpocket', 'scam', 'emergency'] },
  { title: 'Pickpockets', path: '/safety/pickpockets.html', keywords: ['pickpocket', 'phone', 'wallet', 'theft'] },
  { title: 'Public Transport Safety', path: '/safety/transport.html', keywords: ['transport', 'safety', 'metro', 'tram'] },
  { title: 'Common Scams', path: '/safety/scams.html', keywords: ['scam', 'petition', 'bracelet', 'ticket'] },
  { title: 'Emergency Contacts', path: '/safety/emergency-contacts.html', keywords: ['emergency', '112', 'police', 'ambulance', 'fire'] },
  { title: 'Medical Emergencies', path: '/safety/medical.html', keywords: ['medical', 'doctor', 'pharmacy', 'hospital', '112'] },
  { title: 'Emergency', path: '/emergency/', keywords: ['emergency', '112', 'help', 'call'] }
];

// Perform search
function performSearch(query) {
  return searchDatabase.filter(item => {
    const titleMatch = item.title.toLowerCase().includes(query);
    const keywordsMatch = item.keywords.some(keyword => keyword.includes(query));
    return titleMatch || keywordsMatch;
  }).slice(0, 10);
}

// Display search results
function displaySearchResults(results) {
  const searchResults = document.getElementById('search-results');
  
  if (!searchResults) return;
  
  if (results.length === 0) {
    searchResults.innerHTML = '<div class="search-no-results">No results found</div>';
    return;
  }
  
  searchResults.innerHTML = results.map(result => `
    <a href="${new URL(result.path.replace(/^\/+/, ''), SITE_ROOT).href}" class="search-result-item">
      <div class="search-result-title">${result.title}</div>
      <div class="search-result-path">${result.path}</div>
    </a>
  `).join('');
}

// Register service worker
function registerServiceWorker() {
  if ('serviceWorker' in navigator && window.location.protocol !== 'file:') {
    navigator.serviceWorker.register(new URL('sw.js', SITE_ROOT)).catch(error => {
      console.log('Service Worker registration failed:', error);
    });
  }
}

// Utility function to get breadcrumb path
function generateBreadcrumbs(currentPath) {
  const parts = currentPath.split('/').filter(p => p);
  let breadcrumbs = [{ title: 'Home', path: '/' }];
  
  let path = '/';
  for (let part of parts) {
    path += part + '/';
    const title = part.charAt(0).toUpperCase() + part.slice(1);
    breadcrumbs.push({ title, path });
  }
  
  return breadcrumbs;
}

// Helper to check if link is active
function isActive(href) {
  const currentPath = window.location.pathname;
  return currentPath === href || currentPath.includes(href);
}
