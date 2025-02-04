// กำหนดตัวแปรเก็บข้อมูล JSON
let jsonData = []

// โหลดข้อมูลจากไฟล์ decorationData.json และดึงข้อมูลจาก key "decorData"
fetch("decorationData.json")
  .then((response) => response.json())
  .then((data) => {
    jsonData = data.decorData
    initPersonalType()
    updateSalary5YLabel()
    initLastInsCode()
  })
  .catch((error) => console.error("Error fetching decoration data:", error))

// ตั้งค่า Air Datepicker ให้กับ input ที่มี class "datepicker"
// (โปรดตรวจสอบว่าคุณได้รวมไฟล์ CSS/JS ของ Air Datepicker และภาษาไทยไว้ใน index.html แล้ว)
document.addEventListener("DOMContentLoaded", function () {
  const datepickers = document.querySelectorAll(".datepicker")
  datepickers.forEach((input) => {
    new AirDatepicker(input, {
      language: "th",
      dateFormat: "dd/MM/yyyy",
      autoClose: true,
      todayHighlight: true,
      // หาก library ไม่มี option thaiyear ให้ใช้ฟังก์ชันแปลงวันที่ในภายหลัง
    })
  })

  // ตั้ง event listener สำหรับปุ่ม date picker (ถ้ามี)
  const btnBegPos = document.getElementById("btn_beg_pos_date")
  if (btnBegPos) {
    btnBegPos.addEventListener("click", function () {
      document.getElementById("beg_pos_date").focus()
    })
  }
  const btnPosLev = document.getElementById("btn_pos_lev_date")
  if (btnPosLev) {
    btnPosLev.addEventListener("click", function () {
      document.getElementById("pos_lev_date").focus()
    })
  }
  const btnLastIns = document.getElementById("btn_last_ins_date")
  if (btnLastIns) {
    btnLastIns.addEventListener("click", function () {
      document.getElementById("last_ins_date").focus()
    })
  }
})

// ฟังก์ชันแปลงวันที่จากรูปแบบ dd/MM/yyyy (ที่เป็นปี พ.ศ.) ให้เป็น Date object (ปี ค.ศ.)
function parseThaiDate(thaiDateStr) {
  if (!thaiDateStr) return null
  const parts = thaiDateStr.split("/")
  if (parts.length !== 3) return null
  const day = parseInt(parts[0], 10)
  const month = parseInt(parts[1], 10) - 1
  const yearBE = parseInt(parts[2], 10)
  const yearAD = yearBE - 543
  return new Date(yearAD, month, day)
}

// ฟังก์ชันคำนวณจำนวนปีจากวันที่ (รับวันที่ในรูปแบบ dd/MM/yyyy ที่เป็น พ.ศ.)
function calculateYears(thaiDateStr) {
  const date = parseThaiDate(thaiDateStr)
  if (!date) return 0
  const now = new Date()
  const diffMs = now - date
  return diffMs / (1000 * 60 * 60 * 24 * 365.25)
}

// ฟังก์ชันคำนวณช่วงเวลา (เป็นปีทศนิยม) จาก startDateStr ถึง fixedDateStr (ทั้งคู่ในรูปแบบ dd/MM/yyyy ที่เป็น พ.ศ.)
function calculatePeriod(startDateStr, fixedDateStr) {
  const startDate = parseThaiDate(startDateStr)
  const fixedDate = parseThaiDate(fixedDateStr)
  if (!startDate || !fixedDate) return 0
  const diffMs = fixedDate - startDate
  return diffMs / (1000 * 60 * 60 * 24 * 365.25)
}

// ฟังก์ชันดึงปีจากวันที่ไทย (ในรูปแบบ dd/MM/yyyy พ.ศ.)
function getThaiYear(dateStr) {
  if (!dateStr) return null
  const parts = dateStr.split("/")
  if (parts.length !== 3) return null
  return parseInt(parts[2], 10)
}

// ฟังก์ชันตรวจสอบเงื่อนไข (เช่น ">=5,<10") กับค่า value
function checkCondition(value, conditionStr) {
  if (!conditionStr) return true
  const conditions = conditionStr.split(",")
  return conditions.every((cond) => {
    cond = cond.trim()
    if (cond.startsWith(">=")) {
      return value >= parseFloat(cond.slice(2))
    } else if (cond.startsWith(">")) {
      return value > parseFloat(cond.slice(1))
    } else if (cond.startsWith("<=")) {
      return value <= parseFloat(cond.slice(2))
    } else if (cond.startsWith("<")) {
      return value < parseFloat(cond.slice(1))
    } else {
      return value == parseFloat(cond)
    }
  })
}

// ฟังก์ชันเติมข้อมูลให้ dropdown โดยใช้ค่าที่ไม่ซ้ำ
function populateDropdown(id, values) {
  const select = document.getElementById(id)
  // ปรับ default option ให้เป็น "เลือก" + name (ไม่มีช่องว่างเกินมา)
  select.innerHTML = `<option value="">เลือก${select.getAttribute(
    "name"
  )}</option>`
  values.forEach((val) => {
    const option = document.createElement("option")
    option.value = val
    option.textContent = val || "ไม่ระบุ"
    select.appendChild(option)
  })
}

