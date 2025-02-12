const testCases = [
  {
    caseNum: 1,
    description:
      "ข้าราชการ - ทั่วไป/ปฏิบัติงาน, >=5,<10 years, salary <10190, never requested (Pass)",
    input: {
      personal_type_input: "ข้าราชการ",
      pos_type_input: "ทั่วไป",
      pos_lev_input: "ปฏิบัติงาน",
      beg_pos_date_input: "01/01/2560",
      pos_lev_date_input: null,
      salary_input: 10000,
      salary5y_input: null,
      last_ins_code_name_full_input: null,
      last_ins_date_input: null,
    },
    expected: "เครื่องราชอิสริยาภรณ์ชั้นถัดไป: เบญจมาภรณ์มงกุฎไทย (บ.ม.)",
  },
  {
    caseNum: 2,
    description:
      "พนักงานราชการ - กลุ่มงานเชี่ยวชาญพิเศษ/ทั่วไป, >=5 years, never requested (Pass)",
    input: {
      personal_type_input: "พนักงานราชการ",
      pos_type_input: "กลุ่มงานเชี่ยวชาญพิเศษ",
      pos_lev_input: "ทั่วไป",
      beg_pos_date_input: "01/01/2563",
      pos_lev_date_input: null,
      salary_input: 50000,
      salary5y_input: null,
      last_ins_code_name_full_input: null,
      last_ins_date_input: null,
    },
    expected: "เครื่องราชอิสริยาภรณ์ชั้นถัดไป: ตริตาภรณ์มงกุฎไทย (ต.ม.)",
  },
  {
    caseNum: 3,
    description:
      "ข้าราชการ - ทั่วไป/ปฏิบัติงาน, <5 years, salary <10190, never requested (Fail)",
    input: {
      personal_type_input: "ข้าราชการ",
      pos_type_input: "ทั่วไป",
      pos_lev_input: "ปฏิบัติงาน",
      beg_pos_date_input: "01/01/2566", // Less than 5 years
      pos_lev_date_input: null,
      salary_input: 10000,
      salary5y_input: null,
      last_ins_code_name_full_input: null,
      last_ins_date_input: null,
    },
    expected: "คุณสมบัติไม่ถึงเกณฑ์",
  },
  {
    caseNum: 4,
    description:
      "ลูกจ้างประจำ - ค่าจ้าง 8,340 แต่ไม่ถึง 15,050, >=8 years, last_ins_code บ.ม. (Pass)",
    input: {
      personal_type_input: "ลูกจ้างประจำ",
      pos_type_input: "ค่าจ้าง 8,340 แต่ไม่ถึง 15,050",
      pos_lev_input: "ทุกระดับตำแหน่ง",
      beg_pos_date_input: "01/01/2555", // More than 8 years
      pos_lev_date_input: null,
      salary_input: 10000,
      salary5y_input: null,
      last_ins_code_name_full_input: "เบญจมาภรณ์มงกุฎไทย (บ.ม.)",
      last_ins_date_input: "01/01/2560",
    },
    expected: "เครื่องราชอิสริยาภรณ์ชั้นถัดไป: เบญจมาภรณ์ช้างเผือก (บ.ช.)",
  },
  {
    caseNum: 5,
    description:
      "พนักงานราชการ - กลุ่มงานบริการ, >=5 years, last_ins_code null (Pass)",
    input: {
      personal_type_input: "พนักงานราชการ",
      pos_type_input: "กลุ่มงานบริการ",
      pos_lev_input: "ไม่มีระดับตำแหน่ง",
      beg_pos_date_input: "01/01/2560", // More than 5 years
      pos_lev_date_input: null,
      salary_input: null,
      salary5y_input: null,
      last_ins_code_name_full_input: null,
      last_ins_date_input: null,
    },
    expected: "เครื่องราชอิสริยาภรณ์ชั้นถัดไป: เบญจมาภรณ์มงกุฎไทย (บ.ม.)",
  },
  {
    caseNum: 6,
    description:
      "ข้าราชการ - วิชาการ/ชำนาญการ, >=5 years, salary >=22140, salary5y >=22140, last_ins_code null (Pass)",
    input: {
      personal_type_input: "ข้าราชการ",
      pos_type_input: "วิชาการ",
      pos_lev_input: "ชำนาญการ",
      beg_pos_date_input: "01/01/2558",
      pos_lev_date_input: null,
      salary_input: 25000,
      salary5y_input: 23000,
      last_ins_code_name_full_input: null,
      last_ins_date_input: null,
    },
    expected: "เครื่องราชอิสริยาภรณ์ชั้นถัดไป: ทวีติยาภรณ์ช้างเผือก (ท.ช.)",
  },
  {
    caseNum: 7,
    description:
      "ข้าราชการ - วิชาการ/ทรงคุณวุฒิ (เงิน ป.จ.ต. 13,000), >=5 years, last_ins_code ท.ม., last_ins_period >=1 (Pass)",
    input: {
      personal_type_input: "ข้าราชการ",
      pos_type_input: "วิชาการ",
      pos_lev_input: "ทรงคุณวุฒิ (เงิน ป.จ.ต. 13,000)",
      beg_pos_date_input: "01/01/2558",
      pos_lev_date_input: null,
      salary_input: null,
      salary5y_input: null,
      last_ins_code_name_full_input: "ทวีติยาภรณ์มงกุฎไทย (ท.ม.)",
      last_ins_date_input: "01/01/2565",
    },
    expected: "เครื่องราชอิสริยาภรณ์ชั้นถัดไป: ทวีติยาภรณ์ช้างเผือก (ท.ช.)",
  },
  {
    caseNum: 8,
    description:
      "ข้าราชการ - อำนวยการ/ต้น, >=5 years, salary >=58390, last_ins_code ท.ช., last_ins_period >=3 (Pass)",
    input: {
      personal_type_input: "ข้าราชการ",
      pos_type_input: "อำนวยการ",
      pos_lev_input: "ต้น",
      beg_pos_date_input: "01/01/2558",
      pos_lev_date_input: null,
      salary_input: 60000,
      salary5y_input: null,
      last_ins_code_name_full_input: "ทวีติยาภรณ์ช้างเผือก (ท.ช.)",
      last_ins_date_input: "01/01/2563",
    },
    expected: "เครื่องราชอิสริยาภรณ์ชั้นถัดไป: ประถมาภรณ์มงกุฎไทย (ป.ม.)",
  },
  {
    caseNum: 9,
    description:
      "ลูกจ้างประจำ - ค่าจ้าง 15,050 ขึ้นไป, >=8 years, last_ins_code จ.ม., last_ins_period >=5 (Pass)",
    input: {
      personal_type_input: "ลูกจ้างประจำ",
      pos_type_input: "ค่าจ้าง 15,050 ขึ้นไป",
      pos_lev_input: "ทุกระดับตำแหน่ง",
      beg_pos_date_input: "01/01/2555",
      pos_lev_date_input: null,
      salary_input: 16000,
      salary5y_input: null,
      last_ins_code_name_full_input: "จัตุรถาภรณ์มงกุฎไทย (จ.ม.)",
      last_ins_date_input: "01/01/2560",
    },
    expected: "เครื่องราชอิสริยาภรณ์ชั้นถัดไป: จัตุรถาภรณ์ช้างเผือก (จ.ช.)",
  },
  {
    caseNum: 10,
    description:
      "พนักงานราชการ - กลุ่มงานเชี่ยวชาญพิเศษ/สากล, >=5 years, last_ins_code ท.ช., last_ins_period >=3 (Pass)",
    input: {
      personal_type_input: "พนักงานราชการ",
      pos_type_input: "กลุ่มงานเชี่ยวชาญพิเศษ",
      pos_lev_input: "สากล",
      beg_pos_date_input: "01/01/2560",
      pos_lev_date_input: null,
      salary_input: null,
      salary5y_input: null,
      last_ins_code_name_full_input: "ทวีติยาภรณ์ช้างเผือก (ท.ช.)",
      last_ins_date_input: "01/01/2563",
    },
    expected: "เครื่องราชอิสริยาภรณ์ชั้นถัดไป: ประถมาภรณ์มงกุฎไทย (ป.ม.)",
  },
  {
    caseNum: 11,
    description:
      "ข้าราชการ - ทั่วไป/ปฏิบัติงาน, >=5,<10 years, salary <10190, already highest (Fail)",
    input: {
      personal_type_input: "ข้าราชการ",
      pos_type_input: "ทั่วไป",
      pos_lev_input: "ปฏิบัติงาน",
      beg_pos_date_input: "01/01/2560",
      pos_lev_date_input: null,
      salary_input: 10000,
      salary5y_input: null,
      last_ins_code_name_full_input: "จัตุรถาภรณ์ช้างเผือก (จ.ช.)",
      last_ins_date_input: "01/01/2560",
    },
    expected: "ได้รับพระราชทานเครื่องราชฯ ชั้นสูงสุดของระดับตำแหน่งแล้ว",
  },
  {
    caseNum: 12,
    description: "Invalid Input - Date format",
    input: {
      personal_type_input: "ข้าราชการ",
      pos_type_input: "ทั่วไป",
      pos_lev_input: "ปฏิบัติงาน",
      beg_pos_date_input: "2023-01-01", // Invalid date format
      pos_lev_date_input: null,
      salary_input: 10000,
      salary5y_input: null,
      last_ins_code_name_full_input: null,
      last_ins_date_input: null,
    },
    expected: "คุณสมบัติไม่ถึงเกณฑ์",
  },
  {
    caseNum: 13,
    description: "Invalid Input - salary is string",
    input: {
      personal_type_input: "ข้าราชการ",
      pos_type_input: "ทั่วไป",
      pos_lev_input: "ปฏิบัติงาน",
      beg_pos_date_input: "01/01/2560",
      pos_lev_date_input: null,
      salary_input: "abc",
      salary5y_input: null,
      last_ins_code_name_full_input: null,
      last_ins_date_input: null,
    },
    expected: "คุณสมบัติไม่ถึงเกณฑ์",
  },
  // Add more test cases here
]
