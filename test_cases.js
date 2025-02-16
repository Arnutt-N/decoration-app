// test_cases.js
// This file uses the calculateDecoration() function from script.js without changing it.
// It generates 200 test cases (by repeating 5 base cases 40 times each) and compares
// the actual output with the expected output. Results (total, passed, failed) are displayed in the HTML.

// ฟังก์ชันสำหรับโหลด script แบบ dynamic
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script")
    s.src = src
    s.onload = resolve
    s.onerror = reject
    document.head.appendChild(s)
  })
}

// โหลด moment.js และ locale (th) หากยังไม่ได้โหลด
async function ensureMoment() {
  if (typeof moment === "undefined") {
    await loadScript(
      "https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js"
    )
    await loadScript(
      "https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/locale/th.js"
    )
  }
}

document.addEventListener("DOMContentLoaded", async function () {
  // ตรวจสอบและโหลด moment หากยังไม่ได้โหลด
  await ensureMoment()

  const totalEl = document.getElementById("totalTests")
  const passedEl = document.getElementById("passedTests")
  const failedEl = document.getElementById("failedTests")
  const resultsContainer = document.getElementById("testResults")

  // ปรับปรุง base test cases ตาม remark:
  // - salary_input ต้องมีค่า (not null)
  // - ถ้า last_ins_code_name_full_input ไม่เป็น null ต้องมี last_ins_date_input ด้วย
  const baseCases = [
    {
      name: "Test A - Valid next decoration (ข้าราชการ, ทั่วไป, ปฏิบัติงาน)",
      input: {
        personal_type_input: "ข้าราชการ",
        pos_type_input: "ทั่วไป",
        pos_lev_input: "ปฏิบัติงาน",
        // Service period = 2568 - 2562 = 6
        beg_pos_date_input: "01/01/2562",
        pos_lev_date_input: null,
        salary_input: 9000,
        salary5y_input: null,
        // ไม่เคยได้รับ ให้ส่งค่า null
        last_ins_code_name_full_input: null,
        last_ins_date_input: null,
      },
      expected: "เครื่องราชอิสริยาภรณ์ชั้นถัดไป: เบญจมาภรณ์มงกุฎไทย (บ.ม.)",
    },
    {
      name: "Test B - Highest decoration already awarded (ข้าราชการ, ทั่วไป, ปฏิบัติงาน)",
      input: {
        personal_type_input: "ข้าราชการ",
        pos_type_input: "ทั่วไป",
        pos_lev_input: "ปฏิบัติงาน",
        beg_pos_date_input: "01/01/2562",
        pos_lev_date_input: null,
        salary_input: 9000,
        salary5y_input: null,
        // ระบุ decoration แล้ว ต้องมี last_ins_date_input ด้วย
        last_ins_code_name_full_input: "จัตุรถาภรณ์ช้างเผือก (จ.ช.)",
        last_ins_date_input: "01/01/2563",
      },
      expected: "ได้รับพระราชทานเครื่องราชฯ ชั้นสูงสุดของระดับตำแหน่งแล้ว",
    },
    {
      name: "Test C - Consecutive year decoration request (ข้าราชการ, ทั่วไป, ทักษะพิเศษ)",
      input: {
        personal_type_input: "ข้าราชการ",
        pos_type_input: "ทั่วไป",
        pos_lev_input: "ทักษะพิเศษ",
        beg_pos_date_input: "01/01/2562",
        pos_lev_date_input: null,
        salary_input: 0, // ต้องมีค่า (0)
        salary5y_input: null,
        last_ins_code_name_full_input: "ประถมาภรณ์มงกุฎไทย (ป.ม.)",
        last_ins_date_input: "01/01/2567",
      },
      expected: "ไม่เสนอขอพระราชทานเครื่องราชฯ ในปีติดกัน",
    },
    {
      name: "Test D - Insufficient service period (ข้าราชการ, ทั่วไป, ปฏิบัติงาน)",
      input: {
        personal_type_input: "ข้าราชการ",
        pos_type_input: "ทั่วไป",
        pos_lev_input: "ปฏิบัติงาน",
        // Service period = 2568 - 2565 = 3
        beg_pos_date_input: "01/01/2565",
        pos_lev_date_input: null,
        salary_input: 9000,
        salary5y_input: null,
        last_ins_code_name_full_input: null,
        last_ins_date_input: null,
      },
      expected: "คุณสมบัติไม่ถึงเกณฑ์",
    },
    {
      name: "Test E - Valid next decoration for ลูกจ้างประจำ",
      input: {
        personal_type_input: "ลูกจ้างประจำ",
        pos_type_input: "ค่าจ้าง 8,340 แต่ไม่ถึง 15,050",
        pos_lev_input: "ทุกระดับตำแหน่ง",
        // Service period = 2568 - 2560 = 8
        beg_pos_date_input: "01/01/2560",
        pos_lev_date_input: null,
        salary_input: 10000,
        salary5y_input: null,
        last_ins_code_name_full_input: null,
        last_ins_date_input: null,
      },
      expected: "เครื่องราชอิสริยาภรณ์ชั้นถัดไป: เบญจมาภรณ์มงกุฎไทย (บ.ม.)",
    },
  ]

  // สร้าง 200 test cases โดยทำซ้ำ base cases 40 ครั้ง
  const testCases = []
  const iterations = 40 // 5 base cases * 40 = 200 test cases
  for (let i = 0; i < iterations; i++) {
    baseCases.forEach((base) => {
      const testCase = {
        name: base.name + " - iteration " + (i + 1),
        input: Object.assign({}, base.input),
        expected: base.expected,
      }
      testCases.push(testCase)
    })
  }

  let total = 0,
    passed = 0,
    failed = 0
  const detailedResults = []

  // รัน test cases ทีละอัน (calculateDecoration เป็น async)
  for (let i = 0; i < testCases.length; i++) {
    total++
    const test = testCases[i]
    let actual
    try {
      actual = await calculateDecoration(test.input)
    } catch (error) {
      actual = "Error: " + error.message
    }
    const passStatus = actual === test.expected
    if (passStatus) {
      passed++
    } else {
      failed++
    }
    detailedResults.push({
      input: test.input,
      expected: test.expected,
      actual: actual,
      passed: passStatus,
    })
  }

  totalEl.textContent = total
  passedEl.textContent = passed
  failedEl.textContent = failed

  // สร้าง HTML ตาราง (ไม่รวมคอลัมน์ "Test Case") พร้อมใช้ class "modern-table"
  let tableHTML = `<table class="modern-table">
      <thead>
        <tr>
          <th>Input</th>
          <th>Expected</th>
          <th>Actual</th>
          <th>Result</th>
        </tr>
      </thead>
      <tbody>`
  detailedResults.forEach((result) => {
    let rowClass = result.passed ? "" : " class='failed-row'"
    let resultText = result.passed
      ? "<span style='color:green;'>Passed</span>"
      : "<span style='color:red;'>Failed</span>"
    tableHTML += `<tr${rowClass}>
      <td data-label="Input"><pre>${JSON.stringify(
        result.input,
        null,
        2
      )}</pre></td>
      <td data-label="Expected">${result.expected}</td>
      <td data-label="Actual">${result.actual}</td>
      <td data-label="Result">${resultText}</td>
    </tr>`
  })
  tableHTML += `</tbody></table>`
  resultsContainer.innerHTML = tableHTML
})
