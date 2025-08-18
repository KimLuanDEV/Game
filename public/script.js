let spinCount = 0;


let wheelRotation = 0;
let spinInterval;
let isSpinning = false;



const JACKPOT_THRESHOLD = 5000;
const JACKPOT_CHANCE = 0.01;

document.querySelectorAll('#betForm input').forEach(input => {
    input.addEventListener('input', updateTotalBetDisplay);
});

function updateTotalBetDisplay() {
    const form = document.getElementById("betForm");
    const formData = new FormData(form);
    let total = 0;
    for (let value of formData.values()) {
        total += parseInt(value || 0);
    }
    document.getElementById("totalBetDisplay").textContent = `Tổng cược: ${total}`;
}


let balance = 0;
const balanceEl = document.getElementById("balance");

let jackpot = 0;
let netProfit = 0; // Chênh lệch xu lời
let netLoss = 0;   // Chênh lệch xu lỗ


const jackpotEl = document.getElementById("jackpot");

function updateJackpotDisplay() {
    jackpotEl.textContent = jackpot.toFixed(0);
}


const notificationEl = document.getElementById("notification");
const historyEl = document.getElementById("history");
const betHistoryEl = document.getElementById("betHistory");

function updateBalanceDisplay() {
    balanceEl.textContent = balance;
}

function showNotification(message) {
    notificationEl.textContent = message;
    setTimeout(() => notificationEl.textContent = "", 3000);
}

function confirmDeposit() {
    const amount = parseInt(document.getElementById("amount").value) || 0;
    if (amount > 0 && confirm(`Xác nhận nạp ${amount} xu?`)) {
        deposit(amount);
    }
}

function confirmWithdraw() {
    const amount = parseInt(document.getElementById("amount").value);
    const balanceEl = document.getElementById("balance");


    if (isNaN(amount) || amount <= 0) {
        alert("Vui lòng nhập số xu hợp lệ để rút.");
        return;
    }

    if (amount > balance) {
        alert("Không thể rút xu vì số dư không đủ.");
        return;
    }

    if (confirm(`Bạn có chắc muốn rút ${amount} xu không?`)) {
        balance -= amount;
        balanceEl.textContent = balance;
        document.getElementById("notification").textContent = `Rút xu thành công -${amount}`;
    }
}


function deposit(amount) {
    balance += amount;
    updateBalanceDisplay();
    showNotification(`Nạp xu thành công +${amount}`);
}

function withdraw(amount) {
    balance -= amount;
    updateBalanceDisplay();
    showNotification(`-${amount} xu đã được rút.`);
}


function resetBets() {
    const inputs = document.querySelectorAll('#betForm input');
    inputs.forEach(input => input.value = 0);
    updateTotalBetDisplay(); // thêm dòng này
}


function confirmClearBetHistory() {
    if (confirm("Bạn có chắc muốn xóa lịch sử đặt cược?")) {
        clearBetHistory();
    }
}

function confirmClearResultHistory() {
    if (confirm("Bạn có chắc muốn xóa lịch sử kết quả?")) {
        clearResultHistory();
    }
}

function clearBetHistory() {
    betHistoryEl.innerHTML = "🧾 <b>Lịch sử đặt cược:</b><br>";
}

function clearResultHistory() {
    historyEl.innerHTML = "🌡 <b>Lịch sử kết quả:</b><br>";
}

const options = [
    { name: "Chua", icon: "🍋", weight: 19.2, reward: 5 },
    { name: "Cải", icon: "🥬", weight: 19.2, reward: 5 },
    { name: "Ngô", icon: "🌽", weight: 19.2, reward: 5 },
    { name: "Rốt", icon: "🥕", weight: 19.2, reward: 5 },
    { name: "Mỳ", icon: "🥖", weight: 10, reward: 10 },
    { name: "Xiên", icon: "🍢", weight: 6.67, reward: 15 },
    { name: "Đùi", icon: "🍗", weight: 4, reward: 25 },
    { name: "Bò", icon: "🥩", weight: 2.53, reward: 45 },
];


const wheelEl = document.getElementById("wheel");

