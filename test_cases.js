window.onerror = function (message, source, lineno, colno, error) {
  if (
    source &&
    source.indexOf("script.js") !== -1 &&
    message.indexOf("Cannot read properties of null") !== -1
  ) {
    return true
  }
  return false
}

const testCases = []

function maybeAssignDate(condition, dateStr) {
  return condition ? dateStr : null
}

function getRandomInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateTestCase(
  caseNum,
  personalType,
  posType,
  posLev,
  begDate,
  posLevDate,
  salary,
  salary5yInput,
  lastInsCode,
  lastInsDate,
  expected,
  description
) {
  return {
    caseNum: caseNum,
    description: description,
    input: {
      personal_type_input: personalType,
      pos_type_input: posType,
      pos_lev_input: posLev,
      beg_pos_date_input: begDate,
      pos_lev_date_input: posLevDate,
      salary_input: salary,
      salary5y_input: salary5yInput,
      last_ins_code_name_full_input: lastInsCode,
      last_ins_date_input: lastInsDate,
    },
    expected: expected,
  }
}

// -------------------------------
// Test Case Generation Parameters
// -------------------------------
const numTestCases = 200
const kharatchakanRatio = 0.35
const lookchangRatio = 0.325
const phanaknganRatio = 0.325

let caseNumCounter = 1

// Function to check data consistency
function isDataConsistent(posType, posLev, salary) {
  // Example: Salary should be within reasonable range for the position
  if (posType === "ทั่วไป" && salary > 70000) return false
  if (posType === "วิชาการ" && salary < 15000) return false
  return true
}

// Function to getRandomInsnCode
function getRandomInsCode(personalType, posType, posLev, data) {
  const filteredDecorations = data.filter(
    (item) =>
      item.personal_type === personalType &&
      item.pos_type === posType &&
      item.pos_lev === posLev
  )

  if (filteredDecorations.length === 0) {
    return null
  }

  const randomIndex = Math.floor(Math.random() * filteredDecorations.length)
  return filteredDecorations[randomIndex].ins_code_name_full
}

