# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a Thai Royal Decoration Eligibility Check Application (แอปพลิเคชันตรวจสอบเครื่องราชอิสริยาภรณ์) - a client-side web application that helps Thai government employees, contract employees, and government workers determine their eligibility for royal decorations based on official government regulations from 2564 B.E. (2021 C.E.).

## Development Commands

### Local Development
```bash
# Serve with Live Server (VS Code extension) or any static file server
# Open index.html directly in browser for basic testing
# Use a local server to avoid CORS issues when loading JSON files
```

### Testing
- Open `test_cases.html` to run automated test cases
- No formal test framework - uses custom JavaScript test logic
- Tests validate the decoration calculation algorithm

### No Build Process
This is a static web application with no build step required. All files are served directly.

## Architecture Overview

### Application Structure
The app consists of two main sections:
1. **Main Form** (`index.html`) - User eligibility calculation interface
2. **Reference Tables** (`checklists.html`) - Detailed criteria displays

### Core Data Flow
```
User Input (Form) → Validation → Data Processing → JSON Rules Engine → Result Display
```

### Key Algorithmic Logic
Located in `script.js:calculateDecoration()` function:

1. **Service Period Calculation**: Uses Buddhist Era dates (current year + 543)
2. **Hierarchy Validation**: Checks if user already has highest decoration for their level
3. **Consecutive Year Prevention**: Blocks applications in consecutive years
4. **Multi-Criteria Filtering**: 
   - Personnel type matching
   - Position type/level requirements
   - Service duration requirements (beginning service, position level duration)
   - Salary thresholds (current + 5-year historical)
   - Previous decoration prerequisites
5. **Decoration Ordering**: Selects next eligible decoration by hierarchical order

### Data Architecture

#### Primary Data Structure (`decorationData.json`)
- **decorData**: Array of 86 rule objects covering all personnel categories
- Each rule defines eligibility criteria including:
  - Personnel classification (ข้าราชการ, ลูกจ้างประจำ, พนักงานราชการ)
  - Position types and levels
  - Service duration requirements
  - Salary thresholds
  - Prerequisite decorations
  - Decoration hierarchy (`ins_code_order` for ranking)

#### Reference Data (`checklistsData.json`)
- Human-readable summaries of eligibility criteria
- Used for the reference tables display
- Includes templated remarks with year calculations

### Form Validation System
- Real-time validation with Bootstrap classes
- Custom date validation using Moment.js
- Hierarchical dropdown population based on JSON data
- Special handling for "never received decoration" option

### Date Handling
- **Buddhist Era Calendar**: All dates use Thai Buddhist calendar (C.E. + 543)
- **Tempus Dominus**: Date picker library for consistent date input
- **Critical Dates**:
  - May 28: Position level eligibility cutoff
  - July 28: Previous decoration eligibility cutoff
  - April 1: Historical salary reference point

### UI/UX Architecture
- **Bootstrap 5**: Responsive design framework
- **SweetAlert2**: Enhanced result display dialogs  
- **Font Awesome**: Icons throughout interface
- **Moment.js**: Date parsing and formatting
- **Progressive Enhancement**: Works without JavaScript for basic functionality

## Key Files and Responsibilities

### Core Application Files
- `index.html`: Main eligibility form interface
- `script.js`: Business logic, validation, and calculation engine (~850 lines)
- `style.css`: Custom styling for main form
- `decorationData.json`: Complete rules engine data (86 rules, ~1700 lines)

### Reference System
- `checklists.html`: Tabular display of all criteria
- `checklists.js`: Table rendering and search functionality
- `checklists.css`: Styling for reference tables
- `checklistsData.json`: Human-readable criteria summaries (80+ entries)

### Documentation
- `decorations-2021.pdf`: Official government regulation document
- `README.md`: Project documentation in Thai
- Various test case documentation in `project-log-md/`

## Data Relationships

