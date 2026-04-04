const SERVICE_CATEGORIES = [
  "Plumbing",
  "Solar Panel Cleaning",
  "Car Wash",
  "Babysitting",
  "Fitness Trainer",
  "Cleaning",
  "Electrician",
  "AC Repair",
  "Carpentry",
  "Painting",
  "Appliance Repair",
  "Tiffin Service",
  "Laundry"
];

const API_BASE = "/api";
const THEME_KEY = "homigoTheme";
const SERVICE_ICONS = {
  Plumbing: "PL",
  "Solar Panel Cleaning": "SP",
  "Car Wash": "CW",
  Babysitting: "BB",
  "Fitness Trainer": "FT",
  Cleaning: "CL",
  Electrician: "EL",
  "AC Repair": "AC",
  Carpentry: "CP",
  Painting: "PT",
  "Appliance Repair": "AR",
  "Tiffin Service": "TF",
  Laundry: "LD"
};

function getCurrentUser() {
  const raw = localStorage.getItem("homigoUser");
  return raw ? JSON.parse(raw) : null;
}

function getStoredTheme() {
  return localStorage.getItem(THEME_KEY);
}

function getSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getActiveTheme() {
  return getStoredTheme() || "light";
}

function applyTheme(theme) {
  document.body.classList.toggle("theme-dark", theme === "dark");
  document.body.classList.toggle("theme-light", theme === "light");
  document.documentElement.setAttribute("data-theme", theme);

  const toggle = document.getElementById("themeToggle");
  if (toggle) {
    toggle.innerHTML = theme === "dark"
      ? '<span class="theme-toggle-icon" aria-hidden="true">☀</span>'
      : '<span class="theme-toggle-icon" aria-hidden="true">☾</span>';
    toggle.setAttribute("aria-label", `Switch to ${theme === "dark" ? "light" : "dark"} mode`);
    toggle.setAttribute("title", `Switch to ${theme === "dark" ? "light" : "dark"} mode`);
  }
}

function initializeTheme() {
  applyTheme(getActiveTheme());

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  mediaQuery.addEventListener("change", () => {
    if (!getStoredTheme()) applyTheme("light");
  });
}

function toggleTheme() {
  const nextTheme = getActiveTheme() === "dark" ? "light" : "dark";
  localStorage.setItem(THEME_KEY, nextTheme);
  applyTheme(nextTheme);
}

function setCurrentUser(user) {
  localStorage.setItem("homigoUser", JSON.stringify(user));
}

function logout() {
  localStorage.removeItem("homigoUser");
  window.location.href = "/login.html";
}

function requireRole(roles) {
  const user = getCurrentUser();
  if (!user || !roles.includes(user.role)) {
    window.location.href = "/login.html";
    return null;
  }
  return user;
}

function goToRoleHome() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = "/login.html";
    return;
  }
  if (user.role === "provider") {
    window.location.href = "/provider-dashboard.html";
    return;
  }
  if (user.role === "admin") {
    window.location.href = "/admin.html";
    return;
  }
  window.location.href = "/customer-dashboard.html";
}

function showMessage(id, message, isError = false) {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = isError ? "empty-state" : "notice";
  el.textContent = message;
  el.classList.remove("hidden");
}

function hideMessage(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add("hidden");
}

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "HM";
}

function getServiceIcon(service) {
  return SERVICE_ICONS[service] || "HM";
}

function createMetaChip(label, value) {
  return `
    <div class="meta-chip">
      <strong>${label}</strong>
      <span>${value}</span>
    </div>
  `;
}

function markRevealTargets() {
  document.querySelectorAll(
    ".hero-grid > *, .section .container > *, .content-wrapper .container > *, .auth-card, .page-card, .card, .provider-card, .booking-card, .dashboard-card, .stat-card, .sidebar"
  ).forEach((element) => {
    element.setAttribute("data-reveal", "");
  });
}

function initScrollReveal() {
  const revealItems = [...document.querySelectorAll("[data-reveal]")];
  if (!revealItems.length) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    revealItems.forEach((item) => item.classList.add("revealed"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16, rootMargin: "0px 0px -40px 0px" });

  revealItems.forEach((item) => observer.observe(item));
}

function refreshReveal() {
  markRevealTargets();
  initScrollReveal();
}

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Something went wrong");
  return data;
}

