const apiKey = 'f078b81e8cmshed755ca4dea5f70p1393e9jsnf05b9e444248';

document.getElementById('fetchDataBtn').addEventListener('click', async function() {
    const status = document.getElementById('apiStatus');
    status.innerText = "正在連線並解析數據...";
    
    // 修正時區：NBA 數據通常以美國日期為準，台灣凌晨時要抓「昨天」或「今天」
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
        const response = await fetch(`https://nba-api-free-data.p.rapidapi.com/nba-scoreboard?date=${today}`, options);
        const data = await response.json();
        
        console.log("API 回傳原始資料:", data); // 你可以在瀏覽器按 F12 看到這個

        // --- 超強相容解析邏輯 ---
        let games = [];
        if (data.scoreboard && data.scoreboard.games) {
            games = data.scoreboard.games;
        } else if (data.games) {
            games = data.games;
        } else if (Array.isArray(data)) {
            games = data;
        }

        if (games.length > 0) {
            // 優先找「正在進行中」的比賽 (status == 2)，沒有的話就抓第一場
            const liveGame = games.find(g => g.status === 2 || g.period > 0) || games[0];
            
            // 根據不同的 API 欄位命名習慣自動抓取分數
            const hScore = liveGame.home_team_score || liveGame.hTeam?.score || liveGame.homeTeam?.score || 0;
            const vScore = liveGame.away_team_score || liveGame.vTeam?.score || liveGame.awayTeam?.score || 0;
            const currentPeriod = liveGame.period || liveGame.period?.current || 1;
            const hName = liveGame.home_team_name || liveGame.hTeam?.name || "主隊";
            const vName = liveGame.away_team_name || liveGame.vTeam?.name || "客隊";

            // 填入網頁
            document.getElementById('homeScore').value = hScore;
            document.getElementById('awayScore').value = vScore;
            document.getElementById('quarter').value = Math.min(Math.max(currentPeriod, 1), 4);
            
            status.innerText = `✅ 同步成功：${hName} ${hScore} : ${vScore} ${vName}`;
        } else {
            status.innerText = `😴 API 顯示 ${today} 暫無比賽，請稍後再試`;
        }
    } catch (error) {
        console.error("錯誤詳情:", error);
        status.innerText = "❌ 抓取失敗，請確認 RapidAPI 訂閱狀態";
    }
});

// 計算功能保持不變...
document.getElementById('predictBtn').addEventListener('click', function() {
    const home = parseFloat(document.getElementById('homeScore').value);
    const away = parseFloat(document.getElementById('awayScore').value);
    const quarter = parseInt(document.getElementById('quarter').value);
    const qTimeL = parseFloat(document.getElementById('quarterTime').value);
    const timePlayed = (quarter - 1) * 12 + (12 - qTimeL);
    const safeTime = timePlayed <= 0 ? 0.1 : timePlayed;
    const homeFinal = Math.round((home / safeTime) * 48);
    const awayFinal = Math.round((away / safeTime) * 48);
    const power = 13.91;
    const homeWinRate = (Math.pow(homeFinal, power) / (Math.pow(homeFinal, power) + Math.pow(awayFinal, power)) * 100).toFixed(1);
    document.getElementById('result').style.display = 'block';
    document.getElementById('finalScore').innerText = `${homeFinal} : ${awayFinal}`;
    document.getElementById('winRate').innerText = `${homeWinRate}%`;
    document.body.style.background = homeFinal > awayFinal ? 
        "linear-gradient(135deg, #1d976c, #93f9b9)" : "linear-gradient(135deg, #eb3349, #f45c43)";
});