function toGregorianYear(year) {
  if (typeof year !== 'number' || Number.isNaN(year)) {
    return null;
  }
  return year >= 2400 ? year - 543 : year;
}

function toBuddhistYear(year) {
  if (typeof year !== 'number' || Number.isNaN(year)) {
    return null;
  }
  return year >= 2400 ? year : year + 543;
}

function normalizePickerDate(pickerDate) {
  if (!pickerDate) return null;

  const getPart = (part) => {
    const value = pickerDate[part];
    if (typeof value === 'number') {
      return value;
    }
    if (typeof value === 'function') {
      try {
        return value.call(pickerDate);
      } catch (error) {
        return null;
      }
    }
    return null;
  };

  const rawYear = getPart('year');
  const rawMonth = getPart('month');
  const rawDate = getPart('date');

  if (rawYear === null || rawMonth === null || rawDate === null) {
    return null;
  }

  const gregorianYear = toGregorianYear(rawYear);
  if (gregorianYear === null) {
    return null;
  }

  return new Date(gregorianYear, rawMonth, rawDate);
}

function formatDateAsBuddhist(date) {
  if (!(date instanceof Date)) {
    return '';
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = toBuddhistYear(date.getFullYear());
  if (year === null) {
    return '';
  }

  return `${day}/${month}/${year}`;
}

function writeDateToInput(element, date, options = {}) {
  if (!element) {
    return;
  }

  const { dispatchInput = true } = options;

  if (!date) {
    element.value = '';
    return;
  }

  const formattedDate = formatDateAsBuddhist(date);
  if (!formattedDate) {
    return;
  }

  element.value = formattedDate;
  if (dispatchInput) {
    element.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

/**
 * Checks if the selected date is the same as the stored date
 * Handles year normalization for CE vs BE year formats from Tempus Dominus
 * @param {Date|null} storedDate - Previously stored Date object (CE format)
 * @param {Object} eventDate - Event date object from Tempus Dominus
 * @param {number} eventDate.year - Year (can be CE or BE)
 * @param {number} eventDate.month - Month (0-11)
 * @param {number} eventDate.date - Day (1-31)
 * @returns {boolean} True if dates are the same
 */
function isSameDateSelected(storedDate, eventDate) {
  if (!storedDate || !eventDate) {
    return false;
  }

  // Normalize event year to CE for comparison
  // Tempus Dominus may provide CE (2025) or BE (2568) year
  let selectedYearCE = eventDate.year;
  if (eventDate.year >= 2500) {
    // Buddhist Era year - convert to CE
    selectedYearCE = eventDate.year - 543;
  }

  // Compare all components
  return storedDate.getFullYear() === selectedYearCE &&
         storedDate.getMonth() === eventDate.month &&
         storedDate.getDate() === eventDate.date;
}

function setupDatePickerForElement(element) {
  if (!element) return null;

  element.readOnly = true;

  const datePicker = new tempusDominus.TempusDominus(element, {
    display: {
      viewMode: 'calendar',
      components: {
        decades: true,
        year: true,
        month: true,
        date: true,
        hours: false,
        minutes: false,
        seconds: false,
      },
      icons: {
        type: 'icons',
        time: 'fa fa-clock',
        date: 'fa fa-calendar',
        up: 'fa fa-arrow-up',
        down: 'fa fa-arrow-down',
        previous: 'fa fa-chevron-left',
        next: 'fa fa-chevron-right',
        today: 'fa fa-calendar-check',
        clear: 'fa fa-trash',
        close: 'fa fa-xmark',
      },
      buttons: {
        today: true,
        clear: true,
        close: true,
      },
    },
    localization: {
      locale: 'th',
      format: 'dd/MM/yyyy',
      dayViewHeaderFormat: { month: 'long', year: 'numeric' },
      startOfTheWeek: 0,
    },
    useCurrent: false,
  });

  // Enhanced same-date protection
  element._isSameDateOperation = false;
  element._sameDateEndTime = 0;
  element._expectedBE = '';

  datePicker.subscribe(tempusDominus.Namespace.events.change, (event) => {
    // Same-date detection - prevent unnecessary updates
    if (event.date && element._storedDate) {
      if (isSameDateSelected(element._storedDate, event.date)) {
        // Same date selected - set protection and expected BE value
        element._isSameDateOperation = true;
        element._sameDateEndTime = Date.now() + 3000; // 3 seconds protection
        element._expectedBE = formatDateAsBuddhist(element._storedDate);

        // Immediately set BE format
        if (element.value !== element._expectedBE) {
          element.value = element._expectedBE;
        }

        return;
      }
    }

    // Clear same-date protection for new dates
    element._isSameDateOperation = false;
    element._sameDateEndTime = 0;

    if (event.date) {
      const normalizedDate = normalizePickerDate(event.date);
      if (normalizedDate) {
        element._storedDate = normalizedDate;
        writeDateToInput(element, normalizedDate);
      }
      return;
    }

    if (event.isClear) {
      element._storedDate = null;
      element.value = '';
      return;
    }

    const fallbackDate = normalizePickerDate(event.oldDate) || element._storedDate;
    if (fallbackDate) {
      element._storedDate = fallbackDate;
      writeDateToInput(element, fallbackDate);
    }
  });

  datePicker.subscribe(tempusDominus.Namespace.events.show, () => {
    const tempStoredDate = element._storedDate
      ? new Date(element._storedDate.getTime())
      : null;

    datePicker.dates.clear();

    if (tempStoredDate) {
      element._storedDate = tempStoredDate;
      datePicker.dates.setValue(tempusDominus.DateTime.convert(tempStoredDate));
      // CRITICAL: dates.setValue() updates input with CE format
      // Must restore BE format immediately after
      writeDateToInput(element, tempStoredDate, { dispatchInput: false });
    }
  });

  // REVOLUTIONARY FIX: Pre-emptively override picker's value writing mechanism
  // Hook into the picker's internal methods before they can write CE format

  // Store original methods
  const originalSetValue = datePicker.dates.setValue;
  const originalWriteDateToInput = writeDateToInput;

  // Override the picker's setValue method to prevent CE format
  datePicker.dates.setValue = function(...args) {
    const result = originalSetValue.apply(this, args);

    // Immediately after picker sets value, restore BE format
    setTimeout(() => {
      if (element._storedDate) {
        const expectedBE = formatDateAsBuddhist(element._storedDate);
        if (element.value !== expectedBE) {
          // Use direct assignment to avoid triggering picker again
          const originalSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
          originalSetter.call(element, expectedBE);
        }
      }
    }, 0);

    return result;
  };

  // Override writeDateToInput to prevent CE format during same-date operations
  window.writeDateToInput = function(inputElement, date, options = {}) {
    if (inputElement === element && element._isSameDateOperation && date) {
      // During same-date operations, only write the expected BE format
      const expectedBE = formatDateAsBuddhist(date);
      if (inputElement.value !== expectedBE) {
        const originalSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
        originalSetter.call(inputElement, expectedBE);

        // Don't dispatch events during same-date operations to avoid triggering picker
        if (options.dispatchInput !== false) {
          setTimeout(() => {
            inputElement.dispatchEvent(new Event('input', { bubbles: true }));
          }, 10);
        }
      }
      return;
    }

    // Use original function for normal operations
    return originalWriteDateToInput(inputElement, date, options);
  };

  // CONTINUOUS MONITORING: Lightweight real-time monitoring
  let lastValue = element.value;
  let monitoringInterval = null;

  const startMonitoring = () => {
    if (monitoringInterval) return;

    monitoringInterval = setInterval(() => {
      const now = Date.now();
      const isInSameDateProtection = element._isSameDateOperation && now < element._sameDateEndTime;

      if (element.value !== lastValue) {
        lastValue = element.value;

        // Check if CE format appeared
        if (element._storedDate && element.value) {
          const yearMatch = element.value.match(/(\d{4})$/);

          if (yearMatch && parseInt(yearMatch[1]) < 2400) {
            // Immediately restore BE format
            const targetBE = isInSameDateProtection ? element._expectedBE : formatDateAsBuddhist(element._storedDate);

            if (element.value !== targetBE) {
              const originalSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
              originalSetter.call(element, targetBE);
              lastValue = targetBE;
            }
          }
        }
      }

      // Extra protection during same-date operations
      if (isInSameDateProtection && element._expectedBE && element.value !== element._expectedBE) {
        const originalSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
        originalSetter.call(element, element._expectedBE);
        lastValue = element._expectedBE;
      }

    }, 16); // ~60fps monitoring
  };

  const stopMonitoring = () => {
    if (monitoringInterval) {
      clearInterval(monitoringInterval);
      monitoringInterval = null;
    }
  };

  // Start monitoring
  startMonitoring();

  // Store monitoring reference for cleanup
  element._monitoringInterval = monitoringInterval;
  element._stopMonitoring = stopMonitoring;

  const toggleSelector = `[data-target="#${element.id}"]`;
  const toggleBtn = document.querySelector(toggleSelector);
  if (toggleBtn) {
    const replacement = toggleBtn.cloneNode(true);
    toggleBtn.parentNode.replaceChild(replacement, toggleBtn);
    replacement.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      datePicker.toggle();
    });
  }

  element._datePicker = datePicker;
  return datePicker;
}


document.addEventListener("DOMContentLoaded", function () {
  // --- Form Submission ---
  const form = document.getElementById("searchForm")
  form.addEventListener("submit", async function (event) {
    event.preventDefault()
    try {
      // Validate form before proceeding
      if (!validateForm()) {
        return // Stop if validation fails
      }

      // Show loading state
      const submitButton = form.querySelector('button[type="submit"]')
      submitButton.disabled = true
      submitButton.innerHTML =
        '<i class="fas fa-spinner fa-spin me-2"></i>กำลังประมวลผล...'

      // Collect form data and convert empty strings to null
      const formData = {
        personal_type_input: emptyToNull(
          document.getElementById("personal_type").value
        ),
        pos_type_input:
          emptyToNull(document.getElementById("pos_type").value) === "ไม่ระบุ"
            ? null
            : emptyToNull(document.getElementById("pos_type").value),
        pos_lev_input:
          emptyToNull(document.getElementById("pos_lev").value) === "ไม่ระบุ"
            ? null
            : emptyToNull(document.getElementById("pos_lev").value),
        beg_pos_date_input: emptyToNull(
          document.getElementById("beg_pos_date").value
        ),
        pos_lev_date_input: emptyToNull(
          document.getElementById("pos_lev_date").value
        ),
        salary_input:
          parseFloat(document.getElementById("salary").value) || null,
        salary5y_input:
          parseFloat(document.getElementById("salary5y").value) || null,
        last_ins_code_name_full_input:
          emptyToNull(document.getElementById("last_ins_code").value) === "null"
            ? null
            : emptyToNull(document.getElementById("last_ins_code").value),
        last_ins_date_input: emptyToNull(
          document.getElementById("last_ins_date").value
        ),
      }

      // Calculate decoration and show result with updated styling
      const result = await calculateDecoration(formData)
      if (result) {
        await Swal.fire({
          icon: result.startsWith("เครื่องราช") ? "success" : "info",
          title: "ผลการตรวจสอบ",
          text: result,
          confirmButtonText: "ตกลง",
          // Add custom styling options
          customClass: {
            popup: "swal2-custom-popup",
            title: "swal2-custom-title",
            confirmButton: "btn btn-primary swal2-custom-button",
          },
          buttonsStyling: false,
          showClass: {
            popup: "animate__animated animate__fadeIn",
          },
          hideClass: {
            popup: "animate__animated animate__fadeOut",
          },
        })
      }
    } catch (error) {
      console.error("Error:", error)
      await Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "กรุณาลองใหม่อีกครั้ง",
        confirmButtonText: "ตกลง",
        // Add custom styling options
        customClass: {
          popup: "swal2-custom-popup",
          title: "swal2-custom-title",
          confirmButton: "btn btn-danger swal2-custom-button",
        },
        buttonsStyling: false,
      })
    } finally {
      // Reset button state
      const submitButton = form.querySelector('button[type="submit"]')
      submitButton.disabled = false
      submitButton.innerHTML =
        '<i class="fas fa-search me-2"></i>ตรวจสอบเครื่องราชฯ'
    }
  })

  // --- Utility Function: Convert empty strings to null ---
  function emptyToNull(value) {
    return value === "" ? null : value
  }

  // --- Calculate and set salary5y_year ---
  const currentYearBE = new Date().getFullYear() + 543
  document.getElementById("salary5y_year").textContent = currentYearBE - 5

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

  // --- Input Blur and Input Event Listeners (for immediate validation) ---
  document.querySelectorAll(".form-control, .form-select").forEach((input) => {
    input.addEventListener("blur", function (event) {
      const form = document.getElementById("searchForm")
      const errorDiv = document.getElementById(input.id + "_error")

      if (input.required && !input.value) {
        form.classList.add("was-validated") // Trigger validation only if truly empty
      } else if (input.id === "last_ins_code" && input.value === "null") {
        // Special handling for "never requested" on blur.
        input.classList.remove("is-invalid")
        if (errorDiv) {
          errorDiv.textContent = ""
          errorDiv.style.display = "none"
        }

        // Check other errors and potentially remove was-validated
        let hasErrors = false
        document
          .querySelectorAll(".form-control[required], .form-select[required]")
          .forEach((reqInput) => {
            if (
              !reqInput.value ||
              (reqInput.id === "last_ins_code" && reqInput.value === "null")
            ) {
              hasErrors = true
            }
          })
        if (!hasErrors) {
          form.classList.remove("was-validated")
        }
      }
    })
    input.addEventListener("input", function (event) {
      const form = document.getElementById("searchForm")
      const errorDiv = document.getElementById(input.id + "_error")

      if (input.value) {
        input.classList.remove("is-invalid")
        input.classList.add("is-valid")
        setTimeout(() => {
          input.classList.remove("is-valid")
        }, 0)

        if (errorDiv) {
          errorDiv.textContent = ""
          errorDiv.style.display = "none"
        }

        let hasErrors = false
        document
          .querySelectorAll(".form-control[required], .form-select[required]")
          .forEach((reqInput) => {
            if (
              !reqInput.value ||
              (reqInput.id === "last_ins_code" && reqInput.value === "null")
            ) {
              hasErrors = true
            }
          })

        if (!hasErrors) {
          form.classList.remove("was-validated")
        }
      } else if (input.required) {
        input.classList.add("is-invalid")
        if (errorDiv) {
          errorDiv.textContent = "กรุณากรอกข้อมูลในช่องนี้"
          errorDiv.style.display = "block"
        }
      }
    })
  })

  // Initialize date pickers
  const dateFields = ['beg_pos_date', 'pos_lev_date', 'last_ins_date'];

  dateFields.forEach((fieldId) => {
    const element = document.getElementById(fieldId);
    if (!element) return;
    setupDatePickerForElement(element);
  });
});