function bindNavigation() {
  const userActions = document.getElementById("userActions");
  if (!userActions) return;
  const user = getCurrentUser();
  userActions.innerHTML = user
    ? `<button id="themeToggle" class="theme-toggle" type="button" onclick="toggleTheme()"></button>
       <span class="muted">Hi, ${user.name}</span>
       <button class="btn-outline" onclick="goToRoleHome()">Dashboard</button>
       <button class="btn-danger" onclick="logout()">Logout</button>`
    : `<button id="themeToggle" class="theme-toggle" type="button" onclick="toggleTheme()"></button>
       <a class="btn-outline" href="/login.html">Login</a>
       <a class="btn" href="/register.html">Register</a>`;
  applyTheme(getActiveTheme());
}

function renderCategories(containerId, clickable) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = SERVICE_CATEGORIES.map((category) => `
    <div class="card" data-reveal>
      <div class="service-card-head">
        <div class="service-card-copy">
          <div class="service-icon">${getServiceIcon(category)}</div>
          <h3>${category}</h3>
          <p>Find reliable ${category.toLowerCase()} experts near you with quick booking and trusted local support.</p>
        </div>
        <span class="service-card-tag">Verified</span>
      </div>
      <div class="service-card-foot">
        ${clickable ? `<button class="btn" onclick="goToProviders('${category}')">Explore Service</button>` : ""}
      </div>
    </div>
  `).join("");
  refreshReveal();
}

function setupRoleFields() {
  const roleField = document.getElementById("role");
  const providerFields = document.getElementById("providerFields");
  const categorySelect = document.getElementById("serviceCategory");
  if (!roleField || !providerFields || !categorySelect) return;

  categorySelect.innerHTML = `<option value="">Select category</option>${SERVICE_CATEGORIES.map((category) => `<option value="${category}">${category}</option>`).join("")}`;
  const toggle = () => providerFields.classList.toggle("hidden", roleField.value !== "provider");
  roleField.addEventListener("change", toggle);
  toggle();
}

function goToProviders(service) {
  if (!requireRole(["customer"])) return;
  localStorage.setItem("homigoSelectedService", service);
  window.location.href = "/providers.html";
}

function viewProvider(providerId) {
  localStorage.setItem("homigoSelectedProviderId", providerId);
  window.location.href = "/provider-profile.html";
}

async function handleRegister(event) {
  event.preventDefault();
  hideMessage("registerMessage");
  const form = event.target;

  try {
    const data = await apiRequest(`${API_BASE}/auth/register`, {
      method: "POST",
      body: JSON.stringify({
        name: form.name.value,
        email: form.email.value,
        phone: form.phone.value,
        password: form.password.value,
        role: form.role.value,
        city: form.city.value,
        location: form.location.value,
        serviceCategory: form.serviceCategory?.value || "",
        experience: form.experience?.value || 0,
        pricing: form.pricing?.value || 0,
        description: form.description?.value || ""
      })
    });

    setCurrentUser(data.user);
    window.location.href = data.user.role === "provider" ? "/provider-dashboard.html" : "/services.html";
  } catch (error) {
    showMessage("registerMessage", error.message, true);
  }
}

async function handleLogin(event) {
  event.preventDefault();
  hideMessage("loginMessage");
  const form = event.target;

  try {
    const data = await apiRequest(`${API_BASE}/auth/login`, {
      method: "POST",
      body: JSON.stringify({
        email: form.email.value,
        password: form.password.value
      })
    });

    setCurrentUser(data.user);
    if (data.user.role === "provider") window.location.href = "/provider-dashboard.html";
    else if (data.user.role === "admin") window.location.href = "/admin.html";
    else window.location.href = "/services.html";
  } catch (error) {
    showMessage("loginMessage", error.message, true);
  }
}

