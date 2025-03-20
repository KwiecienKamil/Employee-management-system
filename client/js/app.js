document.addEventListener("DOMContentLoaded", function () {
  const navBar = document.querySelector("nav");
  const mainDashboard = document.querySelector(".main_dashboard");
  const logoutBtn = document.getElementById("logoutBtn");
  const navLinks = document.querySelectorAll(".navigation a");
  const profileUserName = document.querySelector(".profile_user_info h3");
  const profileUserPosition = document.querySelector(".profile_user_info p");

  /*** 🔹 Authentication Functions ***/
  const isLoggedIn = () => localStorage.getItem("loggedInUser") !== null;

  function loadLoginPage() {
    navBar.style.display = "none";
    mainDashboard.style.backgroundColor = "transparent";
    mainDashboard.style.justifyContent = "center";
    mainDashboard.style.maxWidth = "100%"
    fetch("pages/auth/login.html")
      .then((response) => response.text())
      .then((html) => {
        mainDashboard.innerHTML = html;
        document
          .getElementById("loginBtn")
          ?.addEventListener("click", loginUser);
        document
          .getElementById("registerLink")
          ?.addEventListener("click", loadRegisterPage);
      })
      .catch((error) => console.error("Error loading the login page:", error));
  }

  async function loginUser() {
    const email = document.getElementById("email")?.value;
    const password = document.getElementById("password")?.value;
    localStorage.clear();

    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8081/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (data.message) {
        alert(data.message);
      } else {
        localStorage.setItem(
          "loggedInUser",
          JSON.stringify({
            id: data[0].id_pracownika,
            imie: data[0].imie,
            nazwisko: data[0].nazwisko,
            stanowisko: data[0].stanowisko,
          })
        );
        mainDashboard.style.background =
          "linear-gradient(to bottom,rgba(255, 255, 255, 0.5) 0%,rgba(0, 0, 0, 0.5) 100%),radial-gradient(at 50% 0%,rgba(255, 255, 255, 0.1) 0%,rgba(0, 0, 0, 0.5) 50%)";
        mainDashboard.style.justifyContent = "start";
        loadDashboard();
      }
    } catch (error) {
      alert("Something went wrong, please try again.");
    }
  }

  function logoutUser() {
    localStorage.clear();
    loadLoginPage();
  }

  /*** 🔹 Dashboard & Navigation ***/

  async function getUserInfo() {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));

    if (!user) return;

    let userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (!userInfo) {
      try {
        const response = await fetch("http://localhost:8081/userInfo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: user.id }),
        });

        const data = await response.json();
        if (data.message) {
          alert(data.message);
          return;
        }

        localStorage.setItem("userInfo", JSON.stringify(data));
        userInfo = data;
      } catch (error) {
        alert("Something went wrong, please try again.");
        return;
      }
    }

    // Profile details
    profileUserName.textContent = `${user.imie} ${user.nazwisko}`;
    profileUserPosition.textContent = user.stanowisko;
  }

  async function getInventory() {
    let inventory = JSON.parse(localStorage.getItem("inventory"));

    if (!inventory) {
      try {
        const response = await fetch("http://localhost:8081/getInventory", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch inventory data");
        }

        const data = await response.json();
        localStorage.setItem("inventory", JSON.stringify(data));
        renderInventory(data);
      } catch (error) {
        console.error("Error fetching inventory:", error);
        alert("Something went wrong, please try again.");
      }
    } else {
      renderInventory(inventory);
    }
    renderInfo();
  }

  function renderInventory(inventory) {
    const inventoryContainer = document.querySelector(".inventory-wrapper");

    inventory.forEach((item) => {
      const itemDiv = document.createElement("div");
      itemDiv.classList.add("inventory-item");
      itemDiv.innerHTML = `
        <h5>${item.nazwa}</h5>
        <div>
        <p>Ilość: ${item.ilosc}</p>
        <p>QR Code: ${item.qr_code}</p>
        </div>
      `;
      inventoryContainer.appendChild(itemDiv);
    });
  }

  async function getDamageReports() {
    let damageReports = JSON.parse(localStorage.getItem("damageReports"));

      try {
        const response = await fetch("http://localhost:8081/getDamageReports", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch damage reports data");
        }

        const data = await response.json();
        localStorage.setItem("damageReports", JSON.stringify(data));
        renderDamageReports(data);
      } catch (error) {
        console.error("Error fetching damage reports:", error);
        alert("Something went wrong, please try again.");
      }
  }

  function renderDamageReports(damageReports) {
    const damageReportsContainer = document.querySelector(".damage-reports");

    damageReportsContainer.innerHTML = "";

    damageReports.forEach((item) => {
      const itemDiv = document.createElement("div");
      itemDiv.classList.add("damageReports-item");
      itemDiv.innerHTML = `
        <h5>Opis: ${item.opis}</h5>
        <p>Data zgłoszenia: ${item.data_zgloszenia.split("T")[0]}</p>
      `;
      damageReportsContainer.appendChild(itemDiv);
    });
  }

  async function getWarehouseSpace() {
    try {
      const response = await fetch("http://localhost:8081/getWarehouseSpace", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch announcements data");
      }
  
      const data = await response.json();
      localStorage.setItem("warehouseSpace", JSON.stringify(data));  // Update localStorage with new data
    } catch (error) {
      console.error("Error fetching announcements:", error);
      alert("Something went wrong, please try again.");
    }
  }
  
  

  function renderAnnouncements(announcements) {
    const announcementsContainer = document.querySelector(".announcements");

    // Clear previous content to prevent duplicates
    announcementsContainer.innerHTML = "";

    announcements.forEach((item) => {
      const itemDiv = document.createElement("div");
      itemDiv.classList.add("announcement-item");
      itemDiv.innerHTML = `
        <h5>${item.tytul}</h5>
        <p>${item.tresc}</p>
        <p>Data dodania: ${item.data_dodania.split("T")[0]}</p>
      `;
      announcementsContainer.appendChild(itemDiv);
    });
  }

  async function getAnnouncements() {
    try {
      const response = await fetch("http://localhost:8081/getAnnouncements", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch announcements data");
      }
      const data = await response.json();
      localStorage.setItem("announcements", JSON.stringify(data));  // Update localStorage with new data
      renderAnnouncements(data);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      alert("Something went wrong, please try again.");
    }
  }

  function renderInfo() {
    const warehouseSpaceInfo = JSON.parse(localStorage.getItem("warehouseSpace"));
    const inventoryInfo = JSON.parse(localStorage.getItem("inventory"));
    
    const spaceBtn = document.getElementById("warehouse-space")
    const itemBtn = document.getElementById("most-items-in-warehouse")
    
    let totalAllocatedCapacity = 0;

    const mostItemsInInventory = inventoryInfo.reduce((maxItem, item) => {
      return item.ilosc > maxItem.ilosc ? item : maxItem;
    }, inventoryInfo[0]); 
    totalAllocatedCapacity = warehouseSpaceInfo.reduce((sum, item) => 
      sum + parseFloat(item.allocated_capacity || 0), 0
  );

   
      itemBtn.textContent = `${mostItemsInInventory.nazwa}, Ilość: ${mostItemsInInventory.ilosc}`;
      spaceBtn.textContent = `${(50 - totalAllocatedCapacity).toFixed(2)} m²`;
  }
  

  function renderAnnouncements(announcements) {
    const announcementsContainer = document.querySelector(".announcements");

    // Clear previous content to prevent duplicates
    announcementsContainer.innerHTML = "";

    announcements.forEach((item) => {
      const itemDiv = document.createElement("div");
      itemDiv.classList.add("announcement-item");
      itemDiv.innerHTML = `
        <h5>${item.tytul}</h5>
        <p>${item.tresc}</p>
        <p>Data dodania: ${item.data_dodania.split("T")[0]}</p>
      `;
      announcementsContainer.appendChild(itemDiv);
    });

  }

  async function getEmployees() {
    let employees = JSON.parse(localStorage.getItem("employees"));

    if (!employees) {
      try {
        const response = await fetch("http://localhost:8081/getEmployees", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch employee data");
        }

        const data = await response.json();
        localStorage.setItem("employees", JSON.stringify(data));
        renderEmployees(data);
      } catch (error) {
        console.error("Error fetching employees:", error);
        alert("Something went wrong, please try again.");
      }
    } else {
      renderEmployees(employees);
    }
  }

  function renderEmployees(employees) {
    const employeesContainer = document.querySelector(".employees_wrapper");

    employeesContainer.innerHTML = "";

    const table = document.createElement("table");
    table.classList.add("employee-table");

    const thead = document.createElement("thead");
    thead.innerHTML = `
      <tr>
        <th>Imię Nazwisko</th>
        <th>Stanowisko</th>
        <th>Numer Telefonu</th>
      </tr>
    `;

    const tbody = document.createElement("tbody");

    employees.forEach((employee) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${employee.name} ${employee.surname}</td>
        <td>${employee.position}</td>
        <td>${employee.phone_number}</td>
      `;
      tbody.appendChild(row);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    employeesContainer.appendChild(table);
  }

  function loadDashboard() {
    navBar.style.display = "flex";
    loadContent("start");
  }

  function loadContent(section, addToHistory = true) {
    if (!isLoggedIn()) {
      loadLoginPage();
      return;
    }

    fetch(`pages/mainDashboard/${section}.html`)
      .then((response) =>
        response.ok ? response.text() : Promise.reject("Page not found")
      )
      .then((html) => {
        mainDashboard.innerHTML = html;
        updateActiveLink(section);

        if (section === "start") {
          getUserInfo();
          getAnnouncements();
          getWarehouseSpace();
          getDamageReports();
        }
        
        if (section === "magazyn") {
          getInventory();
        }
        
        if (section === "pracownicy") {
          getEmployees();
        }

        if (section === "operacje") {
          loadActions();
        }

        if (addToHistory) {
          history.pushState({ section }, "", `?page=${section}`);
        }
      })
      .catch(() => {
        mainDashboard.innerHTML = "<h2>Error loading page</h2>";
      });
  }

  function updateActiveLink(activeSection) {
    navLinks.forEach((link) => {
      link.classList.toggle(
        "active",
        link.getAttribute("data-section") === activeSection
      );
    });
  }


  async function loadActions() {
    const announcementBtn = document.getElementById("announcement-btn");
    const warehouseBtn = document.getElementById("warehouse-btn");
    const issuesBtn = document.getElementById("issue-btn");
    
    announcementBtn.addEventListener("click", () => {
      addAnnouncement()
    }) 
    warehouseBtn.addEventListener("click", () => {
      addWarehouseSpace()
    }) 
    issuesBtn.addEventListener("click", () => {
      addDamageReport()
    }) 
  }

  async function addAnnouncement() {
    const title = document.getElementById("title")?.value;
    const content = document.getElementById("content")?.value;
    
    try {
      const response = await fetch("http://localhost:8081/addAnnouncement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      alert("Dodano ogłoszenie");
      setTimeout(() => {
        window.location.reload();
      },1000);
      loadContent("start");
    } catch (error) {
      alert("Error adding announcement");
    }
  }

  async function addWarehouseSpace() {
    const warehouseName = document.getElementById("warehouseName")?.value;
    const warehouseSize = document.getElementById("warehouseSize")?.value;
    const warehouseContent = document.getElementById("warehouseContent")?.value;

    try { 
      const response = await fetch("http://localhost:8081/addWarehouseSpace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ warehouseName, warehouseSize, warehouseContent }),
      });
      alert("Dodano przestrzeń");
      setTimeout(() => {
        window.location.reload();
      },1000);
    } catch (error) {
      alert("Error adding warehouse space");
    }
  }

  async function addDamageReport() {
    const issueTitle = document.getElementById("issue-title")?.value;
    const issueDescription = document.getElementById("issue-description")?.value;
    
    try { 
      const response = await fetch("http://localhost:8081/addDamageReport", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issueTitle, issueDescription }),
      });
      alert("Zgłoszono problem");
        window.location.reload();
      setTimeout(() => {
        loadContent("magazyn")
      }, 1000);
    } catch (error) {
      alert("Error adding issue");
    }
  }
  /*** 🔹 Event Listeners ***/

  navLinks.forEach((link) => {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      loadContent(this.getAttribute("data-section"));
    });
  });

  logoutBtn?.addEventListener("click", logoutUser);

  window.addEventListener("popstate", (event) => {
    if (event.state?.section) {
      loadContent(event.state.section, false);
    }
  });

  /*** 🔹 Initialize App ***/

  isLoggedIn() ? loadDashboard() : loadLoginPage();
});
