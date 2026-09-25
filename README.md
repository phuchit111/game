# GIS Journey — GIS Mission Platform

แพลตฟอร์มเกมการเรียนรู้ GIS แบบโต้ตอบ ผู้เล่นจะทำภารกิจบนแผนที่และเรียนรู้แนวคิดพื้นฐานของระบบสารสนเทศภูมิศาสตร์ ตั้งแต่ Attribute Table, Vector, Raster, Remote Sensing ไปจนถึง Coordinate System

โปรเจ็กต์นี้แบ่งเป็น 3 ส่วนหลัก

- `client` — Frontend ด้วย React + TypeScript + Vite
- `server` — Backend API ด้วย Node.js + Express
- `database` — สคริปต์เริ่มต้นฐานข้อมูล PostgreSQL

## ความสามารถหลัก

- ระบบผู้เล่นและบันทึกความคืบหน้าในเบราว์เซอร์
- ภารกิจ GIS ทั้งหมด 5 ด่าน
- แผนที่แบบโต้ตอบด้วย Leaflet
- แบบฝึกหัด Point, Line และ Polygon
- แบบฝึกหัด Raster, DEM และ Resolution
- แบบฝึกหัด Remote Sensing และการผสม Spectral Bands
- แบบฝึกหัด UTM, WGS84, Latitude และ Longitude
- กระดานคะแนนแยกตามภารกิจ
- ใช้ PostgreSQL เป็นฐานข้อมูลหลัก และมี `localStorage` เป็น fallback เมื่อ API ใช้งานไม่ได้

## เทคโนโลยีที่ใช้

| ส่วน | เทคโนโลยี |
| --- | --- |
| Frontend | React 19, TypeScript, Vite 8, Zustand |
| แผนที่ | Leaflet, Leaflet Draw, OpenStreetMap, ArcGIS World Imagery |
| ภาพ 3 มิติ | Three.js |
| Backend | Node.js, Express, CORS, dotenv |
| Database | PostgreSQL 16 ผ่าน Docker Compose |

## สิ่งที่ต้องติดตั้งก่อน

1. Node.js ที่รองรับ Vite 8: `^20.19.0` หรือ `>=22.12.0`
2. npm ซึ่งติดมากับ Node.js
3. Docker Desktop และ Docker Compose หากต้องการใช้ backend กับ PostgreSQL แบบเต็มระบบ
4. อินเทอร์เน็ตสำหรับแผนที่ ภาพประกอบ ฟอนต์ และวิดีโอจากบริการภายนอก

ตรวจสอบเวอร์ชันที่ติดตั้งได้ด้วยคำสั่ง:

```bash
node --version
npm --version
docker compose version
```

## วิธีติดตั้งโปรเจ็กต์

เปิด Terminal ที่โฟลเดอร์รากของโปรเจ็กต์ แล้วติดตั้ง dependency ของแต่ละส่วน:

```bash
npm install --prefix client
npm install --prefix server
```

> โปรเจ็กต์นี้ไม่มี dependency ที่ต้องติดตั้งใน root โดยตรง จึงต้องติดตั้งแยกใน `client` และ `server`

## วิธีรันแบบเต็มระบบ

### 1. เริ่ม PostgreSQL

```bash
npm run db:up
```

คำสั่งนี้จะสร้าง container ชื่อ `attribute-gis-db` และเปิด PostgreSQL ที่พอร์ต `5433` ของเครื่อง โดยฐานข้อมูลเริ่มต้นมีค่าดังนี้:

| รายการ | ค่าเริ่มต้น |
| --- | --- |
| Host | `localhost` |
| Port | `5433` |
| Database | `attribute_mission` |
| User | `gis_admin` |
| Password | `gis_secret_pass` |

ตรวจสอบว่า container ทำงานอยู่หรือไม่:

```bash
docker compose ps
```

สถานะของ service ควรเป็น `running` หรือ health check ผ่านแล้ว

### 2. ตรวจสอบการตั้งค่า Backend

Backend อ่านค่าจากไฟล์ `server/.env` โดยรองรับตัวแปรต่อไปนี้:

```env
PORT=3001
DATABASE_URL=postgres://gis_admin:gis_secret_pass@localhost:5433/attribute_mission
```

หากไม่มี `server/.env` ระบบจะใช้ค่าเริ่มต้นของ `PORT` และ `DATABASE_URL` จากโค้ด `server/src/db.js` โดยอัตโนมัติ

สำหรับการใช้งานจริง ควรเปลี่ยนรหัสผ่านฐานข้อมูลและไม่ commit ค่า secret ลง Git

### 3. รัน Backend

เปิด Terminal หน้าต่างที่ 1:

```bash
npm run server
```

หรือใช้โหมด watch สำหรับการพัฒนา:

```bash
npm --prefix server run dev
```

เมื่อเริ่มทำงานสำเร็จ Backend จะให้บริการที่:

