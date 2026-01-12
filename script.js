// YOUR DATA UNIVERSE IDs
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

// Using a stable proxy to get around Roblox security
const proxyUrl = "https://api.allorigins.win/get?url="; 

async function fetchGameStats() {
    const subtitle = document.querySelector('.subtitle');
    
    try {
        const idsString = universeIds.join(',');

        // 1. Fetch Game Info
        const statsUrl = `https://games.roblox.com/v1/games?universeIds=${idsString}`;
        const encodedStatsUrl = encodeURIComponent(statsUrl);
        const statsResponse = await fetch(`${proxyUrl}${encodedStatsUrl}`);
        
        if (!statsResponse.ok) throw new Error("Proxy did not respond");
        
        const statsData = await statsResponse.json();
        if (!statsData.contents) throw new Error("No data returned");
        
        const games = JSON.parse(statsData.contents).data;

        // 2. Fetch Thumbnails
        const thumbUrl = `https://thumbnails.roblox.com/v1/games/icons?universeIds=${idsString}&size=512x512&format=Png&isCircular=false`;
        const encodedThumbUrl = encodeURIComponent(thumbUrl);
        const thumbResponse = await fetch(`${proxyUrl}${encodedThumbUrl}`);
        const thumbData = await thumbResponse.json();
        const thumbnails = JSON.parse(thumbData.contents).data;

        // If we get here, it worked
        subtitle.innerText = "Look at all those numbers go!";
        renderGames(games, thumbnails);
        updateTotalStats(games);

    } catch (error) {
        console.error("Error details:", error);
        subtitle.innerText = `Error: ${error.message}. Check Console (F12).`;
        subtitle.style.color = "#ff4444";
    }
}

function renderGames(games, thumbnails) {
    const grid = document.getElementById('game-grid');
    grid.innerHTML = ''; 

    // Sort by playing count (Highest first)
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

    const playerLabel = document.getElementById('total-players');
    const visitsLabel = document.getElementById('total-visits');

    if(playerLabel) playerLabel.innerText = totalPlayers.toLocaleString();
    if(visitsLabel) visitsLabel.innerText = totalVisits.toLocaleString();
}

// Start
fetchGameStats();
