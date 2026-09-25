import type { KKULocation, StageScoreConfig } from '../types/vectorMission';

export const ALL_LOCATIONS: KKULocation[] = [
  { name: "วิทยาลัยนานาชาติ", lat: 16.474351, lng: 102.829307, img: "https://scontent.fbkk29-4.fna.fbcdn.net/v/t1.6435-9/112532982_3463004383743035_3480415720050634255_n.jpg" },
  { name: "วิทยาลัยการคอมพิวเตอร์", lat: 16.475643, lng: 102.825546, img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTwNHR6APjYmJIzj8w87eHZZIK6jPGQlM4IFg&s" },
  { name: "คณะมนุษยศาสตร์และสังคมศาสตร์", lat: 16.474480, lng: 102.826260, img: "https://1.bp.blogspot.com/-COyfTTKXW5w/Vk3sFyQN4XI/AAAAAAAAAjc/x-i9f5s9rLQ/s1600/20151117_094523.jpg" },
  { name: "คณะบริหารธุรกิจและการบัญชี", lat: 16.474346, lng: 102.825433, img: "https://www.kku.ac.th/wp-content/uploads/2021/02/kkbs01.jpg" },
  { name: "คณะศึกษาศาสตร์", lat: 16.473317, lng: 102.827209, img: "https://ednet.kku.ac.th/site/wp-content/uploads/2024/01/Z6X_4121-Edit-2.jpg" },
  { name: "คณะสถาปัตยกรรมศาสตร์", lat: 16.472098, lng: 102.827639, img: "https://www.u-review.in.th/timthumb.php?src=/uploads/contents/20160811142552uE0fuxK.jpg&w=923&h=520" },
  { name: "คณะวิศวกรรมศาสตร์", lat: 16.473225, lng: 102.823108, img: "https://www.en.kku.ac.th/web/wp-content/uploads/2016/03/C-1-of-1-1024x650.jpg" },
  { name: "คณะสาธารณสุขศาสตร์", lat: 16.470792, lng: 102.824821, img: "https://admissions.kku.ac.th/wp-content/uploads/2021/08/ph1.jpg" },
  { name: "คณะศิลปกรรมศาสตร์", lat: 16.469176, lng: 102.816979, img: "https://pbs.twimg.com/media/Cv8oDgSUEAAKajs.jpg" },
  { name: "โรงพยาบาลศรีนครินทร์", lat: 16.468209, lng: 102.830048, img: "https://www.smckku.com/wp-content/uploads/2019/12/smc_building.jpg" },
  { name: "อุทยานวิทยาศาสตร์", lat: 16.455667, lng: 102.820676, img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSg_43M-DMDURoK89YX0O72dqtxc9mYGDayzw&s" },
  { name: "สระพลาสติก", lat: 16.472906, lng: 102.819468, img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhZDQZ1xQ_8ph5jV0UVE0w85M98BrNBjNoYmt-hwN7vrnkpc8Etpf2p5JYjbKVVeQoISODwOKeiFtn5QXh0ItQj_AmHkd06-890W_cO811hNOZRNFBhcDucgX4xZb_QLERQS9B41sJnBW5p/s1600/10807818_794522360586578_206667550_n.jpg" },
  { name: "วัดป่าอดุลยาราม", lat: 16.462766, lng: 102.822397, img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRd5vvbium5CZkConMq1KrLxIU1sqJYaFTI0w&s" },
  { name: "บึงหนองแวง", lat: 16.458661, lng: 102.828856, img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSUxl6QimuHtfqrePCPkCcvYR2yUY03NvoJGg&s" },
  { name: "ตลาด 62 block", lat: 16.457020, lng: 102.822123, img: "https://i.ytimg.com/vi/BV75KqfubsI/sddefault.jpg" },
  { name: "สนามกีฬากลาง", lat: 16.476774, lng: 102.817698, img: "https://sdg.kku.ac.th/wp-content/uploads/2024/11/%E0%B8%AA%E0%B8%99%E0%B8%B2%E0%B8%A1%E0%B8%81%E0%B8%B5%E0%B8%AC%E0%B8%B2-50-%E0%B8%9B%E0%B8%B5-%E0%B8%A1%E0%B8%82-2-1024x773.jpg" },
  { name: "ศูนย์อาหารและบริการ 1 (คอมเพล็กซ์)", lat: 16.477459, lng: 102.823212, img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjpZUWV4tlEzqoT19Vgx8_XVEe5XgW7DEN2g&s" },
  { name: "ศูนย์อาหารและบริการ 2 (โรงชาย)", lat: 16.478055, lng: 102.819725, img: "https://asset.kku.ac.th/wp-content/uploads/2022/05/2022-05-11_06-52-41_439654-1024x683.jpg" },
  { name: "เซ็นทรัลขอนแก่น 2", lat: 16.462530, lng: 102.830400, img: "https://kkdata.khonkaenlink.info/wp-content/uploads/2025/03/Central-Khonkaen-Campus-2.webp" },
  { name: "ตลาดหอแปด", lat: 16.478976, lng: 102.809957, img: "https://cms.dmpcdn.com/ugcarticle/2020/04/13/4443b330-3c15-11ec-b3eb-23db133242d4_original.jpg" },
  { name: "อาคารพลศึกษาเอนกประสงค์ (ยิมใหม่)", lat: 16.476569, lng: 102.814195, img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5mSwO72Ntj6qOW9jSYZMkhjYdkpHtdfiVYw&s" }
];

export const PLASTIC_POND_BOUNDS: [number, number][] = [
  [16.473158, 102.817966],
  [16.471790, 102.819104],
  [16.472705, 102.820338],
  [16.473508, 102.820574],
  [16.474012, 102.820101],
  [16.474125, 102.819329]
];

export const SCORE_CONFIG: Record<'point' | 'line' | 'polygon', StageScoreConfig> = {
  point:   { base: 12, rounds: 3, time: 60 },
  line:    { base: 12, rounds: 3, time: 100 },
  polygon: { base: 28, rounds: 1, time: 90 }
};

export const STAGE_INFO = {
  1: {
    title: "ข้อมูลจุด (Point Feature) และ Attribute Data",
    body: "Point ประกอบด้วยพิกัด (x, y) เพียงคู่เดียว ไม่มีความยาวหรือพื้นที่ในทางเรขาคณิต แต่คุณค่าที่แท้จริงของมันมาจาก <b>Attribute Table</b> — ข้อมูลเชิงบรรยายที่ผูกติดกับพิกัดนั้น เช่น ชื่อ ประเภท เวลาบันทึก ซึ่งทำให้สามารถสืบค้น (Query) กรองข้อมูล และวิเคราะห์เชิงพื้นที่ได้ ระบบพิกัดที่ใช้ในเกมนี้คือ WGS84 (EPSG:4326) ซึ่งเป็นค่ามาตรฐานของ GPS ทั่วโลก",
    ref: "อ้างอิง: OGC Simple Feature Access – Point geometry; ESRI GIS Dictionary – \"Attribute data\", \"Feature class\""
  },
  2: {
    title: "ข้อมูลเส้น (Line / LineString Feature)",
    body: "Line เกิดจากจุดตั้งแต่ 2 จุดขึ้นไปเรียงต่อกันเป็นลำดับ (vertices) มีโครงสร้าง 1 มิติ คุณสมบัติสำคัญที่คำนวณได้คือ <b>ความยาว (Length)</b> ระยะทางจริงบนพื้นโลกมักคำนวณแบบ geodesic (คำนึงถึงความโค้งของโลก) ไม่ใช่ระยะเส้นตรงแบบยุคลิด เหมาะสำหรับข้อมูล เช่น ถนน แม่น้ำ สายไฟฟ้า เส้นทางเดินรถ",
    ref: "อ้างอิง: OGC Simple Feature Access – LineString geometry; ISO 19125-1:2004"
  },
  3: {
    title: "ข้อมูลพื้นที่ (Polygon Feature)",
    body: "Polygon เกิดจากเส้น (ring) ที่ปิดบรรจบกับจุดเริ่มต้น มีโครงสร้าง 2 มิติ คุณสมบัติที่คำนวณได้คือ <b>พื้นที่ (Area)</b> และ <b>เส้นรอบรูป (Perimeter)</b> การคำนวณพื้นที่บนพิกัดภูมิศาสตร์จริงต้องใช้สูตร geodesic area เพื่อความแม่นยำ เหมาะสำหรับข้อมูล เช่น สระน้ำ แปลงที่ดิน เขตการปกครอง ป่าไม้",
    ref: "อ้างอิง: OGC Simple Feature Access – Polygon geometry; ESRI GIS Dictionary – \"Geodesic area\""
  }
};

export const HOW_TO_DRAW = {
  2: {
    title: "วิธีวาดเส้น (LineString)",
    steps: "1) คลิกที่แผนที่ตรงจุดเริ่มต้น (จุดที่ 1)<br>2) คลิกต่อไปยังจุดถัดไปเรื่อยๆ ตามลำดับที่โจทย์กำหนด (จุดที่ 2, 3)<br>3) เมื่อถึงจุดสุดท้าย ให้ <b>ดับเบิลคลิก</b> เพื่อจบเส้น (หรือกด Enter)<br>4) ถ้าวาดผิด กดปุ่มลบ/วาดใหม่ แล้วเริ่มคลิกใหม่ได้เลย<br><br><b>ตัวอย่าง:</b> ถ้าโจทย์เรียงเป็น A ➔ B ➔ C ให้คลิก A แล้ว B แล้ว C ตามลำดับ จากนั้นดับเบิลคลิกที่ C",
  },
  3: {
    title: "วิธีวาดพื้นที่ (Polygon)",
    steps: "1) คลิกที่แผนที่ตรงมุมแรกของพื้นที่ (จุดที่ 1)<br>2) คลิกต่อไปตามมุมต่างๆ ให้ครอบคลุมพื้นที่เป้าหมาย (จุดที่ 2, 3, 4, ...)<br>3) เมื่อครบทุกมุมแล้ว ให้ <b>ดับเบิลคลิก</b> หรือคลิกกลับจุดเริ่มต้น (จุดที่ 1) เพื่อปิดรูป<br>4) ถ้าวาดผิด กดปุ่มลบ/วาดใหม่ แล้วเริ่มคลิกใหม่ได้เลย<br><br><b>ตัวอย่าง:</b> เริ่มที่จุด 1 แล้วคลิกจุด 2, 3, 4 จากนั้นดับเบิลคลิกหรือคลิกกลับจุด 1 เพื่อปิดรูป",
  }
};
