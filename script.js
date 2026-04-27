const apiKey = 'f078b81e8cmshed755ca4dea5f70p1393e9jsnf05b9e444248';

document.getElementById('fetchDataBtn').addEventListener('click', async function() {
    const status = document.getElementById('apiStatus');
    status.innerText = "連線中...";

    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': apiKey,
            'x-rapidapi-host': 'api-basketball.p.rapidapi.com' // 確保是這個 Host
        }
    };

    try {
        // 抓取 NBA (League 12) 的比賽
        // 注意：如果你剛剛才點訂閱，請等待約 1-2 分鐘讓伺服器同步
        const response = await fetch('https://api-basketball.p.rapidapi.com/games?league=12&season=2025-2026', options);
        
        // 如果還是 403，我們會抓到這個錯誤
        if (response.status === 403) {
            status.innerText = "❌ 403：權限尚未生效，請稍等一分鐘再試或確認已點擊 Subscribe";
            return;
        }

        const data = await response.json();
        console.log("成功抓取資料:", data);

        // 找尋有分數的比賽
        const games = data.response ? data.response.filter(g => g.scores.home.total !== null) : [];

        if (games.length > 0) {
            const game = games[games.length - 1]; // 抓最新一場
            document.getElementById('homeScore').value = game.scores.home.total;
            document.getElementById('awayScore').value = game.scores.away.total;
            
            // 自動判斷節數
            const q = game.status.short === "FT" ? "4" : (game.status.short.replace(/[^0-9]/g, '') || "1");
            document.getElementById('quarter').value = q;
            
            status.innerText = `✅ 已同步：${game.teams.home.name} vs ${game.teams.away.name}`;
        } else {
            status.innerText = "😴 目前無進行中的 NBA 比賽";
        }
    } catch (error) {
        console.error(error);
        status.innerText = "❌ 連線異常，請確認 API Key 是否正確";
    }
});

// 計算功能
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