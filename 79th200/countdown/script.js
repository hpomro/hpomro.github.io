function timer() {
    let now = new Date();
    let left_sec = Math.floor((target.getTime() - now.getTime()) / 1000);
    let left_min = Math.floor(left_sec / 60);
    let left_hours = Math.floor(left_min / 60);
    let left_days = Math.floor(left_hours / 24);
    document.getElementById("countdown-d").innerText = left_days.toString();
    document.getElementById("countdown-h").innerText = (left_hours % 24).toString().padStart(2, '0');
    document.getElementById("countdown-m").innerText = (left_min % 60).toString().padStart(2, '0');
    document.getElementById("countdown-s").innerText = (left_sec % 60).toString().padStart(2, '0');
}

window.addEventListener('DOMContentLoaded', timer)
const target = new Date(2026, 8 - 1, 29, 9, 0);
setInterval('timer()', 500);