// ฟังก์ชันเริ่มต้นเติมข้อมูลสำหรับ dropdown "ประเภทบุคลากร"
function initPersonalType() {
  const types = [...new Set(jsonData.map((item) => item.personal_type))]
  populateDropdown("personal_type", types)
}

// เมื่อเลือก personal_type ให้กรองและเติมข้อมูล dropdown "ประเภทตำแหน่ง"
function updatePosType() {
  const personalValue = document.getElementById("personal_type").value
  const filtered = jsonData.filter(
    (item) => item.personal_type === personalValue
  )
  const posTypes = [...new Set(filtered.map((item) => item.pos_type))]
  populateDropdown("pos_type", posTypes)
  populateDropdown("pos_lev", []) // เคลียร์ dropdown สำหรับ "ระดับตำแหน่ง"
}

// เมื่อเลือก pos_type ให้กรองและเติมข้อมูล dropdown "ระดับตำแหน่ง"
function updatePosLev() {
  const personalValue = document.getElementById("personal_type").value
  const posTypeValue = document.getElementById("pos_type").value
  const filtered = jsonData.filter(
    (item) =>
      item.personal_type === personalValue && item.pos_type === posTypeValue
  )
  const posLevs = [...new Set(filtered.map((item) => item.pos_lev))]
  populateDropdown("pos_lev", posLevs)
}

// ฟังก์ชันอัพเดท label เงินเดือน 5 ปี ย้อนหลัง (คำนวณปี = พ.ศ. ปัจจุบัน - 5)
function updateSalary5YLabel() {
  const now = new Date()
  const currentBuddhistYear = now.getFullYear() + 543
  const targetYear = currentBuddhistYear - 5
  document.getElementById("salary5y_year").textContent = targetYear
}

// ฟังก์ชันสำหรับเติมข้อมูล select "เครื่องราชชั้นล่าสุด"
// ใช้ข้อมูล ins_code, ins_code_name และ ins_code_order จาก jsonData
// แสดงผลเป็น "ins_code_name (ins_code)" โดยเรียงตาม ins_code_order จากน้อยไปมาก
function initLastInsCode() {
  const insMap = new Map()
  jsonData.forEach((item) => {
    if (item.ins_code && item.ins_code_name && !insMap.has(item.ins_code)) {
      insMap.set(item.ins_code, {
        ins_code: item.ins_code,
        ins_code_name: item.ins_code_name,
        ins_code_order: item.ins_code_order,
      })
    }
  })

  const insArray = Array.from(insMap.values())
  insArray.sort((a, b) => a.ins_code_order - b.ins_code_order)

  const select = document.getElementById("last_ins_code")
  select.innerHTML = `<option value="">เลือกเครื่องราชชั้นล่าสุด (ถ้ามี)</option>`
  insArray.forEach((option) => {
    const opt = document.createElement("option")
    opt.value = option.ins_code
    opt.textContent = `${option.ins_code_name} (${option.ins_code})`
    select.appendChild(opt)
  })
}

// ตั้งค่า event listener สำหรับ dropdown
document
  .getElementById("personal_type")
  .addEventListener("change", updatePosType)
document.getElementById("pos_type").addEventListener("change", updatePosLev)

