// On homepage
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
        // Clone the first post and insert into homepage
        latestBlogContainer.innerHTML = `
          <h3>${firstPost.querySelector('h2').textContent}</h3>
          <p>${firstPost.querySelector('p').innerHTML}</p>
          <a href="blogs.html">Read more</a>
        `;
      }
    })
    .catch(err => console.error('Error loading latest blog:', err));
}
