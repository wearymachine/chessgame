var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var gridExports = require('./models/grid.js');
var Boardgrids = gridExports['Boardgrids'];
var Pieces = gridExports['Pieces'];
module.exports = app;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname,'../public')));
app.use(express.static(path.join(__dirname,'../node_modules')));


app.get('/',function(req,res,next){
	res.sendFile(path.join(__dirname,'../index.html'));
});

app.get('/board',function(req,res,next){
	Boardgrids.find({})
	.then(function(board){
		res.send(board);
	})
	.then(null,next);
});

app.get('/pieces',function(req,res,next){
	Pieces.find({})
	.then(function(pieces){
		res.send(pieces);
	})
	.then(null,next);
});

app.put('/board',function(req,res,next){
	Boardgrids.find({})
	.then(function(board){
		var promises = [];
		for(var x=0;x<board.length;x++)
		{
			var row = board[x]['row'];
			var col = board[x]['column'];
			for(var y=0;y<req.body.length;y++)
			{
				if((req.body[y]['row']===row) && (req.body[y]['column']===col))
				{
					var piece = req.body[y]['piece'];
					var team = req.body[y]['team'];
					var type = req.body[y]['type'];
					var pieceHist = req.body[y]['pieceHist'];
					var teamHist = req.body[y]['teamHist'];
					var typeHist = req.body[y]['typeHist'];
					break;
				}
			}
			board[x]['piece'] = piece;
			board[x]['team'] = team;
			board[x]['type'] = type;
			board[x]['pieceHist'] = pieceHist;
			board[x]['teamHist'] = teamHist;
			board[x]['typeHist'] = typeHist;
			var promise = new Promise(function(){
				return board[x].save();
			});
			promises.push(promise);
		}
		Promise.all(promises).then(res.send(board));
	}).then(null,next);
});

app.put('/pieces',function(req,res,next){
	Pieces.find({})
	.then(function(pieces){
		var promises = [];

		//update 'pieces' based on what's in req.body
		for(var x=0;x<pieces.length;x++)
		{
			var id = pieces[x]['_id'];
			for(var y=0;y<req.body.length;y++)
			{
				if(req.body[y]['_id'] == id)
				{
					pieces[x]['column'] = req.body[y]['column'];
					pieces[x]['row'] = req.body[y]['row'];
					pieces[x]['alive'] = req.body[y]['alive'];
					break;
				}
			}
			promises.push(pieces[x].save());
		}
		Promise.all(promises).then(res.redirect(''));

	})
	.then(null,next);
})

app.put('/board/:id',function(req,res,next){
	var row = req.params.board.substring(0,1);
	var col = req.params.board.substring(1,2);
	row = Number(row);
	col = Number(col);
	Pieces.find({row: row, column: col}).then(function(piece){
		var conditions = {row: row, column: col};
		var update = req.body;
		console.log(update);
		Boardgrids.update(conditions,update)
		.then(null,next);
		})
});

app.get('/:TeamType',function(req,res,next){
	var string2read = req.params.TeamType;
	var team = string2read.substring(0,1);
	var x=1;
	while(string2read.substring(x,x+1).toUpperCase() !== string2read.substring(x,x+1))
	{
		team += string2read.substring(x,x+1);
		x++;
	}
	var type = string2read.substring(x,string2read.length);
	Boardgrids.find({team: team, type: type})
	.then(function(piece){
		res.send(piece);
	})
	.then(null,next);

});

