console.log("working");
let songs;
let currentsong = new Audio();
let currfolder;

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
    let res = await fetch(`/${folder}/info.json`);
    let data = await res.json();
    songs = data.songs.map(s => s.file);

    let songUL = document.querySelector(".songlist ul");
    songUL.innerHTML = "";

    for (const song of data.songs) {
        songUL.innerHTML += `<li onclick="playMusic('${encodeURIComponent(song.file)}')">
            <img src="/${folder}/cover.jpeg" alt="">
            <div class="info">
                <div class="songname">${song.name}</div>
                <div>${song.author}</div>
            </div>
            <div class="playnow">
                <img class="invert" src="./svgs/play.svg" alt="">
            </div>
        </li>`;
    }
    return songs;
}

// Play a song
const playMusic = (track, pause = false) => {
    let songPath = `/${currfolder}/${track}`;
    currentsong.src = songPath;

    if (!pause) {
        currentsong.play();
        play.src = "./svgs/pause.svg";
    }

    document.querySelector(".playbar .songinfo").innerHTML = decodeURI(track.replace(".mp3", ""));
    document.querySelector(".playbar .songtime").innerHTML = "00:00 / 00:00";
    console.log("Playing:", songPath);
}

// Display available albums (manually listed)
async function displayAlbums() {
    const folders = ["songs/ncs",
        "songs/cs",
        "songs/Phonk and Funk"]; // Add more album folders here manually
    let cardContainer = document.querySelector(".cardContainer");

    for (const folder of folders) {
        let res = await fetch(`/${folder}/info.json`);
        let data = await res.json();

        cardContainer.innerHTML += `
            <div data-folder="${folder}" class="card">
                <div class="play">
                    <img src="./svgs/circleplay.svg" alt="">
                </div>
                <img src="/${folder}/cover.jpeg" alt="card img">
                <h2>${data.title}</h2>
                <p>${data.description}</p>
            </div>`;
    }

    document.querySelectorAll(".card").forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getsongs(item.currentTarget.dataset.folder);
            playMusic(songs[0]);
        });
    });
}

async function main() {
    // Load default folder
    await getsongs("songs/ncs");
    playMusic(songs[0], true);

    // Display albums
    displayAlbums();

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
