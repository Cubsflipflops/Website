const API_KEY = "AIzaSyDlLhxAuRMWLer0xXTcDsW79VXiOxpAlgk"; 
const CHANNEL_ID = "UCpOIftCTpc8qwDwVZ1vjm9A"; 

async function loadVideos() {
  try {
    const playlistRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${CHANNEL_ID}&key=${API_KEY}`
    );
    const playlistData = await playlistRes.json();
    const uploadsPlaylistId =
      playlistData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
    if (!uploadsPlaylistId) throw new Error("Could not get uploads playlist");

    const videosRes = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId=${uploadsPlaylistId}&maxResults=20&key=${API_KEY}`
    );
    const videosData = await videosRes.json();
    const playlistVideoIds = videosData.items
      .map((item) => item.contentDetails?.videoId)
      .filter(Boolean);

    if (playlistVideoIds.length === 0) {
      console.warn("No videos found in playlist");
      return;
    }

    const detailsRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?key=${API_KEY}&id=${playlistVideoIds.join(
        ","
      )}&part=contentDetails,snippet,status`
    );
    const detailsData = await detailsRes.json();

    const detailsMap = new Map();
    for (const v of detailsData.items || []) {
      detailsMap.set(v.id, v);
    }

    const videoGrid = document.getElementById("video-grid");
    videoGrid.innerHTML = "";

    let first = true;
    let smallCount = 0;
    const maxSmallVideos = 6;

    for (const vid of playlistVideoIds) {
      const video = detailsMap.get(vid);
      if (!video) continue;

      const videoId = video.id;
      const duration = parseISO8601Duration(video.contentDetails?.duration);

      if (!video.status?.embeddable || video.status?.privacyStatus !== "public") {
        continue;
      }

      if (duration < 180) continue; // Skip Shorts

      if (first) {
        setFeaturedVideo(videoId, video.snippet.title);
        first = false;
      } else if (smallCount < maxSmallVideos) {
        addSmallVideoThumbnail(videoId, video.snippet.title, videoGrid);
        smallCount++;
      }

      if (smallCount >= maxSmallVideos) break;
    }
  } catch (err) {
    console.error("Error loading videos", err);
  }
}

function setFeaturedVideo(videoId, title) {
  const featuredDiv = document.getElementById("featured-video");
  featuredDiv.innerHTML = `
    <iframe
      src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0"
      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen
      title="${escapeHtml(title)}"
    ></iframe>
    <h3 style="margin-top: 10px; color: #1d3557; font-size: 1rem;">${escapeHtml(
      title
    )}</h3>
  `;
  featuredDiv.setAttribute("data-videoid", videoId);
  featuredDiv.setAttribute("data-title", title);
}

function addSmallVideoThumbnail(videoId, title, container) {
  const card = document.createElement("div");
  card.classList.add("video-card");
  card.setAttribute("data-videoid", videoId);
  card.setAttribute("data-title", title);

  const thumb = document.createElement("div");
  thumb.classList.add("video-thumb");
  thumb.style.backgroundImage = `url(https://i.ytimg.com/vi/${videoId}/hqdefault.jpg)`;

  const overlay = document.createElement("button");
  overlay.classList.add("play-overlay");
  overlay.setAttribute("aria-label", `Play ${title}`);
  overlay.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    swapWithFeatured(card, videoId, title);
  });

  thumb.appendChild(overlay);

  const link = document.createElement("a");
  link.href = `https://www.youtube.com/watch?v=${videoId}`;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.classList.add("video-title");
  link.textContent = title;

  card.appendChild(thumb);
  card.appendChild(link);
  container.appendChild(card);
}

function swapWithFeatured(card, smallId, smallTitle) {
  const featuredDiv = document.getElementById("featured-video");

  const currentId = featuredDiv.getAttribute("data-videoid");
  const currentTitle = featuredDiv.getAttribute("data-title");

  if (!currentId) {
    setFeaturedVideo(smallId, smallTitle);
    card.remove();
    return;
  }

  setFeaturedVideo(smallId, smallTitle);

  card.setAttribute("data-videoid", currentId);
  card.setAttribute("data-title", currentTitle);

  card.innerHTML = "";
  const thumb = document.createElement("div");
  thumb.classList.add("video-thumb");
  thumb.style.backgroundImage = `url(https://i.ytimg.com/vi/${currentId}/hqdefault.jpg)`;

  const overlay = document.createElement("button");
  overlay.classList.add("play-overlay");
  overlay.setAttribute("aria-label", `Play ${currentTitle}`);
  overlay.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    swapWithFeatured(card, currentId, currentTitle);
  });

  thumb.appendChild(overlay);

  const link = document.createElement("a");
  link.href = `https://www.youtube.com/watch?v=${currentId}`;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.classList.add("video-title");
  link.textContent = currentTitle;

  card.appendChild(thumb);
  card.appendChild(link);
}

function parseISO8601Duration(duration) {
  if (!duration) return 0;
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);
  return hours * 3600 + minutes * 60 + seconds;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

loadVideos();

// Mobile menu toggle
const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("active");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
}
