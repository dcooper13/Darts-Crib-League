const DATA_URL = "./tables.json";


/* =========================================================
   LEAGUE TABLE RENDERING
   ========================================================= */

function renderTable(tableId, rows) {

    const table =
        document.getElementById(tableId);

    if (!table) {
        return;
    }

    table.innerHTML = "";


    if (
        !Array.isArray(rows) ||
        rows.length === 0
    ) {
        return;
    }


    const thead =
        document.createElement("thead");

    const tbody =
        document.createElement("tbody");


    /* HEADER */

    const headerRow =
        document.createElement("tr");


    rows[0].forEach(value => {

        const th =
            document.createElement("th");

        th.textContent =
            value ?? "";

        headerRow.appendChild(th);

    });


    thead.appendChild(headerRow);



    /* DATA ROWS */

    for (
        let i = 1;
        i < rows.length;
        i++
    ) {

        const rowValues =
            rows[i];


        const hasContent =
            rowValues.some(
                value =>
                    String(
                        value ?? ""
                    ).trim() !== ""
            );


        if (!hasContent) {
            continue;
        }


        const tr =
            document.createElement("tr");


        rowValues.forEach(value => {

            const td =
                document.createElement("td");

            td.textContent =
                value ?? "";

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


    const wanted =
        searchText
            .toLowerCase()
            .trim();


    for (
        let row = 0;
        row < data.length;
        row++
    ) {

        const currentRow =
            Array.isArray(data[row])
                ? data[row]
                : [];


        for (
            let col = 0;
            col < currentRow.length;
            col++
        ) {

            const cell =
                String(
                    currentRow[col] ?? ""
                )
                    .toLowerCase()
                    .trim();


            if (!cell.includes(wanted)) {
                continue;
            }


            /* Find next row containing data */

            let headerRow =
                row + 1;


            while (
                headerRow < data.length
            ) {

                const candidate =
                    Array.isArray(
                        data[headerRow]
                    )
                        ? data[headerRow]
                        : [];


                const hasData =
                    candidate.some(
                        value =>
                            String(
                                value ?? ""
                            ).trim() !== ""
                    );


                if (hasData) {
                    break;
                }


                headerRow++;

            }


            if (
                headerRow >=
                data.length
            ) {
                return [];
            }


            const header =
                data[headerRow];


            /* Find first header column */

            let startCol = 0;


            while (
                startCol <
                    header.length &&
                String(
                    header[startCol] ?? ""
                ).trim() === ""
            ) {

                startCol++;

            }


            if (
                startCol >=
                header.length
            ) {
                return [];
            }


            /* Find last continuous header column */

            let endCol =
                startCol;


            while (
                endCol + 1 <
                    header.length &&
                String(
                    header[endCol + 1] ?? ""
                ).trim() !== ""
            ) {

                endCol++;

            }


            const result = [];


            result.push(
                header.slice(
                    startCol,
                    endCol + 1
                )
            );


            /* Read data underneath */

            for (
                let r =
                    headerRow + 1;

                r < data.length;

                r++
            ) {

                const sourceRow =
                    Array.isArray(
                        data[r]
                    )
                        ? data[r]
                        : [];


                const rowData =
                    sourceRow.slice(
                        startCol,
                        endCol + 1
                    );


                const empty =
                    rowData.every(
                        value =>
                            String(
                                value ?? ""
                            ).trim() === ""
                    );


                if (empty) {
                    break;
                }


                result.push(
                    rowData
                );

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

    const groups =
        new Map();


    fixtures.forEach(fixture => {

        const date =
            String(
                fixture.date ||
                "Date TBC"
            ).trim();


        if (!groups.has(date)) {

            groups.set(
                date,
                []
            );

        }


        groups
            .get(date)
            .push(fixture);

    });


    return groups;
}



/* =========================================================
   WORK OUT FIXTURE SECTION STYLE
   ========================================================= */

function getFixtureSectionClass(types) {

    const typeText =
        types
            .join(" ")
            .toLowerCase();


    /*
     * MEETING
     */

    if (
        typeText.includes(
            "meeting"
        )
    ) {
        return "meeting-fixture";
    }


    /*
     * FINALS NIGHT
     */

    if (
        typeText.includes(
            "finals night"
        )
    ) {
        return "finals-fixture";
    }


    /*
     * DARTS CUP EVENTS
     *
     * Includes:
     * Darts Cup
     * Darts Cup Semi
     * Darts Cup Final
     * Darts Pairs
     * Darts Individuals
     */

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


    /*
     * CRIB CUP EVENTS
     *
     * Includes:
     * Crib Cup
     * Crib Cup Semi
     * Crib Cup Final
     * Crib Pairs
     * Crib Individuals
     */

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


    /*
     * GENERAL CUP ROUND
     *
     * Example:
     * Cup 1st Round
     *
     * This uses the general Cup colour.
     */

    if (
        typeText.includes("cup")
    ) {
        return "general-cup-fixture";
    }


    /*
     * ORDINARY LEAGUE
     */

    return "league-fixture";
}



/* =========================================================
   SHOULD AN EMPTY EVENT SAY FIXTURES TO BE DRAWN?
   ========================================================= */

function shouldShowDrawPlaceholder(
    typeLower
) {

    return (

        typeLower.includes("cup") ||

        typeLower.includes("pairs") ||

        typeLower.includes(
            "individual"
        ) ||

        typeLower.includes(
            "finals night"
        )

    );
}



/* =========================================================
   RENDER FIXTURES
   ========================================================= */

function renderFixtures(fixtures) {

    const container =
        document.getElementById(
            "fixtures"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (
        !Array.isArray(fixtures) ||
        fixtures.length === 0
    ) {

        container.innerHTML =
            `
            <section class="fixture-week">
                No fixtures available.
            </section>
            `;

        return;
    }


    const groups =
        groupFixturesByDate(
            fixtures
        );



    groups.forEach(
        (matches, date) => {


            /* =============================================
               FIND ALL TYPES FOR THIS DATE
               ============================================= */

            const types = [

                ...new Set(

                    matches

                        .map(match =>
                            String(
                                match.type ||
                                ""
                            ).trim()
                        )

                        .filter(Boolean)

                )

            ];



            /* =============================================
               CREATE DATE SECTION
               ============================================= */

            const section =
                document.createElement(
                    "section"
                );


            section.className =
                "fixture-week";


            const colourClass =
                getFixtureSectionClass(
                    types
                );


            section.classList.add(
                colourClass
            );



            /* =============================================
               DATE / TYPE HEADING
               ============================================= */

            const heading =
                document.createElement(
                    "div"
                );


            heading.className =
                "fixture-week-heading";


            const dateTitle =
                document.createElement(
                    "h2"
                );


            dateTitle.textContent =
                date;


            heading.appendChild(
                dateTitle
            );



            if (
                types.length > 0
            ) {

                const typeLabel =
                    document.createElement(
                        "div"
                    );


                typeLabel.className =
                    "fixture-type";


                typeLabel.textContent =
                    types.join(" / ");


                heading.appendChild(
                    typeLabel
                );

            }


            section.appendChild(
                heading
            );



            /* =============================================
               MEETING
               ============================================= */

            const isMeeting =
                types.some(
                    type =>
                        type
                            .toLowerCase()
                            .includes(
                                "meeting"
                            )
                );


            if (isMeeting) {


                let meetingLocation =
                    "";


                matches.forEach(
                    match => {


                        const home =
                            String(
                                match.homeTeam ||
                                ""
                            ).trim();


                        const away =
                            String(
                                match.awayTeam ||
                                ""
                            ).trim();



                        if (
                            !meetingLocation &&
                            home &&
                            home.toUpperCase()
                                !== "BYE"
                        ) {

                            meetingLocation =
                                home;

                        }



                        if (
                            !meetingLocation &&
                            away &&
                            away.toUpperCase()
                                !== "BYE"
                        ) {

                            meetingLocation =
                                away;

                        }

                    }
                );



                const meetingRow =
                    document.createElement(
                        "div"
                    );


                meetingRow.className =
                    "fixture-row meeting-row";


                const location =
                    document.createElement(
                        "div"
                    );


                location.className =
                    "meeting-location";


                location.textContent =
                    meetingLocation ||
                    "Meeting location TBC";


                meetingRow.appendChild(
                    location
                );


                section.appendChild(
                    meetingRow
                );


                container.appendChild(
                    section
                );


                return;

            }



            /* =============================================
               FIXTURE LIST
               ============================================= */

            const list =
                document.createElement(
                    "div"
                );


            list.className =
                "fixture-list";



            /*
             * Makes sure an undrawn Cup/event
             * only says:
             *
             * Fixtures to be drawn
             *
             * ONCE per date.
             */

            let placeholderShown =
                false;



            matches.forEach(
                match => {


                    const home =
                        String(
                            match.homeTeam ||
                            ""
                        ).trim();


                    const away =
                        String(
                            match.awayTeam ||
                            ""
                        ).trim();


                    const type =
                        String(
                            match.type ||
                            ""
                        ).trim();


                    const typeLower =
                        type.toLowerCase();



                    /* =====================================
                       EMPTY EVENT
                       ===================================== */

                    if (
                        !home &&
                        !away
                    ) {


                        if (

                            shouldShowDrawPlaceholder(
                                typeLower
                            )

                            &&

                            !placeholderShown

                        ) {


                            const row =
                                document.createElement(
                                    "div"
                                );


                            row.className =
                                "fixture-row empty-fixture";


                            const text =
                                document.createElement(
                                    "div"
                                );


                            text.className =
                                "empty-fixture-text";


                            text.textContent =
                                "Fixtures to be drawn";


                            row.appendChild(
                                text
                            );


                            list.appendChild(
                                row
                            );


                            placeholderShown =
                                true;

                        }


                        /*
                         * Ignore completely empty
                         * ordinary League rows.
                         */

                        return;

                    }



                    /* =====================================
                       CREATE FIXTURE ROW
                       ===================================== */

                    const row =
                        document.createElement(
                            "div"
                        );


                    row.className =
                        "fixture-row";



                    /* PLAYED */

                    if (
                        match.played
                    ) {

                        row.classList.add(
                            "played"
                        );

                    }



                    /* =====================================
                       BYE
                       ===================================== */

                    if (
                        match.bye
                    ) {


                        row.classList.add(
                            "bye"
                        );


                        let byeTeam =
                            home;


                        if (

                            !byeTeam

                            ||

                            byeTeam
                                .toUpperCase()
                                === "BYE"

                        ) {

                            byeTeam =
                                away;

                        }



                        const team =
                            document.createElement(
                                "div"
                            );


                        team.className =
                            "bye-team";


                        team.textContent =
                            byeTeam;



                        const byeText =
                            document.createElement(
                                "div"
                            );


                        byeText.className =
                            "bye-label";


                        byeText.textContent =
                            "BYE";



                        row.appendChild(
                            team
                        );


                        row.appendChild(
                            byeText
                        );


                        list.appendChild(
                            row
                        );


                        return;

                    }



                    /* =====================================
                       NORMAL HOME v AWAY
                       ===================================== */

                    const homeTeam =
                        document.createElement(
                            "div"
                        );


                    homeTeam.className =
                        "fixture-team home-team";


                    homeTeam.textContent =
                        home;



                    const versus =
                        document.createElement(
                            "div"
                        );


                    versus.className =
                        "fixture-v";


                    versus.textContent =
                        "v";



                    const awayTeam =
                        document.createElement(
                            "div"
                        );


                    awayTeam.className =
                        "fixture-team away-team";


                    awayTeam.textContent =
                        away;



                    row.appendChild(
                        homeTeam
                    );


                    row.appendChild(
                        versus
                    );


                    row.appendChild(
                        awayTeam
                    );


                    list.appendChild(
                        row
                    );

                }
            );



            if (
                list.children.length > 0
            ) {

                section.appendChild(
                    list
                );

            }


            container.appendChild(
                section
            );

        }
    );

}



/* =========================================================
   LAST UPDATED TEXT
   ========================================================= */

function updateStatus(updated) {

    const element =
        document.getElementById(
            "updated"
        );


    if (!element) {
        return;
    }


    if (!updated) {

        element.textContent =
            "League information loaded";

        return;
    }


    const date =
        new Date(updated);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

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


        const response =
            await fetch(

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



        const json =
            await response.json();



        /* =============================================
           TABLES PAGE
           ============================================= */

        if (
            Array.isArray(
                json.data
            )
        ) {


            const darts =
                findTable(
                    json.data,
                    "Darts League"
                );


            const crib =
                findTable(
                    json.data,
                    "Crib League"
                );


            const gallon =
                findTable(
                    json.data,
                    "Gallon League"
                );



            renderTable(
                "dartsTable",
                darts
            );


            renderTable(
                "cribTable",
                crib
            );


            renderTable(
                "gallonTable",
                gallon
            );

        }



        /* =============================================
           FIXTURES PAGE
           ============================================= */

        if (
            document.getElementById(
                "fixtures"
            )
        ) {


            renderFixtures(

                Array.isArray(
                    json.fixtures
                )

                    ? json.fixtures

                    : []

            );

        }



        updateStatus(
            json.updated
        );


    }

    catch (error) {


        console.error(
            error
        );


        const status =
            document.getElementById(
                "updated"
            );


        if (status) {

            status.textContent =
                "Unable to load latest league information";

        }


        const fixtures =
            document.getElementById(
                "fixtures"
            );


        if (fixtures) {

            fixtures.innerHTML =
                `
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
