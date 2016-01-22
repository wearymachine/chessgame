// var Boardgrids = require('../models/pieces.js');
var app = angular.module('chessapp',['ngDraggable']);

app.controller('board',function($scope,$http) {
	$scope.board = [];
	$scope.boardActivated = false;
	$scope.count = 0;

	var convertBoard = function()
	{
		var outData = [];
    	for(var x=0;x<$scope.board.length;x++)
    	{
    		for(var y=0;y<$scope.board[x].length;y++)
    		{
    			outData.push($scope.board[x][y]);
    		}
    	}
    	// console.log('then ',outData);

    	return $http.put('/board',outData).then(function(){
    		console.log('we don');
    	})
	}

	$scope.getAll = function()
	{
		if(!$scope.boardActivated)
		{
			$scope.playingGame = true;
			$scope.boardActivated = true;
			return $http.get('/board')
	   		 .then(function(board){
	    	// console.log('at first ', board.data)
	    	for(var x=0;x<board.data.length;x++)
			{
				for(var y=x;y<board.data.length;y++)
				{
					if(board.data[y]['row'] < board.data[x]['row'])
					{
						var temp = board.data[x];
						// console.log(x,temp);
						board.data[x] = board.data[y];
						board.data[y] = temp;
					}
				}
			}
			//one more sort, columns this time
			for(var x=0;x<board.data.length;x++)
			{
				for(var y=x;y<board.data.length;y++)
				{
					if(board.data[y]['row'] === board.data[x]['row'])
					{
						if(board.data[y]['column'] < board.data[x]['column'])
						{
							var temp = board.data[x];
							// console.log(x,temp);
							board.data[x] = board.data[y];
							board.data[y] = temp;
						}
					}
				}
			}
			
			//save this to $scope.board which is 2D matrix
			var cnt = 0;
			var row = [];
			for(var x=0;x<board.data.length;x++)
			{
				row.push(board.data[x]);
				if(x%8 === 7)
				{
					$scope.board.push(row);
					cnt++;
					row = [];
				} 
			};
	        $http.get('/pieces')
	        .then(function(pieces){
	        	// console.log(pieces.data);
	        	$scope.pieces = pieces.data;
	        	// console.log('board ',$scope.board);
	        	// console.log('pieces ',$scope.pieces);
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

	        	//go thru $scope.board and fill in any unfilled history arrays with null
	        	for(var x=0;x<$scope.board.length;x++)
	        	{
	        		for(var y=0;y<$scope.board[x].length;y++)
	        		{
	        			if(!$scope.board[x][y]['pieceHist'])
	        			{
	        				$scope.board[x][y]['pieceHist'] = null;
	        				$scope.board[x][y]['teamHist'] = null;
	        				$scope.board[x][y]['typeHist'] = null;
	        			}
	        		}
	        	}


	        	// console.log($scope.board);
	        	var outData = [];
	        	for(var x=0;x<$scope.board.length;x++)
	        	{
	        		for(var y=0;y<$scope.board[x].length;y++)
	        		{
	        			outData.push($scope.board[x][y]);
	        		}
	        	}
	        	// console.log('then ',outData);

	        	$http.put('/board',outData).then(function(){
	        		console.log('we don');
	        	})

	        });
	    })
		}
	    
	}



	$scope.onDropComplete=function(data,evt){

		if($scope.playingGame)
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
			

			var moveChecker = function()
			{
				var output = false;

				//Pawns first
				if(movedPieceType === 'Pawn')
				{
					//Black pawns
					if(movedPieceTeam === 'Black')
					{
						if(existingTeamOnLandLoc !== 'Black')
						{
							if((landingRow === startingRow+1) && (landingCol=== startingCol) && (!existingPieceOnLandLoc))
							{
								output = true;
								return output;
							}
							else if((startingRow === 2) && (landingRow === 4) && (landingCol === startingCol) && (!existingPieceOnLandLoc))
							{
								output = true;
								return output;
							}
							else if((landingRow === startingRow+1) && (Math.abs(landingCol-startingCol)===1) && (existingPieceOnLandLoc))
							{
								output = true;
								return output;
							}
						}
						
					}

					//White pawns
					if(movedPieceTeam === 'White')
					{
						if(existingTeamOnLandLoc !== 'White')
						{
							if((landingRow === startingRow-1) && (landingCol=== startingCol) && (!existingPieceOnLandLoc))
							{
								output = true;
								return output;
							}
							else if((startingRow === 7) && (landingRow === 5) && (landingCol === startingCol) && (!existingPieceOnLandLoc))
							{
								output = true;
								return output;
							}
							else if((landingRow === startingRow-1) && (Math.abs(landingCol-startingCol)===1) && (existingPieceOnLandLoc))
							{
								output = true;
								return output;
							}
						}
						
					}
				}

				//Rooks next
				else if(movedPieceType === 'Rook')
				{
						var goodDirection = false;
						if(existingTeamOnLandLoc !== movedPieceTeam)
						{
							if(landingRow === startingRow)
							{
								//if it moved sideways
								goodDirection = true;
								//if it moved left
								if(landingCol < startingCol)
								{
									//make sure nothing in between
									var blocked = false;
									for(var x=landingCol+1;x<startingCol;x++)
									{
										if($scope.board[landingRow-1][x-1]['piece'])
										{
											blocked = true;
											break;
										}
									}
								}
								//else if it moved right
								if(landingCol > startingCol)
								{
									//again make sure nothing in between
									var blocked = false;
									for(var x=startingCol+1;x<landingCol;x++)
									{
										if($scope.board[landingRow-1][x-1]['piece'])
										{
											blocked = true;
											break;
										}
									}
								}
							}

							//else if it moved vertical
							else if(landingCol === startingCol)
							{
								//if it moved sideways
								goodDirection = true;
								//if it moved up
								if(landingRow < startingRow)
								{
									//make sure nothing in between
									var blocked = false;
									for(var x=landingRow+1;x<startingRow;x++)
									{
										if($scope.board[x-1][landingCol-1]['piece'])
										{
											blocked = true;
											break;
										}
									}
								}

								//else if it moved down
								if(landingRow > startingRow)
								{
									//make sure nothing in between
									var blocked = false;
									for(var x=startingRow+1;x<landingRow;x++)
									{
										if($scope.board[x-1][landingCol-1]['piece'])
										{
											blocked = true;
											break;
										}
									}
								}

							}
						}
						if(goodDirection && !blocked)
						{
							output = true;
						}
					
				}

				//Knights up next
				else if(movedPieceType === 'Knight')
				{
					//make sure ur not killing ur own!
					if(existingTeamOnLandLoc !== movedPieceTeam)
					{
						//if not friendly fire, continue with the calcs
						var horizontalDiff = Math.abs(startingCol-landingCol);
						var verticalDiff = Math.abs(startingRow-landingRow);
						if( ((horizontalDiff===1)&&(verticalDiff===2)) || ((verticalDiff===1)&&(horizontalDiff===2)) )
						{
							output = true;
						}
					}
				}

				//Bishop next.. and btw wow that knight piece took way less time and work than I expected =D
				else if(movedPieceType === 'Bishop')
				{
					//friendly fire check
					if(existingTeamOnLandLoc !== movedPieceTeam)
					{
						var horizontalDiff = Math.abs(startingCol-landingCol);
						var verticalDiff = Math.abs(startingRow-landingRow);
						//Diagonal check now
						if(horizontalDiff === verticalDiff)
						{
							//now check all 4 diagonal directions to check stuff in between
							var blocked = false;

							//Northwest first
							if((landingCol<startingCol) && (landingRow<startingRow))
							{
								var cnt=0;
								for(var x=landingCol+1;x<startingCol;x++)
								{
									cnt++
									if($scope.board[landingRow+cnt-1][x-1]['piece'])
									{
										blocked = true;
										break;
									}
								}
								console.log('fuck up some commas ',blocked);
							}

							//Northeast next
							else if((landingCol>startingCol) && (landingRow<startingRow))
							{
								var cnt=0;
								for(var x=landingRow+1;x<startingRow;x++)
								{
									cnt++
									if($scope.board[x-1][landingCol-cnt-1]['piece'])
									{
										blocked = true;
										break;
									}
								}
								console.log('fuck up some commas ',blocked);
							}

							//Southeast next
							else if((landingCol>startingCol) && (landingRow>startingRow))
							{
								var cnt=0;
								for(var x=startingRow+1;x<landingRow;x++)
								{
									cnt++
									if($scope.board[x-1][startingCol+cnt-1]['piece'])
									{
										blocked = true;
										break;
									}
								}
								console.log('fuck up some commas ',blocked);
							}

							//..and finally, Southwest, like the airlines
							else if((landingCol<startingCol) && (landingRow>startingRow))
							{
								var cnt=0;
								for(var x=startingRow+1;x<landingRow;x++)
								{
									cnt++
									if($scope.board[x-1][startingCol-cnt-1]['piece'])
									{
										blocked = true;
										break;
									}
								}
								console.log('fuck up some commas ',blocked);
							}
						}
						if(blocked === false)
						{
							output = true;
						}
					}
					
				}

				//Queen next
				else if(movedPieceType === 'Queen')
				{
					//friendly fire check
					if(existingTeamOnLandLoc !== movedPieceTeam)
					{
						//if we are not trying to kill our very brethren
						var horizontalDiff = Math.abs(startingCol-landingCol);
						var verticalDiff = Math.abs(startingRow-landingRow);
						var goodDirection = false;

						//on some bishop ish (since queen is part bishop, park rook)
						if(horizontalDiff === verticalDiff)
						{
							goodDirection = true;
							//now check all 4 diagonal directions to check stuff in between
							var blocked = false;

							//Northwest first
							if((landingCol<startingCol) && (landingRow<startingRow))
							{
								var cnt=0;
								for(var x=landingCol+1;x<startingCol;x++)
								{
									cnt++
									if($scope.board[landingRow+cnt-1][x-1]['piece'])
									{
										blocked = true;
										break;
									}
								}
							}

							//Northeast next
							else if((landingCol>startingCol) && (landingRow<startingRow))
							{
								var cnt=0;
								for(var x=landingRow+1;x<startingRow;x++)
								{
									cnt++
									if($scope.board[x-1][landingCol-cnt-1]['piece'])
									{
										blocked = true;
										break;
									}
								}
							}

							//Southeast next
							else if((landingCol>startingCol) && (landingRow>startingRow))
							{
								var cnt=0;
								for(var x=startingRow+1;x<landingRow;x++)
								{
									cnt++
									if($scope.board[x-1][startingCol+cnt-1]['piece'])
									{
										blocked = true;
										break;
									}
								}
							}

							//..and finally, Southwest, like the airlines
							else if((landingCol<startingCol) && (landingRow>startingRow))
							{
								var cnt=0;
								for(var x=startingRow+1;x<landingRow;x++)
								{
									cnt++
									if($scope.board[x-1][startingCol-cnt-1]['piece'])
									{
										blocked = true;
										break;
									}
								}
							}
						}

						//now the rook 'yin' to the bishop 'yang' that is Her Majesty
						else if(landingRow === startingRow)
						{
							//if it moved sideways
							goodDirection = true;
							//if it moved left
							if(landingCol < startingCol)
							{
								//make sure nothing in between
								var blocked = false;
								for(var x=landingCol+1;x<startingCol;x++)
								{
									if($scope.board[landingRow-1][x-1]['piece'])
									{
										blocked = true;
										break;
									}
								}
							}
							//else if it moved right
							if(landingCol > startingCol)
							{
								//again make sure nothing in between
								var blocked = false;
								for(var x=startingCol+1;x<landingCol;x++)
								{
									if($scope.board[landingRow-1][x-1]['piece'])
									{
										blocked = true;
										break;
									}
								}
							}
						}

						//else if it moved vertical
						else if(landingCol === startingCol)
						{
							//if it moved sideways
							goodDirection = true;
							//if it moved up
							if(landingRow < startingRow)
							{
								//make sure nothing in between
								var blocked = false;
								for(var x=landingRow+1;x<startingRow;x++)
								{
									if($scope.board[x-1][landingCol-1]['piece'])
									{
										blocked = true;
										break;
									}
								}
							}

							//else if it moved down
							if(landingRow > startingRow)
							{
								//make sure nothing in between
								var blocked = false;
								for(var x=startingRow+1;x<landingRow;x++)
								{
									if($scope.board[x-1][landingCol-1]['piece'])
									{
										blocked = true;
										break;
									}
								}
							}

						}
						if(goodDirection && !blocked)
						{
							output = true;
						}
					}
				}

				//and finally KING OF PHILLY..KOP!!!!
				else if(movedPieceType === 'King')
				{
					if(existingTeamOnLandLoc !== movedPieceTeam)
					{
						var horizontalDiff = Math.abs(startingCol-landingCol);
						var verticalDiff = Math.abs(startingRow-landingRow);
						if((horizontalDiff===1) && (verticalDiff ===1)||(horizontalDiff===1) && (verticalDiff ===0)||(horizontalDiff===0) && (verticalDiff ===1))
						{
							output = true;
						}
					}
				}

				return output;	
			}

			var rightTeamMove = function()
			{
				if(($scope.count%2===0) && (movedPieceTeam==='White'))
				{
					return true;
				}
				else if(($scope.count%2===1) && (movedPieceTeam === 'Black'))
				{
					return true;
				}
				else
				{
					return false;
				}
			}

			console.log('moved from (',startingRow,',',startingCol,') to (',landingRow,',',landingCol,')');
			
			var goodToMove = moveChecker();
			var correctTeam = rightTeamMove();
			
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

				convertBoard()
				.then(function(info){
					if(movedPieceTeam === 'Black')
					{
						//the function to check for checks.. yeah the wording sounds weird.. get over it
						return homelandSecurity('White','King');
					}
					else if(movedPieceTeam === 'White')
					{
						return homelandSecurity('Black','King');
					}
				})
				.then(function(threat) {
					if(threat===true)
					{
						//if there's check, then a message from the Department of Homeland Security
						alert('Dept. of Homeland Security says CHECK!!!');
					}
					//now that crazy move where a pawn turns into queen if it hits the end of the board
					//landingRow was decremented to the 0-7 version somewhere around lines 617-620)
					
				})
				


				//HOMELAND SECURITY!!.. cuz this is 'Murrica
				function homelandSecurity(team,protectee)
				{
					var alertMessage = 'The Department of Homeland Security regrets to inform the ' +team+' team that you are in CHECK!!!';
					var url = '/'+team+protectee;
					return $http.get(url)
					.then(function(locAndPiece){
						var obj = locAndPiece.data[0];
						var locRow = obj.row;
						var locCol = obj.column;

						//NO THREATS YET!!
						var threatDetected = false;

						//horizontal first
						//move first in the -y direction
						//no piece yet
						var pieceFound = false;
						var y = locCol-2;

						while(!pieceFound && y>=0 && y<=7)
						{
							 if($scope.board[locRow-1][y]['piece'])
							 {
							 	var piece2Analyze = $scope.board[locRow-1][y];
							 	pieceFound = true;
							 }
							 y--;
						}
						if(piece2Analyze['team'] !== team)
						{
							if((piece2Analyze['type']==='Rook') || (piece2Analyze['type']==='Queen'))
							{
								threatDetected = true;
								return threatDetected;
							}
						}

						//move first in the +y direction
						//no piece yet
						var pieceFound = false;
						var y = locCol;
						while(!pieceFound && y>=0 && y<=7)
						{
							 if($scope.board[locRow-1][y]['piece'])
							 {
							 	var piece2Analyze = $scope.board[locRow-1][y];
							 	pieceFound = true;
							 }
							 y++;
						}
						if(piece2Analyze['team'] !== team)
						{
							if((piece2Analyze['type']==='Rook') || (piece2Analyze['type']==='Queen'))
							{
								threatDetected = true;
								return threatDetected;
							}
						}

						//vertical now
						//move in the -x direction.. which is actually upwards.. yeahhhh
						var pieceFound = false;
						var x = locRow-2;
						console.log('x',x);
						console.log('locCol',locCol)
						while(!pieceFound && x>=0 && x<=7)
						{
							 if($scope.board[x][locCol-1]['piece'])
							 {
							 	var piece2Analyze = $scope.board[x][locCol-1];
							 	pieceFound = true;
							 }
							 x--;
						}
						if(piece2Analyze['team'] !== team)
						{
							if((piece2Analyze['type']==='Rook') || (piece2Analyze['type']==='Queen'))
							{
								threatDetected = true;
								return threatDetected;
							}
						}

						//finally, in the +x direction.. remember, which is actually downwards.. some weird shit
						var pieceFound = false;
						var x = locRow;
						while(!pieceFound && x>=0 && x<=7)
						{
							 if($scope.board[x][locCol-1]['piece'])
							 {
							 	var piece2Analyze = $scope.board[x][locCol-1];
							 	pieceFound = true;
							 }
							 x++;
						}
						if(piece2Analyze['team'] !== team)
						{
							if((piece2Analyze['type']==='Rook') || (piece2Analyze['type']==='Queen'))
							{
								threatDetected = true;
								return threatDetected;
							}
						}

						//oh yeah, that wasn't it.. there's diagonal too remember??
						//northeast first.. x-- / y++
						var pieceFound = false;
						var x = locRow-1; //row normalized to 0-7 index
						var y = locCol-1; //column normalized to 0-7 index

						x--;
						y++;
						while(!pieceFound && x>=0 && x<=7 && y>=0 && y<=7)
						{
							if($scope.board[x][y]['piece'])
							{
								var piece2Analyze = $scope.board[x][y];
								pieceFound = true;
							}
							x--;
							y++;
						}

						if(piece2Analyze['team'] !== team)
						{
							if((piece2Analyze['type']==='Bishop') || (piece2Analyze['type']==='Queen'))
							{
								threatDetected = true;
								return threatDetected;
							}
						}

						//northwest next.. x-- / y--
						var pieceFound = false;
						var x = locRow-1; //row normalized to 0-7 index
						var y = locCol-1; //column normalized to 0-7 index

						x--;
						y--;
						while(!pieceFound && x>=0 && x<=7 && y>=0 && y<=7)
						{
							if($scope.board[x][y]['piece'])
							{
								var piece2Analyze = $scope.board[x][y];
								pieceFound = true;
							}
							x--;
							y--;
						}

						if(piece2Analyze['team'] !== team)
						{
							if((piece2Analyze['type']==='Bishop') || (piece2Analyze['type']==='Queen'))
							{
								threatDetected = true;
								return threatDetected;
							}
						}

						//southwest next.. x++ / y--
						var pieceFound = false;
						var x = locRow-1; //row normalized to 0-7 index
						var y = locCol-1; //column normalized to 0-7 index

						x++;
						y--;
						while(!pieceFound && x>=0 && x<=7 && y>=0 && y<=7)
						{
							if($scope.board[x][y]['piece'])
							{
								var piece2Analyze = $scope.board[x][y];
								pieceFound = true;
							}
							x++;
							y--;
						}

						if(piece2Analyze['team'] !== team)
						{
							if((piece2Analyze['type']==='Bishop') || (piece2Analyze['type']==='Queen'))
							{
								threatDetected = true;
								return threatDetected;
							}
						}

						//..and finally, southeast.. x++ / y++
						var pieceFound = false;
						var x = locRow-1; //row normalized to 0-7 index
						var y = locCol-1; //column normalized to 0-7 index

						x++;
						y++;
						while(!pieceFound && x>=0 && x<=7 && y>=0 && y<=7)
						{
							if($scope.board[x][y]['piece'])
							{
								var piece2Analyze = $scope.board[x][y];
								pieceFound = true;
							}
							x++;
							y++;
						}

						if(piece2Analyze['team'] !== team)
						{
							if((piece2Analyze['type']==='Bishop') || (piece2Analyze['type']==='Queen'))
							{
								threatDetected = true;
								return threatDetected;
							}
						}


						//pawns next
						var x = locRow-1;
						var y = locCol-1;
						if(team==='Black')
						{
							var piece1 = $scope.board[x+1][y-1];
							var piece2 = $scope.board[x+1][y+1];
							if((piece1['team']==='White' && piece1['type']==='Pawn') || (piece2['team']==='White' && piece2['type']==='Pawn'))
							{
								threatDetected = true;
								return threatDetected;
							}
						}

						else if(team==='White')
						{
							var piece1 = $scope.board[x-1][y-1];
							var piece2 = $scope.board[x-1][y+1];
							if((piece1['team']==='Black' && piece1['type']==='Pawn') || (piece2['team']==='Black' && piece2['type']==='Pawn'))
							{
								threatDetected = true;
								return threatDetected;
							}
						}

						//and last, (forreal this time).. Horse
						var x = locRow-1;
						var y = locCol-1;
						console.log('his majestys coords (',x,',',y,')')
						var checkArr = [];
						if(x<7 && y>1)
						{
							var piece = $scope.board[x+1][y-2];
							checkArr.push(piece);
						}
						if(x<7 && y<6)
						{
							var piece = $scope.board[x+1][y+2];
							checkArr.push(piece);
						}
						if(x<6 && y>0)
						{
							var piece = $scope.board[x+2][y-1];
							checkArr.push(piece);
						}
						if(x<6 && y<7)
						{
							var piece = $scope.board[x+2][y+1];
							checkArr.push(piece);
						}


						if(x>0 && y>1)
						{
							var piece = $scope.board[x-1][y-2];
							checkArr.push(piece);
						}
						if(x>0 && y<6)
						{
							var piece = $scope.board[x-1][y+2];
							checkArr.push(piece);
						}
						if(x>1 && y>0)
						{
							var piece = $scope.board[x-2][y-1];
							checkArr.push(piece);
						}
						if(x>1 && y<7)
						{
							var piece = $scope.board[x-2][y+1];
							checkArr.push(piece);
						}
					
						console.log('makin me nervous', checkArr);
						for(var i=0; i<checkArr.length;i++)
						{
							var pz = checkArr[i];
							if(pz['team'] !== team && pz['type'] === 'Knight')
							{
								threatDetected = true;
								return threatDetected;
							}
						}


						console.log('threats ',threatDetected);
						return threatDetected;
					})
				}

			}
			
	    }
	}


})
