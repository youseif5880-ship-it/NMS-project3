const token = localStorage.getItem("authToken");

async function fetchWithAuth(url, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return fetch(url, { ...options, headers });
}




let currentArticle = null; // global variable


const articlesMap = new Map();

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d)) return "—";
  return d.toLocaleString(); // includes both date + time
}

// === PAGE TOGGLE ===
const page1 = document.getElementById('page1');
const page2 = document.getElementById('page2');
const addBtn = document.getElementById('addBtn');
const backBtn = document.getElementById('backBtn');
const homeBtn = document.getElementById('homeBtn'); // Assuming you have an element with id="homeBtn"
const appbackBtn = document.getElementById('appbackBtn');
const vendorbackBtn = document.getElementById('vendorbackBtn');

addBtn.addEventListener('click', () => {
  page1.style.display = 'none';
page2.style.display = 'block';
  window.scrollTo(0, 0);
});

backBtn.addEventListener('click', () => {
    showPage("page1");
  window.scrollTo(0,0);
});

appbackBtn.addEventListener('click', () => {
    showPage("page3");
  window.scrollTo(0,0);
});

vendorbackBtn.addEventListener('click', () => {
    showPage("page4");
  window.scrollTo(0,0);
});

// Home button → always go to page1
if (homeBtn) {
  homeBtn.addEventListener('click', () => {
    showPage("page1");
    window.scrollTo(0,0);
  });
}

// === FILE UPLOAD LABEL ===
function attachFileLabel(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const label = document.querySelector(`label[for="${inputId}"]`);
  input.addEventListener('change', () => {
    if (!input.files || input.files.length === 0) {
      label.innerHTML = 'Upload image ⤓';
    } else {
      label.innerHTML = input.files[0].name + ' ✓';
    }
  });
}
attachFileLabel('bannerFile');
attachFileLabel('fileUpload');
attachFileLabel('authorPhoto');




// === SEARCH FILTER ===
function setupCardSearch(pageId, searchInputId) {
  const page = document.querySelector(`#${pageId}`);
  const searchInput = document.querySelector(`#${searchInputId}`);

  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();

    // Get cards dynamically each time input changes
    const cards = page.querySelectorAll('.card');
    cards.forEach(card => {
      const cardText = card.textContent.toLowerCase();
      card.style.display = cardText.includes(query) ? "" : "none";
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupCardSearch('page1', 'searchPage1');
  setupCardSearch('page2', 'searchPage2');
  setupCardSearch('page4', 'searchPage4');
});

// === MODAL ===
const modal = document.getElementById("cardModal");
const closeBtn = document.querySelector(".close-btn");
const modalImage = document.querySelector(".article-image");
const modalTitle = document.querySelector(".modal-title");
const modalMeta = document.querySelector(".modal-meta");


// Close modal on click
closeBtn.addEventListener("click", () => modal.style.display = "none");
window.addEventListener("click", (e) => {
  if (e.target === modal) modal.style.display = "none";
});

// Close modal on ESC key


document.querySelectorAll('.menu-toggle').forEach(toggle => {
  toggle.addEventListener('click', () => {
    const navMenu = toggle.closest('.navbar').querySelector('.nav-menu');
    navMenu.classList.toggle('active');
  });
});



// Download button handler
document.getElementById("downloadCardBtn").addEventListener("click", () => {
  if (currentFiles.length === 0) {
    alert("No files attached to this article.");
    return;
  }

  currentFiles.forEach(file => {
    const link = document.createElement("a");
    link.href = file;
    link.download = file.split("/").pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
});


let currentFiles = [];



function openAppModal(app) {
  appDetailsModal.querySelector(".app-image").src = app.imageUrl;
  appDetailsModal.querySelector(".app-name").innerText = app.name;
  appDetailsModal.querySelector(".app-url").innerText = app.url;
  appDetailsModal.querySelector(".app-url").href = app.url;
  appDetailsModal.querySelector(".app-port span").innerText = app.port;
  appDetailsModal.querySelector(".app-last-update span").innerText = app.lastUpdate;
  appDetailsModal.querySelector(".app-username").innerText = app.username;
  appDetailsModal.querySelector(".app-password").innerText = app.password;
  appDetailsModal.querySelector(".app-teams").innerText = app.teams;
  appDetailsModal.querySelector(".app-vendor-name").innerText = app.vendorName;
  appDetailsModal.querySelector(".app-vendor-phone").innerText = app.vendorPhone;
  appDetailsModal.querySelector(".app-vendor-mail").innerText = app.vendorMail;
  appDetailsModal.querySelector(".db-name").innerText = app.dbName;
  appDetailsModal.querySelector(".db-ip").innerText = app.dbIP;
  appDetailsModal.querySelector(".db-size").innerText = app.dbSize;
  appDetailsModal.querySelector(".db-type").innerText = app.dbType;

  const statusEl = appDetailsModal.querySelector(".db-status");
  statusEl.innerText = app.dbStatus;
  statusEl.className = "db-status status-badge " + (app.dbStatus?.toLowerCase() || "");

  appDetailsModal.style.display = "block";
}


// add a new card:-


document.addEventListener("DOMContentLoaded", () => {
  const addForm = document.getElementById("addForm");
  if (!addForm) return;

  addForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const newArticle = {
      title: document.getElementById("addtitle").value || "NA",
      applicationName: document.getElementById("app").value || "NA",
      applicationVersion: document.getElementById("version").value || "NA",
      author: document.getElementById("author").value || "NA",
      createdAt: document.getElementById("date").value || new Date().toISOString(),
      description: document.getElementById("description").value || "NA",
      solutionsSteps: document.getElementById("solutions").value || "NA",
      vendorId: document.getElementById("vendor").value || "NA"
    };

    try {
      const response = await fetchWithAuth("http://localhost:8083/api/knowledge-base", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newArticle)
      });

      if (!response.ok) throw new Error("Failed to save article");
      alert("Card added successfully!");
      addForm.reset();

      // Refresh list
      showPage("page1");
      loadKnowledgeBase();
    } catch (err) {
      console.error("Error submitting:", err);
      alert("Error submitting form: " + err.message);
    }
  });
});


