document.getElementById('predictBtn').addEventListener('click', function() {
    // 1. 抓取輸入數值
    const h = parseFloat(document.getElementById('homeScore').value) || 0;
    const a = parseFloat(document.getElementById('awayScore').value) || 0;
    const q = parseInt(document.getElementById('quarter').value);
    const m = parseFloat(document.getElementById('minLeft').value) || 0;
    const s = parseFloat(document.getElementById('secLeft').value) || 0;
    const lH = parseFloat(document.getElementById('lineHalf').value);
    const lF = parseFloat(document.getElementById('lineFull').value);

    // 2. 時間與進度計算 (NBA 標準 48 分鐘)
    const totalTime = 48;
    const timeLeft = (4 - q) * 12 + (m + s / 60);
    const timePlayed = totalTime - timeLeft;
    const safePlayed = timePlayed <= 0 ? 0.1 : timePlayed; // 防止除以 0
    const progress = timePlayed / totalTime;

    // 3. 基礎比分預測 (線性外推)
    const hF = Math.round((h / safePlayed) * 48);
    const aF = Math.round((a / safePlayed) * 48);
    const projTotal = hF + aF;

    // 4. 更新 UI 顯示基本數據
    document.getElementById('result').style.display = 'block';
    document.getElementById('finalScore').innerText = `${hF} : ${aF}`;
    document.getElementById('currentTotal').innerText = h + a;
    document.getElementById('projectedTotal').innerText = projTotal;
    document.getElementById('fullProjTotal').innerText = projTotal;

    // 5. 執行【專業平衡版】勝率計算並更新
    const winRate = calculateWinRate(h, a, hF, aF, progress);
    document.getElementById('winRate').innerText = `${winRate.toFixed(1)}%`;

    // 6. 大小分機率分析邏輯
    let analysis = "🔍 <b>數據分析報告：</b><br>";
    let effectType = null;

    // 中場盤口分析 (僅在半場結束前顯示)
    const halfBox = document.getElementById('halfProbContainer');
    if (timePlayed < 24 && !isNaN(lH)) {
        const hProjH = Math.round((h / safePlayed) * 24) + Math.round((a / safePlayed) * 24);
        document.getElementById('halfProjTotal').innerText = hProjH;
        let hProb = calculateProb(hProjH, lH, 0.1); 
        document.getElementById('halfProbBar').style.width = hProb + "%";
        document.getElementById('halfProbPercent').innerText = hProb.toFixed(1) + "%";
        halfBox.style.display = 'block';
        
        if (hProb > 75) effectType = 'fire';
        else if (hProb < 25) effectType = 'ice';
    } else {
        halfBox.style.display = 'none';
    }

    // 終場盤口分析
    if (!isNaN(lF)) {
        let fProb = calculateProb(projTotal, lF, 0.08); 
        document.getElementById('fullProbBar').style.width = fProb + "%";
        document.getElementById('fullProbPercent').innerText = fProb.toFixed(1) + "%";
        
        const fDiff = (projTotal - lF).toFixed(1);
        analysis += `• 終場盤口(${lF}): 偏差 <b>${fDiff > 0 ? '+' + fDiff : fDiff}</b> | ${projTotal > lF ? '🔥大分趨勢' : '❄️小分趨勢'}<br>`;
        
        // 特效優先順序
        if (fProb > 75) effectType = 'fire';
        else if (fProb < 25) effectType = 'ice';
    }

    document.getElementById('analysis').innerHTML = analysis;

    // 7. 觸發視覺特效
    triggerVisualEffects(effectType);

    // 8. 平滑捲動到結果區
    document.getElementById('result').scrollIntoView({ behavior: 'smooth' });
});

/**
 * 【核心算法】專業平衡版勝率計算
 */
function calculateWinRate(h, a, hF, aF, progress) {
    if (h + a === 0) return 50;

    const diff = hF - aF; // 預測最終分差
    const actualDiff = h - a; // 當前實際分差

    // 1. 中度敏感係數 0.1：預估贏 10 分時基礎勝率約 73%
    let baseWinProb = (1 / (1 + Math.exp(-(0.1 * diff)))) * 100;

    // 2. 優化時間因子：使用平方根讓比賽中段反應更敏銳
    let timeWeight = Math.sqrt(progress);

    // 3. 混合計算勝率
    let finalWinRate = 50 + (baseWinProb - 50) * timeWeight;

    // 4. 實體保底機制：防止大幅領先時勝率過低
    if (actualDiff >= 15 && finalWinRate < 75) finalWinRate = 75 + (progress * 10);
    if (actualDiff <= -15 && finalWinRate > 25) finalWinRate = 25 - (progress * 10);

    return Math.max(0.1, Math.min(99.9, finalWinRate));
}

/**
 * 邏輯回歸機率函數
 */
function calculateProb(proj, line, sensitivity) {
    if (isNaN(line)) return 50;
    const diff = proj - line;
    const prob = (1 / (1 + Math.exp(-(sensitivity * diff)))) * 100;
    return Math.max(2, Math.min(98, prob)); 
}

/**
 * 快速加分函數
 */
function addScore(targetId, points, event) {
    const input = document.getElementById(targetId);
    let currentScore = parseInt(input.value) || 0;
    input.value = currentScore + points;

    // 如果是 3 分球且有 event 物件，觸發手勢動畫
    if (points === 3 && event) {
        showThreePointerEffect(event.clientX, event.clientY);
    }
}

/**
 * 顯示 👌 手勢特效
 */
function showThreePointerEffect(x, y) {
    const emoji = document.createElement('div');
    emoji.className = 'three-pointer-emoji';
    emoji.innerText = '👌';
    
    // 設定位置在點擊點附近 (考慮捲動距離)
    emoji.style.left = (x - 20) + 'px';
    emoji.style.top = (window.scrollY + y - 40) + 'px';
    
    document.body.appendChild(emoji);
    
    setTimeout(() => {
        emoji.remove();
    }, 800);
}

/**
 * 觸發大分火/小分冰特效
 */
function triggerVisualEffects(type) {
    if (typeof confetti !== 'function' || !type) return;

    if (type === 'fire') {
        const fireConfig = {
            particleCount: 80, spread: 60, origin: { y: 0.7 },
            colors: ['#ff4500', '#ff8c00', '#ffd700'], scalar: 1.2
        };
        confetti({ ...fireConfig, angle: 60, origin: { x: 0, y: 0.7 } });
        confetti({ ...fireConfig, angle: 120, origin: { x: 1, y: 0.7 } });

    } else if (type === 'ice') {
        const duration = 2000;
        const animationEnd = Date.now() + duration;

        (function frame() {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return;

            confetti({
                particleCount: 3, startVelocity: 0, ticks: 120,
                origin: { x: Math.random(), y: Math.random() * 0.2 },
                colors: ['#ffffff', '#afeeee', '#00bfff'],
                gravity: 0.6, scalar: Math.random() * 0.5 + 0.4
            });
            requestAnimationFrame(frame);
        }());
    }
}