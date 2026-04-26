// ⚠️ 這是你截圖中的 API Key
const apiKey = 'f078b81e8cmshed755ca4dea5f70p1393e9jsnf05b9e444248';

// --- 1. 自動抓取 NBA 比分功能 ---
document.getElementById('fetchDataBtn').addEventListener('click', async function() {
    const status = document.getElementById('apiStatus');
    status.innerText = "正在連線 RapidAPI...";
    
    // 取得今天日期 (格式 YYYY-MM-DD)
    const today = "2026-04-26";
    
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': apiKey,
            'x-rapidapi-host': 'nba-api-free-data.p.rapidapi.com'
        }
    };

    try {
        // 修正後的正確路徑：nba-scoreboard-by-date
        const response = await fetch(`https://nba-api-free-data.p.rapidapi.com/nba-scoreboard-by-date?date=${today}`, options);
        const data = await response.json();

        console.log("API 原始回傳:", data);

        // 解析這款 API 的結構 (通常在 data.results 裡)
        const games = data.results || data.games || [];

        if (games.length > 0) {
            // 抓取第一場比賽作為範例
            const game = games[0];
            
            // 自動填入分數與節數 (相容多種欄位命名)
            document.getElementById('homeScore').value = game.home_team_score || 0;
            document.getElementById('awayScore').value = game.away_team_score || 0;
            document.getElementById('quarter').value = game.period || 1;
            
            const homeName = game.home_team_name || "主隊";
            const awayName = game.away_team_name || "客隊";
            status.innerText = `✅ 已更新：${homeName} vs ${awayName}`;
        } else {
            status.innerText = `😴 API 顯示 ${today} 暫無比賽數據`;
        }
    } catch (error) {
        console.error("抓取失敗:", error);
        status.innerText = "❌ 失敗！請檢查 API 網址或 Key 是否正確";
    }
});

// --- 2. 勝率計算功能 ---
document.getElementById('predictBtn').addEventListener('click', function() {
    // 讀取網頁上的數值
    const home = parseFloat(document.getElementById('homeScore').value) || 0;
    const away = parseFloat(document.getElementById('awayScore').value) || 0;
    const quarter = parseInt(document.getElementById('quarter').value);
    const qTimeL = parseFloat(document.getElementById('quarterTime').value) || 0;
    
    // 邏輯：計算目前已比賽的總時間 (NBA 每節 12 分鐘，總共 48 分鐘)
    const timePlayed = (quarter - 1) * 12 + (12 - qTimeL);
    const safeTime = timePlayed <= 0 ? 0.1 : timePlayed; // 防止除以 0
    
    // 步驟 A：計算預估終場比分 (按比例放大)
    const homeFinal = Math.round((home / safeTime) * 48);
    const awayFinal = Math.round((away / safeTime) * 48);
    
    // 步驟 B：利用畢達哥拉斯公式計算勝率 (指數 13.91)
    const power = 13.91;
    const homeP = Math.pow(homeFinal, power);
    const awayP = Math.pow(awayFinal, power);
    const homeWinRate = ((homeP / (homeP + awayP)) * 100).toFixed(1);

    // 顯示結果
    document.getElementById('result').style.display = 'block';
    document.getElementById('finalScore').innerText = `${homeFinal} : ${awayFinal}`;
    document.getElementById('winRate').innerText = `${homeWinRate}%`;
    
    // 視覺回饋：贏球變綠色背景，輸球變紅色背景
    document.body.style.background = homeFinal >= awayFinal ? 
        "linear-gradient(135deg, #1d976c, #93f9b9)" : 
        "linear-gradient(135deg, #eb3349, #f45c43)";
});