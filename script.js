document.getElementById('predictBtn').addEventListener('click', function() {
    const home = parseFloat(document.getElementById('homeScore').value);
    const away = parseFloat(document.getElementById('awayScore').value);
    const timeL = parseFloat(document.getElementById('timeLeft').value);
    
    const timePlayed = 48 - timeL; // NBA 一場 48 分鐘
    
    // 1. 預估終場比分 (根據目前的得分速率)
    const homeFinal = Math.round((home / timePlayed) * 48);
    const awayFinal = Math.round((away / timePlayed) * 48);
    
    // 2. 計算勝率 (簡單的畢達哥拉斯公式變體)
    // 公式: 勝率 = (主隊分^14) / (主隊分^14 + 客隊分^14)
    const power = 13.91; 
    const homeWinRate = (Math.pow(homeFinal, power) / (Math.pow(homeFinal, power) + Math.pow(awayFinal, power)) * 100).toFixed(1);

    // 顯示結果
    document.getElementById('result').style.display = 'block';
    document.getElementById('finalScore').innerText = `${homeFinal} : ${awayFinal}`;
    document.getElementById('winRate').innerText = `主隊勝率約 ${homeWinRate}%`;
    
    // 換個背景顏色慶祝計算完成
    document.body.style.background = homeFinal > awayFinal ? "#27ae60" : "#c0392b";
});