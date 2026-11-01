
const dateInput = document.getElementById("recordDate");
const countDisplay = document.getElementById("walkinCount");
const statusInput = document.getElementById("dayStatus");
const notesInput = document.getElementById("notes");

const addBtn = document.getElementById("addBtn");
const minusBtn = document.getElementById("minusBtn");

const todayTotal = document.getElementById("todayTotal");
const monthTotal = document.getElementById("monthTotal");
const historyMonth = document.getElementById("historyMonth");
const historyList = document.getElementById("historyList");
const saveMessage = document.getElementById("saveMessage");

// DATABASE (Browser Local Storage)
let records = JSON.parse(
    localStorage.getItem("walkinRecords")
) || {};

// Get today's date
function getToday() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// Initialize
dateInput.value = getToday();
historyMonth.value = getToday().slice(0, 7);

// Get selected record
function getRecord() {
    const date = dateInput.value;

    if (!records[date]) {
        records[date] = {
            count: 0,
            status: "Open",
            notes: ""
        };
    }

    return records[date];
}

// Save records
function saveRecords() {
    localStorage.setItem(
        "walkinRecords",
        JSON.stringify(records)
    );

    saveMessage.textContent =
        "✓ Changes are saved automatically";

    updateDashboard();
    renderHistory();
}

// Update screen
function updateDashboard() {
    const record = getRecord();

    countDisplay.textContent = record.count;
    statusInput.value = record.status;
    notesInput.value = record.notes;

    todayTotal.textContent = record.count;

    // Calculate monthly total
    const selectedMonth = dateInput.value.slice(0, 7);

    let total = 0;

    Object.keys(records).forEach(date => {
        if (date.startsWith(selectedMonth)) {
            total += Number(records[date].count) || 0;
        }
    });

    monthTotal.textContent = total;

    // Disable counter on closed days
    const isClosed = record.status !== "Open";

    addBtn.disabled = isClosed;
    minusBtn.disabled = isClosed || record.count <= 0;

    addBtn.style.opacity = isClosed ? "0.4" : "1";
    minusBtn.style.opacity =
        (isClosed || record.count <= 0) ? "0.4" : "1";
}

// Add one walk-in customer
addBtn.addEventListener("click", function() {
    const record = getRecord();

    if (record.status !== "Open") return;

    record.count++;

    saveRecords();
    updateDashboard();
});

// Remove one customer
minusBtn.addEventListener("click", function() {
    const record = getRecord();

    if (record.status !== "Open") return;

    if (record.count > 0) {
        record.count--;
    }

    saveRecords();
    updateDashboard();
});

// Change date
dateInput.addEventListener("change", function() {
    updateDashboard();
});

// Change day status
statusInput.addEventListener("change", function() {
    const record = getRecord();

    record.status = statusInput.value;

    saveRecords();
    updateDashboard();
});

// Save notes
notesInput.addEventListener("input", function() {
    const record = getRecord();

    record.notes = notesInput.value;

    saveRecords();
});

// Filter history by month
historyMonth.addEventListener("change", function() {
    renderHistory();
});

// Display history
function renderHistory() {

    const selectedMonth = historyMonth.value;

    const dates = Object.keys(records)
        .filter(date => date.startsWith(selectedMonth))
        .sort((a, b) => b.localeCompare(a));

    if (dates.length === 0) {
        historyList.innerHTML =
            '<p class="empty-message">No records for this month yet.</p>';
        return;
    }

    let html = `
        <table class="history-table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Unit</th>
                    <th>Notes</th>
                </tr>
            </thead>
            <tbody>
    `;

    dates.forEach(date => {

        const record = records[date];

        const formattedDate = new Date(
            date + "T00:00:00"
        ).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });

        html += `
            <tr onclick="openRecord('${date}')">
                <td>${formattedDate}</td>
                <td>${escapeHTML(record.status)}</td>
                <td>
                    <span class="count-badge">
                        ${Number(record.count) || 0}
                    </span>
                </td>
                <td>${escapeHTML(record.notes || "-")}</td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
    `;

    historyList.innerHTML = html;
}

// Open previous record
function openRecord(date) {
    dateInput.value = date;
    updateDashboard();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// Prevent HTML injection in notes
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);
}

// Initial display
updateDashboard();
renderHistory();
