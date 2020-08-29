const landing_page_puzzlepiece_container = 'landing-page-puzzlepiece-container';
const drag_to_start_story_div = 'drag-to-start-story-div';

/**
 * Enable drag and drop using the Dragula library
 */
const draggables = dragula([
    /**
     * Adding all the elements to the same dragula might actually allow
     * any puzzle piece to get dragged and dropped into any puzzlespot,
     * but since all puzzle piece + spot pairs are on "separate pages",
     * this will work for our purposes.
     */
    document.getElementById('landing-page-puzzlepiece-container'),
    document.getElementById('landing-page-puzzlespot'),
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
]);

draggables.on('drag', function(el, source) {
    // Hide the "drag to start" when the BEGIN puzzle piece is dragged
    if (source.id === landing_page_puzzlepiece_container) {
        document.getElementById(drag_to_start_story_div).style.opacity = 0;
    }
});

draggables.on('cancel', function (el, container, source) {
    // Show the "drag to start" when the BEGIN puzzle piece is dragged and dropped outside a dragula container
    if (source.id === landing_page_puzzlepiece_container) {
        document.getElementById(drag_to_start_story_div).style.opacity = 1;
    }
});

draggables.on('drop', function (el, source, target, sibling) {
    // console.log("element", el); // The draggable puzzle piece
    // console.log("source", source); // The missing puzzle piece div is the source for some reason
    // console.log("target", target); // The container holding the puzzle piece is the target for some reason

    // Transition to the next page
    const isLandingPagePuzzlePiece = source.classList.contains('landing-page-puzzlepiece');
    if (isLandingPagePuzzlePiece ||
        source.classList.contains('puzzle-piece') ||
        source.classList.contains('puzzle-piece-big') &&
        source.classList.contains('missing')
    ) {
        // Go to the next page and disable the next button on the following page
        setTimeout(() => {
            transitionToNextPage();
            target.parentElement.querySelector('.next-button')?.removeAttribute('disabled');
        }, 400);

        // Hide the puzzle piece and show the BEGIN button instead once the user navigates past the landing page
        setTimeout(() => {
            if (isLandingPagePuzzlePiece) {
                document.getElementById('landing-page-nextback-container').style.opacity = 1;
                document.getElementById('landing-page-puzzle-grid').style.display = 'none';
            }
        }, 500);
    }
});

/**
 * Give a visual hint to the user by animating puzzle pieces when the user is
 * hovering over a missing puzzle piece element.
 */
const puzzlePuzzleEls = Array.from(document.querySelectorAll('.puzzle-piece, .puzzle-piece-big'));
const missingPuzzleEls = Array.from(document.querySelectorAll('.missing'));
for (const missingPuzzleEl of missingPuzzleEls) {
    missingPuzzleEl.addEventListener('mouseenter', () => {
        for (const puzzleEl of puzzlePuzzleEls) {
            if (!puzzleEl.classList.contains('missing')) {
                puzzleEl.style.animationDuration = '2s';
                puzzleEl.style.animationName = 'pulse';
            }
        }
    });
    missingPuzzleEl.addEventListener('mouseleave', () => {
        for (const puzzleEl of puzzlePuzzleEls) {
            if (!puzzleEl.classList.contains('missing')) {
                puzzleEl.style.animationDuration = '6s';
                puzzleEl.style.animationName = 'bounce';
            }
        }
    });
}


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
window.addEventListener('popstate', showPageInURL);
// Once website is loaded show current page (to prevent images and fonts from showing up late)
document.fonts.ready.then(showPageInURL);
// Page was getting scrolled halfway between pages when resizing, transitionToPageInURL should
// handle scrolling back to the proper position once the resize happens.
window.addEventListener('resize', () => showPage(currentPageNum));

function showPageInURL() {
    // Get the page number encoded in the URL. If there is no page in the URL, default to 0.
    const pageInUrl = parseInt(window.location.hash.replace('#page-', '')) || 0;
    if (pageInUrl !== currentPageNum) {
        const isGoingToPreviousPage = pageInUrl === currentPageNum - 1;
        showPage(pageInUrl, isGoingToPreviousPage);
    }
}

function transitionToPage(nextPageNum, reverseAnimation = false) {
    const currentPageEl = pageEls[currentPageNum];
    let delay = 0;
    // Get all animated elements in the current page element.
    const animatedEls =
        currentPageEl.querySelectorAll('.animate-in, .animate-out');
    const animatedOutEls =
        currentPageEl.querySelectorAll('.animate-out');
    const animatedInEls =
        currentPageEl.querySelectorAll('.animate-in');

    // Hide all animated elements in the current page.
    // setTimeout is used so .animate-in elements are hidden AFTER transitioning to the next page.
    setTimeout(() => {
        for (const animatedEl of Array.from(animatedEls).reverse()) {
            const elIsAnimatingOut =
                (animatedEl.classList.contains('animate-out') && !reverseAnimation) ||
                (animatedEl.classList.contains('animate-in') && reverseAnimation);

            if (!elIsAnimatingOut) {
                animatedEl.style.transitionDuration = '0s';
                animatedEl.style.transitionDelay = '0s';
                setTimeout(() => {
                    animatedEl.style.opacity = 0;
                }, 800);
            }
            if (elIsAnimatingOut) {
                animatedEl.style.transitionDuration = '0.2s';
                animatedEl.style.transitionDelay = `${delay}s`;
                animatedEl.style.opacity = 0;
                delay += 0.1;
            }
        }
    }, 10);

    // Once all elements in the current page are hidden, show the next page.
    const isPageAnimatingOut = (animatedOutEls.length > 0 && !reverseAnimation) ||
                               (animatedInEls.length > 0 && reverseAnimation);
    const totalPageAnimateOutTime = delay*100 + 200;

    setTimeout(() => {
        window.location.href = '#page-' + nextPageNum;
        // Showing the next page is handled by the popstate listener
    }, isPageAnimatingOut ? totalPageAnimateOutTime + 200 : 20);
}