// -------------------------------
// Group 1: ข้าราชการ
// -------------------------------
const numKharatchakan = Math.floor(numTestCases * kharatchakanRatio)
for (let i = 0; i < numKharatchakan; i++) {
  let posType,
    posLev,
    salary,
    begDate,
    salary5yInput = null
  let posLevDate = null
  let lastInsCode = null,
    lastInsDate = null
  let expected = ""

  const posTypes = ["ทั่วไป", "วิชาการ", "อำนวยการ"]
  posType = posTypes[i % posTypes.length]

  if (posType === "ทั่วไป") {
    const levOptions = ["ปฏิบัติงาน", "ชำนาญงาน", "อาวุโส", "ทักษะพิเศษ"]
    posLev = levOptions[i % levOptions.length]
    salary = getRandomInt(8000, posLev === "ปฏิบัติงาน" ? 45000 : 70000)
    begDate = maybeAssignDate(i % 3 === 0, `01/01/${getRandomInt(2540, 2563)}`)
    posLevDate = maybeAssignDate(
      i % 5 === 0,
      `15/05/${getRandomInt(
        begDate ? parseInt(begDate.split("/")[2]) + 5 : 2550,
        2563
      )}`
    )

    if (salary < 10190) {
      expected = "เครื่องราชอิสริยาภรณ์ชั้นถัดไป: เบญจมาภรณ์มงกุฎไทย (บ.ม.)"
    } else if (salary < 20000 && posLev !== "ปฏิบัติงาน") {
      expected = "เครื่องราชอิสริยาภรณ์ชั้นถัดไป: จัตุรถาภรณ์มงกุฎไทย (จ.ม.)"
    } else {
      expected = "เครื่องราชอิสริยาภรณ์ชั้นถัดไป: ตริตาภรณ์มงกุฎไทย (ต.ม.)"
    }
  } else if (posType === "วิชาการ") {
    const levOptions = [
      "ปฏิบัติการ",
      "ชำนาญการ",
      "ชำนาญการพิเศษ",
      "เชี่ยวชาญ",
      "ทรงคุณวุฒิ (เงิน ป.จ.ต. 13,000)",
      "ทรงคุณวุฒิ (เงิน ป.จ.ต. 15,600)",
    ]
    posLev = levOptions[i % levOptions.length]
    salary = getRandomInt(15000, 90000)
    begDate = `01/01/${getRandomInt(2545, 2563)}`
    posLevDate = maybeAssignDate(
      i % 4 === 0,
      `15/05/${getRandomInt(
        begDate ? parseInt(begDate.split("/")[2]) + 5 : 2550,
        2563
      )}`
    )

    if (posLev === "ชำนาญการ") {
      expected = "เครื่องราชอิสริยาภรณ์ชั้นถัดไป: ตริตาภรณ์ช้างเผือก (ต.ช.)"
    } else {
      expected = "เครื่องราชอิสริยาภรณ์ชั้นถัดไป: ทวีติยาภรณ์มงกุฎไทย (ท.ม.)"
    }
  } else {
    posLev = i % 2 === 0 ? "ต้น" : "สูง"
    salary = getRandomInt(55000, 110000)
    begDate = `01/01/${getRandomInt(2550, 2563)}`
    posLevDate = maybeAssignDate(
      i % 6 === 0,
      `15/05/${getRandomInt(
        begDate ? parseInt(begDate.split("/")[2]) + 5 : 2555,
        2563
      )}`
    )
    expected =
      posLev === "ต้น"
        ? "เครื่องราชอิสริยาภรณ์ชั้นถัดไป: ประถมาภรณ์มงกุฎไทย (ป.ม.)"
        : "เครื่องราชอิสริยาภรณ์ชั้นถัดไป: ประถมาภรณ์ช้างเผือก (ป.ช.)"
  }

  // Introduce lastInsCode and lastInsDate for some cases
  if (i % 5 === 0) {
    lastInsCode = getRandomInsCode("ข้าราชการ", posType, posLev, testCases)
    lastInsDate = lastInsCode ? `01/01/${getRandomInt(2550, 2563)}` : null
    if (lastInsCode) {
      expected = "เครื่องราชอิสริยาภรณ์ชั้นถัดไป: ตริตาภรณ์มงกุฎไทย (ต.ม.)"
    }
  }

  // Check data consistency before pushing to testCases
  if (isDataConsistent(posType, posLev, salary)) {
    testCases.push(
      generateTestCase(
        caseNumCounter++,
        "ข้าราชการ",
        posType,
        posLev,
        begDate,
        posLevDate,
        salary,
        salary5yInput,
        lastInsCode,
        lastInsDate,
        expected,
        `ข้าราชการ: ${posType} / ${posLev}, BegDate: ${begDate}, PosLevDate: ${posLevDate}, Salary: ${salary}, Salary5Y: ${salary5yInput}`
      )
    )
  }
}

