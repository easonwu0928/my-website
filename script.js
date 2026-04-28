document.getElementById('predictBtn').addEventListener('click', function() {
    // 1. 抓取數值
    const h = parseFloat(document.getElementById('homeScore').value) || 0;
    const a = parseFloat(document.getElementById('awayScore').value) || 0;
    const q = parseInt(document.getElementById('quarter').value);
    const m = parseFloat(document.getElementById('minLeft').value) || 0;
    const s = parseFloat(document.getElementById('secLeft').value) || 0;
    const lH = parseFloat(document.getElementById('lineHalf').value);
    const lF = parseFloat(document.getElementById('lineFull').value);

    // 2. 時間與基礎預測
    const totalTime = 48;
    const timeLeft = (4 - q) * 12 + (m + s/60);
    const timePlayed = totalTime - timeLeft;
    const safePlayed = timePlayed <= 0 ? 0.1 : timePlayed;
    const progress = timePlayed / totalTime;

    const hF = Math.round((h / safePlayed) * 48);
    const aF = Math.round((a / safePlayed) * 48);
    const projTotal = hF + aF;

    // 3. 顯示結果 & 執行勝率計算
    document.getElementById('result').style.display = 'block';
    document.getElementById('finalScore').innerText = `${hF} : ${aF}`;
    document.getElementById('currentTotal').innerText = h + a;
    document.getElementById('projectedTotal').innerText = projTotal;
    document.getElementById('fullProjTotal').innerText = projTotal;

    // 調用勝率函數
    const winRate = calculateWinRate(h, a, hF, aF, progress);
    document.getElementById('winRate').innerText = `${winRate.toFixed(1)}%`;

    // 4. 平滑機率計算
    function calculateProb(proj, line, sensitivity) {
        if (isNaN(line)) return 50;
        const diff = proj - line;
        return Math.max(2, Math.min(98, (1 / (1 + Math.exp(-(sensitivity * diff)))) * 100));
    }

    let analysis = "🔍 <b>數據分析報告：</b><br>";
    let effectType = null;

    // 中場分析
    const halfBox = document.getElementById('halfProbContainer');
    if (timePlayed < 24 && !isNaN(lH)) {
        const hProjH = Math.round((h / safePlayed) * 24) + Math.round((a / safePlayed) * 24);
        document.getElementById('halfProjTotal').innerText = hProjH;
        let hProb = calculateProb(hProjH, lH, 0.1);
        document.getElementById('halfProbBar').style.width = hProb + "%";
        document.getElementById('halfProbPercent').innerText = hProb.toFixed(1) + "%";
        halfBox.style.display = 'block';
        if (hProb > 70) effectType = 'fire';
        else if (hProb < 30) effectType = 'ice';
    } else { halfBox.style.display = 'none'; }

    // 終場分析
    if (!isNaN(lF)) {
        let fProb = calculateProb(projTotal, lF, 0.08);
        document.getElementById('fullProbBar').style.width = fProb + "%";
        document.getElementById('fullProbPercent').innerText = fProb.toFixed(1) + "%";
        const fDiff = (projTotal - lF).toFixed(1);
        analysis += `• 終場盤口(${lF}): 偏差 <b>${fDiff > 0 ? '+' + fDiff : fDiff}</b> | ${projTotal > lF ? '🔥大分趨勢' : '❄️小分趨勢'}<br>`;
        if (fProb > 70) effectType = 'fire';
        else if (fProb < 30) effectType = 'ice';
    }

    document.getElementById('analysis').innerHTML = analysis;
    triggerEffect(effectType);
    document.getElementById('result').scrollIntoView({ behavior: 'smooth' });
});

// --- 功能函數區 ---

function calculateWinRate(h, a, hF, aF, progress) {
    if (h + a === 0) return 50;
    const diff = hF - aF;
    const actualDiff = h - a;
    let predictedWR = (1 / (1 + Math.exp(-(0.15 * diff)))) * 100;
    let actualWR = (1 / (1 + Math.exp(-(0.2 * actualDiff)))) * 100;
    let combinedWR = (predictedWR * 0.7) + (actualWR * 0.3);
    
    if (Math.abs(diff) > 30) return combinedWR;
    return 50 * (1 - Math.pow(progress, 0.3)) + combinedWR * Math.pow(progress, 0.3);
}

function addScore(targetId, points, event) {
    const input = document.getElementById(targetId);
    input.value = (parseInt(input.value) || 0) + points;
    if (points === 3 && event) showThreePointerEffect(event.clientX, event.clientY);
}

function showThreePointerEffect(x, y) {
    const emoji = document.createElement('div');
    emoji.className = 'three-pointer-emoji';
    emoji.innerText = '👌';
    emoji.style.left = (x - 20) + 'px';
    emoji.style.top = (y - 40) + 'px';
    document.body.appendChild(emoji);
    setTimeout(() => emoji.remove(), 800);
}

function triggerEffect(type) {
    if (typeof confetti !== 'function' || !type) return;
    if (type === 'fire') {
        const cfg = { particleCount: 80, spread: 60, origin: { y: 0.7 }, colors: ['#ff4500', '#ff8c00', '#ffd700'], scalar: 1.2 };
        confetti({ ...cfg, angle: 60, origin: { x: 0, y: 0.7 } });
        confetti({ ...cfg, angle: 120, origin: { x: 1, y: 0.7 } });
    } else if (type === 'ice') {
        const end = Date.now() + 2000;
        (function frame() {
            confetti({ particleCount: 3, startVelocity: 0, ticks: 120, origin: { x: Math.random(), y: Math.random() * 0.2 }, colors: ['#ffffff', '#afeeee', '#00bfff'], gravity: 0.6 });
            if (Date.now() < end) requestAnimationFrame(frame);
        }());
    }
}