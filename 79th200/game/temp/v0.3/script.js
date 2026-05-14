const MODE_SOURCE = 'source';
const MODE_WALL = 'wall';
const MODE_RAG = 'rag';

const TYPE_SOURCE = 'source';
const TYPE_WALL = 'wall';
const TYPE_FLOW = 'flow';

/** 盤面の高さ */
let H;
/** 盤面の横幅 */
let W;
/** プレイヤー1の名前 */
let P1;
/** プレイヤー2の名前 */
let P2;
/** ターンが回ってきたプレイヤー */
let currentPlayer = 1;
/** 所持する水源の数 */
let sources = { 1: 0, 2: 0 };
/** 各マスを管理する。中身:{type(null,水源,水流),player,distance} */
let board = [];
/** 右に仕切りがあるか */
let wallsV = [];
/** 下に仕切りがあるか */
let wallsH = [];
/** 現在のプレイヤーのモード */
let currentMode = MODE_SOURCE;
/** 最後の行動 */
let lastAction = '';
/** 更新されたマス */
let changed = null;
/** 勝者 */
let result = null;

/** マスのピクセル数 */
let cell_size_px = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--cell-size'));

/** 設定画面 */
const setupScreen = document.getElementById('setup-screen');
/** 描画画面 */
const gameScreen = document.getElementById('game-screen');

document.getElementById('start-btn').onclick = initGame;
document.getElementById('mode-source').onclick = () => setMode(MODE_SOURCE);
document.getElementById('mode-wall').onclick = () => setMode(MODE_WALL);
document.getElementById('mode-rag').onclick = () => setMode(MODE_RAG);

// DEBUG
window.onload = () => {
    // console.log(DEFAULT_CELL_SIZE_PX);
};

function initGame() {
    H = parseInt(document.getElementById('input-h').value);
    W = parseInt(document.getElementById('input-w').value);
    P1 = document.getElementById('p1-name').value || 'p1';
    P2 = document.getElementById('p2-name').value || 'p2';
    changed = null;

    /** 初期の水源の所持数 */
    let initialSources = Math.floor((H + W) / 4);
    sources[1] = initialSources;
    sources[2] = initialSources;

    board = Array.from({ length: W }, () => Array.from({ length: H }, () => ({ type: null, player: null, d: Infinity })));
    wallsV = Array.from({ length: W }, () => Array(H + 1).fill(true));
    wallsH = Array.from({ length: W + 1 }, () => Array(H).fill(true));

    // 表示サイズ初期化
    const WINDOW_SIZE_PX = Math.min(window.innerHeight, window.innerWidth);
    cell_size_px = WINDOW_SIZE_PX * 1.0 / ((Math.max(H, W) + 2) + ((Math.max(H, W) + 2) - 1) / 10.0);
    // x*N + x/10 *(N-1) = SIZE
    // x(N+(N-1)/10)

    document.documentElement.style.setProperty('--cell-size', `${cell_size_px}px`);
    document.documentElement.style.setProperty('--cell-margin', `${cell_size_px / 10.0}px`);

    setupScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    renderBoard();
    updateUI();
}

function setMode(mode) {
    currentMode = mode;
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`mode-${mode}`).classList.add('active');
}

function updateUI() {
    const pName = currentPlayer === 1 ? P1 : P2;
    const color = currentPlayer === 1 ? 'var(--p1-color)' : 'var(--p2-color)';
    document.getElementById('turn-display').innerText = `手番: ${pName}`;
    document.getElementById('turn-display').style.color = color;
    document.getElementById('source-count').innerText = `残り水源: ${sources[currentPlayer]}`;

    let p1Count = 0, p2Count = 0;
    board.flat().forEach(c => {
        if (c.player === 1) p1Count++;
        if (c.player === 2) p2Count++;
    });
    document.getElementById('score-display').innerText = `${P1}: ${p1Count} | ${P2}: ${p2Count}`;

    if (p1Count + p2Count === H * W) {
        const winner = p1Count > p2Count ? P1 : (p2Count > p1Count ? P2 : "引き分け");
        result = { winner: winner, p1Score: p1Count, p2Score: p2Count };
    }
}

