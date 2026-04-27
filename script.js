document.getElementById('predictBtn').addEventListener('click', function() {
    const h = parseFloat(document.getElementById('homeScore').value);
    const a = parseFloat(document.getElementById('awayScore').value);
    const q = parseInt(document.getElementById('quarter').value);
    const m = parseFloat(document.getElementById('minLeft').value) || 0;
    const s = parseFloat(document.getElementById('secLeft').value) || 0;
    const lH = parseFloat(document.getElementById('lineHalf').value);
    const lF = parseFloat(document.getElementById('lineFull').value);

    if (isNaN(h) || isNaN(a)) return alert("請輸入主客隊目前分數");

    // 1. 時間計算
    const playedInQ = 12 - (m + s/60);
    const totalPlayed = (q - 1) * 12 + playedInQ;
    const safeT = totalPlayed <= 0 ? 0.1 : totalPlayed;

    // 2. 分數預測
    const hF = Math.round((h / safeT) * 48);
    const aF = Math.round((a / safeT) * 48);
    const fullProjTotal = hF + aF;
    const winRate = (Math.pow(hF, 13.91) / (Math.pow(hF, 13.91) + Math.pow(aF, 13.91))) * 100;

    // 3. UI 基礎更新
    document.getElementById('result').style.display = 'block';
    document.getElementById('finalScore').innerText = `${hF} : ${aF}`;
    document.getElementById('winRate').innerText = `${winRate.toFixed(1)}%`;
    document.getElementById('fullProjTotal').innerText = fullProjTotal;

    let shouldCelebrate = false;

    // 4. 中場過盤率計算 (限打完前兩節前)
    const halfContainer = document.getElementById('halfProbContainer');
    if (totalPlayed < 24 && !isNaN(lH)) {
        const hH = Math.round((h / safeT) * 24);
        const aH = Math.round((a / safeT) * 24);
        const halfProjTotal = hH + aH;
        document.getElementById('halfProjTotal').innerText = halfProjTotal;
        
        let hProb = 50 + (halfProjTotal - lH) * 4; // 中場震盪大，權重設為 4
        hProb = Math.max(2, Math.min(98, hProb));
        
        document.getElementById('halfProbBar').style.width = hProb + "%";
        document.getElementById('halfProbPercent').innerText = hProb.toFixed(1) + "%";
        halfContainer.style.display = 'block';
        if (hProb > 70) shouldCelebrate = true;
    } else {
        halfContainer.style.display = 'none';
    }

    // 5. 終場過盤率計算
    if (!isNaN(lF)) {
        let fProb = 50 + (fullProjTotal - lF) * 2.5;
        fProb = Math.max(2, Math.min(98, fProb));
        document.getElementById('fullProbBar').style.width = fProb + "%";
        document.getElementById('fullProbPercent').innerText = fProb.toFixed(1) + "%";
        if (fProb > 70) shouldCelebrate = true;
    }

    // 6. 撒彩帶
    if (shouldCelebrate) {
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.7 },
            colors: ['#4facfe', '#f093fb', '#4ade80']
        });
    }

    // 自動捲動
    document.getElementById('result').scrollIntoView({ behavior: 'smooth' });
});