// === Handle Edit Form Save ===
const editForm = document.getElementById("editForm");
if (editForm) {
  editForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("editId").value;
    const updatedArticle = {
      title: document.getElementById("editTitle").value,
      applicationName: document.getElementById("editAppName").value,
      applicationVersion: document.getElementById("editAppVersion").value,
      author: document.getElementById("editAuthor").value,
      createdAt: document.getElementById("editDate").value,
      description: document.getElementById("editDescription").value,
      solutionsSteps: document.getElementById("editSolutions").value,
      vendorId: parseInt(document.getElementById("editVendor").value),
    };

    try {
      const res = await fetchWithAuth(`http://localhost:8083/api/knowledge-base/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("authToken")
            ? `Bearer ${localStorage.getItem("authToken")}`
            : undefined,
        },
        body: JSON.stringify(updatedArticle),
      });

      if (!res.ok) throw new Error("Failed to save changes");
      alert("Changes saved successfully!");

      // go back to Page 1 and refresh list
      showPage("page1");
      loadKnowledgeBase();
    } catch (err) {
      console.error(err);
      alert("Error saving changes. Please try again.");
    }
  });
}


// Hide all pages function
function hideAllPages() {
    document.querySelectorAll('.page').forEach(page => {
        page.style.display = 'none';
    });
}

/*function showPage(pageId) {
    hideAllPages();
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.style.display = 'block';
        window.scrollTo(0, 0);

        // Reattach page-specific events
        if (pageId === 'page1') {
            attachHomePageEvents();
        } else if (pageId === 'page3') {
            attachAppsPageEvents();
        }
    }
}
*/
function attachHomePageEvents() {
    const addBtn1 = document.getElementById('addBtn');
    if (addBtn1) {
        addBtn1.onclick = null; // remove old click
        addBtn1.addEventListener('click', () => {
            console.log("Home page add button clicked");
            // Your Page 1 Add button logic here
        });
    }
}

function attachAppsPageEvents() {
    const addBtn3 = document.getElementById('addBtnPage3');
    if (addBtn3) {
        addBtn3.onclick = null; // remove old click
        addBtn3.addEventListener('click', () => {
            console.log("Apps page add button clicked");
            // Your Page 3 Add button logic here
        });
    }
}

// Attach navigation clicks after DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
  const homeLinks = document.querySelectorAll('.home-link');
  const appsLinks = document.querySelectorAll('.apps-link');
  const vendorsLinks = document.querySelectorAll('.vendors-link');
  const databasesLinks = document.querySelectorAll('.databases-link');
  const backupsLinks = document.querySelectorAll('.backups-link');
  const serversLinks = document.querySelectorAll('.servers-link');
  const usersLink = document.getElementById("users-link");


  homeLinks.forEach(link => {
    link.addEventListener('click', e => { e.preventDefault(); showPage('page1'); loadArticles(); });
  });

  appsLinks.forEach(link => {
    link.addEventListener('click', e => { e.preventDefault(); showPage('page3'); loadapps(); });
  });

  vendorsLinks.forEach(link => {
    link.addEventListener('click', e => { e.preventDefault(); showPage('page4'); loadVendorsGrid(); });
  });

  databasesLinks.forEach(link => {
    link.addEventListener('click', e => { e.preventDefault(); showPage('page6');  loadDatabases();  });
  });

  backupsLinks.forEach(link => {
    link.addEventListener('click', e => { e.preventDefault(); showPage('page7');  loadBackups(); });
  });

  serversLinks.forEach(link => {
    link.addEventListener('click', e => { e.preventDefault(); showPage('page8');  loadServers();  });
  });

  if (usersLink) {
    usersLink.addEventListener("click", e => {
      e.preventDefault();
      console.log("Users link clicked ✅"); // debug
      showPage("pageUsers"); 
       loadUsers();
    });
  }
  


  // Initial load
  loadArticles();
  loadApps();
  loadVendorsGrid();
});


// ===== Load Knowledge Base (Page 1) =====
async function loadArticles() {
  const cardsGrid = document.getElementById("cardsGrid");
  if (!cardsGrid) return;

  cardsGrid.innerHTML = "";

  try {
    const res = await fetchWithAuth("http://localhost:8083/api/knowledge-base", {
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("authToken")
  ? `Bearer ${localStorage.getItem("authToken")}`
  : undefined,
      },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    let articles = await res.json();
    if (!Array.isArray(articles)) articles = [articles];

    articles.forEach((item, index) => {
  const appName = item.applicationName || "App";
  const title = item.title || "Untitled";
  const description = item.description || "No description provided.";
  const dateText = formatDate(item.createdAt);

  const card = document.createElement("article");
  card.className = "card";

  card.innerHTML = `
    <div class="card-image">
      <img src="images/kb-card.jpg" alt="Card Image" class="card-img">
      <span class="card-badge">${appName}</span>
    </div>
    <div class="card-body">
      <h3 class="card-title">${title}</h3>
      <p class="card-excerpt">${description}</p>
      <div class="card-meta">
        <div class="date">${dateText}</div>
      </div>
    </div>
  `;

  // ✅ store full object in memory
  articlesMap.set(index, item);
  card.dataset.index = index;

  // Click → open modal with full object
  card.addEventListener("click", () => {
    const article = articlesMap.get(parseInt(card.dataset.index));
    openArticleModal(article);
  });

  cardsGrid.appendChild(card);
});

  } catch (err) {
    console.error("Failed to load articles:", err);
    alert(`Failed to load articles: ${err.message}`);
  }
}


// ===== Modal for Articles =====
function openArticleModal(article) {
    if (!article) return;

    // Store the currently selected article globally
    currentArticle = article;

    // Get modal elements
    const modal = document.getElementById("cardModal");
    const modalImage = modal.querySelector(".article-image");
    const modalTitle = modal.querySelector(".modal-title");
    const modalMeta = modal.querySelector(".modal-meta");
    const filesContainer = modal.querySelector(".modal-files");

    // Fill modal content
    modalImage.src = "images/kb-card.jpg"; // You can adjust if you store different images
    modalTitle.textContent = article.title || "Untitled";

    modalMeta.innerHTML = `
        <p><strong>Application:</strong> ${article.applicationName ?? "N/A"}</p>
        <p><strong>Description:</strong> ${article.description ?? "N/A"}</p>
        <p><strong>Solution Steps:</strong> ${article.solutionsSteps ?? "N/A"}</p>
        <p><strong>Application Version:</strong> ${article.applicationVersion ?? "N/A"}</p>
        <p><strong>Created At:</strong> ${formatDate(article.createdAt)}</p>
        <p><strong>Updated At:</strong> ${formatDate(article.updatedAt)}</p>
    `;

    // Show attached files if any
    filesContainer.innerHTML = "";
    if (article.attachedDocs && article.attachedDocs !== "No attachedDocs") {
        filesContainer.innerHTML = `
            <h4>Attached files:</h4>
            <a href="${article.attachedDocs}" target="_blank">
                ${article.attachedDocs.split("/").pop()}
            </a>
        `;
    } else {
        filesContainer.innerHTML = `<p><em>No attached documents</em></p>`;
    }

    // Display the modal
    modal.style.display = "block";

    // Assign Edit button click inside modal
    const editBtn = document.getElementById("editCardBtn");
    if (editBtn) {
        editBtn.onclick = () => {
            modal.style.display = "none";      // Close modal
            showPage("page5");                  // Switch to Page 5
            openEditPage(currentArticle);       // Prefill edit form
        };
    }
}



// ===== Modal for Vendors =====
function openVendorModal(vendor) {
  const modal = document.querySelector('#vendorModal'); // adjust ID if needed
  modal.querySelector(".vendor-name").innerText = vendor.name;
  modal.querySelector(".vendor-portal").innerText = vendor.portalSystem || 'N/A';
  modal.querySelector(".vendor-username").innerText = vendor.username || 'N/A';
  modal.querySelector(".vendor-password").innerText = vendor.password || 'N/A';
  modal.querySelector(".vendor-contact-name").innerText = vendor.mainContactName || 'N/A';
  modal.querySelector(".vendor-contact-email").innerText = vendor.mainContactEmail || 'N/A';
  modal.querySelector(".vendor-contact-mobile").innerText = vendor.mainContactMobile || 'N/A';

  modal.style.display = "block";
}




function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');

    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.style.display = 'block';
        window.scrollTo(0, 0);

        // Re-attach page-specific events
if (pageId === 'page1') {
    const addBtn1 = document.getElementById('addBtn');
    if (addBtn1) {
        addBtn1.onclick = null; // clear previous
        addBtn1.addEventListener('click', () => {
            showPage("page2");
            window.scrollTo(0, 0);
            
            // 🔽 fetch dropdowns when Add Page is opened
            loadApplicationsDropdown();
            loadVendors(); // (if you also want vendors dropdown filled)


            document.getElementById("date").value = new Date().toISOString().split("T")[0];
        });
    }
}

        if (pageId === 'page3') {
            const addBtn3 = document.getElementById('addBtnPage3');
            if (addBtn3) {
                addBtn3.onclick = () => {
                    console.log("Apps page add button clicked");
                };
            }
        }
    }
}




// Page 3 App Details modal
const appDetailsModal = document.getElementById("appDetailsModal");
const appDetailsClose = document.querySelector(".app-details-close");

document.querySelectorAll("#page3 .list-card").forEach(card => {
  card.addEventListener("click", () => {
    appDetailsModal.querySelector(".app-image").src = card.dataset.img || "";
    appDetailsModal.querySelector(".app-name").innerText = card.dataset.name || "";
    appDetailsModal.querySelector(".app-url").innerText = card.dataset.url || "";
    appDetailsModal.querySelector(".app-url").href = card.dataset.url || "#";
    appDetailsModal.querySelector(".app-port span").innerText = card.dataset.port || "";
    appDetailsModal.querySelector(".app-last-update span").innerText = card.dataset.lastupdate || "";
    appDetailsModal.querySelector(".app-username").innerText = card.dataset.username || "";
    appDetailsModal.querySelector(".app-password").innerText = card.dataset.password || "";
    appDetailsModal.querySelector(".app-teams").innerText = card.dataset.teams || "";
    appDetailsModal.querySelector(".app-vendor-name").innerText = card.dataset.vendorname || "";
    appDetailsModal.querySelector(".app-vendor-phone").innerText = card.dataset.vendorphone || "";
    appDetailsModal.querySelector(".app-vendor-mail").innerText = card.dataset.vendormail || "";
    appDetailsModal.querySelector(".db-name").innerText = card.dataset.dbname || "";
    appDetailsModal.querySelector(".db-ip").innerText = card.dataset.dbip || "";
    appDetailsModal.querySelector(".db-size").innerText = card.dataset.dbsize || "";
    appDetailsModal.querySelector(".db-type").innerText = card.dataset.dbtype || "";

    const statusEl = appDetailsModal.querySelector(".db-status");
    statusEl.innerText = card.dataset.dbstatus || "";
    statusEl.className = "db-status status-badge " + (card.dataset.dbstatus?.toLowerCase() || "");

    appDetailsModal.style.display = "block";
  });
});

  // ===== Modal for Vendors =====
const vendorDetailsModal = document.getElementById("vendorDetailsModal");
const vendorDetailsClose = document.querySelector(".vendor-details-close");

function openVendorModal(vendor) {
  vendorDetailsModal.querySelector(".vendor-name").innerText = vendor.name || "N/A";

  // Portal Info
  vendorDetailsModal.querySelector(".vendor-portal-system").innerText = vendor.portalTicketingSystem || "N/A";
  vendorDetailsModal.querySelector(".vendor-portal-username").innerText = vendor.portalUsername || "N/A";
  vendorDetailsModal.querySelector(".vendor-portal-password").innerText = vendor.portalPassword || "N/A";

  // Main Contact
  vendorDetailsModal.querySelector(".vendor-main-name").innerText = vendor.mainContactName || "N/A";
  vendorDetailsModal.querySelector(".vendor-main-email").innerText = vendor.mainContactEmail || "N/A";
  vendorDetailsModal.querySelector(".vendor-main-mobile").innerText = vendor.mainContactMobile || "N/A";

  // Escalation Level 1
  vendorDetailsModal.querySelector(".vendor-escalation1-name").innerText = vendor.escalationLevel1ContactName || "N/A";
  vendorDetailsModal.querySelector(".vendor-escalation1-email").innerText = vendor.escalationLevel1ContactEmail || "N/A";
  vendorDetailsModal.querySelector(".vendor-escalation1-mobile").innerText = vendor.escalationLevel1ContactMobile || "N/A";

  // Escalation Level 2
  vendorDetailsModal.querySelector(".vendor-escalation2-name").innerText = vendor.escalationLevel2ContactName || "N/A";
  vendorDetailsModal.querySelector(".vendor-escalation2-email").innerText = vendor.escalationLevel2ContactEmail || "N/A";
  vendorDetailsModal.querySelector(".vendor-escalation2-mobile").innerText = vendor.escalationLevel2ContactMobile || "N/A";

  vendorDetailsModal.style.display = "block";
}

// === Add Vendor Form ===
// Open Add Vendor page
document.getElementById("addBtnVendor")?.addEventListener("click", () => {
  showPage("pageAddVendors");
});

// Vendor Add Form Submit

// ===== Load Applications (Page 3) =====
async function loadApps() {
  try {
    const res = await fetchWithAuth("http://localhost:8083/api/applications", {
      headers: { "Content-Type": "application/json" }
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const apps = await res.json();

    const appsList = document.querySelector("#page3 .cards-list");
    appsList.innerHTML = "";

    apps.forEach(app => {
      const card = document.createElement("article");
      card.className = "list-card";
      card.dataset.img = app.imageUrl || "images/app-default.png";
      card.dataset.name = app.name || "Unnamed App";
      card.dataset.url = app.url || "";
      card.dataset.port = app.port || "";
      card.dataset.lastupdate = app.lastUpdate || "";
      card.dataset.username = app.username || "";
      card.dataset.password = app.password || "";
      card.dataset.teams = app.teams || "";
      card.dataset.vendorname = app.vendorName || "";
      card.dataset.vendorphone = app.vendorPhone || "";
      card.dataset.vendormail = app.vendorMail || "";
      card.dataset.dbname = app.dbName || "";
      card.dataset.dbip = app.dbIP || "";
      card.dataset.dbsize = app.dbSize || "";
      card.dataset.dbtype = app.dbType || "";
      card.dataset.dbstatus = app.dbStatus || "";

      card.innerHTML = `
        <div class="card-image">
          <img src="${card.dataset.img}" alt="App Image" class="card-img">
        </div>
        <div class="card-body">
          <span class="card-badge">${app.name || "App"}</span>
          <h3 class="card-title">${app.name || "Unnamed App"}</h3>
          <p class="card-excerpt">${app.description || "No description"}</p>
          <div class="card-meta">
            <span class="author-name">Team: ${app.teams || "N/A"}</span>
            <span class="date">${app.lastUpdate || ""}</span>
          </div>
        </div>
      `;

      // Clicking the card → open modal
      card.addEventListener("click", () => openAppModal(app));
      appsList.appendChild(card);
    });

  } catch (err) {
    console.error("Failed to load apps:", err);
    alert("Failed to load applications: " + err.message);
  }
}


// Attach vendor card clicks inside loadVendorsGrid
async function loadVendorsGrid() {
  try {
    const token = localStorage.getItem("authToken"); // get token from localStorage
    if (!token) {
      throw new Error("No auth token found. Please login first.");
    }

    const res = await fetchWithAuth('http://localhost:8083/api/vendors', {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`  // 👈 add token here
      }
    });

    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

    const vendors = await res.json();
    const vendorsGrid = document.getElementById('vendorsGrid');
    vendorsGrid.innerHTML = '';

    vendors.forEach(vendor => {
      const card = document.createElement('article');
      card.className = 'card';

      card.innerHTML = `
        <div class="card-image">
          <img src="images/vendor-default.png" alt="Vendor Logo" class="card-img">
          <span class="card-badge">${vendor.portalTicketingSystem || 'Vendor'}</span>
        </div>
        <div class="card-body">
          <h3 class="card-title">${vendor.name}</h3>
          <p class="card-excerpt">Main contact: ${vendor.mainContactName || 'N/A'}</p>
          <div class="card-meta">
            <div class="author-info">
              <div class="author-name">${vendor.mainContactEmail || 'N/A'}</div>
              <div class="date">${vendor.mainContactMobile || ''}</div>
            </div>
            <div class="goto">›</div>
          </div>
        </div>
      `;

      // ✅ Attach click handler to open modal
      card.addEventListener("click", () => openVendorModal(vendor));

      vendorsGrid.appendChild(card);
    });

  } catch (err) {
    console.error('Error loading vendors:', err);
  }
}

