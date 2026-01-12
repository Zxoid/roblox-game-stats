// 1. YOUR PLACE IDs (These are the numbers you gave me)
const placeIds = [
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
        // STEP 1: Convert Place IDs to Universe IDs
        // This fixes the "0 stats" and "Wrong Game" issue
        const placeIdsString = placeIds.join('&placeIds=');
        const conversionUrl = `https://games.roblox.com/v1/games/multiget-place-details?placeIds=${placeIdsString}`;
        const encodedConversionUrl = encodeURIComponent(conversionUrl);
        
        const conversionResponse = await fetch(`${proxyUrl}${encodedConversionUrl}`);
        if (!conversionResponse.ok) throw new Error("Failed to connect to Roblox API");
        
        const conversionData = await conversionResponse.json();
        const placesDetails = JSON.parse(conversionData.contents);
        
        // Extract the REAL Universe IDs hidden behind your Place IDs
        const universeIds = placesDetails.map(place => place.universeId);
        
        if (universeIds.length === 0) {
            throw new Error("No valid games found. Check IDs.");
        }

        const idsString = universeIds.join(',');

        // STEP 2: Fetch Game Stats using the new Universe IDs
        const statsUrl = `https://games.roblox.com/v1/games?universeIds=${idsString}`;
        const encodedStatsUrl = encodeURIComponent(statsUrl);
        const statsResponse = await fetch(`${proxyUrl}${encodedStatsUrl}`);
        const statsData = await statsResponse.json();
        const games = JSON.parse(statsData.contents).data;

        // STEP 3: Fetch Thumbnails
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
        subtitle.innerText = "Error loading. Please refresh the page.";
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

    const pLabel = document.getElementById('total-players');
    const vLabel = document.getElementById('total-visits');
    
    if(pLabel) pLabel.innerText = totalPlayers.toLocaleString();
    if(vLabel) vLabel.innerText = totalVisits.toLocaleString();
}

fetchGameStats();
