const MODE_SOURCE = 'source';
const MODE_WALL = 'wall';
const MODE_RAG = 'rag';
const MODE_SPONGE = 'sponge';
const MODE_CELL = 'cell';
const DEFULT_MODE = MODE_WALL;

const TYPE_SOURCE = 'source';
const TYPE_WALL = 'wall';
const TYPE_FLOW = 'flow';

const DEFAULT_SPONGE_COOL_TIME = 20;

/** 盤面の高さ */
let H;
/** 盤面の横幅 */
let W;
/** プレイヤー1の名前 */
let P1;
/** プレイヤー2の名前 */
let P2;
/** ターンが回ってきたプレイヤー */
let current_player = 1;
/** 所持する水源の数 */
let sources = { 1: 0, 2: 0 };
/** 各マスを管理する。中身:`{type(null,水源,水流),player,distance}`。0-indexed */
let board = [];
/** 右に仕切りがあるか */
let wallsV = [];
/** 下に仕切りがあるか */
let wallsH = [];
/** 現在のプレイヤーのモード */
let current_mode = MODE_SOURCE;
/** 最後の行動 */
let lastAction = '';
/** 更新されたマス */
let changed = null;
let changes_arr = null;
/** 勝者 */
let result = null;
/** 仕切りの幅(通常時) */
let default_cell_margin = 7;
let locked = false;
let sponge_cool_time = { 1: 0, 2: 0 };

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
document.getElementById('mode-sponge').onclick = () => setMode(MODE_SPONGE);
document.getElementById('reset').onclick = () => confirmReset();

// DEBUG
window.onload = () => {
    // console.log(DEFAULT_CELL_SIZE_PX);
};

function initGame() {
    H = parseInt(document.getElementById('input-h').value);
    W = parseInt(document.getElementById('input-w').value);
    max_strength = H + W - 2;
    P1 = document.getElementById('p1-name').value || 'p1';
    P2 = document.getElementById('p2-name').value || 'p2';
    document.documentElement.style.setProperty('--p1-color', document.getElementById('p1-color').value || document.documentElement.style.getPropertyValue('--p1-color'));
    document.documentElement.style.setProperty('--p2-color', document.getElementById('p2-color').value || document.documentElement.style.getPropertyValue('--p2-color'));

    changed = null;
    changes_arr = null;

    /** 初期の水源の所持数 */
    let initialSources = Math.floor((H + W) / 4);
    sources[1] = initialSources;
    sources[2] = initialSources;

    board = Array.from({ length: H }, () => Array.from({ length: W }, () => ({ type: null, player: null, d: Infinity })));
    wallsV = Array.from({ length: H }, () => Array(W + 1).fill(true));
    wallsH = Array.from({ length: H + 1 }, () => Array(W).fill(true));

    // 表示サイズ初期化
    const WINDOW_SIZE_PX = Math.min(window.innerHeight, window.innerWidth);
    cell_size_px = WINDOW_SIZE_PX * 1.0 / ((Math.max(H, W) + 2) + ((Math.max(H, W) + 2) - 1) / 10.0);
    // x*N + x/10 *(N-1) = SIZE
    // x(N+(N-1)/10)

    document.documentElement.style.setProperty('--cell-size', `${cell_size_px}px`);
    document.documentElement.style.setProperty('--cell-margin', `${cell_size_px / 10.0}px`);
    default_cell_margin = cell_size_px / 10.0;

    init2();

    setupScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    renderBoard();
    updateUI();
}