// -------------------------------
// Group 2: ลูกจ้างประจำ
// -------------------------------
const numLookchang = Math.floor(numTestCases * lookchangRatio)
for (let i = 0; i < numLookchang; i++) {
  let posType,
    posLev = "ทุกระดับตำแหน่ง"
  let begDate, salary
  let salary5yInput = null
  let posLevDate = maybeAssignDate(i % 4 === 0, "15/05/2550")
  let lastInsCode = null,
    lastInsDate = null
  let expected = ""

  const posTypes = ["ค่าจ้าง 8,340 แต่ไม่ถึง 15,050", "ค่าจ้าง 15,050 ขึ้นไป"]
  posType = posTypes[i % posTypes.length]
  begDate = maybeAssignDate(i % 3 === 0, `01/01/${getRandomInt(2540, 2555)}`)
  salary =
    posType === "ค่าจ้าง 8,340 แต่ไม่ถึง 15,050"
      ? getRandomInt(8340, 15049)
      : getRandomInt(15050, 30000)

  if (posType === "ค่าจ้าง 15,050 ขึ้นไป" && i % 5 === 0) {
    salary5yInput = salary - 500
  }

  expected =
    posType === "ค่าจ้าง 8,340 แต่ไม่ถึง 15,050"
      ? "เครื่องราชอิสริยาภรณ์ชั้นถัดไป: เบญจมาภรณ์มงกุฎไทย (บ.ม.)"
      : "เครื่องราชอิสริยาภรณ์ชั้นถัดไป: เบญจมาภรณ์ช้างเผือก (บ.ช.)"

  // Introduce lastInsCode and lastInsDate for some cases
  if (i % 5 === 0) {
    lastInsCode = getRandomInsCode("ลูกจ้างประจำ", posType, posLev, testCases)
    lastInsDate = lastInsCode ? `01/01/${getRandomInt(2550, 2563)}` : null
    if (lastInsCode) {
      expected = "เครื่องราชอิสริยาภรณ์ชั้นถัดไป: จัตุรถาภรณ์มงกุฎไทย (จ.ม.)"
    }
  }

  // Check data consistency before pushing to testCases
  if (isDataConsistent(posType, posLev, salary)) {
    testCases.push(
      generateTestCase(
        caseNumCounter++,
        "ลูกจ้างประจำ",
        posType,
        posLev,
        begDate,
        posLevDate,
        salary,
        salary5yInput,
        lastInsCode,
        lastInsDate,
        expected,
        `ลูกจ้างประจำ: ${posType}, BegDate: ${begDate}, PosLevDate: ${posLevDate}, Salary: ${salary}, Salary5Y: ${salary5yInput}`
      )
    )
  }
}

// -------------------------------
// Group 3: พนักงานราชการ
// -------------------------------
const numPhanakngan = Math.floor(numTestCases * phanaknganRatio)
for (let i = 0; i < numPhanakngan; i++) {
  let posType, posLev, begDate
  let posLevDate = maybeAssignDate(i % 4 === 0, "15/05/2560")
  let lastInsCode = null,
    lastInsDate = null
  let expected = ""

  const types = [
    "กลุ่มงานบริการ",
    "กลุ่มงานเทคนิค",
    "กลุ่มงานบริหารทั่วไป",
    "กลุ่มงานวิชาชีพเฉพาะ",
    "กลุ่มงานเชี่ยวชาญเฉพาะ",
    "กลุ่มงานเชี่ยวชาญพิเศษ",
  ]
  posType = types[i % types.length]

  if (posType === "กลุ่มงานเชี่ยวชาญพิเศษ") {
    posLev = i % 2 === 0 ? "ทั่วไป" : "สากล"
  } else {
    posLev = "ไม่มีระดับตำแหน่ง"
  }

  begDate = maybeAssignDate(i % 3 === 0, `01/01/${getRandomInt(2550, 2563)}`)

  if (posType === "กลุ่มงานบริการ" || posType === "กลุ่มงานเทคนิค") {
    expected = "เครื่องราชอิสริยาภรณ์ชั้นถัดไป: เบญจมาภรณ์มงกุฎไทย (บ.ม.)"
  } else if (posType === "กลุ่มงานบริหารทั่วไป") {
    expected = "เครื่องราชอิสริยาภรณ์ชั้นถัดไป: จัตุรถาภรณ์มงกุฎไทย (จ.ม.)"
  } else if (
    posType === "กลุ่มงานวิชาชีพเฉพาะ" ||
    posType === "กลุ่มงานเชี่ยวชาญเฉพาะ"
  ) {
    expected = "เครื่องราชอิสริยาภรณ์ชั้นถัดไป: จัตุรถาภรณ์ช้างเผือก (จ.ช.)"
  } else if (posType === "กลุ่มงานเชี่ยวชาญพิเศษ") {
    expected =
      posLev === "ทั่วไป"
        ? "เครื่องราชอิสริยาภรณ์ชั้นถัดไป: ตริตาภรณ์มงกุฎไทย (ต.ม.)"
        : "เครื่องราชอิสริยาภรณ์ชั้นถัดไป: ทวีติยาภรณ์มงกุฎไทย (ท.ม.)"
  }

  // Introduce lastInsCode and lastInsDate for some cases
  if (i % 5 === 0) {
    lastInsCode = getRandomInsCode("พนักงานราชการ", posType, posLev, testCases)
    lastInsDate = lastInsCode ? `01/01/${getRandomInt(2550, 2563)}` : null
    if (lastInsCode) {
      expected = "เครื่องราชอิสริยาภรณ์ชั้นถัดไป: ตริตาภรณ์มงกุฎไทย (ต.ม.)"
    }
  }

  // Check data consistency before pushing to testCases
  if (isDataConsistent(posType, posLev, 50000)) {
    testCases.push(
      generateTestCase(
        caseNumCounter++,
        "พนักงานราชการ",
        posType,
        posLev,
        begDate,
        posLevDate,
        null,
        null,
        lastInsCode,
        lastInsDate,
        expected,
        `พนักงานราชการ: ${posType} / ${posLev}, BegDate: ${begDate}, PosLevDate: ${posLevDate}`
      )
    )
  }
}