async function loadProviders() {
  const user = requireRole(["customer"]);
  const list = document.getElementById("providersList");
  if (!user || !list) return;

  const service = localStorage.getItem("homigoSelectedService") || "";
  const title = document.getElementById("providersTitle");
  if (title) title.textContent = service ? `${service} Providers in ${user.city}` : "Available Providers";

  try {
    const data = await apiRequest(`${API_BASE}/providers?service=${encodeURIComponent(service)}&city=${encodeURIComponent(user.city)}`);
    if (!data.providers.length) {
      list.innerHTML = `<div class="empty-state">No providers available in your city</div>`;
      return;
    }

    list.innerHTML = data.providers.map((provider) => `
      <div class="provider-card" data-reveal>
        <div class="provider-card-head">
          <div class="provider-card-copy">
            <div class="provider-avatar">${getInitials(provider.name)}</div>
            <div class="provider-main">
              <h3>${provider.name}</h3>
              <p>${provider.serviceCategory || service || "Home Service"} specialist in ${provider.city}</p>
            </div>
          </div>
          <span class="provider-card-tag">Top Rated</span>
        </div>
        <div class="provider-meta">
          ${createMetaChip("Rating", `${provider.rating} / 5`)}
          ${createMetaChip("Experience", `${provider.experience} years`)}
          ${createMetaChip("Price", `Rs. ${provider.pricing}`)}
          ${createMetaChip("City", provider.city)}
        </div>
        <div class="provider-card-foot">
          <div class="provider-availability">Available for quick booking</div>
          <div class="actions">
            <button class="btn" onclick="viewProvider('${provider._id}')">View Profile</button>
          </div>
        </div>
      </div>
    `).join("");
    refreshReveal();
  } catch (error) {
    list.innerHTML = `<div class="empty-state">${error.message}</div>`;
  }
}

async function loadProviderProfile() {
  const providerId = localStorage.getItem("homigoSelectedProviderId");
  const details = document.getElementById("providerDetails");
  if (!providerId || !details) return;

  try {
    const data = await apiRequest(`${API_BASE}/providers/${providerId}`);
    const provider = data.provider;
    details.innerHTML = `
      <div class="page-card" data-reveal>
        <div class="provider-card-head">
          <div class="provider-card-copy">
            <div class="provider-avatar">${getInitials(provider.name)}</div>
            <div class="provider-main">
              <h2>${provider.name}</h2>
              <p>${provider.description || "Trusted local professional ready to help with your next booking."}</p>
            </div>
          </div>
          <span class="provider-card-tag">Verified</span>
        </div>
        <div class="provider-meta" style="margin-top: 24px;">
          ${createMetaChip("Category", provider.serviceCategory)}
          ${createMetaChip("Experience", `${provider.experience} years`)}
          ${createMetaChip("Pricing", `Rs. ${provider.pricing}`)}
          ${createMetaChip("City", provider.city)}
        </div>
      </div>
    `;
    refreshReveal();

    const serviceInput = document.getElementById("bookingServiceName");
    const bookingForm = document.getElementById("bookingForm");
    if (serviceInput) serviceInput.value = provider.serviceCategory;
    if (bookingForm) bookingForm.dataset.providerId = provider._id;
  } catch (error) {
    details.innerHTML = `<div class="empty-state">${error.message}</div>`;
  }
}

async function handleBooking(event) {
  event.preventDefault();
  const user = requireRole(["customer"]);
  if (!user) return;

  hideMessage("bookingMessage");
  const form = event.target;

  try {
    await apiRequest(`${API_BASE}/bookings`, {
      method: "POST",
      body: JSON.stringify({
        customerId: user.id,
        providerId: form.dataset.providerId,
        serviceName: form.serviceName.value,
        date: form.date.value,
        time: form.time.value,
        address: form.address.value
      })
    });
    showMessage("bookingMessage", "Booking confirmed successfully");
    form.reset();
  } catch (error) {
    showMessage("bookingMessage", error.message, true);
  }
}

async function loadCustomerBookings() {
  const user = getCurrentUser();
  const list = document.getElementById("customerBookingsList");
  if (!user || !list) return;

  try {
    const data = await apiRequest(`${API_BASE}/bookings/customer/${user.id}`);
    if (!data.bookings.length) {
      list.innerHTML = `<div class="empty-state">No bookings found yet</div>`;
      return;
    }

    list.innerHTML = data.bookings.map((booking) => `
      <div class="booking-card" data-reveal>
        <h4>${booking.serviceName}</h4>
        <p><strong>Provider:</strong> ${booking.provider?.name || "N/A"}</p>
        <p><strong>Date:</strong> ${booking.date} at ${booking.time}</p>
        <p><strong>Status:</strong> <span class="badge ${booking.status}">${booking.status}</span></p>
        <p><strong>Address:</strong> ${booking.address}</p>
        <button class="btn-outline" onclick="alert('Service: ${booking.serviceName}\\nProvider: ${booking.provider?.name || ""}\\nDate: ${booking.date} ${booking.time}\\nStatus: ${booking.status}\\nAddress: ${booking.address}')">View Details</button>
      </div>
    `).join("");
    refreshReveal();
  } catch (error) {
    list.innerHTML = `<div class="empty-state">${error.message}</div>`;
  }
}

