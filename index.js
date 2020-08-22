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
    const animatedEls = currentPageEl.getElementsByClassName('animate-in-out');

    // Hide all animated elements in the current page.
    for (const animatedEl of animatedEls) {
        animatedEl.style.opacity = 0;
        animatedEl.style.transitionDelay = `${delay}s`;
        delay += 0.1;
    }

    // Once all elements in the current page are hidden, show the next page.
    const lastAnimatedEl = animatedEls[animatedEls.length - 1];
    setTimeout(() => {
        window.location.href = '#page-' + nextPageNum;
        showPage(nextPageNum);
    }, 1100);
}

// showPage is used by transitionToPage and transitionToPageInURL
// not recommended to be called manually!
function showPage(nextPageNum) {
    currentPageNum = nextPageNum;

    const nextPageEl = pageEls[nextPageNum];
    nextPageEl.scrollIntoView();

    let delay = 0;
    const animatedEls = nextPageEl.getElementsByClassName('animate-in-out');
    for (const animatedEl of animatedEls) {
        animatedEl.style.opacity = 1;
        animatedEl.style.transitionDelay = `${delay}s`;
        delay += 0.1;
    }
}