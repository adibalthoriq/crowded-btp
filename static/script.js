let currentCountChart;
let maxDataPoints = 50; // Maksimal 50 titik data terakhir
let timeLabels = [];
let countData = [];
let lastChartUpdate = Date.now(); // Waktu terakhir update grafik
const gambarArray = [
    "/static/stas.png",
    "/static/telkom_logo.png",
    "/static/econique_logo.png"
];
let index_gambar = 0; // Indeks gambar saat ini

async function fetchCountData() {
    try {
        const response = await fetch("/count_data");
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();

        document.getElementById("entry-count").textContent = data.entry_count;
        document.getElementById("exit-count").textContent = data.exit_count;
        document.getElementById("current-count").textContent = data.current_count;

        const currentCount = data.current_count;
        const statusElement = document.getElementById("status");

        // Perbarui status
        if (currentCount > 150) {
        statusElement.textContent = "Status: Overcrowded";
        statusElement.classList.remove("text-green-600");
        statusElement.classList.add("text-red-600");
        } else {
        statusElement.textContent = "Status: Normal";
        statusElement.classList.remove("text-red-600");
        statusElement.classList.add("text-green-600");
        }

        // Perbarui grafik hanya jika sudah 10 menit sejak pembaruan terakhir
        if (Date.now() - lastChartUpdate >= 6000) {
        // 10 menit = 600000 ms
        updateChart(currentCount);
        lastChartUpdate = Date.now();
        }
    } catch (error) {
        console.error("Error fetching count data:", error);
    }
}

function updateChart(currentCount) {
    const now = new Date().toLocaleTimeString();

    // Hanya simpan maxDataPoints data terakhir
    if (timeLabels.length >= maxDataPoints) {
        timeLabels.shift();
        countData.shift();
    }

    timeLabels.push(now);
    countData.push(currentCount);

    if (currentCountChart) {
        currentCountChart.data.labels = timeLabels;
        currentCountChart.data.datasets[0].data = countData;
        currentCountChart.update();
    }
}

function initializeCurrentCountChart() {
    const ctx = document.getElementById("currentCountChart").getContext("2d");
    currentCountChart = new Chart(ctx, {
        type: "line",
        data: {
        labels: [],
        datasets: [
            {
            label: "Current Count",
            data: [],
            backgroundColor: "rgba(59, 130, 246, 0.5)",
            borderColor: "rgba(59, 130, 246, 1)",
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            },
        ],
        },
        options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
            y: { beginAtZero: true },
        },
        },
    });
}

async function resetCount() {
    try {
        const response = await fetch("/reset_count", { method: "POST" });
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        // Set ulang nilai di UI
        document.getElementById("entry-count").textContent = 0;
        document.getElementById("exit-count").textContent = 0;
        document.getElementById("current-count").textContent = 0;

        // Kosongkan data grafik
        timeLabels = [];
        countData = [];
        if (currentCountChart) {
        currentCountChart.data.labels = [];
        currentCountChart.data.datasets[0].data = [];
        currentCountChart.update();
        }
    } catch (error) {
        console.error("Error resetting count:", error);
    }
}

function updateClock() {
    const now = new Date();
    let hours = now.getHours().toString().padStart(2, "0");
    let minutes = now.getMinutes().toString().padStart(2, "0");
    let seconds = now.getSeconds().toString().padStart(2, "0");
    document.getElementById(
        "clock"
    ).textContent = `${hours}:${minutes}:${seconds}`;
}

// Fungsi untuk mengganti gambar
function gantiGambar() {
    index_gambar = (index_gambar + 1) % gambarArray.length; // Menghitung indeks gambar berikutnya
    document.getElementById('logo').src = gambarArray[index_gambar]; // Mengganti src gambar
}

window.addEventListener("load", () => {
    initializeCurrentCountChart();
    fetchCountData();
    updateClock();
    setInterval(updateClock, 1000);
    setInterval(fetchCountData, 1000); // Perbarui data setiap 1 detik
    setInterval(gantiGambar, 3000); // Mengganti gambar setiap 3 detik
});
