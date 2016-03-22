app.factory('mainFactory',function($http){
	return {
		// convertBoard is to be called with board ==> board
		convertBoard: function(board) {
						var outData = [];
				    	for(var x=0;x<board.length;x++)
				    	{
				    		for(var y=0;y<board[x].length;y++)
				    		{
				    			outData.push(board[x][y]);
				    		}
				    	}
				    	// console.log('then ',outData);

				    	return $http.put('/board',outData);
					},
		getPieces: function() {
					return $http.get('/pieces');
					},
		sortBoard: function(boardo) {
					for(var x=0;x<boardo.length;x++)
						{
							for(var y=x;y<boardo.length;y++)
							{
								if(boardo[y]['row'] < boardo[x]['row'])
								{
									var temp = boardo[x];
									// console.log(x,temp);
									boardo[x] = boardo[y];
									boardo[y] = temp;
								}
							}
						}
						//one more sort, columns this time
						for(var x=0;x<boardo.length;x++)
						{
							for(var y=x;y<boardo.length;y++)
							{
								if(boardo[y]['row'] === boardo[x]['row'])
								{
									if(boardo[y]['column'] < boardo[x]['column'])
									{
										var temp = boardo[x];
										// console.log(x,temp);
										boardo[x] = boardo[y];
										boardo[y] = temp;
									}
								}
							}
						}
						
						//save this to board which is 2D matrix
						var cnt = 0;
						var row = [];
						var board = [];
						for(var x=0;x<boardo.length;x++)
						{
							row.push(boardo[x]);
							if(x%8 === 7)
							{
								board.push(row);
								cnt++;
								row = [];
							} 
						}
						return board;
		},
		// run the following if boardActivated is false
		
				getBoard: function() {
					return $http.get('/board');
				},

				// input the following with board for board, then everything else EXACTLY as is
				moveChecker: function(board,movedPieceType,movedPieceTeam,existingTeamOnLandLoc,existingPieceOnLandLoc,landingRow,landingCol,startingRow,startingCol)
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
											if(board[landingRow-1][x-1]['piece'])
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
											if(board[landingRow-1][x-1]['piece'])
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
											if(board[x-1][landingCol-1]['piece'])
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
											if(board[x-1][landingCol-1]['piece'])
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
										if(board[landingRow+cnt-1][x-1]['piece'])
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
										if(board[x-1][landingCol-cnt-1]['piece'])
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
										if(board[x-1][startingCol+cnt-1]['piece'])
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
										if(board[x-1][startingCol-cnt-1]['piece'])
										{
											blocked = true;
											break;
										}
									}
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
										if(board[landingRow+cnt-1][x-1]['piece'])
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
										if(board[x-1][landingCol-cnt-1]['piece'])
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
										if(board[x-1][startingCol+cnt-1]['piece'])
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
										if(board[x-1][startingCol-cnt-1]['piece'])
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
										if(board[landingRow-1][x-1]['piece'])
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
										if(board[landingRow-1][x-1]['piece'])
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
										if(board[x-1][landingCol-1]['piece'])
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
										if(board[x-1][landingCol-1]['piece'])
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

					//and finally THE KING
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
				},
				// input with %board and everything else like normal
				
				// 	input with $scope.count and movedPieceTeam EXACTLY as it says
					rightTeamMove : function(count, movedPieceTeam)
					{
						if((count%2===0) && (movedPieceTeam==='White'))
						{
							return true;
						}
						else if((count%2===1) && (movedPieceTeam === 'Black'))
						{
							return true;
						}
						else
						{
							return false;
						}
					},
					//HOMELAND SECURITY!!.. cuz this is 'Murrica
					homelandSecurity: function(board,team,protectee)
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
								 if(board[locRow-1][y]['piece'])
								 {
								 	var piece2Analyze = board[locRow-1][y];
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
								 if(board[locRow-1][y]['piece'])
								 {
								 	var piece2Analyze = board[locRow-1][y];
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
								 if(board[x][locCol-1]['piece'])
								 {
								 	var piece2Analyze = board[x][locCol-1];
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
								 if(board[x][locCol-1]['piece'])
								 {
								 	var piece2Analyze = board[x][locCol-1];
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
								if(board[x][y]['piece'])
								{
									var piece2Analyze = board[x][y];
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
								if(board[x][y]['piece'])
								{
									var piece2Analyze = board[x][y];
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
								if(board[x][y]['piece'])
								{
									var piece2Analyze = board[x][y];
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
								if(board[x][y]['piece'])
								{
									var piece2Analyze = board[x][y];
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
								var piece1 = board[x+1][y-1];
								var piece2 = board[x+1][y+1];
								if((piece1['team']==='White' && piece1['type']==='Pawn') || (piece2['team']==='White' && piece2['type']==='Pawn'))
								{
									threatDetected = true;
									return threatDetected;
								}
							}

							else if(team==='White')
							{
								var piece1 = board[x-1][y-1];
								var piece2 = board[x-1][y+1];
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
								var piece = board[x+1][y-2];
								checkArr.push(piece);
							}
							if(x<7 && y<6)
							{
								var piece = board[x+1][y+2];
								checkArr.push(piece);
							}
							if(x<6 && y>0)
							{
								var piece = board[x+2][y-1];
								checkArr.push(piece);
							}
							if(x<6 && y<7)
							{
								var piece = board[x+2][y+1];
								checkArr.push(piece);
							}


							if(x>0 && y>1)
							{
								var piece = board[x-1][y-2];
								checkArr.push(piece);
							}
							if(x>0 && y<6)
							{
								var piece = board[x-1][y+2];
								checkArr.push(piece);
							}
							if(x>1 && y>0)
							{
								var piece = board[x-2][y-1];
								checkArr.push(piece);
							}
							if(x>1 && y<7)
							{
								var piece = board[x-2][y+1];
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

})