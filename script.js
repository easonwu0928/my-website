document.getElementById('predictBtn').addEventListener('click', function() {
    const h = parseFloat(document.getElementById('homeScore').value) || 0;
    const a = parseFloat(document.getElementById('awayScore').value) || 0;
    const q = parseInt(document.getElementById('quarter').value);
    const m = parseFloat(document.getElementById('minLeft').value) || 0;
    const s = parseFloat(document.getElementById('secLeft').value) || 0;
    const lH = parseFloat(document.getElementById('lineHalf').value);
    const lF = parseFloat(document.getElementById('lineFull').value);

    // 時間與預測計算
    const totalTime = 48;
    const timeLeft = (4 - q) * 12 + (m + s/60);
    const timePlayed = totalTime - timeLeft;
    const safePlayed = timePlayed <= 0 ? 0.1 : timePlayed;

    const hF = Math.round((h / safePlayed) * 48);
    const aF = Math.round((a / safePlayed) * 48);
    const projTotal = hF + aF;

    // 顯示結果區塊
    document.getElementById('result').style.display = 'block';
    document.getElementById('finalScore').innerText = `${hF} : ${aF}`;
    document.getElementById('currentTotal').innerText = h + a;
    document.getElementById('projectedTotal').innerText = projTotal;
    document.getElementById('fullProjTotal').innerText = projTotal;

    // 勝率計算 (基於當前比分)
    const currentTrendWR = (h + a === 0) ? 50 : (Math.pow(h, 13.91) / (Math.pow(h, 13.91) + Math.pow(a, 13.91))) * 100;
    const progress = timePlayed / totalTime;
    const winRate = 50 * (1 - progress) + currentTrendWR * progress;
    document.getElementById('winRate').innerText = `${winRate.toFixed(1)}%`;

    // 平滑機率函數
    function calculateProb(proj, line, sensitivity) {
        if (isNaN(line)) return 50;
        const diff = proj - line;
        const prob = (1 / (1 + Math.exp(-(sensitivity * diff)))) * 100;
        return Math.max(2, Math.min(98, prob)); 
    }

    let analysis = "🔍 <b>數據分析報告：</b><br>";
    let effectType = null; // 'fire' 或 'ice'

    // 中場分析
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

    // 終場分析
    if (!isNaN(lF)) {
        let fProb = calculateProb(projTotal, lF, 0.08); 
        document.getElementById('fullProbBar').style.width = fProb + "%";
        document.getElementById('fullProbPercent').innerText = fProb.toFixed(1) + "%";
        
        const fDiff = (projTotal - lF).toFixed(1);
        analysis += `• 終場盤口(${lF}): 偏差 <b>${fDiff > 0 ? '+' + fDiff : fDiff}</b> | ${projTotal > lF ? '🔥大分趨勢' : '❄️小分趨勢'}<br>`;
        
        // 終場權重較高，會覆蓋中場的特效判斷
        if (fProb > 70) effectType = 'fire';
        else if (fProb < 30) effectType = 'ice';
    }

    document.getElementById('analysis').innerHTML = analysis;

    // --- 核心：火與冰的特效邏輯 ---
    if (typeof confetti === 'function' && effectType) {
        if (effectType === 'fire') {
            // 火焰效果：紅色、橘色、黃色，向上噴發
            const duration = 2 * 1000;
            const end = Date.now() + duration;

            (function frame() {
                confetti({
                    particleCount: 5,
                    angle: 90,
                    spread: 45,
                    origin: { y: 0.8 },
                    colors: ['#ff4500', '#ff8c00', '#ffd700'],
                    scalar: 1.2,
                    gravity: 0.5
                });
                if (Date.now() < end) requestAnimationFrame(frame);
            }());
        } else if (effectType === 'ice') {
            // 冰凍效果：白色、淺藍、深藍，像雪花般落下
            confetti({
                particleCount: 100,
                startVelocity: 0,
                ticks: 200,
                origin: { y: 0.3 }, // 從上方落下
                colors: ['#ffffff', '#afeeee', '#00bfff'],
                shapes: ['circle'],
                gravity: 0.4,
                scalar: 0.8,
                drift: 0,
                spread: 360
            });
        }
    }

    document.getElementById('result').scrollIntoView({ behavior: 'smooth' });
});