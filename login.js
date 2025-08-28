import { auth } from './firebase-config.js';
import { onAuthStateChanged, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');

    onAuthStateChanged(auth, user => {
        if (user) {
            window.location.href = 'admin.html';
        }
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = loginForm.email.value;
        const password = loginForm.password.value;
        loginError.textContent = '';

        signInWithEmailAndPassword(auth, email, password)
            .catch(error => {
                console.error("Login failed:", error);
                loginError.textContent = 'Invalid email or password.';
            });
    });
});