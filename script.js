// 1. YOUR UNIVERSE IDs (Since you said these are already Universe IDs, we use them directly)
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
    subtitle.innerText = "Loading your games...";

    try {
        // STEP 1: PREPARE THE IDS
        // We skip the conversion because you already provided Universe IDs
        const idsString = universeIds.join(',');

        // STEP 2: FETCH GAME STATS DIRECTLY
        const statsUrl = `https://games.roblox.com/v1/games?universeIds=${idsString}`;
        const encodedStatsUrl = encodeURIComponent(statsUrl);
        
        const statsResponse = await fetch(`${proxyUrl}${encodedStatsUrl}`);
        if (!statsResponse.ok) throw new Error("Failed to connect to Roblox API");

        const statsData = await statsResponse.json();
        const games = JSON.parse(statsData.contents).data;

        if (!games || games.length === 0) {
            throw new Error("No games found. Double check that these are definitely Universe IDs!");
        }

        // STEP 3: FETCH THUMBNAILS
        const thumbUrl = `https://thumbnails.roblox.com/v1/games/icons?universeIds=${idsString}&size=512x512&format=Png&isCircular=false`;
        const encodedThumbUrl = encodeURIComponent(thumbUrl);
        
        const thumbResponse = await fetch(`${proxyUrl}${encodedThumbUrl}`);
        const thumbData = await thumbResponse.json();
        const thumbnails = JSON.parse(thumbData.contents).data;

        // Success!
        subtitle.innerText = "Look at all those numbers go!";
        renderGames(games, thumbnails);
        updateTotalStats(games);

    } catch (error) {
        console.error("Error:", error);
        subtitle.innerText = "Error loading. Check Console (F12) for details.";
    }
}

function renderGames(games, thumbnails) {
    const grid = document.getElementById('game-grid');
    grid.innerHTML = ''; 

    // Sort by playing count (Highest first)
    games.sort((a, b) => b.playing - a.playing);

    games.forEach(game => {
        // Match the thumbnail to the game ID
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

    const pLabel = document.getElementById('total-players');
    const vLabel = document.getElementById('total-visits');
    
    if(pLabel) pLabel.innerText = totalPlayers.toLocaleString();
    if(vLabel) vLabel.innerText = totalVisits.toLocaleString();
}

fetchGameStats();
