const apiKey = 'f078b81e8cmshed755ca4dea5f70p1393e9jsnf05b9e444248';

document.getElementById('fetchDataBtn').addEventListener('click', async function() {
    const status = document.getElementById('apiStatus');
    status.innerText = "連線中，請稍候...";
    
    // NBA 數據通常在台灣時間早晨更新，凌晨 4 點建議抓前一天的穩定數據
    const today = new Date().toISOString().split('T')[0];
    const yesterday = "2026-04-26"; 

    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': apiKey,
            'x-rapidapi-host': 'nba-api-free-data.p.rapidapi.com'
        }
    };

    async function tryFetch(date) {
        try {
            const url = `https://nba-api-free-data.p.rapidapi.com/nba-scoreboard-by-date?date=${date}`;
            const response = await fetch(url, options);
            const data = await response.json();
            
            // 如果 API 回傳 "failed"，代表後端伺服器掛了
            if (data.status === "failed") {
                console.warn(`日期 ${date} 抓取失敗: ${data.message}`);
                return null;
            }
            return data;
        } catch (e) {
            return null;
        }
    }

    // 優先抓今天，失敗就抓昨天
    let finalData = await tryFetch(today);
    let usedDate = today;

    if (!finalData || !finalData.results || finalData.results.length === 0) {
        status.innerText = "今日數據更新中，嘗試抓取昨日穩定數據...";
        finalData = await tryFetch(yesterday);
        usedDate = yesterday;
    }

    if (finalData && finalData.results && finalData.results.length > 0) {
        const game = finalData.results[0];
        document.getElementById('homeScore').value = game.home_team_score || 0;
        document.getElementById('awayScore').value = game.away_team_score || 0;
        document.getElementById('quarter').value = game.period || 1;
        
        status.innerText = `✅ 同步成功 (${usedDate})：${game.home_team_name} vs ${game.away_team_name}`;
    } else {
        status.innerText = "⚠️ API 伺服器目前繁忙，請 1 分鐘後再試";
    }
});

// 計算勝率邏輯 (保持不變)
document.getElementById('predictBtn').addEventListener('click', function() {
    const h = parseFloat(document.getElementById('homeScore').value) || 0;
    const a = parseFloat(document.getElementById('awayScore').value) || 0;
    const q = parseInt(document.getElementById('quarter').value);
    const t = parseFloat(document.getElementById('quarterTime').value) || 12;
    const played = (q - 1) * 12 + (12 - t);
    const safe = played <= 0 ? 0.1 : played;
    const hF = Math.round((h / safe) * 48);
    const aF = Math.round((a / safe) * 48);
    const homeWinRate = ((Math.pow(hF, 13.91) / (Math.pow(hF, 13.91) + Math.pow(aF, 13.91))) * 100).toFixed(1);
    document.getElementById('result').style.display = 'block';
    document.getElementById('finalScore').innerText = `${hF} : ${aF}`;
    document.getElementById('winRate').innerText = `${homeWinRate}%`;
});