// Load applications into Edit Page
async function loadAppsIntoEdit(selectedValue = null) {
  const select = document.getElementById("editAppName");
  if (!select) return;

  try {
    const res = await fetchWithAuth("http://localhost:8083/api/applications"); // adjust if needed

    if (!res.ok) throw new Error("Failed to fetch apps");
    const apps = await res.json();

    select.innerHTML = "<option value=''>Select app</option>";
    apps.forEach(app => {
      const option = document.createElement("option");
      option.value = app.name;
      option.textContent = app.name;
      if (selectedValue && app.name === selectedValue) option.selected = true;
      select.appendChild(option);
    });
  } catch (err) {
    console.error("Error loading apps:", err);
    // fallback static
    select.innerHTML = `
      <option ${selectedValue === "App Name" ? "selected" : ""}>App Name</option>
      <option ${selectedValue === "Other" ? "selected" : ""}>Other</option>
    `;
  }
}

// Load versions into Edit Page
function loadVersionsIntoEdit(selectedValue = null) {
  const select = document.getElementById("editAppVersion");
  if (!select) return;

  const versions = ["1.0", "2.0", "3.0"];
  select.innerHTML = "";
  versions.forEach(ver => {
    const option = document.createElement("option");
    option.value = ver;
    option.textContent = ver;
    if (selectedValue && ver === selectedValue) option.selected = true;
    select.appendChild(option);
  });
}