const navDotEls = Array.from(document.getElementsByClassName('nav-dot'));
for (let i = 0; i < navDotEls.length; i++) {
    const navDotEl = navDotEls[i];
    navDotEl.addEventListener('click', () => {
        transitionToPage(i, true);
    });
}

const MAX_PAGE_NUM = navDotEls.length - 1;
function transitionToNextPage() {
    if (currentPageNum < MAX_PAGE_NUM) {
        transitionToPage(currentPageNum + 1);
    }
}

function transitionToPreviousPage() {
    if (currentPageNum > 0) {
        transitionToPage(currentPageNum - 1, true);
    }
}

// showPage is used by transitionToPage and transitionToPageInURL
// not recommended to be called manually!
function showPage(nextPageNum, reverseAnimation = false) {
    currentPageNum = nextPageNum;

    const nextPageEl = pageEls[nextPageNum];
    nextPageEl.scrollIntoView();

    let delay = 0;
    const animatedEls = nextPageEl.querySelectorAll('.animate-in, .animate-out');

    for (const animatedEl of animatedEls) {
        const elIsAnimatingIn =
            (animatedEl.classList.contains('animate-in') && !reverseAnimation) ||
            (animatedEl.classList.contains('animate-out') && reverseAnimation);

        if (!elIsAnimatingIn) {
            animatedEl.style.transitionDuration = '0s';
            animatedEl.style.transitionDelay = '0s';
        }
        if (elIsAnimatingIn) {
            animatedEl.style.transitionDuration = '0.2s';
            animatedEl.style.transitionDelay = `${delay}s`;
        }
        animatedEl.style.opacity = 1;
        delay += 0.1;
    }

    const navEl = document.getElementsByClassName('nav-dot-container')[0];

    // Hide the navigation element on the landing page
    navEl.style.opacity = (currentPageNum === 0) ? 0 : 1;

    const navDogEl = document.getElementById('nav-dog');
    const navDotWidth = navEl.offsetWidth / navDotEls.length;
    const navDogElOffset = 19; // higher number = move further left
    navDogEl.style.left =  (navDotWidth/2 + navDotWidth*currentPageNum - navDogElOffset) + 'px';

    let navDotCounter = 0;
    for (const navDotEl of navDotEls) {
        if (navDotCounter <= currentPageNum) {
            navDotEl.removeAttribute('disabled');
        }
        navDotCounter++;
    }

    if (!nextPageEl.querySelector('.page-light-background')) {
        document.getElementById('footer').classList.add('dark-footer');
        document.getElementById('footer').classList.remove('light-footer');
    } else {
        document.getElementById('footer').classList.add('light-footer');
        document.getElementById('footer').classList.remove('dark-footer');
    }
}

async function copyCode() {
    // Read the basic_web_monetization_code.html file
    const codeText = await readFile(window.location.origin + '/borzoi/' + 'samples/basic_web_monetization_code.html');

    // Create hidden text area element to hold text, set the value and add it to the body
    const tempTextArea = document.createElement("textarea");
    tempTextArea.value = codeText;

    // This element is visible, but is outside the visible view...
    // Hiding it seems to prevent the text area from being selectable
    // And thus the text cannot be copied
    document.body.appendChild(tempTextArea);

    // Select and copy the text to the clipboard
    tempTextArea.select();
    document.execCommand('copy');
    tempTextArea.remove();

    // Let the user know that text has been copied to the clipboard
    document.getElementById('copied-code-image').style.opacity = 1;
    setTimeout(() => {
        document.getElementById('copied-code-image').style.opacity = 0;
    }, 2500);
}

/**
 * Read a file and return the text in the file.
 *
 * @param {String} fileName The name of the file to read.
 * @returns The text read from the file.
 */
async function readFile(fileName) {
    return await fetch(fileName)
        .then(response => {
            if (response.ok) {
                return response.text();
            } else {
                console.log(response.status);
                throw Error(response.status);
            }
        })
        .catch(error => console.log(error));
}


/**
 * The following code adds basic keyboard navigation support. Users can tab-key between links on
 * pages. Users can use the arrow keys to go to the next and previous page.
 */
function getAncestorEl(elem, selector) {
	for ( ; elem && elem !== document; elem = elem.parentNode ) {
		if ( elem.matches( selector ) ) return elem;
	}
	return null;
};

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
        transitionToNextPage();
    }
    if (e.key === 'ArrowLeft') {
        transitionToPreviousPage();
    }
});
window.addEventListener('focus', () => {
    const pageContainerAncestor = getAncestorEl(document.activeElement, '.page-container');
    if (pageContainerAncestor) {
        showPage(parseInt(pageContainerAncestor.id.replace('page-', '')));
    }
}, true);
