
const DATA_URL = "./tables.json";

/* =========================================================
   LEAGUE TABLE RENDERING
   ========================================================= */

function renderTable(tableId, rows) {

    const table = document.getElementById(tableId);

    if (!table) {
        return;
    }

    table.innerHTML = "";

    if (!Array.isArray(rows) || rows.length === 0) {
        return;
    }

    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");

    const headerRow = document.createElement("tr");

    rows[0].forEach(value => {

        const th = document.createElement("th");

        th.textContent = value ?? "";

        headerRow.appendChild(th);

    });

    thead.appendChild(headerRow);

    for (let i = 1; i < rows.length; i++) {

        const rowValues = rows[i];

        const hasContent = rowValues.some(
            value => String(value ?? "").trim() !== ""
        );

        if (!hasContent) {
            continue;
        }

        const tr = document.createElement("tr");

        rowValues.forEach(value => {

            const td = document.createElement("td");

            td.textContent = value ?? "";

            tr.appendChild(td);

        });

        tbody.appendChild(tr);

    }

    table.appendChild(thead);
    table.appendChild(tbody);

}


/* =========================================================
   FIND A LEAGUE TABLE IN WEB_TABLES
   ========================================================= */

function findTable(data, searchText) {

    if (!Array.isArray(data)) {
        return [];
    }

    const wanted = searchText.toLowerCase().trim();

    for (let row = 0; row < data.length; row++) {

        const currentRow =
            Array.isArray(data[row]) ? data[row] : [];

        for (let col = 0; col < currentRow.length; col++) {

            const cell = String(
                currentRow[col] ?? ""
            ).toLowerCase().trim();

            if (!cell.includes(wanted)) {
                continue;
            }

            let headerRow = row + 1;

            while (headerRow < data.length) {

                const candidate =
                    Array.isArray(data[headerRow])
                        ? data[headerRow]
                        : [];

                const hasData = candidate.some(
                    value => String(value ?? "").trim() !== ""
                );

                if (hasData) {
                    break;
                }

                headerRow++;

            }

            if (headerRow >= data.length) {
                return [];
            }

            const header = data[headerRow];

            let startCol = 0;

            while (
                startCol < header.length &&
                String(header[startCol] ?? "").trim() === ""
            ) {
                startCol++;
            }

            if (startCol >= header.length) {
                return [];
            }

            let endCol = startCol;

            while (
                endCol + 1 < header.length &&
                String(header[endCol + 1] ?? "").trim() !== ""
            ) {
                endCol++;
            }

            const result = [];

            result.push(
                header.slice(startCol, endCol + 1)
            );

            for (
                let r = headerRow + 1;
                r < data.length;
                r++
            ) {

                const sourceRow =
                    Array.isArray(data[r]) ? data[r] : [];

                const rowData =
                    sourceRow.slice(startCol, endCol + 1);

                const empty = rowData.every(
                    value => String(value ?? "").trim() === ""
                );

                if (empty) {
                    break;
                }

                result.push(rowData);

            }

            return result;

        }

    }

    return [];

}


/* =========================================================
   GROUP FIXTURES BY DATE
   ========================================================= */

function groupFixturesByDate(fixtures) {

    const groups = new Map();

    fixtures.forEach(fixture => {

        const date = String(
            fixture.date || "Date TBC"
        ).trim();

        if (!groups.has(date)) {
            groups.set(date, []);
        }

        groups.get(date).push(fixture);

    });

    return groups;

}


/* =========================================================
   WORK OUT FIXTURE SECTION STYLE
   ========================================================= */

function getFixtureSectionClass(types) {

    const typeText = types.join(" ").toLowerCase();

    /* MEETING */

    if (typeText.includes("meeting")) {
        return "meeting-fixture";
    }

    /* FINALS NIGHT */

    if (typeText.includes("finals night")) {
        return "finals-fixture";
    }

    /* DARTS CUP EVENTS */

    if (
        typeText.includes("darts") &&
        (
            typeText.includes("cup") ||
            typeText.includes("pairs") ||
            typeText.includes("individual")
        )
    ) {
        return "darts-cup-fixture";
    }

    /* CRIB CUP EVENTS */

    if (
        typeText.includes("crib") &&
        (
            typeText.includes("cup") ||
            typeText.includes("pairs") ||
            typeText.includes("individual")
        )
    ) {
        return "crib-cup-fixture";
    }

    /* GENERAL CUP ROUND */

    if (typeText.includes("cup")) {
        return "general-cup-fixture";
    }

    /* ORDINARY LEAGUE */

    return "league-fixture";

}


