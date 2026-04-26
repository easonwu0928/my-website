// 找到那個 ID 叫 btn 的按鈕
const myButton = document.getElementById('btn');

// 當按鈕被點擊時，執行裡面的動作
myButton.addEventListener('click', function() {
    // 彈出對話框
    alert("魔法觸發成功！Eason，你已經學會連接 HTML、CSS 和 JS 了！");
    
    // 順便把網頁背景顏色換掉
    document.body.style.background = "#222";
});