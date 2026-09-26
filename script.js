// ==========================================
// ATTENDANCE CALCULATOR
// ==========================================

function calculateAttendance() {

    // Get values from inputs
    const totalClasses =
        Number(document.getElementById("totalClasses").value);

    const attendedClasses =
        Number(document.getElementById("attendedClasses").value);

    const targetAttendance =
        Number(document.getElementById("targetAttendance").value);


    // ==========================================
    // VALIDATION
    // ==========================================

    if (
        totalClasses <= 0 ||
        attendedClasses < 0 ||
        targetAttendance <= 0
    ) {

        alert("Please enter valid values.");

        return;
    }


    if (attendedClasses > totalClasses) {

        alert(
            "Classes attended cannot be greater than total classes."
        );

        return;
    }


    if (targetAttendance > 100) {

        alert(
            "Target attendance cannot be greater than 100%."
        );

        return;
    }


    // ==========================================
    // CURRENT ATTENDANCE
    // ==========================================

    const currentAttendance =
        (attendedClasses / totalClasses) * 100;


    // ==========================================
    // SHOW RESULT
    // ==========================================

    document
        .getElementById("result")
        .classList
        .remove("hidden");


    // Percentage
    document
        .getElementById("percentage")
        .textContent =
        currentAttendance.toFixed(2) + "%";


    // Progress bar
    const progressBar =
        document.getElementById("progressBar");

    progressBar.style.width =
        Math.min(currentAttendance, 100) + "%";


    // ==========================================
    // QUICK STATS
    // ==========================================

    document
        .getElementById("targetDisplay")
        .textContent =
        targetAttendance + "%";


    document
        .getElementById("attendedDisplay")
        .textContent =
        attendedClasses;


    document
        .getElementById("totalDisplay")
        .textContent =
        totalClasses;


    // ==========================================
    // STATUS
    // ==========================================

    const status =
        document.getElementById("status");


    status.className = "status";


    if (currentAttendance >= targetAttendance) {

        status.classList.add("good");

        status.textContent =
            "✅ You are above your target attendance. " +
            "You have some attendance flexibility.";

        calculateSafeBunks(
            totalClasses,
            attendedClasses,
            targetAttendance
        );

    }

    else {

        status.classList.add("warning");

        status.textContent =
            "⚠️ Your attendance is below the target. " +
            "Follow the recovery plan below.";

        calculateRecovery(
            totalClasses,
            attendedClasses,
            targetAttendance
        );
    }


    // ==========================================
    // FUTURE PROJECTION
    // ==========================================

    showProjection(
        totalClasses,
        attendedClasses
    );
}


// ==========================================
// SAFE BUNK CALCULATOR
// ==========================================

function calculateSafeBunks(
    total,
    attended,
    target
) {

    let safeBunks = 0;


    /*
       We check how many future classes
       can be missed while maintaining
       the target attendance.
    */

    while (
        (
            attended /
            (total + safeBunks + 1)
        ) * 100 >= target
    ) {

        safeBunks++;
    }


    document
        .getElementById("recoveryMessage")
        .textContent =
        "Your attendance is currently healthy. " +
        "Here is how much flexibility you have.";


    document
        .getElementById("plan")
        .innerHTML = `

            <div class="plan-item">

                <span>
                    🎯 Safe classes you can miss
                </span>

                <strong>
                    ${safeBunks}
                </strong>

            </div>

            <div class="plan-item">

                <span>
                    📌 Target attendance
                </span>

                <strong>
                    ${target}%
                </strong>

            </div>

        `;
}


// ==========================================
// RECOVERY CALCULATOR
// ==========================================

function calculateRecovery(
    total,
    attended,
    target
) {

    let classesNeeded = 0;


    /*
       Formula:

       (attended + x)
       ---------------- >= target
       (total + x)

       We calculate x using a loop
       because it is easier to understand
       and works well for this project.
    */

    while (
        (
            (attended + classesNeeded) /
            (total + classesNeeded)
        ) * 100 < target
    ) {

        classesNeeded++;


        // Safety limit
        if (classesNeeded > 10000) {

            break;
        }
    }


    const finalAttendance =
        (
            (attended + classesNeeded) /
            (total + classesNeeded)
        ) * 100;


    document
        .getElementById("recoveryMessage")
        .textContent =
        "You need to attend the next " +
        classesNeeded +
        " class(es) continuously to reach your target.";


    document
        .getElementById("plan")
        .innerHTML = `

            <div class="plan-item">

                <span>
                    📚 Classes required
                </span>

                <strong>
                    ${classesNeeded}
                </strong>

            </div>


            <div class="plan-item">

                <span>
                    📈 Expected attendance
                </span>

                <strong>
                    ${finalAttendance.toFixed(2)}%
                </strong>

            </div>


            <div class="plan-item">

                <span>
                    🎯 Target
                </span>

                <strong>
                    ${target}%
                </strong>

            </div>

        `;
}


// ==========================================
// FUTURE PROJECTION
// ==========================================

function showProjection(
    total,
    attended
) {

    const projectionContent =
        document.getElementById(
            "projectionContent"
        );


    // Attendance after attending next 5 classes
    const afterFive =
        (
            (attended + 5) /
            (total + 5)
        ) * 100;


    // Attendance after attending next 10 classes
    const afterTen =
        (
            (attended + 10) /
            (total + 10)
        ) * 100;


    projectionContent.innerHTML = `

        <div class="projection-item">

            <span>
                Attend next 5 classes
            </span>

            <strong>
                ${afterFive.toFixed(2)}%
            </strong>

        </div>


        <div class="projection-item">

            <span>
                Attend next 10 classes
            </span>

            <strong>
                ${afterTen.toFixed(2)}%
            </strong>

        </div>

    `;
}


// ==========================================
// RESET
// ==========================================

function resetCalculator() {

    // Clear inputs
    document
        .getElementById("totalClasses")
        .value = "";


    document
        .getElementById("attendedClasses")
        .value = "";


    document
        .getElementById("targetAttendance")
        .value = "75";


    // Hide result
    document
        .getElementById("result")
        .classList
        .add("hidden");


    // Reset percentage
    document
        .getElementById("percentage")
        .textContent = "0%";


    // Reset progress
    document
        .getElementById("progressBar")
        .style.width = "0%";


    // Clear status
    document
        .getElementById("status")
        .textContent = "";


    // Clear planner
    document
        .getElementById("recoveryMessage")
        .textContent = "";


    document
        .getElementById("plan")
        .innerHTML = "";


    document
        .getElementById("projectionContent")
        .innerHTML = "";


    // Reset stats
    document
        .getElementById("targetDisplay")
        .textContent = "75%";


    document
        .getElementById("attendedDisplay")
        .textContent = "0";


    document
        .getElementById("totalDisplay")
        .textContent = "0";
}