```text
http://localhost:3001
```

ทดสอบด้วย health check:

```text
http://localhost:3001/api/health
```

ผลลัพธ์ที่คาดหวังเมื่อเชื่อมต่อฐานข้อมูลสำเร็จ:

```json
{
  "status": "healthy",
  "database": "connected"
}
```

### 4. รัน Frontend

เปิด Terminal หน้าต่างที่ 2:

```bash
npm run dev
```

จากนั้นเปิดเว็บไซต์:

```text
http://localhost:5173
```

ในโหมด development Vite จะ proxy request ที่ขึ้นต้นด้วย `/api` ไปยัง `http://localhost:3001` ตามการตั้งค่าใน `client/vite.config.ts`

### 5. ลำดับการเปิดใช้งานที่แนะนำ

ให้เปิดใช้งานตามลำดับนี้:

```text
PostgreSQL → Backend API → Frontend
```

เมื่อเปิดหน้าเว็บแล้ว ให้กรอกชื่อผู้เล่น จากนั้นเลือกภารกิจที่ต้องการเล่นจากหน้า Mission Hub

## วิธีรัน Frontend อย่างเดียว

หากต้องการดูหน้าจอหรือทดสอบเกมโดยไม่เปิด Docker และ Backend สามารถรันเฉพาะ frontend ได้:

```bash
npm install --prefix client
npm run dev
```

เกมจะยังเปิดใช้งานได้ แต่การอ่านและบันทึกคะแนนจะ fallback ไปที่ `localStorage` ของเบราว์เซอร์แทนฐานข้อมูลกลาง

## คำสั่งที่ใช้บ่อย

รันจากโฟลเดอร์ root:

| คำสั่ง | หน้าที่ |
| --- | --- |
| `npm run dev` | รัน Frontend ในโหมด development |
| `npm run client` | เหมือน `npm run dev` |
| `npm run server` | รัน Backend API |
| `npm run build` | ตรวจ TypeScript และ build Frontend สำหรับ deploy |
| `npm run db:up` | สร้าง/เริ่ม PostgreSQL container |
| `npm run db:down` | หยุดและลบ container แต่เก็บข้อมูลใน volume ไว้ |

คำสั่งภายในแต่ละโฟลเดอร์:

```bash
npm --prefix client run build
npm --prefix client run preview
npm --prefix client run lint
npm --prefix server run dev
```

## เส้นทางหน้าเว็บ

ระบบใช้ route แบบไม่พึ่ง routing library เพิ่มเติม:

| URL | หน้า |
| --- | --- |
| `/` | Welcome และกรอกชื่อผู้เล่น |
| `/missions` | Mission Hub |
| `/missions/attribute` | Attribute Table Mission |
| `/missions/vector` | Vector Mission |
| `/missions/raster` | Raster Mission |
| `/missions/rs` | Remote Sensing Mission |
| `/missions/coordinate` | Coordinate System Mission |

## API

Base URL ในโหมด development คือ `http://localhost:3001/api` หรือเรียกผ่าน Vite proxy ที่ `/api`

### ตรวจสอบสถานะระบบ

```http
GET /api/health
```

ตัวอย่าง:

```bash
curl http://localhost:3001/api/health
```

### อ่านกระดานคะแนน

```http
GET /api/leaderboard?mission=attribute
```

ค่า `mission` ที่รองรับ:

```text
attribute, vector, raster, rs, coordinate
```

ระบบส่งคืนคะแนนสูงสุด 20 รายการ เรียงจากคะแนนมากไปน้อย

### บันทึกคะแนน

```http
POST /api/leaderboard
Content-Type: application/json
```

ตัวอย่าง request body:

```json
{
  "name": "GIS Explorer",
  "score": 145,
  "mode": "table",
  "mission": "attribute"
}
```

ข้อจำกัดของข้อมูล:

- `name` ต้องเป็นข้อความที่ไม่ว่าง และระบบจะตัดความยาวไม่เกิน 30 ตัวอักษรใน Backend
- `score` ต้องเป็นตัวเลข
- `mode` มีความยาวไม่เกิน 20 ตัวอักษร
- `mission` ที่ไม่อยู่ในรายการที่รองรับจะถูกเปลี่ยนเป็น `attribute`

หลังบันทึกสำเร็จ API จะส่ง record ที่บันทึก, อันดับของผู้เล่น และรายการ Top 20 กลับมา

## การเก็บข้อมูล

### PostgreSQL

ข้อมูลกระดานคะแนนถูกเก็บในตาราง `leaderboard` ซึ่งสร้างจาก `database/init.sql` หรือถูกสร้างซ้ำโดย `server/src/db.js` หากยังไม่มีตาราง

Docker Compose ใช้ named volume ชื่อ `postgres_data` ทำให้ข้อมูลยังอยู่แม้หยุด container ด้วย:

```bash
npm run db:down
```

### Browser localStorage

