const API_KEY = "AIzaSyDlLhxAuRMWLer0xXTcDsW79VXiOxpAlgk"; // 🔑 replace with your YouTube Data API v3 key
const CHANNEL_ID = "UCpOIftCTpc8qwDwVZ1vjm9A"; // 🔗 replace with your channel ID

async function loadVideos() {
  try {
    // Get the Uploads playlist ID for the channel
    const playlistRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${CHANNEL_ID}&key=${API_KEY}`
    );
    const playlistData = await playlistRes.json();
    const uploadsPlaylistId =
      playlistData.items[0].contentDetails.relatedPlaylists.uploads;

    // Fetch the latest 20 uploads (extra in case some are skipped)
    const videosRes = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId=${uploadsPlaylistId}&maxResults=20&key=${API_KEY}`
    );
    const videosData = await videosRes.json();

    const videoIds = videosData.items
      .map(item => item.contentDetails.videoId)
      .join(",");

    // Fetch video details including snippet (title), contentDetails (duration), and status (embed/privacy)
    const detailsRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?key=${API_KEY}&id=${videoIds}&part=contentDetails,snippet,status`
    );
    const detailsData = await detailsRes.json();

    const videoGrid = document.getElementById("video-grid");
    videoGrid.innerHTML = "";

    let first = true;
    let smallCount = 0;
    const maxSmallVideos = 6;

    for (const video of detailsData.items) {
      const videoId = video.id;
      const duration = parseISO8601Duration(video.contentDetails.duration);

      // Skip unlisted/private/non-embeddable
      if (!video.status.embeddable || video.status.privacyStatus !== "public") {
        continue;
      }

      // Skip Shorts (under 3 mins)
      if (duration < 180) continue;

      if (first) {
        setFeaturedVideo(videoId, video.snippet.title);
        first = false;
      } else if (smallCount < maxSmallVideos) {
        const card = document.createElement("div");
        card.classList.add("video-card");

        const iframe = document.createElement("iframe");
        iframe.src = `https://www.youtube.com/embed/${videoId}`;
        iframe.setAttribute("data-videoid", videoId);
        iframe.allowFullscreen = true;
        iframe.addEventListener("click", () => {
          setFeaturedVideo(videoId, video.snippet.title);
        });

        const link = document.createElement("a");
        link.href = `https://www.youtube.com/watch?v=${videoId}`;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.classList.add("video-title");
        link.textContent = video.snippet.title;

        card.appendChild(iframe);
        card.appendChild(link);
        videoGrid.appendChild(card);

        smallCount++;
      }

      if (smallCount >= maxSmallVideos) break; // ✅ stop once we hit 6
    }
  } catch (err) {
    console.error("Error loading videos", err);
  }
}

function setFeaturedVideo(videoId, title) {
  const featuredDiv = document.getElementById("featured-video");
  featuredDiv.innerHTML = `
    <iframe src="https://www.youtube.com/embed/${videoId}" allowfullscreen></iframe>
    <h3 style="margin-top: 10px; color: #1d3557; font-size: 1rem;">${title}</h3>
  `;
}

// Helper: convert ISO8601 duration to seconds
function parseISO8601Duration(duration) {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  const hours = parseInt(match[1] || 0, 10);
  const minutes = parseInt(match[2] || 0, 10);
  const seconds = parseInt(match[3] || 0, 10);
  return hours * 3600 + minutes * 60 + seconds;
}

loadVideos();
