// ==========================================
// IT HELPDESK - FUNCTIONAL FRONTEND SCRIPT
// Storage Layer: LocalStorage (Multi-User & Admin Support)
// ==========================================

const USERS_KEY = "helpdeskUsers";
const CURRENT_USER_KEY = "helpdeskCurrentUser";
const LOGIN_KEY = "loggedIn";
const ADMIN_LOGIN_KEY = "isAdminLoggedIn";
const TICKETS_KEY = "tickets";

// Seed Data for Default Tickets
const DEMO_TICKETS = [
    {
        id: "TKT-001049",
        title: "Complete Workstation Crash – System Powering On But Failing POST",
        category: "Hardware",
        priority: "High",
        description: "I was working on the end-of-month financial reconciliation when my computer froze instantly, went to a blue error screen, and shut down. System restarts continuously.",
        status: "In Progress",
        tech: "David M.",
        createdBy: "mercy.wanjiku@company.com",
        createdByName: "Mercy Wanjiku",
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        updatedAt: new Date().toISOString()
    }
];

// Seed Data for Default Users
const DEMO_USERS = [
    {
        name: "Mercy Wanjiku",
        email: "mercy.wanjiku@company.com",
        password: "password123",
        role: "employee",
        createdAt: new Date().toISOString()
    }
];

// ------------------------------------------
// DYNAMIC PATH HELPER
// ------------------------------------------

function resolvePath(targetPath) {
    const isSubfolder = window.location.pathname.includes("/employee/") || window.location.pathname.includes("/admin/");
    
    if (targetPath.startsWith("employee/") || targetPath.startsWith("admin/")) {
        const currentFolder = window.location.pathname.includes("/employee/") ? "employee/" : 
                             window.location.pathname.includes("/admin/") ? "admin/" : "";
        
        if (currentFolder && targetPath.startsWith(currentFolder)) {
            return targetPath.replace(currentFolder, "");
        }
        if (isSubfolder) {
            return "../" + targetPath;
        }
    }
    
    if (isSubfolder) {
        return "../" + targetPath;
    }
    
    return targetPath;
}

// ------------------------------------------
// AUTHENTICATION & STORAGE HELPERS
// ------------------------------------------

function getUsers() {
    try {
        const stored = localStorage.getItem(USERS_KEY);
        if (!stored) {
            localStorage.setItem(USERS_KEY, JSON.stringify(DEMO_USERS));
            return DEMO_USERS;
        }
        return JSON.parse(stored) || [];
    } catch {
        return [];
    }
}

function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
    } catch {
        return null;
    }
}

function setCurrentUser(user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

function getTickets() {
    try {
        const stored = localStorage.getItem(TICKETS_KEY);
        if (!stored) {
            saveTickets(DEMO_TICKETS);
            return DEMO_TICKETS;
        }
        return JSON.parse(stored) || [];
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
    return localStorage.getItem(LOGIN_KEY) === "true" && !!getCurrentUser();
}

function isAdminLoggedIn() {
    return localStorage.getItem(ADMIN_LOGIN_KEY) === "true";
}

function protectEmployeePage() {
    if (!isLoggedIn()) {
        window.location.href = resolvePath("login.html");
        return false;
    }
    return true;
}

function protectAdminPage() {
    if (!isAdminLoggedIn()) {
        window.location.href = resolvePath("admin-login.html");
        return false;
    }
    return true;
}

function logout() {
    localStorage.removeItem(LOGIN_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
    window.location.href = resolvePath("index.html");
}

function adminLogout() {
    localStorage.removeItem(ADMIN_LOGIN_KEY);
    localStorage.removeItem("activeAdminEmail");
    localStorage.removeItem("adminRole");
    window.location.href = resolvePath("admin-login.html");
}

// Attach logout handlers to global scope for HTML onclick events
window.logout = logout;
window.adminLogout = adminLogout;

// ------------------------------------------
// REGISTRATION HANDLER (MULTI-USER SUPPORT)
// ------------------------------------------

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

        const users = getUsers();
        const existing = users.find(u => u.email === email);

        if (existing) {
            showMessage("registerMessage", "An account with this email already exists. Please sign in.");
            return;
        }

        const newUser = {
            name,
            email,
            password,
            role: "employee",
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        saveUsers(users);

        showMessage(
            "registerMessage",
            "Account created successfully. Redirecting to login...",
            "success"
        );

        setTimeout(() => {
            window.location.href = resolvePath("login.html");
        }, 800);
    });
}

// ------------------------------------------
// EMPLOYEE LOGIN HANDLER
// ------------------------------------------

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const email = document.getElementById("email").value.trim().toLowerCase();
        const password = document.getElementById("password").value;

        const users = getUsers();
        const user = users.find(u => u.email === email && u.password === password);

        if (!user) {
            showMessage(
                "loginMessage",
                "Incorrect email or password. Please try again or create an account."
            );
            return;
        }

        setCurrentUser(user);
        localStorage.setItem(LOGIN_KEY, "true");

        showMessage(
            "loginMessage",
            "Login successful. Opening your dashboard...",
            "success"
        );

        setTimeout(() => {
            window.location.href = resolvePath("employee/dashboard.html");
        }, 500);
    });
}