// Close modal events
vendorDetailsClose.addEventListener("click", () => {
  vendorDetailsModal.style.display = "none";
});
window.addEventListener("click", (e) => {
  if (e.target === vendorDetailsModal) {
    vendorDetailsModal.style.display = "none";
  }
});


appDetailsClose.addEventListener("click", () => {
  appDetailsModal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === appDetailsModal) {
    appDetailsModal.style.display = "none";
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.card');
  const filterToggle = document.getElementById('filterToggle');
  const filterPanel = document.getElementById('filterPanel');
  const filterName = document.getElementById('filterName');
  const filterAuthor = document.getElementById('filterAuthor');
  const filterStartDate = document.getElementById('filterStartDate');
  const filterEndDate = document.getElementById('filterEndDate');
  const resetFilters = document.getElementById('resetFilters');

  // ✅ 1. Extract info from the card WITHOUT changing HTML
  cards.forEach(card => {
    const appName = card.querySelector('.card-badge')?.textContent.trim() || '';
    const author = card.querySelector('.author-name')?.textContent.trim() || '';
    const dateText = card.querySelector('.date')?.textContent.trim() || '';

    let dateValue = '';
    if (dateText) {
      const parsedDate = new Date(dateText);
      if (!isNaN(parsedDate)) {
        dateValue = parsedDate.toISOString().split('T')[0];
      }
    }

    // Store values as data attributes for filtering
    card.dataset.name = appName;
    card.dataset.author = author;
    card.dataset.date = dateValue;
  });

  // ✅ 2. Toggle filter dropdown
  filterToggle.addEventListener('click', () => {
    filterPanel.classList.toggle('show');
  });

  // ✅ 3. Apply filters
  function applyFilters() {
    const selectedName = filterName.value;
    const startDate = filterStartDate.value;
    const endDate = filterEndDate.value;

    cards.forEach(card => {
      const matchesName = !selectedName || card.dataset.name === selectedName;
      const matchesAuthor = !selectedAuthor || card.dataset.author === selectedAuthor;
      const matchesDate =
        (!startDate && !endDate) ||
        (!startDate || card.dataset.date >= startDate) &&
        (!endDate || card.dataset.date <= endDate);

      card.style.display = (matchesName && matchesAuthor && matchesDate) ? '' : 'none';
    });
  }

  // ✅ 4. Reset filters
  resetFilters.addEventListener('click', () => {
    filterName.value = '';
    filterStartDate.value = '';
    filterEndDate.value = '';
    applyFilters();
  });

  // ✅ 5. Filter instantly on change
  filterName.addEventListener('change', applyFilters);
  filterStartDate.addEventListener('change', applyFilters);
  filterEndDate.addEventListener('change', applyFilters);
});

