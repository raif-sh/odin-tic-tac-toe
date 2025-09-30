// Creating the gameboard 
function Gameboard() {
    const rows = 3;
    const columns = 3;
    // Create 1D board state
    const board = Array(rows * columns).fill(null).map(() => Cell());

    // Create 2d Array to represent the state of the gameboard
    // for (let i = 0; i < rows; i++) {
    //     board[i] = [];
    //     for (let j = 0; j < columns; j++) {
    //         board[i].push(Cell());
    //     }
    // }

    // Use this method to get board and render UI
    const getBoard = () => board;

    // For console play, print board status
    // const printBoard = () => {
    //     const boardWithCellValues = board.map((row) => row.map((cell) => cell.getValue()))
    //     console.log(boardWithCellValues);
    // }
    const printBoard = () => {
        const boardWithCellValues = [];
        for (let i = 0; i < rows; i++) {
            boardWithCellValues.push(
                board.slice(i * columns, (i + 1) * columns).map(cell => cell.getValue())
            );
        }
        // console.log(boardWithCellValues);
    }

    const markBox = (index, player) => {
        if (board[index].getValue() === 0) {
            board[index].addMark(player);
            return true
        } else {
            return false
        };
    }

    const resetBoard = () => {
        for (let i = 0; i < board.length; i++) {
            board[i].resetMark();
        }
    }

    return { getBoard, printBoard, markBox, resetBoard };
}

// A cell is a single box on the board which has three values
// 0 - empty
// 1 - player one
// 2 - player two
function Cell() {
    let value = 0;

    // accepting play turn 
    const addMark = (player) => {
        if (value === 0) {
            // console.log("adding mark: " + player)
            value = player;
        }
        else return;
    };

    // how current value of this cell is retrieved 
    const getValue = () => value

    // reset cell
    const resetMark = () => {
        value = 0;
    }

    return { addMark, getValue, resetMark };
}

// Create an object to control the flow of the game
function GameController(playerOneName, playerTwoName) {
    const board = Gameboard();

    const players = [
        {
            name: playerOneName,
            mark: 1
        },
        {
            name: playerTwoName,
            mark: 2
        }
    ];

    let activePlayer = players[0];
    DisplayController.updateStatus(`${activePlayer.name} starts the game with 'X'`)

    const switchPlayerTurn = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0];
    };

    const getActivePlayer = () => activePlayer;

    const printNewRound = () => {
        board.printBoard();
        // console.log(`${getActivePlayer().name}'s turn.`);
        DisplayController.updateStatus(`It's ${getActivePlayer().name}'s turn to play`);
    };

    const checkWinner = () => {
        const winCombos = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ];

        // Compare current board state against winning combos
        const boardState = board.getBoard();

        for (let combo of winCombos) {
            const [a, b, c] = combo;
            const valA = boardState[a].getValue();
            const valB = boardState[b].getValue();
            const valC = boardState[c].getValue();

            // Return winner if combo matches
            if (valA !== 0 && valA === valB && valA === valC) {
                // console.log(`${getActivePlayer().name} wins!`);
                return getActivePlayer();
            }
        }

        // If board is full, end game in tie
        const isTie = boardState.every(cell => cell.getValue() !== 0);

        if (isTie) {
            return "tie";
        }

        return null;
    };

    const playRound = (index) => {
        let winner = null;

        let result = board.markBox(index, getActivePlayer().mark);
        if (result === false) {
            // console.log("This round was invalid, play again. Result: "+ result)
            DisplayController.updateStatus("Invalid play move. Try again.")
            printNewRound();
            return;
        } else if (result === true) {
            // console.log("Play was valid: "+ result)
            DisplayController.updateGameBoard();
            winner = checkWinner();
            console.log(winner)
            if (winner) {
                // end game with tie
                if (winner === "tie") {
                    DisplayController.updateStatus(`It's a tie`);
                    DisplayController.endOfGame();
                    
                } else {
                    DisplayController.updateStatus(`${getActivePlayer().name} won the game`);
                    DisplayController.endOfGame();
                }
                return
            }
            switchPlayerTurn(); 
            printNewRound();
        }
    };

    printNewRound();

    return {
        playRound,
        getActivePlayer,
        getBoard: board.getBoard,
        resetBoard: board.resetBoard
    };
};

const DisplayController = (function() {
    const getGameContainer = document.querySelector('.game');

    // Get player control input and buttons
    let getGameController = null;
    let playerOneName = document.querySelector('#playerOne');
    let playerTwoName = document.querySelector('#playerTwo');
    const getInputContainer = document.querySelector('.player-name-inputs');

    // Grab start and reset game buttons
    const getControlButtons = document.querySelector('.controls');

    // Initiating new game and reset games
    getControlButtons.addEventListener("click", function(event) {
        event.preventDefault()
        if (playerOneName.value === '') {
            // console.log('enter name to start')
            DisplayController.updateStatus('Enter player one name')
            return;
        } else if (playerTwoName.value === '') {
            DisplayController.updateStatus('Enter player two name')
            return;
        } else if (event.target.id === 'start') {
            // console.log('starting new game with player: ' + playerOneName.value + " and " + playerTwoName.value)
            getControlButtons.children[0].hidden = true;
            getInputContainer.hidden = true;
            getGameContainer.style.display = "grid";
            getGameController = GameController(playerOneName.value, playerTwoName.value);

        } else if (event.target.id === 'reset') {
            restartGame()
        }
    })


    // Add event listener when game starts
    getGameContainer.addEventListener("click", function(event) {
        // check if click was on a button and if it has a data id
        if (event.target.matches('button[data-id]')){
            // capture value of button
            // console.log(event.target.dataset.id)
            const btnIndex = event.target.dataset.id
            getGameController.playRound(btnIndex)
        }
    });
        
    // Update cell button values based on board values
    function updateGameBoard() {
        const boardState = getGameController.getBoard();
        // Grab all buttons
        const childElements = getGameContainer.children;

        // console.log(boardState)
        for (let i = 0; i < boardState.length; i++) {
            if (boardState[i].getValue() === 0) {
                childElements[i].textContent = '';
            } else if (boardState[i].getValue() === 1) {
                childElements[i].textContent = 'X';
            } else if (boardState[i].getValue() === 2) {
                childElements[i].textContent = 'O';
            }
        }
    }

    // get element for updating game status message
    const statusDisplay = document.querySelector('.status');

    function updateStatus(message) {
        statusDisplay.textContent = message;
    }

    // End of game updates to DOM 
    function endOfGame() {
        // Show restart button
        getControlButtons.children[1].hidden = false;
        // disable further playrounds
        for (const child of getGameContainer.children) {
            child.setAttribute('disabled', 'true');
        }
    }

    // restart a new game
    function restartGame() {
        // show start new game and hide restart button
        getControlButtons.children[0].hidden = false;
        getControlButtons.children[1].hidden = true;
        // show player input and reset values
        getInputContainer.hidden = false;
        
        // hide game board 
        getGameContainer.style.display = "none";
        
        for (const child of getGameContainer.children) {
            child.removeAttribute('disabled');
        }
        
        // make a fresh game controller
        getGameController = GameController(playerOneName.value, playerTwoName.value);
        updateStatus('Restart game?')
        updateGameBoard()
    }

    return { updateGameBoard, updateStatus, endOfGame }
})();