Frontend ใช้ `localStorage` สำหรับ:

- โปรไฟล์ผู้เล่นและความคืบหน้า: `gis_mission_player_profile`
- กระดานคะแนน fallback: `attribute_mission_leaderboard`

หาก API ติดต่อไม่ได้ เว็บไซต์จะแสดงผลและบันทึกคะแนนในเบราว์เซอร์เครื่องนั้นแทน

## โครงสร้างโฟลเดอร์

```text
.
├── client/
│   ├── public/              # รูปภาพและไฟล์ static
│   ├── src/
│   │   ├── components/      # หน้าจอและ component ของแต่ละภารกิจ
│   │   ├── constants/       # ข้อมูลโจทย์และค่าตั้งต้นของเกม
│   │   ├── services/        # การเรียก Backend API
│   │   ├── store/           # Zustand stores และสถานะเกม
│   │   ├── types/            # TypeScript types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── server/
│   ├── src/
│   │   ├── db.js            # PostgreSQL connection และ init table
│   │   └── server.js        # Express API
│   ├── .env                 # ค่าตั้งค่าเฉพาะเครื่อง
│   └── package.json
├── database/
│   └── init.sql              # schema และข้อมูลเริ่มต้น
├── docker-compose.yml
├── package.json
└── README.md
```

## Build และเตรียม Deploy

ตรวจสอบว่า Frontend build ได้:

```bash
npm run build
```

ไฟล์ผลลัพธ์จะอยู่ใน `client/dist`

สามารถ preview ไฟล์ที่ build แล้วได้ด้วย:

```bash
npm --prefix client run preview
```

> หมายเหตุ: `vite preview` เป็นเซิร์ฟเวอร์สำหรับตรวจสอบ build ไม่ใช่ production server เต็มรูปแบบ และโค้ดบางส่วนของ frontend เรียก `/api` โดยตรง ดังนั้นการ deploy จริงควรตั้ง reverse proxy ให้ `/api` ชี้ไปยัง Backend หรือปรับค่า API base URL ให้เหมาะกับโดเมนที่ใช้งาน

## การแก้ปัญหาเบื้องต้น

### เปิดเว็บไม่ได้ที่ `localhost:5173`

ตรวจสอบว่าเปิด frontend แล้วหรือยัง:

```bash
npm run dev
```

หากพอร์ต `5173` ถูกใช้งานอยู่ Vite จะเลือกพอร์ตถัดไป ให้ดู URL ที่แสดงใน Terminal แล้วเปิด URL นั้น

### Backend เชื่อมต่อฐานข้อมูลไม่ได้

ตรวจสอบตามลำดับ:

```bash
docker compose ps
docker compose logs database
```

ตรวจสอบว่า `DATABASE_URL` ใช้พอร์ต `5433` ซึ่งเป็นพอร์ตของเครื่อง host ไม่ใช่พอร์ตภายใน container (`5432`)

จากนั้น restart Backend:

```bash
npm run server
```

### หน้าเว็บขึ้นว่าใช้ LocalStorage หรือคะแนนไม่รวมกับเครื่องอื่น

หมายความว่า Frontend ติดต่อ Backend ไม่สำเร็จ ให้ตรวจสอบว่า:

1. PostgreSQL ทำงานอยู่
2. Backend ทำงานที่พอร์ต `3001`
3. เปิด Frontend ผ่าน `http://localhost:5173`
4. เปิด `http://localhost:3001/api/health` แล้วได้สถานะ `healthy`

### แก้ `database/init.sql` แล้วข้อมูลไม่เปลี่ยน

ไฟล์ `init.sql` ของ PostgreSQL จะทำงานอัตโนมัติเฉพาะตอนสร้าง data directory ครั้งแรก หากต้องการเริ่มฐานข้อมูลใหม่ให้ใช้คำสั่งต่อไปนี้ด้วยความระมัดระวัง เพราะจะลบข้อมูลใน volume:

```bash
docker compose down -v
npm run db:up
```

### แผนที่หรือภาพบางส่วนไม่แสดง

แผนที่และ asset บางรายการโหลดจากบริการภายนอก เช่น OpenStreetMap, ArcGIS, Google Fonts, YouTube และ URL รูปภาพของสถานที่ต่าง ๆ จึงต้องมีอินเทอร์เน็ตและบริการเหล่านั้นต้องไม่ถูกบล็อกโดยเครือข่าย

## หมายเหตุสำหรับการพัฒนา

- แก้โค้ดใน `client/src` แล้ว Vite จะทำ Hot Module Replacement ให้อัตโนมัติ
- แก้โค้ด Backend ในโหมด `npm --prefix server run dev` แล้ว Node.js จะ restart ด้วย `--watch`
- อย่าเก็บรหัสผ่านจริงหรือ connection string ที่เป็นความลับไว้ใน Git
- ก่อนส่งงานควรรัน `npm run build` เพื่อเช็ก TypeScript และ build error
