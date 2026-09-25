import type { LandCategory, ResChallengeItem, QuizQuestion } from '../types/rasterMission';

export const COLS = 12;
export const ROWS = 7;

export const ESCAPE_COLS = 18;
export const ESCAPE_ROWS = 10;
export const ESCAPE_TIME_LIMIT = 45;

export const CLASSIFY_TARGET = 8;
export const CLASSIFY_TIME_LIMIT = 60;
export const CLASSIFY_TIMEOUT_PENALTY = 10;

export function elevAt(x: number, y: number, cols = COLS, rows = ROWS): number {
  const nx = x / (cols - 1);
  const ny = y / (rows - 1);
  const h =
    300 +
    900 * Math.exp(-(((nx - 0.68) ** 2) + ((ny - 0.3) ** 2)) * 9) +
    480 * Math.exp(-(((nx - 0.22) ** 2) + ((ny - 0.72) ** 2)) * 11) -
    220 * Math.exp(-(((nx - 0.48) ** 2) + ((ny - 0.52) ** 2)) * 22);
  return Math.max(0, Math.round(h));
}

export const RAMP = [
  { t: 0.0, c: [62, 110, 72] },
  { t: 0.28, c: [136, 164, 82] },
  { t: 0.5, c: [196, 178, 110] },
  { t: 0.7, c: [150, 110, 80] },
  { t: 0.85, c: [120, 120, 120] },
  { t: 1.0, c: [245, 245, 245] },
];

export function rampColor(t: number): string {
  const clamped = Math.min(1, Math.max(0, t));
  for (let i = 0; i < RAMP.length - 1; i++) {
    const a = RAMP[i];
    const b = RAMP[i + 1];
    if (clamped >= a.t && clamped <= b.t) {
      const f = (clamped - a.t) / (b.t - a.t || 1);
      const r = Math.round(a.c[0] + (b.c[0] - a.c[0]) * f);
      const g = Math.round(a.c[1] + (b.c[1] - a.c[1]) * f);
      const bl = Math.round(a.c[2] + (b.c[2] - a.c[2]) * f);
      return `rgb(${r},${g},${bl})`;
    }
  }
  return `rgb(245,245,245)`;
}

export const LAND_CATEGORIES: LandCategory[] = [
  { min: 0, max: 350, color: 'rgb(46,110,150)', label: 'พื้นที่ต่ำมาก', rangeText: '0 – 350 m' },
  { min: 351, max: 600, color: 'rgb(196,178,110)', label: 'พื้นที่ต่ำ', rangeText: '351 – 600 m' },
  { min: 601, max: 800, color: 'rgb(78,120,66)', label: 'พื้นที่สูงปานกลาง', rangeText: '601 – 800 m' },
  { min: 801, max: 1000, color: 'rgb(120,110,100)', label: 'พื้นที่สูง', rangeText: '801 – 1000 m' },
  { min: 1001, max: 9999, color: 'rgb(245,245,245)', label: 'พื้นที่สูงมาก', rangeText: '> 1000 m' },
];

export function landCoverAtElevation(elevation: number): LandCategory {
  for (const cat of LAND_CATEGORIES) {
    if (elevation <= cat.max) return cat;
  }
  return LAND_CATEGORIES[LAND_CATEGORIES.length - 1];
}

export function hillshade(x: number, y: number, grid: number[][], cols: number, rows: number): string {
  const cell = (xx: number, yy: number) =>
    grid[Math.min(rows - 1, Math.max(0, yy))][Math.min(cols - 1, Math.max(0, xx))];
  const dzdx = (cell(x + 1, y) - cell(x - 1, y)) / 2;
  const dzdy = (cell(x, y + 1) - cell(x, y - 1)) / 2;
  const slopeRad = Math.atan(Math.sqrt(dzdx * dzdx + dzdy * dzdy) / 220);
  let aspectRad = Math.atan2(dzdy, -dzdx);
  if (aspectRad < 0) aspectRad += 2 * Math.PI;
  const azimuthRad = (315 * Math.PI) / 180;
  const altitudeRad = (45 * Math.PI) / 180;
  const zenithRad = Math.PI / 2 - altitudeRad;
  let shade =
    Math.cos(zenithRad) * Math.cos(slopeRad) +
    Math.sin(zenithRad) * Math.sin(slopeRad) * Math.cos(azimuthRad - aspectRad);
  shade = Math.max(0, Math.min(1, shade));
  const v = Math.round(shade * 255);
  return `rgb(${v},${v},${v})`;
}

export const RES_PRESETS = [
  { cols: 4, rows: 3, label: 'หยาบมาก' },
  { cols: 8, rows: 5, label: 'ปานกลาง' },
  { cols: 24, rows: 14, label: 'ละเอียดมาก' },
];

