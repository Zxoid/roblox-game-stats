// YOUR UNIVERSE IDs (As you confirmed)
const universeIds = [
    9501022712,  
    9041696916,  
    8508052794,
    8645669017,
    9539811654,
    8662003473,
    9413725497,
    9451035756
];

const proxyUrl = "https://api.allorigins.win/get?url="; 

async function fetchGameStats() {
    try {
        const idsString = universeIds.join(',');
        
        // 1. Fetch Game Info (Directly using Universe IDs)
        const statsApiUrl = encodeURIComponent(`https://games.roblox.com/v1/games?universeIds=${idsString}`);
        const statsResponse = await fetch(`${proxyUrl}${statsApiUrl}`);
        const statsData = await statsResponse.json();
        const games = JSON.parse(statsData.contents).data;

        // 2. Fetch Thumbnails
        const thumbApiUrl = encodeURIComponent(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${idsString}&size=512x512&format=Png&isCircular=false`);
        const thumbResponse = await fetch(`${proxyUrl}${thumbApiUrl}`);
        const thumbData = await thumbResponse.json();
        const thumbnails = JSON.parse(thumbData.contents).data;

        renderGames(games, thumbnails);
        updateTotalStats(games);

    } catch (error) {
        console.error("Error fetching stats:", error);
        document.querySelector('.subtitle').innerText = "Failed to load stats. Double check if these are definitely Universe IDs.";
    }
}

function renderGames(games, thumbnails) {
    const grid = document.getElementById('game-grid');
    grid.innerHTML = ''; 

    // Sort games by playing count (Highest first)
    games.sort((a, b) => b.playing - a.playing);

    games.forEach(game => {
        const thumbObj = thumbnails.find(t => t.targetId === game.id);
        const thumbUrl = thumbObj ? thumbObj.imageUrl : 'https://via.placeholder.com/512';

        const card = document.createElement('div');
        card.className = 'game-card';
        card.innerHTML = `
            <img src="${thumbUrl}" alt="${game.name}" class="game-thumb">
            <div class="game-info">
                <div class="game-title" title="${game.name}">${game.name}</div>
                
                <div class="stat-row">
                    <span>🟢 Playing</span>
                    <span class="stat-value">${game.playing.toLocaleString()}</span>
                </div>
                <div class="stat-row">
                    <span>👣 Visits</span>
                    <span class="stat-value">${game.visits.toLocaleString()}</span>
                </div>
                <div class="stat-row">
                    <span>⭐ Favorites</span>
                    <span class="stat-value">${game.favoritedCount.toLocaleString()}</span>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function updateTotalStats(games) {
    let totalVisits = 0;
    let totalPlayers = 0;

    games.forEach(game => {
        totalVisits += game.visits;
        totalPlayers += game.playing;
    });

    document.getElementById('total-players').innerText = totalPlayers.toLocaleString();
    document.getElementById('total-visits').innerText = totalVisits.toLocaleString();
}

fetchGameStats();
