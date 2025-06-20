# 🎖️ Decoration Check App (แอปพลิเคชันตรวจสอบเครื่องราชอิสริยาภรณ์)

**Decoration Check App** เป็นเว็บแอปพลิเคชันที่ถูกพัฒนาขึ้นเพื่ออำนวยความสะดวกให้แก่ ข้าราชการ, ลูกจ้างประจำ, และพนักงานราชการ ในการตรวจสอบสิทธิ์การเสนอขอพระราชทานเครื่องราชอิสริยาภรณ์ประจำปีของตนเองได้อย่างรวดเร็วและแม่นยำ โดยอ้างอิงตาม **ระเบียบสำนักนายกรัฐมนตรีว่าด้วยการขอพระราชทานเครื่องราชอิสริยาภรณ์อันเป็นที่เชิดชูยิ่งช้างเผือก และเครื่องราชอิสริยาภรณ์อันมีเกียรติยศยิ่งมงกุฎไทย พ.ศ. 2564**

แอปพลิเคชันนี้ถูกออกแบบมาให้ใช้งานง่าย ผู้ใช้เพียงกรอกข้อมูลส่วนบุคคลที่เกี่ยวข้อง เช่น ประเภทบุคลากร, ตำแหน่ง, เงินเดือน, และวันที่สำคัญต่างๆ ระบบจะทำการประมวลผลและแสดงผลเครื่องราชอิสริยาภรณ์ในชั้นตราถัดไปที่ผู้ใช้มีสิทธิ์เสนอขอพระราชทานได้

---

## 🔗 ลิงก์ (Links)

