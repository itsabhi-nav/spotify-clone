const clientid = "17a168151f8c4e8d864f1268e5eeef45";
const clientsecret = "a9511d5412284467a338c46efac60c94";

// Utility: Get token from Spotify
async function getToken() {
  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + btoa(clientid + ":" + clientsecret),
      },
      body: "grant_type=client_credentials",
    });
    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Error fetching token:", error);
    alert("Error fetching Spotify token. Check console for details.");
  }
}

// Tab Navigation Function
function showTab(tabName, event) {
  const tabs = document.querySelectorAll(".tab-content");
  tabs.forEach((tab) => tab.classList.remove("active"));
  document.getElementById(tabName + "Content").classList.add("active");

  // Update nav button active states
  document
    .querySelectorAll("nav button")
    .forEach((btn) => btn.classList.remove("active"));
  event.target.classList.add("active");

  // Load content if necessary
  if (tabName === "featured") {
    getFeatured();
  } else if (tabName === "favorites") {
    loadFavorites();
  }
}

// Search Functionality
async function getsongs() {
  document.getElementById("loading").style.display = "block";
  const token = await getToken();
  let query = document.getElementById("songName").value.trim();
  const searchType = document.getElementById("searchType").value;
  const language = document.getElementById("languageFilter").value;

  if (language) {
    query += " " + language;
  }

  const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(
    query
  )}&type=${searchType}&limit=50`;
  try {
    const response = await fetch(url, {
      headers: { Authorization: "Bearer " + token },
    });
    const data = await response.json();
    displayResults(data, searchType);
  } catch (error) {
    console.error("Error fetching songs:", error);
    alert("Error fetching songs. Check console for details.");
  } finally {
    document.getElementById("loading").style.display = "none";
  }
}

// Display Search or Featured Results
function displayResults(data, searchType) {
  const container =
    searchType === "track" ||
    searchType === "album" ||
    searchType === "artist" ||
    searchType === "playlist"
      ? document.getElementById("songs")
      : document.getElementById("featuredSongs");
  container.innerHTML = "";
  let items = [];

  if (searchType === "track") {
    items = data.tracks?.items || [];
  } else if (searchType === "album") {
    items = data.albums?.items || [];
  } else if (searchType === "artist") {
    items = data.artists?.items || [];
  } else if (searchType === "playlist") {
    items = data.playlists?.items || [];
  }

  if (items.length === 0) {
    container.innerHTML = "<p>No results found.</p>";
    return;
  }

  items.forEach((item) => {
    let imageUrl = "";
    let title = "";
    let subtitle = "";
    let spotifyUrl = "";
    let id = "";

    if (searchType === "track") {
      imageUrl = item.album.images[0]?.url || "";
      title = item.name;
      subtitle = item.artists.map((artist) => artist.name).join(", ");
      spotifyUrl = item.external_urls.spotify;
      id = item.id;
    } else if (searchType === "album") {
      imageUrl = item.images[0]?.url || "";
      title = item.name;
      subtitle = item.artists.map((artist) => artist.name).join(", ");
      spotifyUrl = item.external_urls.spotify;
    } else if (searchType === "artist") {
      imageUrl =
        (item.images && item.images[0]?.url) ||
        "https://via.placeholder.com/200";
      title = item.name;
      subtitle = "Followers: " + item.followers.total;
      spotifyUrl = item.external_urls.spotify;
    } else if (searchType === "playlist") {
      imageUrl = item.images[0]?.url || "";
      title = item.name;
      subtitle = "By: " + item.owner.display_name;
      spotifyUrl = item.external_urls.spotify;
    }

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${imageUrl}" alt="Cover">
      <div class="info">
        <strong>${title}</strong>
        <p>${subtitle}</p>
        ${
          spotifyUrl
            ? `<button onclick="window.open('${spotifyUrl}', '_blank')">Play on Spotify</button>`
            : ""
        }
        ${
          searchType === "track"
            ? favoriteButton(id, title, subtitle, imageUrl, spotifyUrl)
            : ""
        }
        ${
          spotifyUrl
            ? `<button onclick="shareTrack('${spotifyUrl}')">Share</button>`
            : ""
        }
      </div>
    `;
    container.appendChild(card);
  });
}

