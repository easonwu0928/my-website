document.getElementById('predictBtn').addEventListener('click', function() {
    // 1. 取得輸入值
    const homeScore = parseFloat(document.getElementById('homeScore').value);
    const awayScore = parseFloat(document.getElementById('awayScore').value);
    const quarter = parseInt(document.getElementById('quarter').value);
    
    // 取得分與秒
    const minLeft = parseFloat(document.getElementById('minLeft').value) || 0;
    const secLeft = parseFloat(document.getElementById('secLeft').value) || 0;
    
    const lineHalf = parseFloat(document.getElementById('lineHalf').value);
    const lineFull = parseFloat(document.getElementById('lineFull').value);

    // 2. 基礎檢查
    if (isNaN(homeScore) || isNaN(awayScore)) {
        alert("請輸入目前得分！");
        return;
    }

    // 3. 計算總已比賽時間 (NBA 每節 12 分鐘，總共 48 分鐘)
    // 將分秒轉換為十進位分鐘數 (例如 2:02 變成 2.033 分鐘)
    const totalTimeLeftInQuarter = minLeft + (secLeft / 60);
    const minutesPlayedInQuarter = 12 - totalTimeLeftInQuarter;
    const totalMinutesPlayed = (quarter - 1) * 12 + minutesPlayedInQuarter;
    const safePlayed = totalMinutesPlayed <= 0 ? 0.1 : totalMinutesPlayed;

    // 4. 預測邏輯
    const homeFull = Math.round((homeScore / safePlayed) * 48);
    const awayFull = Math.round((awayScore / safePlayed) * 48);
    
    let halfResultHtml = "";
    if (totalMinutesPlayed < 24) {
        const homeHalf = Math.round((homeScore / safePlayed) * 24);
        const awayHalf = Math.round((awayScore / safePlayed) * 24);
        halfResultHtml = `<br><span style="font-size:16px; color:#666;">預測中場: ${homeHalf} : ${awayHalf}</span>`;
    }

    // 5. 勝率計算 (畢氏勝率公式 13.91)
    const power = 13.91;
    const winRate = (Math.pow(homeFull, power) / (Math.pow(homeFull, power) + Math.pow(awayFull, power))) * 100;

    // 6. 運彩過關分析
    let analysisHtml = `<strong style="color:#4a90e2;">🔍 運彩過關深度分析：</strong><br>`;
    
    // 中場分析
    if (!isNaN(lineHalf) && totalMinutesPlayed < 24) {
        const predictedHalfTotal = Math.round((homeScore / safePlayed) * 24) + Math.round((awayScore / safePlayed) * 24);
        const halfDiff = (predictedHalfTotal - lineHalf).toFixed(1);
        const halfRecommend = halfDiff > 0 ? 
            '<span class="tag" style="background:#27ae60;">大分</span>' : 
            '<span class="tag" style="background:#e74c3c;">小分</span>';
        analysisHtml += `• 中場盤口(${lineHalf}): 預測總分 ${predictedHalfTotal}，距過關差 <b>${Math.abs(halfDiff)}</b> 分 ${halfRecommend}<br>`;
    }

    // 終場分析
    if (!isNaN(lineFull)) {
        const predictedTotal = homeFull + awayFull;
        const diff = (predictedTotal - lineFull).toFixed(1);
        const recommend = diff > 0 ? 
            '<span class="tag" style="background:#27ae60;">大分</span>' : 
            '<span class="tag" style="background:#e74c3c;">小分</span>';
        
        let confidence = (50 + (Math.abs(diff) / 10) * 5).toFixed(1);
        if (confidence > 95) confidence = 95.0;

        analysisHtml += `• 終場盤口(${lineFull}): 預測總分 ${predictedTotal}，距過關差 <b>${Math.abs(diff)}</b> 分 ${recommend}<br>`;
        analysisHtml += `• 預估過關率: ${confidence}%<br>`;
    }

    // 7. 渲染結果
    document.getElementById('result').style.display = 'block';
    document.getElementById('finalScore').innerHTML = `${homeFull} : ${awayFull}${halfResultHtml}`;
    document.getElementById('winRate').innerText = `${winRate.toFixed(1)}%`;
    document.getElementById('analysis').innerHTML = analysisHtml;

    // 8. 視覺回饋
    document.body.style.background = homeFull >= awayFull ? 
        "linear-gradient(135deg, #1d976c, #93f9b9)" : "linear-gradient(135deg, #eb3349, #f45c43)";

    document.getElementById('result').scrollIntoView({ behavior: 'smooth' });
});