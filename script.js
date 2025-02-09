document.addEventListener("DOMContentLoaded", function () {
  // --- Form Submission ---
  const form = document.getElementById("searchForm")
  form.addEventListener("submit", async function (event) {
    event.preventDefault()
    form.classList.add("was-validated") // Trigger Bootstrap's validation styling
    if (validateForm()) {
      await handleSubmit()
    }
  })

  // --- Calculate and set salary5y_year ---
  const currentYearBE = new Date().getFullYear() + 543
  const fiveYearsAgoBE = currentYearBE - 5
  document.getElementById("salary5y_year").textContent = fiveYearsAgoBE

  // --- Populate dropdowns and set up hierarchy ---
  populateDropdowns()

  // --- Input Event Listener for Date Formatting ---
  document.querySelectorAll('.form-control[type="text"]').forEach((input) => {
    input.addEventListener("input", function (e) {
      let value = e.target.value
      value = value.replace(/[^0-9/]/g, "") // Allow only digits and slashes
      const slashCount = (value.match(/\//g) || []).length
      if (slashCount > 2) {
        const lastSlashIndex = value.lastIndexOf("/")
        value = value.substring(0, lastSlashIndex)
      }
      const parts = value.split("/")
      if (parts.length > 0 && parts[0].length > 2) {
        parts[0] = parts[0].substring(0, 2) // Limit day
      }
      if (parts.length > 1 && parts[1].length > 2) {
        parts[1] = parts[1].substring(0, 2) // Limit month
      }
      if (parts.length > 2 && parts[2].length > 4) {
        parts[2] = parts[2].substring(0, 4) // Limit year
      }
      e.target.value = parts.join("/")
    })
  })

  // --- Attach resetForm to reset button ---
  document.getElementById("btnClearForm").addEventListener("click", resetForm)
})

// --- Helper Functions ---

// Calculate period in years between two dates (dd/mm/yyyy)
function calculatePeriodInYears(startDateStr, endDateStr) {
  if (!startDateStr || !endDateStr) return null // Handle null/empty
  const startDateParts = startDateStr.split("/")
  const endDateParts = endDateStr.split("/")
  const startDate = new Date(
    startDateParts[2],
    startDateParts[1] - 1,
    startDateParts[0]
  )
  const endDate = new Date(
    endDateParts[2],
    endDateParts[1] - 1,
    endDateParts[0]
  )

  const diffInMilliseconds = endDate - startDate
  const diffInYears = diffInMilliseconds / (1000 * 60 * 60 * 24 * 365.25)
  return diffInYears
}

// Parse period string (e.g., ">=5,<10")
function parsePeriod(periodStr) {
  if (!periodStr) return { min: null, max: null }

  let min = null
  let max = null

  const parts = periodStr.split(",")
  parts.forEach((part) => {
    const geMatch = part.match(/>=(\d+)/)
    const leMatch = part.match(/<(\d+)/)

    if (geMatch) {
      min = parseInt(geMatch[1], 10)
    }
    if (leMatch) {
      max = parseInt(leMatch[1], 10)
    }
  })
  return { min, max }
}

// Check period conditions
function checkBegPosPeriodCondition(beg_pos_period_input, beg_pos_period) {
  if (!beg_pos_period) return true
  return checkPeriodCondition(beg_pos_period_input, beg_pos_period)
}

function checkPosLevPeriodCondition(pos_lev_period_input, pos_lev_period) {
  if (!pos_lev_period) return true
  return checkPeriodCondition(pos_lev_period_input, pos_lev_period)
}

function checkLastInsPeriodCondition(last_ins_period_input, last_ins_period) {
  if (!last_ins_period) return true
  return checkPeriodCondition(last_ins_period_input, last_ins_period)
}

// Generic period condition checker
function checkPeriodCondition(period_input, period_str) {
  const { min, max } = parsePeriod(period_str)
  if (min !== null && period_input < min) return false
  if (max !== null && period_input >= max) return false
  return true
}

// Check salary conditions
function checkSalaryCondition(salary_input, salary) {
  if (!salary) return true
  const { min, max } = parsePeriod(salary)
  if (min !== null && salary_input < min) return false
  if (max !== null && salary_input >= max) return false
  return true
}

function checkSalary5yCondition(salary5y_input, salary5y) {
  if (!salary5y) return true

  const { min, max } = parsePeriod(salary5y)
  if (min !== null && salary5y_input < min) return false
  if (max !== null && salary5y_input >= max) return false
  return true
}

// Get highest ins_code_order for each pos_type and pos_lev
function getHighestOrders(data) {
  const highestOrders = {}
  data.decorData.forEach((item) => {
    const key = item.pos_type + item.pos_lev
    if (!highestOrders[key] || item.ins_code_order > highestOrders[key]) {
      highestOrders[key] = item.ins_code_order
    }
  })
  return highestOrders
}

// Get ins_code_order from ins_code_name_full (Lookup Table)
function getInsCodeOrder(data, ins_code_name_full) {
  if (!ins_code_name_full) return null
  const item = data.decorData.find(
    (item) => item.ins_code_name_full === ins_code_name_full
  )
  return item ? item.ins_code_order : null
}

// --- Fetch Data and Populate Dropdowns ---

async function fetchData() {
  try {
    const response = await fetch("decorationData.json")
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error("Error fetching data:", error)
    Swal.fire({
      icon: "error",
      title: "เกิดข้อผิดพลาด",
      text: "ไม่สามารถโหลดข้อมูลได้: " + error.message,
    })
    return null
  }
}

async function populateDropdowns() {
  const data = await fetchData()
  if (!data) return

  const personalTypeSelect = document.getElementById("personal_type")
  const positionTypeSelect = document.getElementById("pos_type")
  const positionLevelSelect = document.getElementById("pos_lev")
  const decorationCodeSelect = document.getElementById("last_ins_code")

  // --- Populate personal_type ---
  const personalTypes = [
    ...new Set(
      data.decorData.map((item) => item.personal_type).filter(Boolean)
    ),
  ]
  personalTypes.forEach((type) => {
    const option = document.createElement("option")
    option.value = type
    option.textContent = type
    personalTypeSelect.appendChild(option)
  })

  // --- Add "ไม่เคยเสนอขอพระราชทานเครื่องราชฯ" ---
  // Moved *inside* updateLastInsCode

  // --- Hierarchy Logic (pos_type and pos_lev) ---

  function updatePosType() {
    const selectedPersonalType = personalTypeSelect.value

    // Filter pos_type based on personal_type
    const filteredPosTypes = data.decorData
      .filter((item) => item.personal_type === selectedPersonalType)
      .map((item) => item.pos_type)
      .filter(Boolean) // Remove null

    const uniquePosTypes = [...new Set(filteredPosTypes)] // Remove duplicates

    // Clear existing options (except the initial blank option)
    while (positionTypeSelect.options.length > 1) {
      positionTypeSelect.remove(1)
    }

    // Add "ไม่ระบุ" option if applicable
    if (
      data.decorData.some(
        (item) =>
          item.personal_type === selectedPersonalType && item.pos_type === null
      )
    ) {
      const option = document.createElement("option")
      option.value = "ไม่ระบุ"
      option.textContent = "ไม่ระบุ"
      positionTypeSelect.appendChild(option)
    }

    // Populate with filtered pos_types
    uniquePosTypes.forEach((type) => {
      const option = document.createElement("option")
      option.value = type
      option.textContent = type
      positionTypeSelect.appendChild(option)
    })

    updatePosLev() // Trigger update of pos_lev
  }

  function updatePosLev() {
    const selectedPersonalType = personalTypeSelect.value
    const selectedPosType = positionTypeSelect.value

    // Filter pos_lev based on personal_type and pos_type
    const filteredPosLevs = data.decorData
      .filter(
        (item) =>
          item.personal_type === selectedPersonalType &&
          (item.pos_type === selectedPosType ||
            (item.pos_type === null && selectedPosType === "ไม่ระบุ"))
      )
      .map((item) => item.pos_lev)
      .filter(Boolean) // Remove null and undefined

    const uniquePosLevs = [...new Set(filteredPosLevs)]

    // Clear existing options (except the initial blank option)
    while (positionLevelSelect.options.length > 1) {
      positionLevelSelect.remove(1)
    }

    // Add "ไม่ระบุ" option if applicable and not already present
    if (
      data.decorData.some(
        (item) =>
          item.personal_type === selectedPersonalType &&
          item.pos_type === selectedPosType &&
          item.pos_lev === null
      )
    ) {
      const option = document.createElement("option")
      option.value = "ไม่ระบุ"
      option.textContent = "ไม่ระบุ"
      positionLevelSelect.appendChild(option)
    }

    // Populate with filtered pos_levs
    uniquePosLevs.forEach((level) => {
      const option = document.createElement("option")
      option.value = level
      option.textContent = level
      positionLevelSelect.appendChild(option)
    })

    updateLastInsCode() // Trigger update of last_ins_code
  }

  function updateLastInsCode() {
    const selectedPosType = positionTypeSelect.value
    const selectedPosLev = positionLevelSelect.value

    // Get highest ins_code_order for the selected pos_lev
    const highestOrders = getHighestOrders(data)
    const highestOrder = highestOrders[selectedPosType + selectedPosLev] || 0 // Handle undefined

    // Filter decorations based on pos_type (and pos_lev indirectly via highestOrder)
    const filteredDecorations = data.decorData.filter(
      (item) =>
        (item.pos_type === selectedPosType ||
          (item.pos_type === null && selectedPosType === "ไม่ระบุ")) &&
        item.ins_code_order <= highestOrder // Key change:  <= highestOrder
    )

    // Get unique ins_code_name_full values and sort by ins_code_order
    const uniqueDecorations = [
      ...new Set(filteredDecorations.map((item) => item.ins_code_name_full)),
    ]
    uniqueDecorations.sort((a, b) => {
      const orderA = filteredDecorations.find(
        (item) => item.ins_code_name_full === a
      )?.ins_code_order
      const orderB = filteredDecorations.find(
        (item) => item.ins_code_name_full === b
      )?.ins_code_order
      return (orderA || 0) - (orderB || 0) // Handle undefined order
    })

    // Clear existing options (except the default "never requested" option)
    while (decorationCodeSelect.options.length > 1) {
      decorationCodeSelect.remove(1)
    }

    // // --- Add "ไม่เคยเสนอขอพระราชทานเครื่องราชฯ" here ---
    const defaultOption = document.createElement("option")
    defaultOption.value = "null" // Use actual null value
    defaultOption.textContent = "ไม่เคยได้รับพระราชทานเครื่องราชฯ"
    decorationCodeSelect.appendChild(defaultOption)

    // Populate with filtered and sorted decorations
    uniqueDecorations.forEach((code) => {
      const option = document.createElement("option")
      option.value = code
      option.textContent = code
      decorationCodeSelect.appendChild(option)
    })
  }

  // --- Event Listeners for Hierarchy ---
  personalTypeSelect.addEventListener("change", updatePosType)
  positionTypeSelect.addEventListener("change", updatePosLev)
  positionLevelSelect.addEventListener("change", updateLastInsCode)

  // --- Initial Population ---
  updatePosType() // Start cascading updates
}

// --- Date Validation Function ---
function isValidDate(dateString) {
  if (!dateString) return true // Allow empty
  const parts = dateString.split("/")
  if (parts.length !== 3) return false

  const day = parseInt(parts[0], 10)
  const month = parseInt(parts[1], 10)
  const year = parseInt(parts[2], 10)

  if (isNaN(day) || isNaN(month) || isNaN(year)) return false
  if (day < 1 || day > 31) return false
  if (month < 1 || month > 12) return false
  if (year < 1000 || year > 9999) return false // Adjust
  // Add more robust date checks here (e.g., leap year, days in month) if needed

  return true
}

// --- Reset Form Function ---
function resetForm() {
  document.getElementById("searchForm").reset()

  // Reset selects to default state, triggering updates
  document.getElementById("personal_type").value = ""
  document.getElementById("personal_type").dispatchEvent(new Event("change")) // Trigger change
  // Clear error messages
  clearAllErrors()
}
// --- Clear All Error Messages ---
function clearAllErrors() {
  const errorDivs = document.querySelectorAll(".invalid-feedback")
  errorDivs.forEach((div) => {
    div.textContent = ""
    div.style.display = "none"
  })

  // Remove the 'is-invalid' class from all form controls
  const formControls = document.querySelectorAll(".form-control, .form-select")
  formControls.forEach((control) => {
    control.classList.remove("is-invalid")
  })
}
// --- Validate Form ---
function validateForm() {
  let isValid = true
  const form = document.getElementById("searchForm")

  // --- Helper function to show error messages ---
  function showError(inputElement, message) {
    const errorDiv = document.getElementById(inputElement.id + "_error")
    errorDiv.textContent = message
    errorDiv.style.display = "block"
    inputElement.classList.add("is-invalid")
    isValid = false // Set overall validity to false
  }

  // --- Required Fields Check ---
  const requiredFields = [
    "personal_type",
    "pos_type",
    "pos_lev",
    "beg_pos_date",
    "salary",
  ]
  requiredFields.forEach((fieldId) => {
    const inputElement = document.getElementById(fieldId)
    // For select elements, we check against both "" (initial state) and "null" (for "never requested")
    // For text/number inputs, an empty string is invalid
    if (
      !inputElement.value ||
      inputElement.value.trim() === "" ||
      inputElement.value === "null"
    ) {
      showError(inputElement, "กรุณากรอกข้อมูลในช่องนี้")
      isValid = false
    }
  })

  // --- Date Validation (if provided) ---
  const dateFields = ["beg_pos_date", "pos_lev_date", "last_ins_date"]
  dateFields.forEach((fieldId) => {
    const inputElement = document.getElementById(fieldId)
    if (inputElement.value && !isValidDate(inputElement.value)) {
      showError(inputElement, "กรุณากรอกวันที่ในรูปแบบ วว/ดด/ปปปป")
      isValid = false
    }
  })

  // --- Number Validation (if provided) ---
  const numberFields = ["salary", "salary5y"]
  numberFields.forEach((fieldId) => {
    const inputElement = document.getElementById(fieldId)
    if (inputElement.value && isNaN(parseFloat(inputElement.value))) {
      showError(inputElement, "กรุณากรอกตัวเลขที่ถูกต้อง")
      isValid = false
    }
  })

  return isValid
}

// --- Main Calculation Function ---
async function calculateDecoration(formData) {
  const data = await fetchData()
  if (!data) return null // fetchData handles error display

  const {
    personal_type_input,
    pos_type_input,
    pos_lev_input,
    beg_pos_date_input,
    pos_lev_date_input,
    salary_input,
    salary5y_input,
    last_ins_code_name_full_input,
    last_ins_date_input,
  } = formData

  const END_DATE_MAY = "28/05/" + (new Date().getFullYear() + 543)
  const END_DATE_JULY = "28/07/" + (new Date().getFullYear() + 543)

  // Calculate periods only if date inputs are provided
  const beg_pos_period_input = beg_pos_date_input
    ? calculatePeriodInYears(beg_pos_date_input, END_DATE_MAY)
    : null
  const pos_lev_period_input = pos_lev_date_input
    ? calculatePeriodInYears(pos_lev_date_input, END_DATE_MAY)
    : null
  const last_ins_period_input = last_ins_date_input
    ? calculatePeriodInYears(last_ins_date_input, END_DATE_JULY)
    : null

  const highestOrders = getHighestOrders(data)
  const highestOrderOfPosLev =
    highestOrders[pos_type_input + pos_lev_input] || 0

  // --- Filter based on form input, only if the input is provided ---
  let filteredData = data.decorData.filter((item) => {
    // --- Basic matching (required fields) ---
    if (personal_type_input && item.personal_type !== personal_type_input)
      return false

    if (
      pos_type_input &&
      !(
        item.pos_type === pos_type_input ||
        (item.pos_type === null && pos_type_input === "ไม่ระบุ")
      )
    )
      return false

    if (
      pos_lev_input &&
      !(
        item.pos_lev === pos_lev_input ||
        (item.pos_lev === null && pos_lev_input === "ไม่ระบุ")
      )
    )
      return false

    // --- Period and Salary checks (only if input is provided) ---
    if (
      beg_pos_date_input &&
      !checkBegPosPeriodCondition(beg_pos_period_input, item.beg_pos_period)
    )
      return false
    if (
      pos_lev_date_input &&
      !checkPosLevPeriodCondition(pos_lev_period_input, item.pos_lev_period)
    )
      return false
    if (salary_input && !checkSalaryCondition(salary_input, item.salary))
      return false
    if (
      salary5y_input &&
      !checkSalary5yCondition(salary5y_input, item.salary5y)
    )
      return false
    if (
      last_ins_date_input &&
      !checkLastInsPeriodCondition(last_ins_period_input, item.last_ins_period)
    )
      return false

    // --- last_ins_code check (handle null/not selected) ---
    const effectiveLastInsCode =
      last_ins_code_name_full_input === "null" || !last_ins_code_name_full_input
        ? null
        : last_ins_code_name_full_input
    if (item.last_ins_code && effectiveLastInsCode) {
      const selectedLastInsOrder = getInsCodeOrder(data, effectiveLastInsCode)
      if (selectedLastInsOrder === null) {
        return false // Could be an error
      }
      // Find an item with same id and check ins_code
      let findItemMatchId = data.decorData.find((i) => i.id === item.id)
      if (findItemMatchId) {
        if (item.last_ins_code !== findItemMatchId.ins_code) return false
      }
    }

    return true // All checks passed for this item
  })

  // --- 3.4 & 3.5 Highest Level & Consecutive Year Check ---
  const currentYear = new Date().getFullYear() + 543
  const lastInsYear = last_ins_date_input
    ? parseInt(last_ins_date_input.split("/")[2], 10)
    : 0 // Safe check

  // --- Highest Level Check (Simplified) ---
  // We only need to check *one* item with ins_code_highest_of_pos_lev === "highest"
  // for the selected pos_type and pos_lev.  No need to loop through all filteredData.
  const highestLevelItem = data.decorData.find(
    (item) =>
      item.pos_type === pos_type_input &&
      item.pos_lev === pos_lev_input &&
      item.ins_code_highest_of_pos_lev === "highest"
  )

  if (highestLevelItem && lastInsYear + 1 >= currentYear) {
    return "ได้รับพระราชทานเครื่องราชฯ ชั้นสูงสุดของระดับตำแหน่งแล้ว"
  }

  // Check for consecutive year request *only if* not already at the highest level
  if (!highestLevelItem && lastInsYear + 1 === currentYear) {
    return "ไม่เสนอขอพระราชทานเครื่องราชฯ ในปีติดกัน"
  }

  // --- 3.6 Find Matching Decoration (Final Selection) ---
  if (filteredData.length > 0) {
    let selectedDecoration = null

    // If "never requested" or no selection, find the *first* (lowest order) within the highest
    if (
      !last_ins_code_name_full_input ||
      last_ins_code_name_full_input === "null"
    ) {
      selectedDecoration = filteredData.reduce((prev, current) => {
        return prev.ins_code_order < current.ins_code_order &&
          current.ins_code_order <= highestOrderOfPosLev
          ? prev
          : current
      }, filteredData[0])
    } else {
      // If a previous decoration is selected, find the next higher ins_code_order
      const lastInsOrder = getInsCodeOrder(data, last_ins_code_name_full_input)
      selectedDecoration = filteredData.find(
        (item) =>
          item.ins_code_order > lastInsOrder &&
          item.ins_code_order <= highestOrderOfPosLev
      )
    }

    if (selectedDecoration) {
      return (
        "เครื่องราชอิสริยาภรณ์ชั้นถัดไป: " +
        selectedDecoration.ins_code_name_full
      )
    }
  }

  // --- 3.7 No Match ---
  return "คุณสมบัติยังไม่ถึงเกณฑ์"
}

// --- Form Submission Handler ---
async function handleSubmit() {
  // Collect form data, handling null/empty values
  const formData = {
    personal_type_input: document.getElementById("personal_type").value || null,
    pos_type_input:
      document.getElementById("pos_type").value === "ไม่ระบุ"
        ? null
        : document.getElementById("pos_type").value || null,
    pos_lev_input:
      document.getElementById("pos_lev").value === "ไม่ระบุ"
        ? null
        : document.getElementById("pos_lev").value || null,
    beg_pos_date_input: document.getElementById("beg_pos_date").value || null,
    pos_lev_date_input: document.getElementById("pos_lev_date").value || null,
    salary_input: parseFloat(document.getElementById("salary").value) || null,
    salary5y_input:
      parseFloat(document.getElementById("salary5y").value) || null,
    last_ins_code_name_full_input:
      document.getElementById("last_ins_code").value === "null"
        ? null
        : document.getElementById("last_ins_code").value || null, // Handle "null" string and empty
    last_ins_date_input: document.getElementById("last_ins_date").value || null,
  }

  // Call calculateDecoration and display result with SweetAlert2
  const result = await calculateDecoration(formData)
  if (result) {
    if (result.startsWith("เครื่องราช")) {
      Swal.fire({
        icon: "success",
        title: "ผลการตรวจสอบ",
        text: result,
      })
    } else {
      Swal.fire({
        icon: "info", // Use 'info' for other messages
        title: "ผลการตรวจสอบ",
        text: result,
      })
    }
  }
}