function populateCustomerSettings(user) {
  const form = document.getElementById("customerSettingsForm");
  if (!form) return;
  form.name.value = user.name || "";
  form.phone.value = user.phone || "";
  form.city.value = user.city || "";
  form.location.value = user.location || "";
}

async function updateCustomerSettings(event) {
  event.preventDefault();
  const user = requireRole(["customer"]);
  if (!user) return;
  hideMessage("customerSettingsMessage");

  try {
    const data = await apiRequest(`${API_BASE}/bookings/customer/${user.id}/profile`, {
      method: "PUT",
      body: JSON.stringify({
        name: event.target.name.value,
        phone: event.target.phone.value,
        city: event.target.city.value,
        location: event.target.location.value
      })
    });
    const updatedUser = { ...user, ...data.user, id: data.user._id || user.id };
    setCurrentUser(updatedUser);
    showMessage("customerSettingsMessage", "Profile updated successfully");
  } catch (error) {
    showMessage("customerSettingsMessage", error.message, true);
  }
}

async function changePassword(event) {
  event.preventDefault();
  const user = getCurrentUser();
  if (!user) return;
  hideMessage("passwordMessage");

  try {
    await apiRequest(`${API_BASE}/bookings/user/${user.id}/password`, {
      method: "PATCH",
      body: JSON.stringify({
        currentPassword: event.target.currentPassword.value,
        newPassword: event.target.newPassword.value
      })
    });
    showMessage("passwordMessage", "Password changed successfully");
    event.target.reset();
  } catch (error) {
    showMessage("passwordMessage", error.message, true);
  }
}

async function loadCustomerDashboard() {
  const user = requireRole(["customer"]);
  if (!user) return;
  const welcome = document.getElementById("customerWelcome");
  if (welcome) welcome.textContent = `Welcome, ${user.name}`;
  populateCustomerSettings(user);
  await loadCustomerBookings();
}

function setProviderSection(section) {
  localStorage.setItem("homigoProviderSection", section);
}

function getProviderSection() {
  return localStorage.getItem("homigoProviderSection") || "home";
}

function setupProviderSidebar() {
  document.querySelectorAll("[data-provider-section]").forEach((button) => {
    button.addEventListener("click", () => {
      setProviderSection(button.dataset.providerSection);
      renderProviderSection(button.dataset.providerSection);
    });
  });
}

async function loadProviderDashboard() {
  const user = requireRole(["provider"]);
  if (!user) return;
  setupProviderSidebar();
  await renderProviderSection(getProviderSection());
}

async function renderProviderSection(section) {
  const user = getCurrentUser();
  const root = document.getElementById("providerContent");
  if (!user || !root) return;

  // Keep the provider dashboard simple by switching one content area.
  if (section === "home" || section === "earnings" || section === "analytics") {
    const dashboardData = await apiRequest(`${API_BASE}/dashboard/provider/${user.id}`);
    renderDashboardMetrics(root, dashboardData, section);
    return;
  }

  if (section === "bookings") {
    root.innerHTML = `
      <div class="dashboard-card" data-reveal>
        <h3>Bookings</h3>
        <div class="actions">
          <button class="btn-outline" onclick="loadProviderBookings('today')">Today</button>
          <button class="btn-outline" onclick="loadProviderBookings('weekly')">Weekly</button>
          <button class="btn-outline" onclick="loadProviderBookings('monthly')">Monthly</button>
          <button class="btn-outline" onclick="loadProviderBookings('all')">All</button>
        </div>
        <div id="providerBookingsList" class="table-like" style="margin-top:18px;"></div>
      </div>
    `;
    await loadProviderBookings("all");
    return;
  }

  if (section === "profile") {
    root.innerHTML = document.getElementById("providerProfileTemplate").innerHTML;
    document.getElementById("providerProfileCard").innerHTML = `
      <div class="page-card" data-reveal>
        <div class="provider-card-head">
          <div class="provider-avatar">${getInitials(user.name)}</div>
          <div class="provider-main">
            <h2>${user.name}</h2>
            <p>${user.description || "Keep your profile polished so customers know why they should book you."}</p>
          </div>
        </div>
        <div class="provider-meta" style="margin-top: 24px;">
          ${createMetaChip("Category", user.serviceCategory)}
          ${createMetaChip("Experience", `${user.experience} years`)}
          ${createMetaChip("Pricing", `Rs. ${user.pricing}`)}
          ${createMetaChip("City", user.city)}
        </div>
      </div>
    `;
    refreshReveal();
    return;
  }

  root.innerHTML = document.getElementById("providerSettingsTemplate").innerHTML;
  const form = document.getElementById("providerSettingsForm");
  form.serviceCategory.innerHTML = SERVICE_CATEGORIES.map((category) => `<option value="${category}" ${user.serviceCategory === category ? "selected" : ""}>${category}</option>`).join("");
  form.name.value = user.name || "";
  form.phone.value = user.phone || "";
  form.city.value = user.city || "";
  form.location.value = user.location || "";
  form.experience.value = user.experience || 0;
  form.pricing.value = user.pricing || 0;
  form.description.value = user.description || "";
  form.addEventListener("submit", updateProviderSettings);
  refreshReveal();
}

