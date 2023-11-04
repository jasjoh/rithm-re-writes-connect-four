"use strict";

/** Connect Four game
 *
 * Two players take turns dropping a piece into a 7 x 6 grid until one player
 * achieves four in a row (horiz, vert or diagonally) or until the board fills
 * up completely.
 */

/**
 * Matching Logic Options
 * 1. Every turn check every cell in every direction from the bottom.
 * 2. Every turn check every cell up, left, right, and up diagonals.
 *
 * Optimizations
 * 1. Keep track of max height of dropped pieces (checks empty spaces).
 * 2. Keep track of coordinates of dropped pieces (and only check those, but checks invalid directions).
 * 3. Pre-generate potential matches for any valid coordinates (doesn't check invalid directions).
 *
 * Fully Optimized (but memory intensive)
 * 1. Keep track of array of valid coordinates.
 *
 * Out There
 * 1. For each coordinate in board, store an object that has:
 * a. current value (null or player number)
 * b. valid coordinates to check
 */

const WIDTH = 7;
const HEIGHT = 6;

let currPlayer = 1; // the active player
const board = []; // an empty board
const placedPieces = [];

/**
 * Creates a game board to keep track of state of the board
 * The board is a matrix [y][x] representing height and width respectively
 * The first index represents a row, the second index represents a column
 */
function makeBoard() {
  console.log("makeBoard() called");
  // create y rows
  for (let y = 0; y < HEIGHT; y++) {
    // initialize this row
    const row = [];
    // add null values for each column (the row's width)
    for (let x = 0; x < WIDTH; x++) {
      const boardSpace = {
        value: null,
        validCoordSets: []
      }
      row.push(boardSpace);
    }
    // add the row to the board
    board.push(row);
  }

  console.log("attempting to populate valid coords");
  // populate potential match sets
  // loop through every row start at the bottom up to 4th row
  for (let y = HEIGHT - 1; y >= 3; y--) {
    console.log("row:", y);
  // loop through every cell in the row
    for (let x = 0; x < WIDTH; x++) {
      console.log("col:", x);
      // populate valid coords for this cell
      populateValidCoordSets(y, x);
    }
  }
  console.log("board populated:", board);
}

function populateValidCoordSets(y, x) {
  const vcs = board[y][x].validCoordSets;
  let coordSet = [];
  console.log("populating [y][x] valid coords:", vcs);
  // add up set
  coordSet.push([y, x]);
  coordSet.push([y-1, x]);
  coordSet.push([y-2, x]);
  coordSet.push([y-3, x]);
  vcs.push(coordSet);
  // check left
  if (board[y][x-3] !== undefined) {
    coordSet = [];
    coordSet.push([y, x]);
    coordSet.push([y, x-1]);
    coordSet.push([y, x-2]);
    coordSet.push([y, x-3]);
    vcs.push(coordSet);
  }
  // check right
  if (board[y][x+3] !== undefined) {
    coordSet = [];
    coordSet.push([y, x]);
    coordSet.push([y, x+1]);
    coordSet.push([y, x+2]);
    coordSet.push([y, x+3]);
    vcs.push(coordSet);
  }
  // check upLeft
  if (board[y-3][x-3] !== undefined) {
    coordSet = [];
    coordSet.push([y, x]);
    coordSet.push([y-1, x-1]);
    coordSet.push([y-2, x-2]);
    coordSet.push([y-3, x-3]);
    vcs.push(coordSet);
  }
  // check upRight
  if (board[y-3][x+3] !== undefined) {
    coordSet = [];
    coordSet.push([y, x]);
    coordSet.push([y-1, x+1]);
    coordSet.push([y-2, x+2]);
    coordSet.push([y-3, x+3]);
    vcs.push(coordSet);
  }
  console.log("valid coords populated:", vcs);
}

