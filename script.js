const apiKey = 'f078b81e8cmshed755ca4dea5f70p1393e9jsnf05b9e444248';

document.getElementById('fetchDataBtn').addEventListener('click', async function() {
    const status = document.getElementById('apiStatus');
    status.innerText = "正在連線 RapidAPI...";
    
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
        // 🚀 關鍵修正：路徑必須是 /nba-scoreboard-by-date
        const response = await fetch(`https://nba-api-free-data.p.rapidapi.com/nba-scoreboard-by-date?date=${today}`, options);
        
        if (!response.ok) throw new Error(`HTTP 錯誤! 狀態碼: ${response.status}`);
        
        const data = await response.json();
        console.log("API 回傳結果:", data);

        // 解析資料 (這款 API 的資料通常在 results 陣列裡)
        const games = data.results || [];

        if (games.length > 0) {
            const game = games[0]; // 抓今天第一場
            
            // 自動填入 (根據該 API 的欄位名稱)
            document.getElementById('homeScore').value = game.home_team_score || 0;
            document.getElementById('awayScore').value = game.away_team_score || 0;
            document.getElementById('quarter').value = game.period || 1;
            
            const hName = game.home_team_name || "主隊";
            const vName = game.away_team_name || "客隊";
            status.innerText = `✅ 已更新：${hName} vs ${vName}`;
        } else {
            // 如果今天沒比賽，嘗試抓「2026-04-26」(昨天) 的來測試功能
            status.innerText = `今日無比賽，正在嘗試抓取昨日數據...`;
            const yesterday = "2026-04-26"; 
            const oldRes = await fetch(`https://nba-api-free-data.p.rapidapi.com/nba-scoreboard-by-date?date=${yesterday}`, options);
            const oldData = await oldRes.json();
            
            if (oldData.results && oldData.results.length > 0) {
                const oldGame = oldData.results[0];
                document.getElementById('homeScore').value = oldGame.home_team_score || 0;
                document.getElementById('awayScore').value = oldGame.away_team_score || 0;
                status.innerText = `✅ 已顯示昨日 (${yesterday}) 比分供測試`;
            } else {
                status.innerText = "😴 暫無比賽數據，請確認 API 訂閱是否包含 Scoreboard";
            }
        }
    } catch (error) {
        console.error("API 錯誤:", error);
        status.innerText = "❌ 失敗！請檢查 Console 或 API 訂閱狀態";
    }
});

// 計算功能保持不變
document.getElementById('predictBtn').addEventListener('click', function() {
    const home = parseFloat(document.getElementById('homeScore').value) || 0;
    const away = parseFloat(document.getElementById('awayScore').value) || 0;
    const quarter = parseInt(document.getElementById('quarter').value);
    const qTimeL = parseFloat(document.getElementById('quarterTime').value) || 12;
    
    const timePlayed = (quarter - 1) * 12 + (12 - qTimeL);
    const safeTime = timePlayed <= 0 ? 0.1 : timePlayed;
    
    const homeFinal = Math.round((home / safeTime) * 48);
    const awayFinal = Math.round((away / safeTime) * 48);
    
    const power = 13.91;
    const homeWinRate = ((Math.pow(homeFinal, power) / (Math.pow(homeFinal, power) + Math.pow(awayFinal, power))) * 100).toFixed(1);

    document.getElementById('result').style.display = 'block';
    document.getElementById('finalScore').innerText = `${homeFinal} : ${awayFinal}`;
    document.getElementById('winRate').innerText = `${homeWinRate}%`;
    
    document.body.style.background = homeFinal >= awayFinal ? 
        "linear-gradient(135deg, #1d976c, #93f9b9)" : "linear-gradient(135deg, #eb3349, #f45c43)";
});