function renderBoard() {
    const container = document.getElementById('board');
    container.innerHTML = '';
    container.style.gridTemplateColumns = `repeat(${H}, ${cell_size_px}px)`; // 空白NG!

    for (let y = 0; y < W; y++) {
        for (let x = 0; x < H; x++) {
            const cell = board[y][x];
            const cellDiv = document.createElement('div');

            // --- ここを修正：強さ(s)を表示する ---
            // 強さが 0 より大きい場合のみ数値を表示、それ以外は空にする
            cellDiv.innerText = cell.s > 0 ? cell.s : '';

            cellDiv.className = `cell ${cell.player ? 'p' + cell.player : ''} ${cell.type === TYPE_SOURCE ? TYPE_SOURCE : ''}`;
            // cellDiv.innerText = (cell.d === undefined || cell.d === Infinity) ? '' : cell.d; // 変更
            cellDiv.onclick = () => handleCellClick(x, y);

            if (x < H - 1) {
                const vWall = document.createElement('div');
                vWall.className = `wall-v ${wallsV[y][x + 1] ? '' : 'hidden-wall'}`;
                vWall.style.left = `${(x + 1) * cell_size_px - 3}px`;
                vWall.style.top = `${y * cell_size_px}px`;
                vWall.onclick = (e) => { e.stopPropagation(); handleWallClick('v', x + 1, y); };
                container.appendChild(vWall);
            }
            if (y < W - 1) {
                const hWall = document.createElement('div');
                hWall.className = `wall-h ${wallsH[y + 1][x] ? '' : 'hidden-wall'}`;
                hWall.style.left = `${x * cell_size_px}px`;
                hWall.style.top = `${(y + 1) * cell_size_px - 3}px`;
                hWall.onclick = (e) => { e.stopPropagation(); handleWallClick('h', x, y + 1); };
                container.appendChild(hWall);
            }
            container.appendChild(cellDiv);

        }
    }
}

function handleCellClick(x, y) {
    if (currentMode === MODE_SOURCE) {
        if (sources[currentPlayer] <= 0) return log("水源がありません");
        if (board[y][x].type !== null) return log("既に水があります");

        // 直接 board を触らず、予約(changed)だけ行う
        sources[currentPlayer]--;
        changed = { x: x, y: y, type: TYPE_SOURCE, player: currentPlayer, s: H + W };
        lastAction = MODE_SOURCE;
        endTurn();
    } else if (currentMode === MODE_RAG) {
        if (board[y][x].type === null) return log("水がありません");

        // 水源を消す場合は在庫を戻す
        if (board[y][x].type === TYPE_SOURCE) {
            sources[board[y][x].player]++;
        }
        // 直接 board を触らず、予約(changed)だけ行う
        changed = { x: x, y: y, type: null, player: null, s: 0 };
        lastAction = MODE_RAG;
        endTurn();
    }
}

function getAdjacentByWall(type, x, y) {
    return type === 'v' ? [{ x: x - 1, y }, { x, y }] : [{ x, y: y - 1 }, { x, y }];
}

function endTurn() {
    // 1. 強度に基づいた拡散・減衰計算
    processCheck();

    // 2. 状態のクリアと交代
    changed = null;
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    renderBoard();
    updateUI();

    if (result !== null) {
        setTimeout(() => {
            alert(`ゲーム終了！ ${result.p1Score} vs ${result.p2Score} で ${result.winner} の勝ち！`);
        }, 100);
    }
}

// 旧アルゴリズム
/**
 * 盤面のメインロジック
 */
// function processCheck() {
//     // 1. 現在の水源から「届くはずの強度」をシミュレーション
//     // (まだ新しく置こうとしている水源は board に入っていないので計算に含まれない)
//     const potential = calculatePotentialStrengths();

//     // 2. 盤面のコピーを作成して計算
//     let newBoard = JSON.parse(JSON.stringify(board));

//     for (let y = 0; y < W; y++) {
//         for (let x = 0; x < H; x++) {
//             const pot = potential[y][x];
//             const current = board[y][x];