// === LOGIN LOGIC ===
document.addEventListener("DOMContentLoaded", () => {

  const token = localStorage.getItem("authToken");
const authTime = localStorage.getItem("authTime");

if (token && authTime) {
  const oneHour = 60 * 60 * 1000; // 1 hour in ms
  if (Date.now() - parseInt(authTime) < oneHour) {
    // ✅ Token still valid
    loginPage.style.display = "none";
    showPage("page1");
    loadArticles();
    return; // stop showing login page
  } else {
    // ❌ Token expired
    localStorage.removeItem("authToken");
    localStorage.removeItem("authTime");
  }
}

  const loginPage = document.getElementById("loginPage");
  const loginForm = document.getElementById("loginForm");
  const usernameInput = document.getElementById("loginUsername");
  const passwordInput = document.getElementById("loginPassword");
  const errorBox = document.getElementById("loginError");

  let loginAttempts = 0;
  let lockoutUntil = null;
  let lockoutTimer = null;

  // Clear error when user types again
  [usernameInput, passwordInput].forEach(input => {
    input.addEventListener("input", () => {
      errorBox.style.display = "none";
      errorBox.textContent = "";
    });
  });

  function startLockoutCountdown() {
    if (lockoutTimer) clearInterval(lockoutTimer);

      const submitBtn = loginForm.querySelector("button[type='submit']");
      if (secondsLeft > 0) {
          submitBtn.disabled = true;
      } else {
          submitBtn.disabled = false;
      }
    function updateMessage() {
      const secondsLeft = Math.ceil((lockoutUntil - Date.now()) / 1000);
      if (secondsLeft > 0) {
        errorBox.textContent = `Your login is incorrect, please check your credentials and try again after ${secondsLeft} seconds.`;
        errorBox.style.display = "block";
      } else {
        clearInterval(lockoutTimer);
        errorBox.style.display = "none";
        lockoutUntil = null;
        loginAttempts = 0;
      }
    }

    updateMessage(); // run immediately
    lockoutTimer = setInterval(updateMessage, 1000);
  }

  if (loginPage && loginForm) {
    // Hide all other pages at start
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    loginPage.style.display = 'block';

    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const username = usernameInput.value.trim();
      const password = passwordInput.value.trim();

      // 🚫 Check lockout
      if (lockoutUntil && Date.now() < lockoutUntil) {
        startLockoutCountdown();
        return;
      }

      try {
        const response = await fetchWithAuth("http://localhost:8083/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        const result = await response.json();

        if (response.status === 429) {
    lockoutUntil = Date.now() + 60 * 1000;
    startLockoutCountdown();
    return;
} else if (response.ok) {
    // ✅ Success
    loginAttempts = 0;
    lockoutUntil = null;
    if (lockoutTimer) clearInterval(lockoutTimer);
    errorBox.style.display = "none";

    if (result.token) {
        localStorage.setItem("authToken", result.token);
        localStorage.setItem("authTime", Date.now());
    }

    // Switch to page1
    loginPage.style.display = "none";
    showPage("page1");
    loadArticles();

} else {
    // ❌ Wrong credentials
    loginAttempts++;
    if (loginAttempts >= 5) {
        lockoutUntil = Date.now() + 60 * 1000; // 1 min lock
        startLockoutCountdown();
    } else {
        errorBox.textContent = result.message || "Invalid username or password, please try again.";
        errorBox.style.display = "block";
    }
}


      } catch (err) {
        console.error("Error:", err);
        errorBox.textContent = "Username or password is incorrect.";
        errorBox.style.display = "block";
      }
    });
  }
});

const errorBox = document.getElementById("loginError");
const usernameInput = document.getElementById("loginUsername");
const passwordInput = document.getElementById("loginPassword");

// Clear error when user starts typing again
[usernameInput, passwordInput].forEach(input => {
  input.addEventListener("input", () => {
    errorBox.style.display = "none";
    errorBox.textContent = "";
  });
});

const vendorSelect = document.getElementById("vendor");

