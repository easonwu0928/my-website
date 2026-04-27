document.getElementById('predictBtn').addEventListener('click', function() {
    // ... 抓取輸入與基礎時間計算保持不變 ...
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
    const projTotal = hF + aF;

    // --- 核心修正：平滑機率算法 ---
    /**
     * @param proj 預測總分
     * @param line 盤口線
     * @param sensitivity 靈敏度 (越小越平滑，0.1~0.12 適合 NBA)
     */
    function calculateProb(proj, line, sensitivity = 0.12) {
        if (isNaN(line)) return 50;
        const diff = proj - line;
        // 使用修正後的 Sigmoid 函數
        // 當 diff = -10 時，0.12 權重約給出 23%，較符合實際體感
        const prob = (1 / (1 + Math.exp(-(sensitivity * diff)))) * 100;
        return Math.max(2, Math.min(98, prob)); 
    }

    // 渲染 UI 基礎數據
    document.getElementById('result').style.display = 'block';
    document.getElementById('finalScore').innerText = `${hF} : ${aF}`;
    document.getElementById('currentTotal').innerText = h + a;
    document.getElementById('projectedTotal').innerText = projTotal;
    document.getElementById('fullProjTotal').innerText = projTotal;

    // 即時勝率 (基於當前比分，隨時間增加當前權重)
    const currentTrendWR = (h + a === 0) ? 50 : (Math.pow(h, 13.91) / (Math.pow(h, 13.91) + Math.pow(a, 13.91))) * 100;
    const progress = timePlayed / totalTime;
    const winRate = 50 * (1 - progress) + currentTrendWR * progress;
    document.getElementById('winRate').innerText = `${winRate.toFixed(1)}%`;

    let analysis = "🔍 <b>即時數據分析：</b><br>";

    // 4. 中場分析 (縮小靈敏度，讓 10 分差的機率更合理)
    const halfBox = document.getElementById('halfProbContainer');
    if (timePlayed < 24 && !isNaN(lH)) {
        const hProjH = Math.round((h / safePlayed) * 24) + Math.round((a / safePlayed) * 24);
        document.getElementById('halfProjTotal').innerText = hProjH;
        
        // 降低中場靈敏度至 0.1
        let hProb = calculateProb(hProjH, lH, 0.1); 
        
        document.getElementById('halfProbBar').style.width = hProb + "%";
        document.getElementById('halfProbPercent').innerText = hProb.toFixed(1) + "%";
        halfBox.style.display = 'block';
        
        const hDiff = (hProjH - lH).toFixed(1);
        analysis += `• 中場盤口(${lH}): 偏差 <b>${hDiff > 0 ? '+' + hDiff : hDiff}</b> | ${hProjH > lH ? '🔥大分趨勢' : '❄️小分趨勢'}<br>`;
    } else {
        halfBox.style.display = 'none';
    }

    // 5. 終場分析 (偏差顯示)
    if (!isNaN(lF)) {
        let fProb = calculateProb(projTotal, lF, 0.08); // 終場總分大，靈敏度要更低
        
        document.getElementById('fullProbBar').style.width = fProb + "%";
        document.getElementById('fullProbPercent').innerText = fProb.toFixed(1) + "%";
        
        const fDiff = (projTotal - lF).toFixed(1);
        analysis += `• 終場盤口(${lF}): 偏差 <b>${fDiff > 0 ? '+' + fDiff : fDiff}</b> | ${projTotal > lF ? '🔥大分趨勢' : '❄️小分趨勢'}<br>`;
    }

    document.getElementById('analysis').innerHTML = analysis;
    document.getElementById('result').scrollIntoView({ behavior: 'smooth' });
});