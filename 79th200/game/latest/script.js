const MODE_SOURCE = 'source';
const MODE_WALL = 'wall';
const MODE_RAG = 'rag';
const MODE_SPONGE = 'sponge';
const MODE_CELL = 'cell';
const MODE_SKIP = 'skip';
const DEFAULT_MODE = MODE_WALL;

const TYPE_SOURCE = 'source';
const TYPE_WALL = 'wall';
const TYPE_FLOW = 'flow';

const DEFAULT_SPONGE_COOL_TIME = 16;

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
/** 各マスを管理する。中身:`{type(null,水源,水流),player,distance}`。0-indexed */
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
let changesArr = null;
/** 勝者 */
let result = null;
/** 仕切りの幅(通常時) */
let defaultCellMargin = 7;
/** 操作ロック(内部処理用) */
let locked = false;
let spongeCoolTime = { 1: 0, 2: 0 };
/** 各プレイヤーの水源の初期数 */
let initialSources;
/** ターンカウンター */
let turnCount;
/** 先攻プレイヤー */
let firstPlayer = 1;

/** マスのピクセル数 */
let cellSizePx = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--cell-size'));

/** 設定画面 */
const setupScreen = document.getElementById('setup-screen');
/** 描画画面 */
const gameScreen = document.getElementById('game-screen');

document.getElementById('start-btn').onclick = () => initGame();
document.getElementById('mode-source').onclick = () => setMode(MODE_SOURCE);
document.getElementById('mode-wall').onclick = () => setMode(MODE_WALL);
document.getElementById('mode-rag').onclick = () => setMode(MODE_RAG);
document.getElementById('mode-sponge').onclick = () => setMode(MODE_SPONGE);
document.getElementById('mode-skip').onclick = () => setMode(MODE_SKIP);
document.getElementById('reset').onclick = () => confirmReset();

// DEBUG
window.onload = () => {
    setInterval(startPageReflesh, 1000);
};

function startPageReflesh() {
    document.getElementById("p1-name-show").innerText = document.getElementById("p1-name").value;
    document.getElementById("p2-name-show").innerText = document.getElementById("p2-name").value;
}

// --- 32行目付近（changed や changesArr の近く）に追加 ---
let lastWall = null;

/** ターンごとのグローバル変数の初期化 */
function initVars() {
    currentPlayer = 1;
    sources = { 1: 0, 2: 0 };
    board = [];
    wallsV = [];
    wallsH = [];
    lastAction = '';
    currentMode = DEFAULT_MODE;
    result = null;
    changed = null;
    changesArr = null;
    lastWall = null; // ★追加
    spongeCoolTime = { 1: 0, 2: 0 };
    turnCount = 1;
}

/** 初期化 */
function initGame() {
    initVars();
    H = parseInt(document.getElementById('input-size').value); // 盤面の高さ
    W = parseInt(document.getElementById('input-size').value); // 盤面の幅
    if (H > 100 || W > 100) { console.log("The size is too big."); alert("サイズが大きすぎます"); return; }
    else if (H == 1 || W == 1) { console.log("The size is too small."); alert("サイズが小さすぎます"); return; }
    maxStrength = H + W - 2; // 水源の強さ
    P1 = document.getElementById('p1-name').value || 'p1';
    P2 = document.getElementById('p2-name').value || 'p2';
    document.documentElement.style.setProperty('--p1-color', document.getElementById('p1-color').value || document.documentElement.style.getPropertyValue('--p1-color'));
    document.documentElement.style.setProperty('--p2-color', document.getElementById('p2-color').value || document.documentElement.style.getPropertyValue('--p2-color'));

    /** 初期の水源の所持数 */
    initialSources = Math.floor((H + W) / 4);
    sources[1] = initialSources;
    sources[2] = initialSources;

    board = Array.from({ length: H }, () => Array.from({ length: W }, () => ({ type: null, player: null, d: Infinity })));
    wallsV = Array.from({ length: H }, () => Array(W + 1).fill(true));
    wallsH = Array.from({ length: H + 1 }, () => Array(W).fill(true));

    // 表示サイズ初期化
    const WINDOW_SIZE_PX = Math.min(window.innerHeight, window.innerWidth);
    const num = Math.max(H, W);
    cellSizePx = WINDOW_SIZE_PX * 1.0 / (num + 2);
    // console.log(cell_size_px);

    // x*N + x/10 *(N-1) = SIZE
    // x(N+(N-1)/10)

    document.documentElement.style.setProperty('--cell-size', `${cellSizePx}px`);
    document.documentElement.style.setProperty('--cell-margin', `${cellSizePx / 10.0}px`);
    defaultCellMargin = cellSizePx / 10.0;

    init2();

    setupScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    renderBoard();
    updateUI();
}

