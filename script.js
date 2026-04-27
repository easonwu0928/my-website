const apiKey = 'f078b81e8cmshed755ca4dea5f70p1393e9jsnf05b9e444248';

document.getElementById('fetchDataBtn').addEventListener('click', async function() {
    const status = document.getElementById('apiStatus');
    status.innerText = "專業數據連線成功，抓取比分中...";

    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': apiKey,
            'x-rapidapi-host': 'api-basketball.p.rapidapi.com'
        }
    };

    try {
        // 使用這款 API 的正確 Scoreboard 路徑
        // 12 代表 NBA, 賽季設為當前賽季
        const url = `https://api-basketball.p.rapidapi.com/games?league=12&season=2025-2026`;
        const response = await fetch(url, options);
        const data = await response.json();
        
        console.log("新 API 資料回傳:", data);

        // 篩選有分數的比賽 (從最新的開始找)
        const games = data.response ? data.response.filter(g => g.scores.home.total !== null).reverse() : [];

        if (games.length > 0) {
            const game = games[0]; // 抓最近一場
            
            // 根據 API-BASKETBALL 的資料結構填入
            document.getElementById('homeScore').value = game.scores.home.total;
            document.getElementById('awayScore').value = game.scores.away.total;
            
            // 處理節數：如果是結束 (FT) 顯示 4，其餘抓取實際節數
            let q = "1";
            if (game.status.short === "FT") {
                q = "4";
            } else {
                q = game.status.short.replace(/[^0-9]/g, '') || "1";
            }
            document.getElementById('quarter').value = q;
            
            status.innerText = `✅ 同步成功：${game.teams.home.name} vs ${game.teams.away.name}`;
        } else {
            status.innerText = "😴 目前賽程表中暫無即時比分數據";
        }
    } catch (error) {
        console.error("抓取失敗:", error);
        status.innerText = "❌ 資料解析失敗，請稍後再試";
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