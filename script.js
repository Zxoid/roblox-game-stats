// REPLACE THESE WITH YOUR GAME UNIVERSE IDs
// To find a Universe ID: Go to the game on Roblox -> Right Click -> Inspect -> Search for "data-universe-id"
// Or use an API to convert Place ID to Universe ID.
const universeIds = [
    138615169232956, 
    97112811024040,  
    127544103393569,
    111678490145722,
    112696600796099,
    129578714147734,
    86623606317108,
    80260150463464
];

const proxyUrl = "https://api.allorigins.win/get?url="; // Public Proxy to bypass CORS

async function fetchGameStats() {
    try {
        const idsString = universeIds.join(',');
        
        // 1. Fetch Game Info (Visits, Playing, Favorites)
        // We encode the component to safely pass it through the proxy
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
        document.querySelector('.subtitle').innerText = "Failed to load stats. Try refreshing.";
    }
}

function renderGames(games, thumbnails) {
    const grid = document.getElementById('game-grid');
    grid.innerHTML = ''; // Clear existing content

    // Sort games by playing count (Highest first)
    games.sort((a, b) => b.playing - a.playing);

    games.forEach(game => {
        // Find matching thumbnail
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

    // Animate the numbers (optional simple text update)
    document.getElementById('total-players').innerText = totalPlayers.toLocaleString();
    document.getElementById('total-visits').innerText = totalVisits.toLocaleString();
}

// Run the function when page loads
fetchGameStats();