/* =========================================================
   SHOULD AN EMPTY EVENT SAY FIXTURES TO BE DRAWN?
   ========================================================= */

function shouldShowDrawPlaceholder(typeLower) {

    return (

        typeLower.includes("cup") ||

        typeLower.includes("pairs") ||

        typeLower.includes("individual") ||

        typeLower.includes("finals night")

    );

}


/* =========================================================
   IDENTIFY MAIN CUP AND SUB CUP FIXTURES
   ========================================================= */

function getCupGroup(match) {

    const type = String(
        match.type || ""
    ).trim();

    const note = String(
        match.notes || ""
    ).trim();

    /* Only apply to Darts and Crib Cup Semis and Finals */

    if (!/^(Darts|Crib) Cup (Semi|Final)$/i.test(type)) {
        return "";
    }

    if (/^main( cup)?$/i.test(note)) {
        return "Main Cup";
    }

    if (/^sub( cup)?$/i.test(note)) {
        return "Sub Cup";
    }

    return "";

}


/* =========================================================
   RENDER FIXTURES
   ========================================================= */

function renderFixtures(fixtures) {

    const container =
        document.getElementById("fixtures");

    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (!Array.isArray(fixtures) || fixtures.length === 0) {

        container.innerHTML = `
            <section class="fixture-week">
                No fixtures available.
            </section>
        `;

        return;

    }

    const groups = groupFixturesByDate(fixtures);

    groups.forEach((matches, date) => {

        /* FIND ALL TYPES FOR THIS DATE */

        const types = [

            ...new Set(

                matches.map(match =>
                    String(match.type || "").trim()
                ).filter(Boolean)

            )

        ];


        /* CREATE DATE SECTION */

        const section =
            document.createElement("section");

        section.className = "fixture-week";

        /* Store the date for automatic scrolling */

        section.dataset.fixtureDate = date;

        const colourClass =
            getFixtureSectionClass(types);

        section.classList.add(colourClass);


        /* DATE / TYPE HEADING */

        const heading =
            document.createElement("div");

        heading.className =
            "fixture-week-heading";

        const dateTitle =
            document.createElement("h2");

        dateTitle.textContent = date;

        heading.appendChild(dateTitle);

        if (types.length > 0) {

            const typeLabel =
                document.createElement("div");

            typeLabel.className =
                "fixture-type";

            typeLabel.textContent =
                types.join(" / ");

            heading.appendChild(typeLabel);

        }

        section.appendChild(heading);


        /* =================================================
           MEETING
           ================================================= */

        const isMeeting = types.some(
            type => type.toLowerCase().includes("meeting")
        );

        if (isMeeting) {

            let meetingLocation = "";

            matches.forEach(match => {

                const home =
                    String(match.homeTeam || "").trim();

                const away =
                    String(match.awayTeam || "").trim();

                if (
                    !meetingLocation &&
                    home &&
                    home.toUpperCase() !== "BYE"
                ) {
                    meetingLocation = home;
                }

                if (
                    !meetingLocation &&
                    away &&
                    away.toUpperCase() !== "BYE"
                ) {
                    meetingLocation = away;
                }

            });

            const meetingRow =
                document.createElement("div");

            meetingRow.className =
                "fixture-row meeting-row";

            const location =
                document.createElement("div");

            location.className =
                "meeting-location";

            location.textContent =
                meetingLocation || "Meeting location TBC";

            meetingRow.appendChild(location);

            section.appendChild(meetingRow);

            container.appendChild(section);

            return;

        }


        /* =================================================
           FIXTURE LIST
           ================================================= */

        const list = document.createElement("div");

        list.className = "fixture-list";


        /* =================================================
           GROUP MAIN CUP AND SUB CUP FIXTURES
           ================================================= */

        const mainCupMatches = matches.filter(
            match => getCupGroup(match) === "Main Cup"
        );

        const subCupMatches = matches.filter(
            match => getCupGroup(match) === "Sub Cup"
        );

        const otherMatches = matches.filter(
            match => getCupGroup(match) === ""
        );

        const hasCupGroups =
            mainCupMatches.length > 0 ||
            subCupMatches.length > 0;

        const fixtureGroups = hasCupGroups

            ? [

                {
                    title: "Main Cup",
                    matches: mainCupMatches,
                    cupGroup: true
                },

                {
                    title: "Sub Cup",
                    matches: subCupMatches,
                    cupGroup: true
                },

                {
                    title: "Other Fixtures",
                    matches: otherMatches,
                    cupGroup: false
                }

            ]

            : [

                {
                    title: "",
                    matches: matches,
                    cupGroup: false
                }

            ];


        /* RENDER EACH CUP GROUP OR NORMAL FIXTURE LIST */

        fixtureGroups.forEach(group => {

            if (group.matches.length === 0) {
                return;
            }

            let targetList = list;

            if (group.title) {

                const groupContainer =
                    document.createElement("div");

                groupContainer.className =
                    "cup-group";

                const cupHeading =
                    document.createElement("h3");

                cupHeading.className =
                    "cup-group-heading";

                cupHeading.textContent =
                    group.title;

                groupContainer.appendChild(cupHeading);

                targetList =
                    document.createElement("div");

                targetList.className =
                    "fixture-list";

                groupContainer.appendChild(targetList);

                list.appendChild(groupContainer);

            }

            let placeholderShown = false;

            const hasDrawnFixtures = group.matches.some(
                match =>
                    String(match.homeTeam || "").trim() !== "" ||
                    String(match.awayTeam || "").trim() !== ""
            );

            group.matches.forEach(match => {

                const home =
                    String(match.homeTeam || "").trim();

                const away =
                    String(match.awayTeam || "").trim();

                const type =
                    String(match.type || "").trim();

                const typeLower =
                    type.toLowerCase();

                const notes = group.cupGroup

                    ? ""

                    : String(match.notes || "").trim();


                /* =========================================
                   EMPTY EVENT
                   ========================================= */

                if (!home && !away) {

                    if (
                        shouldShowDrawPlaceholder(typeLower) &&
                        !placeholderShown &&
                        !hasDrawnFixtures
                    ) {

                        const row =
                            document.createElement("div");

                        row.className =
                            "fixture-row empty-fixture";

                        const text =
                            document.createElement("div");

                        text.className =
                            "empty-fixture-text";

                        text.textContent =
                            "Fixtures to be drawn";

                        row.appendChild(text);

                        targetList.appendChild(row);

                        placeholderShown = true;

                    }

                    return;

                }


                /* =========================================
                   CREATE FIXTURE ROW
                   ========================================= */

                const row =
                    document.createElement("div");

                row.className = "fixture-row";


                /* PLAYED FIXTURE */

                if (match.played) {
                    row.classList.add("played");
                }


                /* =========================================
                   BYE
                   ========================================= */

                if (match.bye) {

                    row.classList.add("bye");

                    let byeTeam = home;

                    if (
                        !byeTeam ||
                        byeTeam.toUpperCase() === "BYE"
                    ) {
                        byeTeam = away;
                    }

                    const team =
                        document.createElement("div");

                    team.className =
                        "bye-team";

                    team.textContent =
                        byeTeam;

                    const byeText =
                        document.createElement("div");

                    byeText.className =
                        "bye-label";

                    byeText.textContent =
                        "BYE";

                    row.appendChild(team);

                    row.appendChild(byeText);


                    /* DISPLAY NOTES FOR BYE FIXTURES */

                    if (notes) {

                        const byeNoteText =
                            document.createElement("div");

                        byeNoteText.className =
                            "fixture-note";

                        byeNoteText.textContent =
                            notes;

                        row.appendChild(byeNoteText);

                    }

                    targetList.appendChild(row);

                    return;

                }


                /* =========================================
                   NORMAL HOME v AWAY
                   ========================================= */

                const homeTeam =
                    document.createElement("div");

                homeTeam.className =
                    "fixture-team home-team";

                homeTeam.textContent =
                    home;


                /* CENTRE SECTION */

                const versus =
                    document.createElement("div");

                versus.className =
                    "fixture-v";

                const versusText =
                    document.createElement("div");

                versusText.className =
                    "fixture-v-text";

                versusText.textContent =
                    "v";

                versus.appendChild(versusText);


                /* DISPLAY VENUE NOTES */

                if (notes) {

                    const noteText =
                        document.createElement("div");

                    noteText.className =
                        "fixture-note";

                    noteText.textContent =
                        notes;

                    versus.appendChild(noteText);

                }


                /* AWAY TEAM */

                const awayTeam =
                    document.createElement("div");

                awayTeam.className =
                    "fixture-team away-team";

                awayTeam.textContent =
                    away;

                row.appendChild(homeTeam);

                row.appendChild(versus);

                row.appendChild(awayTeam);

                targetList.appendChild(row);

            });


            /* Remove empty group headings */

            if (
                targetList !== list &&
                targetList.children.length === 0
            ) {
                targetList.parentElement.remove();
            }

        });


        /* ADD FIXTURES TO DATE SECTION */

        if (list.children.length > 0) {
            section.appendChild(list);
        }

        container.appendChild(section);

    });

}