// Tạo các ô trong vòng quay
function renderWheel() {
    const angleStep = 360 / options.length;
    wheelEl.innerHTML = ""; // xóa cũ

    options.forEach((opt, index) => {
        const segment = document.createElement("div");
        segment.className = "segment";
        segment.textContent = opt.icon;
        segment.style.transform = `rotate(${index * angleStep}deg) translate(0, -85%)`;
        wheelEl.appendChild(segment);
    });
}

renderWheel();

function spinWheel() {

    const resultEl = document.getElementById("result");
    const form = document.getElementById("betForm");
    const formData = new FormData(form);
    const bets = Object.fromEntries(formData.entries());

    let totalBet = 0;
    for (let key in bets) {
        totalBet += parseFloat(bets[key]) || 0;
    }

    if (totalBet > balance) {
        resultEl.textContent = "❌ Không đủ xu để cược.";
        return;
    }

    for (let key in bets) {
        let val = parseFloat(bets[key]);
        if (isNaN(val) || val < 0) {
            resultEl.textContent = `❌ Cược không hợp lệ ở cửa ${key}`;
            return;
        }
    }

    balance -= totalBet;
    updateBalanceDisplay();

    document.getElementById("spinSound").play();

    resultEl.classList.add("spin-animating");
    setTimeout(() => {
        resultEl.classList.remove("spin-animating");
    }, 3000);

    const spinDuration = 5; // giây
    let countdown = spinDuration;
    resultEl.textContent = `⏳ Đếm ngược: ${countdown} giây...`;


    const selected = weightedRandom(options, bets);

    const anglePerSegment = 360 / options.length;
    const selectedIndex = options.findIndex(opt => opt.name === selected.name);
    const randomOffset = Math.random() * anglePerSegment; // giúp kết quả trông tự nhiên hơn

    // Mục tiêu là đưa ô trúng về vị trí 270 độ (dưới kim đỏ)
    const targetAngle = (360 - (selectedIndex * anglePerSegment + anglePerSegment / 2) % 360);

    // Tính góc quay tiếp theo, cộng thêm số vòng quay để hiệu ứng đẹp hơn
    const extraSpins = 5;
    const targetRotation = 360 * extraSpins + targetAngle;

    wheelRotation += targetRotation;




    wheelEl.style.transform = `rotate(${wheelRotation}deg)`;


    const animationInterval = setInterval(() => {
        const tempIcon = options[Math.floor(Math.random() * options.length)].icon;
        resultEl.textContent = `⏳ Đợi kết quả: ${countdown} - ${tempIcon}`;
    }, 100);



    const countdownInterval = setInterval(() => {
        countdown--;
        if (countdown <= 0) {
            clearInterval(countdownInterval);
            clearInterval(animationInterval);

            const betAmount = parseFloat(bets[selected.name]) || 0;
            const winAmount = betAmount > 0 ? betAmount * selected.reward : 0;

            const lostAmount = totalBet - winAmount;
            let profitOrLoss = winAmount - totalBet;

            // Tích lũy hũ từ phần cược thua
            if (lostAmount > 0) {
                const jackpotContribution = Math.floor(lostAmount * 0.1); // 10% số xu thua
                jackpot += jackpotContribution;
                updateJackpotDisplay();
            }

            if (profitOrLoss > 0) {
                netProfit += profitOrLoss;
            } else if (profitOrLoss < 0) {
                netLoss += Math.abs(profitOrLoss);
            }
            updateStatsDisplay();

            balance += winAmount;
            updateBalanceDisplay();

            historyEl.innerHTML += `${selected.icon} `;

            let outcome = winAmount > 0 ? `✅ Thắng ${winAmount}` : `❌ Thua`;

            let jackpotWin = 0;
            if (jackpot >= JACKPOT_THRESHOLD && Math.random() < JACKPOT_CHANCE) {
                jackpotWin = Math.floor(jackpot * 0.8);
                jackpot -= jackpotWin;
                balance += jackpotWin;
                updateBalanceDisplay();
                updateJackpotDisplay();
                outcome += ` 🎉 Nổ hũ! Nhận thêm ${jackpotWin} xu từ hũ!`;
                showJackpotEffect();  // Hiển thị hiệu ứng pháo hoa + coin bay
            }



            if (totalBet > 0) {
                resultEl.textContent = `🎉 Kết quả: ${selected.name} ${selected.icon} - ${outcome}`;
            } else {
                resultEl.textContent = `🎉 Kết quả: ${selected.name} ${selected.icon}`;
            }


            // Bật sáng cả ô đặt cược trúng
            const winningInput = document.querySelector(`input[name="${selected.name}"]`);
            if (winningInput) {
                const betBox = winningInput.closest('.bet-box');
                if (betBox) {
                    betBox.classList.add('highlight-win');
                    setTimeout(() => {
                        betBox.classList.remove('highlight-win');

                        //Tăng số phiên quay.
                        spinCount++;
                        document.getElementById("spinCounter").textContent = `🎯 Phiên quay: ${spinCount}`;

                        //Reset cược.
                        resetBets();
                    }, 5000);
                }
            }



            if (winAmount >= 1000) {
                resultEl.classList.add("big-win-effect");
            } else if (winAmount > 0) {
                resultEl.classList.add("small-win-effect");
            }
            setTimeout(() => {
                resultEl.classList.remove("big-win-effect", "small-win-effect");
            }, 2000);

            if (totalBet > 0) {
                let betLog = `${new Date().toLocaleTimeString()} - Cược: `;
                for (let key in bets) {
                    const val = parseFloat(bets[key]) || 0;
                    if (val > 0) betLog += `${key}: ${val} xu, `;
                }
                betLog += `→ Kết quả: ${selected.name} ${selected.icon} - ${outcome}`;
                betHistoryEl.innerHTML += `🧾 ${betLog}<br>`;
            }
        }
    }, 1000);
}

