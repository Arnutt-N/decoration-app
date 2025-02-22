// checklists.js

// Define variable year_now as the current Buddhist Era year (current AD + 543)
let year_now = new Date().getFullYear() + 543

// Set the header's year span with the computed year
document.getElementById("year_now").textContent = year_now

// Filter function for search inputs in each table
function filterTable(input, tableId) {
  const filter = input.value.toUpperCase()
  const table = document.getElementById(tableId)
  const tr = table.getElementsByTagName("tr")

  // Loop through all rows (skipping the header row at index 0)
  for (let i = 1; i < tr.length; i++) {
    const tds = tr[i].getElementsByTagName("td")
    let rowContainsFilter = false
    for (let j = 0; j < tds.length; j++) {
      const cellText = tds[j].textContent || tds[j].innerText
      if (cellText.toUpperCase().indexOf(filter) > -1) {
        rowContainsFilter = true
        break
      }
    }
    tr[i].style.display = rowContainsFilter ? "" : "none"
  }
}

// Render tables based on JSON data
function renderTables(data) {
  // Get table body elements for each section
  const tbodyOfficial = document.querySelector("#tableOfficial tbody")
  const tbodyEmployee = document.querySelector("#tableEmployee tbody")
  const tbodyCivil = document.querySelector("#tableCivil tbody")

  data.forEach((item) => {
    // Process the remark field by replacing placeholders.
    // Replace patterns like {year_now} - X (e.g., {year_now} - 5)
    let remark = item.remark
    remark = remark.replace(/\{year_now\}\s*-\s*(\d+)/gi, (_, offset) => {
      return year_now - parseInt(offset, 10)
    })
    // Then replace any remaining {year_now} with the computed year_now value.
    remark = remark.replace(/\{year_now\}/gi, year_now)

    // Create a new table row and cells.
    const tr = document.createElement("tr")

    const cellId = document.createElement("td")
    cellId.textContent = item.id
    cellId.style.display = "none" // Hide the id column.
    tr.appendChild(cellId)

    const cellOrder = document.createElement("td")
    cellOrder.textContent = item.order
    tr.appendChild(cellOrder)

    const cellPosType = document.createElement("td")
    cellPosType.textContent = item.pos_type
    tr.appendChild(cellPosType)

    const cellPosLev = document.createElement("td")
    cellPosLev.textContent = item.pos_lev
    tr.appendChild(cellPosLev)

    const cellStart = document.createElement("td")
    cellStart.textContent = item.start || ""
    tr.appendChild(cellStart)

    const cellHighestIns = document.createElement("td")
    cellHighestIns.textContent = item.highest_ins || ""
    tr.appendChild(cellHighestIns)

    const cellCriteria = document.createElement("td")
    cellCriteria.textContent = item.criteria_ins_grant
    tr.appendChild(cellCriteria)

    const cellRemark = document.createElement("td")
    cellRemark.textContent = remark
    // If the cell's text is exactly "-", add the "center-dash" class.
    if (cellRemark.textContent.trim() === "-") {
      cellRemark.classList.add("center-dash")
    }
    tr.appendChild(cellRemark)

    // Append the row to the appropriate table based on personal_type.
    if (item.personal_type === "ข้าราชการ") {
      tbodyOfficial.appendChild(tr)
    } else if (item.personal_type === "ลูกจ้างประจำ") {
      tbodyEmployee.appendChild(tr)
    } else if (item.personal_type === "พนักงานราชการ") {
      tbodyCivil.appendChild(tr)
    }
  })
}

// When the DOM content is loaded, fetch the JSON data and render the tables.
document.addEventListener("DOMContentLoaded", function () {
  fetch("checklistsData.json")
    .then((response) => response.json())
    .then((data) => {
      if (data.checklistsData) {
        renderTables(data.checklistsData)
      }
    })
    .catch((error) => {
      console.error("Error fetching JSON data:", error)
    })
})
