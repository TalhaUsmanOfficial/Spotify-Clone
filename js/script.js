/*
! Created On Tue February 25 5:27 PM 2025

! @author: Talha Usman
! Status: Developer
*/

let currentSong = new Audio();
let songs;
let currFolder;
let filtered_songs = [];
async function getSongs(folder, filter = false) {
  currFolder = folder;
  if (!filter) {
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
    let response = await a.text();
    // console.log(response);
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let i = 0; i < as.length; i++) {
      const element = as[i];
      if (element.href.endsWith(".mp3")) {
        songs.push(element.href.split(`/${folder}/`)[1]);
      }
    }
    filtered_songs = songs;
  }
  let songUL = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = "";
  // ? Here I replace songs to filtered songs
  for (const song of filtered_songs) {
    songUL.innerHTML += `<li>
              <img src="img/music.svg" alt="" class="invert" />
              <div class="info">
                <div>${song.replaceAll("%20", " ").replaceAll(".mp3", "")}</div>
                <div>Talha</div>
              </div>
              <div class="playnow">
                <span>Play Now</span>
                <img src="img/play.svg" alt="" class="invert" />
              </div>
            </li>`;
  }
  // Attach event listener to each song
  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((element) => {
    element.addEventListener("click", () => {
      console.log(element.querySelector(".info>div").textContent + ".mp3");
      playMusic(element.querySelector(".info>div").textContent + ".mp3");
    });
  });
}

function playMusic(track, pause = false) {
  currentSong.src = `${currFolder}/${track}`;
  if (!pause) {
    currentSong.play();
    play.src = "img/pause.svg";
  } else {
    play.src = "img/play.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");
  return `${formattedMinutes}:${formattedSeconds}`;
}

async function displayAlbum() {
  let a = await fetch(`http://127.0.0.1:5500/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");
  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    if (e.href.includes("/songs")) {
      let folder = e.href.split("/").slice(-1)[0];
      // Get the Metadata of the folder
      if (folder === "songs") {
        continue;
      }
      let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
      let response = await a.json();
      cardContainer.innerHTML += `
                <div class="card" data-folder="${folder}">
              <div class="play">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 20V4L19 12L5 20Z"
                    stroke="#141B34"
                    stroke-width="1.5"
                    stroke-linejoin="round"
                    ,
                    fill="#000"
                  />
                </svg>
              </div>
              <img src="songs/${folder}/cover.jpg" alt="${folder}" />
              <h2>${response.title}</h2>
              <p>${response.description}</p>
              </div>
              `;
    }
  }
  // Load the playlist whenever the card is clicked
  Array.from(document.getElementsByClassName("card")).forEach((element) => {
    element.addEventListener("click", async (item) => {
      await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      // ? Now here we play the first song of the playlist from filtered_songs array
      playMusic(filtered_songs[0]);
    });
  });
}

(async function main() {
  // getting the list of all songs
  await getSongs(`songs/ncs`);
  // ? Now here we play the first song of the playlist from filtered_songs array
  playMusic(filtered_songs[0], (pause = true));

  // Display all the albums on the page
  displayAlbum();

  // Attach and event listener to play, next and previous
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "img/pause.svg";
    } else {
      currentSong.pause();
      play.src = "img/play.svg";
    }
  });

  // Listen for the time update event
  currentSong.addEventListener("timeupdate", (event) => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(
      currentSong.currentTime
    )} / ${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // Add an event listener to seekbar
  document.querySelector(".seekbar").addEventListener("click", (event) => {
    let percent = event.offsetX / event.target.getBoundingClientRect().width;
    document.querySelector(".circle").style.left = percent * 100 + "%";
    currentSong.currentTime = percent * currentSong.duration;
  });

  // Add an event listener for hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  // Add an event listener for close button of hamburger
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  // Add an event listener to previous
  previous.addEventListener("click", () => {
    // ? Here I also replaced the songs to filtered_songs
    let index = filtered_songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(filtered_songs[(index - 1) % filtered_songs.length]);
    }
  });

  // Add an event listener to next
  next.addEventListener("click", () => {
    // ? Here I also add replaced the songs to filtered_songs
    let index = filtered_songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < filtered_songs.length) {
      playMusic(filtered_songs[(index + 1) % filtered_songs.length]);
    }
  });

  // Add an event to volume
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (event) => {
      currentSong.volume = parseInt(event.target.value) / 100;
      currentSong.muted = false;
      document.querySelector(".volume img").src = "img/volume.svg";
    });

  // Add event to mute the track
  document.querySelector(".volume img").addEventListener("click", (event) => {
    if (currentSong.muted) {
      currentSong.muted = false;
      document.querySelector(".volume img").src = "img/volume.svg";
      document.querySelector(".volume input[type=range]").value = 100;
    } else {
      currentSong.muted = true;
      document.querySelector(".volume img").src = "img/mute.svg";
      document.querySelector(".volume input[type=range]").value = 0;
    }
  });

  // Pause or play the music whenever the space button is clicked
  document.addEventListener("keydown", (event) => {
    if (event.code == "Space") {
      event.preventDefault();
      if (currentSong.paused) {
        currentSong.play();
        play.src = "img/pause.svg";
      } else {
        currentSong.pause();
        play.src = "img/play.svg";
      }
    }
  });

  // Step 5 seconds above or backwards of the song when left or right arrow key is pressed
  document.addEventListener("keydown", (event) => {
    if (event.code == "ArrowRight") {
      let percent = (currentSong.currentTime + 5) / currentSong.duration;
      document.querySelector(".circle").style.left = percent * 100 + "%";
      currentSong.currentTime = percent * currentSong.duration;
    } else if (event.code == "ArrowLeft") {
      let percent = (currentSong.currentTime - 5) / currentSong.duration;
      document.querySelector(".circle").style.left = percent * 100 - "%";
      currentSong.currentTime = percent * currentSong.duration;
    }
  });

  search.addEventListener("keyup", async (event) => {
    filtered_songs = songs.filter((song) =>
      song.toLowerCase().includes(event.target.value.toLowerCase())
    );
    getSongs(currFolder, (filter = true));
  });
})();
