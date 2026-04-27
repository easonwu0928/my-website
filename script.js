const apiKey = 'f078b81e8cmshed755ca4dea5f70p1393e9jsnf05b9e444248'; // 你的 Key 不變

document.getElementById('fetchDataBtn').addEventListener('click', async function() {
    const status = document.getElementById('apiStatus');
    status.innerText = "正在連線專業級數據庫...";
    
    // 取得今天日期
    const today = new Date().toISOString().split('T')[0];
    
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': apiKey,
            'x-rapidapi-host': 'api-basketball.p.rapidapi.com' // 注意：Host 換了
        }
    };

    try {
        // api-basketball 的路徑是 /games
        const response = await fetch(`https://api-basketball.p.rapidapi.com/games?date=${today}&league=12&season=2025-2026`, options);
        const data = await response.json();

        if (data.response && data.response.length > 0) {
            // 找第一場比賽
            const game = data.response[0];
            
            // 自動填入新 API 的欄位名稱
            document.getElementById('homeScore').value = game.scores.home.total || 0;
            document.getElementById('awayScore').value = game.scores.away.total || 0;
            
            // 處理節數 (API 回傳通常是 "Quarter 1" 或直接數字)
            const periodStr = game.status.short || "1";
            document.getElementById('quarter').value = periodStr.replace(/[^0-9]/g, '') || 1;
            
            status.innerText = `✅ 同步成功：${game.teams.home.name} vs ${game.teams.away.name}`;
        } else {
            status.innerText = "😴 目前暫無 NBA 比賽，請稍後再試";
        }
    } catch (error) {
        console.error(error);
        status.innerText = "❌ 連線失敗，請確認是否已訂閱 API-BASKETBALL";
    }
});

// 勝率計算邏輯保持不變
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
    document.body.style.background = hF >= aF ? "linear-gradient(135deg, #1d976c, #93f9b9)" : "linear-gradient(135deg, #eb3349, #f45c43)";
});