function init2() {
    locked = true;
    let candidates_wall = [];
    for (let y = 1; y < H; y++) {
        for (let x = 1; x < W; x++) {
            candidates_wall.push({ type: 'v', x: x, y: y });
            candidates_wall.push({ type: 'h', x: x, y: y });
        }
    }

    for (let cnt = 0; cnt < 2; cnt++) {
        let iw = Math.floor(Math.random() * candidates_wall.length);
        let w = candidates_wall[iw];
        candidates_wall.slice(iw, 1);
        current_mode = MODE_WALL;
        action(MODE_WALL, w);
    }

    let candidates_cell = [];
    for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
            if (y !== (H / 2 | 0) || x !== (W / 2 | 0)) {
                candidates_cell.push({ x: x, y: y });
            }
        }
    }
    let idx1 = Math.floor(Math.random() * candidates_cell.length)
    let p1 = candidates_cell[idx1];
    candidates_cell.slice(idx1, 1);
    let idx2 = Math.floor(Math.random() * candidates_cell.length);
    let p2 = candidates_cell[idx2];
    current_mode = MODE_SOURCE;
    action(MODE_CELL, p1);
    action(MODE_CELL, p2);

    setMode(DEFULT_MODE);

    locked = false;
}

function setMode(mode) {
    current_mode = mode;
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`mode-${mode}`).classList.add('active');

    if (mode === MODE_WALL) {
        document.documentElement.style.setProperty('--cell-margin', `${default_cell_margin * 1.3}px`);
    } else {
        document.documentElement.style.setProperty('--cell-margin', `${default_cell_margin}px`);
    }
}

function updateUI() {
    const pName = current_player === 1 ? P1 : P2;
    const color = current_player === 1 ? 'var(--p1-color)' : 'var(--p2-color)';
    document.getElementById('turn-display').innerText = `手番: ${pName}`;
    document.getElementById('turn-display').style.color = color;
    document.getElementById('source-count').innerText = `残り水源: ${sources[current_player]}`;

    let p1Count = 0, p2Count = 0;
    board.flat().forEach(c => {
        if (c.player === 1) p1Count++;
        if (c.player === 2) p2Count++;
    });
    document.getElementById('score-display').innerHTML = `<span class="p1-color-class">${P1}: ${p1Count}</span> | <span class="p2-color-class">${P2}: ${p2Count}</span>`;

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
            cellDiv.onclick = () => action(MODE_CELL, { x: x, y: y });

            if (x < H - 1) {
                const vWall = document.createElement('div');
                vWall.className = `wall-v ${wallsV[y][x + 1] ? '' : 'hidden-wall'}`;
                vWall.style.left = `${(x + 1) * cell_size_px - 3}px`;
                vWall.style.top = `${y * cell_size_px}px`;
                vWall.onclick = (e) => { e.stopPropagation(); action(MODE_WALL, { type: 'v', x: x + 1, y: y }); };
                container.appendChild(vWall);
            }
            if (y < W - 1) {
                const hWall = document.createElement('div');
                hWall.className = `wall-h ${wallsH[y + 1][x] ? '' : 'hidden-wall'}`;
                hWall.style.left = `${x * cell_size_px}px`;
                hWall.style.top = `${(y + 1) * cell_size_px - 3}px`;
                hWall.onclick = (e) => { e.stopPropagation(); action(MODE_WALL, { type: 'h', x: x, y: y + 1 }); };
                container.appendChild(hWall);
            }
            container.appendChild(cellDiv);

        }
    }
}

function action(mode, obj) {
    if (sponge_cool_time[current_player] > 0) {
        sponge_cool_time[current_player]--;
    }

    if (mode === MODE_WALL) {
        handleWallClick(obj.type, obj.x, obj.y);
    }
    else if (mode === MODE_CELL) {
        handleCellClick(obj.x, obj.y);
    }
}