### Personnel Hierarchy
```
ข้าราชการ (Government Officials)
├── ทั่วไป (General): ปฏิบัติงาน → ชำนาญงาน → อาวุโส → ทักษะพิเศษ
├── วิชาการ (Academic): ปฏิบัติการ → ชำนาญการ → ชำนาญการพิเศษ → เชี่ยวชาญ → ทรงคุณวุฒิ
├── อำนวยการ (Administrative): ต้น → สูง
└── บริหาร (Executive): ต้น → สูง

ลูกจ้างประจำ (Contract Employees)
├── ค่าจ้าง 8,340-15,050 บาท
└── ค่าจ้าง 15,050+ บาท

พนักงานราชการ (Government Workers)
├── กลุ่มงานบริการ/เทคนิค (Service/Technical)
├── กลุ่มงานบริหารทั่วไป (General Administration)
├── กลุ่มงานวิชาชีพเฉพาะ (Specialized Professional)
└── กลุ่มงานเชี่ยวชาญพิเศษ (Special Expert): ทั่วไป → ประเทศ → สากล
```

### Decoration Hierarchy (ins_code_order)
```
5: บ.ม. (Benjamaphorn Mongkut Thai)
6: บ.ช. (Benjamaphorn Chang Phueak)  
7: จ.ม. (Chattuthaphorn Mongkut Thai)
8: จ.ช. (Chattuthaphorn Chang Phueak)
9: ต.ม. (Tritaphorn Mongkut Thai)
10: ต.ช. (Tritaphorn Chang Phueak)
11: ท.ม. (Thwitiyaphorn Mongkut Thai)  
12: ท.ช. (Thwitiyaphorn Chang Phueak)
13: ป.ม. (Prathomaphorn Mongkut Thai)
14: ป.ช. (Prathomaphorn Chang Phueak)
15: ม.ว.ม. (Mahawachira Mongkut)
16: ม.ป.ช. (Mahapramaphorn Chang Phueak)
```

## Important Implementation Details

### Complex Business Rules
- **Salary-Based Eligibility**: Some positions require specific salary thresholds at different time periods
- **Historical Salary Checks**: 5-year lookback for certain positions using April 1st reference dates
- **Position Amount Overrides**: Special salary considerations for high-ranking positions
- **Consecutive Year Blocking**: Prevents decoration requests in consecutive calendar years
- **Highest Decoration Detection**: Automatically prevents requests when user has reached maximum level

### Error-Prone Areas
- **Date Format Consistency**: Buddhist vs. Gregorian calendar conversions
- **Null Handling**: Many optional fields require careful null checks
- **Position Hierarchy**: Complex cascading dropdown logic dependent on data relationships  
- **Edge Case Handling**: Special rules for various government position classifications

### Performance Considerations
- **Client-Side Processing**: All calculations performed in browser
- **Large JSON Parsing**: 1700+ lines of rules data loaded on page load
- **Search Optimization**: Table filtering implemented with efficient string matching

## Deployment

### Static Hosting
- Designed for deployment to Vercel, GitHub Pages, or any static hosting
- `vercel.json`: Basic configuration file (currently empty)
- No server-side dependencies or build requirements

### Browser Compatibility  
- Modern browsers supporting ES6+ features
- Requires JavaScript enabled for full functionality
- Responsive design works on mobile devices

## Common Development Patterns

### JSON Data Access
```javascript
// Standard pattern for accessing rules data
const data = await fetchData(); // Loads decorationData.json
const filteredData = data.decorData.filter(item => {
    // Apply business logic criteria
    return item.personal_type === selectedType;
});
```

### Date Calculations
```javascript
// Buddhist Era conversion pattern
const currentYearBE = new Date().getFullYear() + 543;
const period = calculatePeriodInYears(startDate, endDate); // Using Moment.js
```

### Validation Patterns
```javascript
// Form validation with Bootstrap integration
function validateForm() {
    let isValid = true;
    // Field-specific validation logic
    // Bootstrap class management for visual feedback
    return isValid;
}
```