function weightedRandom(items, bets) {
    const adjustedItems = items.map(item => {
        const betAmount = parseFloat(bets[item.name]) || 0;


        let penaltyFactor = 1;
        if (betAmount > 0) {
            // Giảm mượt theo công thức: penaltyFactor = 1 / (1 + betAmount / 1000)
            // - Cược 2000 xu → còn 50% cơ hội
            // - Cược 4000 xu → còn 33%
            // - Cược 8000 xu → còn 20% (giới hạn thấp)
            penaltyFactor = Math.max(0.2, 1 / (1 + betAmount / 2000));
        }

        return { ...item, weight: item.weight * penaltyFactor };
    });

    const totalWeight = adjustedItems.reduce((sum, item) => sum + item.weight, 0);
    let rand = Math.random() * totalWeight;
    let cumWeight = 0;

    for (let item of adjustedItems) {
        cumWeight += item.weight;
        if (rand <= cumWeight) {
            return item;
        }
    }
}


function confirmSpin() {
    const form = document.getElementById("betForm");
    const formData = new FormData(form);
    let totalBet = 0;

    for (const [key, value] of formData.entries()) {
        totalBet += parseInt(value || 0);
    }

    if (totalBet <= 0) {
        alert("Vui lòng đặt cược trước khi quay.");
        return;
    }

    if (confirm(`Tổng số xu đã đặt cược: ${totalBet}.\nBạn có chắc chắn muốn quay thưởng?`)) {
        spinWheel();
    }


}

//auto quay
let autoTime = 7;
let autoInterval;
let pauseAfterSpin = false;
let pauseTimer = 0;

function startAutoSpinTimer() {
    autoInterval = setInterval(() => {
        const countdownEl = document.getElementById("autoCountdown");

        // Nếu đang trong thời gian chờ sau khi quay
        if (pauseAfterSpin) {
            if (pauseTimer > 0) {
                countdownEl.textContent = `⏳ Đang chờ kết quả... ${pauseTimer}s`;
                countdownEl.classList.add("blink-yellow"); // vàng nhấp nháy
                pauseTimer--;
            } else {
                autoTime = 7; // reset về 35 giây
                pauseAfterSpin = false;
                countdownEl.classList.remove("blink-yellow");
                countdownEl.textContent = `⏳ Quay thưởng sau: ${autoTime} giây`;
            }
            return;
        }

        // Bình thường đếm ngược 35s
        autoTime--;
        countdownEl.textContent = `⏳ Quay thưởng sau: ${autoTime} giây`;

        if (autoTime <= 5) {
            countdownEl.classList.add("blink"); // đỏ nhấp nháy
        } else {
            countdownEl.classList.remove("blink");
        }

        if (autoTime <= 0) {
            if (!isSpinning) {
                spinWheel(); // quay luôn dù không cược
            }

            // Sau khi quay thì pause 4 giây
            pauseAfterSpin = true;
            pauseTimer = 4;
            countdownEl.classList.remove("blink"); // tắt đỏ nhấp nháy
        }
    }, 1000);
}

