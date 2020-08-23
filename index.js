/**
 * Enable drag and drop using the Dragula library
 */
dragula([
    /**
     * Adding all the elements to the same dragula might actually allow
     * any puzzle piece to get dragged and dropped into any puzzlespot,
     * but since all puzzle piece + spot pairs are on "separate pages",
     * this will work for our purposes.
     */
    document.getElementById('step-1-puzzlepiece-container'),
    document.getElementById('step-1-puzzlespot'),
    document.getElementById('step-2-puzzlepiece-container'),
    document.getElementById('step-2-puzzlespot'),
    document.getElementById('step-3-puzzlepiece-container'),
    document.getElementById('step-3-puzzlespot'),
    document.getElementById('step-4-part-1-puzzlepiece-container'),
    document.getElementById('step-4-part-1-puzzlespot'),
    document.getElementById('step-4-part-2-puzzlepiece-container'),
    document.getElementById('step-4-part-2-puzzlespot')
])
.on('drop', function (el, source, target, sibling) {
    // console.log("element", el); // The draggable puzzle piece
    // console.log("source", source); // The missing puzzle piece div is the source for some reason
    // console.log("target", target); // The container holding the puzzle piece is the target for some reason
    if (source.classList.contains('puzzle-piece') && source.classList.contains('missing')) {
        transitionToNextPage();
        target.parentElement.querySelector('.next-button')?.setAttribute('diabled', false);
    }
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
// Page was getting scrolled halfway between pages when resizing, transitionToPageInURL should
// handle scrolling back to the proper position once the resize happens.
window.addEventListener('resize', () => {
    const currentPageEl = pageEls[currentPageNum];
    currentPageEl.scrollIntoView();
});

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
        for (const animatedEl of Array.from(animatedEls).reverse()) {
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

function transitionToNextPage() {
    transitionToPage(currentPageNum + 1);
}

function transitionToPreviousPage() {
    transitionToPage(currentPageNum - 1);
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

    if (!nextPageEl.querySelector('.page-light-background')) {
        document.getElementById('footer').classList.add('dark-footer');
        document.getElementById('footer').classList.remove('light-footer');
    } else {
        document.getElementById('footer').classList.add('light-footer');
        document.getElementById('footer').classList.remove('dark-footer');
    }
}