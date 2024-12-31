
let gameBoard = [];
let currentPlayer = 'X';
let gameOver = false;

// Initialize game board
for (let i = 0; i < 9; i++) {
    gameBoard.push('');
    const cell = document.getElementById(`cell-${i}`);
    cell.textContent = '';
    cell.addEventListener('click', handleCellClick);
}

// Handle cell click
function handleCellClick(event) {
    if (gameOver) return;
    const cellIndex = event.target.id.split('-')[1];
    if (gameBoard[cellIndex] === '') {
        gameBoard[cellIndex] = currentPlayer;
        event.target.textContent = currentPlayer;
        checkForWin();
        currentPlayer = currentPlayer === 'X'? 'O' : 'X';
    }
}

// Check for win
function checkForWin() {
    const winConditions = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];
    for (let i = 0; i < winConditions.length; i++) {
        const condition = winConditions[i];
        if (gameBoard[condition[0]] ===  gameBoard[condition[1]] && gameBoard[condition[1]] === gameBoard[condition[2]] && gameBoard[condition[0]]!== '') {
            gameOver = true;
            document.getElementById('win-message').textContent =`Player ${gameBoard[condition[0]]} wins!`;
            return;
        }
    }
    if (!gameBoard.includes('')) {
        gameOver = true;
        document.getElementById('win-message').textContent ='It\'s a draw!';
    }
}

// Reset game
document.getElementById('reset-button').addEventListener('click', () => {
    gameBoard = [];
    currentPlayer = 'X';
    gameOver = false;
    document.getElementById('win-message').textContent = '';
    for (let i = 0; i < 9; i++) {
        const cell = document.getElementById(`cell-${i}`);
        cell.textContent = '';
        gameBoard.push('');
    }
});
