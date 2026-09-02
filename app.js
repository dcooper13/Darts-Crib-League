const DATA_URL = "./tables.json";


/* =========================================================
   TABLE FUNCTIONS
   ========================================================= */

function renderTable(id, matrix) {
    const table = document.getElementById(id);

    if (!table || !matrix || matrix.length === 0) {
        return;
    }

    table.innerHTML = "";

    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");

    const headerRow = document.createElement("tr");

    matrix[0].forEach(value => {
        const th = document.createElement("th");
        th.textContent = value ?? "";
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);

    for (let i = 1; i < matrix.length; i++) {
        const row = document.createElement("tr");

        matrix[i].forEach(value => {
            const td = document.createElement("td");
            td.textContent = value ?? "";
            row.appendChild(td);
        });

        tbody.appendChild(row);
    }

    table.appendChild(thead);
    table.appendChild(tbody);
}


/* =========================================================
   FIND A TABLE INSIDE WEB_TABLES DATA
   ========================================================= */

function extractTable(data, title) {
    if (!Array.isArray(data)) {
        return [];
    }

    const titleLower = title.toLowerCase();

    for (let row = 0; row < data.length; row++) {
        for (let col = 0; col < data[row].length; col++) {
            const value = String(data[row][col] ?? "")
                .trim()
                .toLowerCase();

            if (value === titleLower) {

                let headerRow = row + 1;

                while (
                    headerRow < data.length &&
                    data[headerRow].every(cell => String(cell ?? "").trim() === "")
                ) {
                    headerRow++;
                }

                if (headerRow >= data.length) {
                    return [];
                }

                let startColumn = col;

                while (
                    startColumn > 0 &&
                    String(data[headerRow][startColumn - 1] ?? "").trim() !== ""
                ) {
                    startColumn--;
                }

                let endColumn = col;

                while (
                    endColumn + 1 < data[headerRow].length &&
                    String(data[headerRow][endColumn + 1] ?? "").trim() !== ""
                ) {
                    endColumn++;
                }

                const result = [];

                result.push(
                    data[headerRow].slice(startColumn, endColumn + 1)
                );

                for (let r = headerRow + 1; r < data.length; r++) {
                    const rowValues =
                        data[r].slice(startColumn, endColumn + 1);

                    const isEmpty =
                        rowValues.every(
                            cell => String(cell ?? "").trim() === ""
                        );

                    if (isEmpty) {
                        break;
                    }

                    result.push(rowValues);
                }

                return result;
            }
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
        const date = fixture.date || "Date TBC";

        if (!groups.has(date)) {
            groups.set(date, []);
        }

        groups.get(date).push(fixture);
    });

    return groups;
}


/* =========================================================
   FIXTURE PAGE
   ========================================================= */

function renderFixtures(fixtures) {
    const container = document.getElementById("fixtures");

    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (!Array.isArray(fixtures) || fixtures.length === 0) {
        container.innerHTML =
            '<div class="panel">No fixtures available.</div>';
        return;
    }

    const groups = groupFixturesByDate(fixtures);


    groups.forEach((matches, date) => {

        /* =================================================
           CREATE DATE CARD
           ================================================= */

        const section = document.createElement("section");
        section.className = "fixture-week";


        /* =================================================
           DATE + TYPE HEADER
           ================================================= */

        const heading = document.createElement("div");
        heading.className = "fixture-week-heading";

        const dateTitle = document.createElement("h2");
        dateTitle.textContent = date;

        heading.appendChild(dateTitle);


        const types = [
            ...new Set(
                matches
                    .map(match => match.type)
                    .filter(type => type && type.trim() !== "")
            )
        ];


        if (types.length > 0) {
            const typeLabel = document.createElement("div");
            typeLabel.className = "fixture-type";
            typeLabel.textContent = types.join(" / ");

            heading.appendChild(typeLabel);
        }


        section.appendChild(heading);


        /* =================================================
           CHECK IF THIS DATE IS A MEETING
           ================================================= */

        const isMeeting = types.some(type =>
            type.trim().toLowerCase() === "meeting"
        );


        /* =================================================
           MEETING
           ================================================= */

        if (isMeeting) {

            const meetingRow = document.createElement("div");
            meetingRow.className = "fixture-row meeting-row";


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


            const locationText = document.createElement("div");
            locationText.className = "meeting-location";

            locationText.textContent =
                meetingLocation || "Meeting location TBC";


            meetingRow.appendChild(locationText);

            section.appendChild(meetingRow);

            container.appendChild(section);

            return;
        }


        /* =================================================
           NORMAL FIXTURE LIST
           ================================================= */

        const list = document.createElement("div");
        list.className = "fixture-list";


        matches.forEach(match => {

            const home =
                String(match.homeTeam || "").trim();

            const away =
                String(match.awayTeam || "").trim();

            const type =
                String(match.type || "").trim();

            const typeLower =
                type.toLowerCase();


            /* =================================================
               EMPTY CUP DATE
               ================================================= */

            if (!home && !away) {

                const row = document.createElement("div");
                row.className = "fixture-row empty-fixture";


                const text = document.createElement("div");
                text.className = "empty-fixture-text";


                if (typeLower === "cup") {
                    text.textContent = "Fixtures to be drawn";
                } else {
                    text.textContent = "Fixtures to be confirmed";
                }


                row.appendChild(text);

                list.appendChild(row);

                return;
            }


            /* =================================================
               CREATE FIXTURE ROW
               ================================================= */

            const row = document.createElement("div");
            row.className = "fixture-row";


            if (match.played) {
                row.classList.add("played");
            }


            /* =================================================
               BYE
               ================================================= */

            if (match.bye) {

                row.classList.add("bye");


                let byeTeam = home;

                if (!byeTeam || byeTeam.toUpperCase() === "BYE") {
                    byeTeam = away;
                }


                const team = document.createElement("div");
                team.className = "bye-team";
                team.textContent = byeTeam;


                const byeText = document.createElement("div");
                byeText.className = "bye-label";
                byeText.textContent = "BYE";


                row.appendChild(team);
                row.appendChild(byeText);


                list.appendChild(row);

                return;
            }


            /* =================================================
               NORMAL MATCH
               ================================================= */

            const homeTeam = document.createElement("div");
            homeTeam.className =
                "fixture-team home-team";

            homeTeam.textContent = home;


            const versus = document.createElement("div");
            versus.className = "fixture-v";
            versus.textContent = "v";


            const awayTeam = document.createElement("div");
            awayTeam.className =
                "fixture-team away-team";

            awayTeam.textContent = away;


            row.appendChild(homeTeam);
            row.appendChild(versus);
            row.appendChild(awayTeam);


            list.appendChild(row);

        });


        section.appendChild(list);

        container.appendChild(section);

    });
}


/* =========================================================
   UPDATED TIME
   ========================================================= */

function renderUpdatedTime(updated) {
    const element = document.getElementById("updated");

    if (!element || !updated) {
        return;
    }

    const date = new Date(updated);

    if (Number.isNaN(date.getTime())) {
        return;
    }

    const formatted =
        date.toLocaleString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });


    element.textContent =
        `Last updated: ${formatted}`;
}


