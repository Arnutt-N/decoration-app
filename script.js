document.addEventListener("DOMContentLoaded", function () {
  // --- Form Submission ---
  const form = document.getElementById("searchForm");
  form.addEventListener("submit", async function (event) {
      event.preventDefault();
      try {
          // Validate form before proceeding
          if (!validateForm()) {
              return; // Stop if validation fails
          }

          // Show loading state
          const submitButton = form.querySelector('button[type="submit"]');
          submitButton.disabled = true;
          submitButton.innerHTML =
              '<i class="fas fa-spinner fa-spin me-2"></i>กำลังประมวลผล...';

          // Collect form data and convert empty strings to null
          const formData = {
              personal_type_input: emptyToNull(document.getElementById("personal_type").value),
              pos_type_input: emptyToNull(document.getElementById("pos_type").value) === "ไม่ระบุ" ? null : emptyToNull(document.getElementById("pos_type").value),
              pos_lev_input: emptyToNull(document.getElementById("pos_lev").value) === "ไม่ระบุ" ? null : emptyToNull(document.getElementById("pos_lev").value),
              beg_pos_date_input: emptyToNull(document.getElementById("beg_pos_date").value),
              pos_lev_date_input: emptyToNull(document.getElementById("pos_lev_date").value),
              salary_input: parseFloat(document.getElementById("salary").value) || null,
              salary5y_input: parseFloat(document.getElementById("salary5y").value) || null,
              last_ins_code_name_full_input: emptyToNull(document.getElementById("last_ins_code").value) === "null" ? null : emptyToNull(document.getElementById("last_ins_code").value),
              last_ins_date_input: emptyToNull(document.getElementById("last_ins_date").value),
          };


          // Calculate decoration and show result
          const result = await calculateDecoration(formData);
          if (result) {
              await Swal.fire({
                  icon: result.startsWith("เครื่องราช") ? "success" : "info",
                  title: "ผลการตรวจสอบ",
                  text: result,
                  confirmButtonText: "ตกลง",
              });
          }
      } catch (error) {
          console.error("Error:", error);
          await Swal.fire({
              icon: "error",
              title: "เกิดข้อผิดพลาด",
              text: "กรุณาลองใหม่อีกครั้ง",
              confirmButtonText: "ตกลง",
          });
      } finally {
          // Reset button state
          const submitButton = form.querySelector('button[type="submit"]');
          submitButton.disabled = false;
          submitButton.innerHTML =
              '<i class="fas fa-search me-2"></i>ตรวจสอบเครื่องราชฯ';
      }
  });

  // --- Utility Function: Convert empty strings to null ---
  function emptyToNull(value) {
      return value === "" ? null : value;
  }

  // --- Calculate and set salary5y_year ---
  const currentYearBE = new Date().getFullYear() + 543;
  document.getElementById("salary5y_year").textContent = currentYearBE - 5 ;

  // --- Populate dropdowns and set up hierarchy ---
  populateDropdowns();

  // --- Input Event Listener for Date Formatting ---
  document.querySelectorAll('.form-control[type="text"]').forEach((input) => {
      input.addEventListener("input", function (e) {
          let value = e.target.value;
          value = value.replace(/[^0-9/]/g, ""); // Allow only digits and slashes
          const slashCount = (value.match(/\//g) || []).length;
          if (slashCount > 2) {
              const lastSlashIndex = value.lastIndexOf("/");
              value = value.substring(0, lastSlashIndex);
          }
          const parts = value.split("/");
          if (parts.length > 0 && parts[0].length > 2) {
              parts[0] = parts[0].substring(0, 2); // Limit day
          }
          if (parts.length > 1 && parts[1].length > 2) {
              parts[1] = parts[1].substring(0, 2); // Limit month
          }
          if (parts.length > 2 && parts[2].length > 4) {
              parts[2] = parts[2].substring(0, 4); // Limit year
          }
          e.target.value = parts.join("/");
      });
  });

  // --- Attach resetForm to reset button ---
  document.getElementById("btnClearForm").addEventListener("click", resetForm);

  // --- Input Blur and Input Event Listeners (for immediate validation) ---
  document
      .querySelectorAll(".form-control, .form-select")
      .forEach((input) => {
          input.addEventListener("blur", function (event) {
              const form = document.getElementById("searchForm");
              const errorDiv = document.getElementById(input.id + "_error");

              if (input.required && !input.value) {
                  form.classList.add("was-validated"); // Trigger validation only if truly empty
              } else if (input.id === "last_ins_code" && input.value === "null") {
                  // Special handling for "never requested" on blur.
                  input.classList.remove("is-invalid");
                  if (errorDiv) {
                      errorDiv.textContent = "";
                      errorDiv.style.display = "none";
                  }

                  // Check other errors and potentially remove was-validated
                  let hasErrors = false;
                  document
                      .querySelectorAll(
                          ".form-control[required], .form-select[required]"
                      )
                      .forEach((reqInput) => {
                          if (
                              !reqInput.value ||
                              (reqInput.id === "last_ins_code" && reqInput.value === "null")
                          ) {
                              hasErrors = true;
                          }
                      });
                  if (!hasErrors) {
                      form.classList.remove("was-validated");
                  }
              }
          });
          input.addEventListener("input", function (event) {
              const form = document.getElementById("searchForm");
              const errorDiv = document.getElementById(input.id + "_error");

              if (input.value) {
                  input.classList.remove("is-invalid");
                  input.classList.add("is-valid");
                  setTimeout(() => {
                      input.classList.remove("is-valid");
                  }, 0);

                  if (errorDiv) {
                      errorDiv.textContent = "";
                      errorDiv.style.display = "none";
                  }

                  let hasErrors = false;
                  document
                      .querySelectorAll(
                          ".form-control[required], .form-select[required]"
                      )
                      .forEach((reqInput) => {
                          if (
                              !reqInput.value ||
                              (reqInput.id === "last_ins_code" && reqInput.value === "null")
                          ) {
                              hasErrors = true;
                          }
                      });

                  if (!hasErrors) {
                      form.classList.remove("was-validated");
                  }
              } else if (input.required) {
                  input.classList.add("is-invalid");
                  if (errorDiv) {
                      errorDiv.textContent = "กรุณากรอกข้อมูลในช่องนี้";
                      errorDiv.style.display = "block";
                  }
              }
          });
      });
});

// --- Helper Functions ---

// Calculate period in years between two dates (dd/mm/yyyy)
function calculatePeriodInYears(startDateStr, endDateStr) {
  if (!startDateStr || !endDateStr) return null; // Handle null/empty
  // Use Moment.js for accurate date calculations, and set to Thai locale
  const startDate = moment(startDateStr, "DD/MM/YYYY");
  const endDate = moment(endDateStr, "DD/MM/YYYY");

  if (!startDate.isValid() || !endDate.isValid()) return null; // Handle invalid dates

  return endDate.diff(startDate, "years", true); // 'true' for floating-point result
}

// Parse period string (e.g., ">=5,<10")
function parsePeriod(periodStr) {
  if (!periodStr) return { min: null, max: null };

  let min = null;
  let max = null;

  const parts = periodStr.split(",");
  parts.forEach((part) => {
      const geMatch = part.match(/>=(\d+)/);
      const leMatch = part.match(/<(\d+)/);

      if (geMatch) {
          min = parseInt(geMatch[1], 10);
      }
      if (leMatch) {
          max = parseInt(leMatch[1], 10);
      }
  });
  return { min, max };
}

// Check period conditions
function checkBegPosPeriodCondition(beg_pos_period_input, beg_pos_period) {
  if (!beg_pos_period) return true;
  return checkPeriodCondition(beg_pos_period_input, beg_pos_period);
}

function checkPosLevPeriodCondition(pos_lev_period_input, pos_lev_period) {
  if (!pos_lev_period) return true;
  return checkPeriodCondition(pos_lev_period_input, pos_lev_period);
}

function checkLastInsPeriodCondition(last_ins_period_input, last_ins_period) {
  if (!last_ins_period) return true;
  return checkPeriodCondition(last_ins_period_input, last_ins_period);
}

// Generic period condition checker
function checkPeriodCondition(period_input, period_str) {
  const { min, max } = parsePeriod(period_str);
  if (min !== null && period_input < min) return false;
  if (max !== null && period_input >= max) return false;
  return true;
}

// Check salary conditions
function checkSalaryCondition(salary_input, salary) {
  if (!salary) return true;
  const { min, max } = parsePeriod(salary);
  if (min !== null && salary_input < min) return false;
  if (max !== null && salary_input >= max) return false;
  return true;
}

function checkSalary5yCondition(salary5y_input, salary5y) {
  if (!salary5y) return true;

  const { min, max } = parsePeriod(salary5y);
  if (min !== null && salary5y_input < min) return false;
  if (max !== null && salary5y_input >= max) return false;
  return true;
}

// Get highest ins_code_order for each pos_type and pos_lev
function getHighestOrders(data) {
  const highestOrders = {};
  data.decorData.forEach((item) => {
      const key = item.pos_type + item.pos_lev;
      if (!highestOrders[key] || item.ins_code_order > highestOrders[key]) {
          highestOrders[key] = item.ins_code_order;
      }
  });
  return highestOrders;
}

// Get ins_code_order from ins_code_name_full (Lookup Table)
function getInsCodeOrder(data, ins_code_name_full) {
  if (!ins_code_name_full) return null;
  const item = data.decorData.find(
      (item) => item.ins_code_name_full === ins_code_name_full
  );
  return item ? item.ins_code_order : null;
}

// --- Fetch Data and Populate Dropdowns ---

async function fetchData() {
  try {
      const response = await fetch("decorationData.json");
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
  } catch (error) {
      console.error("Error fetching data:", error);
      Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: "ไม่สามารถโหลดข้อมูลได้: " + error.message,
      });
      return null;
  }
}

