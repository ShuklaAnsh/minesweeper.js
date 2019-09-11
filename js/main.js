// window.onbeforeunload = function(event) {
//     return "Progress will be lost."
// }

TODO("Add error handling");

/** DOM elements of the document */
var elems; 
/** Engine object */
var engine;
var gameStarted; /** boolean for if the game has started */

/**
 * Called at the end of body after it's loaded
 * Populates elems and initializes event listeners
 */
function loaded(){
    engine = new Engine;
    elems = {
        menu : document.getElementById('menu'),
        container : document.getElementById('container'),
        statusBar : {
            numBombs : document.getElementById('numBombs'),
            title    : document.getElementById('title'),
            resetBtn : document.getElementById('resetBtn'),
            flagBtn  : document.getElementById('flagBtn'),
            numMoves : document.getElementById('numMoves'),
        },
        modes : {
            easy : {
                button: document.getElementById('easyModeBtn'),
                rows: 15,
                cols: 20,
                bombs: 17
            },
            medium : {
                button: document.getElementById('mediumModeBtn'),
                rows: 16,
                cols: 32,
                bombs: 21
            },
            hard : {
                button: document.getElementById('hardModeBtn'),
                rows: 20,
                cols: 44,
                bombs: 32
            }
        }
    }

    initListener(elems.statusBar.flagBtn, "click", engine.toggleFlagging);

    for(var mode in elems.modes){
        initListener(elems.modes[mode].button, "click",      start);
        initListener(elems.modes[mode].button, "mouseover",  handleModeButtonHover);
        initListener(elems.modes[mode].button, "mouseleave", handleModeButtonUnHover);
    }  
    console.info("Page Elements Loaded");
}

/**
 * Recieves a click event from one of the three mode buttons in the main menu.
 * Creates a new Engine object and starts it.
 * 
 * @param {HTMLElement} event - click event recieved from the mode button
 */
function start(event) {
    engine.start(event);
    gameStarted = engine.gameStarted();
}

/**
 * 
 * @param {HTMLElement} element - HTMLElement to listen for events on 
 * @param {String} type         - Case sensitive string representing an Event type
 * @param {Function} callback   - callback function that handles the event 
 */
function initListener(element, type, callback) {
    element.addEventListener(type, callback);
}

/**
 * Callback for when a mode button is hovered on.
 * Displays the dimensions of the playing field on hover.
 * @param {Event} event - mosueover event on a mode button
 */
function handleModeButtonHover(event) {
    var mode = event.target.innerHTML.toLowerCase();
    var bombs = elems.statusBar.numBombs.children[0].innerHTML;

    switch (mode) {
        case 'easy':
        case 'medium':
        case 'hard':
            var game_mode = elems.modes[mode];
            bombs = game_mode.bombs;
            this.children[1].innerHTML = game_mode.rows + " × " + game_mode.cols;
            break;
    
        default:
            break;
    }

    this.children[0].classList.add("hide");
    this.children[1].classList.remove("hide");
    elems.statusBar.numBombs.children[0].innerHTML = bombs;
}

/**
 * Callback for when a the mouse leaves a mode button.
 * Displays the difficulty of the button's respective mode.
 * @param {Event} event - mouseleave event on a mode button
 */
function handleModeButtonUnHover(event) {
    if(!gameStarted){
        this.children[0].classList.remove("hide");
        this.children[1].classList.add("hide");
        elems.statusBar.numBombs.children[0].innerHTML = "&nbsp0";
    }
}


/**
 * Callback for when a the mouse is clicked on a cell.
 * Does nothing right now
 * 
 * @param {Event} event - click event on a cell
 */
function handleCellClick(event) {
    //left click / single tap
    engine.handleSelection(this);

    //right click / hold
};

/**
 * Personal helper function to remind what still needs to be done
 * @param {String} todo - the string to output onto the console
 */
function TODO(todo){
    console.warn(todo);
}