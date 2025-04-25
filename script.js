console.log("Spotify clone running");
let songs;
let currentsong = new Audio();
let currfolder;

// Base path for GitHub Pages (adjust 'spotify-clone' to your repository name)
const basePath = window.location.hostname.includes('github.io') ? '/spotify-clone' : '';

// Convert seconds to MM:SS format
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

// Load songs from info.json in the given folder
async function getsongs(folder) {
    currfolder = folder;
    try {
        let res = await fetch(`${basePath}/${folder}/info.json`);
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        let data = await res.json();
        songs = data.songs.map(s => s.file);

        let songUL = document.querySelector(".songlist ul");
        songUL.innerHTML = "";

        for (const song of data.songs) {
            songUL.innerHTML += `<li onclick="playMusic('${encodeURIComponent(song.file)}')">
                <img src="${basePath}/${folder}/cover.jpeg" alt="cover">
                <div class="info">
                    <div class="songname">${song.name}</div>
                    <div>${song.author}</div>
                </div>
                <div class="playnow">
                    <img class="invert" src="./svgs/play.svg" alt="play">
                </div>
            </li>`;
        }
        return songs;
    } catch (error) {
        console.error(`Error fetching info.json for ${folder}:`, error);
        return [];
    }
}

// Play a song
const playMusic = (track, pause = false) => {
    let songPath = `${basePath}/${currfolder}/${track}`;
    currentsong.src = songPath;

    if (!pause) {
        currentsong.play();
        play.src = "./svgs/pause.svg";
    }

    document.querySelector(".playbar .songinfo").innerHTML = decodeURI(track.replace(".mp3", ""));
    document.querySelector(".playbar .songtime").innerHTML = "00:00 / 00:00";
    console.log("Playing:", songPath);
}

// Display available albums
async function displayAlbums() {
    const folders = ["songs/ncs", "songs/cs", "songs/Phonk and Funk"];
    let cardContainer = document.querySelector(".cardContainer");

    for (const folder of folders) {
        try {
            let res = await fetch(`${basePath}/${folder}/info.json`);
            if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
            let data = await res.json();

            cardContainer.innerHTML += `
                <div data-folder="${folder}" class="card">
                    <div class="play">
                        <img src="./svgs/circleplay.svg" alt="play">
                    </div>
                    <img src="${basePath}/${folder}/cover.jpeg" alt="card img">
                    <h2>${data.title}</h2>
                    <p>${data.description}</p>
                </div>`;
        } catch (error) {
            console.error(`Error fetching info.json for ${folder}:`, error);
        }
    }

    document.querySelectorAll(".card").forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getsongs(item.currentTarget.dataset.folder);
            if (songs.length > 0) {
                playMusic(songs[0]);
            } else {
                console.warn(`No songs loaded for ${item.currentTarget.dataset.folder}`);
            }
        });
    });
}

async function main() {
    // Load default folder
    songs = await getsongs("songs/ncs");
    if (songs.length > 0) {
        playMusic(songs[0], true);
    }

    // Display albums
    await displayAlbums();

    // Play/Pause toggle
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            play.src = "./svgs/pause.svg";
        } else {
            currentsong.pause();
            play.src = "./svgs/play.svg";
        }
    });

    // Time updates
    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML =
            `${secondsToMinutesSeconds(currentsong.currentTime)} / ${secondsToMinutesSeconds(currentsong.duration)}`;
        document.querySelector(".circle").style.left =
            (currentsong.currentTime / currentsong.duration) * 100 + "%";
    });

    // Seek bar click
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = (currentsong.duration * percent) / 100;
    });

    // Mobile hamburger toggle
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    // Previous song
    previous.addEventListener("click", () => {
        currentsong.pause();
        let index = songs.indexOf(decodeURIComponent(currentsong.src.split("/").pop()));
        if (index > 0) {
            playMusic(songs[index - 1]);
        }
    });

    // Next song
    next.addEventListener("click", () => {
        currentsong.pause();
        let index = songs.indexOf(decodeURIComponent(currentsong.src.split("/").pop()));
        if (index + 1 < songs.length) {
            playMusic(songs[index + 1]);
        }
    });

    // Volume control
    document.querySelector(".range input").addEventListener("change", (e) => {
        currentsong.volume = parseInt(e.target.value) / 100;
        if (currentsong.volume > 0) {
            document.querySelector(".volume > img").src = "./svgs/volume.svg";
        }
    });

    // Mute/Unmute
    document.querySelector(".volume > img").addEventListener("click", (e) => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = "./svgs/mute.svg";
            currentsong.volume = 0;
            document.querySelector(".range input").value = 0;
        } else {
            e.target.src = "./svgs/volume.svg";
            currentsong.volume = 0.2;
            document.querySelector(".range input").value = 20;
        }
    });
}

main();
