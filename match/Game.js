var main = function(game) {

};

main.prototype = {
    //var game = new Phaser.Game(320, 480, Phaser.AUTO, '', { preload: preload, create: create });
    //this.game.scale.PageAlignHorizontally = true;
    //this.game.scale.PageAlignVertically = true;
    //this.game.scale.refresh();

    preload: function() {
        this.game.load.image('grey', 'assets/runeGrey.png');
        this.game.load.image('green', 'assets/runeGreen.png');
        this.game.load.image('red', 'assets/runeRed.png');
        this.game.load.image('yellow', 'assets/runeYellow.png');
        this.game.load.image('purple', 'assets/runePurple.png');
        this.game.load.image('dot', 'assets/dot.png');

        
        if (this.game.device.desktop) {
            this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            this.scale.minWidth = this.gameWidth / 2;
            this.scale.minHeight = this.gameHeight / 2;
            this.scale.maxWidth = this.gameWidth;
            this.scale.maxHeight = this.gameHeight;
            this.scale.pageAlignHorizontally = true;
            this.scale.pageAlignVertically = true;
            //this.scale.setScreenSize(true);
        } else {
            this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            this.scale.minWidth = this.gameWidth / 2;
            this.scale.minHeight = this.gameHeight / 2;
            this.scale.maxWidth = 2048; //You can change this to gameWidth*2.5 if needed            
            this.scale.maxHeight = 1228; //Make sure these values are proportional to the gameWidth and gameHeight            
            this.scale.pageAlignHorizontally = true;
            this.scale.pageAlignVertically = true;
            this.scale.forceOrientation(true, false);
            this.scale.hasResized.add(this.gameResized, this);
            this.scale.enterIncorrectOrientation.add(this.enterIncorrectOrientation, this);
            this.scale.leaveIncorrectOrientation.add(this.leaveIncorrectOrientation, this);
            //this.scale.setScreenSize(true);
        }

    },

    create: function() {

        var me = this;

        this.game.stage.backgroundColor = "34495f";

        this.tileTypes = [
            'empty',
            'grey',
            'green',
            'red',
            'yellow',
            'purple'
        ];

        this.tileGrid = [
            [null, null, null, null, null],
            [null, null, null, null, null],
            [null, null, null, null, null],
            [null, null, null, null, null],
            [null, null, null, null, null],
            [null, null, null, null, null],
            [null, null, null, null, null],
            [null, null, null, null, null]
        ];

        this.activeTile1 = null;
        this.activeTile2 = null;

        this.tileWidth = this.game.cache.getImage('grey').width;
        this.tileHeight = this.game.cache.getImage('grey').height;

        this.gridWidth = 5;
        this.gridHeight = 7;

        this.boardWidth = this.gridWidth * this.tileWidth;
        this.boardHeight = this.gridHeight * this.tileHeight;

        this.leftBumper = (this.game.width - this.boardWidth) / 2;
        this.topBumper = 60;

        this.tiles = this.game.add.group();
        this.fadeTiles = this.game.add.group();
        this.dots = this.game.add.group();


        var seed = Date.now();
        this.random = new Phaser.RandomDataGenerator([seed]);

        this.initBoard();

        //next row countdown
        this.dropBarProgress = 280;

        this.dropBar = this.add.bitmapData(280, 20);
        this.game.add.sprite(this.game.world.centerX - (this.dropBar.width / 2), 5, this.dropBar);

        this.game.add.tween(this).to({ dropBarProgress: 0 }, 5000, null, true, 0, -1);

        //point bar
        this.pointBarProgress = 0;
        this.pointBarGoal = 100;
        this.pointBarAdd = 0;

        this.pointBar = this.add.bitmapData(20, 480);
        this.points = this.game.add.sprite(0, this.game.height, this.pointBar);
        //this.points.anchor.setTo(0.5);
        this.points.scale.y = -1;


    },

    update: function() {
        //drop bar
        this.dropBar.context.clearRect(0, 0, this.dropBar.width, this.dropBar.height);

        this.dropBar.context.fillStyle = '#f00';

        this.dropBar.context.fillRect(0, 0, this.dropBarProgress, 20);

        this.dropBar.dirty = true;

        if (this.dropBarProgress == 0) {
            this.newTiles();
        }

        //point Bar
        this.pointBar.context.clearRect(0, 0, this.pointBar.width, this.pointBar.height);

        this.pointBar.context.fillStyle = '#f00';

        this.pointBar.context.fillRect(0, 0, 20, this.pointBarProgress * 4.8);

        this.pointBar.dirty = true;

        var me = this;

        //The user is currently dragging from a tile, so let's see if they have dragged
        //over the top of an adjacent tile
        if (me.activeTile1 && !me.activeTile2) {

            //Get the location of where the pointer is currently
            var hoverX = me.game.input.x;
            var hoverY = me.game.input.y;

            //Figure out what position on the grid that translates to
            var hoverPosX = Math.floor((hoverX - this.leftBumper) / me.tileWidth);
            var hoverPosY = Math.floor((hoverY - this.topBumper) / me.tileHeight);

            //See if the user had dragged over to another position on the grid
            var difX = (hoverPosX - me.startPosX);
            var difY = (hoverPosY - me.startPosY);
            //console.log(difY);

            //Make sure we are within the bounds of the grid
            if (!(hoverPosY > me.tileGrid[0].length - 1 || hoverPosY < 0) && !(hoverPosX > me.tileGrid.length - 1 || hoverPosX < 0)) {

                //If the user has dragged an entire tiles width or height in the x or y direction
                //trigger a tile swap
                if ((Math.abs(difY) == 1 && difX == 0) || (Math.abs(difX) == 1 && difY == 0)) {

                    //Prevent the player from making more moves whilst checking is in progress
                    //me.canMove = false;
                    if (this.game.input.activePointer.isDown) {
                        //Set the second active tile (the one where the user dragged to)
                        me.activeTile2 = me.tileGrid[hoverPosX][hoverPosY];

                        //Swap the two active tiles
                        me.swapTiles();

                        //After the swap has occurred, check the grid for any matches
                        me.game.time.events.add(500, function() {
                            me.checkMatch();
                        });

                    }


                }

            }

        }

        //console.log(this.game.input.x);


    },

    newTiles: function() {
        var me = this;

        for (var i = 0; i < this.gridWidth; i++) {
            if (this.tileGrid[i][0])
                console.log('lose');
            else {
                var tile = this.addTile(i, 0);

                this.tileGrid[i][0] = tile;
            }

        }

        this.dropTiles();

        this.game.time.events.add(600, function() {
            me.checkMatch();
        });
    },

    initBoard: function() {
        var me = this;

        //console.log(this.tileGrid.length);
        //console.log(this.tileGrid[0].length);

        for (var i = 0; i < this.gridWidth; i++) {
            for (var j = 2; j < this.gridHeight; j++) {
                //console.log(i);
                var tile = this.addTile(i, j);

                this.tileGrid[i][j] = tile;
            }
        }

        this.game.time.events.add(600, function() {
            me.checkMatch();
        });
    },

    addTile: function(x, y) {
        var tileToAdd = this.tileTypes[this.random.integerInRange(1, this.tileTypes.length - 1)];

        var tile = this.tiles.create((x * this.tileWidth) + (this.tileWidth / 2) + this.leftBumper, (y * this.tileHeight) + (this.tileHeight / 2) + this.topBumper, tileToAdd);


        tile.anchor.setTo(0.5, 0.5);

        tile.inputEnabled = true;

        tile.tileType = tileToAdd;

        tile.events.onInputDown.add(this.tilePress, this);

        return tile;
    },

    tilePress: function(tile, pointer) {
        var me = this;

        if (!this.activeTile1) {
            this.activeTile1 = tile;

            this.startPosX = (tile.x - (me.tileWidth / 2) - this.leftBumper) / me.tileWidth;
            this.startPosY = (tile.y - (me.tileHeight / 2) - this.topBumper) / me.tileHeight;
        } else if (this.activeTile1 && !this.activeTile2)
            this.activeTile2 = tile;

        tile.scale.setTo(1.1);
        this.swapTiles();
    },

    swapTiles: function() {

        var me = this;

        if (this.activeTile1 && this.activeTile2) {
            //var t1 = { x: ((this.activeTile1.x - this.tileWidth / 2) / this.tileWidth), y: (this.activeTile1.y - this.tileHeight / 2 ) / this.tileHeight };
            var t1 = { x: Math.floor((this.activeTile1.x - this.leftBumper) / this.boardWidth / (1 / this.gridWidth)), y: Math.floor((this.activeTile1.y - this.topBumper) / this.boardHeight / (1 / this.gridHeight)) };
            var t2 = { x: Math.floor((this.activeTile2.x - this.leftBumper) / this.boardWidth / (1 / this.gridWidth)), y: Math.floor((this.activeTile2.y - this.topBumper) / this.boardHeight / (1 / this.gridHeight)) };

            //console.log('active1: ' + this.activeTile1.tileType);
            //console.log('active2: ' + this.activeTile2.tileType);
            //console.log(t1);
            //console.log(t2);
            if ((Math.abs(t1.x - t2.x) == 1 && (Math.abs(t1.y - t2.y) == 0)) || (Math.abs(t1.x - t2.x) == 0 && (Math.abs(t1.y - t2.y) == 1))) {
                this.tileGrid[t1.x][t1.y] = this.activeTile2;
                this.tileGrid[t2.x][t2.y] = this.activeTile1;

                this.game.add.tween(this.activeTile1).to({ x: t2.x * this.tileWidth + (this.tileWidth / 2) + 25, y: t2.y * this.tileHeight + (this.tileHeight / 2) + this.topBumper }, 200, Phaser.Easing.Linear.In, true);
                this.game.add.tween(this.activeTile2).to({ x: t1.x * this.tileWidth + (this.tileWidth / 2) + 25, y: t1.y * this.tileHeight + (this.tileHeight / 2) + this.topBumper }, 200, Phaser.Easing.Linear.In, true);
            }

            console.log(this.pointBarProgress);

            this.deselect();
            this.game.time.events.add(250, function() {
                me.checkMatch();
            });

        }
    },

    getMatches: function(tileGrid) {
        var matches = [];
        var groups = [];

        //Check for horizontal matches
        for (var i = 0; i < tileGrid.length; i++) {
            var tempArr = tileGrid[i];
            groups = [];
            for (var j = 0; j < tempArr.length; j++) {
                if (j < tempArr.length - 2)
                    if (tileGrid[i][j] && tileGrid[i][j + 1] && tileGrid[i][j + 2]) {
                        if (tileGrid[i][j].tileType == tileGrid[i][j + 1].tileType && tileGrid[i][j + 1].tileType == tileGrid[i][j + 2].tileType) {
                            if (groups.length > 0) {
                                if (groups.indexOf(tileGrid[i][j]) == -1) {
                                    matches.push(groups);
                                    groups = [];
                                }
                            }

                            if (groups.indexOf(tileGrid[i][j]) == -1) {
                                groups.push(tileGrid[i][j]);
                            }
                            if (groups.indexOf(tileGrid[i][j + 1]) == -1) {
                                groups.push(tileGrid[i][j + 1]);
                            }
                            if (groups.indexOf(tileGrid[i][j + 2]) == -1) {
                                groups.push(tileGrid[i][j + 2]);
                            }
                        }
                    }
            }
            if (groups.length > 0) matches.push(groups);
        }

        //Check for vertical matches
        for (j = 0; j < tileGrid.length; j++) {
            var tempArr = tileGrid[j];
            groups = [];
            for (i = 0; i < tempArr.length; i++) {
                if (i < tempArr.length - 2)
                    if (tileGrid[i][j] && tileGrid[i + 1][j] && tileGrid[i + 2][j]) {
                        if (tileGrid[i][j].tileType == tileGrid[i + 1][j].tileType && tileGrid[i + 1][j].tileType == tileGrid[i + 2][j].tileType) {
                            if (groups.length > 0) {
                                if (groups.indexOf(tileGrid[i][j]) == -1) {
                                    matches.push(groups);
                                    groups = [];
                                }
                            }

                            if (groups.indexOf(tileGrid[i][j]) == -1) {
                                groups.push(tileGrid[i][j]);
                            }
                            if (groups.indexOf(tileGrid[i + 1][j]) == -1) {
                                groups.push(tileGrid[i + 1][j]);
                            }
                            if (groups.indexOf(tileGrid[i + 2][j]) == -1) {
                                groups.push(tileGrid[i + 2][j]);
                            }
                        }
                    }
            }
            if (groups.length > 0) matches.push(groups);
        }

        return matches;
    },

    checkMatch: function() {
        var me = this;

        var matches = this.getMatches(this.tileGrid);

        // console.log(matches);

        if (matches.length > 0) {

            this.removeTileGroup(matches);

            me.dropTiles();

            this.game.time.events.add(600, function() {
                me.checkMatch();
            });

            this.game.add.tween(this).to({ pointBarProgress: this.pointBarProgress + this.pointBarAdd }, 500, Phaser.Easing.Linear.In, true);
            this.pointBarAdd = 0;
        }



    },

    removeTileGroup: function(matches) {

        var me = this;

        //Loop through all the matches and remove the associated tiles
        for (var i = 0; i < matches.length; i++) {
            var tempArr = matches[i];

            for (var j = 0; j < tempArr.length; j++) {

                var tile = tempArr[j];
                //Find where this tile lives in the theoretical grid
                var tilePos = me.getTilePos(me.tileGrid, tile);

                var tileFade = this.fadeTiles.create(tile.x, tile.y, tile.tileType);
                tileFade.anchor.setTo(0.5, 0.5);

                var tween = this.game.add.tween(tileFade);

                tween.to({ alpha: 0 }, 500, Phaser.Easing.Linear.None, true, 0, 0, false);

                tween.onComplete.add(function() {
                    me.fadeTiles.remove(tileFade);
                });

                this.scoreDots(tile.x, tile.y);

                //Remove the tile from the screen
                me.tiles.remove(tile);

                this.pointBarAdd++;


                //Remove the tile from the theoretical grid
                if (tilePos.x != -1 && tilePos.y != -1) {
                    me.tileGrid[tilePos.x][tilePos.y] = null;
                }

            }
        }
    },

    getTilePos: function(tileGrid, tile) {
        var pos = { x: -1, y: -1 };

        //Find the position of a specific tile in the grid
        for (var i = 0; i < tileGrid.length; i++) {
            for (var j = 0; j < tileGrid[i].length; j++) {
                //There is a match at this position so return the grid coords
                if (tile == tileGrid[i][j]) {
                    pos.x = i;
                    pos.y = j;
                    break;
                }
            }
        }

        return pos;
    },

    dropTiles: function() {

        var me = this;

        //Loop through each column starting from the left
        for (var i = 0; i < me.tileGrid.length; i++) {

            //Loop through each tile in column from bottom to top
            for (var j = me.tileGrid[i].length - 1; j > 0; j--) {

                //If this space is blank, but the one above it is not, move the one above down
                if (me.tileGrid[i][j] == null && me.tileGrid[i][j - 1] != null) {
                    //Move the tile above down one
                    var tempTile = me.tileGrid[i][j - 1];
                    me.tileGrid[i][j] = tempTile;
                    me.tileGrid[i][j - 1] = null;

                    me.game.add.tween(tempTile).to({ y: (me.tileHeight * j) + (me.tileHeight / 2) + this.topBumper }, 200, Phaser.Easing.Linear.In, true);

                    //The positions have changed so start this process again from the bottom
                    //NOTE: This is not set to me.tileGrid[i].length - 1 because it will immediately be decremented as
                    //we are at the end of the loop.
                    j = me.tileGrid[i].length;
                }
            }
        }

    },

    deselect: function() {
        this.activeTile1.scale.setTo(1);
        this.activeTile2.scale.setTo(1);

        this.activeTile1 = null;
        this.activeTile2 = null;
    },

    scoreDots: function(x, y) {
        var me = this;

        var dot = this.dots.create(x - this.tileWidth / 2, y - this.tileHeight / 2, 'dot');

        var tween = this.game.add.tween(dot).to({ x: 0, y: 480 }, 400, Phaser.Easing.Linear.In, true);

        tween.onComplete.add(function() {
            me.dots.remove(dot);
        });
    }

}
