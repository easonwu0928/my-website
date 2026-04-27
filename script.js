document.getElementById('predictBtn').addEventListener('click', function() {
    const h = parseFloat(document.getElementById('homeScore').value);
    const a = parseFloat(document.getElementById('awayScore').value);
    const q = parseInt(document.getElementById('quarter').value);
    const m = parseFloat(document.getElementById('minLeft').value) || 0;
    const s = parseFloat(document.getElementById('secLeft').value) || 0;
    const lH = parseFloat(document.getElementById('lineHalf').value);
    const lF = parseFloat(document.getElementById('lineFull').value);

    if (isNaN(h) || isNaN(a)) return alert("請輸入主客隊目前分數");

    // 1. 計算時間
    const totalMinutes = 48;
    const playedInQ = 12 - (m + s/60);
    const totalPlayed = (q - 1) * 12 + playedInQ;
    const safeT = totalPlayed <= 0 ? 0.1 : totalPlayed;

    // 2. 預測分數
    const hF = Math.round((h / safeT) * 48);
    const aF = Math.round((a / safeT) * 48);
    const predictedTotal = hF + aF;

    // 3. 勝率 (畢氏公式)
    const winRate = (Math.pow(hF, 13.91) / (Math.pow(hF, 13.91) + Math.pow(aF, 13.91))) * 100;

    // 4. 過盤率計算邏輯
    let coverProb = 50; // 預設 50%
    if (!isNaN(lF)) {
        const diff = predictedTotal - lF;
        // 數學模型：每多出 1 分增加約 2.5% 的機率 (上限 98%, 下限 2%)
        coverProb = 50 + (diff * 2.5);
        if (coverProb > 98) coverProb = 98;
        if (coverProb < 2) coverProb = 2;
    }

    // 5. 更新 UI
    document.getElementById('result').style.display = 'block';
    document.getElementById('finalScore').innerText = `${hF} : ${aF}`;
    document.getElementById('winRate').innerText = `${winRate.toFixed(1)}%`;
    
    // 更新進度條與數字
    const probBar = document.getElementById('probBar');
    const probNum = document.getElementById('probPercent');
    probBar.style.width = coverProb + "%";
    probNum.innerText = coverProb.toFixed(1) + "%";

    // 判斷中場預測
    let halfText = "";
    if (totalPlayed < 24) {
        const hH = Math.round((h / safeT) * 24);
        const aH = Math.round((a / safeT) * 24);
        halfText = `預測中場: ${hH}:${aH}`;
    }
    document.getElementById('halfScore').innerText = halfText;

    // 分析文字
    let analysis = "🔍 <b>盤口分析報告：</b><br>";
    if (!isNaN(lF)) {
        const diff = (predictedTotal - lF).toFixed(1);
        const advice = diff > 0 ? "大分" : "小分";
        analysis += `終場大小線 <b>${lF}</b>，預計總分 <b>${predictedTotal}</b>。<br>`;
        analysis += `目前預測傾向：<span style="color:#4facfe">${advice}</span>，距分界點 ${Math.abs(diff)} 分。`;
    } else {
        analysis += "請輸入終場盤口線以計算過盤率。";
    }
    document.getElementById('analysis').innerHTML = analysis;

    // 6. 撒彩帶效果 (過盤率 > 65% 或 預測勝率 > 75%)
    if (coverProb > 65 || winRate > 75) {
        confetti({
            particleCount: 120,
            spread: 70,
            origin: { y: 0.7 },
            colors: ['#4facfe', '#00f2fe', '#f87171', '#fbbf24']
        });
    }

    // 結果框變色
    document.querySelector('.result-card').style.borderColor = hF >= aF ? '#4ade80' : '#f87171';
    
    // 自動捲動
    document.getElementById('result').scrollIntoView({ behavior: 'smooth' });
});