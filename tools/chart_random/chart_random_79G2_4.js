var difficulty = {
    "1": "1", "2": "3", "3": "2", "4": "2", "5": "3", "6": "2", "7": "2", "8": "3", "9": "3", "10": "2", "11": "3", "12": "3", "13": "4", "14": "2", "15": "3", "16": "4", "17": "2", "18": "2", "19": "3", "20": "3", "21": "3", "22": "3", "23": "3", "24": "2", "25": "2", "26": "2", "27": "2", "28": "3", "29": "3", "30": "3", "31": "3", "32": "3", "33": "2", "34": "2", "35": "2", "36": "2", "37": "1", "38": "2", "39": "3", "40": "3", "41": "3", "42": "2", "43": "3", "44": "3", "45": "4", "46": "4", "47": "2", "48": "2", "49": "2", "50": "2", "51": "2", "52": "3", "53": "2", "54": "2", "55": "3", "56": "2", "57": "3", "58": "4", "59": "3", "60": "2", "61": "2", "62": "4", "63": "2", "70": "3", "72": "4", "E1": "2", "E2": "3", "E3": "3", "E4": "2", "E5": "3", "E6": "3", "E7": "2", "E8": "2", "E9": "3", "E10": "3", "E11": "3", "E12": "4", "E13": "2", "E14": "3", "E15": "3", "E16": "4", "E17": "2", "E18": "3", "E19": "2", "E20": "3", "E21": "3", "E22": "4", "E23": "4", "E24": "2", "E25": "2", "E26": "3", "E27": "4", "E28": "3", "E29": "2", "E30": "4", "E31": "4", "E32": "4", "E33": "4", "E34": "2", "E35": "2", "E36": "3", "E37": "2", "E38": "3", "E39": "3", "E40": "3", "E41": "3", "E42": "3", "E43": "2", "E44": "4", "E45": "4", "E46": "2", "E47": "4", "E48": "2", "E49": "2", "E51": "3", "E52": "2", "E53": "4"
}; // 問題:難易度
var chap = {
    "1": "分数関数・無理関数", "2": "分数関数・無理関数", "3": "分数関数・無理関数", "4": "分数関数・無理関数", "5": "分数関数・無理関数", "6": "分数関数・無理関数", "7": "分数関数・無理関数", "8": "分数関数・無理関数", "9": "合成関数・逆関数", "10": "合成関数・逆関数", "11": "合成関数・逆関数", "12": "合成関数・逆関数", "13": "合成関数・逆関数", "14": "合成関数・逆関数", "15": "合成関数・逆関数", "16": "合成関数・逆関数", "17": "数列の極限", "18": "数列の極限", "19": "数列の極限", "20": "数列の極限", "21": "数列の極限", "22": "数列の極限", "23": "数列の極限", "24": "数列の極限", "25": "数列の極限", "26": "数列の極限", "27": "数列の極限", "28": "数列の極限", "29": "数列の極限", "30": "数列の極限", "31": "数列の極限", "32": "数列の極限", "33": "無限級数", "34": "無限級数", "35": "無限級数", "36": "無限級数", "37": "無限級数", "38": "無限級数", "39": "無限級数", "40": "無限級数", "41": "無限級数", "42": "無限級数", "43": "無限級数", "44": "無限級数", "45": "無限級数", "46": "無限級数", "47": "関数の極限", "48": "関数の極限", "49": "関数の極限", "50": "関数の極限", "51": "関数の極限", "52": "関数の極限", "53": "関数の極限", "54": "関数の極限", "55": "関数の極限", "56": "関数の連続性", "57": "関数の連続性", "58": "関数の連続性", "59": "関数の連続性", "60": "微分係数と導関数,導関数の計算", "61": "微分係数と導関数,導関数の計算", "62": "微分係数と導関数,導関数の計算", "63": "微分係数と導関数,導関数の計算", "70": "関連発展問題(導関数)", "72": "関連発展問題(導関数)", "E1": "分数関数・無理関数", "E2": "分数関数・無理関数", "E3": "分数関数・無理関数", "E4": "分数関数・無理関数", "E5": "分数関数・無理関数", "E6": "分数関数・無理関数", "E7": "合成関数・逆関数", "E8": "合成関数・逆関数", "E9": "合成関数・逆関数", "E10": "合成関数・逆関数", "E11": "合成関数・逆関数", "E12": "合成関数・逆関数", "E13": "数列の極限", "E14": "数列の極限", "E15": "数列の極限", "E16": "数列の極限", "E17": "数列の極限", "E18": "数列の極限", "E19": "数列の極限", "E20": "数列の極限", "E21": "数列の極限", "E22": "数列の極限", "E23": "数列の極限", "E24": "無限級数", "E25": "無限級数", "E26": "無限級数", "E27": "無限級数", "E28": "無限級数", "E29": "無限級数", "E30": "無限級数", "E31": "無限級数", "E32": "無限級数", "E33": "無限級数", "E34": "関数の極限", "E35": "関数の極限", "E36": "関数の極限", "E37": "関数の極限", "E38": "関数の極限", "E39": "関数の極限", "E40": "関数の極限", "E41": "関数の極限", "E42": "関数の極限", "E43": "関数の連続性", "E44": "関数の連続性", "E45": "関数の連続性", "E46": "関数の連続性", "E47": "関数の連続性", "E48": "微分係数と導関数", "E49": "微分係数と導関数,導関数の計算", "E51": "微分係数と導関数,導関数の計算", "E52": "微分係数と導関数,導関数の計算", "E53": "微分係数と導関数,導関数の計算"
}
var page = {
    "1": "13", "2": "14", "3": "15", "4": "16", "5": "17", "6": "19", "7": "20", "8": "21", "9": "22", "10": "25", "11": "26", "12": "27", "13": "28", "14": "29", "15": "30", "16": "31", "17": "37", "18": "38", "19": "40", "20": "41", "21": "43", "22": "44", "23": "45", "24": "47", "25": "48", "26": "49", "27": "50", "28": "51", "29": "52", "30": "53", "31": "56", "32": "57", "33": "62", "34": "63", "35": "65", "36": "66", "37": "67", "38": "68", "39": "69", "40": "70", "41": "73", "42": "74", "43": "75", "44": "76", "45": "77", "46": "78", "47": "84", "48": "85", "49": "86", "50": "87", "51": "88", "52": "89", "53": "91", "54": "92", "55": "94", "56": "99", "57": "100", "58": "101", "59": "102", "60": "107", "61": "108", "62": "109", "63": "112", "70": "123", "72": "125", "E1": "23", "E2": "23", "E3": "23", "E4": "23", "E5": "23", "E6": "23", "E7": "32", "E8": "32", "E9": "32", "E10": "32", "E11": "32", "E12": "32", "E13": "59", "E14": "59", "E15": "59", "E16": "59", "E17": "59", "E18": "59", "E19": "60", "E20": "60", "E21": "60", "E22": "60", "E23": "60", "E24": "80", "E25": "80", "E26": "80", "E27": "80", "E28": "80", "E29": "81", "E30": "81", "E31": "81", "E32": "81", "E33": "81", "E34": "95", "E35": "95", "E36": "95", "E37": "95", "E38": "95", "E39": "96", "E40": "96", "E41": "96", "E42": "96", "E43": "104", "E44": "104", "E45": "104", "E46": "104", "E47": "104", "E48": "115", "E49": "115", "E51": "115", "E52": "115", "E53": "115"
}

