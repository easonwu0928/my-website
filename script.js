document.getElementById('predictBtn').addEventListener('click', function() {
    const h = parseFloat(document.getElementById('homeScore').value);
    const a = parseFloat(document.getElementById('awayScore').value);
    const q = parseInt(document.getElementById('quarter').value);
    const m = parseFloat(document.getElementById('minLeft').value) || 0;
    const s = parseFloat(document.getElementById('secLeft').value) || 0;
    const lH = parseFloat(document.getElementById('lineHalf').value);
    const lF = parseFloat(document.getElementById('lineFull').value);

    if (isNaN(h) || isNaN(a)) return alert("請輸入主客隊分數");

    // 1. 時間換算 (NBA 48分鐘)
    const playedInQ = 12 - (m + s/60);
    const totalPlayed = (q - 1) * 12 + playedInQ;
    const safeT = totalPlayed <= 0 ? 0.1 : totalPlayed;

    // 2. 分數與勝率預測
    const hF = Math.round((h / safeT) * 48);
    const aF = Math.round((a / safeT) * 48);
    const curTotal = h + a;
    const projTotal = hF + aF;
    const winRate = (Math.pow(hF, 13.91) / (Math.pow(hF, 13.91) + Math.pow(aF, 13.91))) * 100;

    // 3. UI 渲染
    document.getElementById('result').style.display = 'block';
    document.getElementById('finalScore').innerText = `${hF} : ${aF}`;
    document.getElementById('winRate').innerText = `${winRate.toFixed(1)}%`;
    document.getElementById('currentTotal').innerText = curTotal;
    document.getElementById('projectedTotal').innerText = projTotal;
    document.getElementById('fullProjTotal').innerText = projTotal;

    let analysis = "🔍 <b>深度盤口分析及預測：</b><br>";
    let shouldConfetti = false;

    // 4. 中場分析
    const halfBox = document.getElementById('halfProbContainer');
    if (totalPlayed < 24 && !isNaN(lH)) {
        const hProjH = Math.round((h / safeT) * 24) + Math.round((a / safeT) * 24);
        document.getElementById('halfProjTotal').innerText = hProjH;
        let hProb = Math.max(2, Math.min(98, 50 + (hProjH - lH) * 4.5));
        document.getElementById('halfProbBar').style.width = hProb + "%";
        document.getElementById('halfProbPercent').innerText = hProb.toFixed(1) + "%";
        halfBox.style.display = 'block';
        
        const hDir = hProjH > lH ? '<b style="color:#f87171;">🔥 預測：大分</b>' : '<b style="color:#60a5fa;">❄️ 預測：小分</b>';
        analysis += `• 中場盤口(${lH}): 預計 ${hProjH} | ${hDir}<br>`;
        if (hProb > 75) shouldConfetti = true;
    } else {
        halfBox.style.display = 'none';
    }

    // 5. 終場分析
    if (!isNaN(lF)) {
        let fProb = Math.max(2, Math.min(98, 50 + (projTotal - lF) * 2.8));
        document.getElementById('fullProbBar').style.width = fProb + "%";
        document.getElementById('fullProbPercent').innerText = fProb.toFixed(1) + "%";
        
        const fDir = projTotal > lF ? '<b style="color:#f87171;">🔥 預測：大分</b>' : '<b style="color:#60a5fa;">❄️ 預測：小分</b>';
        analysis += `• 終場盤口(${lF}): 預計 ${projTotal} | ${fDir}<br>`;
        analysis += `• 距終場盤口諞差: <span style="color:#4facfe">${Math.abs(projTotal - lF).toFixed(1)} 分</span>`;
        if (fProb > 75) shouldConfetti = true;
    }

    document.getElementById('analysis').innerHTML = analysis;

    // 6. 彩帶慶祝
    if (shouldConfetti) {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.7 } });
    }

    document.getElementById('result').scrollIntoView({ behavior: 'smooth' });
});