function handleCellClick(x, y) {
    if (current_mode === MODE_SOURCE) {
        if (sources[current_player] <= 0) return log("水源がありません");
        if (board[y][x].type !== null) return log("既に水があります");

        // 直接 board を触らず、予約(changed)だけ行う
        sources[current_player]--;
        changed = { x: x, y: y, type: TYPE_SOURCE, player: current_player, s: max_strength };
        lastAction = MODE_SOURCE;
        endTurn();
    } else if (current_mode === MODE_RAG) {
        if (board[y][x].type === null) return log("水がありません");

        // 水源を消す場合は在庫を戻す
        if (board[y][x].type === TYPE_SOURCE) {
            sources[board[y][x].player]++;
        }
        // 直接 board を触らず、予約(changed)だけ行う
        changed = { x: x, y: y, type: null, player: null, s: 0 };
        lastAction = MODE_RAG;
        endTurn();
    } else if (current_mode === MODE_SPONGE) {
        if (sponge_cool_time[current_player] !== 0) return log(`スポンジのクールタイム中です (残り ${Math.floor(sponge_cool_time[current_player] / 2)} ターン)`);
        // console.log("sponge");
        const size = 2;
        changes_arr = [];
        for (let ny = 0; ny < H; ny++) {
            for (let nx = 0; nx < W; nx++) {
                if (Math.abs(x - nx) + Math.abs(y - ny) <= size) {
                    // 水源を消す場合は在庫を戻す
                    if (board[ny][nx].type === TYPE_SOURCE) {
                        sources[board[ny][nx].player]++;
                    }
                    // 直接 board を触らず、予約(changed)だけ行う
                    changes_arr.push({ x: nx, y: ny, type: null, player: null, s: 0 });
                }
            }
        }
        lastAction = MODE_SPONGE;
        sponge_cool_time[current_player] = DEFAULT_SPONGE_COOL_TIME;
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
    changes_arr = null;
    current_player = current_player === 1 ? 2 : 1;
    renderBoard();
    updateUI();

    if (result !== null) {
        setTimeout(() => {
            alert(`ゲーム終了！ ${result.p1Score} vs ${result.p2Score} で ${result.winner} の勝ち！`);
        }, 100);
    }
}

// 新アルゴリズム
function processCheck() {
    // 1. 水源から届く「理論上の最大強度」を計算
    const potential = calculatePotentialStrengths();
    let newBoard = JSON.parse(JSON.stringify(board));

    for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {

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

            if (!locked && pot.s > 0) {
                if (current.player === null) {
                    // 【空きマスへの拡散】隣に自分の水がある場合のみ、1マス進む
                    if (hasWaterNeighbor(x, y, pot.player)) {
                        newBoard[y][x] = { type: TYPE_FLOW, player: pot.player, s: pot.s };
                    }
                } else if (current.player !== pot.player) {
                    // 【塗り替え】隣に自分の水がある 且つ 強度差が1以上の場合のみ
                    // 水流の強さが上がるなら色を変える
                    if (pot.s - current.s >= 1 && hasWaterNeighbor(x, y, pot.player)) {
                        newBoard[y][x] = { type: TYPE_FLOW, player: pot.player, s: pot.s };
                    }
                } else {
                    // 【既存の自分の水】供給路の強度は一気に更新<s>（ここは即座に伝わって良い）</s>
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
        changed = null;
    }
    if (changes_arr !== null && changes_arr.length > 0) {
        for (let index = 0; index < changes_arr.length; index++) {
            const element = changes_arr[index];
            newBoard[element.y][element.x] = { type: element.type, player: element.player, s: element.s };
        }
        changes_arr.slice(0);
    }


    board = newBoard;
}

/**
 * 水源(Strength: H+W)から全マスへの到達強度を計算
 */
function calculatePotentialStrengths() {
    let potMap = Array.from({ length: H }, () => Array.from({ length: W }, () => ({ player: null, s: 0 })));
    let queue = [];

    // 現在の board にある水源を起点にする
    for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
            if (board[y][x].type === TYPE_SOURCE) {
                potMap[y][x] = { player: board[y][x].player, s: max_strength };
                queue.push({ x, y, p: board[y][x].player, s: max_strength });
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
    if (current_mode !== MODE_WALL) return;

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
    current_player = 1;
    sources = { 1: 0, 2: 0 };
    board = [];
    wallsV = [];
    wallsH = [];
    lastAction = '';
    current_mode = 'source';
    result = null;
    changed = null;
    changes_arr = null;
    sponge_cool_time = { 1: 0, 2: 0 };

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

window.addEventListener('beforeunload', (e) => {
    e.preventDefault();
});