//             if (pot.s > 0) {
//                 // 水が届いている場合
//                 if (current.player === null || current.player === pot.player) {
//                     // 空きマスへの広がり、または同色の更新
//                     newBoard[y][x] = { type: current.type || TYPE_FLOW, player: pot.player, s: pot.s };
//                 } else {
//                     // 敵対色がある場合：強度の差が2以上なら塗り替え
//                     if (pot.s - current.s >= 2) {
//                         newBoard[y][x] = { type: TYPE_FLOW, player: pot.player, s: pot.s };
//                     }
//                     // 差が2未満なら今の色を維持（または必要に応じて自動仕切り）
//                 }
//             } else if (current.player !== null) {
//                 // 水源から切り離されている場合
//                 if (current.type !== TYPE_SOURCE) {
//                     newBoard[y][x].s -= 1; // 強度を減衰
//                     if (newBoard[y][x].s <= 0) {
//                         newBoard[y][x] = { type: null, player: null, s: 0 };
//                     }
//                 }
//             }
//         }
//     }

//     // --- ここが今回のポイント：最後に予約(changed)を適用 ---
//     if (changed !== null) {
//         newBoard[changed.y][changed.x] = {
//             type: changed.type,
//             player: changed.player,
//             s: changed.s
//         };
//     }

//     board = newBoard;
// }

// 新アルゴリズム
function processCheck() {
    // 1. 水源から届く「理論上の最大強度」を計算
    const potential = calculatePotentialStrengths();
    let newBoard = JSON.parse(JSON.stringify(board));

    for (let y = 0; y < W; y++) {
        for (let x = 0; x < H; x++) {

            // 右隣との判定
            if (x < H - 1) {
                const a = board[y][x];
                const b = board[y][x + 1];
                // 両方に水があり、色が異なり、強度の差が2未満の場合
                if (a.player && b.player && a.player !== b.player) {
                    if (Math.abs(a.s - b.s) < 2) {
                        wallsV[y][x + 1] = true; // 垂直な壁を生成
                    }
                }
            }

            // 下隣との判定
            if (y < W - 1) {
                const a = board[y][x];
                const b = board[y + 1][x];
                // 両方に水があり、色が異なり、強度の差が2未満の場合
                if (a.player && b.player && a.player !== b.player) {
                    if (Math.abs(a.s - b.s) < 2) {
                        wallsH[y + 1][x] = true; // 水平な壁を生成
                    }
                }
            }

            const pot = potential[y][x]; // 水源から計算された強度とプレイヤー
            const current = board[y][x]; // 現在の盤面の状態

            if (pot.s > 0) {
                if (current.player === null) {
                    // 【空きマスへの拡散】隣に自分の水がある場合のみ、1マス進む
                    if (hasWaterNeighbor(x, y, pot.player)) {
                        newBoard[y][x] = { type: TYPE_FLOW, player: pot.player, s: pot.s };
                    }
                } else if (current.player !== pot.player) {
                    // 【塗り替え】隣に自分の水がある 且つ 強度差が2以上の場合のみ
                    if (pot.s - current.s >= 2 && hasWaterNeighbor(x, y, pot.player)) {
                        newBoard[y][x] = { type: TYPE_FLOW, player: pot.player, s: pot.s };
                    }
                } else {
                    // 【既存の自分の水】供給路の強度は一気に更新（ここは即座に伝わって良い）
                    newBoard[y][x].s = pot.s;
                }
            } else if (current.player !== null && current.type !== TYPE_SOURCE) {
                // 【供給断絶】強度が1減る
                newBoard[y][x].s -= 1;
                if (newBoard[y][x].s <= 0) {
                    newBoard[y][x] = { type: null, player: null, s: 0 };
                }
            }
        }
    }

    // 最後に予約された操作(水源設置/雑巾)を適用
    if (changed !== null) {
        newBoard[changed.y][changed.x] = { type: changed.type, player: changed.player, s: changed.s };
    }



    board = newBoard;
}

/**
 * 水源(Strength: H+W)から全マスへの到達強度を計算
 */