/** ランダムな盤面を作成 */
function init2() {
    locked = true;
    let candidatesWall = [];
    for (let y = 1; y < H; y++) {
        for (let x = 1; x < W; x++) {
            candidatesWall.push({ type: 'v', x: x, y: y });
            candidatesWall.push({ type: 'h', x: x, y: y });
        }
    }

    const loop = (H + W) / 2;
    for (let cnt = 0; cnt < loop; cnt++) {
        let iw = Math.floor(Math.random() * candidatesWall.length);
        let w = candidatesWall[iw];
        candidatesWall.slice(iw, 1);
        currentMode = MODE_WALL;
        action(MODE_WALL, w);
    }

    let candidatesCell = [];
    for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
            if (y !== (H / 2 | 0) || x !== (W / 2 | 0)) {
                candidatesCell.push({ x: x, y: y });
            }
        }
    }
    let idx1 = 0;
    let idx2 = 0;
    while (idx1 == idx2) {
        idx1 = Math.floor(Math.random() * candidatesCell.length)
        idx2 = Math.floor(Math.random() * candidatesCell.length);
    }
    let p1 = candidatesCell[idx1];
    let p2 = candidatesCell[idx2];
    currentMode = MODE_SOURCE;
    action(MODE_CELL, p1);
    action(MODE_CELL, p2);

    setMode(DEFAULT_MODE);

    firstPlayer = document.querySelector('input[name="first"]:checked')?.value === "random" ? (Math.random() < 0.5 ? 1 : 2) : Number(document.querySelector('input[name="first"]:checked')?.value);
    alert(`先攻 : ${firstPlayer == 1 ? P1 : P2}`);
    currentPlayer = firstPlayer;
    locked = false;
}

function setMode(mode) {
    currentMode = mode;
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`mode-${mode}`).classList.add('active');

    if (mode === MODE_WALL) {
        document.documentElement.style.setProperty('--cell-margin', `${defaultCellMargin * 1.3}px`);
    } else {
        document.documentElement.style.setProperty('--cell-margin', `${defaultCellMargin}px`);
    }

    if (mode === MODE_SKIP) {
        action(MODE_SKIP, null);
    }
}

function updateUI() {
    const pName = currentPlayer === 1 ? P1 : P2;
    const color = currentPlayer === 1 ? 'var(--p1-color)' : 'var(--p2-color)';
    document.getElementById('turn-display').innerText = `手番: ${pName}`;
    document.getElementById('turn-display').style.color = color;
    document.getElementById('source-count').innerText = `残り水源: ${sources[currentPlayer]} / ${initialSources}`;
    document.getElementById('sponge-cooltime').innerText = spongeCoolTime[currentPlayer] > 0 ? `(${spongeCoolTime[currentPlayer]})` : "";
    document.getElementById('turn-count').innerText = `${Math.floor(turnCount)} ターン目`;

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
    container.style.gridTemplateColumns = `repeat(${H}, ${cellSizePx}px)`;

    for (let y = 0; y < W; y++) {
        for (let x = 0; x < H; x++) {
            const cell = board[y][x];
            const cellDiv = document.createElement('div');

            cellDiv.innerText = cell.s > 0 ? cell.s : '';
            cellDiv.style.fontSize = `${cellSizePx / 3}px`;

            cellDiv.className = `cell ${cell.player ? 'p' + cell.player : ''} ${cell.type === TYPE_SOURCE ? 'source' : ''}`;

            // ★追加：セルの座標を特定するための属性
            cellDiv.setAttribute('data-x', x);
            cellDiv.setAttribute('data-y', y);

            cellDiv.onclick = () => action(MODE_CELL, { x: x, y: y });

            if (x < H - 1) {
                const vWall = document.createElement('div');
                vWall.className = `wall-v ${wallsV[y][x + 1] ? '' : 'hidden-wall'}`;

                // ★追加：垂直壁の座標を特定するための属性
                vWall.setAttribute('data-wall-v', `${x + 1}-${y}`);

                vWall.style.left = `${(x + 1) * cellSizePx - 3}px`;
                vWall.style.top = `${y * cellSizePx}px`;
                vWall.onclick = (e) => { e.stopPropagation(); action(MODE_WALL, { type: 'v', x: x + 1, y: y }); };
                container.appendChild(vWall);
            }
            if (y < W - 1) {
                const hWall = document.createElement('div');
                hWall.className = `wall-h ${wallsH[y + 1][x] ? '' : 'hidden-wall'}`;

                // ★追加：水平壁の座標を特定するための属性
                hWall.setAttribute('data-wall-h', `${x}-${y + 1}`);

                hWall.style.left = `${x * cellSizePx}px`;
                hWall.style.top = `${(y + 1) * cellSizePx - 3}px`;
                hWall.onclick = (e) => { e.stopPropagation(); action(MODE_WALL, { type: 'h', x: x, y: y + 1 }); };
                container.appendChild(hWall);
            }
            container.appendChild(cellDiv);
        }
    }
}

