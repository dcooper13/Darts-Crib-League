// Replace this with the public JSON endpoint created by your Power Automate publishing step.
const DATA_URL = "PASTE_PUBLIC_JSON_URL_HERE";

function renderTable(id, matrix){
  const table = document.getElementById(id);
  table.innerHTML = "";
  const [headers, ...rows] = matrix;
  const thead = document.createElement("thead");
  const hr = document.createElement("tr");
  headers.forEach(h => { const th=document.createElement("th"); th.textContent=h; hr.appendChild(th); });
  thead.appendChild(hr); table.appendChild(thead);
  const tbody=document.createElement("tbody");
  rows.forEach(row => { const tr=document.createElement("tr"); row.forEach(v=>{ const td=document.createElement("td"); td.textContent=v ?? ""; tr.appendChild(td); }); tbody.appendChild(tr); });
  table.appendChild(tbody);
}

async function loadTables(){
  const status=document.getElementById("status");
  try{
    if(DATA_URL.includes("PASTE_PUBLIC")) throw new Error("The Power Automate data URL has not been added yet.");
    const res=await fetch(DATA_URL,{cache:"no-store"});
    if(!res.ok) throw new Error(`Data request failed (${res.status})`);
    const data=await res.json();
    renderTable("darts",data.darts); renderTable("crib",data.crib); renderTable("gallon",data.gallon);
    const when=data.updated ? new Date(data.updated).toLocaleString("en-GB") : "just now";
    status.textContent=`Last updated: ${when}`;
  }catch(err){ status.textContent=err.message; status.classList.add("error"); }
}
loadTables();
setInterval(loadTables,60000);
