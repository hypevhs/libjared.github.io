function ConnectFour() {
    "use strict";

    this.board = undefined;

    //called when the object is constructed
    this.ready = function() {
        this.board = new this.Board();
        this.registerHandlers();
        this.spit();
    };

    //subclass: construct a new board
    this.Board = function() {
        this.SLOT_NONE = 0;
        this.SLOT_BLUE = 1;
        this.SLOT_RED = 2;
        this.SIZEX = 7;
        this.SIZEY = 6;
        this.redsTurn = true; //red goes first
        this.slots = [];
        this.winState = false;
        this.catGameState = false;
        this.winningDirections = [];
        this.possiblePartsOfAWin = null;
        this.lastPlaced = null;
        
        //make board into a 2d array
        this.constructor = function () {
            var y, x;
            
            for (y = 0; y < this.SIZEY; y++) {
                this.slots[y] = [];
                for (x = 0; x < this.SIZEX; x++) {
                    this.slots[y][x] = this.SLOT_NONE;
                }
            }
        };
        
        //place the next piece at this column
        this.goHere = function(col) {
            var whereY = this.getFallSlot(col);
            if (whereY === null) {
                return; //column full
            }
            this.slots[whereY][col] =
                this.redsTurn ? this.SLOT_RED : this.SLOT_BLUE;
            
            this.lastPlaced = { x:col, y:whereY };
            
            if (this.isWinningMove(whereY, col)) {
                this.winState = true; //we have a winner
            } else if (this.isFilledBoard()) {
                this.catGameState = true; //we have two losers
            } else {
                this.redsTurn = !this.redsTurn; //next person
            }
        };
        
        //if I were to drop a piece in this column, where would it land?
        //return that position's y value (null if full)
        this.getFallSlot = function(col) {
            var y;
            //find first empty slot from the bottom
            for (y = this.SIZEY - 1; y >= 0; y--) {
                if (this.slots[y][col] === this.SLOT_NONE) {
                    return y;
                }
            }
            return null;
        };
        
        //return the number of like-colored slots in this direction
        //of the starting cell
        this.getLikeSlots = function(y, x, color, dir) {
            var nextPoint, nextColor;
            
            if (!this.isInBounds(y, x)) {
                //out of bounds, not even going to consider it
                console.log("... y="+y+" x="+x+" is OOB");
                return 0;
            }
            
            nextPoint = this.getDir(y, x, dir, 1);
            
            if (!this.isInBounds(nextPoint.y, nextPoint.x)) {
                //we've reached an endpoint
                console.log("... adjacent slot y="+nextPoint.y+" x="+nextPoint.x+" is OOB");
                return 0;
            }
            
            nextColor = this.slots[nextPoint.y][nextPoint.x];
            
            if (nextColor !== color) {
                //we've reached an endpoint
                console.log("... adjacent slot y="+nextPoint.y+" x="+nextPoint.x+" is "+nextColor+" instead of "+color);
                return 0;
            }
            
            console.log("... adjacent slot y="+nextPoint.y+" x="+nextPoint.x+" is good!!");
            
            //our neighbor is helping us to win, what about HIS neighbor
            return this.getLikeSlots(
                nextPoint.y, nextPoint.x, color, dir) + 1;
        };
        
        //did the move that was just placed cause a Connect 4?
        this.isWinningMove = function(y, x) {
            //directions ["r","ur","u","ul","l","dl","d","dr"]
            var colorToMatch, dir;
            
            colorToMatch = this.slots[y][x];
            console.log("AT y="+y+" x="+x+", need to find "+colorToMatch);
            
            //tally up like colors in all 8 directions
            this.possiblePartsOfAWin = [0,0,0,0,0,0,0,0];
            for (dir = 0; dir < 8; dir++) {
                this.possiblePartsOfAWin[dir] = this.getLikeSlots(
                    y, x, colorToMatch, dir);
            }
            
            console.log("this.possiblePartsOfAWin");
            console.log(this.possiblePartsOfAWin);
            
            this.markWinningDirections();
            
            console.log("this.winningDirections");
            console.log(this.winningDirections);
            
            return this.winningDirections.length > 0;
        };
        
        //using these tallies, check for win conditions in this order:
        //0 1 2 3
        //- / | \
        //then supply these results in winningDirections[max 4]
        this.markWinningDirections = function () {
            var dir, opp, dirVal, oppVal;
            
            this.winningDirections = []; //clear
            
            for (dir = 0; dir < 4; dir++) {
                opp = (dir + 4) % 8; //opposite angle
                dirVal = this.possiblePartsOfAWin[dir];
                oppVal = this.possiblePartsOfAWin[opp];
                
                //the 1 represents this slot
                if ((dirVal + 1 + oppVal) >= 4) {
                    this.winningDirections.push(dir);
                }
            }            
        };
        
        //is every slot in this board filled? (cat game if no win)
        this.isFilledBoard = function() {
            var y, x;
            
            for (y = 0; y < this.SIZEY; y++) {
                for (x = 0; x < this.SIZEX; x++) {
                    //found a slot, we can still play
                    if (this.slots[y][x] === this.SLOT_NONE) {
                        return false;
                    }
                }
            }
            return true;
        };
        
        //0  1  2  3  4  5  6  7
        //r  ur u  ul l  dl d  dr 
        //get a point n units away from slots[y][x] in the direction dir
        this.getDir = function(y, x, dir, n) {
            var newY = y, newX = x;
            
            if (dir === 1 || dir === 2 || dir === 3) {
                newY -= n; //up
            }
            if (dir === 5 || dir === 6 || dir === 7) {
                newY += n; //down
            }
            if (dir === 3 || dir === 4 || dir === 5) {
                newX -= n; //left
            }
            if (dir === 0 || dir === 1 || dir === 7) {
                newX += n; //right
            }
            
            return { y:newY, x:newX };
        };
        
        this.isInBounds = function(y,x) {
            var okY, okX;
            okY = y >= 0 && y < this.SIZEY;
            okX = x >= 0 && x < this.SIZEX;
            return okY && okX;
        };
        
        this.constructor();
    };

    //mousemove for the canvas
    this.registerHandlers = function() {
        var canvEl, realThis;
        
        canvEl = document.getElementById("c4canv");
        realThis = this;
        canvEl.onclick = function onclick(e) {
            var mouseX, widthOfOneCell;
            
            //someone won, no more clicky
            if (realThis.board.winState === true) {
                return;
            }
            
            //get column selected
            mouseX = e.offsetX || e.layerX;
            
            //offsetWidth is element width after applying CSS
            widthOfOneCell = e.target.offsetWidth / realThis.board.SIZEX;
            realThis.board.goHere(Math.floor(mouseX / widthOfOneCell));
            realThis.spit();
        };
    };

    //clear and rerender the canvas (and the text node)
    this.spit = function() {
        var textEl, canvasEl, ctx;
        
        textEl = document.getElementById("c4text");
        canvasEl = document.getElementById("c4canv");
        ctx = canvasEl.getContext("2d");
        
        //clear the screen
        ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
        
        //grid
        this.spitGrid(ctx, canvasEl);

        //slots 
        this.spitSlots(ctx, canvasEl);
        
        //winning lines
        if (this.board.winState) {
            this.spitWinLines(ctx, canvasEl);
        }
        
        //text
        this.spitText(textEl);
        
        console.log("===DONE SPIT===");
    };
    
    this.spitGrid = function (ctx, canvasEl) {
        var y, x, actualY, actualX;
        
        ctx.lineWidth = 1.5; //http://stackoverflow.com/a/9311835
        
        ctx.beginPath();
        for (y = 1; y < this.board.SIZEY; y++) {
            actualY = (y / this.board.SIZEY) * canvasEl.height;
            ctx.moveTo(0, actualY);
            ctx.lineTo(canvasEl.width, actualY);
        }
        for (x = 1; x < this.board.SIZEX; x++) {
            actualX = (x / this.board.SIZEX) * canvasEl.width;
            ctx.moveTo(actualX, 0);
            ctx.lineTo(actualX, canvasEl.height);
        }
        ctx.stroke();
    };
    
    this.spitSlots = function (ctx, canvasEl) {
        var y, x, whoOwns, centerX, centerY, radiusWidth, radiusHeight, radius;
        
        for (y = 0; y < this.board.SIZEY; y++) {
            for (x = 0; x < this.board.SIZEX; x++) {
                whoOwns = this.board.slots[y][x];
                if (whoOwns !== this.board.SLOT_NONE)
                {
                    centerX = ((x + 0.5) / this.board.SIZEX) * canvasEl.width;
                    centerY = ((y + 0.5) / this.board.SIZEY) * canvasEl.height;
                    radiusWidth = canvasEl.width / this.board.SIZEX / 2;
                    radiusHeight = canvasEl.height / this.board.SIZEY / 2;
                    radius = Math.min(radiusWidth, radiusHeight);
                    
                    ctx.beginPath();
                    ctx.fillStyle =
                        (whoOwns === this.board.SLOT_BLUE) ? "#00F" : "#F00";
                    ctx.arc(centerX, centerY, radius, 0, 2*Math.PI);
                    ctx.fill();
                }
            }
        }
    };
    
    this.spitWinLines = function (ctx, canvasEl) {
        var i, dir, opp, sizeOfOneCell,
        savedStrokeStyle, savedLineWidth, savedLineCap,
        ptOne, ptTwo;
        
        savedStrokeStyle = ctx.strokeStyle;
        savedLineWidth = ctx.lineWidth;
        savedLineCap = ctx.lineCap;
        
        ctx.strokeStyle = "#C45AEC";
        ctx.lineWidth = 5.5; //http://stackoverflow.com/a/9311835
        ctx.lineCap = "round";
        
        sizeOfOneCell = canvasEl.offsetWidth / this.board.SIZEX;
        
        ctx.beginPath();
        for (i = 0; i < this.board.winningDirections.length; i++) {
            dir = this.board.winningDirections[i];
            opp = dir + 4;
            
            ptOne = this.board.getDir(this.board.lastPlaced.y, this.board.lastPlaced.x, dir, this.board.possiblePartsOfAWin[dir]);
            ptTwo = this.board.getDir(this.board.lastPlaced.y, this.board.lastPlaced.x, opp, this.board.possiblePartsOfAWin[opp]);
            
            ctx.moveTo(ptOne.x * sizeOfOneCell + (sizeOfOneCell/2.0), ptOne.y * sizeOfOneCell + (sizeOfOneCell/2.0));
            ctx.lineTo(ptTwo.x * sizeOfOneCell + (sizeOfOneCell/2.0), ptTwo.y * sizeOfOneCell + (sizeOfOneCell/2.0));
        }
        ctx.stroke();
        
        ctx.strokeStyle = savedStrokeStyle;
        ctx.lineWidth = savedLineWidth;
        ctx.lineCap = savedLineCap;
    };
    
    this.spitText = function (textEl) {
        if (this.board.redsTurn) {
            textEl.className = "c4textred";
            if (this.board.winState) {
                textEl.innerHTML = "WINNER";
            } else if (this.board.catGameState) {
                textEl.innerHTML = "CAT GAME";
            } else {
                textEl.innerHTML = "It's red's turn.";
            }
        } else {
            textEl.className = "c4textblue";
            if (this.board.winState) {
                textEl.innerHTML = "WINNER";
            } else if (this.board.catGameState) {
                textEl.innerHTML = "CAT GAME";
            } else {
                textEl.innerHTML = "It's blue's turn.";
            }
        }
    };
}