function action(mode, obj) {
    if (mode === MODE_WALL) {
        handleWallClick(obj.type, obj.x, obj.y);
    }
    else if (mode === MODE_CELL) {
        handleCellClick(obj.x, obj.y);
    }
    else if (mode === MODE_SKIP) {
        setTimeout(endTurn, 50);
    }
}

function handleCellClick(x, y) {
    if (currentMode === MODE_SOURCE) {
        if (sources[currentPlayer] <= 0) return log("水源がありません");
        if (board[y][x].type !== null) return log("既に水があります");

        // 直接 board を触らず、予約(changed)だけ行う
        sources[currentPlayer]--;
        changed = { x: x, y: y, type: TYPE_SOURCE, player: currentPlayer, s: maxStrength };
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
    } else if (currentMode === MODE_SPONGE) {
        if (spongeCoolTime[currentPlayer] !== 0) return log(`スポンジのクールタイム中です (残り ${spongeCoolTime[currentPlayer]} ターン)`);
        const size = Math.floor((H + W) / 4);
        changesArr = [];
        for (let ny = 0; ny < H; ny++) {
            for (let nx = 0; nx < W; nx++) {
                if (Math.abs(x - nx) + Math.abs(y - ny) <= size) {
                    // 水源を消す場合は在庫を戻す
                    if (board[ny][nx].type === TYPE_SOURCE) {
                        sources[board[ny][nx].player]++;
                    }
                    // 直接 board を触らず、予約(changed)だけ行う
                    changesArr.push({ x: nx, y: ny, type: null, player: null, s: 0 });
                }
            }
        }
        lastAction = MODE_SPONGE;
        spongeCoolTime[currentPlayer] = DEFAULT_SPONGE_COOL_TIME;
        endTurn();
    }
}

function getAdjacentByWall(type, x, y) {
    return type === 'v' ? [{ x: x - 1, y }, { x, y }] : [{ x, y: y - 1 }, { x, y }];
}

function endTurn() {
    // ★修正1：processCheck() が走る前に、現在の操作情報をすべて安全に退避する
    const effectAction = lastAction;
    const effectChanged = changed ? { ...changed } : null;
    const effectChangesArr = changesArr ? [...changesArr] : null;
    const effectWall = lastWall ? { ...lastWall } : null;

    // 1. 強度に基づいた拡散・減衰計算
    processCheck();

    // 2. 状態のクリアと交代
    changed = null;      
    changesArr = null;   
    lastWall = null;     // ★修正2：壁の記憶もここでしっかりクリアする
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    
    // 盤面の再描画
    renderBoard();

    // ★修正3：コメントアウトを解除し、一括管理している triggerEffects を呼び出す
    // （個別に書いていた雑巾やスポンジのコードは削除し、こちらに集約させます）
    triggerEffects(effectAction, effectChanged, effectChangesArr, effectWall);

    if (!locked) {
        // ターンカウントを上げる
        turnCount += 0.5;
    }

    if (spongeCoolTime[currentPlayer] > 0) {
        spongeCoolTime[currentPlayer]--;
    }

    updateUI();

    if (result !== null) {
        setTimeout(() => {
            if (result.winner === "引き分け") {
                alert(`ゲーム終了！ 引き分け！`)
            }
            else {
                alert(`ゲーム終了！ ${result.p1Score} vs ${result.p2Score} で ${result.winner} の勝ち！`);
            }
        }, 100);
    }

    setTimeout(() => { setMode(DEFAULT_MODE); }, 100);
}