// Fetch vendors from backend
document.addEventListener("DOMContentLoaded", () => {
    const addForm = document.getElementById("addForm");
    const vendorSelect = document.getElementById("vendor");

    // --- Load vendors dynamically ---
    async function loadVendors() {
    try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("No auth token found. Please login again.");

        const response = await fetchWithAuth("http://localhost:8083/api/vendors", {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const vendors = await response.json();

        vendorSelect.innerHTML = "<option value=''>Select vendor</option>";

        vendors.forEach(vendor => {
            const option = document.createElement("option");
            option.value = vendor.id;
            option.textContent = vendor.name;
            vendorSelect.appendChild(option);
        });
    } catch (err) {
        console.error("Error loading vendors:", err);
        vendorSelect.innerHTML = "<option>Failed to load vendors</option>";
    }
}


    loadVendors(); // call when page loads

});

// === OPEN EDIT PAGE ===
async function openEditPage(article) {
    if (!article) return;

    currentArticle = article; // store globally

    // Hide all pages first
    hideAllPages();
    document.getElementById("page5").style.display = "block";
    
    loadVendorsInto("editVendor", article.vendorId);
  loadAppsInto("editApp", article.applicationName);
  loadVersionsInto("editVersion", article.applicationVersion);

    // --- Prefill text inputs ---
    document.getElementById("editTitle").value = article.title || "";
    document.getElementById("editSolutions").value = article.solutionsSteps || "";
    document.getElementById("editDescription").value = article.description || "";


   const editDate = document.getElementById("editDate");
  if (article.createdAt) {
    editDate.value = new Date(article.createdAt).toISOString().split("T")[0];
  } else {
    editDate.value = "";
  }   

  loadAppsIntoEdit(article.applicationName);
  loadVersionsIntoEdit(article.applicationVersion);


    // --- Prefill Application dropdown ---
    const appSelect = document.getElementById("editApp");
    if (appSelect) {
        appSelect.innerHTML = "<option value=''>Select application</option>"; // reset

        // Replace this list with your real applications
        const apps = ["App1", "App2", "App3"];
        apps.forEach(app => {
            const option = document.createElement("option");
            option.value = app;
            option.textContent = app;
            if (article.applicationName === app) option.selected = true;
            appSelect.appendChild(option);
        });
    }

    // --- Prefill Version dropdown ---
    const versionSelect = document.getElementById("editVersion");
    if (versionSelect) {
        versionSelect.innerHTML = "<option value=''>Select version</option>"; // reset

        // Replace this list with your real versions
        const versions = ["1.0", "2.0", "3.0"];
        versions.forEach(ver => {
            const option = document.createElement("option");
            option.value = ver;
            option.textContent = ver;
            if (article.applicationVersion === ver) option.selected = true;
            versionSelect.appendChild(option);
        });
    }

    // --- Load vendors dynamically and preselect ---
    async function loadVendorsToSelect(selectId, selectedId = null) {
    const select = document.getElementById(selectId);
    if (!select) return;

    try {
        const res = await fetchWithAuth("http://localhost:8083/api/vendors");
        const vendors = await res.json();
        const vendorSelect = document.getElementById("vendor");

        vendorSelect.innerHTML = "";

        const defaultOpt = document.createElement("option");
defaultOpt.value = "";
defaultOpt.textContent = "--";
vendorSelect.appendChild(defaultOpt);

        vendors.forEach(vendor => {
            const option = document.createElement("option");
            option.value = vendor.id;
            option.textContent = vendor.name;
            if (selectedId && vendor.id === selectedId) option.selected = true;
            select.appendChild(option);
        });
    } catch (err) {
        console.error("Failed to load vendors:", err);
        select.innerHTML = "<option>Failed to load vendors</option>";
    }
}

async function loadAppsInto(selectId, selectedValue = null) {
  const select = document.getElementById(selectId);
  if (!select) return;

  try {
    const res = await fetchWithAuth("http://localhost:8083/api/applications"); 
    if (!res.ok) throw new Error("Failed to fetch apps");
    const apps = await res.json();

    select.innerHTML = "<option value=''>Select app</option>";
    apps.forEach(app => {
      const option = document.createElement("option");
      option.value = app.name;
      option.textContent = app.name;
      if (selectedValue && app.name === selectedValue) option.selected = true;
      select.appendChild(option);
    });
  } catch {
    // fallback to static
    select.innerHTML = `
      <option ${selectedValue === "App Name" ? "selected" : ""}>App Name</option>
      <option ${selectedValue === "Other" ? "selected" : ""}>Other</option>
    `;
  }
}

function loadVersionsInto(selectId, selectedValue = null) {
  const select = document.getElementById(selectId);
  if (!select) return;

  const versions = ["1.0", "2.0", "3.0"];
  select.innerHTML = "";
  versions.forEach(ver => {
    const option = document.createElement("option");
    option.value = ver;
    option.textContent = ver;
    if (selectedValue && ver === selectedValue) option.selected = true;
    select.appendChild(option);
  });
}



    // --- Prefill attached file name if needed ---
    // (optional) you can display current attachedDocs in a label
    const fileLabel = document.querySelector('label[for="editFileUpload"]');
    if (fileLabel) {
        fileLabel.textContent = article.attachedDocs ? article.attachedDocs : "Upload file ⤓";
    }
}


// === SAVE EDIT ===
document.getElementById("editForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!currentArticle) return;

  const updatedArticle = {
    id: currentArticle.id,
    title: document.getElementById("editTitle").value.trim(),
    applicationName: document.getElementById("editApp").value.trim(),
    applicationVersion: document.getElementById("editVersion").value.trim(),
    solutionsSteps: document.getElementById("editSolutions").value.trim(),
    description: document.getElementById("editDescription").value.trim(),
    vendor: {
      id: parseInt(document.getElementById("editVendor").value)
    },
    attachedDocs: document.getElementById("editFileUpload").files[0]?.name || currentArticle.attachedDocs
  };

  try {
    const response = await fetchWithAuth(`http://localhost:8083/api/knowledge-base/${currentArticle.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("authToken")}`
      },
      body: JSON.stringify(updatedArticle),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to save changes: ${response.status} ${errorText}`);
    }

    alert("Changes saved successfully!");

    // Option 1: Refresh full list
    loadKnowledgeBase();
    showPage("page1");


    } catch (err) {
    console.error("Error saving changes:", err);
    alert("Error saving changes. Please try again.");
  }

});

// === CANCEL EDIT ===
document.getElementById("cancelEdit").addEventListener("click", () => {
  showPage("page1"); // go back to knowledge base list
});





// === Shared dropdown loaders ===

// Load vendors into a given select element
async function loadVendorsInto(selectId, selectedId = null) {
  const select = document.getElementById(selectId);
  if (!select) return;

  try {
    const res = await fetchWithAuth("http://localhost:8083/api/vendors", {
      headers: {
        "Content-Type": "application/json",
    Authorization: localStorage.getItem("authToken")
      ? `Bearer ${localStorage.getItem("authToken")}`
      : "",
      },
    });

    if (!res.ok) throw new Error(`Failed to fetch vendors: ${res.status}`);
    const vendors = await res.json();

    select.innerHTML = "<option value=''>Select vendor</option>";
    vendors.forEach(vendor => {
      const option = document.createElement("option");
      option.value = vendor.id;
      option.textContent = vendor.name;
      if (selectedId && vendor.id === selectedId) option.selected = true;
      select.appendChild(option);
    });
  } catch (err) {
    console.error(err);
    select.innerHTML = "<option>Failed to load vendors</option>";
  }
}

// Load applications (replace endpoint if you have one)
async function loadAppsInto(selectId, selectedValue = null) {
  const select = document.getElementById(selectId);
  if (!select) return;

  try {
    const res = await fetchWithAuth("http://localhost:8083/api/applications");
    if (!res.ok) throw new Error(`Failed to fetch apps: ${res.status}`);
    const apps = await res.json();

    select.innerHTML = "<option value=''>Select app</option>";
    apps.forEach(app => {
      const option = document.createElement("option");
      option.value = app.name;
      option.textContent = app.name;
      if (selectedValue && app.name === selectedValue) option.selected = true;
      select.appendChild(option);
    });
  } catch (err) {
    console.error(err);
    // fallback: at least provide static options
    select.innerHTML = `
      <option>App Name</option>
      <option${selectedValue === "Other" ? " selected" : ""}>Other</option>
    `;
  }
}

// Load versions (can be hardcoded if fixed)
function loadVersionsInto(selectId, selectedValue = null) {
  const select = document.getElementById(selectId);
  if (!select) return;

  const versions = ["1.0", "2.0", "3.0"];
  select.innerHTML = "";
  versions.forEach(ver => {
    const option = document.createElement("option");
    option.value = ver;
    option.textContent = ver;
    if (selectedValue && ver === selectedValue) option.selected = true;
    select.appendChild(option);
  });
}


async function loadApplicationsDropdown() {
  try {
    const res = await fetchWithAuth("http://localhost:8083/api/applications");
    const apps = await res.json();
    const appSelect = document.getElementById("app");

    // Clear old options
    appSelect.innerHTML = "";

    // Add default "--" option
    const defaultOpt = document.createElement("option");
defaultOpt.value = "";
defaultOpt.textContent = "--";
appSelect.appendChild(defaultOpt);

    // Add options from DB
    apps.forEach(app => {
      const opt = document.createElement("option");
      opt.value = app.name;
      opt.textContent = app.name;
      appSelect.appendChild(opt);
    });
  } catch (err) {
    console.error("Error loading applications:", err);
  }
}


document.getElementById("addBtnApps").addEventListener("click", () => {
  showPage("pageAddApps");
});

document.getElementById("addBtnVendor").addEventListener("click", () => {
  showPage("pageAddVendors");
});


document.getElementById("addAppsForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const newApp = {
    name: document.getElementById("appName").value || "NA",
    description: document.getElementById("appDescription").value || "NA",
    addedByUserId: 3,   // replace with logged-in user ID
    vendorId: document.getElementById("appVendor").value || null
  };

  try {
    const res = await fetchWithAuth("http://localhost:8083/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newApp)
    });

    if (!res.ok) throw new Error("Failed to save application");

    alert("Application added successfully!");
    showPage("page3");     // go back to apps page
    loadApplications();    // refresh apps list
  } catch (err) {
    console.error(err);
    alert("Error adding application: " + err.message);
  }
});


document.getElementById("addVendorForm").addEventListener("submit", async (e) => {
  e.preventDefault(); // always prevent default submit reload

  const newVendor = {
    name: document.getElementById("vendorName").value.trim(),
    portalTicketingSystem: document.getElementById("vendorSystem").value.trim(),
    portalUsername: document.getElementById("vendorUsername")?.value.trim() || "",
    portalPassword: document.getElementById("vendorPassword")?.value.trim() || "",
    mainContactName: document.getElementById("mainContactName").value.trim(),
    mainContactEmail: document.getElementById("mainContactEmail").value.trim(),
    mainContactMobile: document.getElementById("mainContactMobile").value.trim(),
    escalationLevel1ContactName: document.getElementById("esc1Name").value.trim(),
    escalationLevel1ContactEmail: document.getElementById("esc1Email").value.trim(),
    escalationLevel1ContactMobile: document.getElementById("esc1Mobile").value.trim(),
    escalationLevel2ContactName: document.getElementById("esc2Name").value.trim(),
    escalationLevel2ContactEmail: document.getElementById("esc2Email").value.trim(),
    escalationLevel2ContactMobile: document.getElementById("esc2Mobile").value.trim()
  };

  try {
    const res = await fetchWithAuth("http://localhost:8083/api/vendors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newVendor)
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to save vendor: ${res.status} ${errorText}`);
    }

    alert("Vendor added successfully!");
    showPage("page4");          // ✅ vendors page ID is page4
    loadVendorsGrid();          // ✅ correct function to refresh vendors
  } catch (err) {
    console.error(err);
    alert("Error adding vendor: " + err.message);
  }
});


