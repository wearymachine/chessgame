var mongoose = require('mongoose');

var Boardgrids = new mongoose.Schema({
	row: Number,
	column: Number,
	piece: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Pieces'
		},
	team: String,
	type: String,
	pieceHist: [{type: mongoose.Schema.Types.ObjectId, ref: 'Pieces'}],
	teamHist: [String],
	typeHist: [String]
	});

var Pieces = new mongoose.Schema({
	type: String,
	team: String,
	alive: Boolean,
	row: Number,
	column: Number
});


var Boardgrids = mongoose.model('Boardgrids', Boardgrids);
var Pieces = mongoose.model('Pieces', Pieces);

module.exports = {
    Boardgrids: Boardgrids,
    Pieces: Pieces
};

// module.exports = mongoose.model('Boardgrids',Boardgrids);