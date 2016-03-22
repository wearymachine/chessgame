// var Boardgrids = require('../models/pieces.js');
var app = angular.module('chessapp',['ngDraggable','ui.router']);

app.controller('board',function($scope,$http,mainFactory) {
	$scope.board = [];
	$scope.boardActivated = false;
	$scope.count = 0;

	$scope.getAll = function()
	{
		if(!$scope.boardActivated)
		{
			return mainFactory.getBoard()
			.then(function(boardo){
				$scope.board = mainFactory.sortBoard(boardo.data);
				$scope.playingGame = true;
				$scope.boardActivated = true;
				return mainFactory.getPieces();
			})
			.then(function(pieces){
				$scope.pieces = pieces.data;
				for(var x=0;x<$scope.pieces.length;x++)
	        	{
	        		var row = $scope.pieces[x]['row'];
	        		row--;
	        		var col = $scope.pieces[x]['column'];
	        		col--;
	        		var id = $scope.pieces[x]['_id'];
	        		var team = $scope.pieces[x]['team'];
	        		var type = $scope.pieces[x]['type'];
	        		$scope.board[row][col]['piece'] = id;
	        		$scope.board[row][col]['team'] = team;
	        		$scope.board[row][col]['type'] = type;
	        		$scope.board[row][col]['pieceHist'].push(id);
	        		$scope.board[row][col]['teamHist'].push(team);
	        		$scope.board[row][col]['typeHist'].push(type);
	        	}
			}).then(null,next);
		}
	    
	}

	$scope.onDropComplete=function(data,evt){
		if($scope.playingGame)
		{
			console.log('data',data);
			console.log('this',this);
			console.log('event',evt);
			var landingRow = this.grid['row'];
			var landingCol = this.grid['column'];
			var movedPiece = data[0];
			var movedPieceTeam = data[1];
			var movedPieceType = data[2];
			var startingRow = data[3].grid['row'];
			var startingCol = data[3].grid['column'];
			var existingPieceOnLandLoc = $scope.board[landingRow-1][landingCol-1]['piece'];
			var existingTeamOnLandLoc = $scope.board[landingRow-1][landingCol-1]['team'];

			//if existing piece at landing location, find it in $scope.pieces to get reference to it
			if(existingPieceOnLandLoc)
			{
				for(var x=0;x<$scope.pieces.length;x++)
				{
					if(($scope.pieces[x]['row'] === landingRow) && ($scope.pieces[x]['column'] === landingCol))
					{
						var landingPieceArrayInd = x;
						break;
					}
				}
			}
			

			var goodToMove = mainFactory.moveChecker($scope.board,movedPieceType,movedPieceTeam,existingTeamOnLandLoc,existingPieceOnLandLoc,landingRow,landingCol,startingRow,startingCol);
			var correctTeam = mainFactory.rightTeamMove($scope.count,movedPieceTeam)
			
			//if(goodtoMove)
			if(goodToMove && correctTeam)
			{
				$scope.count++;
				//update $scope.pieces to show moved piece for just the piece moving from Point A to Point B
				for(var x=0;x<$scope.pieces.length;x++)
				{
					if(($scope.pieces[x]['row']=== startingRow) && ($scope.pieces[x]['column']===startingCol))
					{
						$scope.pieces[x]['row'] = landingRow;
						$scope.pieces[x]['column'] = landingCol;
						break;
					}
				}

				//Decrement to match array indicies on $scope.board since indicies are 0-7 for vals 1-8
				landingRow--;
				landingCol--;
				startingRow--;
				startingCol--;

				//end the game if the king has moved on to the next life
				if($scope.board[landingRow][landingCol]['type']==='King')
				{
					alert('CHECKMATE brah..',movedPieceTeam,' wins');
					$scope.playingGame = false;
				}

				//update $scope.board to merely move the piece from Point A to Point B
				$scope.board[startingRow][startingCol]['piece'] = null;
				$scope.board[startingRow][startingCol]['team'] = null;
				$scope.board[startingRow][startingCol]['type'] = null;
				$scope.board[landingRow][landingCol]['piece'] = movedPiece;
				$scope.board[landingRow][landingCol]['type'] = movedPieceType;
				$scope.board[landingRow][landingCol]['team'] = movedPieceTeam;

				//save all currenty piece team and type to the history of the board
				for(var x=0;x<$scope.board.length;x++)
				{
					for(var y=0;y<$scope.board[x].length;y++)
					{
						$scope.board[x][y]['pieceHist'].push($scope.board[x][y]['piece']);
						$scope.board[x][y]['teamHist'].push($scope.board[x][y]['team']);
						$scope.board[x][y]['typeHist'].push($scope.board[x][y]['type']);
					}
				}

				//if there was a piece at the landing location, kill it in $scope.pieces
				if(existingPieceOnLandLoc)
				{
					console.log($scope.pieces[landingPieceArrayInd]);
					$scope.pieces[landingPieceArrayInd]['row'] = null;
					$scope.pieces[landingPieceArrayInd]['column'] = null;
					$scope.pieces[landingPieceArrayInd]['alive'] = false;
				}
				

				if((movedPieceTeam==='White' && movedPieceType==='Pawn' && landingRow === 0) || (movedPieceTeam==='Black' && movedPieceType==='Pawn' && landingRow === 7))
				{
					var badanswer = true;
					while(badanswer)
					{
						var ans = prompt('you reached the end of the board.. what u wanna be??');
						ans = ans.toLowerCase();
						if(ans==='queen' || ans==='pawn' || ans==='rook' || ans==='knight' || ans==='bishop')
						{
							badanswer = false;
						}
					}
					ans=ans[0].toUpperCase()+ans.substring(1,ans.length);
					$scope.board[landingRow][landingCol]['type'] = ans;
				}

				mainFactory.convertBoard($scope.board)
				.then(function(info){
					if(movedPieceTeam === 'Black')
					{
						//the function to check for checks.. yeah the wording sounds weird.. get over it
						return mainFactory.homelandSecurity($scope.board,'White','King');
					}
					else if(movedPieceTeam === 'White')
					{
						return mainFactory.homelandSecurity($scope.board,'Black','King');
					}
				})
				.then(function(threat) {
					if(threat===true)
					{
						//if there's check, then a message from the Department of Homeland Security
						alert('Dept. of Homeland Security says CHECK!!!');
					}
					
				})

			}
			
	    }
	}


})


// app.config(function($stateProvider,$urlRouterProvider){
// 	$urlRouterProvider.otherwise('/');
// 	$stateProvider.state('home', {
// 		url: '',
// 		templateUrl: 'index.html'
// 	})
// 	.state('person', {
// 		url: '/person',
// 		templateUrl: 'personGame.html',
// 		controller: 'board'
// 	})
// 	.state('comp', {
// 		url: '/machine',
// 		templateUrl: 'compGame.html',
// 		controller: 'borad'
// 	})
// })