/* =========================================================
   LOAD DATA
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
                `Could not load tables.json: ${response.status}`
            );
        }


        const json = await response.json();


        /* =================================================
           UPDATED TIME
           ================================================= */

        renderUpdatedTime(json.updated);


        /* =================================================
           TABLES PAGE
           ================================================= */

        if (Array.isArray(json.data)) {

            const darts =
                extractTable(
                    json.data,
                    "Darts League"
                );


            const crib =
                extractTable(
                    json.data,
                    "Crib League"
                );


            const gallon =
                extractTable(
                    json.data,
                    "Gallon League"
                );


            if (document.getElementById("dartsTable")) {
                renderTable(
                    "dartsTable",
                    darts
                );
            }


            if (document.getElementById("cribTable")) {
                renderTable(
                    "cribTable",
                    crib
                );
            }


            if (document.getElementById("gallonTable")) {
                renderTable(
                    "gallonTable",
                    gallon
                );
            }

        }


        /* =================================================
           FIXTURE PAGE
           ================================================= */

        if (document.getElementById("fixtures")) {

            renderFixtures(
                Array.isArray(json.fixtures)
                    ? json.fixtures
                    : []
            );

        }

    } catch (error) {

        console.error(error);


        const fixtures =
            document.getElementById("fixtures");

        if (fixtures) {
            fixtures.innerHTML =
                '<div class="panel">Unable to load fixtures at the moment.</div>';
        }


        const updated =
            document.getElementById("updated");

        if (updated) {
            updated.textContent =
                "Unable to load latest data";
        }

    }
}


/* =========================================================
   INITIAL LOAD
   ========================================================= */

loadSiteData();


/* =========================================================
   AUTOMATIC REFRESH EVERY 60 SECONDS
   ========================================================= */

setInterval(
    loadSiteData,
    60000
);
