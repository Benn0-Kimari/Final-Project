// ==========================================
// IT HELPDESK - FUNCTIONAL FRONTEND
// Demo data is stored in localStorage.
// Firebase will replace this storage layer later.
// ==========================================

const USER_KEY = "helpdeskUser";
const LOGIN_KEY = "loggedIn";
const TICKETS_KEY = "tickets";

function getUser() {
    try {
        return JSON.parse(localStorage.getItem(USER_KEY));
    } catch {
        return null;
    }
}

function getTickets() {
    try {
        return JSON.parse(localStorage.getItem(TICKETS_KEY)) || [];
    } catch {
        return [];
    }
}

function saveTickets(tickets) {
    localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
}

function showMessage(id, message, type = "error") {
    const box = document.getElementById(id);
    if (!box) return;

    box.textContent = message;
    box.className = `form-message ${type}`;
    box.hidden = false;
}

function isLoggedIn() {
    return localStorage.getItem(LOGIN_KEY) === "true" && !!getUser();
}

function protectEmployeePage() {
    if (!isLoggedIn()) {
        window.location.href = "../login.html";
        return false;
    }
    return true;
}

function logout() {
    localStorage.removeItem(LOGIN_KEY);
    window.location.href = "../index.html";
}


// ==========================================
// REGISTER
// ==========================================

const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim().toLowerCase();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (name.length < 2) {
            showMessage("registerMessage", "Please enter your full name.");
            return;
        }

        if (password.length < 6) {
            showMessage("registerMessage", "Password must contain at least 6 characters.");
            return;
        }

        if (password !== confirmPassword) {
            showMessage("registerMessage", "Passwords do not match.");
            return;
        }

        const existing = getUser();

        if (existing && existing.email === email) {
            showMessage("registerMessage", "An account with this email already exists. Please sign in.");
            return;
        }

        const user = {
            name,
            email,
            password,
            role: "employee",
            createdAt: new Date().toISOString()
        };

        localStorage.setItem(USER_KEY, JSON.stringify(user));
        localStorage.setItem(LOGIN_KEY, "false");

        showMessage(
            "registerMessage",
            "Account created successfully. Redirecting to login...",
            "success"
        );

        setTimeout(() => {
            window.location.href = "login.html";
        }, 800);
    });
}


// ==========================================
// LOGIN
// ==========================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const email = document.getElementById("email").value.trim().toLowerCase();
        const password = document.getElementById("password").value;

        const user = getUser();

        if (!user) {
            showMessage(
                "loginMessage",
                "No account found. Please create an account first."
            );
            return;
        }

        if (email !== user.email || password !== user.password) {
            showMessage(
                "loginMessage",
                "Incorrect email or password. Please try again."
            );
            return;
        }

        localStorage.setItem(LOGIN_KEY, "true");

        showMessage(
            "loginMessage",
            "Login successful. Opening your dashboard...",
            "success"
        );

        setTimeout(() => {
            window.location.href = "employee/dashboard.html";
        }, 500);
    });
}


// ==========================================
// TICKET CREATION
// ==========================================

const ticketForm = document.getElementById("ticketForm");

if (ticketForm) {
    if (!protectEmployeePage()) {
        // Stop setting up the form when the user is not authenticated.
    } else {
        const description = document.getElementById("description");
        const counter = document.getElementById("descriptionCount");

        if (description && counter) {
            const updateCounter = () => {
                counter.textContent = `${description.value.length} / 1000`;
            };
            description.addEventListener("input", updateCounter);
            updateCounter();
        }

        ticketForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const user = getUser();
            if (!user) {
                window.location.href = "../login.html";
                return;
            }

            const title = document.getElementById("title").value.trim();
            const category = document.getElementById("category").value;
            const priority = document.getElementById("priority").value;
            const problemDescription = document.getElementById("description").value.trim();

            if (!title || !category || !priority || !problemDescription) {
                showMessage("ticketMessage", "Please complete all required fields.");
                return;
            }

            const ticket = {
                id: `TKT-${Date.now().toString().slice(-6)}`,
                title,
                category,
                priority,
                description: problemDescription,
                status: "New",
                createdBy: user.email,
                createdByName: user.name,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            const tickets = getTickets();
            tickets.push(ticket);
            saveTickets(tickets);

            showMessage(
                "ticketMessage",
                `Ticket ${ticket.id} was submitted successfully. Redirecting to My Tickets...`,
                "success"
            );

            ticketForm.reset();

            setTimeout(() => {
                window.location.href = "tickets.html";
            }, 700);
        });
    }
}


