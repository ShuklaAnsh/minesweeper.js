/** An object that controls the game's mechanics */
var Engine = function() {
    /*  TODO */
    TODO('Make grid its own Graph Object that takes in a DOM in a new js file (like cell.js)');
    TODO('Grid DOM from div to canvas for performance');
    this.grid = document.createElement('div'), /** div that holds all the cells */
    /** Game object that holds the games configurations */
    this.game = {
        moves: 0,
        bombs: 0, 
        started: false, /** Boolean for if the game has started or not */
        flagging: false /** Boolean for if the selection is for flagging or sniffing */
    };

    this.cells = [];    /** Cell array used as a Graph */ TODO("add to Graph object");

    /**
     * Recieves a click event from one of the three mode buttons in the main menu
     * and initializes the game based on that mode.
     * 
     * @param {Event} - Click event recieved from a mode button
     */
    this.start = function(event) {
        var infoID = event.target.id; /** ID of the button hit ( easyMode, mediumMode, or hardMode ) */
        var mode = infoID.substring(0, infoID.length - 4);
        switch (mode) {
            case 'easy':
            case 'medium':
            case 'hard':
                this.initGame(mode);
                this.started = true;
            break;
            
            default:
            break;
        }
        initListener(elems.statusBar.resetBtn, "click", this.reset);
        initListener(elems.statusBar.flagBtn,  "click", this.toggleFlagging);
    };

    this.gameStarted = function() {
        return this.game.started;
    }

    /**
     * Initializes the game with the recieved mode
     * and then calls to initialize the grid.
     * 
     * @param {String} mode - "easy, medium, or hard"
     */
    this.initGame = function(mode) {
        this.game.mode = elems.modes[mode];
        elems.statusBar.title.classList.add("hide");
        elems.statusBar.resetBtn.classList.remove("hide");
        elems.statusBar.resetBtn.classList.add("statusBarButton");
        elems.statusBar.flagBtn.classList.remove("hide");
        elems.statusBar.flagBtn.classList.add("statusBarButton");
        this.game.bombs = this.game.mode.bombs;
        this.initGrid();
    };

    /**
     * Initializes the grid based on the game configurations
     * and then calls to initialize the cells.
     */
    this.initGrid = function() {
        var rows = this.game.mode.rows;
        var cols = this.game.mode.cols;
        /** Hide main menu */
        elems.menu.style.display = 'none';

        this.grid.setAttribute("id", "gameboard");
        var gridTemplateColumns = '';
        var gridTemplaterows = '';
        for(var i = 0; i < cols; i++){
            gridTemplateColumns += 'auto ';
        }
        var gridTemplaterows = '';
        for(var i = 0; i < rows; i++){
            gridTemplaterows += 'auto ';
        }
        this.grid.style.gridTemplateColumns = gridTemplateColumns;
        this.grid.style.gridTemplaterows = gridTemplaterows;
        elems.container.appendChild(this.grid);
        
        this.initCells(rows, cols);
    };

    /**
     * Initializes the Cells based on the game configurations and current window display
     * 
     * @param {Number} rows - Number of rows for this game
     * @param {Number} cols - Number of cols for this game
     */
    this.initCells = function(rows, cols) {
        var padding = 50;
        var max_width = Math.floor( (elems.container.scrollWidth - padding) / cols ); // - grid gap
        var max_height = Math.floor( (elems.container.scrollHeight  - padding) / rows ); // - grid gap
        var length = Math.min(max_width, max_height) - 1; // cell gap
        var cell_id = 0;
        for(var row = 0; row < rows; row++){
            var cell_row = [];
            for(var col = 0; col < cols; col++){
                var cell = document.createElement('div');
                cell.setAttribute("id", cell_id);
                cell.style.width = length + 'px';
                cell.style.height = length + 'px';
                cell.setAttribute("class", "cell");
                this.grid.appendChild(cell);
                initListener(cell, "click", handleCellClick);
                cell_id++;
                cell_row.push(new Cell(cell, row, col));
            }
            this.cells.push(cell_row);
        }
        this.initCellNeighbours(rows, cols);
    };

    /**
     * Initializes each cell's neighbour object
     * Used for bfs
     * 
     * @param {Number} rows - Number of rows for this game
     * @param {Number} cols - Number of cols for this game
     */
    this.initCellNeighbours = function(rows, cols){
        var m_border_cell = null;
        for (var x = 0; x < cols; x++) {
            for (var y = 0; y < rows; y++) {
                var cell = this.cells[y][x];
                //corner conditions
                if ( ( x == 0 ) && ( y == 0 )) {
                    //top-left
                    var right = this.cells[y][x+1];
                    var bottom = this.cells[y+1][x];
                    var bottom_right = this.cells[y+1][x+1];
                    cell.addNeighbours(m_border_cell, m_border_cell, m_border_cell, m_border_cell, right, bottom_right, bottom, m_border_cell);
                    right.neighbours.left = cell;
                    bottom_right.neighbours.top_left = cell;
                    bottom.neighbours.top = cell;
                } else if ( ( x == (cols-1) ) && ( y == 0 )) {
                    //top-right
                    var left = this.cells[y][x-1];
                    var bottom = this.cells[y+1][x];
                    var bottom_left = this.cells[y+1][x-1];
                    cell.addNeighbours(left, m_border_cell, m_border_cell, m_border_cell, m_border_cell, m_border_cell, bottom, bottom_left);
                    bottom.neighbours.top = cell;
                    bottom_left.neighbours.top_right = cell;
                    left.neighbours.right = cell;
                } else if ( ( x == (cols-1) ) && ( y == (rows-1) )) {
                    //bottom-right
                    var top = this.cells[y-1][x];
                    var left = this.cells[y][x-1];
                    var top_left = this.cells[y-1][x-1];
                    cell.addNeighbours(left, top_left, top, m_border_cell, m_border_cell, m_border_cell, m_border_cell, m_border_cell);
                    left.neighbours.right = cell;
                    top.neighbours.bottom = cell;
                    top_left.neighbours.bottom_right = cell;
                } else if ( ( x == 0 ) && ( y == (rows-1) )) {
                    //bottom-left
                    var right = this.cells[y][x+1];
                    var top = this.cells[y-1][x];
                    var top_right = this.cells[y-1][x+1];
                    cell.addNeighbours(m_border_cell, m_border_cell, top, top_right, right, m_border_cell, m_border_cell, m_border_cell);
                    right.neighbours.left = cell;
                    top.neighbours.bottom = cell;
                    top_right.neighbours.bottom_left = cell;
                } else if (x == 0){
                    //border conditions
                    //left border
                    var top = this.cells[y-1][x];
                    var top_right = this.cells[y-1][x+1];
                    var right = this.cells[y][x+1];
                    var bottom_right = this.cells[y+1][x+1];
                    var bottom = this.cells[y+1][x];
                    cell.addNeighbours(m_border_cell, m_border_cell, top, top_right, right, bottom_right, bottom, m_border_cell);
                    top.neighbours.bottom = cell;
                    top_right.neighbours.bottom_left = cell;
                    right.neighbours.left = cell;
                    bottom_right.neighbours.top_left = cell;
                    bottom.neighbours.top = cell;
                } else if (y == 0) {
                    //top border
                    var left = this.cells[y][x-1];
                    var right = this.cells[y][x+1];
                    var bottom_right = this.cells[y+1][x+1];
                    var bottom = this.cells[y+1][x];
                    var bottom_left = this.cells[y+1][x-1];
                    cell.addNeighbours(left, m_border_cell, m_border_cell, m_border_cell, right, bottom_right, bottom, bottom_left);
                    left.neighbours.right = cell;
                    right.neighbours.left = cell;
                    bottom_right.neighbours.top_left = cell;
                    bottom.neighbours.top = cell;
                    bottom_left.neighbours.top_right = cell;
                } else if (x == (cols-1)) {
                    //right border
                    var left = this.cells[y][x-1];
                    var top_left = this.cells[y-1][x-1];
                    var top = this.cells[y-1][x];
                    var bottom = this.cells[y+1][x];
                    var bottom_left = this.cells[y+1][x-1];
                    cell.addNeighbours(left, top_left, top, m_border_cell, m_border_cell, m_border_cell, bottom, bottom_left);
                    left.neighbours.right = cell;
                    top_left.neighbours.bottom_right = cell;
                    top.neighbours.bottom = cell;
                    bottom.neighbours.top = cell;
                    bottom_left.neighbours.top_right = cell;
                } else if (y == (rows-1)) {
                    //bottom border
                    var left = this.cells[y][x-1];
                    var top_left = this.cells[y-1][x-1];
                    var top = this.cells[y-1][x];
                    var top_right = this.cells[y-1][x+1];
                    var right = this.cells[y][x+1];
                    cell.addNeighbours(left, top_left, top, top_right, right, m_border_cell, m_border_cell, m_border_cell);
                    left.neighbours.right = cell;
                    top_left.neighbours.bottom_right = cell;
                    top.neighbours.bottom = cell;
                    top_right.neighbours.bottom_left = cell;
                    right.neighbours.left = cell;
                } else {
                    //everything else
                    var left = this.cells[y][x-1];
                    var top = this.cells[y-1][x];
                    var right = this.cells[y][x+1];
                    var bottom = this.cells[y+1][x];
                    var top_left = this.cells[y-1][x-1];
                    var top_right = this.cells[y-1][x+1];
                    var bottom_left = this.cells[y+1][x-1];
                    var bottom_right = this.cells[y+1][x+1];
                    cell.addNeighbours(left, top_left, top, top_right, right, bottom_right, bottom, bottom_left);
                    left.neighbours.right = cell;
                    top.neighbours.bottom = cell;
                    right.neighbours.left = cell;
                    bottom.neighbours.top = cell;
                    bottom_right.neighbours.top_left = cell;
                    bottom_left.neighbours.top_right = cell;
                    top_right.neighbours.bottom_left = cell;
                    top_left.neighbours.bottom_right = cell;
                }
            }
        }
    };

    /**
     * initializes bombs on the board
     * 
     * @param cell - starting cell, cant be the bomb
     */
    this.initBombs = function(cell) {
        for (var i = 0; i < this.game.mode.bombs; i++){
            var randomCol = Math.ceil(Math.random() * this.game.mode.cols) - 1;
            var randomRow = Math.ceil(Math.random() * this.game.mode.rows) - 1;
            var bomb_cell = this.cells[randomRow][randomCol];
            if(bomb_cell.x == cell.x && bomb_cell.y == cell.y)
            {
                i--;
                continue;
            }
            bomb_cell.is_bomb = true;
        };
        this.cells.forEach(cellRow => {
            cellRow.forEach(cell => {
                for(neighbour in cell.neighbours){
                    if(cell.neighbours[neighbour] && cell.neighbours[neighbour].is_bomb){
                        cell.proximity++;
                    }
                };
                var proximity = document.createElement('p');
                proximity.setAttribute("class", "proximityText");
                if(cell.proximity > 0){
                    proximity.innerHTML = cell.proximity;
                    proximity.style.lineHeight = cell.cell_elem.style.width;
                    proximity.style.fontSize = '75%';
                    cell.cell_elem.appendChild(proximity);
                }
            });
        });
    };

    /**
     * Handles mouse click based on the cell clicked
     * @param {String} cell_elem - the html element
     */
    this.handleSelection = function(cell_elem) {
        if(cell_elem.classList.contains('snooped')) {
            console.log("Snooped");
            return;
        };
        if(cell_elem.classList.contains('flagged') && !this.game.flagging) {
            console.log("Flagged");
            return;
        };
        elems.statusBar.numMoves.children[0].innerHTML = ++this.game.moves;
        console.log('move: ' + this.game.moves);
        cell_elem_id = parseInt(cell_elem.id);
        var row = Math.floor(cell_elem_id / this.game.mode.cols);
        var col = cell_elem_id % this.game.mode.cols;
        var cell = this.cells[row][col];
        
        if(this.game.moves == 1){
            console.log('first move, bombs: ' + this.game.bombs);
            elems.statusBar.numBombs.children[0].innerHTML = this.game.bombs;
            this.initBombs(cell);
        }

        if(this.game.flagging){
            console.log("flagging");
            if(cell.flagged){
                this.game.bombs++;
                cell.flagged = false;
                cell.cell_elem.classList.remove('flagged');
            } else {
                this.game.bombs--;
                cell.flagged = true;
                cell.cell_elem.classList.add('flagged');
                if(this.game.bombs === 0){
                    if(this.checkFlags()){
                        TODO("Game over - Win");
                        alert("WINNER!");
                    }
                }
            }
            elems.statusBar.numBombs.children[0].innerHTML = this.game.bombs;
        } else {    
            console.log("Cell ( %d, %d ): bomb: %s\n", cell.x, cell.y, cell.is_bomb ? "true" : "false");
            if(cell.is_bomb) {
                this.gameOver(cell);
            } else {
                this.search(cell);
            }
        }
        this.printBoard();
    };
    
    /**
     * Game Over
     * 
     * @param cell - losing cell
     */
    this.gameOver = function(cell){
        TODO('unveil all');
        console.log("GAME OVER");
    };
    
    /**
     * bfs search
     * @param cell - cell that the bfs starts at
     */
    this.search = function(cell){    
        //base case
        if(!cell || cell.snooped || cell.flagged)
        {
            return;
        }
        cell.snooped = true;
        cell.cell_elem.classList.add('snooped');
        if(cell.proximity > 0) {
            return;
        } else {
            for(neighbour in cell.neighbours){
                this.search(cell.neighbours[neighbour]);
            };
        }
        return;
    };
    
    /**
     * Toggles flag selection or sniffing, called in main scope
     */
    this.toggleFlagging = function(){
        if(engine.game.flagging){
            engine.game.flagging = false;
            elems.statusBar.flagBtn.classList.remove('flagging');
            elems.statusBar.flagBtn.innerHTML = "FLAG";
        } else {
            engine.game.flagging = true;
            elems.statusBar.flagBtn.classList.add('flagging');
            elems.statusBar.flagBtn.innerHTML = "FLAGGING";
        }
    }
    
    /**
     * Resets the game.
     */
    this.reset = function(){
        TODO('reset')
        console.log("Game reset");
    };

    /**
     * Prints the board onto console.log
     */
    this.printBoard = function(){
        var board = '';
        this.cells.forEach(cellRow => {
            var row = '';
            cellRow.forEach(cell => {
                var cell_val = cell.is_bomb ? 'x' : cell.proximity;
                row += '[' + cell_val + '] ';
            })
            board += row + '\n';
        });
        console.log(board);
    };

    /**
     * Checks if the flagged cells are bombs.
     * @returns true if all flagged cells are bombs.
     */
    this.checkFlags = function(){
        var ret = true;
        this.cells.forEach(cellRow => {
            cellRow.forEach(cell => {
                if(cell.flagged && !cell.is_bomb){
                    ret = false;
                }
            });
        });
        return ret;
    };

};