// ★丸ごと新規追加：エフェクトをトリガーする関数
function triggerEffects(actionType, changedObj, changesArrObj, wallObj) {
    // 1. 水源設置エフェクト
    if (actionType === MODE_SOURCE && changedObj) {
        const el = document.querySelector(`.cell[data-x="${changedObj.x}"][data-y="${changedObj.y}"]`);
        if (el) el.classList.add('effect-source');
    }
    // 2. 雑巾エフェクト
    else if (actionType === MODE_RAG && changedObj) {
        const el = document.querySelector(`.cell[data-x="${changedObj.x}"][data-y="${changedObj.y}"]`);
        if (el) el.classList.add('effect-rag');
    }
    // 3. スポンジエフェクト（複数マス）
    else if (actionType === MODE_SPONGE && changesArrObj) {
        changesArrObj.forEach(obj => {
            const el = document.querySelector(`.cell[data-x="${obj.x}"][data-y="${obj.y}"]`);
            if (el) el.classList.add('effect-sponge');
        });
    }
    // 4. 仕切り操作（設置・撤去）エフェクト
    else if ((actionType === 'place' || actionType === 'remove') && wallObj) {
        const attr = wallObj.type === 'v' ? `data-wall-v="${wallObj.x}-${wallObj.y}"` : `data-wall-h="${wallObj.x}-${wallObj.y}"`;
        const el = document.querySelector(`[${attr}]`);
        if (el) {
            el.classList.add(actionType === 'place' ? 'effect-wall-place' : 'effect-wall-remove');
        }
    }
}

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
                    if (pot.s - current.s >= 1 && hasWaterNeighbor(x, y, pot.player)) {
                        newBoard[y][x] = { type: TYPE_FLOW, player: pot.player, s: pot.s };
                    }
                } else {
                    // 【既存の自分の水】供給路の強度は一気に更新
                    newBoard[y][x].s = pot.s;
                }
            } else if (!locked) {
                // --- 生きている供給がない（pot.s === 0）場合の処理 ---
                if (current.player === null) {
                    // 【供給断絶中の水流からの拡散（1ターン遅れて発生）】
                    // 壁がない隣接マスを見渡して、最も強度の高い水流（s >= 2）を探す
                    let bestNeighbor = null;
                    const neighbors = [
                        { nx: x + 1, ny: y, wall: () => wallsV[y][x + 1] },
                        { nx: x - 1, ny: y, wall: () => wallsV[y][x] },
                        { nx: x, ny: y + 1, wall: () => wallsH[y + 1][x] },
                        { nx: x, ny: y - 1, wall: () => wallsH[y][x] }
                    ];

                    neighbors.forEach(({ nx, ny, wall }) => {
                        if (nx >= 0 && nx < H && ny >= 0 && ny < W && !wall()) {
                            const neighborCell = board[ny][nx];
                            // 隣に水があり、強度が2以上（拡散可能）なら候補にする
                            if (neighborCell.player !== null && neighborCell.s >= 2) {
                                if (!bestNeighbor || neighborCell.s > bestNeighbor.s) {
                                    bestNeighbor = neighborCell;
                                }
                            }
                        }
                    });

                    // もし条件に合う強い水流が隣にあれば、その強度 - 2 で流れ込む
                    if (bestNeighbor) {
                        newBoard[y][x] = { type: TYPE_FLOW, player: bestNeighbor.player, s: bestNeighbor.s - 2 };
                    }
                } else if (current.player !== null && current.type !== TYPE_SOURCE) {
                    // 【供給断絶】既存の水は強度が1減る（元の減衰処理）
                    newBoard[y][x].s -= 1;
                    if (newBoard[y][x].s <= 0) {
                        newBoard[y][x] = { type: null, player: null, s: 0 };
                    }
                }
            }

        }
    }

    // 最後に予約された操作(水源設置/雑巾)を適用
    if (changed !== null) {
        newBoard[changed.y][changed.x] = { type: changed.type, player: changed.player, s: changed.s };
    }

    if (changesArr !== null && changesArr.length > 0) {
        for (let index = 0; index < changesArr.length; index++) {
            const element = changesArr[index];
            newBoard[element.y][element.x] = { type: element.type, player: element.player, s: element.s };
        }
        // changesArr = null; // ★ここを削除（またはコメントアウト）
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
                potMap[y][x] = { player: board[y][x].player, s: maxStrength };
                queue.push({ x, y, p: board[y][x].player, s: maxStrength });
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

    // ★追加：壁の位置情報を記録
    lastWall = { type, x, y };

    if (isExist) {
        if (c1.player && c2.player && c1.player !== c2.player) {
            if (Math.abs(c1.s - c2.s) < 2) {
                return log(`撤去不可: 強度の差が2以上必要 (${c1.s} vs ${c2.s})`);
            }
        }
        if (type === 'v') wallsV[y][x] = false; else wallsH[y][x] = false;
        lastAction = 'remove';
    } else {
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
    // 1. 画面表示の切り替え
    gameScreen.classList.add('hidden');
    setupScreen.classList.remove('hidden');

    // 2. モードボタンの見た目を初期状態に戻す
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