async function populateDropdowns() {
  const data = await fetchData();
  if (!data) return;

  const personalTypeSelect = document.getElementById("personal_type");
  const positionTypeSelect = document.getElementById("pos_type");
  const positionLevelSelect = document.getElementById("pos_lev");
  const decorationCodeSelect = document.getElementById("last_ins_code");

  // --- Populate personal_type ---
  const personalTypes = [
      ...new Set(
          data.decorData.map((item) => item.personal_type).filter(Boolean)
      ),
  ];
  personalTypes.forEach((type) => {
      const option = document.createElement("option");
      option.value = type;
      option.textContent = type;
      personalTypeSelect.appendChild(option);
  });

  // --- Hierarchy Logic (pos_type and pos_lev) ---

  function updatePosType() {
      const selectedPersonalType = personalTypeSelect.value;

      // Filter pos_type based on personal_type
      const filteredPosTypes = data.decorData
          .filter((item) => item.personal_type === selectedPersonalType)
          .map((item) => item.pos_type)
          .filter(Boolean); // Remove null

      const uniquePosTypes = [...new Set(filteredPosTypes)]; // Remove duplicates

      // Clear existing options (except the initial blank option)
      while (positionTypeSelect.options.length > 1) {
          positionTypeSelect.remove(1);
      }

      // Add "ไม่ระบุ" option if applicable
      if (
          data.decorData.some(
              (item) =>
                  item.personal_type === selectedPersonalType && item.pos_type === null
          )
      ) {
          const option = document.createElement("option");
          option.value = "ไม่ระบุ";
          option.textContent = "ไม่ระบุ";
          positionTypeSelect.appendChild(option);
      }

      // Populate with filtered pos_types
      uniquePosTypes.forEach((type) => {
          const option = document.createElement("option");
          option.value = type;
          option.textContent = type;
          positionTypeSelect.appendChild(option);
      });

      updatePosLev(); // Trigger update of pos_lev
  }

  function updatePosLev() {
      const selectedPersonalType = personalTypeSelect.value;
      const selectedPosType = positionTypeSelect.value;

      // Filter pos_lev based on personal_type and pos_type
      const filteredPosLevs = data.decorData
          .filter(
              (item) =>
                  item.personal_type === selectedPersonalType &&
                  (item.pos_type === selectedPosType ||
                      (item.pos_type === null && selectedPosType === "ไม่ระบุ"))
          )
          .map((item) => item.pos_lev)
          .filter(Boolean); // Remove null and undefined

      const uniquePosLevs = [...new Set(filteredPosLevs)];

      // Clear existing options (except the initial blank option)
      while (positionLevelSelect.options.length > 1) {
          positionLevelSelect.remove(1);
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
          const option = document.createElement("option");
          option.value = "ไม่ระบุ";
          option.textContent = "ไม่ระบุ";
          positionLevelSelect.appendChild(option);
      }

      // Populate with filtered pos_levs
      uniquePosLevs.forEach((level) => {
          const option = document.createElement("option");
          option.value = level;
          option.textContent = level;
          positionLevelSelect.appendChild(option);
      });

      updateLastInsCode(); // Trigger update of last_ins_code
  }

  function updateLastInsCode() {
      const selectedPosType = positionTypeSelect.value;
      const selectedPosLev = positionLevelSelect.value;

      // Get highest ins_code_order for the selected pos_lev
      const highestOrders = getHighestOrders(data);
      const highestOrder = highestOrders[selectedPosType + selectedPosLev] || 0; // Handle undefined

      // Filter decorations based on pos_type (and pos_lev indirectly via highestOrder)
      const filteredDecorations = data.decorData.filter(
          (item) =>
              (item.pos_type === selectedPosType ||
                  (item.pos_type === null && selectedPosType === "ไม่ระบุ")) &&
              item.ins_code_order <= highestOrder // Key change:  <= highestOrder
      );

      // Get unique ins_code_name_full values and sort by ins_code_order
      const uniqueDecorations = [
          ...new Set(filteredDecorations.map((item) => item.ins_code_name_full)),
      ];
      uniqueDecorations.sort((a, b) => {
          const orderA = filteredDecorations.find(
              (item) => item.ins_code_name_full === a
          )?.ins_code_order;
          const orderB = filteredDecorations.find(
              (item) => item.ins_code_name_full === b
          )?.ins_code_order;
          return (orderA || 0) - (orderB || 0); // Handle undefined order
      });

      // Clear existing options (except the default "never requested" option)
      while (decorationCodeSelect.options.length > 1) {
          decorationCodeSelect.remove(1);
      }

      //  --- Add "ไม่เคยเสนอขอพระราชทานเครื่องราชฯ" here ---
      const defaultOption = document.createElement("option");
      defaultOption.value = "null"; // Use actual null value
      defaultOption.textContent = "ไม่เคยได้รับพระราชทานเครื่องราชฯ";
      decorationCodeSelect.appendChild(defaultOption);

      // Populate with filtered and sorted decorations
      uniqueDecorations.forEach((code) => {
          const option = document.createElement("option");
          option.value = code;
          option.textContent = code;
          decorationCodeSelect.appendChild(option);
      });
  }

  // --- Event Listeners for Hierarchy ---
  personalTypeSelect.addEventListener("change", updatePosType);
  positionTypeSelect.addEventListener("change", updatePosLev);
  positionLevelSelect.addEventListener("change", updateLastInsCode);

  // --- Initial Population ---
  updatePosType(); // Start cascading updates
}

