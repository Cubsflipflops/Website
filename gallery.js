const imageFolder = "photos/";

// Each image now has a file + a caption
const images = [
  { file: "photo1.jpg", caption: "STITCH!!!!!!!" },
  { file: "photo2.jpg", caption: "A sunny day at the park" },
  { file: "photo3.png", caption: "Evening by the seaside" },
  { file: "photo1.jpg", caption: "STITCH!!!!!!!" },
  { file: "photo2.jpg", caption: "A sunny day at the park" },
  { file: "photo3.png", caption: "Evening by the seaside" },
  { file: "photo1.jpg", caption: "STITCH!!!!!!!" },
  { file: "photo2.jpg", caption: "A sunny day at the park" },
  { file: "photo3.png", caption: "Evening by the seaside" },
  { file: "photo2.jpg", caption: "A sunny day at the park" }
];

const gallery = document.getElementById("gallery");

// Build thumbnails
images.forEach((item, index) => {
  const img = document.createElement("img");
  img.src = imageFolder + item.file;
  img.alt = item.caption;
  img.addEventListener("click", () => openLightbox(index));
  gallery.appendChild(img);
});

// Lightbox container (now includes caption area)
const lightbox = document.createElement("div");
lightbox.id = "lightbox";
lightbox.innerHTML = `
  <span class="close" onclick="closeLightbox()">&times;</span>
  <img id="lightbox-img" src="" alt="">
  <p id="lightbox-caption"></p>
  <span class="nav prev" onclick="changeSlide(-1)">&#10094;</span>
  <span class="nav next" onclick="changeSlide(1)">&#10095;</span>
`;
document.body.appendChild(lightbox);

let currentIndex = 0;

function openLightbox(index) {
  currentIndex = index;
  updateLightbox();
  lightbox.style.display = "flex";
}

function closeLightbox() {
  lightbox.style.display = "none";
}

function changeSlide(direction) {
  currentIndex += direction;
  if (currentIndex < 0) currentIndex = images.length - 1;
  if (currentIndex >= images.length) currentIndex = 0;
  updateLightbox();
}

function updateLightbox() {
  const current = images[currentIndex];
  document.getElementById("lightbox-img").src = imageFolder + current.file;
  document.getElementById("lightbox-caption").textContent = current.caption;
}

// Keyboard + click outside
document.addEventListener("keydown", (e) => {
  if (lightbox.style.display === "flex") {
    if (e.key === "ArrowRight") changeSlide(1);
    if (e.key === "ArrowLeft") changeSlide(-1);
    if (e.key === "Escape") closeLightbox();
  }
});
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) closeLightbox();
});