// -------------------------------
// Group 4: Additional Test Cases (อ้างอิงจากข้อมูลในภาพ)
// -------------------------------

testCases.push(
  {
    caseNum: caseNumCounter++,
    description: "ปฏิบัติงาน, อายุราชการ >=5,<10, เงินเดือน <10190",
    input: {
      personal_type_input: "ข้าราชการ",
      pos_type_input: "ทั่วไป",
      pos_lev_input: "ปฏิบัติงาน",
      beg_pos_date_input: "28/05/2564", // อายุราชการ 4 ปี (ไม่ถึงเกณฑ์)
      pos_lev_date_input: null,
      salary_input: 10000,
      salary5y_input: null,
      last_ins_code_name_full_input: null,
      last_ins_date_input: null,
    },
    expected: "คุณสมบัติไม่ถึงเกณฑ์",
  },
  {
    caseNum: caseNumCounter++,
    description: "ปฏิบัติงาน, อายุราชการ >=5,<10, เงินเดือน <10190",
    input: {
      personal_type_input: "ข้าราชการ",
      pos_type_input: "ทั่วไป",
      pos_lev_input: "ปฏิบัติงาน",
      beg_pos_date_input: "28/05/2560", // อายุราชการ 8 ปี (เข้าเกณฑ์)
      pos_lev_date_input: null,
      salary_input: 10000,
      salary5y_input: null,
      last_ins_code_name_full_input: null,
      last_ins_date_input: null,
    },
    expected: "เครื่องราชอิสริยาภรณ์ชั้นถัดไป: เบญจมาภรณ์มงกุฎไทย (บ.ม.)",
  },
  {
    caseNum: caseNumCounter++,
    description: "ปฏิบัติงาน, อายุราชการ >=10, เงินเดือน <10190",
    input: {
      personal_type_input: "ข้าราชการ",
      pos_type_input: "ทั่วไป",
      pos_lev_input: "ปฏิบัติงาน",
      beg_pos_date_input: "28/05/2550", // อายุราชการ 18 ปี (เข้าเกณฑ์)
      pos_lev_date_input: null,
      salary_input: 10000,
      salary5y_input: null,
      last_ins_code_name_full_input: null,
      last_ins_date_input: null,
    },
    expected: "เครื่องราชอิสริยาภรณ์ชั้นถัดไป: เบญจมาภรณ์ช้างเผือก (บ.ช.)",
  },
  {
    caseNum: caseNumCounter++,
    description: "ปฏิบัติงาน, อายุราชการ >=5,<10, เงินเดือน >=10190",
    input: {
      personal_type_input: "ข้าราชการ",
      pos_type_input: "ทั่วไป",
      pos_lev_input: "ปฏิบัติงาน",
      beg_pos_date_input: "28/05/2560", // อายุราชการ 8 ปี (เข้าเกณฑ์)
      pos_lev_date_input: null,
      salary_input: 11000,
      salary5y_input: null,
      last_ins_code_name_full_input: null,
      last_ins_date_input: null,
    },
    expected: "เครื่องราชอิสริยาภรณ์ชั้นถัดไป: จัตุรถาภรณ์มงกุฎไทย (จ.ม.)",
  },
  {
    caseNum: caseNumCounter++,
    description: "ปฏิบัติงาน, อายุราชการ >=10, เงินเดือน >=10190",
    input: {
      personal_type_input: "ข้าราชการ",
      pos_type_input: "ทั่วไป",
      pos_lev_input: "ปฏิบัติงาน",
      beg_pos_date_input: "28/05/2550", // อายุราชการ 18 ปี (เข้าเกณฑ์)
      pos_lev_date_input: null,
      salary_input: 11000,
      salary5y_input: null,
      last_ins_code_name_full_input: null,
      last_ins_date_input: null,
    },
    expected: "เครื่องราชอิสริยาภรณ์ชั้นถัดไป: จัตุรถาภรณ์ช้างเผือก (จ.ช.)",
  },
  {
    caseNum: caseNumCounter++,
    description:
      "ปฏิบัติงาน, อายุราชการ >=5,<10, เงินเดือน <10190, เคยได้รับ บ.ม.",
    input: {
      personal_type_input: "ข้าราชการ",
      pos_type_input: "ทั่วไป",
      pos_lev_input: "ปฏิบัติงาน",
      beg_pos_date_input: "28/05/2560", // อายุราชการ 8 ปี (เข้าเกณฑ์)
      pos_lev_date_input: null,
      salary_input: 10000,
      salary5y_input: null,
      last_ins_code_name_full_input: "เบญจมาภรณ์มงกุฎไทย (บ.ม.)",
      last_ins_date_input: "01/01/2563",
    },
    expected: "เครื่องราชอิสริยาภรณ์ชั้นถัดไป: จัตุรถาภรณ์มงกุฎไทย (จ.ม.)",
  },
  {
    caseNum: caseNumCounter++,
    description:
      "ปฏิบัติงาน, อายุราชการ >=10, เงินเดือน >=10190, เคยได้รับ จ.ม.",
    input: {
      personal_type_input: "ข้าราชการ",
      pos_type_input: "ทั่วไป",
      pos_lev_input: "ปฏิบัติงาน",
      beg_pos_date_input: "28/05/2550", // อายุราชการ 18 ปี (เข้าเกณฑ์)
      pos_lev_date_input: null,
      salary_input: 11000,
      salary5y_input: null,
      last_ins_code_name_full_input: "จัตุรถาภรณ์มงกุฎไทย (จ.ม.)",
      last_ins_date_input: "01/01/2560",
    },
    expected: "เครื่องราชอิสริยาภรณ์ชั้นถัดไป: จัตุรถาภรณ์ช้างเผือก (จ.ช.)",
  },
  {
    caseNum: caseNumCounter++,
    description:
      "ปฏิบัติงาน, อายุราชการ >=10, เงินเดือน >=10190, ได้รับเครื่องราชฯ สูงสุดแล้ว",
    input: {
      personal_type_input: "ข้าราชการ",
      pos_type_input: "ทั่วไป",
      pos_lev_input: "ปฏิบัติงาน",
      beg_pos_date_input: "28/05/2550", // อายุราชการ 18 ปี (เข้าเกณฑ์)
      pos_lev_date_input: null,
      salary_input: 11000,
      salary5y_input: null,
      last_ins_code_name_full_input: "จัตุรถาภรณ์ช้างเผือก (จ.ช.)",
      last_ins_date_input: "01/01/2555",
    },
    expected: "ได้รับพระราชทานเครื่องราชฯ ชั้นสูงสุดของระดับตำแหน่งแล้ว",
  }
)

console.log(`Generated ${testCases.length} test cases.`)

if (typeof module !== "undefined" && module.exports) {
  module.exports = testCases
}
