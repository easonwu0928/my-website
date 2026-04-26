const apiKey = 'f078b81e8cmshed755ca4dea5f70p1393e9jsnf05b9e444248';

document.getElementById('fetchDataBtn').addEventListener('click', async function() {
    const status = document.getElementById('apiStatus');
    status.innerText = "連線中...";
    
    // 取得今天日期
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': apiKey,
            'x-rapidapi-host': 'nba-api-free-data.p.rapidapi.com'
        }
    };

    try {
        // 嘗試抓取今日比分
        // 注意：這款 API 的 Endpoint 可能是 /nba-scoreboard 或 /nba-scoreboard-by-date
        // 我們先嘗試最標準的格式
        const response = await fetch(`https://nba-api-free-data.p.rapidapi.com/nba-scoreboard?date=${today}`, options);
        const data = await response.json();

        console.log("API 回傳結果:", data);

        // 解析資料邏輯
        let games = [];
        if (data.results) {
            games = data.results;
        } else if (data.scoreboard && data.scoreboard.games) {
            games = data.scoreboard.games;
        }

        if (games && games.length > 0) {
            const game = games[0];
            
            // 填入數據 (相容不同欄位名)
            document.getElementById('homeScore').value = game.home_team_score || game.hTeam?.score || 0;
            document.getElementById('awayScore').value = game.away_team_score || game.vTeam?.score || 0;
            document.getElementById('quarter').value = game.period || 1;
            
            const hName = game.home_team_name || "主隊";
            const vName = game.away_team_name || "客隊";
            status.innerText = `✅ 同步成功：${hName} vs ${vName}`;
        } else {
            // 如果今天沒比賽，嘗試抓「昨天」的來測試功能
            status.innerText = `今日 (${today}) 暫無比賽，嘗試抓取昨日數據...`;
            const yesterday = new Date(now.setDate(now.getDate() - 1)).toISOString().split('T')[0];
            const oldRes = await fetch(`https://nba-api-free-data.p.rapidapi.com/nba-scoreboard?date=${yesterday}`, options);
            const oldData = await oldRes.json();
            
            if (oldData.results && oldData.results.length > 0) {
                const oldGame = oldData.results[0];
                document.getElementById('homeScore').value = oldGame.home_team_score;
                document.getElementById('awayScore').value = oldGame.away_team_score;
                status.innerText = `✅ 已顯示昨日 (${yesterday}) 比分供測試`;
            } else {
                status.innerText = "😴 目前 API 端點暫無數據，請確認 RapidAPI 訂閱狀態";
            }
        }
    } catch (error) {
        console.error("API 錯誤:", error);
        status.innerText = "❌ 連線失敗，請檢查網路或 API Key";
    }
});

// 計算功能保持不變
document.getElementById('predictBtn').addEventListener('click', function() {
    const home = parseFloat(document.getElementById('homeScore').value) || 0;
    const away = parseFloat(document.getElementById('awayScore').value) || 0;
    const quarter = parseInt(document.getElementById('quarter').value);
    const qTimeL = parseFloat(document.getElementById('quarterTime').value) || 0;
    const timePlayed = (quarter - 1) * 12 + (12 - qTimeL);
    const safeTime = timePlayed <= 0 ? 0.1 : timePlayed;
    const homeFinal = Math.round((home / safeTime) * 48);
    const awayFinal = Math.round((away / safeTime) * 48);
    const power = 13.91;
    const homeWinRate = ((Math.pow(homeFinal, power) / (Math.pow(homeFinal, power) + Math.pow(awayFinal, power))) * 100).toFixed(1);
    document.getElementById('result').style.display = 'block';
    document.getElementById('finalScore').innerText = `${homeFinal} : ${awayFinal}`;
    document.getElementById('winRate').innerText = `${homeWinRate}%`;
    document.body.style.background = homeFinal >= awayFinal ? "linear-gradient(135deg, #1d976c, #93f9b9)" : "linear-gradient(135deg, #eb3349, #f45c43)";
});