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

const proxyUrl = "https://corsproxy.io/?"; 

async function fetchGameStats() {
    const subtitle = document.querySelector('.subtitle');
    if(subtitle) subtitle.innerText = "Loading your games...";

    try {
        const idsString = universeIds.join(',');

        // --- STEP 1: FETCH GAME STATS ---
        const statsUrl = `https://games.roblox.com/v1/games?universeIds=${idsString}`;
        const encodedStatsUrl = encodeURIComponent(statsUrl);
        
        const statsResponse = await fetch(`${proxyUrl}${encodedStatsUrl}`);
        if (!statsResponse.ok) throw new Error("Failed to connect to Roblox API");

        const statsData = await statsResponse.json();
        const games = statsData.data; 

        if (!games || games.length === 0) {
            throw new Error("No games found. Double check Universe IDs!");
        }

        // --- STEP 2: FETCH THUMBNAILS ---
        const thumbUrl = `https://thumbnails.roblox.com/v1/games/multiget/thumbnails?universeIds=${idsString}&countPerUniverse=1&size=768x432&format=Png&isCircular=false`;
        const encodedThumbUrl = encodeURIComponent(thumbUrl);
        
        const thumbResponse = await fetch(`${proxyUrl}${encodedThumbUrl}`);
        const thumbData = await thumbResponse.json();
        const thumbnails = thumbData.data; 

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

    // Sort by playing count (Highest first)
    games.sort((a, b) => b.playing - a.playing);

    games.forEach(game => {
        // MATCH THUMBNAIL
        const thumbData = thumbnails.find(t => t.universeId === game.id);
        let thumbUrl = 'https://via.placeholder.com/768x432';
        if (thumbData && thumbData.thumbnails && thumbData.thumbnails.length > 0) {
            thumbUrl = thumbData.thumbnails[0].imageUrl;
        }

        // --- NEW: CREATE LINK TO GAME ---
        // We use rootPlaceId for the actual game link
        const gameUrl = `https://www.roblox.com/games/${game.rootPlaceId}`;

        // Changed 'div' to 'a' so it is clickable
        const card = document.createElement('a');
        card.href = gameUrl;
        card.target = "_blank"; // Opens in a new tab
        card.className = 'game-card';
        
        card.innerHTML = `
            <div class="image-container">
                <img src="${thumbUrl}" alt="${game.name}" class="game-thumb">
            </div>
            <div class="game-info">
                <div class="game-title" title="${game.name}">${game.name}</div>
                
                <div class="stat-row">
                    <span>🟢 Playing</span>
                    <span class="stat-value" style="color: #00b06f;">${game.playing.toLocaleString()}</span>
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