* **Source Code:** [https://github.com/Arnutt-N/decoration-app](https://github.com/Arnutt-N/decoration-app)

---

## ✨ คุณสมบัติหลัก (Features)

* **ระบบตรวจสอบสิทธิ์ (Eligibility Calculator)**: หน้าหลักของแอปพลิเคชันที่ผู้ใช้สามารถกรอกข้อมูลเพื่อคำนวณสิทธิ์ของตนเองได้ทันที
* **รายการตรวจสอบ (Checklists)**: หน้าสำหรับแสดงเงื่อนไขและหลักเกณฑ์การขอพระราชทานเครื่องราชฯ ในแต่ละประเภทบุคลากรอย่างละเอียด ช่วยให้ผู้ใช้เข้าใจภาพรวมได้ง่ายขึ้น
* **อ้างอิงระเบียบราชการ**: มีลิงก์ไปยังไฟล์ PDF **ระเบียบสำนักนายกรัฐมนตรีฯ พ.ศ. 2564** ฉบับจริง เพื่อให้ผู้ใช้สามารถตรวจสอบและอ้างอิงข้อมูลได้
* **ชุดทดสอบ (Test Cases)**: มีหน้า `test_cases.html` สำหรับทดสอบตรรกะการคำนวณ เพื่อให้มั่นใจในความถูกต้องของผลลัพธ์
* **การออกแบบที่ตอบสนอง (Responsive Design)**: พัฒนาด้วย Bootstrap 5 ทำให้สามารถใช้งานได้ดีบนทุกอุปกรณ์ ไม่ว่าจะเป็นคอมพิวเตอร์, แท็บเล็ต, หรือสมาร์ทโฟน

---

## ⚙️ เทคโนโลยีที่ใช้ (Technology Stack)

* **Front-end**:
    * 🟠 **HTML5**
    * 🔵 **CSS3**
    * 🟡 **JavaScript (ES6+)**
* **Frameworks & Libraries**:
    * 🅱️ **Bootstrap 5**: สำหรับการสร้าง User Interface ที่สวยงามและตอบสนองต่อทุกขนาดหน้าจอ
    * SweetAlert2: สำหรับการแสดงผลลัพธ์และแจ้งเตือนที่สวยงาม
    * Moment.js & Tempus Dominus: สำหรับการจัดการและเลือกวันที่ (Date Picker) ในรูปแบบปีพุทธศักราช
* **Data**:
    * **JSON**: ใช้เป็นฐานข้อมูลหลักในการจัดเก็บเงื่อนไขและกฎเกณฑ์การขอพระราชทานเครื่องราชอิสริยาภรณ์ทั้งหมด (`decorationData.json` และ `checklistsData.json`)

---

## 📂 โครงสร้างไฟล์ (Project Structure)

```
/
├── index.html                  # หน้าหลักของแอปพลิเคชัน (แบบฟอร์มตรวจสอบ)
├── script.js                   # ตรรกะหลักในการคำนวณและจัดการฟอร์ม
├── style.css                   # สไตล์ชีตสำหรับหน้า index.html
├── decorationData.json         # ฐานข้อมูลคุณสมบัติและเงื่อนไขการขอเครื่องราชฯ
│
├── checklists.html             # หน้ารายการตรวจสอบเงื่อนไข
├── checklists.js               # สคริปต์สำหรับดึงและแสดงข้อมูลในหน้ารายการตรวจสอบ
├── checklists.css              # สไตล์ชีตสำหรับหน้า checklists.html
├── checklistsData.json         # ฐานข้อมูลสำหรับหน้ารายการตรวจสอบ
│
├── test_cases.html             # หน้าสำหรับรันชุดทดสอบ
├── test_cases.js               # โค้ดสำหรับรันและแสดงผลการทดสอบ
│
├── decorations-2021.pdf        # ไฟล์ระเบียบสำนักนายกรัฐมนตรีฯ พ.ศ. 2564
└── README.md                   # ไฟล์ที่คุณกำลังอ่านอยู่
```

---

## 🚀 วิธีการใช้งาน (How to Use)

1.  เปิดไฟล์ `index.html` บนเว็บเบราว์เซอร์
2.  กรอกข้อมูลในแบบฟอร์มให้ครบถ้วนตามความเป็นจริง:
    * ประเภทบุคลากร (ข้าราชการ, ลูกจ้างประจำ, พนักงานราชการ)
    * ประเภทและระดับตำแหน่ง
    * วันที่บรรจุ, วันที่เข้าสู่ระดับปัจจุบัน
    * เงินเดือนปัจจุบัน และเงินเดือนเมื่อ 5 ปีก่อน (ถ้ามี)
    * เครื่องราชอิสริยาภรณ์ชั้นล่าสุดที่ได้รับและวันที่ได้รับ (หากไม่เคยได้รับ ให้เลือก "ไม่เคยได้รับพระราชทานเครื่องราชฯ")
3.  คลิกที่ปุ่ม **"ตรวจสอบเครื่องราชฯ"**
4.  ระบบจะแสดงผลการตรวจสอบในรูปแบบ Pop-up

> 💡 **แนะนำ**: สำหรับข้อมูลภาพรวมและเงื่อนไขทั้งหมด สามารถเข้าไปดูได้ที่หน้า `checklists.html`

---

## 🛠️ การติดตั้งสำหรับนักพัฒนา (Developer Setup)

โปรเจกต์นี้เป็นเว็บไซต์แบบ Static จึงไม่จำเป็นต้องมีการติดตั้งที่ซับซ้อน สามารถเปิดไฟล์ `index.html` เพื่อใช้งานได้ทันที

อย่างไรก็ตาม เพื่อหลีกเลี่ยงปัญหา Cross-Origin (CORS) ที่อาจเกิดขึ้นเมื่อเบราว์เซอร์เรียกใช้ไฟล์ `.json` ในเครื่อง แนะนำให้รันโปรเจกต์ผ่าน Local Server

**ตัวอย่างการรันผ่าน Live Server (ส่วนขยายของ VS Code):**
1.  ติดตั้งส่วนขยาย [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) ใน Visual Studio Code
2.  คลิกขวาที่ไฟล์ `index.html`
3.  เลือก "Open with Live Server"