/* =========================================================
   JUMP TO FIRST UPCOMING FIXTURE DATE
   ========================================================= */

function scrollToUpcomingFixtures() {

    const sections = document.querySelectorAll(
        ".fixture-week[data-fixture-date]"
    );

    if (!sections.length) {
        return;
    }

    const now = new Date();

    const today = new Date(

        now.getFullYear(),

        now.getMonth(),

        now.getDate()

    );

    let target = null;

    sections.forEach(section => {

        if (target) {
            return;
        }

        const value = String(
            section.dataset.fixtureDate || ""
        ).trim();

        const match = value.match(
            /^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/
        );

        if (!match) {
            return;
        }

        let year = Number(match[3]);

        if (year < 100) {
            year += 2000;
        }

        const fixtureDate = new Date(

            year,

            Number(match[2]) - 1,

            Number(match[1])

        );

        if (fixtureDate >= today) {
            target = section;
        }

    });

    if (target) {

        target.scrollIntoView({

            behavior: "auto",

            block: "start"

        });

    }

}


/* =========================================================
   LAST UPDATED TEXT
   ========================================================= */

function updateStatus(updated) {

    const element =
        document.getElementById("updated");

    if (!element) {
        return;
    }

    if (!updated) {

        element.textContent =
            "League information loaded";

        return;

    }

    const date = new Date(updated);

    if (Number.isNaN(date.getTime())) {

        element.textContent =
            "League information loaded";

        return;

    }

    element.textContent =

        "Last updated: " +

        date.toLocaleString(

            "en-GB",

            {

                day: "2-digit",

                month: "2-digit",

                year: "numeric",

                hour: "2-digit",

                minute: "2-digit"

            }

        );

}