export const RES_CHALLENGE: ResChallengeItem[] = [
  {
    a: 30,
    b: 10,
    question: 'Raster ใดมีความละเอียดเชิงพื้นที่สูงกว่า (ภาพคมชัดกว่า)?',
    answer: 'B',
    explain: 'ถูกต้อง! Raster B มีขนาดพิกเซล 10 เมตร ซึ่งเล็กกว่า 30 เมตร จึงเก็บรายละเอียดของวัตถุขนาดเล็กบนพื้นดินได้คมชัดกว่า ทำให้มี Spatial Resolution สูงกว่า',
  },
  {
    a: 5,
    b: 20,
    question: 'ถ้าต้องการเห็นบ้านเรือนหรือถนนซอยเล็ก ๆ ควรเลือก Raster ใด?',
    answer: 'A',
    explain: 'ถูกต้อง! ควรเลือก Raster A (5 เมตร) เพราะยิ่งขนาดพิกเซลเล็ก ภาพยิ่งมีความละเอียดเชิงพื้นที่สูง ทำให้แยกแยะวัตถุขนาดเล็กได้ชัดเจนขึ้น',
  },
  {
    a: 15,
    b: 5,
    question: 'Raster ใดมีขนาดพิกเซลเล็กกว่า?',
    answer: 'B',
    explain: 'ถูกต้อง! Raster B (5 เมตร) หมายถึง 1 พิกเซลแทนพื้นที่จริงขนาด 5x5 เมตร ซึ่งเล็กกว่าพื้นที่ 15x15 เมตรของ Raster A',
  },
  {
    a: 10,
    b: 40,
    question: 'เมื่อครอบคลุมพื้นที่เท่ากัน Raster ใดมีจำนวนพิกเซลมากกว่า?',
    answer: 'A',
    explain: 'ถูกต้อง! Raster A (10 เมตร) มีขนาดพิกเซลเล็กกว่า จึงแบ่งพื้นที่ออกเป็นช่องตารางย่อยจำนวนมากกว่า ทำให้ได้ภาพที่ละเอียดคมชัดกว่า',
  },
  {
    a: 25,
    b: 50,
    question: 'Raster ใดมีความละเอียดเชิงพื้นที่ต่ำกว่า (ภาพหยาบกว่า)?',
    answer: 'B',
    explain: 'ถูกต้อง! Raster B (50 เมตร) มีขนาดพิกเซลใหญ่ที่สุด ทำให้พื้นที่ 50x50 เมตรถูกเฉลี่ยรวมเป็นค่าเดียว ภาพจึงหยาบที่สุดและมี Spatial Resolution ต่ำที่สุด',
  },
];

export const QUESTIONS: QuizQuestion[] = [
  {
    q: 'DEM ย่อมาจากอะไร?',
    opts: ['Digital Elevation Model', 'Data Elevation Map', 'Direct Earth Measurement', 'Digital Earth Marker'],
    correct: 0,
    explain: 'DEM = Digital Elevation Model แบบจำลองความสูงเชิงเลขของพื้นผิว',
  },
  {
    q: 'ข้อมูล DEM จัดเก็บอยู่ในรูปแบบใด?',
    opts: ['Vector เป็นเส้นชั้นความสูง', 'Raster เป็นตารางเซลล์ที่มีค่าความสูง', 'ตารางฐานข้อมูลเชิงสัมพันธ์', 'ไฟล์ภาพ JPEG เท่านั้น'],
    correct: 1,
    explain: 'DEM คือข้อมูล Raster — แต่ละเซลล์ (pixel) เก็บค่าความสูงหนึ่งค่า',
  },
  {
    q: 'นอกจากความสูง (DEM) แล้ว ข้อมูลราสเตอร์ยังใช้เก็บอะไรได้อีก?',
    opts: ['เก็บได้แค่ค่าความสูงเท่านั้น', 'ภาพถ่ายดาวเทียม, การจำแนกที่ดิน (Land Cover), NDVI, ปริมาณน้ำฝน ฯลฯ', 'ใช้ได้เฉพาะกับแผนที่ถนนเท่านั้น', 'เก็บได้แค่ข้อความและตัวเลขในตารางฐานข้อมูล'],
    correct: 1,
    explain: 'ราสเตอร์เป็นวิธีเก็บข้อมูลแบบตารางเซลล์ เนื้อหาข้างในเซลล์จะเป็นอะไรก็ได้ เช่น ความสูง ค่าสี ประเภทพืชคลุมดิน อุณหภูมิ ฯลฯ DEM เป็นเพียงตัวอย่างหนึ่ง',
  },
  {
    q: 'ขนาดเซลล์ (Resolution) ของ DEM ส่งผลต่อสิ่งใดมากที่สุด?',
    opts: ['สีที่ใช้แสดงผลบนแผนที่', 'ความละเอียดและความแม่นยำของภูมิประเทศที่มองเห็น', 'ระบบพิกัดที่ใช้อ้างอิง', 'จำนวนชั้นข้อมูล (layer) ทั้งหมด'],
    correct: 1,
    explain: 'เซลล์ยิ่งเล็ก ยิ่งเก็บรายละเอียดภูมิประเทศได้มากขึ้น แต่ไฟล์ก็ใหญ่ขึ้นตามไปด้วย',
  },
  {
    q: 'เทคนิค Hillshade ที่ลองใช้ในตารางจำลอง ใช้หลักการใด?',
    opts: ['สุ่มโทนสีตามระดับความสูง', 'จำลองแสงและเงาจากความชันของภูมิประเทศ', 'วัดปริมาณน้ำฝนสะสม', 'คำนวณระยะทางระหว่างจุด'],
    correct: 1,
    explain: 'Hillshade คำนวณความชันและทิศของแต่ละเซลล์ แล้วจำลองแสงตกกระทบเพื่อให้เห็นมิติ 3 มิติโดยไม่ต้องใช้สี',
  },
  {
    q: 'ภารกิจ "หนีน้ำท่วม" ที่เพิ่งเล่น จำลองการใช้ DEM ในงานด้านใด?',
    opts: ['วิเคราะห์พื้นที่เสี่ยงน้ำท่วมและวางแผนอพยพไปที่สูง', 'จัดการฐานข้อมูลลูกค้า', 'ออกแบบกราฟิกทั่วไป', 'พยากรณ์ราคาหุ้น'],
    correct: 0,
    explain: 'DEM เป็นข้อมูลพื้นฐานสำคัญของงานวิเคราะห์น้ำท่วม (flood modeling) และการวางแผนเส้นทางอพยพไปยังพื้นที่สูง',
  },
];
