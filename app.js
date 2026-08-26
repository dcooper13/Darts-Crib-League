const DATA_URL = "./tables.json";

function renderTable(id, matrix) {
  const table = document.getElementById(id);
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

    if (!row) break;

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
      if (output.length > 0) break;
      continue;
    }

    output.push(row.filter((value, index) => {
      if (index >= 10) return false;
      return true;
    }));
  }

  while (
    output.length &&
    output[output.length - 1].every(
      value => value === "" || value === null
    )
  ) {
    output.pop();
  }

  return output;
}

async function loadTables() {
  const status = document.getElementById("status");

  try {
    status.textContent = "Loading league tables...";

    const response = await fetch(DATA_URL, {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(
        `Unable to load league data (${response.status})`
      );
    }

    const result = await response.json();

    const data = result.data;

    if (!Array.isArray(data)) {
      throw new Error("League data is not in the expected format.");
    }

    const darts = extractTable(data, "Darts League");
    const crib = extractTable(data, "Crib League");
    const gallon = extractTable(data, "Gallon League");

    renderTable("darts", darts);
    renderTable("crib", crib);
    renderTable("gallon", gallon);

    const updated = result.updated
      ? new Date(result.updated).toLocaleString("en-GB")
      : "Unknown";

    status.textContent = `Last updated: ${updated}`;
    status.classList.remove("error");

  } catch (error) {
    console.error(error);

    status.textContent =
      "The live league data could not be loaded.";

    status.classList.add("error");
  }
}

loadTables();

setInterval(loadTables, 60000);
