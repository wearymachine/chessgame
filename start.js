var mongoose = require('mongoose');
var bluebird = require('bluebird');
var gridExports = require('./server/models/grid.js');
var Boardgrids = gridExports['Boardgrids'];
var Pieces = gridExports['Pieces'];

mongoose.connect('mongodb://localhost/boardgrid');

var server = require('./server');

//Create the array 'board' of 'gridPiece' objects with 64 total objects
var board = [];
for(var x=1;x<9;x++)
{
	for(var y=1;y<9;y++)
	{
		var gridPiece = {};
		gridPiece['row'] = x;
		gridPiece['column'] = y;
        gridPiece['piece'] = null;
        gridPiece['team'] = null;
        gridPiece['type'] = null;
        gridPiece['pieceHist'] = [];
        gridPiece['teamHist'] = [];
        gridPiece['typeHist'] = [];
        board.push(gridPiece);
	}
}

//Create the array 'pieces' of 'piece' objects for each and every chess piece
var pieces = [];

//Pawns first for the front row
for(var x=1;x<17;x++)
{
    var piece = {};
    piece['type'] = 'Pawn';
    if(x%2===1)
    {
        piece['team'] = 'Black';
    }
    else
    {
        piece['team'] = 'White';
    }
    piece['alive'] = true;
    if(piece['team'] === 'Black')
    {
        piece['row'] = 2;
    }
    else
    {
        piece['row'] = 7;
    }
    piece['column'] = Math.ceil(x/2);
    pieces.push(piece);
}

//Back row next

for(var y=1;y<17;y++)
{
    var piece = {};
    var typeDet = Math.ceil(y/2);
    var teamDet = y%2;
    //Get the type first
    if((typeDet === 1) || (typeDet === 8))
    {
        piece['type'] = 'Rook';
    }
    else if((typeDet === 2) || (typeDet === 7))
    {
        piece['type'] = 'Knight';
    }
    else if((typeDet === 3) || (typeDet === 6))
    {
        piece['type'] = 'Bishop';
    }
    else if(typeDet === 4)
    {
        piece['type'] = 'Queen';
    }
    else
    {
        piece['type'] = 'King';
    }

    //Get team next, staying consistent with pawn method
    if(teamDet === 1)
    {
        piece['team'] = 'Black';
    }
    else
    {
        piece['team'] = 'White';
    }

    //Surely they're alive.. TO START MWAHAHAHAHA
    piece['alive'] = true;

    //Get row next
    if(piece['team'] === 'Black')
    {
        piece['row'] = 1;
    }
    else
    {
        piece['row'] = 8;
    }

    //Turns out typeDet is pretty much your column.. should've just written it that way.. oh well
    piece['column'] = typeDet;
    pieces.push(piece);
}

var wipeBoardDB = function () {

    var models = [Boardgrids];

    models.forEach(function (model) {
        model.find({}).remove(function () {});
    });

    return bluebird.resolve();

};

var boardSeed = function () {

    Boardgrids.create(board, function (err) {
        if (err) {
            console.error(err);
        }
        console.log('Board seeded!');
        // process.kill(0);
    });

};

var wipePieceDB = function () {

    var models = [Pieces];

    models.forEach(function (model) {
        model.find({}).remove(function () {});
    });

    return bluebird.resolve();

};

var pieceSeed = function () {

    Pieces.create(pieces, function (err) {
        if (err) {
            console.error(err);
        }
        console.log('Pieces seeded!');
    });

};



mongoose.connection.once('open', function () {
	wipeBoardDB().then(wipePieceDB()).then(boardSeed()).then(pieceSeed())
	.then(server.listen(3000, function () {
        console.log('All systems go on Port 3000!');
    }))
});