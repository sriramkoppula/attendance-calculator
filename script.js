
const form = document.getElementById("attendanceForm");

const totalInput = document.getElementById("totalClasses");
const attendedInput = document.getElementById("attendedClasses");
const targetInput = document.getElementById("targetAttendance");

const missInput = document.getElementById("missCount");
const attendInput = document.getElementById("attendCount");
const errorBox = document.getElementById("formError");

let lastValidAttendance = null;


// ========================================
// GET AND VALIDATE INPUTS
// ========================================

function getAttendanceData() {
    const total = Number(totalInput.value);
    const attended = Number(attendedInput.value);
    const target = Number(targetInput.value);

    if (
        totalInput.value.trim() === "" ||
        attendedInput.value.trim() === ""
    ) {
        return {
            error: "Enter both classes attended and total classes."
        };
    }

    if (
        !Number.isInteger(total) ||
        !Number.isInteger(attended) ||
        total < 1 ||
        attended < 0
    ) {
        return {
            error: "Enter valid whole numbers for your classes."
        };
    }

    if (attended > total) {
        return {
            error: "Classes attended cannot exceed total classes."
        };
    }

    if (
        !Number.isFinite(target) ||
        target <= 0 ||
        target > 100
    ) {
        return {
            error: "Target attendance must be between 1% and 100%."
        };
    }

    return {
        total,
        attended,
        target,
        current: (attended / total) * 100
    };
}


// ========================================
// CALCULATE SAFE CLASSES TO MISS
// ========================================

function safeMissCount(total, attended, target) {
    const targetRatio = target / 100;

    return Math.max(
        0,
        Math.floor(
            attended / targetRatio - total + 1e-10
        )
    );
}


// ========================================
// CALCULATE CLASSES NEEDED
// ========================================

function classesNeeded(total, attended, target) {
    const targetRatio = target / 100;

    // Already meeting the target
    if (attended / total >= targetRatio) {
        return 0;
    }

    // For a 100% target, every remaining class must be attended
    if (target === 100) {
        return total - attended;
    }

    const needed = Math.ceil(
        (
            targetRatio * total - attended
        ) / (
            1 - targetRatio
        ) - 1e-10
    );

    return Math.max(0, needed);
}


// ========================================
// PROJECT FUTURE ATTENDANCE
// ========================================

function projectedAttendance(
    total,
    attended,
    missed,
    attendedFuture
) {
    const futureTotal = total + missed + attendedFuture;
    const futureAttended = attended + attendedFuture;

    if (futureTotal === 0) {
        return 0;
    }

    return (futureAttended / futureTotal) * 100;
}


// ========================================
// UPDATE WHAT-IF SIMULATOR CARDS
// ========================================

function setProjection(
    cardId,
    percentageId,
    messageId,
    percentage,
    target
) {
    const card = document.getElementById(cardId);

    const percentageElement =
        document.getElementById(percentageId);

    const messageElement =
        document.getElementById(messageId);

    percentageElement.textContent =
        percentage.toFixed(2) + "%";

    card.classList.remove(
        "good-projection",
        "neutral-projection"
    );

    if (percentage + 1e-9 >= target) {
        card.classList.add("good-projection");

        messageElement.textContent =
            "You will stay at or above your " +
            target + "% target.";
    } else {
        messageElement.textContent =
            "You will fall below your " +
            target + "% target.";
    }
}


// ========================================
// RUN WHAT-IF SIMULATOR
// ========================================

function updateSimulator() {
    if (!lastValidAttendance) {
        return;
    }

    const {
        total,
        attended,
        target
    } = lastValidAttendance;

    const missed = Math.max(
        0,
        Math.min(
            10000,
            Math.floor(Number(missInput.value) || 0)
        )
    );

    const attendedFuture = Math.max(
        0,
        Math.min(
            10000,
            Math.floor(Number(attendInput.value) || 0)
        )
    );

    // Prevent negative class counts
    if (
        missInput.value !== "" &&
        Number(missInput.value) < 0
    ) {
        missInput.value = "0";
    }

    if (
        attendInput.value !== "" &&
        Number(attendInput.value) < 0
    ) {
        attendInput.value = "0";
    }

    // Scenario 1: Miss upcoming classes
    const afterMissing = projectedAttendance(
        total,
        attended,
        missed,
        0
    );

    setProjection(
        "missProjectionCard",
        "missProjection",
        "missMessage",
        afterMissing,
        target
    );

    // Scenario 2: Attend additional classes
    const afterAttending = projectedAttendance(
        total,
        attended,
        0,
        attendedFuture
    );

    setProjection(
        "attendProjectionCard",
        "attendProjection",
        "attendMessage",
        afterAttending,
        target
    );
}


