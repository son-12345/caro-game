const socket = io();

// Tạo bàn cờ 20x20
const board = document.getElementById('board');
const size = 20;
const cells = [];
let currentPlayer = 'Player 1'; // Biến theo dõi người chơi hiện tại
let currentMark = 'X'; // Quân cờ hiện tại (X hoặc O)
let startingPlayer = 'Player 1'; // Người chơi bắt đầu với quân X
let player1Score = 0; // Điểm người chơi 1
let player2Score = 0; // Điểm người chơi 2

// Hiển thị điểm số
const player1ScoreElement = document.getElementById('playerXScore');
const player2ScoreElement = document.getElementById('playerOScore');

// Tạo các ô trong bàn cờ
for (let i = 0; i < size; i++) {
    cells[i] = [];
    for (let j = 0; j < size; j++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.row = i;
        cell.dataset.col = j;
        board.appendChild(cell);
        cells[i][j] = cell;

        // Sự kiện khi người chơi click vào ô
        cell.addEventListener('click', () => {
            if (cell.innerHTML === '') {
                // Hiển thị nước đi của người chơi hiện tại (quân X hoặc O)
                cell.innerHTML = currentMark;
                cell.classList.add(currentMark); // Thêm lớp CSS cho X hoặc O

                // Gửi nước đi lên server
                socket.emit('playMove', { row: i, col: j, mark: currentMark });

                // Kiểm tra xem người chơi hiện tại có thắng không
                if (checkWin(i, j, currentMark)) {
                    alert(`Người chơi ${currentPlayer} đã thắng!`);

                    // Tăng điểm cho người chơi thắng
                    if (currentPlayer === 'Player 1') {
                        player1Score++;
                        player1ScoreElement.textContent = player1Score; // Cập nhật điểm người chơi 1
                    } else {
                        player2Score++;
                        player2ScoreElement.textContent = player2Score; // Cập nhật điểm người chơi 2
                    }

                    // Reset bàn cờ
                    resetBoard();
                } else {
                    // Chuyển lượt: Không đổi người chơi, chỉ đổi quân cờ X hoặc O
                    currentMark = currentMark === 'X' ? 'O' : 'X';

                    // Đổi người chơi (sau khi đổi quân cờ)
                    currentPlayer = currentPlayer === 'Player 1' ? 'Player 2' : 'Player 1';
                }
            }
        });
    }
}

// Hàm kiểm tra người thắng
function checkWin(row, col, mark) {
    return checkDirection(row, col, mark, 1, 0) ||  // Kiểm tra hàng ngang
           checkDirection(row, col, mark, 0, 1) ||  // Kiểm tra cột dọc
           checkDirection(row, col, mark, 1, 1) ||  // Kiểm tra chéo từ trái trên xuống phải dưới
           checkDirection(row, col, mark, 1, -1);   // Kiểm tra chéo từ phải trên xuống trái dưới
}

// Hàm kiểm tra trong một hướng cụ thể
function checkDirection(row, col, mark, rowDir, colDir) {
    let count = 1; // Bắt đầu với 1 quân ở vị trí hiện tại

    // Kiểm tra về phía trước (hướng rowDir, colDir)
    let r = row + rowDir;
    let c = col + colDir;
    while (r >= 0 && r < size && c >= 0 && c < size && cells[r][c].innerHTML === mark) {
        count++;
        r += rowDir;
        c += colDir;
    }

    // Kiểm tra về phía sau (ngược hướng rowDir, colDir)
    r = row - rowDir;
    c = col - colDir;
    while (r >= 0 && r < size && c >= 0 && c < size && cells[r][c].innerHTML === mark) {
        count++;
        r -= rowDir;
        c -= colDir;
    }

    // Nếu có 5 quân liên tiếp trở lên, người chơi thắng
    return count >= 5;
}

// Hàm reset bàn cờ
function resetBoard() {
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            cells[i][j].innerHTML = ''; // Xóa nội dung của tất cả các ô
            cells[i][j].classList.remove('X', 'O'); // Xóa lớp X và O
        }
    }

    // Đổi người chơi bắt đầu với quân X giữa các ván
    startingPlayer = startingPlayer === 'Player 1' ? 'Player 2' : 'Player 1';
    currentPlayer = startingPlayer;

    // Quân X luôn bắt đầu trước
    currentMark = 'X';
}

// Cập nhật bàn cờ khi có người chơi khác đánh
socket.on('updateBoard', (data) => {
    const cell = cells[data.row][data.col];
    if (cell.innerHTML === '') {
        cell.innerHTML = data.mark;
        cell.classList.add(data.mark); // Thêm lớp CSS cho X hoặc O từ người chơi khác
    }
});
