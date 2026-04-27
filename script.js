document.getElementById('predictBtn').addEventListener('click', function() {
    // 1. 抓取輸入值
    const homeScore = parseFloat(document.getElementById('homeScore').value);
    const awayScore = parseFloat(document.getElementById('awayScore').value);
    const quarter = parseInt(document.getElementById('quarter').value);
    const minLeft = parseFloat(document.getElementById('minLeft').value) || 0;
    const secLeft = parseFloat(document.getElementById('secLeft').value) || 0;
    const lineHalf = parseFloat(document.getElementById('lineHalf').value);
    const lineFull = parseFloat(document.getElementById('lineFull').value);

    // 2. 基礎防呆
    if (isNaN(homeScore) || isNaN(awayScore)) {
        alert("請輸入目前的比分！");
        return;
    }

    // 3. 計算已比賽時間 (NBA 每節 12 分鐘，總共 48 分鐘)
    const totalTimeLeftInQuarter = minLeft + (secLeft / 60);
    const minutesPlayedInQuarter = 12 - totalTimeLeftInQuarter;
    const totalMinutesPlayed = (quarter - 1) * 12 + minutesPlayedInQuarter;
    const safePlayed = totalMinutesPlayed <= 0 ? 0.1 : totalMinutesPlayed;

    // 4. 預測邏輯
    // 預測終場
    const homeFull = Math.round((homeScore / safePlayed) * 48);
    const awayFull = Math.round((awayScore / safePlayed) * 48);
    const fullProjTotal = homeFull + awayFull;
    
    // 5. 勝率計算 (畢氏勝率公式)
    const power = 13.91;
    const winRate = (Math.pow(homeFull, power) / (Math.pow(homeFull, power) + Math.pow(awayFull, power))) * 100;

    // 6. 更新 UI 基礎顯示
    const resultDiv = document.getElementById('result');
    resultDiv.style.display = 'block';
    document.getElementById('finalScore').innerText = `${homeFull} : ${awayFull}`;
    document.getElementById('winRate').innerText = `${winRate.toFixed(1)}%`;
    document.getElementById('fullProjTotal').innerText = fullProjTotal;

    let analysisHtml = `<strong style="color:#4a90e2;">🔍 深度盤口分析：</strong><br>`;

    // 7. 中場分析邏輯 (僅在第二節結束前顯示)
    const halfContainer = document.getElementById('halfProbContainer');
    if (totalMinutesPlayed < 24 && !isNaN(lineHalf)) {
        const homeHalf = Math.round((homeScore / safePlayed) * 24);
        const awayHalf = Math.round((awayScore / safePlayed) * 24);
        const halfProjTotal = homeHalf + awayHalf;
        document.getElementById('halfProjTotal').innerText = halfProjTotal;

        // 計算過盤率
        let hProb = 50 + (halfProjTotal - lineHalf) * 4;
        hProb = Math.max(2, Math.min(98, hProb));
        document.getElementById('halfProbBar').style.width = hProb + "%";
        document.getElementById('halfProbPercent').innerText = hProb.toFixed(1) + "%";
        halfContainer.style.display = 'block';

        // 判斷大/小分
        const halfResult = halfProjTotal > lineHalf ? 
            '<b style="color:#e74c3c;">🔥 預測：大分</b>' : 
            '<b style="color:#3498db;">❄️ 預測：小分</b>';
        analysisHtml += `• 中場(${lineHalf}): 預計總分 ${halfProjTotal} | ${halfResult}<br>`;
    } else {
        halfContainer.style.display = 'none';
    }

    // 8. 終場分析邏輯
    if (!isNaN(lineFull)) {
        let fProb = 50 + (fullProjTotal - lineFull) * 2.5;
        fProb = Math.max(2, Math.min(98, fProb));
        document.getElementById('fullProbBar').style.width = fProb + "%";
        document.getElementById('fullProbPercent').innerText = fProb.toFixed(1) + "%";

        // 判斷大/小分
        const fullResult = fullProjTotal > lineFull ? 
            '<b style="color:#e74c3c;">🔥 預測：大分</b>' : 
            '<b style="color:#3498db;">❄️ 預測：小分</b>';
        analysisHtml += `• 終場(${lineFull}): 預計總分 ${fullProjTotal} | ${fullResult}<br>`;
        
        // 距離分數線差幾分
        const diff = Math.abs(fullProjTotal - lineFull).toFixed(1);
        analysisHtml += `• 距分數線目前偏差：<b>${diff}</b> 分<br>`;
    } else {
        analysisHtml += `• 未輸入終場盤口，無法分析大小分趨勢。<br>`;
    }

    // 寫入分析盒
    document.getElementById('analysis').innerHTML = analysisHtml;

    // 9. 背景與視覺效果
    // 預測勝出方變色
    document.body.style.background = homeFull >= awayFull ? 
        "linear-gradient(135deg, #1d976c, #93f9b9)" : "linear-gradient(135deg, #eb3349, #f45c43)";

    // 自動滾動到結果
    resultDiv.scrollIntoView({ behavior: 'smooth' });
});