// ------------------------------------------
// ADMIN LOGIN HANDLER
// ------------------------------------------

const adminLoginForm = document.getElementById("adminLoginForm");

if (adminLoginForm) {
    adminLoginForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const email = document.getElementById("adminEmail").value.trim().toLowerCase();
        const password = document.getElementById("adminPassword").value;

        // Default Admin Authentication Check
        if (email === "admin@company.com" && password === "admin123") {
            localStorage.setItem(ADMIN_LOGIN_KEY, "true");
            localStorage.setItem("activeAdminEmail", email);
            localStorage.setItem("adminRole", "IT Admin");

            showMessage(
                "adminLoginMessage",
                "Admin authentication successful. Opening Admin Portal...",
                "success"
            );

            setTimeout(() => {
                // Navigates to admin-dashboard.html (or admin/dashboard.html if subfolder structured)
                const targetAdminDash = document.referrer.includes("/admin/") ? "dashboard.html" : "admin-dashboard.html";
                window.location.href = resolvePath(targetAdminDash);
            }, 600);
        } else {
            showMessage(
                "adminLoginMessage",
                "Invalid admin credentials. Use admin@company.com / admin123"
            );
        }
    });
}

// ------------------------------------------
// TICKET CREATION HANDLER
// ------------------------------------------

const ticketForm = document.getElementById("ticketForm");

if (ticketForm) {
    if (protectEmployeePage()) {
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

            const user = getCurrentUser();
            if (!user) {
                window.location.href = resolvePath("login.html");
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
                tech: "Unassigned",
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
                `Ticket ${ticket.id} submitted successfully. Redirecting to My Tickets...`,
                "success"
            );

            ticketForm.reset();

            setTimeout(() => {
                window.location.href = resolvePath("employee/tickets.html");
            }, 700);
        });
    }
}

// ------------------------------------------
// EMPLOYEE DASHBOARD
// ------------------------------------------

