// 1. PUT YOUR PLACE IDs HERE (The number in your game's URL)
// Example: roblox.com/games/123456/Game-Name -> Use 123456
const placeIds = [
    9501022712,  
    9041696916,  
    8508052794,
    8645669017,
    9539811654,
    8662003473,
    9501022712,
    9413725497,
    9451035756
    
    
    
    
    
];

const proxyUrl = "https://api.allorigins.win/get?url="; 

async function fetchGameStats() {
    try {
        // Step 1: Convert Place IDs to Universe IDs
        // We use the multiget-place-details endpoint
        const placeIdsString = placeIds.join('&placeIds=');
        const conversionApiUrl = encodeURIComponent(`https://games.roblox.com/v1/games/multiget-place-details?placeIds=${placeIdsString}`);
        
        const conversionResponse = await fetch(`${proxyUrl}${conversionApiUrl}`);
        const conversionData = await conversionResponse.json();
        const placesDetails = JSON.parse(conversionData.contents);
        
        // Extract just the Universe IDs
        const universeIds = placesDetails.map(place => place.universeId);
        
        if (universeIds.length === 0) {
            console.error("No Universe IDs found. Check your Place IDs.");
            return;
        }

        const idsString = universeIds.join(',');

        // Step 2: Fetch Game Info (Visits, Playing, Favorites)
        const statsApiUrl = encodeURIComponent(`https://games.roblox.com/v1/games?universeIds=${idsString}`);
        const statsResponse = await fetch(`${proxyUrl}${statsApiUrl}`);
        const statsData = await statsResponse.json();
        const games = JSON.parse(statsData.contents).data;

        // Step 3: Fetch Thumbnails
        const thumbApiUrl = encodeURIComponent(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${idsString}&size=512x512&format=Png&isCircular=false`);
        const thumbResponse = await fetch(`${proxyUrl}${thumbApiUrl}`);
        const thumbData = await thumbResponse.json();
        const thumbnails = JSON.parse(thumbData.contents).data;

        renderGames(games, thumbnails);
        updateTotalStats(games);

    } catch (error) {
        console.error("Error fetching stats:", error);
        document.querySelector('.subtitle').innerText = "Failed to load stats. Check console for errors.";
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
