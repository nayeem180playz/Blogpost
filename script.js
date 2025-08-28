import { db } from './firebase-config.js';
import { collection, query, orderBy, onSnapshot, limit, startAfter } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    const postsGrid = document.getElementById('postsGrid');
    const menuButton = document.querySelector('.menu-button');
    const categoryMenu = document.querySelector('.category-menu');
    const searchInput = document.getElementById('searchInput');
    const loadMoreBtn = document.getElementById('loadMoreBtn');

    let allPosts = [];
    let lastVisible = null;
    const POSTS_PER_PAGE = 5;

    menuButton.addEventListener('click', () => {
        categoryMenu.classList.toggle('active');
    });

    const renderPosts = (docs) => {
        if (docs.length === 0 && allPosts.length === 0) {
            postsGrid.innerHTML = '<p>No posts found.</p>';
        }

        docs.forEach(doc => {
            const post = { id: doc.id, ...doc.data() };
            allPosts.push(post);
            const bannerImageHTML = post.bannerImage ? `<img src="${post.bannerImage}" alt="${post.title}" class="post-banner-img">` : '';
            const postCard = `
                <article class="post-card">
                    ${bannerImageHTML}
                    <div class="author-info">
                        <img src="${post.authorImage || 'https://i.imgur.com/user/nayeemplays/avatar/large.png?2'}" alt="${post.authorName}">
                        <span>${post.authorName || 'undefined'}</span>
                    </div>
                    <h3>${post.title}</h3>
                    <p>${post.summary || 'No summary available.'}</p>
                    <div class="post-actions">
                        <a href="post.html?id=${post.id}" class="read-more-btn">Read More →</a>
                        <button class="copy-link-btn" data-id="${post.id}">Copy Link</button>
                    </div>
                </article>
            `;
            postsGrid.innerHTML += postCard;
        });
    };

    const loadPosts = () => {
        let q;
        if (lastVisible) {
            q = query(collection(db, "posts"), orderBy("createdAt", "desc"), startAfter(lastVisible), limit(POSTS_PER_PAGE));
        } else {
            q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(POSTS_PER_PAGE));
        }

        onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                lastVisible = snapshot.docs[snapshot.docs.length - 1];
                renderPosts(snapshot.docs);
                loadMoreBtn.style.display = 'inline-block';
            }
            if (snapshot.docs.length < POSTS_PER_PAGE) {
                loadMoreBtn.style.display = 'none';
            }
        }, error => console.error("Error fetching posts: ", error));
    };

    loadMoreBtn.addEventListener('click', loadPosts);
    loadPosts();

    onSnapshot(collection(db, "categories"), (snapshot) => {
        categoryMenu.innerHTML = '';
        if (snapshot.empty) {
            categoryMenu.innerHTML = '<p>No categories.</p>';
        } else {
            snapshot.forEach(doc => {
                const category = doc.data();
                categoryMenu.innerHTML += `<a href="#">${category.name}</a>`;
            });
        }
    });

    postsGrid.addEventListener('click', (e) => {
        if (e.target && e.target.classList.contains('copy-link-btn')) {
            const postId = e.target.dataset.id;
            const url = `${window.location.origin}/post.html?id=${postId}`;
            
            navigator.clipboard.writeText(url).then(() => {
                e.target.textContent = 'Copied!';
                e.target.classList.add('copied');
                setTimeout(() => {
                    e.target.textContent = 'Copy Link';
                    e.target.classList.remove('copied');
                }, 2000);
            });
        }
    });

    // Search is simplified to filter what's already loaded for performance.
    searchInput.addEventListener('input', (e) => {
         const searchTerm = e.target.value.toLowerCase();
         document.querySelectorAll('.post-card').forEach(card => {
             const title = card.querySelector('h3').textContent.toLowerCase();
             if (title.includes(searchTerm)) {
                 card.style.display = 'block';
             } else {
                 card.style.display = 'none';
             }
         });
    });
});