// --- Helper Functions ---

// Calculate period in years between two dates (dd/mm/yyyy)
function calculatePeriodInYears(startDateStr, endDateStr) {
  if (!startDateStr || !endDateStr) return null // Handle null/empty
  // Use Moment.js for accurate date calculations, and set to Thai locale
  const startDate = moment(startDateStr, "DD/MM/YYYY")
  const endDate = moment(endDateStr, "DD/MM/YYYY")

  if (!startDate.isValid() || !endDate.isValid()) return null // Handle invalid dates

  return endDate.diff(startDate, "years", true) // 'true' for floating-point result
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
    await Swal.fire({
      icon: "error",
      title: "เกิดข้อผิดพลาด",
      text: "ไม่สามารถโหลดข้อมูลได้: " + error.message,
      confirmButtonText: "ตกลง",
      // Add custom styling options
      customClass: {
        popup: "swal2-custom-popup",
        title: "swal2-custom-title",
        confirmButton: "btn btn-danger swal2-custom-button",
      },
      buttonsStyling: false,
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

    //  --- Add "ไม่เคยเสนอขอพระราชทานเครื่องราชฯ" here ---
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

// --- Date Validation Function (with Moment.js) ---
function isValidDate(dateString) {
  if (!dateString) return true // Allow empty

  // Enhanced validation for Buddhist Era dates
  // Try parsing with Moment.js first (handles both CE and BE dates with 'th' locale)
  if (moment(dateString, "DD/MM/YYYY", true).isValid()) {
    return true
  }

  // Special handling for Buddhist Era dates
  // Extract year to check if it's a Buddhist Era year
  const dateParts = dateString.split('/')
  if (dateParts.length !== 3) return false

  const day = parseInt(dateParts[0], 10)
  const month = parseInt(dateParts[1], 10)
  const year = parseInt(dateParts[2], 10)

  // Check basic validity of day, month, year
  if (isNaN(day) || isNaN(month) || isNaN(year)) return false
  if (day < 1 || day > 31) return false
  if (month < 1 || month > 12) return false
  if (year < 2400) return false // Buddhist Era years start around 2400

  // Convert Buddhist Era year to Christian Era for validation
  const ceYear = year - 543
  const ceDateString = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${ceYear}`

  // Validate the converted Christian Era date
  return moment(ceDateString, "DD/MM/YYYY", true).isValid()
}

// --- Reset Form Function ---
function resetForm() {
  const form = document.getElementById("searchForm")
  form.reset()

  // Remove validation classes
  form.classList.remove("was-validated")
  document.querySelectorAll(".form-control, .form-select").forEach((input) => {
    input.classList.remove("is-invalid")
    input.classList.remove("is-valid") // Remove is-valid too
  })
  // Clear error messages
  clearAllErrors()

  // Reset selects to default state, triggering updates
  document.getElementById("personal_type").value = ""
  document.getElementById("personal_type").dispatchEvent(new Event("change")) // Trigger change
  // Reset last_ins_code as well
  document.getElementById("last_ins_code").value = "" // Set to default empty value.
  document.getElementById("last_ins_code").dispatchEvent(new Event("change")) // Trigger the change.

  // Refresh date pickers to maintain Buddhist Era display after form reset
  refreshDatePickers()
}

// Function to refresh date picker instances after form reset
function refreshDatePickers() {
  const dateFields = ['beg_pos_date', 'pos_lev_date', 'last_ins_date'];

  dateFields.forEach((fieldId) => {
    const element = document.getElementById(fieldId);
    if (!element) {
      return;
    }

    // Clean up monitoring interval if it exists
    if (element._stopMonitoring) {
      element._stopMonitoring();
      element._stopMonitoring = null;
    }

    if (element._datePicker) {
      element._datePicker.dispose();
    }

    element.value = '';
    element._storedDate = null;
    element._isSameDateOperation = false;
    element._sameDateEndTime = 0;
    element._expectedBE = '';

    setupDatePickerForElement(element);
  });
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
    "last_ins_code",
  ]
  requiredFields.forEach((fieldId) => {
    const inputElement = document.getElementById(fieldId)

    // Special handling for last_ins_code (select element).
    if (fieldId === "last_ins_code") {
      if (!inputElement.value) {
        // เช็ค *เฉพาะ* empty string ("")
        showError(
          inputElement,
          "กรุณาเลือกเครื่องราชฯ หรือ ไม่เคยได้รับพระราชทานเครื่องราชฯ"
        )
        isValid = false
      }
    } else {
      // For other required fields (not last_ins_code).
      if (
        !inputElement.value ||
        inputElement.value.trim() === ""
      ) {
        showError(inputElement, "กรุณากรอกข้อมูลในช่องนี้")
        isValid = false
      }
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
  if (!data) {
    return null
  }

  const {
    personal_type_input,
    pos_type_input,
    pos_lev_input,
    last_ins_code_name_full_input,
    last_ins_date_input,
    beg_pos_date_input,
    pos_lev_date_input,
    salary_input,
    salary5y_input,
  } = formData

  // --- 1. Calculate service period ---
  const currentYearBE = new Date().getFullYear() + 543
  const begPosYearBE = beg_pos_date_input
    ? parseInt(beg_pos_date_input.split("/")[2], 10)
    : 0
  const begPosPeriodYears = begPosYearBE ? currentYearBE - begPosYearBE : 0

  // (Removed the early check for beg_pos_period.)

  // --- 2. Check if highest decoration already awarded ---
  if (
    last_ins_code_name_full_input &&
    last_ins_code_name_full_input !== "null"
  ) {
    const selectedLastInsCodeData = data.decorData.find(
      (item) =>
        item.personal_type === personal_type_input &&
        (item.pos_type === pos_type_input ||
          (item.pos_type === null && pos_type_input === "ไม่ระบุ")) &&
        (item.pos_lev === pos_lev_input ||
          (item.pos_lev === null && pos_lev_input === "ไม่ระบุ")) &&
        item.ins_code_name_full === last_ins_code_name_full_input
    )

    if (
      selectedLastInsCodeData &&
      selectedLastInsCodeData.ins_code_highest_of_pos_lev === "highest"
    ) {
      return "ได้รับพระราชทานเครื่องราชฯ ชั้นสูงสุดของระดับตำแหน่งแล้ว"
    }
  }

  // --- 3. Calculate periods for pos_lev and last_ins ---
  const endDatePosLev = `28/05/${currentYearBE}`
  const endDateLastIns = `28/07/${currentYearBE}`

  const pos_lev_period_input_calc = pos_lev_date_input
    ? calculatePeriodInYears(pos_lev_date_input, endDatePosLev)
    : null
  const last_ins_period_input_calc = last_ins_date_input
    ? calculatePeriodInYears(last_ins_date_input, endDateLastIns)
    : null

  // --- 4. Get highest possible decoration order for the selected level ---
  const highestOrders = getHighestOrders(data)
  const highestOrderOfPosLev =
    highestOrders[pos_type_input + pos_lev_input] || 0

  // --- 5. Check if decoration was already requested in consecutive years ---
  if (last_ins_date_input) {
    const lastInsYearBE = parseInt(last_ins_date_input.split("/")[2], 10)
    if (lastInsYearBE + 1 === currentYearBE) {
      return "ไม่เสนอขอพระราชทานเครื่องราชฯ ในปีติดกัน"
    }
  }

  // --- 6. Filter eligible decorations ---
  let filteredData = data.decorData.filter((item) => {
    // Basic criteria matching
    if (item.personal_type !== personal_type_input) return false
    if (item.pos_type !== null && item.pos_type !== pos_type_input) return false
    if (item.pos_lev !== null && item.pos_lev !== pos_lev_input) return false

    // **** NEW: Check that service period satisfies the rule's beg_pos_period condition ****
    if (
      item.beg_pos_period &&
      !checkPeriodCondition(begPosPeriodYears, item.beg_pos_period)
    )
      return false

    // Additional period and salary checks (if specified)
    if (
      item.pos_lev_period &&
      !checkPosLevPeriodCondition(
        pos_lev_period_input_calc,
        item.pos_lev_period
      )
    )
      return false
    if (item.salary && !checkSalaryCondition(salary_input, item.salary))
      return false
    if (item.salary5y && !checkSalary5yCondition(salary5y_input, item.salary5y))
      return false
    if (
      item.last_ins_period &&
      !checkLastInsPeriodCondition(
        last_ins_period_input_calc,
        item.last_ins_period
      )
    )
      return false

    // Special handling for last decoration received
    if (
      last_ins_code_name_full_input === "null" ||
      !last_ins_code_name_full_input
    ) {
      return item.last_ins_code === null
    } else {
      const currentInsOrder = getInsCodeOrder(
        data,
        last_ins_code_name_full_input
      )
      return (
        item.ins_code_order > currentInsOrder &&
        item.ins_code_order <= highestOrderOfPosLev
      )
    }
  })

  // --- 7. Select the appropriate decoration from eligible ones ---
  let selectedDecoration = null
  if (filteredData.length > 0) {
    filteredData.sort((a, b) => a.ins_code_order - b.ins_code_order)
    selectedDecoration = filteredData[0]
  }

  // --- 8. Return the result ---
  if (selectedDecoration) {
    return (
      "เครื่องราชอิสริยาภรณ์ชั้นถัดไป: " + selectedDecoration.ins_code_name_full
    )
  } else {
    return "คุณสมบัติไม่ถึงเกณฑ์"
  }
}

