// Define variable year_now as the current Buddhist Era year (current AD + 543)
let year_now = new Date().getFullYear() + 543

// Set the header's year span with the computed year
document.getElementById("year_now").textContent = year_now

// Filter function for individual table searches
function filterTable(input, tableId) {
  const filter = input.value.toUpperCase()
  const table = document.getElementById(tableId)
  const tr = table.getElementsByTagName("tr")

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

// Render tables with loading animation and responsiveness check
function renderTables(data) {
  // Create and show loading indicator
  const loading = document.createElement("div")
  loading.className = "loading"
  loading.textContent = "กำลังโหลด..."
  document.querySelector("main").appendChild(loading)

  // Get table body elements for each section
  const tbodyOfficial = document.querySelector("#tableOfficial tbody")
  const tbodyEmployee = document.querySelector("#tableEmployee tbody")
  const tbodyCivil = document.querySelector("#tableCivil tbody")

  data.forEach((item) => {
    let remark = item.remark
    remark = remark.replace(
      /\{year_now\}\s*-\s*(\d+)/gi,
      (_, offset) => year_now - parseInt(offset, 10)
    )
    remark = remark.replace(/\{year_now\}/gi, year_now)

    const tr = document.createElement("tr")

    const cellId = document.createElement("td")
    cellId.textContent = item.id
    cellId.style.display = "none"
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
    if (cellRemark.textContent.trim() === "-") {
      cellRemark.classList.add("center-dash")
    }
    tr.appendChild(cellRemark)

    if (item.personal_type === "ข้าราชการ") {
      tbodyOfficial.appendChild(tr)
    } else if (item.personal_type === "ลูกจ้างประจำ") {
      tbodyEmployee.appendChild(tr)
    } else if (item.personal_type === "พนักงานราชการ") {
      tbodyCivil.appendChild(tr)
    }
  })

  // Remove loading indicator after rendering
  loading.remove()

  // Optional: Add dynamic adjustments for small screens (e.g., limit rows or adjust styling)
  if (window.innerWidth < 768) {
    const tables = document.querySelectorAll("table")
    tables.forEach((table) => {
      table.classList.add("mobile-table")
    })
  }
}

// When the DOM content is loaded, fetch the JSON data and render the tables with animation
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
      const loading = document.querySelector(".loading")
      if (loading) {
        loading.textContent = "เกิดข้อผิดพลาดในการโหลดข้อมูล"
      }
    })
})
