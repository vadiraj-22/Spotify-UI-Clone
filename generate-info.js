const fs = require("fs");
const path = require("path");

const songsDir = path.join(__dirname, "songs");

function parseFilename(file) {
    const base = file.replace(".mp3", "");
    const [name, artist] = base.split(" - ");
    return {
        file,
        name: name?.trim() || "Unknown",
        author: artist?.trim() || "Unknown"
    };
}

function generateInfoJson(folderPath, folderName) {
    const files = fs.readdirSync(folderPath).filter(f => f.endsWith(".mp3"));
    const songs = files.map(parseFilename);

    const infoFile = path.join(folderPath, "info.json");
    let existing = {};

    // Preserve title and description if info.json exists
    if (fs.existsSync(infoFile)) {
        try {
            existing = JSON.parse(fs.readFileSync(infoFile, "utf-8"));
        } catch {
            console.warn(`⚠️ Error reading existing info.json in ${folderName}`);
        }
    }

    const info = {
        title: existing.title || folderName,
        description: existing.description || `Playlist: ${folderName}`,
        songs
    };

    fs.writeFileSync(infoFile, JSON.stringify(info, null, 2));
    console.log(`✅ Updated info.json for ${folderName}`);
}

function main() {
    const folders = fs.readdirSync(songsDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    folders.forEach(folder => {
        const folderPath = path.join(songsDir, folder);
        generateInfoJson(folderPath, folder);
    });

    console.log("🎉 All info.json files updated.");
}

main();
