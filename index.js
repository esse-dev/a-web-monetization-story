/**
 * Enable drag and drop using the Dragula library
 */
dragula([
    document.getElementById("page-1-puzzlepiece-container"),
    document.getElementById("page-1-puzzlespot-0")
])
.on("drop", function (el) {
    transitionToPage(2);
});


/**
 * Control transitions between pages. The current page is encoded in the URL as an id
 * e.g. https://esse-dev.github.io/borzoi#page-0
 */
const pageEls = document.getElementsByClassName('page-container');
let currentPageNum = -1;

let pageElIdCounter = 0;
for (const pageEl of pageEls) {
    pageEl.id = `page-${pageElIdCounter}`;
    pageElIdCounter++;
}

// The 'popstate' event is triggered when the user navigates toa new URL within the current website.
// For instance, this happens when the user presses the browser back button.
window.addEventListener('popstate', transitionToPageInURL);
// Once website is loaded show current page (to prevent images and fonts from showing up late)
document.fonts.ready.then(transitionToPageInURL);

function transitionToPageInURL() {
    // Get the page number encoded in the URL. If there is no page in the URL, default to 0.
    const pageInUrl = parseInt(window.location.hash.replace('#page-', '')) || 0;
    if (pageInUrl !== currentPageNum) {
        showPage(pageInUrl);
    }
}

function transitionToPage(nextPageNum) {
    const currentPageEl = pageEls[currentPageNum];
    let delay = 0;
    // Get all animated elements in the current page element.
    const animatedEls =
        currentPageEl.querySelectorAll('.animate-in-out, .animate-in, .animate-out');
    const animatedNotInEls =
        currentPageEl.querySelectorAll('.animate-in-out, .animate-out');

    // Hide all animated elements in the current page.
    // setTimeout is used so .animate-in elements are hidden AFTER transitioning to the next page.
    setTimeout(() => {
        for (const animatedEl of animatedEls) {
            if (animatedEl.classList.contains('animate-in')) {
                animatedEl.style.transitionDuration = '0s';
                animatedEl.style.transitionDelay = '0s';
            }
            if (animatedEl.classList.contains('animate-out')) {
                animatedEl.style.transitionDuration = '0.2s';
                animatedEl.style.transitionDelay = `${delay}s`;
            }
            animatedEl.style.opacity = 0;
            delay += 0.1;
        }
    }, 10);

    // Once all elements in the current page are hidden, show the next page.
    setTimeout(() => {
        window.location.href = '#page-' + nextPageNum;
        showPage(nextPageNum);
    }, (animatedNotInEls.length > 0) ? 700 : 0);
}

// showPage is used by transitionToPage and transitionToPageInURL
// not recommended to be called manually!
function showPage(nextPageNum) {
    currentPageNum = nextPageNum;

    const nextPageEl = pageEls[nextPageNum];
    nextPageEl.scrollIntoView();

    let delay = 0;
    const animatedEls = nextPageEl.querySelectorAll('.animate-in-out, .animate-in, .animate-out');
    for (const animatedEl of animatedEls) {
        if (animatedEl.classList.contains('animate-out')) {
            console.log('hi')
            animatedEl.style.transitionDuration = '0s';
            animatedEl.style.transitionDelay = '0s';
        }
        if (animatedEl.classList.contains('animate-in')) {
            animatedEl.style.transitionDuration = '0.2s';
            animatedEl.style.transitionDelay = `${delay}s`;
        }
        animatedEl.style.opacity = 1;
        delay += 0.1;
    }
}