// Build Favorite Button HTML based on whether track is already in favorites
function favoriteButton(id, title, subtitle, imageUrl, spotifyUrl) {
  let favs = JSON.parse(localStorage.getItem("favorites")) || [];
  const isFav = favs.some((track) => track.id === id);
  if (isFav) {
    return `<button onclick="removeFavorite('${id}')">Remove Favorite</button>`;
  } else {
    const trackData = encodeURIComponent(
      JSON.stringify({ id, title, subtitle, imageUrl, spotifyUrl })
    );
    return `<button onclick="addFavorite('${trackData}')">Add Favorite</button>`;
  }
}

// Share functionality: copy link to clipboard
function shareTrack(url) {
  navigator.clipboard.writeText(url).then(
    () => {
      alert("Track link copied to clipboard!");
    },
    (err) => {
      console.error("Could not copy text: ", err);
    }
  );
}

// Featured: Get New Releases (Featured Albums)
async function getFeatured() {
  document.getElementById("loading").style.display = "block";
  const token = await getToken();
  const url = `https://api.spotify.com/v1/browse/new-releases?limit=20`;
  try {
    const response = await fetch(url, {
      headers: { Authorization: "Bearer " + token },
    });
    const data = await response.json();
    displayFeatured(data);
  } catch (error) {
    console.error("Error fetching featured releases:", error);
    alert("Error fetching featured releases. Check console for details.");
  } finally {
    document.getElementById("loading").style.display = "none";
  }
}

// Display Featured Albums in Featured Tab
function displayFeatured(data) {
  const container = document.getElementById("featuredSongs");
  container.innerHTML = "";
  let items = data.albums?.items || [];
  if (items.length === 0) {
    container.innerHTML = "<p>No featured releases found.</p>";
    return;
  }
  items.forEach((item) => {
    let imageUrl = item.images[0]?.url || "";
    let title = item.name;
    let subtitle = item.artists.map((artist) => artist.name).join(", ");
    let spotifyUrl = item.external_urls.spotify;
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${imageUrl}" alt="Cover">
      <div class="info">
        <strong>${title}</strong>
        <p>${subtitle}</p>
        ${
          spotifyUrl
            ? `<button onclick="window.open('${spotifyUrl}', '_blank')">Play on Spotify</button>`
            : ""
        }
        ${
          spotifyUrl
            ? `<button onclick="shareTrack('${spotifyUrl}')">Share</button>`
            : ""
        }
      </div>
    `;
    container.appendChild(card);
  });
}

// Favorites Functions (using localStorage)
function addFavorite(trackDataEncoded) {
  const trackData = JSON.parse(decodeURIComponent(trackDataEncoded));
  let favs = JSON.parse(localStorage.getItem("favorites")) || [];
  if (!favs.some((track) => track.id === trackData.id)) {
    favs.push(trackData);
    localStorage.setItem("favorites", JSON.stringify(favs));
    alert("Added to favorites!");
    loadFavorites();
  }
}
function removeFavorite(id) {
  let favs = JSON.parse(localStorage.getItem("favorites")) || [];
  favs = favs.filter((track) => track.id !== id);
  localStorage.setItem("favorites", JSON.stringify(favs));
  alert("Removed from favorites.");
  loadFavorites();
  const activeTab = document.querySelector(".tab-content.active").id;
  if (activeTab === "searchContent") {
    getsongs();
  }
}
function loadFavorites() {
  const container = document.getElementById("favoritesSongs");
  container.innerHTML = "";
  let favs = JSON.parse(localStorage.getItem("favorites")) || [];
  if (favs.length === 0) {
    container.innerHTML = "<p>No favorites added yet.</p>";
    return;
  }
  favs.forEach((track) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${track.imageUrl}" alt="Cover">
      <div class="info">
        <strong>${track.title}</strong>
        <p>${track.subtitle}</p>
        ${
          track.spotifyUrl
            ? `<button onclick="window.open('${track.spotifyUrl}', '_blank')">Play on Spotify</button>`
            : ""
        }
        ${
          track.spotifyUrl
            ? `<button onclick="shareTrack('${track.spotifyUrl}')">Share</button>`
            : ""
        }
        <button onclick="removeFavorite('${track.id}')">Remove Favorite</button>
      </div>
    `;
    container.appendChild(card);
  });
}
