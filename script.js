document.getElementById('predictBtn').addEventListener('click', function() {
    const h = parseFloat(document.getElementById('homeScore').value) || 0;
    const a = parseFloat(document.getElementById('awayScore').value) || 0;
    const q = parseInt(document.getElementById('quarter').value);
    const m = parseFloat(document.getElementById('minLeft').value) || 0;
    const s = parseFloat(document.getElementById('secLeft').value) || 0;
    const lH = parseFloat(document.getElementById('lineHalf').value);
    const lF = parseFloat(document.getElementById('lineFull').value);

    const totalTime = 48;
    const timeLeft = (4 - q) * 12 + (m + s/60);
    const timePlayed = totalTime - timeLeft;
    const safePlayed = timePlayed <= 0 ? 0.1 : timePlayed;

    const hF = Math.round((h / safePlayed) * 48);
    const aF = Math.round((a / safePlayed) * 48);
    const curTotal = h + a;
    const projTotal = hF + aF;

    // 即時勝率 (基於當前比分)
    let winRate = 50;
    if (h + a > 0) {
        const currentTrendWR = (Math.pow(h, 13.91) / (Math.pow(h, 13.91) + Math.pow(a, 13.91))) * 100;
        const progress = timePlayed / totalTime;
        winRate = 50 * (1 - progress) + currentTrendWR * progress;
    }

    // 更新 UI 基礎數值
    document.getElementById('result').style.display = 'block';
    document.getElementById('finalScore').innerText = `${hF} : ${aF}`;
    document.getElementById('winRate').innerText = `${winRate.toFixed(1)}%`;
    document.getElementById('currentTotal').innerText = curTotal;
    document.getElementById('projectedTotal').innerText = projTotal;
    document.getElementById('fullProjTotal').innerText = projTotal;

    let analysis = "🔍 <b>即時數據分析：</b><br>";
    let celebrate = false;

    // --- 過盤率核心算法修正 (平滑化處理) ---
    function calculateProb(proj, line, weight = 0.15) {
        if (isNaN(line)) return 50;
        const diff = proj - line;
        // 使用 Sigmoid 函數取代原本的固定乘法，避免 110/100 這種差 10 分就變 2% 的情況
        // 分母越大，機率變動越平滑
        const prob = (1 / (1 + Math.exp(-weight * diff))) * 100;
        return Math.max(5, Math.min(95, prob)); // 設定合理的極限範圍 5%~95%
    }

    // 4. 中場分析
    const halfBox = document.getElementById('halfProbContainer');
    if (timePlayed < 24 && !isNaN(lH)) {
        const hProjH = Math.round((h / safePlayed) * 24) + Math.round((a / safePlayed) * 24);
        document.getElementById('halfProjTotal').innerText = hProjH;
        
        let hProb = calculateProb(hProjH, lH, 0.2); // 中場波動較快
        
        document.getElementById('halfProbBar').style.width = hProb + "%";
        document.getElementById('halfProbPercent').innerText = hProb.toFixed(1) + "%";
        halfBox.style.display = 'block';
        
        const hDiff = (hProjH - lH).toFixed(1);
        analysis += `• 中場線(${lH}): 偏差 <b>${hDiff > 0 ? '+' + hDiff : hDiff}</b> | ${hProjH > lH ? '🔥大分趨勢' : '❄️小分趨勢'}<br>`;
    } else {
        halfBox.style.display = 'none';
    }

    // 5. 終場分析
    if (!isNaN(lF)) {
        let fProb = calculateProb(projTotal, lF, 0.15); // 終場波動較穩
        
        document.getElementById('fullProbBar').style.width = fProb + "%";
        document.getElementById('fullProbPercent').innerText = fProb.toFixed(1) + "%";
        
        const fDiff = (projTotal - lF).toFixed(1);
        analysis += `• 終場線(${lF}): 偏差 <b>${fDiff > 0 ? '+' + fDiff : fDiff}</b> | ${projTotal > lF ? '🔥大分趨勢' : '❄️小分趨勢'}<br>`;
        
        if (fProb > 80) celebrate = true;
    }

    document.getElementById('analysis').innerHTML = analysis;

    if (celebrate) confetti({ particleCount: 150, spread: 70, origin: { y: 0.7 } });
    document.getElementById('result').scrollIntoView({ behavior: 'smooth' });
});