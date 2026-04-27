document.getElementById('predictBtn').addEventListener('click', function() {
    const h = parseFloat(document.getElementById('homeScore').value);
    const a = parseFloat(document.getElementById('awayScore').value);
    const q = parseInt(document.getElementById('quarter').value);
    const m = parseFloat(document.getElementById('minLeft').value) || 0;
    const s = parseFloat(document.getElementById('secLeft').value) || 0;
    const lH = parseFloat(document.getElementById('lineHalf').value);
    const lF = parseFloat(document.getElementById('lineFull').value);

    if (isNaN(h) || isNaN(a)) return alert("請輸入分數");

    // 計算時間
    const playedInQ = 12 - (m + s/60);
    const totalPlayed = (q - 1) * 12 + playedInQ;
    const safeT = totalPlayed <= 0 ? 0.1 : totalPlayed;

    // 預測分數
    const hF = Math.round((h / safeT) * 48);
    const aF = Math.round((a / safeT) * 48);
    const predictedTotal = hF + aF;

    // 勝率
    const winRate = (Math.pow(hF, 13.91) / (Math.pow(hF, 13.91) + Math.pow(aF, 13.91))) * 100;

    // 渲染
    document.getElementById('result').style.display = 'block';
    document.getElementById('finalScore').innerText = `${hF} : ${aF}`;
    document.getElementById('winRate').innerText = `${winRate.toFixed(1)}%`;

    let analysis = "🔍 盤口分析：<br>";
    let wonLine = false;

    if (!isNaN(lF)) {
        const diff = (predictedTotal - lF).toFixed(1);
        const direction = diff > 0 ? "大分" : "小分";
        analysis += `終場線 ${lF} | 預計 ${predictedTotal} (${direction})<br>距離過盤差 ${Math.abs(diff)} 分`;
        
        // 假設預測分數高於分數線且差距超過 0 分就「撒彩帶」慶祝
        if (Math.abs(diff) > 0) wonLine = true;
    }

    document.getElementById('analysis').innerHTML = analysis;

    // 觸發彩帶效果
    if (wonLine) {
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#4facfe', '#00f2fe', '#4ade80']
        });
    }

    // 根據領先方改變發光色
    document.querySelector('.result-card').style.borderColor = hF >= aF ? '#4ade80' : '#f87171';
});