function loadDashboard() {
    const recentTickets = document.getElementById("recentTickets");
    if (!recentTickets) return;

    if (!protectEmployeePage()) return;

    const user = getCurrentUser();
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
                <a href="${resolvePath('employee/create-ticket.html')}" class="primary-btn">Report a Problem</a>
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

// ------------------------------------------
// MY TICKETS (EMPLOYEE)
// ------------------------------------------

function loadTickets() {
    const allTickets = document.getElementById("allTickets");
    if (!allTickets) return;

    if (!protectEmployeePage()) return;

    const user = getCurrentUser();
    const tickets = getTickets();

    const userTickets = tickets
        .filter(ticket => ticket.createdBy === user.email)
        .reverse();

    if (userTickets.length === 0) {
        allTickets.innerHTML = `
            <div class="empty-state">
                <h3>No tickets found</h3>
                <p>You have not reported any IT problems yet.</p>
                <a href="${resolvePath('employee/create-ticket.html')}" class="primary-btn">Report a Problem</a>
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

// ------------------------------------------
// ADMIN DASHBOARD & MANAGEMENT
// ------------------------------------------

function loadAdminTickets() {
    const tableBody = document.getElementById('ticketTableBody');
    if (!tableBody) return;

    if (!protectAdminPage()) return;

    const tickets = getTickets();
    tableBody.innerHTML = ''; 

    if (tickets.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 20px;">No tickets submitted yet.</td></tr>`;
        return;
    }

    tickets.slice().reverse().forEach((ticket, reverseIndex) => {
        const realIndex = tickets.length - 1 - reverseIndex;
        const currentTech = ticket.tech || 'Unassigned';

        tableBody.innerHTML += `
            <tr class="ticket-row" data-status="${escapeHtml(ticket.status.toLowerCase().replace(' ', '-'))}">
                <td><strong>${escapeHtml(ticket.id)}</strong></td>
                <td>${escapeHtml(ticket.createdByName || ticket.createdBy || 'Unknown')}</td>
                <td>${escapeHtml(ticket.category || 'General')}</td>
                <td>${escapeHtml(ticket.title || ticket.description || 'N/A')}</td>
                <td><span class="priority-badge ${escapeHtml((ticket.priority || 'medium').toLowerCase())}">${escapeHtml(ticket.priority || 'Medium')}</span></td>
                <td>
                    <select class="tech-select" onchange="window.updateTech(${realIndex}, this.value)">
                        <option value="Unassigned" ${currentTech === 'Unassigned' ? 'selected' : ''}>Unassigned</option>
                        <option value="David M." ${currentTech === 'David M.' ? 'selected' : ''}>David M.</option>
                        <option value="Sarah K." ${currentTech === 'Sarah K.' ? 'selected' : ''}>Sarah K.</option>
                    </select>
                </td>
                <td>
                    <select onchange="window.updateStatus(${realIndex}, this.value)">
                        <option value="New" ${ticket.status === 'New' ? 'selected' : ''}>New</option>
                        <option value="In Progress" ${ticket.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                        <option value="Resolved" ${ticket.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
                    </select>
                </td>
                <td><button class="btn-action" onclick="alert('Ticket ${escapeHtml(ticket.id)} updated successfully!')">Save</button></td>
            </tr>
        `;
    });

    updateAdminStats(tickets);
}

function updateTech(index, newTech) {
    const tickets = getTickets();
    if (tickets[index]) {
        tickets[index].tech = newTech;
        tickets[index].updatedAt = new Date().toISOString();
        saveTickets(tickets);
        updateAdminStats(tickets);
    }
}

function updateStatus(index, newStatus) {
    const tickets = getTickets();
    if (tickets[index]) {
        tickets[index].status = newStatus;
        tickets[index].updatedAt = new Date().toISOString();
        saveTickets(tickets);
        updateAdminStats(tickets);
    }
}

function updateAdminStats(tickets) {
    const totalEl = document.querySelector('.stat-card:nth-child(1) .stat-number');
    const pendingEl = document.querySelector('.stat-card.border-yellow .stat-number');
    const progressEl = document.querySelector('.stat-card.border-blue .stat-number');
    const resolvedEl = document.querySelector('.stat-card.border-green .stat-number');

    if (totalEl) totalEl.textContent = tickets.length;
    if (pendingEl) pendingEl.textContent = tickets.filter(t => t.status === 'New').length;
    if (progressEl) progressEl.textContent = tickets.filter(t => t.status === 'In Progress').length;
    if (resolvedEl) resolvedEl.textContent = tickets.filter(t => t.status === 'Resolved').length;
}

// Attach dynamic table listeners to window scope
window.updateTech = updateTech;
window.updateStatus = updateStatus;

// ------------------------------------------
// HELPERS & INITIALIZATION
// ------------------------------------------

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
    loadAdminTickets();
});