let currentVendor = null;

function openVendorEditPage(vendor) {
  if (!vendor) return;
  currentVendor = vendor;

  hideAllPages();
  document.getElementById("pageVendorEdit").style.display = "block";

  // Prefill all fields
  document.getElementById("editVendorName").value = vendor.name || "";
  document.getElementById("editVendorCode").value = vendor.code || "";
  document.getElementById("editVendorDescription").value = vendor.description || "";
  document.getElementById("editVendorAddress").value = vendor.address || "";
  document.getElementById("editVendorEmail").value = vendor.email || "";
  document.getElementById("editVendorPhone").value = vendor.phone || "";
  document.getElementById("editVendorWebsite").value = vendor.website || "";
}

document.getElementById("vendorEditForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!currentVendor) return;

  const updatedVendor = {
    id: currentVendor.id,
    name: document.getElementById("editVendorName").value.trim(),
    code: document.getElementById("editVendorCode").value.trim(),
    description: document.getElementById("editVendorDescription").value.trim(),
    address: document.getElementById("editVendorAddress").value.trim(),
    email: document.getElementById("editVendorEmail").value.trim(),
    phone: document.getElementById("editVendorPhone").value.trim(),
    website: document.getElementById("editVendorWebsite").value.trim()
  };

  try {
    const response = await fetchWithAuth(`http://localhost:8083/api/vendors/${currentVendor.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("authToken")}`
      },
      body: JSON.stringify(updatedVendor)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to save vendor: ${response.status} ${errorText}`);
    }

    alert("Vendor updated successfully!");
    showPage("pageVendors"); // back to list
    loadVendors();           // refresh list
  } catch (err) {
    console.error("Error saving vendor:", err);
    alert("Error saving vendor. Please try again.");
  }
});

document.getElementById("cancelVendorEdit").addEventListener("click", () => {
  showPage("pageVendors");
});

vendors.forEach(vendor => {
  const card = document.createElement("div");
  card.classList.add("vendor-card");

  card.innerHTML = `
    <h3>${vendor.name}</h3>
    <p>${vendor.code}</p>
    <p>${vendor.description}</p>
    <button class="editVendorBtn">Edit</button>
  `;

  card.querySelector(".editVendorBtn").addEventListener("click", () => {
    openVendorEditPage(vendor);
  });

  container.appendChild(card);
});

// ===== Load Databases (Page 6) =====
async function loadDatabases() {
  try {
    const res = await fetchWithAuth("http://localhost:8083/api/databases", {
      headers: { "Content-Type": "application/json" }
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const databases = await res.json();

    const databasesGrid = document.getElementById("databasesGrid");
    databasesGrid.innerHTML = "";

    databases.forEach(db => {
      const card = document.createElement("article");
      card.className = "card";

      card.innerHTML = `
        <div class="card-image">
          <img src="images/db-default.png" alt="Database" class="card-img">
          <span class="card-badge">${db.dbType || "DB"}</span>
        </div>
        <div class="card-body">
          <h3 class="card-title">${db.name || "Unnamed DB"}</h3>
          <p class="card-excerpt">IP: ${db.ip || "N/A"}</p>
          <div class="card-meta">
            <span class="author-name">Size: ${db.size || "N/A"}</span>
            <span class="date">${db.lastUpdate || ""}</span>
          </div>
        </div>
      `;

      card.addEventListener("click", () => openDatabaseModal(db));

      databasesGrid.appendChild(card);
    });

  } catch (err) {
    console.error("Failed to load databases:", err);
    alert("Failed to load databases: " + err.message);
  }
}

async function loadBackups() {
  try {
    const res = await fetchWithAuth("http://localhost:8083/api/backups", {
      headers: { "Content-Type": "application/json" }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const backups = await res.json();

    const grid = document.getElementById("backupsGrid");
    grid.innerHTML = "";

    backups.forEach(backup => {
      const card = document.createElement("article");
      card.className = "card";
      card.innerHTML = `
        <div class="card-body">
          <h3 class="card-title">${backup.name || "Backup"}</h3>
          <p class="card-excerpt">Date: ${backup.date || "N/A"}</p>
          <div class="card-meta">
            <span class="author-name">Type: ${backup.type || "N/A"}</span>
            <span class="date">Size: ${backup.size || "N/A"}</span>
          </div>
        </div>
      `;

      card.addEventListener("click", () => openBackupModal(backup));

      grid.appendChild(card);
    });
  } catch (err) {
    console.error("Failed to load backups:", err);
    alert("Failed to load backups: " + err.message);
  }
}

// ===== Load Servers (Page 8) =====
async function loadServers() {
  try {
    const res = await fetchWithAuth("http://localhost:8083/api/servers", {
      headers: { "Content-Type": "application/json" }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const servers = await res.json();

    const grid = document.getElementById("serversGrid");
    grid.innerHTML = "";

    servers.forEach(server => {
      const card = document.createElement("article");
      card.className = "card";
      card.innerHTML = `
        <div class="card-body">
          <h3 class="card-title">${server.name || "Unnamed Server"}</h3>
          <p class="card-excerpt">IP: ${server.ip || "N/A"}</p>
          <div class="card-meta">
            <span class="author-name">OS: ${server.os || "N/A"}</span>
            <span class="date">Status: ${server.status || "N/A"}</span>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
  } catch (err) {
    console.error("Failed to load servers:", err);
    alert("Failed to load servers: " + err.message);
  }
}