function renderDashboardMetrics(root, dashboardData, section) {
  const { stats, analytics } = dashboardData;
  if (section === "home") {
    root.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card" data-reveal><h3>${stats.todayBookings}</h3><p class="muted">Total bookings today</p></div>
        <div class="stat-card" data-reveal><h3>${stats.pendingJobs}</h3><p class="muted">Pending jobs</p></div>
        <div class="stat-card" data-reveal><h3>${stats.completedJobs}</h3><p class="muted">Completed jobs</p></div>
      </div>
      <div class="dashboard-card" data-reveal>
        <h3>Today's Summary</h3>
        <p class="muted">Track your service activity at a glance.</p>
        <p>Total bookings handled so far: <strong>${stats.totalBookings}</strong></p>
      </div>
    `;
    refreshReveal();
    return;
  }

  if (section === "earnings") {
    root.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card" data-reveal><h3>Rs. ${stats.totalEarnings}</h3><p class="muted">Total earnings</p></div>
        <div class="stat-card" data-reveal><h3>Rs. ${stats.dailyEarnings}</h3><p class="muted">Daily earnings</p></div>
        <div class="stat-card" data-reveal><h3>Rs. ${stats.monthlyEarnings}</h3><p class="muted">Monthly earnings</p></div>
        <div class="stat-card" data-reveal><h3>${stats.paymentStatus}</h3><p class="muted">Payment status</p></div>
      </div>
    `;
    refreshReveal();
    return;
  }

  const total = analytics.completed + analytics.pending || 1;
  const completedPercent = Math.round((analytics.completed / total) * 100);
  const pendingPercent = Math.round((analytics.pending / total) * 100);
  const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  root.innerHTML = `
    <div class="dashboard-card" data-reveal>
      <h3>Analytics Overview</h3>
      <div class="stats-grid">
        <div class="stat-card" data-reveal><h3>${analytics.completed + analytics.pending}</h3><p class="muted">Total bookings</p></div>
        <div class="stat-card" data-reveal><h3>${analytics.completed}</h3><p class="muted">Jobs completed</p></div>
        <div class="stat-card" data-reveal><h3>${completedPercent}%</h3><p class="muted">Completion rate</p></div>
      </div>
    </div>
    <div class="dashboard-card" data-reveal>
      <h3>Completed vs Pending</h3>
      <div class="pie" style="background: conic-gradient(#16a34a 0 ${completedPercent}%, #f59e0b ${completedPercent}% 100%);"></div>
      <p>Completed: ${completedPercent}% | Pending: ${pendingPercent}%</p>
    </div>
    <div class="dashboard-card" data-reveal>
      <h3>Monthly Bookings</h3>
      <div class="chart-box">
        ${analytics.monthlyBookings.map((value, index) => `<div class="bar" style="height:${Math.max(value * 16, 12)}px"><span>${labels[index]}</span></div>`).join("")}
      </div>
    </div>
    <div class="dashboard-card" data-reveal>
      <h3>Monthly Performance</h3>
      <div class="progress"><div class="progress-fill" style="width:${completedPercent}%"></div></div>
      <p class="muted">${completedPercent}% of tracked bookings are completed.</p>
    </div>
  `;
  refreshReveal();
}

