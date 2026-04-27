document.getElementById('predictBtn').addEventListener('click', function() {
    // 1. 抓取輸入值
    const h = parseFloat(document.getElementById('homeScore').value);
    const a = parseFloat(document.getElementById('awayScore').value);
    const q = parseInt(document.getElementById('quarter').value);
    const m = parseFloat(document.getElementById('minLeft').value) || 0;
    const s = parseFloat(document.getElementById('secLeft').value) || 0;
    const lH = parseFloat(document.getElementById('lineHalf').value);
    const lF = parseFloat(document.getElementById('lineFull').value);

    if (isNaN(h) || isNaN(a)) return alert("請輸入主客隊目前分數");

    // 2. 計算比賽進度
    const playedInQ = 12 - (m + s/60);
    const totalPlayed = (q - 1) * 12 + playedInQ;
    const safeT = totalPlayed <= 0 ? 0.1 : totalPlayed;

    // 3. 核心預測：終場
    const hF = Math.round((h / safeT) * 48);
    const aF = Math.round((a / safeT) * 48);
    const curTotal = h + a;
    const projTotal = hF + aF;

    // 4. 勝率計算
    const winRate = (Math.pow(hF, 13.91) / (Math.pow(hF, 13.91) + Math.pow(aF, 13.91))) * 100;

    // 5. 更新 UI
    document.getElementById('result').style.display = 'block';
    document.getElementById('finalScore').innerText = `${hF} : ${aF}`;
    document.getElementById('currentTotal').innerText = curTotal;
    document.getElementById('projectedTotal').innerText = projTotal;
    document.getElementById('fullProjTotal').innerText = projTotal; // 這是進度條上方的連動數字
    document.getElementById('winRate').innerText = `${winRate.toFixed(1)}%`;

    let analysis = `🔍 <b>深度盤口分析：</b><br>`;
    let shouldCelebrate = false;

    // 6. 中場邏輯
    const halfContainer = document.getElementById('halfProbContainer');
    if (totalPlayed < 24 && !isNaN(lH)) {
        const hH = Math.round((h / safeT) * 24);
        const aH = Math.round((a / safeT) * 24);
        const hProjTotal = hH + aH;
        document.getElementById('halfProjTotal').innerText = hProjTotal;
        
        let hProb = 50 + (hProjTotal - lH) * 4;
        hProb = Math.max(2, Math.min(98, hProb));
        document.getElementById('halfProbBar').style.width = hProb + "%";
        document.getElementById('halfProbPercent').innerText = hProb.toFixed(1) + "%";
        halfContainer.style.display = 'block';

        const hDir = hProjTotal > lH ? '<b style="color:#ef4444;">🔥 預測：大分</b>' : '<b style="color:#3b82f6;">❄️ 預測：小分</b>';
        analysis += `• 中場線(${lH}): 預計 ${hProjTotal} | ${hDir}<br>`;
        if (hProb > 75) shouldCelebrate = true;
    } else {
        halfContainer.style.display = 'none';
    }

    // 7. 終場邏輯
    if (!isNaN(lF)) {
        let fProb = 50 + (projTotal - lF) * 2.5;
        fProb = Math.max(2, Math.min(98, fProb));
        document.getElementById('fullProbBar').style.width = fProb + "%";
        document.getElementById('fullProbPercent').innerText = fProb.toFixed(1) + "%";

        const fDir = projTotal > lF ? '<b style="color:#ef4444;">🔥 預測：大分</b>' : '<b style="color:#3b82f6;">❄️ 預測：小分</b>';
        analysis += `• 終場線(${lF}): 預計 ${projTotal} | ${fDir}<br>`;
        analysis += `• 距分數線偏差：<b>${Math.abs(projTotal - lF).toFixed(1)}</b> 分<br>`;
        if (fProb > 75) shouldCelebrate = true;
    }

    document.getElementById('analysis').innerHTML = analysis;

    // 8. 彩帶與視覺反饋
    if (shouldCelebrate) {
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.7 },
            colors: ['#4facfe', '#00f2fe', '#f87171']
        });
    }

    document.body.style.background = hF >= aF ? 
        "linear-gradient(135deg, #1d976c, #93f9b9)" : "linear-gradient(135deg, #eb3349, #f45c43)";

    document.getElementById('result').scrollIntoView({ behavior: 'smooth' });
});