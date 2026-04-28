document.getElementById('predictBtn').addEventListener('click', function() {
    // 1. 抓取輸入數值
    const h = parseFloat(document.getElementById('homeScore').value) || 0;
    const a = parseFloat(document.getElementById('awayScore').value) || 0;
    const q = parseInt(document.getElementById('quarter').value);
    const m = parseFloat(document.getElementById('minLeft').value) || 0;
    const s = parseFloat(document.getElementById('secLeft').value) || 0;
    const lH = parseFloat(document.getElementById('lineHalf').value);
    const lF = parseFloat(document.getElementById('lineFull').value);

    // 2. 時間與進度計算
    const totalTime = 48;
    const timeLeft = (4 - q) * 12 + (m + s / 60);
    const timePlayed = totalTime - timeLeft;
    const safePlayed = timePlayed <= 0 ? 0.1 : timePlayed;
    const progress = timePlayed / totalTime;

    // 3. 基礎比分預測
    const hF = Math.round((h / safePlayed) * 48);
    const aF = Math.round((a / safePlayed) * 48);
    const projTotal = hF + aF;

    // 4. 更新 UI 顯示
    document.getElementById('result').style.display = 'block';
    document.getElementById('finalScore').innerText = `${hF} : ${aF}`;
    document.getElementById('currentTotal').innerText = h + a;
    document.getElementById('projectedTotal').innerText = projTotal;
    document.getElementById('fullProjTotal').innerText = projTotal;

    // 5. 執行【最初版本】勝率計算並更新
    const winRate = calculateWinRate(h, a, hF, aF, progress);
    document.getElementById('winRate').innerText = `${winRate.toFixed(1)}%`;

    // 6. 大小分機率分析邏輯
    let analysis = "🔍 <b>數據分析報告：</b><br>";
    let effectType = null;

    if (timePlayed < 24 && !isNaN(lH)) {
        const hProjH = Math.round((h / safePlayed) * 24) + Math.round((a / safePlayed) * 24);
        document.getElementById('halfProjTotal').innerText = hProjH;
        let hProb = calculateProb(hProjH, lH, 0.1); 
        document.getElementById('halfProbBar').style.width = hProb + "%";
        document.getElementById('halfProbPercent').innerText = hProb.toFixed(1) + "%";
        document.getElementById('halfProbContainer').style.display = 'block';
        if (hProb > 75) effectType = 'fire';
        else if (hProb < 25) effectType = 'ice';
    } else {
        document.getElementById('halfProbContainer').style.display = 'none';
    }

    if (!isNaN(lF)) {
        let fProb = calculateProb(projTotal, lF, 0.08); 
        document.getElementById('fullProbBar').style.width = fProb + "%";
        document.getElementById('fullProbPercent').innerText = fProb.toFixed(1) + "%";
        const fDiff = (projTotal - lF).toFixed(1);
        analysis += `• 終場盤口(${lF}): 偏差 <b>${fDiff > 0 ? '+' + fDiff : fDiff}</b> | ${projTotal > lF ? '🔥大分趨勢' : '❄️小分趨勢'}<br>`;
        if (fProb > 75) effectType = 'fire';
        else if (fProb < 25) effectType = 'ice';
    }

    document.getElementById('analysis').innerHTML = analysis;
    triggerVisualEffects(effectType);
    document.getElementById('result').scrollIntoView({ behavior: 'smooth' });
});

/**
 * 【最初版本】基礎勝率算法
 */
function calculateWinRate(h, a, hF, aF, progress) {
    if (h + a === 0) return 50;

    // 1. 基於預測最終得分的領先幅度
    const diff = hF - aF;
    
    // 2. 邏輯回歸基礎模擬
    let predictedWR = (1 / (1 + Math.exp(-(0.1 * diff)))) * 100;

    // 3. 根據比賽進度動態調整 (回歸最初的 0.5 次方平滑)
    const finalWinRate = 50 * (1 - Math.pow(progress, 0.5)) + predictedWR * Math.pow(progress, 0.5);

    return Math.max(1, Math.min(99.9, finalWinRate));
}

function calculateProb(proj, line, sensitivity) {
    if (isNaN(line)) return 50;
    const diff = proj - line;
    return Math.max(2, Math.min(98, (1 / (1 + Math.exp(-(sensitivity * diff)))) * 100));
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
    emoji.style.top = (window.scrollY + y - 40) + 'px';
    document.body.appendChild(emoji);
    setTimeout(() => emoji.remove(), 800);
}

function triggerVisualEffects(type) {
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