function calculatePotentialStrengths() {
    let potMap = Array.from({ length: W }, () => Array.from({ length: H }, () => ({ player: null, s: 0 })));
    let queue = [];

    // 現在の board にある水源を起点にする
    for (let y = 0; y < W; y++) {
        for (let x = 0; x < H; x++) {
            if (board[y][x].type === TYPE_SOURCE) {
                potMap[y][x] = { player: board[y][x].player, s: H + W };
                queue.push({ x, y, p: board[y][x].player, s: H + W });
            }
        }
    }

    while (queue.length > 0) {
        let { x, y, p, s } = queue.shift();
        if (s <= 1) continue;

        const neighbors = [
            { nx: x + 1, ny: y, wall: () => wallsV[y][x + 1] },
            { nx: x - 1, ny: y, wall: () => wallsV[y][x] },
            { nx: x, ny: y + 1, wall: () => wallsH[y + 1][x] },
            { nx: x, ny: y - 1, wall: () => wallsH[y][x] }
        ];

        neighbors.forEach(({ nx, ny, wall }) => {
            if (nx >= 0 && nx < H && ny >= 0 && ny < W && !wall()) {
                if (potMap[ny][nx].s < s - 1) {
                    potMap[ny][nx] = { player: p, s: s - 1 };
                    queue.push({ x: nx, y: ny, p, s: s - 1 });
                }
            }
        });
    }
    return potMap;
}

function handleWallClick(type, x, y) {
    if (currentMode !== MODE_WALL) return;

    const isExist = type === 'v' ? wallsV[y][x] : wallsH[y][x];
    const adjPos = getAdjacentByWall(type, x, y);
    const [c1, c2] = adjPos.map(p => board[p.y][p.x]);

    if (isExist) {
        // 撤去時：異なる色の水があるなら「強度の差」が2以上必要
        if (c1.player && c2.player && c1.player !== c2.player) {
            if (Math.abs(c1.s - c2.s) < 2) {
                return log(`撤去不可: 強度の差が2以上必要 (${c1.s} vs ${c2.s})`);
            }
        }
        if (type === 'v') wallsV[y][x] = false; else wallsH[y][x] = false;
        lastAction = 'remove';
    } else {
        // 設置：自由
        if (type === 'v') wallsV[y][x] = true; else wallsH[y][x] = true;
        lastAction = 'place';
    }
    endTurn();
}

/**
 * 指定した座標の隣に、特定のプレイヤーの水(強度1以上)が既に存在するか確認する
 */
function hasWaterNeighbor(x, y, p) {
    const neighbors = [
        { nx: x + 1, ny: y, wall: () => wallsV[y][x + 1] },
        { nx: x - 1, ny: y, wall: () => wallsV[y][x] },
        { nx: x, ny: y + 1, wall: () => wallsH[y + 1][x] },
        { nx: x, ny: y - 1, wall: () => wallsH[y][x] }
    ];
    // 1. 範囲内である 2. 壁がない 3. 指定したプレイヤーの水がある 4. 強度が1以上
    return neighbors.some(n =>
        n.nx >= 0 && n.nx < H && n.ny >= 0 && n.ny < W &&
        !n.wall() && board[n.ny][n.nx].player === p && board[n.ny][n.nx].s > 0
    );
}

function log(msg) {
    const logEl = document.getElementById('message-log');
    logEl.innerText = msg;
    logEl.style.color = "red";
    setTimeout(() => { if (logEl.innerText === msg) logEl.innerText = ""; }, 3000);
}


function confirmReset() {
    if (confirm("ゲームをリセットして設定画面に戻りますか？")) {
        resetGame();
    }
}

function resetGame() {
    // 1. グローバル変数の初期化
    currentPlayer = 1;
    sources = { 1: 0, 2: 0 };
    board = [];
    wallsV = [];
    wallsH = [];
    lastAction = '';
    currentMode = 'source';
    result = null;

    // 2. 画面表示の切り替え
    gameScreen.classList.add('hidden');
    setupScreen.classList.remove('hidden');

    // 3. モードボタンの見た目を初期状態に戻す
    setMode('source');

    // メッセージログをクリア
    document.getElementById('message-log').innerText = "";
}


// 画面サイズに合わせてマスのサイズを計算する関数
function adjustCellSize() {
    const container = document.getElementById('board-container');
    if (!container) return;

    const padding = 40; // 余白
    const availableWidth = container.clientWidth - padding;
    const availableHeight = container.clientHeight - padding;

    // 縦横どちらかに収まる最大のサイズを計算
    const sizeW = availableWidth / H; // 横幅ベース
    const sizeH = availableHeight / W; // 高さベース
    const optimalSize = Math.floor(Math.min(sizeW, sizeH));

    // CSS変数へセット
    document.documentElement.style.setProperty('--cell-size', `${optimalSize}px`);
    document.documentElement.style.setProperty('--cols', H);
}