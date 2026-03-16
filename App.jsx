import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  deleteDoc,
  writeBatch,
  getDocs
} from 'firebase/firestore';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged
} from 'firebase/auth';
import { 
  User, CheckCircle, Award, Users, AlertCircle, Lock, BarChart3, RefreshCw, KeyRound, ShieldCheck, X, Search, RotateCcw, Trash2, AlertTriangle, Fingerprint
} from 'lucide-react';

// --- [유지] 사용자님의 실제 Firebase 최신 설정값 ---
const firebaseConfig = {
  apiKey: "AIzaSyCOcU2Fopwe07oHRfANGV_zD-D9rY7IQXw",
  authDomain: "st-shinmyung-5e261.firebaseapp.com",
  projectId: "st-shinmyung-5e261",
  storageBucket: "st-shinmyung-5e261.firebasestorage.app",
  messagingSenderId: "974553161620",
  appId: "1:974553161620:web:0f9ca261bcc887e1173981"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = "shinmyung-election-2026";

// ==========================================
// [보안 업데이트] 849명 전교생 고유 인증 코드 데이터
// Canvas의 명단과 100% 일치합니다.
// ==========================================
const AUTH_CODES = {
  "1101강은재": "8241", "1102권다은": "3192", "1103김나윤": "5674", "1104김미소": "1209", "1105김보민": "9932", "1106김서하": "4421", "1107김소정": "6712", "1108김수민": "2389", "1109김수윤": "7710", "1110김수현": "1543",
  "1111김시현": "3922", "1112김아란": "8841", "1113김주혜": "6620", "1114김지민": "2104", "1115김지현": "5539", "1116박연서": "9012", "1117박은서": "4328", "1118신수빈": "7611", "1119신유빈": "1298", "1120양서연": "3409",
  "1121윤가은": "5110", "1122윤예원": "6782", "1123음채율": "2245", "1124이서연": "9001", "1125이서은": "1123", "1126이정민": "4450", "1127이채은": "8762", "1128임서현": "3341", "1129조온규": "6092", "1130최다연": "1987",
  "1131황다겸": "7721", "1201금미서": "4561", "1202김가윤": "8920", "1203김가은": "1104", "1204김결이": "3452", "1205김도연": "7781", "1206김도현": "2234", "1207김서율": "9019", "1208김연우": "6654", "1209김예림": "4321",
  "1210김윤슬": "8812", "1211박예진": "5543", "1212박주은": "1198", "1213박지연": "7609", "1214배규나": "3421", "1215서진주": "9901", "1216성지민": "2132", "1217신지아": "6784", "1218안나윤": "1201", "1219안유빈": "8234",
  "1220오주아": "4456", "1221윤채원": "3349", "1222이소율": "9008", "1223이아인": "1127", "1224이윤서": "5671", "1225이자은": "8765", "1226장예율": "2381", "1227정새봄": "4412", "1228최민채": "6619", "1229최소영": "8832",
  "1230최수빈": "1254", "1301강나윤": "7741", "1302곽은서": "3195", "1303김나윤": "5682", "1304김민정": "1213", "1305박서진": "9941", "1306박소영": "4429", "1307박시원": "6719", "1308방은우": "2391", "1309배서연": "7718",
  "1310변예린": "1549", "1311손지원": "3929", "1312손채원": "8848", "1313안수민": "6627", "1314우수현": "2111", "1315윤아진": "5545", "1316이경서": "9019", "1317이소윤": "4334", "1318이소희": "7618", "1319이아윤": "1305",
  "1320이예빈": "3416", "1321이유정": "5117", "1322이지민": "6789", "1323이지유": "2252", "1324이호정": "9008", "1325전혜주": "1130", "1326전효재": "4457", "1327정세인": "8769", "1328조하온": "3348", "1329최예나": "6099",
  "1330최지아": "1994", "1331최지율": "7728", "1401구나언": "4568", "1402권예진": "8927", "1403김결": "1111", "1404김보경": "3459", "1405김보애": "7788", "1406김수빈": "2241", "1407김연지": "9026", "1408김예빈": "6661",
  "1409김예지": "4328", "1410김정윤": "8819", "1411김지오": "5550", "1412나서영": "1205", "1413나지영": "7616", "1414박사랑": "3428", "1415박서현": "9908", "1416박성효": "2139", "1417오윤나": "6791", "1418유다은": "1208",
  "1419이규민": "8241", "1420이나현": "4463", "1421이다원": "3356", "1422이다은": "9015", "1423이연서": "1134", "1424이지유": "5678", "1425이채이": "8772", "1426장지원": "2388", "1427전아윤": "4419", "1428전아현": "6626",
  "1429조한별": "8839", "1430조혜원": "1261", "1431홍아현": "7748", "1501강에일린": "3202", "1502구민채": "5689", "1503김다연": "1220", "1504김민영": "9948", "1505김소현": "4436", "1506김예지": "6726", "1507김지우": "2398",
  "1508민세하": "7725", "1509박민서": "1556", "1510박서윤": "3936", "1511박솔아": "8855", "1512서정원": "6634", "1513손하영": "2118", "1514안채원": "5552", "1515양윤지": "9026", "1516유주연": "4341", "1517윤현아": "7625",
  "1518이민서": "1312", "1519이서경": "3423", "1520이서현": "5124", "1522이은서": "6796", "1523이채은": "2259", "1524이채희": "9015", "1525이현서": "1137", "1526인세현": "4464", "1527임주하": "8776", "1528장서현": "3355",
  "1529최서연": "6106", "1530최현영": "2001", "1531황채영": "7735", "1532박하윤": "4575", "1601김나윤": "8934", "1602김다정": "1118", "1603김미우": "3466", "1604김민정": "7795", "1605김보경": "2248", "1606김소윤": "9033",
  "1607김유비": "6668", "1608김윤서": "4335", "1609김지우": "8826", "1610김지율": "5557", "1611하하늘": "1212", "1612김한희": "7623", "1613김효원": "3435", "1614도가윤": "9915", "1615도연우": "2146", "1616박소린": "6798",
  "1617박유진": "1215", "1618신다연": "8248", "1619유세연": "4470", "1620이규림": "3363", "1621이나윤": "9022", "1622이다은": "1141", "1623이유주": "5685", "1624이채현": "8779", "1625이해윤": "2395", "1626임다현": "4426",
  "1627전이레": "6633", "1628정지민": "8846", "1629정지후": "1268", "1631하윤서": "7755", "1701고소현": "3209", "1702곽나경": "5696", "1703구은재": "1227", "1704권나현": "9955", "1705김다윤": "4443", "1706김서연": "6733",
  "1707김시은": "2405", "1708김연아": "7732", "1709김예은": "1563", "1710김윤하": "3943", "1711김은서": "8862", "1712김주하": "6641", "1713류이안": "2125", "1714박수하": "5559", "1715스미스클로이": "9033", "1716신재은": "4348",
  "1717육예지": "7632", "1718이서진": "1319", "1719이솔민": "3430", "1720이연서": "5131", "1721이지아": "6803", "1722이채연": "2266", "1723이하연": "9022", "1724장서이": "1144", "1725정소윤": "4471", "1726조서현": "8783",
  "1727조현서": "3362", "1728지서연": "6113", "1729차수진": "2008", "1730최가온": "7742", "1731최예진": "4582", "1801강나겸": "8941", "1802김가령": "1125", "1803김나연": "3473", "1804김민채": "7802", "1805김서연": "2255",
  "1806김서현": "9040", "1807김시현": "6675", "1808김예나": "4342", "1809김정민": "8833", "1810김지윤": "5564", "1811김채윤": "1219", "1812김효담": "7630", "1813박다은": "3442", "1815손연주": "9922", "1816원다경": "2153",
  "1817윤나경": "6805", "1818이다은": "1222", "1819이도희": "8255", "1821이채윤": "4477", "1822장효서": "3370", "1823정수아": "9029", "1824정유진": "1148", "1825채시안": "5692", "1826최가은": "8786", "1827최라임": "2402",
  "1828최수현": "4433", "1829최윤채": "6640", "1830팔리로니스해나루이즈": "8853", "1831황서율": "1275", "1832김민서": "7762", "1901강소윤": "3216", "1902고나영": "5703", "1903구나은": "1234", "1904권나연": "9962",
  "1905권율하": "4450", "1906김다윤": "6740", "1907김서윤": "2412", "1908김수하": "7739", "1909노윤채": "1570", "1910박가은": "3950", "1911박나경": "8869", "1912박서우": "6648", "1913박시은": "2132", "1914박지연": "5566",
  "1915서아진": "9040", "1916서예린": "4355", "1917서현아": "7639", "1918윤정원": "1326", "1919이규민": "3437", "1920이나현": "5138", "1921이서현": "6810", "1922이은서": "2273", "1923이지윤": "9029", "1924이채연": "1151",
  "1925장예원": "4478", "1926전다현": "8790", "1927정지유": "3369", "1928주효주": "6120", "1929천세은": "2015", "1930천지민": "7749", "1931최민서": "4589", "2101권보윤": "8948", "2102김민서": "1132", "2103김세경": "3480",
  "2104김소현": "7809", "2105김연재": "2262", "2106김예은": "9047", "2107김주원": "6682", "2108김주은": "4349", "2109김지우": "8840", "2110김채율": "5571", "2111김태이": "1226", "2112김하진": "7637", "2113남연수": "3449",
  "2114남유담": "9929", "2115노하영": "2160", "2116박세영": "6812", "2117박소윤": "1229", "2118박영은": "8262", "2119서지원": "4484", "2120서한비": "3377", "2121송서영": "9036", "2122신보빈": "1155", "2123안효신": "5699",
  "2124엄선경": "8793", "2125윤서영": "2409", "2126윤혜솔": "4440", "2127이경은": "6647", "2128이다원": "8860", "2129이라희": "1282", "2130이미림": "7769", "2131이효리": "3223", "2132정라원": "5710", "2133정지우": "1241",
  "2134차예설": "9969", "2201공가윤": "4457", "2202권효주": "6747", "2203김도연": "2419", "2204김도이": "7746", "2205김민재": "1577", "2206김시원": "3957", "2207김지민": "8876", "2208김지우": "6655", "2209김태희": "2139",
  "2210김하린": "5573", "2211류겸미": "9047", "2212박건희": "4362", "2213박규빈": "7646", "2214박정인": "1333", "2215신소율": "3444", "2216신한별": "5145", "2217안혜림": "6817", "2218오유림": "2280", "2219원하라": "9036",
  "2220윤수민": "1158", "2221윤지혜": "4485", "2222윤채현": "8797", "2223이나현": "3376", "2224이수민": "6127", "2225이지민": "2022", "2226이효우": "7756", "2227임연서": "4596", "2228전소율": "8955", "2229정연우": "1139",
  "2230조진아": "3487", "2231조채윤": "7816", "2232천혜원": "2269", "2233최아랑": "9054", "2234추민서": "6689", "2301구해나": "4356", "2302구해린": "8847", "2303권서연": "5578", "2304권세라": "1233", "2305권희원": "7644",
  "2306김나윤": "3456", "2307김민서": "9936", "2308김민슬": "2167", "2309김보현": "6819", "2310김시원": "1236", "2311김연아": "8269", "2312김윤민": "4491", "2313김지연": "3384", "2314김지유": "9043", "2315남건희": "1162",
  "2316도효은": "5706", "2317박서윤": "8800", "2318박지희": "2416", "2319빈예진": "4447", "2320서하진": "6654", "2321안세민": "8867", "2322오지윤": "1289", "2323윤리라": "7776", "2324이고원": "3230", "2325이서영": "5717",
  "2327이유나": "1248", "2328이채민": "9976", "2329이혜민": "4464", "2330전율": "6754", "2331주예진": "2426", "2332차지윤": "7753", "2333최정연": "1584", "2334허다현": "3964", "2401강나현": "8883", "2402공민주": "6662",
  "2403권현아": "2146", "2404김다인": "5580", "2405김민서": "9054", "2406김민주": "4369", "2407김수연": "7653", "2408김연서": "1340", "2409김예나": "3451", "2410김예원": "5152", "2411김유나": "6824", "2412김은유": "2287",
  "2413김지우": "9043", "2414김채현": "1165", "2415도민슬": "4492", "2416박서은": "8804", "2417배수민": "3383", "2418성지희": "6134", "2419성혜지": "2029", "2420안은솔": "7763", "2421이세령": "4603", "2422이승연": "8962",
  "2423이유나": "1146", "2424이지영": "3494", "2425이하율": "7823", "2426임현서": "2276", "2427임혜인": "9061", "2428장채완": "6696", "2429전아인": "4363", "2430천율이": "8854", "2431최지우": "5585", "2432한예지": "1240",
  "2433홍수연": "7651", "2501강아연": "3463", "2502곽유진": "9943", "2503권수빈": "2174", "2504권효언": "6826", "2505김가윤": "1243", "2506김규린": "8276", "2507김민서": "4498", "2508김민채": "3391", "2509김소은": "9050",
  "2510김수연": "1169", "2511김예후": "5713", "2512문서현": "8807", "2513박혜린": "2423", "2514석예지": "4454", "2515성한별": "6661", "2516신연우": "8874", "2517심민정": "1296", "2518여서현": "7783", "2519예서영": "3237",
  "2520윤가인": "5724", "2521이담희": "1255", "2522이서희": "9983", "2523이세연": "4471", "2524이예원": "6761", "2526임하음": "2433", "2527장윤서": "7760", "2528정아진": "1591", "2529정유나": "3971", "2530정은유": "8890",
  "2531정지우": "6669", "2532조은별": "2153", "2533주효안": "5587", "2601권유안": "9061", "2602김나현": "4376", "2603김려원": "7660", "2604김서희": "1347", "2605김영원": "3458", "2606김지빈": "5159", "2607김채민": "6831",
  "2608나연우": "2294", "2609남서연": "9050", "2610문지원": "1172", "2611박지성": "4499", "2612박나연": "8811", "2613박다영": "3390", "2614박민서": "6141", "2615박예진": "2036", "2616박현서": "7770", "2617배수민": "4610",
  "2618서지운": "8969", "2619성채원": "1153", "2620윤슬": "3501", "2621이서영": "7830", "2622이세랑": "2283", "2623이주희": "9068", "2624이지율": "6703", "2625임유나": "4370", "2626전하진": "8861", "2627정수현": "5592",
  "2628정시윤": "1247", "2629정윤슬": "7658", "2630정해린": "3470", "2631채민하": "9950", "2632천가인": "2181", "2633최윤슬": "6833", "2634최희수": "1250", "2701권하윤": "8283", "2702김경은": "4505", "2703김단희": "3398",
  "2704김민채": "9057", "2705김서령": "1176", "2706김성연": "5720", "2707김이슬": "8814", "2708김주희": "2430", "2709김채윤": "4461", "2710류민서": "6668", "2711문규림": "8881", "2712박다해": "1303", "2713박소영": "7790",
  "2714박지수": "3244", "2715박채은": "5731", "2716백승연": "1262", "2717백하비": "9990", "2718변예진": "4478", "2719서보배": "6768", "2720신아윤": "2440", "2721심예담": "7767", "2722양채원": "1598", "2723여소율": "3978",
  "2724유수진": "8897", "2725이수연": "6676", "2726이하린": "2160", "2727이효린": "5594", "2728장아영": "9068", "2729장혜리": "4383", "2730정연후": "7667", "2731정하은": "1354", "2732하연재": "3465", "2733한윤슬": "5166",
  "2801권효서": "6838", "2802김가연": "2301", "2803김가예": "9057", "2804김나온": "1179", "2805김소연": "4506", "2806김연서": "8818", "2807김연우": "3397", "2808김유진": "6148", "2809김주혜": "2043", "2810김지우": "7777",
  "2811박시연": "4617", "2812박예봄": "8976", "2813서예빈": "1160", "2814신은설": "3508", "2815여시화": "7837", "2816유채령": "2290", "2817윤연우": "9075", "2818이도혜": "6710", "2819이라현": "4377", "2820이서현": "8868",
  "2821이채은": "5599", "2822이하은": "1254", "2823전지현": "7665", "2824전현서": "3477", "2825정윤지": "9957", "2826조서연": "2188", "2827지송은": "6840", "2828진은서": "1257", "2829최유란": "8290", "2830최윤서": "4512",
  "2831하지원": "3405", "2832허수진": "9064", "2833황서윤": "1183", "2901강소율": "5727", "2902김가은": "8821", "2903김나윤": "2437", "2904김나현": "4468", "2905김서연": "6675", "2906김수영": "8888", "2907김은우": "1310",
  "2908김인하": "7797", "2909김하은": "3251", "2910도예서": "5738", "2911도유빈": "1269", "2912도윤슬": "9997", "2913박민서": "4485", "2914박선영": "6775", "2915박소이": "2447", "2916박수빈": "7774", "2917박윤서": "1605",
  "2918백서현": "3985", "2919손지민": "8904", "2920송현지": "6683", "2921심윤서": "2167", "2922안민슬": "5601", "2923음채우": "9075", "2924이다은": "4390", "2925이수연": "7674", "2926이연우": "1361", "2927이예진": "3472",
  "2928이윤진": "5173", "2929장채윤": "6845", "2930전이진": "2308", "2931정다연": "9064", "2932정려원": "1186", "2933정하린": "4513", "3101김가령": "8825", "3102김수연": "3404", "3103김승은": "6155", "3104김시현": "2050",
  "3105김예담": "7784", "3106김이경": "4624", "3107김주연": "8983", "3108김주원": "1167", "3109김효림": "3515", "3110김효빈": "7844", "3111박서윤": "2297", "3112박세은": "9082", "3113박지윤": "6717", "3114박채영": "4384",
  "3115배드린": "8875", "3116손유": "5606", "3117손지우": "1261", "3118송슬": "7672", "3119유재서": "3484", "3120윤서윤": "9964", "3121윤혜린": "2195", "3122장하은": "6847", "3123전하늘": "1264", "3124조희진": "8297",
  "3125천영서": "4519", "3126천지민": "3412", "3127최민서": "9071", "3128최정윤": "1190", "3129최한나": "5734", "3130황정윤": "8828", "3201강현진": "2444", "3202곽예설": "4475", "3203김가온": "6682", "3204김민하": "8895",
  "3205김예림": "1317", "3206김예서": "7804", "3207지원": "3258", "3208김태영": "5745", "3209김하은": "1276", "3210남유민": "1004", "3211문예진": "4492", "3212박서윤": "6782", "3213박서진": "2454", "3214박수민": "7781",
  "3215박채연": "1612", "3216설하영": "3992", "3217예도연": "8911", "3218우승은": "6690", "3219이세은": "2174", "3220이유주": "5608", "3221이하정": "9082", "3222임서영": "4397", "3223정규현": "7681", "3224정다인": "1368",
  "3225정서영": "3479", "3226최가은": "5180", "3227최다연": "6852", "3228최리아": "2315", "3229최지우": "9071", "3230최희윤": "1193", "3301강현서": "4520", "3302권아연": "8832", "3303김민유": "3411", "3304김보미": "6162",
  "3305김서영": "2057", "3306김소윤": "7791", "3307김소은": "4631", "3308김예지": "8990", "3309김지율": "1174", "3310김현서": "3522", "3311남승연": "7851", "3312박새봄": "2304", "3313박지후": "9089", "3314박채은": "6724",
  "3315박혜린": "4391", "3316박혜진": "8882", "3317박효은": "5613", "3318배시온": "1268", "3319오서윤": "7679", "3320오세율": "3491", "3321이경민": "9971", "3322이은희": "2202", "3323이채은": "6854", "3324이혜원": "1271",
  "3325장혜정": "8304", "3326조한울": "4526", "3327주은성": "3419", "3328진연우": "9078", "3329황다현": "1197", "3330황서영": "5741", "3401곽다연": "8835", "3402김가은": "2451", "3403김민선": "4482", "3404김지원": "6689",
  "3405노하정": "8902", "3406도하진": "1324", "3407박경빈": "7811", "3408박미준": "3265", "3409박서영": "5752", "3410박서윤": "1283", "3411배가은": "1011", "3412백하영": "4499", "3413손민주": "6789", "3414손예영": "2461",
  "3415송민아": "7788", "3416신나라": "1619", "3417신서연": "3999", "3418우지민": "8918", "3419이서아": "6697", "3420이서율": "2181", "3421이세령": "5615", "3422이소정": "9089", "3423이연우": "4404", "3424정아인": "7688",
  "3425정해원": "1375", "3426최효리": "3486", "3427최휘진": "5187", "3428현다연": "6859", "3429홍도영": "2322", "3430황서영": "9078", "3431황서휘": "1200", "3501권가람": "4527", "3502권도연": "8839", "3503김사랑": "3418",
  "3504김수정": "6169", "3505김유진": "2064", "3506김은서": "7798", "3507김현주": "4638", "3508손서윤": "8997", "3509송지은": "1181", "3510송채윤": "3529", "3511신다솜": "7858", "3512신예원": "2311", "3513양소윤": "9096",
  "3514우정민": "6731", "3515유수민": "4398", "3516이비안": "8889", "3517이서진": "5620", "3518이유진": "1275", "3519이윤서": "7686", "3520이지안": "3498", "3521이채은": "9978", "3522이현서": "2209", "3523전지율": "6861",
  "3524정다은": "1278", "3525정유림": "8311", "3526정은교": "4533", "3527진효림": "3426", "3528최연우": "9085", "3529최희재": "1204", "3530하지우": "5748", "3531황봄": "8842", "3601김경민": "2458", "3602김고은": "4489",
  "3603김기란": "6696", "3604김미령": "8909", "3605김사랑": "1331", "3606김소연": "7818", "3607김소윤": "3272", "3608김예린": "5759", "3609김지우": "1290", "3610문서영": "1018", "3611박지성": "4506", "3612박나연": "6796",
  "3613백인경": "2468", "3614서지우": "7795", "3615서혜정": "1626", "3616송주연": "4006", "3617신효주": "8925", "3618윤선진": "6704", "3619윤수아": "2188", "3620윤진서": "5622", "3621이선주": "9096", "3622이수안": "4411",
  "3623이지우": "7695", "3624임주비": "1382", "3625임하윤": "3493", "3626전소이": "5194", "3627전지윤": "6866", "3628정지민": "2329", "3629천사론": "9085", "3630한서윤": "1207", "3631황혜린": "4534", "3701강연우": "8846",
  "3702곽은빈": "3425", "3703김가을": "6176", "3704김란희": "2071", "3705김영아": "7805", "3706김채윤": "4645", "3707김효린": "9004", "3708박다은": "1188", "3709박민서": "3536", "3710박보민": "7865", "3711박서윤": "2318",
  "3712박현서": "9103", "3713변서현": "6738", "3714신서영": "4398", "3715여효이": "8896", "3716오채원": "5627", "3717이라은": "1282", "3718이서연": "7693", "3719이시원": "3505", "3720이예은": "9985", "3721이제아": "2216",
  "3722이현진": "6868", "3723이효주": "1285", "3724정다민": "8318", "3725정은희": "4540", "3726조시연": "3433", "3727천예현": "9092", "3728최유리": "1211", "3729최재원": "5755", "3730하루아": "8849", "3731허다령": "2465",
  "3801권경민": "4496", "3802권예린": "6703", "3803김수혜": "8916", "3804김윤아": "1338", "3805김지인": "7825", "3806김한결": "3279", "3807박채원": "5766", "3808배해인": "1297", "3809서지우": "1025", "3810양예지": "4513",
  "3811이나경": "6803", "3812이다인": "2475", "3813이세은": "7802", "3814이승은": "1633", "3815이지윤": "4013", "3816이채은": "8932", "3817이효원": "6711", "3818임소현": "2195", "3819전민지": "5629", "3820정민주": "9103",
  "3821조다혜": "4418", "3822지수현": "7702", "3823차승연": "1389", "3824천원정": "3500", "3825최아영": "5201", "3826최유나": "6873", "3827최윤화": "2336", "3828하민서": "9092", "3829홍승아": "1214", "3830황수현": "4541",
  "3901권윤솔": "8853", "3902김미담": "3432", "3903김민지": "6183", "3904김민채": "2078", "3905김수아": "7812", "3906김유진": "4652", "3907김정현": "9011", "3908김지아": "1195", "3909남민지": "3543", "3910박선우": "7872",
  "3911박지현": "2325", "3912백민주": "9110", "3913빈다은": "6745", "3914손주연": "4405", "3915손현재": "8903", "3916신그린": "5634", "3917오은채": "1289", "3918윤소원": "7700", "3919이가윤": "3512", "3920이시윤": "9992",
  "3921이은교": "2223", "3922이채윤": "6875", "3923이한비": "1292", "3924전하늘": "8325", "3925정여원": "4547", "3926조민영": "3440", "3927지예안": "9099", "3928최은교": "1218", "3929허윤서": "5762", "3930황서영": "8856"
};

export default function App() {
  // --- 상태 관리 ---
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState({ grade: '', class: '', number: '', name: '', authCode: '' });
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [selectedPresident, setSelectedPresident] = useState(null);
  const [selectedVicePresident, setSelectedVicePresident] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // --- 관리자 모드 상태 ---
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminAuthForm, setAdminAuthForm] = useState({ id: '', pw: '' });
  const [adminAuthError, setAdminAuthError] = useState('');
  const [dbVotes, setDbVotes] = useState([]);
  const [dbVoters, setDbVoters] = useState({});
  const [adminTab, setAdminTab] = useState('stats');
  const [resetConfirm, setResetConfirm] = useState(null);
  const [isResettingAll, setIsResettingAll] = useState(false);
  const [showResetAllModal, setShowResetAllModal] = useState(false);
  
  const [filterGrade, setFilterGrade] = useState('all');
  const [filterClass, setFilterClass] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const totalStudentsList = useMemo(() => {
    const students = [];
    Object.keys(AUTH_CODES).forEach(key => {
      students.push({
        key: key,
        grade: key[0],
        class: key[1],
        number: key.substring(2, 4),
        name: key.substring(4)
      });
    });
    return students;
  }, []);

  const presidents = [
    { id: 1, name: '황수현', slogan: '3학년 8반의 열정으로 학교를 빛내겠습니다!' },
    { id: 2, name: '김병진', slogan: '3학년 6반의 리더십, 신명의 변화를 약속합니다.' },
    { id: 3, name: '김재수', slogan: '3학년 7반의 성실함으로 모두가 행복한 학교!' },
    { id: 4, name: '박재두', slogan: '3학년 9반의 패기, 소통하는 회장이 되겠습니다.' },
    { id: 5, name: '손희동', slogan: '3학년 7반의 진심, 발로 뛰는 일꾼이 되겠습니다.' },
    { id: 6, name: '김민혜', slogan: '3학년 4반의 따뜻함, 학생들의 목소리를 듣겠습니다.' }
  ];

  const vicePresidents = [
    { id: 101, name: '황수현', slogan: '3학년 8반의 든든한 부회장이 되겠습니다!' },
    { id: 102, name: '김병진', slogan: '3학년 6반의 실천력, 행동으로 보여드리겠습니다.' },
    { id: 103, name: '김재수', slogan: '3학년 7반의 공감 능력, 여러분 곁에 있겠습니다.' },
    { id: 104, name: '박재두', slogan: '3학년 9반의 열정, 학생회를 새롭게 바꾸겠습니다.' },
    { id: 105, name: '손희동', slogan: '3학년 7반의 정직함, 믿음직한 부회장이 되겠습니다.' },
    { id: 106, name: '김민혜', slogan: '3학년 4반의 배려, 함께 웃는 학교를 만듭니다.' }
  ];

  useEffect(() => {
    const initAuth = async () => {
      try { await signInAnonymously(auth); } catch (err) { console.warn("인증 지연:", err.message); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const votesRef = collection(db, 'artifacts', appId, 'public', 'data', 'votes');
    const unsubVotes = onSnapshot(votesRef, (snapshot) => { setDbVotes(snapshot.docs.map(doc => doc.data())); });
    const votersRef = collection(db, 'artifacts', appId, 'public', 'data', 'voters');
    const unsubVoters = onSnapshot(votersRef, (snapshot) => {
      const votersMap = {};
      snapshot.docs.forEach(doc => { votersMap[doc.id] = true; });
      setDbVoters(votersMap);
    });
    return () => { unsubVotes(); unsubVoters(); };
  }, [user]);

  const verifyStudent = async () => {
    setIsVerifying(true);
    const { grade, class: cls, number, name, authCode } = userData;
    const formattedNumber = number.toString().padStart(2, '0');
    const userKey = `${grade}${cls}${formattedNumber}${name}`;
    
    if (!AUTH_CODES[userKey]) {
      setError('명단에 없는 학생입니다. 정보를 다시 확인하세요.');
      setIsVerifying(false);
      return false;
    }

    if (AUTH_CODES[userKey] !== authCode) {
      setError('인증 코드가 일치하지 않습니다. 본인의 고유 코드를 입력하세요.');
      setIsVerifying(false);
      return false;
    }

    if (!user) {
       setError('서버 연결 중... 잠시 후 다시 시도해 주세요.');
       setIsVerifying(false);
       return false;
    }

    try {
      const voterDoc = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'voters', userKey));
      if (voterDoc.exists()) {
        setError('이미 투표를 완료한 학생입니다.');
        setIsVerifying(false);
        return false;
      }
      setError('');
      setIsVerifying(false);
      return true;
    } catch (err) {
      setError('데이터베이스 연결 오류');
      setIsVerifying(false);
      return false;
    }
  };

  const handleNextStep = async () => {
    if (step === 1) { if (await verifyStudent()) setStep(2); } 
    else setStep(prev => prev + 1);
  };

  const handleSubmit = async () => {
    if (!user) return;
    const { grade, class: cls, number, name } = userData;
    const formattedNumber = number.toString().padStart(2, '0');
    const userKey = `${grade}${cls}${formattedNumber}${name}`;
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'votes', userKey), {
        presidentId: selectedPresident.id,
        vicePresidentId: selectedVicePresident.id,
        timestamp: new Date().toISOString()
      });
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'voters', userKey), {
        voted: true, votedAt: new Date().toISOString()
      });
      setIsSubmitted(true);
    } catch (err) { setError('제출 실패'); }
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminAuthForm.id === 'kmge439' && adminAuthForm.pw === 'dkssud2323!') {
      setIsAdminAuthenticated(true);
      setAdminAuthError('');
    } else { setAdminAuthError('로그인 실패'); }
  };

  const handleResetVoter = async (studentKey) => {
    if (!user || !isAdminAuthenticated) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'voters', studentKey));
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'votes', studentKey));
      setResetConfirm(null);
    } catch (err) { console.error("리셋 실패", err); }
  };

  const handleResetAllVotes = async () => {
    if (!user || !isAdminAuthenticated) return;
    setIsResettingAll(true);
    try {
      const votersSnap = await getDocs(collection(db, 'artifacts', appId, 'public', 'data', 'voters'));
      const batch1 = writeBatch(db);
      votersSnap.docs.forEach((doc) => batch1.delete(doc.ref));
      await batch1.commit();
      const votesSnap = await getDocs(collection(db, 'artifacts', appId, 'public', 'data', 'votes'));
      const batch2 = writeBatch(db);
      votesSnap.docs.forEach((doc) => batch2.delete(doc.ref));
      await batch2.commit();
      setShowResetAllModal(false);
    } catch (err) { console.error("전체 리셋 실패", err); } 
    finally { setIsResettingAll(false); }
  };

  const stats = useMemo(() => {
    const results = { president: {}, vicePresident: {}, total: dbVotes.length };
    dbVotes.forEach(v => {
      results.president[v.presidentId] = (results.president[v.presidentId] || 0) + 1;
      results.vicePresident[v.vicePresidentId] = (results.vicePresident[v.vicePresidentId] || 0) + 1;
    });
    return results;
  }, [dbVotes]);

  const filteredParticipationList = useMemo(() => {
    return totalStudentsList.filter(s => {
      const matchGrade = filterGrade === 'all' || s.grade === filterGrade;
      const matchClass = filterClass === 'all' || s.class === filterClass;
      const hasVoted = !!dbVoters[s.key];
      const matchStatus = filterStatus === 'all' || (filterStatus === 'voted' ? hasVoted : !hasVoted);
      const matchSearch = s.name.includes(searchQuery) || s.key.includes(searchQuery);
      return matchGrade && matchClass && matchStatus && matchSearch;
    });
  }, [totalStudentsList, dbVoters, filterGrade, filterClass, filterStatus, searchQuery]);

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 text-center border border-slate-100">
          <CheckCircle size={80} className="text-emerald-500 mx-auto mb-6" />
          <h2 className="text-3xl font-black mb-4 tracking-tight text-slate-900">제출 성공</h2>
          <p className="text-slate-600 mb-8 font-medium">참여해 주셔서 감사합니다.</p>
          <button onClick={() => window.location.reload()} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black transition-all active:scale-95">닫기</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4 font-sans text-slate-900 selection:bg-blue-100">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full mb-4 uppercase tracking-[0.2em] shadow-lg">
            <Lock size={12} /> SECURED SYSTEM
          </div>
          <h1 className="text-4xl font-black mb-2 tracking-tighter text-slate-900">2026학년도 신명여자중학교 전교 회장단 선거</h1>
        </div>

        {!showAdminPanel ? (
          <div className="max-w-2xl mx-auto">
            {step === 1 && (
              <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-100 animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4 mb-10">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shadow-inner"><Fingerprint size={28} strokeWidth={2.5} /></div>
                  <h2 className="text-2xl font-black text-slate-900">본인 확인 및 인증</h2>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <select value={userData.grade} onChange={(e) => setUserData({...userData, grade: e.target.value})} className="p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-center outline-none">
                    <option value="">학년</option><option value="1">1</option><option value="2">2</option><option value="3">3</option>
                  </select>
                  <input type="number" placeholder="반" value={userData.class} onChange={(e) => setUserData({...userData, class: e.target.value})} className="p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-center outline-none" />
                  <input type="number" placeholder="번" value={userData.number} onChange={(e) => setUserData({...userData, number: e.target.value})} className="p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-center outline-none" />
                </div>
                <input type="text" placeholder="이름" value={userData.name} onChange={(e) => setUserData({...userData, name: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-xl px-8 mb-4 outline-none focus:border-blue-500" />
                <div className="relative mb-6">
                  <KeyRound className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-400" size={20} />
                  <input type="text" placeholder="인증 코드 입력" value={userData.authCode} onChange={(e) => setUserData({...userData, authCode: e.target.value})} className="w-full p-5 pl-16 bg-blue-50 border-2 border-blue-100 rounded-2xl font-black text-xl outline-none focus:border-blue-500 placeholder:text-blue-200" />
                </div>
                {error && <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 mb-6 flex items-center gap-2 text-sm font-black animate-in shake"><AlertCircle size={18} />{error}</div>}
                <button disabled={!userData.grade || !userData.class || !userData.number || !userData.name || !userData.authCode || isVerifying} onClick={handleNextStep} className="w-full py-6 bg-blue-600 text-white rounded-3xl font-black text-xl shadow-xl transition-all active:scale-95">
                  {isVerifying ? <RefreshCw className="animate-spin mx-auto" /> : '인증 확인 및 투표 시작'}
                </button>
              </div>
            )}
            {(step === 2 || step === 3) && (
              <div className="animate-in slide-in-from-right-8 duration-500">
                <h2 className="text-2xl font-black mb-8 flex items-center gap-3 tracking-tight text-slate-900">
                  {step === 2 ? <><Award className="text-amber-500" /> 전교 회장 후보</> : <><Users className="text-purple-500" /> 전교 부회장 후보</>}
                </h2>
                <div className="grid gap-4">
                  {(step === 2 ? presidents : vicePresidents).map(c => (
                    <div key={c.id} onClick={() => step === 2 ? setSelectedPresident(c) : setSelectedVicePresident(c)} 
                         className={`p-8 bg-white rounded-[2rem] border-4 cursor-pointer transition-all flex justify-between items-center ${
                           (step === 2 ? selectedPresident?.id === c.id : selectedVicePresident?.id === c.id) ? 'border-blue-600 bg-blue-50 shadow-lg scale-[1.01]' : 'border-white hover:border-slate-100'
                         }`}>
                      <div>
                        <span className="text-[10px] font-black bg-slate-100 px-3 py-1 rounded-lg uppercase">기호 {step === 2 ? c.id : c.id-100}번</span>
                        <h3 className="text-2xl font-black mt-2 text-slate-900">{c.name}</h3>
                        <p className="text-slate-500 font-bold text-sm italic">"{c.slogan}"</p>
                      </div>
                      <CheckCircle size={32} className={(step === 2 ? selectedPresident?.id === c.id : selectedVicePresident?.id === c.id) ? 'text-blue-600' : 'text-slate-100'} />
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 mt-10">
                  <button onClick={() => setStep(step - 1)} className="flex-1 py-5 bg-white border border-slate-200 rounded-3xl font-black transition-all active:scale-95">이전</button>
                  <button disabled={step === 2 ? !selectedPresident : !selectedVicePresident} onClick={handleNextStep} className="flex-[2] py-5 bg-blue-600 text-white rounded-3xl font-black text-lg shadow-lg active:scale-95 transition-all">다음 단계</button>
                </div>
              </div>
            )}
            {step === 4 && (
              <div className="bg-white rounded-[3rem] shadow-2xl p-10 border border-slate-100 animate-in zoom-in duration-500">
                <h2 className="text-3xl font-black text-center mb-10 tracking-tight uppercase text-slate-900">최종 투표 내용 확인</h2>
                <div className="space-y-6 mb-10 text-center">
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 font-black text-xl tracking-tight text-slate-900">{userData.grade}학년 {userData.class}반 {userData.number}번 {userData.name}</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 bg-amber-50 border border-amber-100 rounded-3xl font-black"><p className="text-xs text-amber-600 mb-1 uppercase tracking-widest text-slate-900">전교회장</p>{selectedPresident?.name}</div>
                    <div className="p-6 bg-purple-50 border border-purple-100 rounded-3xl font-black"><p className="text-xs text-purple-600 mb-1 uppercase tracking-widest text-slate-900">전교부회장</p>{selectedVicePresident?.name}</div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setStep(3)} className="flex-1 py-5 bg-slate-100 rounded-3xl font-black transition-all active:scale-95">수정</button>
                  <button onClick={handleSubmit} className="flex-[2] py-5 bg-emerald-600 text-white rounded-3xl font-black text-xl shadow-xl hover:bg-emerald-700 active:scale-95 transition-all">투표 제출하기</button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden relative animate-in slide-in-from-bottom-4 text-left">
              {resetConfirm && (
                <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 text-center">
                  <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in">
                    <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4"><RotateCcw size={32} /></div>
                    <h4 className="text-xl font-black mb-2 text-slate-900">개별 리셋 확인</h4>
                    <p className="text-sm text-slate-500 font-bold mb-6 tracking-tight">해당 학생의 투표 데이터만 삭제하시겠습니까?</p>
                    <div className="flex gap-3">
                      <button onClick={() => setResetConfirm(null)} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold">취소</button>
                      <button onClick={() => handleResetVoter(resetConfirm)} className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-bold shadow-lg">진행</button>
                    </div>
                  </div>
                </div>
              )}
              {showResetAllModal && (
                <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 text-center">
                  <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in">
                    <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle size={32} /></div>
                    <h4 className="text-xl font-black mb-2 text-slate-900">전체 데이터 초기화</h4>
                    <p className="text-sm text-rose-500 font-black mb-6 leading-tight">주의! 모든 학생의 투표 기록과 득표 결과가 완전히 삭제됩니다.</p>
                    <div className="flex gap-3">
                      <button onClick={() => setShowResetAllModal(false)} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold">취소</button>
                      <button onClick={handleResetAllVotes} disabled={isResettingAll} className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2">
                        {isResettingAll ? <RefreshCw className="animate-spin" size={16}/> : '전체 삭제 실행'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
                <h3 className="text-xl font-black flex items-center gap-3">{isAdminAuthenticated ? <><ShieldCheck className="text-emerald-400" /> 관리 대시보드</> : <><KeyRound className="text-blue-400" /> 보안 인증</>}</h3>
                <button onClick={() => {setShowAdminPanel(false); setIsAdminAuthenticated(false); setAdminAuthForm({id:'', pw:''});}} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all"><X size={18}/></button>
              </div>
              {!isAdminAuthenticated ? (
                <form onSubmit={handleAdminLogin} className="p-10 space-y-4">
                  <input type="text" placeholder="ID" value={adminAuthForm.id} onChange={(e)=>setAdminAuthForm({...adminAuthForm, id: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:border-blue-500" />
                  <input type="password" placeholder="Password" value={adminAuthForm.pw} onChange={(e)=>setAdminAuthForm({...adminAuthForm, pw: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:border-blue-500" />
                  {adminAuthError && <p className="text-xs text-rose-500 font-black">{adminAuthError}</p>}
                  <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-lg">인증</button>
                </form>
              ) : (
                <div className="p-8 space-y-8 animate-in fade-in duration-500">
                  <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                    <button onClick={()=>setAdminTab('stats')} className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${adminTab === 'stats' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>집계</button>
                    <button onClick={()=>setAdminTab('list')} className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${adminTab === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-50'}`}>명단</button>
                  </div>
                  {adminTab === 'stats' ? (
                    <div className="space-y-10">
                      <div className="flex flex-wrap justify-between items-center gap-4">
                        <p className="font-bold text-slate-500 text-sm tracking-tight text-slate-900">전체 투표율: <span className="text-blue-600 font-black text-xl">{((stats.total / totalStudentsList.length) * 100).toFixed(1)}%</span> ({stats.total}/{totalStudentsList.length}명)</p>
                        <button onClick={() => setShowResetAllModal(true)} className="px-4 py-2 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-rose-100 transition-all"><Trash2 size={14}/> 전체 투표 데이터 초기화</button>
                      </div>
                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2 text-center">전교회장</p>
                          {presidents.map(p => {
                            const count = stats.president[p.id] || 0;
                            const percent = stats.total > 0 ? (count / stats.total) * 100 : 0;
                            return (
                              <div key={p.id} className="space-y-1.5">
                                <div className="flex justify-between text-xs font-black text-slate-700"><span>기호 {p.id} {p.name}</span><span>{count}표</span></div>
                                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500 transition-all duration-700" style={{ width: `${percent}%` }} /></div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="space-y-6">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2 text-center">전교부회장</p>
                          {vicePresidents.map(p => {
                            const count = stats.vicePresident[p.id] || 0;
                            const percent = stats.total > 0 ? (count / stats.total) * 100 : 0;
                            return (
                              <div key={p.id} className="space-y-1.5">
                                <div className="flex justify-between text-xs font-black text-slate-700"><span>기호 {p.id-100} {p.name}</span><span>{count}표</span></div>
                                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-purple-500 transition-all duration-700" style={{ width: `${percent}%` }} /></div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <select onChange={(e)=>setFilterGrade(e.target.value)} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold outline-none"><option value="all">학년</option><option value="1">1학년</option><option value="2">2학년</option><option value="3">3학년</option></select>
                        <select onChange={(e)=>setFilterClass(e.target.value)} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold outline-none"><option value="all">반</option>{[1,2,3,4,5,6,7,8,9].map(c => <option key={c} value={c}>{c}</option>)}</select>
                        <select onChange={(e)=>setFilterStatus(e.target.value)} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold outline-none"><option value="all">상태</option><option value="voted">완료</option><option value="not_voted">미참여</option></select>
                        <div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" placeholder="검색" value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)} className="w-full p-3 pl-9 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold outline-none" /></div>
                      </div>
                      <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden max-h-[300px] overflow-y-auto">
                        <table className="w-full text-left text-[10px]">
                          <thead className="sticky top-0 bg-slate-200 font-black uppercase tracking-tighter"><tr><th className="p-3 text-slate-900">학생 정보</th><th className="p-3 text-center text-slate-900">상태</th><th className="p-3 text-center text-slate-900">리셋</th></tr></thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {filteredParticipationList.map((s, idx) => {
                              const hasVoted = !!dbVoters[s.key];
                              return (
                                <tr key={`${s.key}-${idx}`} className="hover:bg-slate-50 transition-colors">
                                  <td className="p-3 font-bold text-slate-700">{s.grade}-{s.class}-{s.number} {s.name}</td>
                                  <td className="p-3 text-center"><span className={`px-2 py-0.5 rounded font-black ${hasVoted ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>{hasVoted ? '완료' : '미참여'}</span></td>
                                  <td className="p-3 text-center">{hasVoted && (<button onClick={() => setResetConfirm(s.key)} className="text-slate-400 hover:text-rose-600 transition-all"><RotateCcw size={14} /></button>)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
        )}
        <div className="mt-20 pt-10 border-t border-slate-200 text-center">
          {!showAdminPanel && (
            <button onClick={() => setShowAdminPanel(true)} className="flex items-center gap-2 mx-auto text-slate-400 hover:text-blue-600 font-bold text-sm transition-colors uppercase tracking-[0.2em]"><BarChart3 size={16} /> Admin Mode</button>
          )}
        </div>
        <footer className="text-center mt-12 opacity-20 text-[10px] font-black uppercase tracking-[0.4em]">EMS Terminal V4.1 Secure Build</footer>
      </div>
    </div>
  );
}
