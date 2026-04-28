document.getElementById('predictBtn').addEventListener('click', function() {
    // 1. 抓取輸入數值
    const h = parseFloat(document.getElementById('homeScore').value) || 0;
    const a = parseFloat(document.getElementById('awayScore').value) || 0;
    const q = parseInt(document.getElementById('quarter').value);
    const m = parseFloat(document.getElementById('minLeft').value) || 0;
    const s = parseFloat(document.getElementById('secLeft').value) || 0;
    const lH = parseFloat(document.getElementById('lineHalf').value);
    const lF = parseFloat(document.getElementById('lineFull').value);

    // 2. 時間與預測計算
    const totalTime = 48;
    const timeLeft = (4 - q) * 12 + (m + s/60);
    const timePlayed = totalTime - timeLeft;
    const safePlayed = timePlayed <= 0 ? 0.1 : timePlayed;

    const hF = Math.round((h / safePlayed) * 48);
    const aF = Math.round((a / safePlayed) * 48);
    const projTotal = hF + aF;

    // 3. 顯示結果區塊與基本數據
    document.getElementById('result').style.display = 'block';
    document.getElementById('finalScore').innerText = `${hF} : ${aF}`;
    document.getElementById('currentTotal').innerText = h + a;
    document.getElementById('projectedTotal').innerText = projTotal;
    document.getElementById('fullProjTotal').innerText = projTotal;

    // --- 優化後的勝率計算邏輯 ---
    function calculateWinRate(h, a, hF, aF, progress) {
    if (h + a === 0) return 50;

    const diff = hF - aF; // 預測分差
    const actualDiff = h - a; // 當前實際分差

    // 1. 計算基於預測分差的基礎勝率 (使用更強的係數 0.15)
    // 這樣領先 20 分時勝率就約 95%，領先 40 分就接近 99.7%
    let predictedWR = (1 / (1 + Math.exp(-(0.15 * diff)))) * 100;

    // 2. 加入「當前實體分差」的保底機制
    // 如果現在已經贏超過 20 分，勝率不應該低於 90%
    let actualWR = (1 / (1 + Math.exp(-(0.2 * actualDiff)))) * 100;

    // 3. 動態權重分配
    // 比賽越早期，我們結合「預測」與「實際」；比賽越晚，越看重「預測」
    // 取兩者之大值，避免 144:36 這種情況被 progress 稀釋
    let combinedWR = (predictedWR * 0.7) + (actualWR * 0.3);

    // 根據進度平滑化，但如果是大屠殺，則無視 progress 修正
    let finalWinRate;
    if (Math.abs(diff) > 30) {
        // 分差過大，直接給出預測勝率，不再被時間稀釋
        finalWinRate = combinedWR;
    } else {
        // 分差較小時，才考慮時間進度，讓勝率隨時間慢慢穩定
        finalWinRate = 50 * (1 - Math.pow(progress, 0.3)) + combinedWR * Math.pow(progress, 0.3);
    }

    return Math.max(0.1, Math.min(99.9, finalWinRate));
    }

    // 5. 平滑機率計算函數
    function calculateProb(proj, line, sensitivity) {
        if (isNaN(line)) return 50;
        const diff = proj - line;
        const prob = (1 / (1 + Math.exp(-(sensitivity * diff)))) * 100;
        return Math.max(2, Math.min(98, prob)); 
    }

    let analysis = "🔍 <b>數據分析報告：</b><br>";
    let effectType = null; // 用於判斷啟動哪種特效

    // 6. 中場盤口分析
    const halfBox = document.getElementById('halfProbContainer');
    if (timePlayed < 24 && !isNaN(lH)) {
        const hProjH = Math.round((h / safePlayed) * 24) + Math.round((a / safePlayed) * 24);
        document.getElementById('halfProjTotal').innerText = hProjH;
        let hProb = calculateProb(hProjH, lH, 0.1); 
        document.getElementById('halfProbBar').style.width = hProb + "%";
        document.getElementById('halfProbPercent').innerText = hProb.toFixed(1) + "%";
        halfBox.style.display = 'block';
        
        const hDiff = (hProjH - lH).toFixed(1);
        analysis += `• 中場盤口(${lH}): 偏差 <b>${hDiff > 0 ? '+' + hDiff : hDiff}</b> | ${hProjH > lH ? '🔥大分趨勢' : '❄️小分趨勢'}<br>`;
        
        if (hProb > 70) effectType = 'fire';
        else if (hProb < 30) effectType = 'ice';
    } else {
        halfBox.style.display = 'none';
    }

    // 7. 終場盤口分析
    if (!isNaN(lF)) {
        let fProb = calculateProb(projTotal, lF, 0.08); 
        document.getElementById('fullProbBar').style.width = fProb + "%";
        document.getElementById('fullProbPercent').innerText = fProb.toFixed(1) + "%";
        
        const fDiff = (projTotal - lF).toFixed(1);
        analysis += `• 終場盤口(${lF}): 偏差 <b>${fDiff > 0 ? '+' + fDiff : fDiff}</b> | ${projTotal > lF ? '🔥大分趨勢' : '❄️小分趨勢'}<br>`;
        
        // 終場權重最高，覆蓋特效決定權
        if (fProb > 70) effectType = 'fire';
        else if (fProb < 30) effectType = 'ice';
    }

    document.getElementById('analysis').innerHTML = analysis;

    // 8. 視覺特效觸發 (確保 confetti 函式存在)
    if (typeof confetti === 'function' && effectType) {
        if (effectType === 'fire') {
            const fireConfig = {
                particleCount: 80,
                spread: 60,
                origin: { y: 0.7 },
                colors: ['#ff4500', '#ff8c00', '#ffd700'],
                scalar: 1.2
            };
            // 左右側噴火，不擋中央
            confetti({ ...fireConfig, angle: 60, origin: { x: 0, y: 0.7 } });
            confetti({ ...fireConfig, angle: 120, origin: { x: 1, y: 0.7 } });

        } else if (effectType === 'ice') {
            const duration = 2000; // 冰凍持續 2 秒
            const animationEnd = Date.now() + duration;

            (function frame() {
                const timeLeft = animationEnd - Date.now();
                if (timeLeft <= 0) return;

                confetti({
                    particleCount: 3,
                    startVelocity: 0,
                    ticks: 120,
                    origin: { x: Math.random(), y: Math.random() * 0.2 },
                    colors: ['#ffffff', '#afeeee', '#00bfff', '#f0f9ff'],
                    shapes: ['circle'],
                    gravity: 0.6,
                    scalar: Math.random() * 0.5 + 0.4,
                    drift: Math.random() * 2 - 1
                });
                requestAnimationFrame(frame);
            }());
        }
    }

    // 平滑滾動到結果
    document.getElementById('result').scrollIntoView({ behavior: 'smooth' });
});
// 快速加分函數
function addScore(targetId, points, event) {
    const input = document.getElementById(targetId);
    let currentScore = parseInt(input.value) || 0;
    input.value = currentScore + points;

    // 如果是 3 分球，觸發手勢動畫
    if (points === 3 && event) {
        showThreePointerEffect(event.clientX, event.clientY);
    }
}

// 顯示 3 分手勢效果
function showThreePointerEffect(x, y) {
    const emoji = document.createElement('div');
    emoji.className = 'three-pointer-emoji';
    emoji.innerText = '👌'; // 你也可以換成 '🏀' 或 '🔥'
    
    // 設定位置在點擊點附近
    emoji.style.left = (x - 20) + 'px';
    emoji.style.top = (y - 40) + 'px';
    
    document.body.appendChild(emoji);
    
    // 動畫結束後移除元素
    setTimeout(() => {
        emoji.remove();
    }, 800);
}