import { db, auth } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import {
    collection, query, orderBy, onSnapshot, addDoc, doc, updateDoc, deleteDoc, getDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

onAuthStateChanged(auth, user => {
    if (!user) {
        window.location.href = 'login.html';
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.getElementById('logoutButton');
    logoutButton.addEventListener('click', () => signOut(auth));

    const postsRef = collection(db, 'posts');
    const categoriesRef = collection(db, 'categories');

    const postForm = document.getElementById('postForm');
    const postsList = document.getElementById('postsList');
    const postFormTitle = document.getElementById('postFormTitle');

    postForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = postForm.postId.value;
        const postData = {
            authorName: postForm.authorName.value,
            authorImage: postForm.authorImage.value,
            bannerImage: postForm.postBanner.value,
            title: postForm.postTitle.value,
            summary: postForm.postSummary.value,
            content: postForm.postContent.value,
            tags: postForm.postTags.value.split(',').map(tag => tag.trim().toLowerCase()).filter(Boolean),
            category: postForm.postCategory.value,
        };

        try {
            if (id) {
                postData.updatedAt = serverTimestamp();
                await updateDoc(doc(db, 'posts', id), postData);
                postFormTitle.textContent = "Add New Post";
            } else {
                postData.createdAt = serverTimestamp();
                await addDoc(postsRef, postData);
            }
            postForm.reset();
        } catch (error) {
            console.error("Error saving post: ", error);
        }
    });
    
    const qPosts = query(postsRef, orderBy('createdAt', 'desc'));
    onSnapshot(qPosts, snapshot => {
        postsList.innerHTML = '';
        if (snapshot.empty) {
            postsList.innerHTML = '<p>No posts yet.</p>';
            return;
        }
        snapshot.forEach(docSnap => {
            const post = docSnap.data();
            postsList.innerHTML += `
                <div class="list-item">
                    <span>${post.title}</span>
                    <div class="item-controls">
                        <button class="edit-btn" data-id="${docSnap.id}">Edit</button>
                        <button class="delete-btn" data-id="${docSnap.id}">Delete</button>
                    </div>
                </div>
            `;
        });

        postsList.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                if(confirm("Are you sure?")) await deleteDoc(doc(db, 'posts', btn.dataset.id));
            });
        });

        postsList.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const docRef = doc(db, 'posts', btn.dataset.id);
                const docSnap = await getDoc(docRef);
                const data = docSnap.data();
                postForm.postId.value = docSnap.id;
                postForm.authorName.value = data.authorName || '';
                postForm.authorImage.value = data.authorImage || '';
                postForm.postBanner.value = data.bannerImage || '';
                postForm.postTitle.value = data.title || '';
                postForm.postSummary.value = data.summary || '';
                postForm.postContent.value = data.content || '';
                postForm.postTags.value = data.tags ? data.tags.join(', ') : '';
                postForm.postCategory.value = data.category || '';
                postFormTitle.textContent = "Edit Post";
                window.scrollTo(0, 0);
            });
        });
    }, error => console.error("Error loading posts in admin:", error));

    const categoryForm = document.getElementById('categoryForm');
    const categoriesList = document.getElementById('categoriesList');
    const postCategorySelect = document.getElementById('postCategory');

    categoryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const categoryName = categoryForm.categoryName.value;
        if (categoryName) {
            await addDoc(categoriesRef, { name: categoryName });
            categoryForm.reset();
        }
    });

    onSnapshot(collection(db, 'categories'), snapshot => {
        categoriesList.innerHTML = '';
        postCategorySelect.innerHTML = '<option value="">Select Category</option>';
        if (snapshot.empty) {
             categoriesList.innerHTML = '<p>No categories yet.</p>';
        }
        snapshot.forEach(docSnap => {
            const category = docSnap.data();
            categoriesList.innerHTML += `
                <div class="list-item">
                    <span>${category.name}</span>
                    <div class="item-controls">
                        <button class="delete-btn" data-id="${docSnap.id}">Delete</button>
                    </div>
                </div>
            `;
            postCategorySelect.innerHTML += `<option value="${category.name}">${category.name}</option>`;
        });

        categoriesList.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                if(confirm("Are you sure?")) await deleteDoc(doc(db, 'categories', btn.dataset.id));
            });
        });
    }, error => console.error("Error loading categories in admin:", error));
});