// --- Date Validation Function ---
// --- Date Validation Function (with Moment.js) ---
function isValidDate(dateString) {
  if (!dateString) return true; // Allow empty

  // ใช้ Moment.js ตรวจสอบ
  return moment(dateString, "DD/MM/YYYY", true).isValid();
}

// --- Reset Form Function ---
function resetForm() {
  const form = document.getElementById("searchForm");
  form.reset();

  // Remove validation classes
  form.classList.remove("was-validated");
  document.querySelectorAll(".form-control, .form-select").forEach((input) => {
      input.classList.remove("is-invalid");
      input.classList.remove("is-valid"); // Remove is-valid too
  });
  // Clear error messages
  clearAllErrors();

  // Reset selects to default state, triggering updates
  document.getElementById("personal_type").value = "";
  document.getElementById("personal_type").dispatchEvent(new Event("change")); // Trigger change
  // Reset last_ins_code as well
  document.getElementById("last_ins_code").value = ""; // Set to default empty value.
  document.getElementById("last_ins_code").dispatchEvent(new Event("change")); // Trigger the change.
}
// --- Clear All Error Messages ---
function clearAllErrors() {
  const errorDivs = document.querySelectorAll(".invalid-feedback");
  errorDivs.forEach((div) => {
      div.textContent = "";
      div.style.display = "none";
  });

  // Remove the 'is-invalid' class from all form controls
  const formControls = document.querySelectorAll(".form-control, .form-select");
  formControls.forEach((control) => {
      control.classList.remove("is-invalid");
  });
}
// --- Validate Form ---
function validateForm() {
  let isValid = true;
  const form = document.getElementById("searchForm");

  // --- Helper function to show error messages ---
  function showError(inputElement, message) {
      const errorDiv = document.getElementById(inputElement.id + "_error");
      errorDiv.textContent = message;
      errorDiv.style.display = "block";
      inputElement.classList.add("is-invalid");
      isValid = false; // Set overall validity to false
  }

  // --- Required Fields Check ---
  const requiredFields = [
      "personal_type",
      "pos_type",
      "pos_lev",
      "beg_pos_date",
      "salary",
      "last_ins_code",
  ];
  requiredFields.forEach((fieldId) => {
      const inputElement = document.getElementById(fieldId);

      // Special handling for last_ins_code (select element).
      if (fieldId === "last_ins_code") {
          if (!inputElement.value) {
              // เช็ค *เฉพาะ* empty string ("")
              showError(
                  inputElement,
                  "กรุณาเลือกเครื่องราชฯ หรือ ไม่เคยได้รับพระราชทานเครื่องราชฯ"
              );
              isValid = false;
          }
      } else {
          // For other required fields (not last_ins_code).
          if (
              !inputElement.value ||
              inputElement.value.trim() === ""
              // ไม่ต้องเช็ค null ตรงนี้ เพราะไม่ใช่ last_ins_code
          ) {
              showError(inputElement, "กรุณากรอกข้อมูลในช่องนี้");
              isValid = false;
          }
      }
  });

  // --- Date Validation (if provided) ---
  const dateFields = ["beg_pos_date", "pos_lev_date", "last_ins_date"];
  dateFields.forEach((fieldId) => {
      const inputElement = document.getElementById(fieldId);
      if (inputElement.value && !isValidDate(inputElement.value)) {
          showError(inputElement, "กรุณากรอกวันที่ในรูปแบบ วว/ดด/ปปปป");
          isValid = false;
      }
  });

  // --- Number Validation (if provided) ---
  const numberFields = ["salary", "salary5y"];
  numberFields.forEach((fieldId) => {
      const inputElement = document.getElementById(fieldId);
      if (inputElement.value && isNaN(parseFloat(inputElement.value))) {
          showError(inputElement, "กรุณากรอกตัวเลขที่ถูกต้อง");
          isValid = false;
      }
  });

  return isValid;
}

