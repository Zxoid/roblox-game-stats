// 1. YOUR UNIVERSE IDs
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
    const subtitle = document.querySelector('.subtitle');
    if(subtitle) subtitle.innerText = "Loading your games...";

    try {
        const idsString = universeIds.join(',');

        // STEP 1: FETCH GAME STATS
        const statsUrl = `https://games.roblox.com/v1/games?universeIds=${idsString}`;
        const encodedStatsUrl = encodeURIComponent(statsUrl);
        
        const statsResponse = await fetch(`${proxyUrl}${encodedStatsUrl}`);
        if (!statsResponse.ok) throw new Error("Failed to connect to Roblox API");

        const statsData = await statsResponse.json();
        const games = JSON.parse(statsData.contents).data;

        if (!games || games.length === 0) {
            throw new Error("No games found. Double check Universe IDs!");
        }

        // STEP 2: FETCH THUMBNAILS (16:9 Landscape)
        // We use 'multiget/thumbnails' instead of 'icons' to get the big game picture
        // We request size 768x432 for high quality big boxes
        const thumbUrl = `https://thumbnails.roblox.com/v1/games/multiget/thumbnails?universeIds=${idsString}&countPerUniverse=1&size=768x432&format=Png&isCircular=false`;
        const encodedThumbUrl = encodeURIComponent(thumbUrl);
        
        const thumbResponse = await fetch(`${proxyUrl}${encodedThumbUrl}`);
        const thumbData = await thumbResponse.json();
        const thumbnails = JSON.parse(thumbData.contents).data;

        // Success!
        if(subtitle) subtitle.innerText = "Look at all those numbers go!";
        
        renderGames(games, thumbnails);
        updateTotalStats(games);

    } catch (error) {
        console.error("Error:", error);
        if(subtitle) subtitle.innerText = "Error loading. Check Console (F12).";
    }
}

function renderGames(games, thumbnails) {
    const grid = document.getElementById('game-grid');
    grid.innerHTML = ''; 

    // SORTING: This sorts by Current Players (Highest at the top)
    games.sort((a, b) => b.playing - a.playing);

    games.forEach(game => {
        // MATCHING: The Thumbnail API structure is different from Icon API
        // We look for the object where universeId matches our game.id
        const thumbData = thumbnails.find(t => t.universeId === game.id);
        
        // If found, grab the first image in the 'thumbnails' array, otherwise placeholder
        let thumbUrl = 'https://via.placeholder.com/768x432';
        if (thumbData && thumbData.thumbnails && thumbData.thumbnails.length > 0) {
            thumbUrl = thumbData.thumbnails[0].imageUrl;
        }

        const card = document.createElement('div');
        card.className = 'game-card';
        
        // Added style="width: 100%" to ensure the image stretches to fill the bigger box
        card.innerHTML = `
            <div class="image-container">
                <img src="${thumbUrl}" alt="${game.name}" class="game-thumb" style="width: 100%; display: block;">
            </div>
            <div class="game-info">
                <div class="game-title" title="${game.name}" style="font-size: 1.2rem; margin-bottom: 10px;">${game.name}</div>
                
                <div class="stat-row">
                    <span>🟢 Playing</span>
                    <span class="stat-value" style="font-weight: bold; color: #00b06f;">${game.playing.toLocaleString()}</span>
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

    const pLabel = document.getElementById('total-players');
    const vLabel = document.getElementById('total-visits');
    
    if(pLabel) pLabel.innerText = totalPlayers.toLocaleString();
    if(vLabel) vLabel.innerText = totalVisits.toLocaleString();
}

fetchGameStats();
