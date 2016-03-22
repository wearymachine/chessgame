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
			})
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

app.controller('borad',function($scope,$http,mainFactory) {
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
				console.log('pz',pieces);
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
			})
		}
	    
	}

	$scope.onDropComplete=function(data,evt){
		if($scope.playingGame && $scope.count%2===0)
		{
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
				console.log('way in the beg',$scope.board);
				mainFactory.convertBoard($scope.board)
				.then(function(info){
					if(movedPieceTeam === 'Black')
					{
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
						alert('one more move its ur funeral service');
					}
					//begin here for the AI part

					var tempPieces = $scope.pieces.slice();
					var movedYet = false;
					var possibleMoves = [];
					var possiblePiece = [];
					console.log('fuck up some commas');
					var temp = [];
					for(var r=0;r<$scope.board.length;r++)
					{
						temp[r] = [];
						for(var s=0;s<$scope.board[r].length;s++)
						{
							temp[r][s] = $scope.board[r][s];
						}
					}

while(movedYet === false)
{
    for(var x=0; x<tempPieces.length; x++)
    {
        var teamRef = tempPieces[x]['team'];
        if(teamRef==='Black')
        {
			var tempBoard = temp;
			var rowRef = tempPieces[x]['row'];
			var xRef = rowRef-1;
			var colRef = tempPieces[x]['column'];
			var yRef = colRef-1;
			var typeRef = tempPieces[x]['type'];
			var idRef = tempPieces[x]['_id'];
// 			var newRow = Math.ceil(8*Math.random());
// 			var newCol = Math.ceil(8*Math.random());

            //build up possibleLocs which is an array of [row,col] type of arrays on 1-8 scale
            var possibleLocs = [];
            if(typeRef==='Pawn')
            {
                var firstMove = [rowRef+1,colRef];
                possibleLocs.push(firstMove);
                var secondMove = [rowRef+2,colRef];
                possibleLocs.push(secondMove);
            }
            else if(typeRef==='Rook')
            {
                for(var g=1;g<8;g++)
                {
                    if(g !== rowRef)
                    {
                        possibleLocs.push([g,colRef])
                    }
                    if(g !== colRef)
                    {
                        possibleLocs.push([rowRef,g])
                    }
                }
            }
            console.log('before possibleLocs',$scope.board);
            for(var t=0; t<possibleLocs.length; t++)
            {
            	debugger;
            	tempBoard = $scope.board.slice();
            	if(tempBoard===$scope.board)
            	{
            		console.log('yeah')
            	}
            	else
            	{
            		console.log('thats not the problem');
            	}
                var newRow = possibleLocs[t][0];
                var newCol = possibleLocs[t][1];
			    var existingTeam = tempBoard[newRow-1][newCol-1]['team'];
			    var existingType = tempBoard[newRow-1][newCol-1]['type'];
			    var existingPiece = tempBoard[newRow-1][newCol-1]['piece'];
		    	var legitMove = mainFactory.moveChecker(tempBoard,typeRef,teamRef,existingTeam,existingPiece,newRow,newCol,rowRef,colRef);
		    	if(legitMove)
		    	{
		    	    tempBoard[xRef][yRef]['piece'] = null;
		    	    tempBoard[xRef][yRef]['team'] = null;
		    	    tempBoard[xRef][yRef]['type'] = null;
		    	    tempBoard[newRow-1][newCol-1]['piece'] = idRef;
		    	    tempBoard[newRow-1][newCol-1]['team'] = 'Black';
			        tempBoard[newRow-1][newCol-1]['type'] = typeRef;
			        debugger;
		    	    var doubletempPiece = tempPieces;
			        doubletempPiece[x]['row'] = newRow;
			        doubletempPiece[x]['column'] = newCol;
			        if(existingPiece)
			        {
			       		for(var i=0;i<doubletempPiece.length;i++)
			        	{
			    	    	if(doubletempPiece[i]['_id']===existingPiece)
			    	    	{
			    		    	doubletempPiece[i]['row'] = null;
			    		    	doubletempPiece[i]['column'] = null;
			   			    	doubletempPiece[i]['alive'] = false;
			   			    	break;
			   		    	}
			   		    }
			       	}
			        possibleMoves.push(tempBoard);
			        possiblePiece.push(doubletempPiece);
		    	    
			    }
            }

        }
    }

    if(possibleMoves.length > 0)
    {
         var ind2pick = Math.floor(possibleMoves.length*Math.random());
         console.log('len',possibleMoves.length);
         console.log('ind',ind2pick);
         // $scope.board = possibleMoves[ind2pick];
         // $scope.pieces = possiblePiece[ind2pick];
         console.log('boardconfigs',possibleMoves);
         movedYet = true;
         $scope.count++;
    }
 
}





				})

			}
			
	    }
	}


})



app.config(function($stateProvider,$urlRouterProvider){
	$urlRouterProvider.otherwise('/');
	$stateProvider.state('home', {
		url: '',
		templateUrl: 'index.html'
	})
	.state('person', {
		url: '/person',
		templateUrl: 'personGame.html',
		controller: 'board'
	})
	.state('comp', {
		url: '/machine',
		templateUrl: 'personGame.html',
		controller: 'borad'
	})
})
