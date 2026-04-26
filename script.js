document.getElementById('predictBtn').addEventListener('click', function() {
    const home = parseFloat(document.getElementById('homeScore').value);
    const away = parseFloat(document.getElementById('awayScore').value);
    const quarter = parseInt(document.getElementById('quarter').value);
    const qTimeL = parseFloat(document.getElementById('quarterTime').value);
    
    // 檢查輸入是否合理 (每節 12 分鐘)
    if (qTimeL > 12 || qTimeL < 0) {
        alert("每節時間請介於 0 到 12 分鐘之間");
        return;
    }

    // 計算總共已比賽時間 (NBA 每節 12 分鐘)
    // 總比賽時間 = (目前節數 - 1) * 12 + (12 - 該節剩餘)
    const timePlayed = (quarter - 1) * 12 + (12 - qTimeL);
    
    // 如果比賽還沒開始 (0分鐘)，給一個極小值避免除以零報錯
    const safeTimePlayed = timePlayed === 0 ? 0.1 : timePlayed;
    
    // 1. 預估終場比分
    const homeFinal = Math.round((home / safeTimePlayed) * 48);
    const awayFinal = Math.round((away / safeTimePlayed) * 48);
    
    // 2. 畢達哥拉斯公式計算勝率
    const power = 13.91; 
    const homeWinRate = (Math.pow(homeFinal, power) / (Math.pow(homeFinal, power) + Math.pow(awayFinal, power)) * 100).toFixed(1);

    // 顯示結果
    const resultDiv = document.getElementById('result');
    resultDiv.style.display = 'block';
    document.getElementById('finalScore').innerText = `${homeFinal} : ${awayFinal}`;
    document.getElementById('winRate').innerText = `${homeWinRate}%`;
    
    // 背景顏色邏輯
    document.body.style.background = homeFinal > awayFinal ? "#27ae60" : "#c0392b";
});