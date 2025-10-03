// ------------------------------
// On homepage (latest blog preview)
// ------------------------------
const latestBlogContainer = document.getElementById('latestBlog');

if (latestBlogContainer) {
  fetch('blogs.html')
    .then(res => res.text())
    .then(html => {
      // Create a temporary DOM to parse blogs.html
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const firstPost = doc.querySelector('.blog-post');
      if (firstPost) {
        const title = firstPost.querySelector('.blog-title').textContent;
        const date = firstPost.querySelector('.blog-date').textContent;
        const content = firstPost.querySelector('.blog-content p').innerHTML;

        // Insert preview into homepage
        latestBlogContainer.innerHTML = `
          <h3>${title}</h3>
          <small>${date}</small>
          <p>${content}</p>
          <a href="blogs.html">Read more</a>
        `;
      }
    })
    .catch(err => console.error('Error loading latest blog:', err));
}

// ------------------------------
// On blogs page (popup lightbox)
// ------------------------------
const posts = document.querySelectorAll(".blog-post");
const popup = document.getElementById("blog-popup");
const closeBtn = document.getElementById("close-btn");

if (popup && closeBtn && posts.length > 0) {
  const popupTitle = document.getElementById("popup-title");
  const popupDate = document.getElementById("popup-date");
  const popupContent = document.getElementById("popup-content");

  posts.forEach(post => {
    post.addEventListener("click", () => {
      const title = post.querySelector(".blog-title").textContent;
      const date = post.querySelector(".blog-date").textContent;
      const content = post.querySelector(".blog-content").innerHTML;

      popupTitle.textContent = title;
      popupDate.textContent = date;
      popupContent.innerHTML = content; // keep HTML formatting

      popup.classList.add("active");
    });
  });

  closeBtn.addEventListener("click", () => {
    popup.classList.remove("active");
  });

  popup.addEventListener("click", (e) => {
    if (e.target === popup) {
      popup.classList.remove("active");
    }
  });
}
