const universeIds = [
    9501022712,  
    9041696916,  
    8508052794,
    8645669017,
    9539811654,
    8662003473,
    9413725497,
    9451035756,
    8318621134,
    84632424187,
    8498191381,
    8489043260,
    8320298286
];

const proxyUrl = "https://corsproxy.io/?";

async function fetchFromRoblox(url) {
    const encodedUrl = encodeURIComponent(url);
    const response = await fetch(`${proxyUrl}${encodedUrl}`, { cache: "no-store" });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Check if the response is gzip compressed
    const contentEncoding = response.headers.get("content-encoding");
    const contentType = response.headers.get("content-type") || "";

    // Try normal .json() first
    const buffer = await response.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // Gzip magic bytes are 0x1f 0x8b
    const isGzip = bytes[0] === 0x1f && bytes[1] === 0x8b;

    let text;
    if (isGzip) {
        console.log("Response is gzip — decompressing manually...");
        const stream = new DecompressionStream("gzip");
        const writer = stream.writable.getWriter();
        writer.write(bytes);
        writer.close();
        const decompressed = await new Response(stream.readable).arrayBuffer();
        text = new TextDecoder().decode(decompressed);
    } else {
        text = new TextDecoder().decode(bytes);
    }

    return JSON.parse(text);
}

async function fetchGameStats() {
    const subtitle = document.querySelector('.subtitle');

    if (subtitle && subtitle.innerText === "Loading...") {
        subtitle.innerText = "Loading your games...";
    }

    try {
        const idsString = universeIds.join(',');
        const cacheBuster = Date.now();

        console.log(`[${new Date().toLocaleTimeString()}] Fetching fresh data...`);

        const statsUrl = `https://games.roblox.com/v1/games?universeIds=${idsString}&_t=${cacheBuster}`;
        const statsData = await fetchFromRoblox(statsUrl);
        const games = statsData.data;

        if (!games || games.length === 0) {
            throw new Error("No games found. Double check Universe IDs!");
        }

        const thumbUrl = `https://thumbnails.roblox.com/v1/games/multiget/thumbnails?universeIds=${idsString}&countPerUniverse=1&size=768x432&format=Png&isCircular=false&_t=${cacheBuster}`;
        const thumbData = await fetchFromRoblox(thumbUrl);
        const thumbnails = thumbData.data;

        if (subtitle) {
            const time = new Date().toLocaleTimeString();
            subtitle.innerText = `Updated at ${time}`;
            console.log("Success! Data updated.");
        }

        renderGames(games, thumbnails);
        updateTotalStats(games);

    } catch (error) {
        console.error("Error:", error.message);
        if (subtitle) subtitle.innerText = "Error loading. Check Console (F12).";
    }
}

function renderGames(games, thumbnails) {
    const grid = document.getElementById('game-grid');
    const scrollPos = window.scrollY;

    grid.innerHTML = '';
    games.sort((a, b) => b.playing - a.playing);

    games.forEach(game => {
        const thumbData = thumbnails ? thumbnails.find(t => t.universeId === game.id) : null;
        let thumbUrl = 'https://via.placeholder.com/768x432';

        if (thumbData && thumbData.thumbnails && thumbData.thumbnails.length > 0) {
            thumbUrl = thumbData.thumbnails[0].imageUrl;
        }

        const gameUrl = `https://www.roblox.com/games/${game.rootPlaceId}`;
        const card = document.createElement('a');
        card.href = gameUrl;
        card.target = "_blank";
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

    window.scrollTo(0, scrollPos);
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

    if (pLabel) pLabel.innerText = totalPlayers.toLocaleString();
    if (vLabel) vLabel.innerText = totalVisits.toLocaleString();
}

fetchGameStats();
setInterval(fetchGameStats, 60000);