async function loadProviderBookings(filter) {
  const user = getCurrentUser();
  const list = document.getElementById("providerBookingsList");
  if (!user || !list) return;

  try {
    const data = await apiRequest(`${API_BASE}/bookings/provider/${user.id}?filter=${filter}`);
    if (!data.bookings.length) {
      list.innerHTML = `<div class="empty-state">No bookings found for this filter</div>`;
      return;
    }

    list.innerHTML = data.bookings.map((booking) => `
      <div class="booking-card" data-reveal>
        <h4>${booking.serviceName}</h4>
        <div class="booking-meta">
          ${createMetaChip("Customer", booking.customer?.name || "N/A")}
          ${createMetaChip("Address", booking.address)}
          ${createMetaChip("Service", booking.serviceName)}
          ${createMetaChip("Schedule", `${booking.date} at ${booking.time}`)}
        </div>
        <p><strong>Status:</strong> <span class="badge ${booking.status}">${booking.status}</span></p>
        <div class="actions">
          <button class="btn-success" onclick="updateBookingStatus('${booking._id}', 'Accepted')">Accept</button>
          <button class="btn-danger" onclick="updateBookingStatus('${booking._id}', 'Cancelled')">Reject</button>
          <button class="btn" onclick="updateBookingStatus('${booking._id}', 'Completed')">Mark as Completed</button>
        </div>
      </div>
    `).join("");
    refreshReveal();
  } catch (error) {
    list.innerHTML = `<div class="empty-state">${error.message}</div>`;
  }
}

async function updateBookingStatus(bookingId, status) {
  try {
    await apiRequest(`${API_BASE}/bookings/${bookingId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status })
    });
    await loadProviderBookings("all");
  } catch (error) {
    alert(error.message);
  }
}

async function updateProviderSettings(event) {
  event.preventDefault();
  const user = requireRole(["provider"]);
  if (!user) return;
  hideMessage("providerSettingsMessage");

  try {
    const data = await apiRequest(`${API_BASE}/bookings/provider/${user.id}/profile`, {
      method: "PUT",
      body: JSON.stringify({
        name: event.target.name.value,
        phone: event.target.phone.value,
        city: event.target.city.value,
        location: event.target.location.value,
        serviceCategory: event.target.serviceCategory.value,
        experience: Number(event.target.experience.value),
        pricing: Number(event.target.pricing.value),
        description: event.target.description.value
      })
    });
    const updatedUser = { ...user, ...data.user, id: data.user._id || user.id };
    setCurrentUser(updatedUser);
    showMessage("providerSettingsMessage", "Provider profile updated successfully");
  } catch (error) {
    showMessage("providerSettingsMessage", error.message, true);
  }
}

async function loadAdminPage() {
  const root = document.getElementById("adminSummary");
  if (!root) return;
  try {
    const data = await apiRequest(`${API_BASE}/dashboard/admin/summary`);
    root.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card" data-reveal><h3>${data.counts.customers}</h3><p class="muted">Customers</p></div>
        <div class="stat-card" data-reveal><h3>${data.counts.providers}</h3><p class="muted">Providers</p></div>
        <div class="stat-card" data-reveal><h3>${data.counts.bookings}</h3><p class="muted">Bookings</p></div>
      </div>
      <div class="dashboard-card" data-reveal>
        <h3>Recent Bookings</h3>
        <div class="table-like">
          ${data.recentBookings.map((booking) => `
            <div class="booking-card" data-reveal>
              <p><strong>${booking.serviceName}</strong></p>
              <p>Customer: ${booking.customer?.name || "N/A"}</p>
              <p>Provider: ${booking.provider?.name || "N/A"}</p>
              <p>Status: <span class="badge ${booking.status}">${booking.status}</span></p>
            </div>
          `).join("")}
        </div>
      </div>
    `;
    refreshReveal();
  } catch (error) {
    root.innerHTML = `<div class="empty-state">${error.message}</div>`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initializeTheme();
  bindNavigation();
  renderCategories("homeServicesList", false);
  renderCategories("servicesGrid", true);
  setupRoleFields();
  markRevealTargets();
  initScrollReveal();

  document.getElementById("registerForm")?.addEventListener("submit", handleRegister);
  document.getElementById("loginForm")?.addEventListener("submit", handleLogin);
  document.getElementById("bookingForm")?.addEventListener("submit", handleBooking);
  document.getElementById("customerSettingsForm")?.addEventListener("submit", updateCustomerSettings);
  document.getElementById("passwordForm")?.addEventListener("submit", changePassword);

  if (document.getElementById("providersList")) loadProviders();
  if (document.getElementById("providerDetails")) loadProviderProfile();
  if (document.getElementById("customerDashboard")) loadCustomerDashboard();
  if (document.getElementById("providerDashboard")) loadProviderDashboard();
  if (document.getElementById("adminSummary")) loadAdminPage();
});
