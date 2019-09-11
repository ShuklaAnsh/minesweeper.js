/** 
 * An object that holds all the information for a cell in the grid;
 * @typedef {Object} Cell
 * @param {HTMLElement} cell_elem - div for cell element
 * @param {Number} row  - grid row at which this cell is located
 * @param {Number} col  - grid col at which this cell is located
 */

var Cell = function(cell_elem, row, col) {
    this.cell_elem = cell_elem;       /** div for cell element */
    this.x = row;                     /** int for x position   */
    this.y = col;                     /** int for y position   */

    this.proximity = 0;       /** int for proximity                     */
    this.snooped = false;     /** bool for if the Cell has been visited */
    this.is_bomb = false;     /** bool for if the Cell is a bomb        */
    this.flagged = false;     /** bool for if the Cell is flagged       */

    /* Cell neighbours object */
    this.neighbours = {
        left : null,
        top_left : null,
        top : null,
        top_right : null,
        right : null,
        bottom_right : null,
        bottom : null,
        bottom_left : null
    }
}

/**
 * adds neighbours to the cell
 * @param {Cell} left          - cell to the left of the cell being added to
 * @param {Cell} top_left      - cell to the top left of the cell being added to
 * @param {Cell} top           - cell to the top of the cell being added to
 * @param {Cell} top_right     - cell to the top right of the cell being added to
 * @param {Cell} right         - cell to the right of the cell being added to
 * @param {Cell} bottom_right  - cell to the bottom right of the cell being added to
 * @param {Cell} bottom        - cell to the bottom of the cell being added to
 * @param {Cell} bottom_left   - cell to the bottom left of the cell being added to
 */
Cell.prototype.addNeighbours = function(left, top_left, top, top_right, right, bottom_right, bottom, bottom_left) {
    this.neighbours.left = left;
    this.neighbours.top_left = top_left;
    this.neighbours.top = top;
    this.neighbours.top_right = top_right;
    this.neighbours.right = right;
    this.neighbours.bottom_right = bottom_right;
    this.neighbours.bottom = bottom;
    this.neighbours.bottom_left = bottom_left;
}