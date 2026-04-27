document.getElementById('predictBtn').addEventListener('click', function() {
    const h = parseFloat(document.getElementById('homeScore').value) || 0;
    const a = parseFloat(document.getElementById('awayScore').value) || 0;
    const q = parseInt(document.getElementById('quarter').value);
    const m = parseFloat(document.getElementById('minLeft').value) || 0;
    const s = parseFloat(document.getElementById('secLeft').value) || 0;
    const lH = parseFloat(document.getElementById('lineHalf').value);
    const lF = parseFloat(document.getElementById('lineFull').value);

    // 1. 時間換算 (NBA 48分鐘)
    const totalTime = 48;
    const timeLeft = (4 - q) * 12 + (m + s/60);
    const timePlayed = totalTime - timeLeft;
    const safePlayed = timePlayed <= 0 ? 0.1 : timePlayed;

    // 2. 預測終場比分 (外推法)
    const hF = Math.round((h / safePlayed) * 48);
    const aF = Math.round((a / safePlayed) * 48);
    const curTotal = h + a;
    const projTotal = hF + aF;

    // 3. 即時勝率計算 (修正：使用當前比分)
    // 邏輯：領先分數 + (預期剩餘時間的分數變動)。這裡採用當前得分比率來模擬剩餘時間的趨勢
    let winRate = 50;
    if (h + a > 0) {
        // 使用畢氏公式計算當前趨勢勝率
        const currentTrendWR = (Math.pow(h, 13.91) / (Math.pow(h, 13.91) + Math.pow(a, 13.91))) * 100;
        // 隨著比賽接近尾聲，當前趨勢的權重越高
        const progress = timePlayed / totalTime;
        winRate = 50 * (1 - progress) + currentTrendWR * progress;
    }

    // 4. UI 渲染
    document.getElementById('result').style.display = 'block';
    document.getElementById('finalScore').innerText = `${hF} : ${aF}`;
    document.getElementById('winRate').innerText = `${winRate.toFixed(1)}%`;
    document.getElementById('currentTotal').innerText = curTotal;
    document.getElementById('projectedTotal').innerText = projTotal;
    document.getElementById('fullProjTotal').innerText = projTotal;

    let analysis = "🔍 <b>即時數據分析：</b><br>";
    let celebrate = false;

    // 5. 中場過盤分析
    const halfBox = document.getElementById('halfProbContainer');
    if (timePlayed < 24 && !isNaN(lH)) {
        const hProjH = Math.round((h / safePlayed) * 24) + Math.round((a / safePlayed) * 24);
        document.getElementById('halfProjTotal').innerText = hProjH;
        let hProb = Math.max(2, Math.min(98, 50 + (hProjH - lH) * 5));
        document.getElementById('halfProbBar').style.width = hProb + "%";
        document.getElementById('halfProbPercent').innerText = hProb.toFixed(1) + "%";
        halfBox.style.display = 'block';
        analysis += `• 中場線(${lH}): 預估 ${hProjH} | ${hProjH > lH ? '🔥大分' : '❄️小分'}<br>`;
        if (hProb > 75) celebrate = true;
    } else {
        halfBox.style.display = 'none';
    }

    // 6. 終場過盤分析
    if (!isNaN(lF)) {
        let fProb = Math.max(2, Math.min(98, 50 + (projTotal - lF) * 3));
        document.getElementById('fullProbBar').style.width = fProb + "%";
        document.getElementById('fullProbPercent').innerText = fProb.toFixed(1) + "%";
        analysis += `• 終場線(${lF}): 預估 ${projTotal} | ${projTotal > lF ? '🔥大分' : '❄️小分'}<br>`;
        if (fProb > 75) celebrate = true;
    }

    document.getElementById('analysis').innerHTML = analysis;

    // 7. 特效
    if (celebrate) confetti({ particleCount: 150, spread: 70, origin: { y: 0.7 } });
    document.getElementById('result').scrollIntoView({ behavior: 'smooth' });
});