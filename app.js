const DATA_URL = "./tables.json";

function renderTable(id, matrix) {
  const table = document.getElementById(id);

  if (!table) {
    return;
  }

  table.innerHTML = "";

  if (!matrix || matrix.length < 2) {
    return;
  }

  const [headers, ...rows] = matrix;

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  headers.forEach(header => {
    const th = document.createElement("th");
    th.textContent = header ?? "";
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");

  rows.forEach(row => {
    const tr = document.createElement("tr");

    row.forEach(value => {
      const td = document.createElement("td");
      td.textContent = value ?? "";
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
}

function extractTable(data, title) {
  const titleIndex = data.findIndex(
    row => row && row[0] === title
  );

  if (titleIndex === -1) {
    return [];
  }

  const output = [];

  for (let i = titleIndex + 1; i < data.length; i++) {
    const row = data[i];

    if (!row) {
      break;
    }

    const firstCell = row[0];

    if (
      firstCell === "Darts League" ||
      firstCell === "Crib League" ||
      firstCell === "Gallon League"
    ) {
      break;
    }

    const hasData = row.some(
      value => value !== "" && value !== null
    );

    if (!hasData) {
      if (output.length > 0) {
        break;
      }

      continue;
    }

    output.push(row.slice(0, 10));
  }

  return output;
}

function groupFixturesByDate(fixtures) {
  const groups = new Map();

  fixtures.forEach(fixture => {
    if (!fixture.date) {
      return;
    }

    if (!groups.has(fixture.date)) {
      groups.set(fixture.date, []);
    }

    groups.get(fixture.date).push(fixture);
  });

  return groups;
}

function renderFixtures(fixtures) {
  const container = document.getElementById("fixtures");

  if (!container) {
    return;
  }

  container.innerHTML = "";

  if (!Array.isArray(fixtures) || fixtures.length === 0) {
    container.innerHTML =
      '<section class="panel"><p>No fixtures are currently available.</p></section>';
    return;
  }

  const groups = groupFixturesByDate(fixtures);

  groups.forEach((matches, date) => {
    const section = document.createElement("section");
    section.className = "panel fixture-week";

    const heading = document.createElement("div");
    heading.className = "fixture-week-heading";

    const dateTitle = document.createElement("h2");
    dateTitle.textContent = date;

    heading.appendChild(dateTitle);

    const types = [
      ...new Set(matches.map(match => match.type).filter(Boolean))
    ];

    if (types.length > 0) {
      const typeLabel = document.createElement("div");
      typeLabel.className = "fixture-type";
      typeLabel.textContent = types.join(" / ");
      heading.appendChild(typeLabel);
    }

    section.appendChild(heading);

    const list = document.createElement("div");
    list.className = "fixture-list";

    matches.forEach(match => {
      const row = document.createElement("div");

      row.className = "fixture-row";

      if (match.played) {
        row.classList.add("played");
      }

      if (match.bye) {
        row.classList.add("bye");
      }

      if (match.bye) {
        const team = document.createElement("div");
        team.className = "bye-team";
        team.textContent = match.homeTeam || match.awayTeam || "";

        const byeText = document.createElement("div");
        byeText.className = "bye-label";
        byeText.textContent = "BYE";

        row.appendChild(team);
        row.appendChild(byeText);
      } else {
        const home = document.createElement("div");
        home.className = "fixture-team home-team";
        home.textContent = match.homeTeam || "";

        const versus = document.createElement("div");
        versus.className = "fixture-v";
        versus.textContent = "v";

        const away = document.createElement("div");
        away.className = "fixture-team away-team";
        away.textContent = match.awayTeam || "";

        row.appendChild(home);
        row.appendChild(versus);
        row.appendChild(away);
      }

      list.appendChild(row);
    });

    section.appendChild(list);
    container.appendChild(section);
  });
}

async function loadSiteData() {
  const status = document.getElementById("status");

  try {
    if (status) {
      status.textContent = "Loading...";
    }

    const response = await fetch(DATA_URL, {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(
        `Unable to load league data (${response.status})`
      );
    }

    const result = await response.json();

    if (document.getElementById("darts")) {
      const data = result.data;

      if (!Array.isArray(data)) {
        throw new Error("League table data is not in the expected format.");
      }

      renderTable("darts", extractTable(data, "Darts League"));
      renderTable("crib", extractTable(data, "Crib League"));
      renderTable("gallon", extractTable(data, "Gallon League"));
    }

    if (document.getElementById("fixtures")) {
      renderFixtures(result.fixtures || []);
    }

    const updated = result.updated
      ? new Date(result.updated).toLocaleString("en-GB")
      : "Unknown";

    if (status) {
      status.textContent = `Last updated: ${updated}`;
      status.classList.remove("error");
    }

  } catch (error) {
    console.error(error);

    if (status) {
      status.textContent =
        "The live league information could not be loaded.";
      status.classList.add("error");
    }
  }
}

loadSiteData();

setInterval(loadSiteData, 60000);
