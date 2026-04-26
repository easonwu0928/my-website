const apiKey = 'f078b81e8cmshed755ca4dea5f70p1393e9jsnf05b9e444248';

// API 抓取功能
document.getElementById('fetchDataBtn').addEventListener('click', async function() {
    const status = document.getElementById('apiStatus');
    status.innerText = "正在連線 RapidAPI...";
    
    const today = new Date().toISOString().split('T')[0];
    
    try {
        const response = await fetch(`https://nba-api-free-data.p.rapidapi.com/nba-scoreboard?date=${today}`, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': apiKey,
                'x-rapidapi-host': 'nba-api-free-data.p.rapidapi.com'
            }
        });
        const data = await response.json();

        if (data && data.scoreboard && data.scoreboard.games.length > 0) {
            const game = data.scoreboard.games[0];
            document.getElementById('homeScore').value = game.home_team_score || 0;
            document.getElementById('awayScore').value = game.away_team_score || 0;
            document.getElementById('quarter').value = game.period || 1;
            status.innerText = `✅ 已同步：${game.home_team_name} vs ${game.away_team_name}`;
        } else {
            status.innerText = "😴 今日暫無進行中的比賽";
        }
    } catch (error) {
        console.error(error);
        status.innerText = "❌ 抓取失敗，請確認 API 訂閱";
    }
});

// 計算功能
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