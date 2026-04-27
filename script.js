// 在你的按鈕事件監聽器內
document.getElementById('predictBtn').addEventListener('click', function() {
    // ... 前面的計算邏輯 (h, a, safeT 等) 保持不變 ...

    // 核心預測比分
    const hF = Math.round((h / safeT) * 48);
    const aF = Math.round((a / safeT) * 48);
    const curTotal = h + a;
    const projTotal = hF + aF;

    // 渲染到畫面 (對應新的 ID 結構)
    document.getElementById('result').style.display = 'block';
    
    // 1. 修正比分顯示 (確保只寫入這一個地方)
    document.getElementById('finalScore').innerText = `${hF} : ${aF}`;
    
    // 2. 更新總分標籤
    document.getElementById('currentTotal').innerText = curTotal;
    document.getElementById('projectedTotal').innerText = projTotal;
    
    // 3. 更新勝率與進度條上的連動數字
    document.getElementById('winRate').innerText = `${winRate.toFixed(1)}%`;
    document.getElementById('fullProjTotal').innerText = projTotal;

    // ... 後續過盤率計算與撒彩帶邏輯保持不變 ...
});