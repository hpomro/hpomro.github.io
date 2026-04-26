window.onload = init();

function init() {
    // fetch("footer.html")
    //     .then((response) => response.text)
    //     .then((data) => document.querySelector("body").insertAdjacentElement('beforeend', data));
}

function change_menu_display() {
    if (menu.classList.contains("show")) {
        menu.classList.remove("show");
        // アニメーション後に display:none に戻す
        setTimeout(() => {
            menu.style.display = "none";
        }, 400);
    } else {
        menu.style.display = "block";
        // 少し遅らせてフェードイン開始
        requestAnimationFrame(() => {
            menu.classList.add("show");
        });
    }
    return;
}

function show_menu_display() {
    menu.style.display = "block";
}