// Database modal open function (already correct)
function openDatabaseModal(db) {
  const modal = document.getElementById("dbDetailsModal");

  modal.querySelector(".db-name").textContent = db.name || "N/A";
  modal.querySelector(".db-url").textContent = db.urlAddress || "N/A";
  modal.querySelector(".db-port").textContent = db.port || "N/A";
  modal.querySelector(".db-type").textContent = db.type || "N/A";
  modal.querySelector(".db-username").textContent = db.username || "N/A";
  modal.querySelector(".db-password").textContent = db.password || "N/A";
  modal.querySelector(".db-currentversion").textContent = db.currentVersion || "N/A";
  modal.querySelector(".db-lastupdate").textContent = db.lastUpdate || "N/A";
  modal.querySelector(".db-plannedupdate").textContent = db.plannedUpdate || "N/A";
  modal.querySelector(".db-applicationid").textContent = db.applicationId || "N/A";

  modal.style.display = "block";
}

// ✅ Close handlers (wrapped in DOMContentLoaded to ensure elements exist)
document.addEventListener("DOMContentLoaded", () => {
  const dbCloseBtn = document.querySelector(".db-details-close");
  const dbModal = document.getElementById("dbDetailsModal");


});


function openBackupModal(backup) {
  const modal = document.getElementById("backupDetailsModal");

  modal.querySelector(".backup-name").textContent = backup.name || "N/A";
  modal.querySelector(".backup-applicationid").textContent = backup.applicationId || "N/A";
  modal.querySelector(".backup-mode").textContent = backup.backupMode || "N/A";
  modal.querySelector(".backup-frequency").textContent = backup.frequency || "N/A";
  modal.querySelector(".backup-location").textContent = backup.location || "N/A";
  modal.querySelector(".backup-filepath").textContent = backup.filePath || "N/A";
  modal.querySelector(".backup-type").textContent = backup.backupType || "N/A";

  modal.style.display = "block";
}

document.addEventListener("DOMContentLoaded", () => {
  const backupCloseBtn = document.querySelector(".backup-details-close");
  const backupModal = document.getElementById("backupDetailsModal");
});


function setupModal(modalId, closeClass) {
  const modal = document.getElementById(modalId);
  const closeBtn = modal.querySelector(closeClass);

  if (!modal || !closeBtn) return;

  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });
}

// Setup once DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  setupModal("dbDetailsModal", ".db-details-close");
  setupModal("backupDetailsModal", ".backup-details-close");
  setupModal("serverDetailsModal", ".server-details-close");
});

function loadAppsIntoEdit(selectedValue = null) {
  const select = document.getElementById("editApp");
  if (!select) return;

  // Clear old options
  select.innerHTML = "";

  // Add default "--" option
  const defaultOpt = document.createElement("option");
  defaultOpt.value = "";
  defaultOpt.textContent = "--";  
  select.appendChild(defaultOpt);
  // Add static options (replace with dynamic fetch if needed)
  const apps = ["App1", "App2", "App3"];
  apps.forEach(app => { 
    const option = document.createElement("option");
    option.value = app;
    option.textContent = app;
    if (selectedValue && app === selectedValue) option.selected = true;
    select.appendChild(option);
  });
}


function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
  const page = document.getElementById(pageId);
  if(page) page.style.display = 'block';
}

// ==================== DATABASE ====================
document.getElementById('addDbBtn').addEventListener('click', () => showPage('pageAddDatabase'));
document.getElementById('cancelAddDb').addEventListener('click', () => showPage('pageDatabases'));

document.getElementById('addDbForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const newDb = {
    name: document.getElementById('dbName').value,
    ip: document.getElementById('dbIP').value,
    type: document.getElementById('dbType').value
  };

  try {
    const res = await fetchWithAuth('http://localhost:8083/api/databases', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(newDb)
    });
    if(!res.ok) throw new Error(`Error: ${res.status}`);
    alert('Database added!');
    showPage('pageDatabases');
    loadDatabases(); // refresh list
  } catch(err) {
    console.error(err);
    alert('Failed to add database');
  }
});

// ==================== BACKUP ====================
document.getElementById('addBackupBtn').addEventListener('click', () => showPage('pageAddBackup'));
document.getElementById('cancelAddBackup').addEventListener('click', () => showPage('pageBackups'));

document.getElementById('addBackupForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const newBackup = {
    name: document.getElementById('backupName').value,
    type: document.getElementById('backupType').value
  };

  try {
    const res = await fetchWithAuth('http://localhost:8083/api/backups', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(newBackup)
    });
    if(!res.ok) throw new Error(`Error: ${res.status}`);
    alert('Backup added!');
    showPage('pageBackups');
    loadBackups(); // refresh list
  } catch(err) {
    console.error(err);
    alert('Failed to add backup');
  }
});

// ==================== SERVER ====================
document.getElementById('addServerBtn').addEventListener('click', () => showPage('pageAddServer'));
document.getElementById('cancelAddServer').addEventListener('click', () => showPage('pageServers'));

document.getElementById('addServerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const newServer = {
    name: document.getElementById('serverName').value,
    ip: document.getElementById('serverIP').value,
    os: document.getElementById('serverOS').value
  };

  try {
    const res = await fetchWithAuth('http://localhost:8083/api/servers', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(newServer)
    });
    if(!res.ok) throw new Error(`Error: ${res.status}`);
    alert('Server added!');
    showPage('pageServers');
    loadServers(); // refresh list
  } catch(err) {
    console.error(err);
    alert('Failed to add server');
  }
});