// เมื่อฟอร์มถูกส่ง ให้คำนวณเงื่อนไขและค้นหา record ที่ตรงกัน พร้อมแสดงผลด้วย SweetAlert2
document
  .getElementById("decorationForm")
  .addEventListener("submit", function (e) {
    e.preventDefault()

    // รับค่าจากฟอร์ม (วันที่ในรูปแบบ dd/MM/yyyy ที่เป็น พ.ศ.)
    const personalValue = document.getElementById("personal_type").value
    const posTypeValue = document.getElementById("pos_type").value
    const posLevValue = document.getElementById("pos_lev").value
    const begPosDate = document.getElementById("beg_pos_date").value
    const posLevDate = document.getElementById("pos_lev_date").value
    const salaryInput = parseFloat(document.getElementById("salary").value) || 0
    const salary5yInput =
      parseFloat(document.getElementById("salary5y").value) || 0
    const lastInsDate = document.getElementById("last_ins_date").value
    const lastInsCodeForm = document.getElementById("last_ins_code").value

    const now = new Date()
    const currentBuddhistYear = now.getFullYear() + 543

    // กำหนด fixed date สำหรับคำนวณช่วงเวลา
    const fixedBegPosDate = `28/5/${currentBuddhistYear}` // สำหรับ beg_pos_period
    const fixedPosLevDate = `28/5/${currentBuddhistYear}` // สำหรับ pos_lev_period
    const fixedLastInsDate = `28/7/${currentBuddhistYear}` // สำหรับ last_ins_period

    // คำนวณช่วงเวลาจากวันที่บรรจุ และวันที่เข้าสู่ระดับตำแหน่ง
    const begPosPeriodInput = calculatePeriod(begPosDate, fixedBegPosDate)
    const posLevPeriodInput = calculatePeriod(posLevDate, fixedPosLevDate)
    const lastInsPeriodInput = calculatePeriod(lastInsDate, fixedLastInsDate)

    // ตรวจสอบเงื่อนไข "ปีติดกัน" สำหรับเครื่องราชฯ
    // หาก (ปีของ last_ins_date) + 1 เท่ากับปีปัจจุบัน (ในรูปแบบ พ.ศ.)
    if (lastInsDate) {
      const lastInsYear = getThaiYear(lastInsDate)
      if (lastInsYear !== null && lastInsYear + 1 === currentBuddhistYear) {
        Swal.fire({
          title: "ผลการตรวจสอบ",
          text: "ไม่เสนอขอเครื่องราชฯ ในปีติดกัน",
          icon: "error",
          confirmButtonText: "ตกลง",
        })
        return
      }
    }

    // ตรวจสอบเงื่อนไข "ได้รับเครื่องราชฯ ชั้นสูงสุดของระดับตำแหน่งแล้ว"
    // โดยตรวจสอบจาก record ที่มี personal_type, pos_lev ตรงกัน และ
    // lastInsCodeForm (จาก form) ตรงกับ record.ins_code_name_full
    // รวมถึง record.ins_code_highest_of_pos_lev === "highest"
    const highestRecord = jsonData.find(
      (item) =>
        item.personal_type === personalValue &&
        item.pos_lev === posLevValue &&
        lastInsCodeForm &&
        lastInsCodeForm === item.ins_code_name_full &&
        item.ins_code_highest_of_pos_lev === "highest"
    )
    if (highestRecord) {
      Swal.fire({
        title: "ผลการตรวจสอบ",
        text: "ได้รับเครื่องราชฯ ชั้นสูงสุดของระดับตำแหน่งแล้ว",
        icon: "warning",
        confirmButtonText: "ตกลง",
      })
      return
    }

    // ตรวจสอบเงื่อนไขเบื้องต้น: หาก personalValue เป็น "ข้าราชการ", "ลูกจ้างประจำ" หรือ "พนักงานราชการ"
    // และช่วงเวลาจากวันที่บรรจุไม่ผ่านเงื่อนไขใน record (ไม่มี record ใดที่ผ่าน checkCondition สำหรับ beg_pos_period)
    if (
      (personalValue === "ข้าราชการ" ||
        personalValue === "ลูกจ้างประจำ" ||
        personalValue === "พนักงานราชการ") &&
      !jsonData.some(
        (item) =>
          item.personal_type === personalValue &&
          checkCondition(begPosPeriodInput, item.beg_pos_period)
      )
    ) {
      Swal.fire({
        title: "ผลการตรวจสอบ",
        text: "คุณสมบัติยังไม่ถึงเกณฑ์",
        icon: "error",
        confirmButtonText: "ตกลง",
      })
      return
    }

    // Query เงื่อนไขทั้งหมดเพื่อเสนอเครื่องราชฯ ใหม่
    let matchedRecords = jsonData.filter((item) => {
      return (
        item.personal_type === personalValue &&
        item.pos_type === posTypeValue &&
        item.pos_lev === posLevValue &&
        checkCondition(begPosPeriodInput, item.beg_pos_period) &&
        checkCondition(posLevPeriodInput, item.pos_lev_period) &&
        checkCondition(salaryInput, item.salary) &&
        checkCondition(salary5yInput, item.salary5y) &&
        checkCondition(lastInsPeriodInput, item.last_ins_period)
      )
    })

    // หากมีการระบุเครื่องราชฯ ที่ได้รับไปแล้ว (จากฟอร์ม last_ins_code)
    // ต้องเลือกเฉพาะ record ที่มี ins_code_order สูงกว่าเครื่องราชฯ ก่อนหน้า
    let lastReceivedOrder = null
    if (lastInsCodeForm) {
      const prevRecord = jsonData.find(
        (item) => item.ins_code_name_full === lastInsCodeForm
      )
      if (prevRecord) {
        lastReceivedOrder = prevRecord.ins_code_order
      }
      matchedRecords = matchedRecords.filter((item) => {
        return (
          lastReceivedOrder === null || item.ins_code_order > lastReceivedOrder
        )
      })
    }

    // หากพบ record ที่ตรงเงื่อนไข ให้เลือก record ที่มี order น้อยที่สุด (เรียงจากน้อยไปมาก)
    if (matchedRecords.length > 0) {
      matchedRecords.sort((a, b) => a.order - b.order)
      Swal.fire({
        title: "ผลการตรวจสอบ",
        text: "เครื่องราชฯ ที่เสนอขอ: " + matchedRecords[0].ins_code_name_full,
        icon: "success",
        confirmButtonText: "ตกลง",
      })
    } else {
      Swal.fire({
        title: "ผลการตรวจสอบ",
        text: "คุณสมบัติยังไม่ถึงเกณฑ์",
        icon: "error",
        confirmButtonText: "ตกลง",
      })
    }
  })