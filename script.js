const apiKey = 'f078b81e8cmshed755ca4dea5f70p1393e9jsnf05b9e444248';

document.getElementById('fetchDataBtn').addEventListener('click', async function() {
    const status = document.getElementById('apiStatus');
    status.innerText = "連線中...";

    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': apiKey,
            'x-rapidapi-host': 'api-basketball.p.rapidapi.com'
        }
    };

    try {
        // 使用更寬鬆的參數：抓取當前賽季的所有 NBA 比賽，而不只是「今天」
        // 這樣就算今天凌晨沒比賽，也能抓到最近一場有分數的
        const url = `https://api-basketball.p.rapidapi.com/games?league=12&season=2025-2026`;
        const response = await fetch(url, options);

        if (response.status === 403) {
            status.innerText = "❌ 權限不足！請去 RapidAPI 頁面點擊 'Subscribe' 訂閱此 API";
            return;
        }

        const data = await response.json();
        
        // 篩選出「正在進行中」或「剛結束」有分數的比賽
        const activeGames = data.response.filter(g => g.scores.home.total !== null).reverse();

        if (activeGames.length > 0) {
            const game = activeGames[0]; // 抓最近一場
            
            document.getElementById('homeScore').value = game.scores.home.total || 0;
            document.getElementById('awayScore').value = game.scores.away.total || 0;
            
            // 處理節數顯示
            const period = game.status.short === "FT" ? "4" : (game.status.short.replace(/[^0-9]/g, '') || "1");
            document.getElementById('quarter').value = period;
            
            status.innerText = `✅ 已同步：${game.teams.home.name} vs ${game.teams.away.name}`;
        } else {
            status.innerText = "😴 暫無即時數據，請稍後再試";
        }
    } catch (error) {
        console.error(error);
        status.innerText = "❌ 連線異常，請確認網路與訂閱狀態";
    }
});

// 計算功能保持不變
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