// --- Main Calculation Function ---
// --- Main Calculation Function ---
async function calculateDecoration(formData) {
  const data = await fetchData();
  if (!data) {
      return null; // fetchData handles error display
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
  } = formData;

  // --- 1. Calculate service period and check minimum requirement ---
  const currentYearBE = new Date().getFullYear() + 543;
  const begPosYearBE = beg_pos_date_input ? parseInt(beg_pos_date_input.split("/")[2], 10) : 0;
  const begPosPeriodYears = begPosYearBE ? (currentYearBE - begPosYearBE) + 1 : 0;

  // Find matching criteria in decoration data
  const relevantItem = data.decorData.find(
      (item) =>
          item.personal_type === personal_type_input &&
          (item.pos_type === pos_type_input || (item.pos_type === null && pos_type_input === "ไม่ระบุ")) &&
          (item.pos_lev === pos_lev_input || (item.pos_lev === null && pos_lev_input === "ไม่ระบุ"))
  );

  // Check beg_pos_period requirement only if specified in the data
  if (relevantItem && relevantItem.beg_pos_period) {
      const { min } = parsePeriod(relevantItem.beg_pos_period);
      if (min !== null && begPosPeriodYears < min) {
          return "คุณสมบัติไม่ถึงเกณฑ์";
      }
  }

  // --- 2. Check for highest decoration ---
  if (last_ins_code_name_full_input && last_ins_code_name_full_input !== "null") {
      const selectedLastInsCodeData = data.decorData.find(item =>
          item.personal_type === personal_type_input &&
          (item.pos_type === pos_type_input || (item.pos_type === null && pos_type_input === "ไม่ระบุ")) &&
          (item.pos_lev === pos_lev_input || (item.pos_lev === null && pos_lev_input === "ไม่ระบุ")) &&
          item.ins_code_name_full === last_ins_code_name_full_input
      );

      if (selectedLastInsCodeData && selectedLastInsCodeData.ins_code_highest_of_pos_lev === "highest") {
          return "ได้รับพระราชทานเครื่องราชฯ ชั้นสูงสุดของระดับตำแหน่งแล้ว";
      }
  }

  // --- 3. Calculate periods ---
  const endDatePosLev = `28/05/${currentYearBE}`;
  const endDateLastIns = `28/07/${currentYearBE}`;

  const pos_lev_period_input_calc = pos_lev_date_input ? calculatePeriodInYears(pos_lev_date_input, endDatePosLev) : null;
  const last_ins_period_input_calc = last_ins_date_input ? calculatePeriodInYears(last_ins_date_input, endDateLastIns) : null;

  // --- 4. Get highest possible order ---
  const highestOrders = getHighestOrders(data);
  const highestOrderOfPosLev = highestOrders[pos_type_input + pos_lev_input] || 0;

  // --- 5. Check consecutive years ---
  if (last_ins_date_input) {
      const lastInsYearBE = parseInt(last_ins_date_input.split("/")[2], 10);
      if (lastInsYearBE + 1 === currentYearBE) {
          return "ไม่เสนอขอพระราชทานเครื่องราชฯ ในปีติดกัน";
      }
  }

  // --- 6. Filter eligible decorations ---
  let filteredData = data.decorData.filter((item) => {
      // Basic criteria matching
      if (item.personal_type !== personal_type_input) return false;
      if (item.pos_type !== null && item.pos_type !== pos_type_input) return false;
      if (item.pos_lev !== null && item.pos_lev !== pos_lev_input) return false;

      // Period and salary checks (only if specified in criteria)
      if (item.pos_lev_period && !checkPosLevPeriodCondition(pos_lev_period_input_calc, item.pos_lev_period)) return false;
      if (item.salary && !checkSalaryCondition(salary_input, item.salary)) return false;
      if (item.salary5y && !checkSalary5yCondition(salary5y_input, item.salary5y)) return false;
      
      // Check last_ins_period only if specified in criteria
      if (item.last_ins_period && !checkLastInsPeriodCondition(last_ins_period_input_calc, item.last_ins_period)) return false;

      // Special handling for last_ins_code
      if (last_ins_code_name_full_input === "null" || !last_ins_code_name_full_input) {
          return item.last_ins_code === null;
      } else {
          const currentInsOrder = getInsCodeOrder(data, last_ins_code_name_full_input);
          return item.ins_code_order > currentInsOrder && item.ins_code_order <= highestOrderOfPosLev;
      }
  });

  // --- 7. Select appropriate decoration ---
  let selectedDecoration = null;
  if (filteredData.length > 0) {
      // Sort by ins_code_order to get the next eligible decoration
      filteredData.sort((a, b) => a.ins_code_order - b.ins_code_order);
      selectedDecoration = filteredData[0];
  }

  // --- 8. Return result ---
  if (selectedDecoration) {
      return "เครื่องราชอิสริยาภรณ์ชั้นถัดไป: " + selectedDecoration.ins_code_name_full;
  } else {
      return "คุณสมบัติไม่ถึงเกณฑ์";
  }
}