window.onload = function () {
    updateBalanceDisplay();
    updateJackpotDisplay();
    startAutoSpinTimer();
};



function showJackpotEffect() {
    const container = document.getElementById("jackpotEffect");
    container.innerHTML = "";

    // Coin bay xiên
    for (let i = 0; i < 20; i++) {
        const coin = document.createElement("div");
        coin.className = "coin";
        const x = `${(Math.random() - 0.5) * 300}px`;
        const y = `${-150 - Math.random() * 200}px`;
        coin.style.left = `${50 + Math.random() * 30 - 15}%`;
        coin.style.bottom = `0`;
        coin.style.setProperty('--x', x);
        coin.style.setProperty('--y', y);
        container.appendChild(coin);
    }

    // Fireworks nhiều màu
    const colors = ['#ff0', '#f0f', '#0ff', '#f55', '#5f5', '#55f', '#ffa500'];
    for (let i = 0; i < 10; i++) {
        const fw = document.createElement("div");
        fw.className = "firework";
        fw.style.left = `${40 + Math.random() * 20}%`;
        fw.style.top = `${30 + Math.random() * 30}%`;
        fw.style.setProperty('--color', colors[Math.floor(Math.random() * colors.length)]);
        container.appendChild(fw);
    }

    // Mưa xu
    for (let i = 0; i < 30; i++) {
        const rain = document.createElement("div");
        rain.className = "rain-coin";
        rain.style.left = `${Math.random() * 100}%`;
        rain.style.animationDuration = `${2 + Math.random() * 2}s`;
        rain.style.animationDelay = `${Math.random() * 0.5}s`;
        container.appendChild(rain);
    }

    // Xoá hiệu ứng sau 3 giây
    setTimeout(() => container.innerHTML = "", 3000);
}


function updateTimeDisplay() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('vi-VN', { hour12: false });
    document.getElementById("currentTime").textContent = timeString;
}
setInterval(updateTimeDisplay, 1000);
updateTimeDisplay(); // chạy ngay khi load


function updateStatsDisplay() {
    document.getElementById("stats").textContent =
        `📊 Lãi: ${netProfit} xu | Lỗ: ${netLoss} xu`;
}


function resetStats() {
    if (confirm("Reset thống kê lãi/lỗ?")) {
        netProfit = 0;
        netLoss = 0;
        updateStatsDisplay();
    }
}


function updateJackpotDisplay() {
    jackpotEl.textContent = jackpot.toFixed(0);
    document.getElementById("jackpotProgress").value = jackpot;
}


if (jackpot >= JACKPOT_THRESHOLD) {
    document.querySelector('button[onclick="confirmSpin()"]').classList.add('glow');
}


// --- CHIP CHỌN TIỀN CƯỢC ---
let selectedChipValue = 0;

// Khi chọn chip
document.querySelectorAll(".chip").forEach(chip => {
    chip.addEventListener("click", () => {
        document.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        selectedChipValue = parseInt(chip.dataset.value);
        showNotification(`💰 Đã chọn chip ${selectedChipValue} xu`);
    });
});

// Khi click vào ô cược
document.querySelectorAll(".bet-cell").forEach(cell => {
    cell.addEventListener("click", () => {
        if (selectedChipValue > 0) {
            let amountSpan = cell.querySelector(".bet-amount");
            let current = parseInt(amountSpan.textContent) || 0;
            amountSpan.textContent = current + selectedChipValue;
            updateTotalBetDisplay();
        } else {
            showNotification("⚠️ Hãy chọn chip trước khi đặt cược!");
        }
    });
});