var chapter_list = [
    "分数関数・無理関数",
    "合成関数・逆関数",
    "数列の極限",
    "無限級数",
    "関数の極限",
    "関数の連続性",
    "微分係数と導関数,導関数の計算",
    "関連発展問題(導関数)",
    "微分係数と導関数"
]

var keys = Object.keys(difficulty);
var cur_idx = 0;
var all_used = false;
var used = new Set();
var diff_min = 1;
var diff_max = 5;
var diff_from = diff_min;
var diff_to = diff_max; // included
var target = [];
var allowed_chapter = new Set();
for (let index = 0; index < chapter_list.length; index++) {
    const element = chapter_list[index];
    allowed_chapter.add(element);
}
for (let i = 0; i < keys.length; i++) {
    if (diff_from <= difficulty[keys[i]] && difficulty[keys[i]] <= diff_to && allowed_chapter.has(chap[keys[i]])) {
        target.push(keys[i]);
    }
}
target = shuffle(target);
var solved_str = "";


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
            if (!used.has(element)) {
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
    console.log(target[cur_idx], difficulty[target[cur_idx]]);
    used.add(target[cur_idx]);
    solved_str += (solved_str === "" ? "" : ",") + target[cur_idx];
    return target[cur_idx];
}

function show_next(id) {
    flush();
    const key = next();
    if (key == null) {
        document.getElementById(id).innerHTML = "全部解いてしまった!";
        return;
    }
    document.getElementById(id).innerHTML =
        "問題番号 : " + (key.substring(0, 1) === "E" ? "Exersize " + key.substring(1, key.length) : key)
        + " , " + "難易度 : " + "<span class=\"diff_" + difficulty[key] + "\">" + difficulty[key] + "</span>"
        + " , " + "ページ : " + page[key];
    print_solved();
}

function init(id_solved, id_from, id_to, id_chap) {
    used = new Set(document.getElementById(id_solved).value.split("\s*,\s*"));
    solved_str = document.getElementById(id_solved).value;
    print_solved();

    allowed_chapter.clear();

    // 参考 : https://step-learn.com/article/javascript/189-list-multi.html
    const multiselect = document.getElementById("chap");
    const opts = multiselect.options;
    for (let i = 0; i < opts.length; i++) {
        if (opts[i].selected) {
            // console.log(opts[i].value);
            allowed_chapter.add(opts[i].value);
        }
    }

    let diff_from_tmp = Number(document.getElementById(id_from).value);
    let diff_to_tmp = Number(document.getElementById(id_to).value);
    if (Number.isInteger(diff_from_tmp) && Number.isInteger(diff_to_tmp) &&
        diff_min <= diff_from_tmp && diff_from_tmp <= diff_to_tmp && diff_from_tmp <= diff_max) {
        document.getElementById("changed_notice").style.visibility = "visible";
        diff_from = diff_from_tmp;
        diff_to = diff_to_tmp;

        target = [];
        for (let i = 0; i < keys.length; i++) {
            if (diff_from <= difficulty[keys[i]] && difficulty[keys[i]] <= diff_to && allowed_chapter.has(chap[keys[i]])) {
                target.push(keys[i]);
            }
        }
        target = shuffle(target);
        console.log("size:", target.length);
        cur_idx = 0;
    } else {
        alert(diff_min + " 以上 " + diff_max + " 以下の整数を (下限)≦(上限) となるように入力してください");
    }
}

function print_solved() {
    document.getElementById("solved_printer").innerText = solved_str;
}

function flush() {
    document.getElementById("changed_notice").style.visibility = "hidden";
}