// ==========================================
// EMPLOYEE DASHBOARD
// ==========================================

function loadDashboard() {
    const recentTickets = document.getElementById("recentTickets");
    if (!recentTickets) return;

    if (!protectEmployeePage()) return;

    const user = getUser();
    const tickets = getTickets();

    const userTickets = tickets.filter(ticket => ticket.createdBy === user.email);
    const openCount = userTickets.filter(ticket => ["New", "Assigned"].includes(ticket.status)).length;
    const progressCount = userTickets.filter(ticket => ticket.status === "In Progress").length;
    const resolvedCount = userTickets.filter(ticket => ["Resolved", "Closed"].includes(ticket.status)).length;

    const userName = document.getElementById("userName");
    const totalTickets = document.getElementById("totalTickets");
    const openTickets = document.getElementById("openTickets");
    const progressTickets = document.getElementById("progressTickets");
    const resolvedTickets = document.getElementById("resolvedTickets");

    if (userName) userName.textContent = user.name;
    if (totalTickets) totalTickets.textContent = userTickets.length;
    if (openTickets) openTickets.textContent = openCount;
    if (progressTickets) progressTickets.textContent = progressCount;
    if (resolvedTickets) resolvedTickets.textContent = resolvedCount;

    if (userTickets.length === 0) {
        recentTickets.innerHTML = `
            <div class="empty-state">
                <h3>No tickets yet</h3>
                <p>Report your first IT problem and track it from this dashboard.</p>
                <a href="create-ticket.html" class="primary-btn">Report a Problem</a>
            </div>
        `;
        return;
    }

    const recent = [...userTickets].reverse().slice(0, 5);

    recentTickets.innerHTML = recent.map(ticket => `
        <div class="ticket-card">
            <div>
                <h3>${escapeHtml(ticket.title)}</h3>
                <p>${escapeHtml(ticket.category)} • ${escapeHtml(ticket.priority)}</p>
                <small>${formatDate(ticket.createdAt)} • ${escapeHtml(ticket.id)}</small>
            </div>
            <span class="status-badge">${escapeHtml(ticket.status)}</span>
        </div>
    `).join("");
}


// ==========================================
// MY TICKETS
// ==========================================

function loadTickets() {
    const allTickets = document.getElementById("allTickets");
    if (!allTickets) return;

    if (!protectEmployeePage()) return;

    const user = getUser();
    const tickets = getTickets();

    const userTickets = tickets
        .filter(ticket => ticket.createdBy === user.email)
        .reverse();

    if (userTickets.length === 0) {
        allTickets.innerHTML = `
            <div class="empty-state">
                <h3>No tickets found</h3>
                <p>You have not reported any IT problems yet.</p>
                <a href="create-ticket.html" class="primary-btn">Report a Problem</a>
            </div>
        `;
        return;
    }

    allTickets.innerHTML = userTickets.map(ticket => `
        <div class="ticket-card">
            <div>
                <h3>${escapeHtml(ticket.title)}</h3>
                <p><strong>Ticket:</strong> ${escapeHtml(ticket.id)}</p>
                <p><strong>Category:</strong> ${escapeHtml(ticket.category)}</p>
                <p><strong>Priority:</strong> ${escapeHtml(ticket.priority)}</p>
                <p>${escapeHtml(ticket.description)}</p>
                <small>Submitted: ${formatDate(ticket.createdAt)}</small>
            </div>
            <span class="status-badge">${escapeHtml(ticket.status)}</span>
        </div>
    `).join("");
}


// ==========================================
// HELPERS
// ==========================================

function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

document.addEventListener("DOMContentLoaded", () => {
    loadDashboard();
    loadTickets();
});
