import { db } from './firebase-config.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async () => {
    const postContainer = document.getElementById('single-post-container');
    const params = new URLSearchParams(window.location.search);
    const postId = params.get('id');

    if (!postId) {
        postContainer.innerHTML = '<h1>Post not found!</h1><p>No post ID was provided.</p>';
        return;
    }

    try {
        const docRef = doc(db, "posts", postId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const post = docSnap.data();
            document.title = post.title;
            const bannerImageHTML = post.bannerImage ? `<img src="${post.bannerImage}" alt="${post.title}" class="post-banner-img">` : '';

            postContainer.innerHTML = `
                ${bannerImageHTML}
                <h1>${post.title}</h1>
                <div class="author-info">
                    <div>
                        <img src="${post.authorImage || 'https://i.imgur.com/user/nayeemplays/avatar/large.png?2'}" alt="${post.authorName}">
                        <span>By ${post.authorName || 'Unknown'}</span>
                    </div>
                    <button id="copyBtn" class="copy-link-btn">Copy Link</button>
                </div>
                <div class="post-content">
                    ${post.content.replace(/\n/g, '<br>')}
                </div>
            `;

            const copyBtn = document.getElementById('copyBtn');
            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(window.location.href).then(() => {
                    copyBtn.textContent = 'Copied!';
                    copyBtn.classList.add('copied');
                    setTimeout(() => {
                        copyBtn.textContent = 'Copy Link';
                        copyBtn.classList.remove('copied');
                    }, 2000);
                });
            });

        } else {
            postContainer.innerHTML = '<h1>404</h1><p>This post does not exist.</p>';
        }
    } catch (error) {
        console.error("Error fetching post:", error);
        postContainer.innerHTML = '<h1>Error</h1><p>Could not load the post.</p>';
    }
});