/* =========================================================
   LOAD TABLES.JSON
   ========================================================= */

async function loadSiteData() {

    try {

        const response = await fetch(

            `${DATA_URL}?t=${Date.now()}`,

            {
                cache: "no-store"
            }

        );

        if (!response.ok) {

            throw new Error(
                `Unable to load tables.json (${response.status})`
            );

        }

        const json = await response.json();


        /* =============================================
           TABLES PAGE
           ============================================= */

        if (Array.isArray(json.data)) {

            const darts =
                findTable(json.data, "Darts League");

            const crib =
                findTable(json.data, "Crib League");

            const gallon =
                findTable(json.data, "Gallon League");

            renderTable("dartsTable", darts);

            renderTable("cribTable", crib);

            renderTable("gallonTable", gallon);

        }


        /* =============================================
           FIXTURES PAGE
           ============================================= */

        if (document.getElementById("fixtures")) {

            renderFixtures(

                Array.isArray(json.fixtures)

                    ? json.fixtures

                    : []

            );

            /* Automatically jump to upcoming fixtures */

            if (!window.__fixturesInitialJumpDone) {

                scrollToUpcomingFixtures();

                window.__fixturesInitialJumpDone = true;

            }

        }

        updateStatus(json.updated);

    }

    catch (error) {

        console.error(error);

        const status =
            document.getElementById("updated");

        if (status) {

            status.textContent =
                "Unable to load latest league information";

        }

        const fixtures =
            document.getElementById("fixtures");

        if (fixtures) {

            fixtures.innerHTML = `

                <section class="fixture-week">
                    Unable to load fixtures at the moment.
                </section>

            `;

        }

    }

}


/* =========================================================
   FIRST LOAD
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    loadSiteData
);


/* =========================================================
   AUTOMATIC REFRESH EVERY 60 SECONDS
   ========================================================= */

setInterval(
    loadSiteData,
    60000
);
