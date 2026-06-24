const USER_ID = "1387525695173038212";

const statusColors = {
    online: "#23a55a",
    idle: "#f0b232",
    dnd: "#f23f43",
    offline: "#80848e"
};

async function fetchLanyard() {
    const res = await fetch(`https://api.lanyard.rest/v1/users/${USER_ID}`);
    const data = await res.json();
    return data.data;
}

function formatElapsed(start) {
    const diff = Date.now() - start;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return `${h > 0 ? h + ":" : ""}${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function renderActivity(data) {
    const activity = data.activities?.find(a => a.type === 0);
    const activityEl = document.getElementById("discord-activity");

    if (activity) {
        const appId = activity.application_id;
        const largeImage = activity.assets?.large_image;
        const imgSrc = largeImage
            ? `https://cdn.discordapp.com/app-assets/${appId}/${largeImage}.png`
            : "";

        const elapsed = activity.timestamps?.start
            ? formatElapsed(activity.timestamps.start)
            : "";

        activityEl.innerHTML = `
            <div id="discord-activity-inner">
                ${imgSrc ? `<img src="${imgSrc}" style="width:60px;height:60px;border-radius:8px;">` : ""}
                <div id="discord-activity-text">
                    <span id="discord-activity-name">${activity.name}</span>
                    <span>${activity.details || ""}</span>
                    <span>${activity.state || ""}</span>
                    ${elapsed ? `<span>🎮 ${elapsed}</span>` : ""}
                </div>
            </div>
        `;
    } else {
        activityEl.innerHTML = "";
    }
}

let timerInterval = null;
let cachedData = null;

document.getElementById("discord-btn").addEventListener("click", async () => {
    const data = await fetchLanyard();
    cachedData = data;

    const overlay = document.getElementById("discord-overlay");

    document.getElementById("discord-avatar").src =
        `https://cdn.discordapp.com/avatars/${USER_ID}/${data.discord_user.avatar}.png?size=128`;

    document.getElementById("discord-username").textContent = data.discord_user.username;
    document.getElementById("discord-bio").textContent = ":3";
    document.getElementById("discord-status-dot").style.background =
        statusColors[data.discord_status] || statusColors.offline;

    const customStatus = data.activities?.find(a => a.type === 4);
    document.getElementById("discord-custom-status").textContent = customStatus?.state || "";

    renderActivity(data);

    // start ticking elapsed time
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (cachedData) renderActivity(cachedData);
    }, 1000);

    overlay.style.display = "flex";
});

document.getElementById("discord-overlay").addEventListener("click", (e) => {
    if (e.target === document.getElementById("discord-overlay")) {
        document.getElementById("discord-overlay").style.display = "none";
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }
});