/** Makes the HTML board which will be rendered based on 'board' state. */
function makeHtmlBoard() {
  // grab the DOM element where the board will live
  const htmlBoard = document.getElementById('board');

  // create the top row where chips will be dropped
  const topRow = document.createElement("tr");
  topRow.setAttribute("id", "top-row");
  topRow.addEventListener("click", handlePieceDrop);

  // add each cell to the top row with and ID for reference in event handling
  for (let x = 0; x < WIDTH; x++) {
    const topRowCell = document.createElement("td");
    topRowCell.setAttribute("id", `top-row-cell-${x}`);
    topRow.append(topRowCell);
  }

  // add the top row to the board html
  htmlBoard.append(topRow);

  // now create the main rows
  for (let y = 0; y < HEIGHT; y++) {
    const gameRow = document.createElement("tr");
    for (let x = 0; x < WIDTH; x++) {
      const gameCell = document.createElement("td");
      gameCell.setAttribute("id", `game-cell-${y}-${x}`);
      gameRow.append(gameCell);
    }
    htmlBoard.append(gameRow);
  }
}

/**
 * Given a column, return the row lowest empty cell (has a null value)
 * If the column is full (has no null values), returns null
 */
function findEmptyCellInColumn(x) {
  console.log("attempting to find empty cell at col:", x);
  // check if the column is full and return 'null' if true
  if (board[0][x].value !== null) { return null; }

  let y = 0; // start a first row

  // loop through rows top to bottom until we either:
  // -- find a non-null cell (and return the slot above)
  // -- reach the last cell and return it
  while (y < HEIGHT) {
    if (board[y][x].value !== null) {
      console.log("column was full");
      return y - 1;
    }
    y++;
  }
  return HEIGHT - 1;
}

/** Adds the players numbers to the JS board state where they dropped a piece */
function addToBoard(y, x) {
  board[y][x].value = currPlayer;
  placedPieces.push([y, x]);
  console.log("added to board");
}

/**
 * Place a game piece at the specified coordinates in the HTML game table
 */
function placePieceInHtml(y, x){
  console.log("placing piece in html at yx:", y, x);
  // create the game piece and add classes to support styling
  const gamePiece = document.createElement("div");
  gamePiece.classList.add("gamePiece");
  gamePiece.classList.add(`player${currPlayer}`);

  // select the game cell where the piece will be placed and place it
  const gameCell = document.getElementById(`game-cell-${y}-${x}`);
  gameCell.append(gamePiece);
}

/** End the game and announce results */
function endGame(msg) {
  alert(msg);
}

function checkForGameEnd() {
  console.log("checking for game end");
  // check for tie
  if(board[0].every(cell => cell.value !== null)) {
    return endGame("It's a tie!");
  }

  // check if it's a win
  // check each placed piece
  for (let i = 0; i < placedPieces.length; i++) {
    const px = placedPieces[i][0];
    const py = placedPieces[i][1];
    console.log("checking placed piece at xy", px, py);
    // check each valid coord set for this piece
    for (let j = 0; j < board[px][py].validCoordSets.length; j++) {
      const validCoordSets = board[px][py].validCoordSets[j];
      if(validCoordSets.every(c => board[c[0]][c[1]].value === currPlayer)) {
        return endGame(`Player ${currPlayer} has won!`);
      }
    }
  }

  // switch players
  currPlayer = currPlayer === 1 ? 2 : 1;
}

/** Handle click associated with dropping a game piece */
function handlePieceDrop(evt) {
  // get the target element's ID
  const targetId = evt.target.id;

  // extract the column number from the ID ('top-row-cell-x') using regex
  const regex = /(\d+)/;
  const targetColumn = Number(targetId.match(regex)[0]);
  console.log("target col using regex:", targetColumn);

  // extract the column number from the ID using charAt()
  console.log("id using charAt(targetId.length-1)", targetId.charAt(targetId.length - 1));
  // extract the column number from the ID using slice(-2)
  console.log("id using slice(-2)", targetId.slice(-2));

  // find the next available space (row) for the piece in the target column
  var targetRow = findEmptyCellInColumn(targetColumn);
  console.log("target row found:", targetRow);
  if (targetRow === null) { return; } // no space so ignore the click

  // add to the JS board and the HTML board
  addToBoard(targetRow, targetColumn);
  placePieceInHtml(targetRow, targetColumn);

  // check for win condition
  checkForGameEnd();
}

makeBoard();
makeHtmlBoard();