// ========================================
// DISPLAY CALCULATION RESULTS
// ========================================

function renderResults(data) {
    const {
        total,
        attended,
        target,
        current
    } = data;

    const safeMisses = safeMissCount(
        total,
        attended,
        target
    );

    const needed = classesNeeded(
        total,
        attended,
        target
    );

    // Current percentage
    document.getElementById("percentage").textContent =
        current.toFixed(2) + "%";

    // Progress bar
    document.getElementById("progressBar").style.width =
        Math.min(current, 100) + "%";

    document.getElementById("progressTrack")
        .setAttribute(
            "aria-valuenow",
            String(Math.min(current, 100))
        );

    // Class counts
    document.getElementById("classCount").textContent =
        attended + " attended out of " +
        total + " classes";

    // Attendance status
    const status = document.getElementById("status");

    status.classList.remove("warning");

    if (current + 1e-9 >= target) {
        status.textContent =
            "✓ You're meeting your " +
            target + "% target.";
    } else {
        status.classList.add("warning");

        status.textContent =
            "⚠ You're below your " +
            target + "% target. Follow your recovery plan.";
    }

    // Safe classes to miss
    document.getElementById("safeBunks").textContent =
        safeMisses;

    document.getElementById("safeBunksNote").textContent =
        "and still maintain " + target + "%";

    // Classes needed to reach target
    document.getElementById("classesNeeded").textContent =
        needed;

    if (needed === 0) {
        document.getElementById("classesNeededNote")
            .textContent =
            "you already meet your target";
    } else {
        document.getElementById("classesNeededNote")
            .textContent =
            "in a row to reach " + target + "%";
    }

    // Save the last valid calculation
    lastValidAttendance = {
        total,
        attended,
        target,
        current
    };

    // Update both simulator cards
    updateSimulator();
}


// ========================================
// CALCULATE BUTTON
// ========================================

form.addEventListener("submit", function (event) {
    event.preventDefault();

    const data = getAttendanceData();

    if (data.error) {
        errorBox.textContent = data.error;
        errorBox.classList.add("visible");
        return;
    }

    errorBox.textContent = "";
    errorBox.classList.remove("visible");

    renderResults(data);
});


// ========================================
// LIVE WHAT-IF INPUTS
// ========================================

missInput.addEventListener(
    "input",
    updateSimulator
);

attendInput.addEventListener(
    "input",
    updateSimulator
);


// Recalculate if the main values change after a valid calculation
[
    targetInput,
    totalInput,
    attendedInput
].forEach(function (input) {
    input.addEventListener("input", function () {
        if (!lastValidAttendance) {
            return;
        }

        const data = getAttendanceData();

        if (data.error) {
            errorBox.textContent = data.error;
            errorBox.classList.add("visible");
            return;
        }

        errorBox.textContent = "";
        errorBox.classList.remove("visible");

        renderResults(data);
    });
});


// ========================================
// RESET BUTTON
// ========================================

document.getElementById("resetButton")
    .addEventListener("click", function () {
        form.reset();

        totalInput.value = "";
        attendedInput.value = "";
        targetInput.value = "75";

        missInput.value = "3";
        attendInput.value = "4";

        lastValidAttendance = null;

        // Reset current attendance
        document.getElementById("percentage")
            .textContent = "—";

        document.getElementById("progressBar")
            .style.width = "0%";

        document.getElementById("progressTrack")
            .setAttribute("aria-valuenow", "0");

        document.getElementById("classCount")
            .textContent =
            "Enter your class details to begin.";

        // Reset status
        const status = document.getElementById("status");

        status.textContent =
            "Add your attendance details in the calculator.";

        status.classList.remove("warning");

        // Reset answers
        document.getElementById("safeBunks")
            .textContent = "—";

        document.getElementById("safeBunksNote")
            .textContent =
            "while staying at your target";

        document.getElementById("classesNeeded")
            .textContent = "—";

        document.getElementById("classesNeededNote")
            .textContent = "to reach your target";

        // Reset simulator
        document.getElementById("missProjection")
            .textContent = "—";

        document.getElementById("attendProjection")
            .textContent = "—";

        document.getElementById("missMessage")
            .textContent =
            "Calculate your attendance first.";

        document.getElementById("attendMessage")
            .textContent =
            "Calculate your attendance first.";

        document.getElementById("missProjectionCard")
            .classList.remove(
                "good-projection",
                "neutral-projection"
            );

        document.getElementById("attendProjectionCard")
            .classList.remove(
                "good-projection",
                "neutral-projection"
            );

        // Clear validation errors
        errorBox.textContent = "";
        errorBox.classList.remove("visible");
    });
