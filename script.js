document.getElementById('predictBtn').addEventListener('click', function() {
    const home = parseFloat(document.getElementById('homeScore').value);
    const away = parseFloat(document.getElementById('awayScore').value);
    const timeL = parseFloat(document.getElementById('timeLeft').value);
    
    // 預防輸入錯誤
    if (timeL >= 48) {
        alert("請輸入剩餘時間 (少於 48 分鐘)");
        return;
    }

    const timePlayed = 48 - timeL; 
    
    // 1. 預估終場比分 (按比例推算)
    const homeFinal = Math.round((home / timePlayed) * 48);
    const awayFinal = Math.round((away / timePlayed) * 48);
    
    // 2. 畢達哥拉斯公式計算勝率 (NBA 指數常數為 13.91)
    const power = 13.91; 
    const homeWinRate = (Math.pow(homeFinal, power) / (Math.pow(homeFinal, power) + Math.pow(awayFinal, power)) * 100).toFixed(1);

    // 顯示結果
    const resultDiv = document.getElementById('result');
    resultDiv.style.display = 'block';
    document.getElementById('finalScore').innerText = `${homeFinal} : ${awayFinal}`;
    document.getElementById('winRate').innerText = `${homeWinRate}%`;
    
    // 根據誰領先換背景色
    if (homeFinal > awayFinal) {
        document.body.style.background = "#27ae60"; // 主隊領先變綠色
    } else {
        document.body.style.background = "#c0392b"; // 客隊領先變紅色
    }
});