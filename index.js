/**
 * Enable drag and drop using the Dragula library
 */
dragula([
    document.getElementById("step-1-puzzlepiece-container"),
    document.getElementById("step-1-puzzlespot-0")
])
.on("drop", function (el) {
    //el.className += "ex-moved";
    transitionToStep(2);
});


/**
 * Control transitions between steps. The current step is encoded in the URL as an id
 * e.g. https://esse-dev.github.io/borzoi#step-0
 */
let currentStepNum = -1;

// The 'popstate' event is triggered when the user navigates toa new URL within the current website.
// For instance, this happens when the user presses the browser back button.
window.addEventListener('popstate', transitionToStepInURL);
// Once website is loaded show current step (to prevent images and fonts from showing up late)
document.fonts.ready.then(transitionToStepInURL);

function transitionToStepInURL() {
    // Get the step number encoded in the URL. If there is no step in the URL, default to 0.
    const stepInUrl = parseInt(window.location.hash.replace('#step-', '')) || 0;
    if (stepInUrl !== currentStepNum) {
        showStep(stepInUrl);
    }
}

function transitionToStep(nextStepNum) {
    const stepEls = document.getElementsByClassName('step-container');

    const currentStepEl = stepEls[currentStepNum];
    let delay = 0;
    // Get all animated elements in the current step element.
    const animatedEls = currentStepEl.getElementsByClassName('animate-in-out');

    // Hide all animated elements in the current step.
    for (const animatedEl of animatedEls) {
        animatedEl.style.opacity = 0;
        animatedEl.style.transitionDelay = `${delay}s`;
        delay += 0.1;
    }

    // Once all elements in the current step are hidden, show the next step.
    const lastAnimatedEl = animatedEls[animatedEls.length - 1];
    setTimeout(() => {
        window.location.href = '#step-' + nextStepNum;
        showStep(nextStepNum);
    }, 1100);
}

function showStep(nextStepNum) {
    currentStepNum = nextStepNum;

    const stepEls = document.getElementsByClassName('step-container');
    const nextStepEl = stepEls[nextStepNum];
    nextStepEl.scrollIntoView();

    let delay = 0;
    const animatedEls = nextStepEl.getElementsByClassName('animate-in-out');
    for (const animatedEl of animatedEls) {
        animatedEl.style.opacity = 1;
        animatedEl.style.transitionDelay = `${delay}s`;
        delay += 0.1;
    }
}