// 問題:難易度
var data = { 1: 1, 2: 3, 3: 2, 4: 2, 5: 3, 6: 2, 7: 2, 8: 3, 9: 3, 10: 2, 11: 3, 12: 3, 13: 4, 14: 2, 15: 3, 16: 4, 17: 2, 18: 2, 19: 3, 20: 3, 21: 3, 22: 3, 23: 3, 24: 2, 25: 2, 26: 2, 27: 2, 28: 3, 29: 3, 30: 3, 31: 3, 32: 3, 33: 2, 34: 2, 35: 2, 36: 2, 37: 1, 38: 2, 39: 3, 40: 3, 41: 3, 42: 2, 43: 3, 44: 3, 45: 4, 46: 4, 47: 2, 48: 2, 49: 2, 50: 2, 51: 2, 52: 3, 53: 2, 54: 2, 55: 3, 56: 2, 57: 3, 58: 4, 59: 3, 60: 2, 61: 2, 62: 4, 63: 2, 70: 3, 72: 4, E1: 2, E2: 3, E3: 3, E4: 2, E5: 3, E6: 3, E7: 2, E8: 2, E9: 3, E10: 3, E11: 3, E12: 4, E13: 2, E14: 3, E15: 3, E16: 4, E17: 2, E18: 3, E19: 2, E20: 3, E21: 3, E22: 4, E23: 4, E24: 2, E25: 2, E26: 3, E27: 4, E28: 3, E29: 2, E30: 4, E31: 4, E32: 4, E33: 4, E34: 2, E35: 2, E36: 3, E37: 2, E38: 3, E39: 3, E40: 3, E41: 3, E42: 3, E43: 2, E44: 4, E45: 4, E46: 2, E47: 4, E48: 2, E49: 2, E51: 3, E52: 2, E53: 4 };
var entry = Object.entries(data);
var cur_idx = 0;
var all_used = false;
var used = new Set();
var diff_min = 1;
var diff_max = 5;
var diff_from = diff_min;
// included
var diff_to = diff_max;
var target = [];
var difficulty_map = new Map();
var solved_str = "";
for (let i = diff_min; i <= diff_max; i++) {
    difficulty_map.set(i, new Array());
}
for (let i = 0; i < entry.length; i++) {
    difficulty_map.get(entry[i][1]).push(entry[i])
}
for (let i = diff_from; i <= diff_to; i++) {
    target = target.concat(difficulty_map.get(i));
}
target = shuffle(target);


// `a` is included but `b` is not included.
function randint(a, b) {
    return Math.floor(Math.random() * (b - a)) + a;
}
/**
 * 配列をシャッフルする
 * 参考 : https://programing-knowledge.net/javascript-shuffle-function/
 * @param {Array} array 
 * @returns シャッフルした配列
 */
function shuffle(array) {
    for (let i = array.length - 1; i >= 0; i--) {
        const j = randint(0, i + 1);
        [array[i], array[j]] = [array[j], array[i]];
    }
    console.log("shuffled");
    return array;
}
function next() {
    if (target.length == 0) {
        return null;
    }
    let done = false;
    if (all_used) {
        cur_idx = (cur_idx + 1) % target.length;
    } else {
        for (let index = cur_idx + 1; index < target.length; index++) {
            const element = target[index];
            if (!used.has(element[0])) {
                cur_idx = index;
                done = true;
                break;
            }
        }
        if (!done) {
            cur_idx = 0;
            all_used = true;
        }
    }
    console.log(target[cur_idx][0], target[cur_idx][1]);
    used.add(target[cur_idx][0]);
    solved_str += (solved_str === "" ? "" : ",") + target[cur_idx][0];
    return target[cur_idx];
}
function show_next(id) {
    const etr = next();
    if (etr == null) {
        document.getElementById(id).innerHTML = "全部解いてしまった!";
        return;
    }
    document.getElementById(id).innerHTML = "問題名 : " + (etr[0].substring(0, 1) === "E" ? "Exersize " + etr[0].substring(1, etr[0].length) : etr[0])
        + " , " + "難易度 : " + "<span class=\"diff_" + etr[1] + "\">" + etr[1] + "</span>";
    print_solved();
}
function init(id_solved, id_from, id_to, id_notice) {
    used = new Set(document.getElementById(id_solved).value.split("\s*,\s*"));

    let diff_from_tmp = Number(document.getElementById(id_from).value);
    let diff_to_tmp = Number(document.getElementById(id_to).value);
    if (Number.isInteger(diff_from_tmp) && Number.isInteger(diff_to_tmp) &&
        diff_min <= diff_from_tmp && diff_from_tmp <= diff_to_tmp && diff_from_tmp <= diff_max) {
        document.getElementById(id_notice).innerText = "上記の設定で初期化しました";
        diff_from = diff_from_tmp;
        diff_to = diff_to_tmp;

        target = [];
        for (let i = diff_from; i <= diff_to; i++) {
            target = target.concat(difficulty_map.get(i));
        }
        target = shuffle(target);
        cur_idx = 0;
    } else {
        alert(diff_min + " 以上 " + diff_max + " 以下の整数を (下限)≦(上限) となるように入力してください");
    }
}
function print_solved() {
    document.getElementById("solved_printer").innerText = solved_str;
}
function copy_to_clip(txt) {
    if (!navigator.clipboard) {
        alert("コピー非対応");
        return;
    }

    navigator.clipboard.writeText(txt).then(
        () => {
            alert("クリップボードにコピーしました");
        },
        () => {
            alert("コピー失敗");
        }
    );
}