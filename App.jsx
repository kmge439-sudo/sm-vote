import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, doc, setDoc, getDoc, onSnapshot, deleteDoc, writeBatch, getDocs, updateDoc 
} from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { 
  User, CheckCircle, Award, Users, AlertCircle, Lock, BarChart3, RefreshCw, KeyRound, ShieldCheck, X, Search, RotateCcw, Trash2, AlertTriangle, Fingerprint, ChevronRight, ChevronLeft, ShieldAlert, PlayCircle, StopCircle, Timer, Clock, Trophy, Download, UserPlus, Save, ClipboardCheck
} from 'lucide-react';

// --- [Firebase 설정] ---
const firebaseConfig = {
  apiKey: "AIzaSyCOcU2Fopwe07oHRfANGV_zD-D9rY7IQXw",
  authDomain: "st-shinmyung-5e261.firebaseapp.com",
  projectId: "st-shinmyung-5e261",
  storageBucket: "st-shinmyung-5e261.firebasestorage.app",
  messagingSenderId: "974553161620",
  appId: "1:974553161620:web:0f9ca261bcc887e1173981"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = "shinmyung-election-2026";

// ==========================================
// [보안 데이터] 850여 명 전교생 명단 고정 관리
// ==========================================
const D1 = "1101:강은재:8241,1102:권다은:3192,1103:김나윤:5674,1104:김미소:1209,1105:김보민:9932,1106:김서하:4421,1107:김소정:6712,1108:김수민:2389,1109:김수윤:7710,1110:김수현:1543,1111:김시현:3922,1112:김아란:8841,1113:김주혜:6620,1114:김지민:2104,1115:김지현:5539,1116:박연서:9012,1117:박은서:4328,1118:신수빈:7611,1119:신유빈:1298,1120:양서연:3409,1121:윤가은:5110,1122:윤예원:6782,1123:음채율:2245,1124:이서연:9001,1125:이서은:1123,1126:이정민:4450,1127:이채은:8762,1128:임서현:3341,1129:조온규:6092,1130:최다연:1987,1131:황다겸:7721,1201:금미서:4561,1202:김가윤:8920,1203:김가은:1104,1204:김결이:3452,1205:김도연:7781,1206:김도현:2234,1207:김서율:9019,1208:김연우:6654,1209:김예림:4321,1210:김윤슬:8812,1211:박예진:5543,1212:박주은:1198,1213:박지연:7609,1214:배규나:3421,1215:서진주:9901,1216:성지민:2132,1217:신지아:6784,1218:안나윤:1201,1219:안유빈:8234,1220:오주아:4456,1221:윤채원:3349,1222:이소율:9008,1223:이아인:1127,1224:이윤서:5671,1225:이자은:8765,1226:장예율:2381,1227:정새봄:4412,1228:최민채:6619,1229:최소영:8832,1230:최수빈:1254,1231:하지인:7745";
const D2 = "1301:강나윤:7741,1302:곽은서:3195,1303:김나윤:5682,1304:김민정:1213,1305:박서진:9941,1306:박소영:4429,1307:박시원:6719,1308:방은우:2391,1309:배서연:7718,1310:변예린:1549,1311:손지원:3929,1312:손채원:8848,1313:안수민:6627,1314:우수현:2111,1315:윤아진:5545,1316:이경서:9019,1317:이소윤:4334,1318:이소희:7618,1319:이아윤:1305,1320:이예빈:3416,1321:이유정:5117,1322:이지민:6789,1323:이지유:2252,1324:이호정:9008,1325:전혜주:1130,1326:전효재:4457,1327:정세인:8769,1328:조하온:3348,1329:최예나:6099,1330:최지아:1994,1331:최지율:7728,1401:구나언:4568,1402:권예진:8927,1403:김결:1111,1404:김보경:3459,1405:김보애:7788,1406:김수빈:2241,1407:김연지:9026,1408:김예빈:6661,1409:김예지:4328,1410:김정윤:8819,1411:김지오:5550,1412:나서영:1205,1413:나지영:7616,1414:박사랑:3428,1415:박서현:9908,1416:박성효:2139,1417:오윤나:6791,1418:유다은:1208,1419:이규민:8241,1420:이나현:4463,1421:이다원:3356,1422:이다은:9015,1423:이연서:1134,1424:이지유:5678,1425:이채이:8772,1426:장지원:2388,1427:전아윤:4419,1428:전아현:6626,1429:조한별:8839,1430:조혜원:1261,1431:홍아현:7748";
const D3 = "1501:강에일린:3202,1502:구민채:5689,1503:김다연:1220,1504:김민영:9948,1505:김소현:4436,1506:김예지:6726,1507:김지우:2398,1508:민세하:7725,1509:박민서:1556,1510:박서윤:3936,1511:박솔아:8855,1512:서정원:6634,1513:손하영:2118,1514:안채원:5552,1515:양윤지:9026,1516:유주연:4341,1517:윤현아:7625,1518:이민서:1312,1519:이서경:3423,1520:이서현:5124,1522:이은서:6796,1523:이채은:2259,1524:이채희:9015,1525:이현서:1137,1526:인세현:4464,1527:임주하:8776,1528:장서현:3355,1529:최서연:6106,1530:최현영:2001,1531:황채영:7735,1532:박하윤:4575,1601:김나윤:8934,1602:김다정:1118,1603:김미우:3466,1604:김민정:7795,1605:김보경:2248,1606:김소윤:9033,1607:김유비:6668,1608:김윤서:4335,1609:김지우:8826,1610:김지율:5557,1611:김하늘:1212,1612:김한희:7623,1613:김효원:3435,1614:도가윤:9915,1615:도연우:2146,1616:박소린:6798,1617:박유진:1215,1618:신다연:8248,1619:유세연:4470,1620:이규림:3363,1621:이나윤:9022,1622:이다은:1141,1623:이유주:5685,1624:이채현:8779,1625:이해윤:2395,1626:임다현:4426,1627:전이레:6633,1628:정지민:8846,1629:정지후:1268,1631:하윤서:7755";
const D4 = "1701:고소현:3209,1702:곽나경:5696,1703:구은재:1227,1704:권나현:9955,1705:김다윤:4443,1706:김서연:6733,1707:김시은:2405,1708:김연아:7732,1709:김예은:1563,1710:김윤하:3943,1711:김은서:8862,1712:김주하:6641,1713:류이안:2125,1714:박수하:5559,1715:스미스클로이:9033,1716:신재은:4348,1717:육예지:7632,1718:이서진:1319,1719:이솔민:3430,1720:이연서:5131,1721:이지아:6803,1722:이채연:2266,1723:이하연:9022,1724:장서이:1144,1725:정소윤:4471,1726:조서현:8783,1727:조현서:3362,1728:지서연:6113,1729:차수진:2008,1730:최가온:7742,1731:최예진:4582,1801:강나겸:8941,1802:김가령:1125,1803:김나연:3473,1804:김민채:7802,1805:김서연:2255,1806:김서현:9040,1807:김시현:6675,1808:김예나:4342,1809:김정민:8833,1810:김지윤:5564,1811:김채윤:1219,1812:김효담:7630,1813:박다은:3442,1815:손연주:9922,1816:원다경:2153,1817:윤나경:6805,1818:이다은:1222,1819:이도희:8255,1821:이채윤:4477,1822:장효서:3370,1823:정수아:9029,1824:정유진:1148,1825:채시안:5692,1826:최가은:8786,1827:최라임:2402,1828:최수현:4433,1829:최윤채:6640,1830:팔리로니스해나루이즈:8853,1831:황서율:1275,1832:김민서:7762";
const D5 = "1901:강소윤:3216,1902:고나영:5703,1903:구나은:1234,1904:권나연:9962,1905:권율하:4450,1906:김다윤:6740,1907:김서윤:2412,1908:김수하:7739,1909:노윤채:1570,1910:박가은:3950,1911:박나경:8869,1912:박서우:6648,1913:박시은:2132,1914:박지연:5566,1915:서아진:9040,1916:서예린:4355,1917:서현아:7639,1918:윤정원:1326,1919:이규민:3437,1920:이나현:5138,1921:이서현:6810,1922:이은서:2273,1923:이지윤:9029,1924:이채연:1151,1925:장예원:4478,1926:전다현:8790,1927:정지유:3369,1928:주효주:6120,1929:천세은:2015,1930:천지민:7749,1931:최민서:4589,2101:권보윤:8948,2102:김민서:1132,2103:김세경:3480,2104:김소현:7809,2105:김연재:2262,2106:김예은:9047,2107:김주원:6682,2108:김주은:4349,2109:김지우:8840,2110:김채율:5571,2111:김태이:1226,2112:김하진:7637,2113:남연수:3449,2114:남유담:9929,2115:노하영:2160,2116:박세영:6812,2117:박소윤:1229,2118:박영은:8262,2119:서지원:4484,2120:서한비:3377,2121:송서영:9036,2122:신보빈:1155,2123:안효신:5699,2124:엄선경:8793,2125:윤서영:2409,2126:윤혜솔:4440,2127:이경은:6647,2128:이다원:8860,2129:이라희:1282,2130:이미림:7769,2131:이효리:3223,2132:정라원:5710,2133:정지우:1241,2134:차예설:9969";
const D6 = "2201:공가윤:4457,2202:권효주:6747,2203:김도연:2419,2204:김도이:7746,2205:김민재:1577,2206:김시원:3957,2207:김지민:8876,2208:김지우:6655,2209:김태희:2139,2210:김하린:5573,2211:류겸미:9047,2212:박건희:4362,2213:박규빈:7646,2214:박정인:1333,2215:신소율:3444,2216:신한별:5145,2217:안혜림:6817,2218:오유림:2280,2219:원하라:9036,2220:윤수민:1158,2221:윤지혜:4485,2222:윤채현:8797,2223:이나현:3376,2224:이수민:6127,2225:이지민:2022,2226:이효우:7756,2227:임연서:4596,2228:전소율:8955,2229:정연우:1139,2230:조진아:3487,2231:조채윤:7816,2232:천혜원:2269,2233:최아랑:9054,2234:추민서:6689,2301:구해나:4356,2302:구해린:8847,2303:권서연:5578,2304:권세라:1233,2305:권희원:7644,2306:김나윤:3456,2307:김민서:9936,2308:김민슬:2167,2309:김보현:6819,2310:김시원:1236,2311:김연아:8269,2312:김윤민:4491,2313:김지연:3384,2314:김지유:9043,2315:남건희:1162,2316:도효은:5706,2317:박서윤:8800,2318:박지희:2416,2319:빈예진:4447,2320:서하진:6654,2321:안세민:8867,2322:오지윤:1289,2323:윤리라:7776,2324:이고원:3230,2325:이서영:5717,2327:이유나:1248,2328:이채민:9976,2329:이혜민:4464,2330:전율:6754,2331:주예진:2426,2332:차지윤:7753,2333:최정연:1584,2334:허다현:3964";
// D7 - 2학년 6반 명단 최신 보정 (2601 ~ 2633) 및 기존 학년 데이터 유지
const D7 = "2401:강나현:8883,2402:공민주:6662,2403:권현아:2146,2404:김다인:5580,2405:김민서:9054,2406:김민주:4369,2407:김수연:7653,2408:김연서:1340,2409:김예나:3451,2410:김예원:5152,2411:김유나:6824,2412:김은유:2287,2413:김지우:9043,2414:김채현:1165,2415:도민슬:4492,2416:박서은:8804,2417:배수민:3383,2418:성지희:6134,2419:성혜지:2029,2420:안은솔:7763,2421:이세령:4603,2422:전소이:8962,2423:이유나:1146,2424:이지영:3494,2425:이하율:7823,2426:임현서:2276,2427:임혜인:9061,2428:장채완:6696,2429:전아인:4363,2430:천율이:8854,2431:최지우:5585,2432:한예지:1240,2433:홍수연:7651,2501:강아연:3463,2502:곽유진:9943,2503:권수빈:2174,2504:권효언:6826,2505:김가윤:1243,2506:김규린:8276,2507:김민서:4498,2508:김민채:3391,2509:김소은:9050,2510:김수연:1169,2511:김예후:5713,2512:문서현:8807,2513:박혜린:2423,2514:석예지:4454,2515:성한별:6661,2516:신연우:8874,2517:심민정:1296,2518:여서현:7783,2519:예서영:3237,2520:윤가인:5724,2521:이담희:1255,2522:이서희:9983,2523:이세연:4471,2524:이예원:6761,2526:임하음:2433,2527:장윤서:7760,2528:정아진:1591,2529:정유나:3971,2530:정은유:8890,2531:정지우:6669,2532:조은별:2153,2533:주효안:5587,2601:권유안:9061,2602:김나현:4376,2603:김려원:7660,2604:김서희:1347,2605:김영원:3458,2606:김지빈:5159,2607:김채민:6831,2608:나연우:2294,2609:남서연:9050,2610:문지원:1172,2611:박나연:8811,2612:박다영:3390,2613:박민서:6141,2614:박예진:2036,2615:박현서:7770,2616:배수빈:4610,2617:서지운:8969,2618:성채원:1153,2619:윤슬:3501,2620:이서영:7830,2621:이세랑:2283,2622:이주희:9068,2623:이지율:6703,2624:임유나:4370,2625:전하진:8861,2626:정수현:5592,2627:정시윤:1247,2628:정윤슬:7658,2629:정해린:3470,2630:채민하:9950,2631:천가인:2181,2632:최윤슬:6833,2633:최희수:1250";
const D8 = "2701:권하윤:8283,2702:김경은:4505,2703:김단희:3398,2704:김민채:9057,2705:김서령:1176,2706:김성연:5720,2707:김이슬:8814,2708:김주희:2430,2709:김채윤:4461,2710:류민서:6668,2711:문규림:8881,2712:박다해:1303,2713:박소영:7790,2714:박지수:3244,2715:박채은:5731,2716:백승연:1262,2717:백하비:9990,2718:변예진:4478,2719:서보배:6768,2720:신아윤:2440,2721:심예담:7767,2722:양채원:1598,2723:여소율:3978,2724:유수진:8897,2725:이수연:6676,2726:이하린:2160,2727:이효린:5594,2728:장아영:9068,2729:장혜리:4383,2730:정연후:7667,2731:정하은:1354,2732:하연재:3465,2733:한윤슬:5166,2801:권효서:6838,2802:김가연:2301,2803:김가예:9057,2804:김나온:1179,2805:김소연:4506,2806:김연서:8818,2807:김연우:3397,2808:김유진:6148,2809:김주혜:2043,2810:김지우:7777,2811:박시연:4617,2812:박예봄:8976,2813:서예빈:1160,2814:신은설:3508,2815:여시화:7837,2816:유채령:2290,2817:윤연우:9075,2818:이도혜:6710,2819:이라현:4377,2820:이서현:8868,2821:이채은:5599,2822:이하은:1254,2823:전지현:7665,2824:전현서:3477,2825:정윤지:9957,2826:조서연:2188,2827:지송은:6840,2828:진은서:1257,2829:최유란:8290,2830:최윤서:4512,2831:하지원:3405,2832:허수진:9064,2833:황서윤:1183,2901:강소율:5727,2902:김가은:8821,2903:김나윤:2437,2904:김나현:4468,2905:김서연:6675,2906:김수영:8888,2907:김은우:1310,2908:김인하:7797,2909:김하은:3251,2910:도예서:5738,2911:도유빈:1269,2912:도윤슬:9997,2913:박민서:4485,2914:박선영:6775,2915:박소이:2447,2916:박수빈:7774,2917:박윤서:1605,2918:백서현:3985,2919:손지민:8904,2920:송현지:6683,2921:심윤서:2167,2922:안민슬:5601,2923:음채우:9075,2924:이다은:4390,2925:이수연:7674,2926:이연우:1361,2927:이예진:3472,2928:이윤진:5173,2929:장채윤:6845,2930:전이진:2308,2931:정다연:9064,2932:정려원:1186,2933:정하린:4513";
const S9 = "3101:김가령:8825,3102:김수연:3404,3103:김승은:6155,3104:김시현:2050,3105:김예담:7784,3106:김이경:4624,3107:김주연:8983,3108:김주원:1167,3109:김효림:3515,3110:김효빈:7844,3111:박서윤:2297,3112:박세은:9082,3113:박지윤:6717,3114:박채영:4384,3115:배드린:8875,3116:손유:5606,3117:손지우:1261,3118:송슬:7672,3119:유재서:3484,3120:윤서윤:9964,3121:윤혜린:2195,3122:장하은:6847,3123:전하늘:1264,3124:조희진:8297,3125:천영서:4519,3126:천지민:3412,3127:최민서:9071,3128:최정윤:1190,3129:최한나:5734,3130:황정윤:8828,3201:강현진:2444,3202:곽예설:4475,3203:김가온:6682,3204:김민하:8895,3205:김예림:1317,3206:김예서:7804,3207:김지원:3258,3208:김태영:5745,3209:김하은:1276,3210:남유민:1004,3211:문예진:4492,3212:박서윤:6782,3213:박서진:2454,3214:박수민:7781,3215:박채연:1612,3216:설하영:3992,3217:예도연:8911,3218:우승은:6690,3219:이세은:2174,3220:이유주:5608,3221:이하정:9082,3222:임서영:4397,3223:정규현:7681,3224:정다인:1368,3225:정서영:3479,3226:최가은:5180,3227:최다연:6852,3228:최리아:2315,3229:최지우:9071,3230:최희윤:1193,3301:강현서:4520,3302:권아연:8832,3303:김민유:3411,3304:김보미:6162,3305:김서영:2057,3306:김소윤:7791,3307:김소은:4631,3308:김예지:8990,3309:김지율:1174,3310:김현서:3522,3311:남승연:7851,3312:박새봄:2304,3313:박지후:9089,3314:박채은:6724,3315:박혜린:4391,3316:박혜진:8882,3317:박효은:5613,3318:배시온:1268,3319:오서윤:7679,3320:오세율:3491,3321:이경민:9971,3322:이은희:2202,3323:이채은:6854,3324:이혜원:1271,3325:장혜정:8304,3326:조한울:4526,3327:주은성:3419,3328:진연우:9078,3329:황다현:1197,3330:황서영:5741";
const S10 = "3401:곽다연:8835,3402:김가은:2451,3403:김민선:4482,3404:김지원:6689,3405:노하정:8902,3406:도하진:1324,3407:박경빈:7811,3408:박미준:3265,3409:박서영:5752,3410:박서윤:1283,3411:배가은:1011,3412:백하영:4499,3413:손민주:6789,3414:손예영:2461,3415:송민아:7788,3416:신나라:1619,3417:신서연:3999,3418:우지민:8918,3419:이서아:6697,3420:이서율:2181,3421:이세령:5615,3422:이소정:9089,3423:이연우:4404,3424:정아인:7688,3425:정해원:1375,3426:최효리:3486,3427:최휘진:5187,3428:현다연:6859,3429:홍도영:2322,3430:황서영:9078,3431:황서휘:1200,3501:권가람:4527,3502:권도연:8839,3503:김사랑:3418,3504:김수정:6169,3505:김유진:2064,3506:김은서:7798,3507:김현주:4638,3508:손서윤:8997,3509:송지은:1181,3510:송채윤:3529,3511:신다솜:7858,3512:신예원:2311,3513:양소윤:9096,3514:우정민:6731,3515:유수민:4398,3516:이비안:8889,3517:이서진:5620,3518:이유진:1275,3519:이윤서:7686,3520:이지안:3498,3521:이채은:9978,3522:이현서:2209,3523:전지율:6861,3524:정다은:1278,3525:정유림:8311,3526:정은교:4533,3527:진효림:3426,3528:최연우:9085,3529:최희재:1204,3530:하지우:5748,3531:황봄:8842,3601:김경민:2458,3602:김고은:4489,3603:김기란:6696,3604:김미령:8909,3605:김사랑:1331,3606:김소연:7818,3607:김소윤:3272,3608:김예린:5759,3609:김지우:1290,3610:문서영:1018,3611:박나연:6796,3612:박지성:4506,3613:백인경:2468,3614:서지우:7795,3615:서혜정:1626,3616:송주연:4006,3617:신효주:8925,3618:윤선진:6704,3619:윤수아:2188,3620:윤진서:5622,3621:이선주:9096,3622:이수안:4411,3623:이지우:7695,3624:임주비:1382,3625:임하윤:3493,3626:전소이:5194,3627:전지윤:6866,3628:정지민:2329,3629:천사론:9085,3630:한서윤:1207,3631:황혜린:4534,3701:강연우:8846,3702:곽은빈:3425,3703:김가을:6176,3704:김란희:2071,3705:김영아:7805,3706:김채윤:4645,3707:김효린:9004,3708:박다은:1188,3709:박민서:3536,3710:박보민:7865,3711:박서윤:2318,3712:박현서:9103,3713:변서현:6738,3714:신서영:4398,3715:여효이:8896,3716:오채원:5627,3717:이라은:1282,3718:이서연:7693,3719:이시원:3505,3720:이예은:9985,3721:이제아:2216,3722:이현진:6868,3723:이효주:1285,3724:정다민:8318,3725:정은희:4540,3726:조시연:3433,3727:천예현:9092,3728:최유리:1211,3729:최재원:5755,3730:하루아:8849,3731:허다령:2465,3801:권경민:4496,3802:권예린:6703,3803:김수혜:8916,3804:김윤아:1338,3805:김지인:7825,3806:김한결:3279,3807:박채원:5766,3808:배해인:1297,3809:서지우:1025,3810:양예지:4513,3811:이나경:6803,3812:이다인:2475,3813:이세은:7802,3814:이승은:1633,3815:이지윤:4013,3816:이채은:8932,3817:이효원:6711,3818:임소현:2195,3819:전민지:5629,3820:정민주:9103,3821:조다혜:4418,3822:지수현:7702,3823:차승연:1389,3824:천원정:3500,3825:최아영:5201,3826:최유나:6873,3827:최윤화:2336,3828:하민서:9092,3829:홍승아:1214,3830:황수현:4541,3901:권윤솔:8853,3902:김미담:3432,3903:김민지:6183,3904:김민채:2078,3905:김수아:7812,3906:김유진:4652,3907:김정현:9011,3908:김지아:1195,3909:남민지:3543,3910:박선우:7872,3911:박지현:2325,3912:백민주:9110,3913:빈다은:6745,3914:손주연:4405,3915:손현재:8903,3916:신그린:5634,3917:오은채:1289,3918:윤소원:7700,3919:이가윤:3512,3920:이시윤:9992,3921:이은교:2223,3922:이채윤:6875,3923:이한비:1292,3924:전하늘:8325,3925:정여원:4547,3926:조민영:3440,3927:지예안:9099,3928:최은교:1218,3929:허윤서:5762,3930:황서영:8856";

// 실시간 파싱 함수 (데이터 덩어리들을 완벽하게 합쳐서 맵 생성)
const parseFullStudentList = () => {
  const map = {};
  [D1, D2, D3, D4, D5, D6, D7, D8, S9, S10].forEach(chunk => {
    if (!chunk) return;
    chunk.split(',').forEach(item => {
      const [id, name, code] = item.split(':');
      if (id && name && code) map[id] = { name, code };
    });
  });
  return map;
};

const FINAL_AUTH_CODES_MAP = parseFullStudentList();

// 후보자 초기 데이터 정의 (안정화)
const INITIAL_CANDIDATES = {
  president: [
    { id: 1, name: '황수현', slogan: '3학년 8반의 열정으로 학교를 빛내겠습니다!' },
    { id: 2, name: '김병진', slogan: '3학년 6반의 리더십, 신명의 변화를 약속합니다.' },
    { id: 3, name: '김재수', slogan: '3학년 7반의 성실함으로 모두가 행복한 학교!' },
    { id: 4, name: '박재두', slogan: '3학년 9반의 패기, 소통하는 회장이 되겠습니다.' },
    { id: 5, name: '손희동', slogan: '3학년 7반의 진심, 발로 뛰는 일꾼이 되겠습니다.' },
    { id: 6, name: '김민혜', slogan: '3학년 4반의 따뜻함, 학생들의 목소리를 듣겠습니다.' }
  ],
  vp1: [{ id: 101, name: '미정', slogan: '공약을 입력하세요' }],
  vp2: [{ id: 201, name: '미정', slogan: '공약을 입력하세요' }],
  vp3: [{ id: 301, name: '미정', slogan: '공약을 입력하세요' }]
};

export default function App() {
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState({ grade: '', class: '', number: '', name: '', authCode: '' });
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [selectedPres, setSelectedPres] = useState(null);
  const [selectedVP1, setSelectedVP1] = useState(null);
  const [selectedVP2, setSelectedVP2] = useState(null);
  const [selectedVP3, setSelectedVP3] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [votingState, setVotingState] = useState('ready'); 
  
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminAuthForm, setAdminAuthForm] = useState({ id: '', pw: '' });
  const [adminAuthError, setAdminAuthError] = useState('');
  const [dbVotes, setDbVotes] = useState([]);
  const [dbVoters, setDbVoters] = useState({});
  const [dbStudents, setDbStudents] = useState([]);
  const [dbCandidates, setDbCandidates] = useState(null);
  const [adminTab, setAdminTab] = useState('stats');
  const [resetConfirm, setResetConfirm] = useState(null);
  const [isResettingAll, setIsResettingAll] = useState(false);
  const [showResetAllModal, setShowResetAllModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [filterGrade, setFilterGrade] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 보안 강화: 개발자 도구 방어
  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    const handleKeyDown = (e) => {
      if (e.keyCode === 123 || (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) || (e.ctrlKey && e.keyCode === 85)) {
        e.preventDefault();
      }
    };
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try { 
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
           try {
             await signInWithCustomToken(auth, __initial_auth_token);
           } catch (e) {
             await signInAnonymously(auth);
           }
        } else {
           await signInAnonymously(auth); 
        }
      } catch (err) { console.error("Auth init error:", err); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const settingsRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'votingControl');
    const unsubSettings = onSnapshot(settingsRef, (snapshot) => {
      if (snapshot.exists()) { setVotingState(snapshot.data().status || 'ready'); }
    });

    const candidatesRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'candidates');
    const unsubCandidates = onSnapshot(candidatesRef, (snap) => {
      if (snap.exists()) setDbCandidates(snap.data());
      else setDbCandidates(INITIAL_CANDIDATES);
    });

    return () => { unsubSettings(); unsubCandidates(); };
  }, [user]);

  useEffect(() => {
    if (!user || !isAdminAuthenticated) return;
    
    const unsubVotes = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'votes'), (snapshot) => {
      setDbVotes(snapshot.docs.map(doc => doc.data()));
    });
    
    const unsubVoters = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'voters'), (snapshot) => {
      const map = {};
      snapshot.docs.forEach(doc => { map[doc.id] = doc.data(); });
      setDbVoters(map);
    });
    
    const unsubVault = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'authVault'), (snapshot) => {
      setDbStudents(snapshot.docs.map(doc => ({ key: doc.id, ...doc.data() })));
    });
    
    return () => { unsubVotes(); unsubVoters(); unsubVault(); };
  }, [user, isAdminAuthenticated]);

  const verifyStudent = async () => {
    if (votingState !== 'active') return false;
    setIsVerifying(true);
    const { grade, class: cls, number, name, authCode } = userData;
    const formattedNumber = number.toString().padStart(2, '0');
    const studentId = `${grade}${cls}${formattedNumber}`;
    const studentKey = `${grade}${cls}${formattedNumber}${name}`;
    
    if (!user) { setError('서버 연결 중...'); setIsVerifying(false); return false; }

    const entry = FINAL_AUTH_CODES_MAP[studentId];

    if (!entry || entry.name !== name) { setError('명단에 없는 학생입니다.'); setIsVerifying(false); return false; }
    if (entry.code !== authCode.trim()) { setError('인증 코드가 일치하지 않습니다.'); setIsVerifying(false); return false; }

    try {
      const voterDoc = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'voters', studentKey));
      if (voterDoc.exists()) {
        setError('이미 투표를 완료했습니다.');
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
    if (!user || votingState !== 'active') return;
    const { grade, class: cls, number, name } = userData;
    const formattedNumber = number.toString().padStart(2, '0');
    const userKey = `${grade}${cls}${formattedNumber}${name}`;
    const now = new Date().toISOString();
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'votes', userKey), {
        presidentId: selectedPres.id, vp1Id: selectedVP1.id, vp2Id: selectedVP2.id, vp3Id: selectedVP3.id,
        timestamp: now
      });
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'voters', userKey), {
        voted: true, votedAt: now
      });
      setIsSubmitted(true);
    } catch (err) { setError('제출 실패'); }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    const { id: inputId, pw: inputPw } = adminAuthForm;
    const adminRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'adminAccount');
    
    try {
        const adminSnap = await getDoc(adminRef);
        if (adminSnap.exists()) {
            const { id: dbId, pw: dbPw } = adminSnap.data();
            if (inputId === dbId && inputPw === dbPw) {
                setIsAdminAuthenticated(true);
                setAdminAuthError('');
                return;
            }
        }
        if (inputId === 'kmge439' && inputPw === 'dkssud2323!') {
            setIsAdminAuthenticated(true);
            setAdminAuthError('');
            await setDoc(adminRef, { id: 'kmge439', pw: 'dkssud2323!' });
        } else {
            setAdminAuthError('계정 정보가 일치하지 않습니다.');
        }
    } catch (err) {
        if (inputId === 'kmge439' && inputPw === 'dkssud2323!') {
            setIsAdminAuthenticated(true);
            setAdminAuthError('');
        } else {
            setAdminAuthError('인증 오류');
        }
    }
  };

  const handleResetVoter = async (studentKey) => {
    if (!user || !isAdminAuthenticated) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'voters', studentKey));
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'votes', studentKey));
      setResetConfirm(null);
    } catch (err) { }
  };

  const handleResetAllVotes = async () => {
    if (!user || !isAdminAuthenticated) return;
    if (!confirm("주의! 모든 투표 기록이 완전히 삭제됩니다. 계속하시겠습니까?")) return;
    setIsResettingAll(true);
    try {
      const votersSnap = await getDocs(collection(db, 'artifacts', appId, 'public', 'data', 'voters'));
      const votesSnap = await getDocs(collection(db, 'artifacts', appId, 'public', 'data', 'votes'));
      const batch = writeBatch(db);
      votersSnap.docs.forEach(d => batch.delete(d.ref));
      votesSnap.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();
      setShowResetAllModal(false);
      alert("집계 데이터 초기화 완료!");
    } catch (err) { } 
    finally { setIsResettingAll(false); }
  };

  const syncAuthVault = async () => {
    const fullCount = Object.keys(FINAL_AUTH_CODES_MAP).length;
    if (fullCount === 0) return alert("코드에 명단이 없습니다.");
    if (!confirm(`${fullCount}명의 명단을 서버로 전송하시겠습니까?`)) return;
    
    setIsSyncing(true);
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'candidates'), INITIAL_CANDIDATES);
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'adminAccount'), { id: 'kmge439', pw: 'dkssud2323!' });
      
      const entries = Object.entries(FINAL_AUTH_CODES_MAP);
      for (let i = 0; i < entries.length; i += 300) {
        const batch = writeBatch(db);
        const chunk = entries.slice(i, i + 300);
        chunk.forEach(([id, data]) => {
          batch.set(doc(db, 'artifacts', appId, 'public', 'data', 'authVault', id + data.name), { code: data.code });
        });
        await batch.commit();
      }
      alert("동기화 완료!");
    } catch (e) { alert("오류: " + e.message); }
    finally { setIsSyncing(false); }
  };

  const stats = useMemo(() => {
    const res = { pres: {}, vp1: {}, vp2: {}, vp3: {}, total: dbVotes.length };
    dbVotes.forEach(v => {
      res.pres[v.presidentId] = (res.pres[v.presidentId] || 0) + 1;
      res.vp1[v.vp1Id] = (res.vp1[v.vp1Id] || 0) + 1;
      res.vp2[v.vp2Id] = (res.vp2[v.vp2Id] || 0) + 1;
      res.vp3[v.vp3Id] = (res.vp3[v.vp3Id] || 0) + 1;
    });
    return res;
  }, [dbVotes]);

  const downloadCSV = (data, filename) => {
    const BOM = '\uFEFF'; 
    const csvContent = BOM + data.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    document.body.appendChild(link);
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toLocaleDateString()}.csv`;
    link.click();
    document.body.removeChild(link);
  };

  const handleExportResults = () => {
    const rows = [["선거 부문", "후보 이름", "득표수"]];
    ['president', 'vp1', 'vp2', 'vp3'].forEach(cat => {
      const candidatesList = dbCandidates ? dbCandidates[cat] : INITIAL_CANDIDATES[cat];
      const key = cat === 'president' ? 'pres' : cat;
      candidatesList?.forEach(p => rows.push([
        cat === 'president' ? '전교회장' : cat === 'vp1' ? '1학년 부회장' : cat === 'vp2' ? '2학년 부회장' : '3학년 부회장', 
        p.name, 
        stats[key][p.id] || 0
      ]));
    });
    downloadCSV(rows, "투표집계");
  };

  const handleExportVoters = () => {
    // 엑셀 헤더에 '인증 코드' 추가
    const rows = [["학년", "반", "번호", "이름", "인증 코드", "투표 여부", "투표 시간"]];
    Object.entries(FINAL_AUTH_CODES_MAP).forEach(([id, data]) => {
      const v = dbVoters[id + data.name];
      const timeStr = v?.votedAt ? new Date(v.votedAt).toLocaleString() : "-";
      rows.push([
        id[0], 
        id[1], 
        id.substring(2), 
        data.name, 
        data.code, // 인증 코드 데이터 추가
        v ? "완료" : "미참여", 
        timeStr
      ]);
    });
    downloadCSV(rows, "투표명단");
  };

  const filteredParticipationList = useMemo(() => {
    return Object.entries(FINAL_AUTH_CODES_MAP).filter(([id, data]) => {
      const matchGrade = filterGrade === 'all' || id.startsWith(filterGrade);
      const matchSearch = data.name.includes(searchQuery) || id.includes(searchQuery);
      return matchGrade && matchSearch;
    }).sort((a,b) => a[0].localeCompare(b[0]));
  }, [FINAL_AUTH_CODES_MAP, filterGrade, searchQuery]);

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-slate-900">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 text-center border border-slate-100 text-slate-900">
          <CheckCircle size={80} className="text-emerald-500 mx-auto mb-6" />
          <h2 className="text-3xl font-black mb-4 tracking-tight text-slate-900">투표 제출 완료</h2>
          <p className="text-slate-600 mb-8 font-medium">참여해 주셔서 감사합니다.</p>
          <button onClick={() => window.location.reload()} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black transition-all active:scale-95 text-slate-100 font-sans">닫기</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4 font-sans text-slate-900 selection:bg-blue-100 select-none text-slate-900">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full mb-4 uppercase tracking-[0.2em] shadow-lg text-slate-100">
            <Lock size={12} /> SECURED SYSTEM V8.1
          </div>
          <h1 className="text-4xl font-black mb-2 tracking-tighter text-slate-900">2026학년도 신명여자중학교 전교 회장단 선거</h1>
        </div>

        {!showAdminPanel ? (
          <div className="max-w-2xl mx-auto text-slate-900">
            {step === 1 && (
              <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-100 animate-in slide-in-from-bottom-4 duration-500 text-slate-900">
                {votingState === 'active' ? (
                  <>
                    <div className="flex items-center gap-4 mb-10 text-slate-900">
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shadow-inner"><Fingerprint size={28} strokeWidth={2.5} /></div>
                      <h2 className="text-2xl font-black text-slate-900">본인 확인 및 인증</h2>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-4 text-slate-900">
                      <select value={userData.grade} onChange={(e) => setUserData({...userData, grade: e.target.value})} className="p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-center outline-none text-slate-900">
                        <option value="">학년</option><option value="1">1</option><option value="2">2</option><option value="3">3</option>
                      </select>
                      <input type="number" placeholder="반" value={userData.class} onChange={(e) => setUserData({...userData, class: e.target.value})} className="p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-center outline-none text-slate-900" />
                      <input type="number" placeholder="번" value={userData.number} onChange={(e) => setUserData({...userData, number: e.target.value})} className="p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-center outline-none text-slate-900" />
                    </div>
                    <input type="text" placeholder="이름" value={userData.name} onChange={(e) => setUserData({...userData, name: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-xl px-8 mb-4 outline-none focus:border-blue-500 text-slate-900 font-sans" />
                    <div className="relative mb-6 text-slate-900">
                      <KeyRound className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-400" size={20} />
                      <input type="text" placeholder="인증 코드 입력" value={userData.authCode} onChange={(e) => setUserData({...userData, authCode: e.target.value})} className="w-full p-5 pl-16 bg-blue-50 border-2 border-blue-100 rounded-2xl font-black text-xl outline-none focus:border-blue-500 text-slate-900 font-sans" />
                    </div>
                    {error && <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 mb-6 flex items-center gap-2 text-sm font-black animate-in shake font-sans text-rose-600"><AlertCircle size={18} />{error}</div>}
                    <button disabled={!userData.grade || !userData.class || !userData.number || !userData.name || !userData.authCode || isVerifying} onClick={handleNextStep} className="w-full py-6 bg-blue-600 text-white rounded-3xl font-black text-xl shadow-xl transition-all active:scale-95 text-slate-100 font-sans">
                      {isVerifying ? <RefreshCw className="animate-spin mx-auto" /> : '인증 확인 및 투표 시작'}
                    </button>
                  </>
                ) : (
                  <div className="text-center py-10">
                    {votingState === 'ready' ? (
                      <><Timer size={64} className="mx-auto text-amber-500 mb-6" /><h2 className="text-2xl font-black mb-4 text-slate-900">투표 준비 중</h2><p className="text-slate-500 font-bold font-sans text-slate-900">아직 투표 시간이 아닙니다. 시작될 때까지 기다려 주세요.</p></>
                    ) : (
                      <><StopCircle size={64} className="mx-auto text-rose-500 mb-6" /><h2 className="text-2xl font-black mb-4 text-slate-900">투표 종료</h2><p className="text-slate-500 font-bold font-sans text-slate-900">2026학년도 선거 투표가 마감되었습니다.</p></>
                    )}
                  </div>
                )}
              </div>
            )}

            {[2, 3, 4, 5].includes(step) && dbCandidates && (
              <div className="animate-in slide-in-from-right-8 duration-500 text-slate-900">
                <div className="flex justify-between items-end mb-8 text-slate-900">
                  <h2 className="text-2xl font-black flex items-center gap-3 tracking-tight text-slate-900">
                    {step === 2 && <><Award className="text-amber-500" /> 전교회장 투표</>}
                    {step === 3 && <><Users className="text-blue-500" /> 1학년 부회장 투표</>}
                    {step === 4 && <><Users className="text-indigo-500" /> 2학년 부회장 투표</>}
                    {step === 5 && <><Users className="text-purple-500" /> 3학년 부회장 투표</>}
                  </h2>
                  <span className="text-xs font-black text-slate-400 tracking-widest uppercase font-sans text-slate-900">Step {step-1} / 4</span>
                </div>
                <div className="grid gap-4 text-slate-900">
                  {dbCandidates[step === 2 ? 'president' : `vp${step-2}`]?.map(c => {
                    const isSelected = (step===2 && selectedPres?.id===c.id) || (step===3 && selectedVP1?.id===c.id) || (step===4 && selectedVP2?.id===c.id) || (step===5 && selectedVP3?.id===c.id);
                    return (
                      <div key={c.id} onClick={() => {
                        if(step===2) setSelectedPres(c); if(step===3) setSelectedVP1(c); if(step===4) setSelectedVP2(c); if(step===5) setSelectedVP3(c);
                      }} className={`p-6 bg-white rounded-[1.5rem] border-4 cursor-pointer transition-all flex justify-between items-center ${isSelected ? 'border-blue-600 bg-blue-50 shadow-lg scale-[1.01]' : 'border-white hover:border-slate-100'}`}>
                        <div>
                          <span className="text-[10px] font-black bg-slate-100 px-3 py-1 rounded-lg uppercase tracking-wider text-slate-900">기호 {c.id % 100}번</span>
                          <h3 className="text-xl font-black mt-2 text-slate-900 text-slate-900">{c.name}</h3>
                          <p className="text-slate-500 font-bold text-sm italic font-sans text-slate-500">"{c.slogan}"</p>
                        </div>
                        <CheckCircle size={28} className={isSelected ? 'text-blue-600' : 'text-slate-100'} />
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-4 mt-10">
                  <button onClick={() => setStep(step - 1)} className="flex-1 py-4 bg-white border border-slate-200 rounded-2xl font-black transition-all active:scale-95 flex items-center justify-center gap-2 text-slate-900 font-sans"><ChevronLeft size={18}/>이전</button>
                  <button disabled={(step===2 && !selectedPres) || (step===3 && !selectedVP1) || (step===4 && !selectedVP2) || (step===5 && !selectedVP3)} onClick={handleNextStep} className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 text-slate-100 font-sans">다음 단계 <ChevronRight size={18}/></button>
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="bg-white rounded-[3rem] shadow-2xl p-10 border border-slate-100 animate-in zoom-in duration-500 text-slate-900">
                <h2 className="text-2xl font-black text-center mb-6 tracking-tight uppercase text-slate-900">최종 투표 내용 확인</h2>
                <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 mb-8 flex items-start gap-3 text-slate-900">
                  <ShieldCheck size={24} className="text-blue-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-blue-900 font-bold leading-relaxed font-sans text-slate-900">본 투표는 <span className="underline decoration-2 underline-offset-2">비밀 투표</span>로 진행됩니다. 제출 후에는 그 누구도 투표 내용을 확인할 수 없으니 안심하고 제출해 주세요.</p>
                </div>
                <div className="space-y-4 mb-10 text-slate-900">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 font-black text-center text-lg">{userData.grade}학년 {userData.class}반 {userData.number}번 {userData.name}</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-900">
                    <div className="p-5 bg-amber-50 border border-amber-100 rounded-2xl font-black text-slate-900"><p className="text-[10px] text-amber-600 mb-1 uppercase tracking-widest font-black text-amber-600">전교회장</p>{selectedPres?.name}</div>
                    <div className="p-5 bg-blue-50 border border-blue-100 rounded-2xl font-black text-slate-900"><p className="text-[10px] text-blue-600 mb-1 uppercase tracking-widest font-black text-blue-600">1학년 부회장</p>{selectedVP1?.name}</div>
                    <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-2xl font-black text-slate-900"><p className="text-[10px] text-indigo-600 mb-1 uppercase tracking-widest font-black text-indigo-600">2학년 부회장</p>{selectedVP2?.name}</div>
                    <div className="p-5 bg-purple-50 border border-purple-100 rounded-2xl font-black text-slate-900"><p className="text-[10px] text-purple-600 mb-1 uppercase tracking-widest font-black text-purple-600">3학년 부회장</p>{selectedVP3?.name}</div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setStep(5)} className="flex-1 py-5 bg-slate-100 rounded-2xl font-black transition-all active:scale-95 text-slate-900 font-sans">수정</button>
                  <button onClick={handleSubmit} className="flex-[2] py-5 bg-emerald-600 text-white rounded-2xl font-black text-xl shadow-xl hover:bg-emerald-700 active:scale-95 transition-all text-slate-100 font-sans">최종 투표 제출</button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden relative animate-in slide-in-from-bottom-4 text-left text-slate-900">
              {!!(resetConfirm || showResetAllModal) && (
                <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 text-center text-white">
                  <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in text-slate-900">
                    <div className={`w-16 h-16 ${resetConfirm ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      {resetConfirm ? <RotateCcw size={32} /> : <AlertTriangle size={32} />}
                    </div>
                    <h4 className="text-xl font-black mb-2 text-slate-900">{resetConfirm ? '개별 리셋' : '전체 초기화'}</h4>
                    <p className="text-sm text-slate-500 font-bold mb-6 text-slate-900">{resetConfirm ? '해당 학생의 투표 데이터를 삭제하시겠습니까?' : '모든 투표 결과가 삭제됩니다.'}</p>
                    <div className="flex gap-3 text-slate-900">
                      <button onClick={() => {setResetConfirm(null); setShowResetAllModal(false);}} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold font-sans">취소</button>
                      <button onClick={resetConfirm ? () => handleResetVoter(resetConfirm) : handleResetAllVotes} className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-bold shadow-lg text-slate-100 font-sans">진행</button>
                    </div>
                  </div>
                </div>
              )}

            <div className="bg-slate-900 p-8 text-white flex justify-between items-center font-sans text-slate-100">
              <h3 className="text-xl font-black flex items-center gap-3"><ShieldCheck className="text-emerald-400" /> 관리 대시보드</h3>
              <button onClick={() => {setShowAdminPanel(false); setIsAdminAuthenticated(false);}} className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-slate-100"><X size={18}/></button>
            </div>

            {!isAdminAuthenticated ? (
              <form onSubmit={handleAdminLogin} className="p-10 space-y-4 text-slate-900">
                <input type="text" placeholder="Admin ID" value={adminAuthForm.id} onChange={(e)=>setAdminAuthForm({...adminAuthForm, id: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none text-slate-900 font-sans" />
                <input type="password" placeholder="Password" value={adminAuthForm.pw} onChange={(e)=>setAdminAuthForm({...adminAuthForm, pw: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none text-slate-900 font-sans" />
                {adminAuthError && <p className="text-xs text-rose-500 font-black font-sans text-rose-500">{adminAuthError}</p>}
                <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black font-sans text-slate-100">로그인</button>
              </form>
            ) : (
              <div className="p-8 space-y-8 animate-in fade-in duration-500 font-sans text-slate-900">
                <div className="flex bg-slate-100 p-1.5 rounded-2xl overflow-x-auto text-slate-900">
                  <button onClick={()=>setAdminTab('stats')} className={`flex-1 py-3 px-4 rounded-xl font-black text-xs whitespace-nowrap ${adminTab === 'stats' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>집계 현황</button>
                  <button onClick={()=>setAdminTab('list')} className={`flex-1 py-3 px-4 rounded-xl font-black text-xs whitespace-nowrap ${adminTab === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>명단/보안</button>
                  <button onClick={()=>setAdminTab('system')} className={`flex-1 py-3 px-4 rounded-xl font-black text-xs whitespace-nowrap ${adminTab === 'system' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>시스템 설정</button>
                </div>

                {adminTab === 'stats' && (
                  <div className="space-y-10 text-slate-900">
                    <div className="flex justify-between items-center gap-4 text-slate-900 font-sans">
                      <p className="font-black text-sm text-slate-900">전체 투표율: <span className="text-blue-600 text-xl font-sans">{((stats.total / Object.keys(FINAL_AUTH_CODES_MAP).length) * 100).toFixed(1)}%</span> ({stats.total}/{Object.keys(FINAL_AUTH_CODES_MAP).length}명)</p>
                      <button onClick={handleExportResults} className="px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-xs font-black flex items-center gap-2 shadow-sm text-emerald-600 font-sans"><Download size={14}/> 엑셀</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 text-slate-900">
                      {['pres', 'vp1', 'vp2', 'vp3'].map((key) => {
                        const catKey = key === 'pres' ? 'president' : key;
                        const candidatesList = dbCandidates ? dbCandidates[catKey] : INITIAL_CANDIDATES[catKey];
                        const currentMax = candidatesList && candidatesList.length > 0 ? Math.max(...candidatesList.map(p => stats[key][p.id] || 0)) : 0;
                        return (
                          <div key={key} className="space-y-4 text-slate-900">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">{key==='pres' ? '전교회장' : key==='vp1' ? '1학년 부회장' : key==='vp2' ? '2학년 부회장' : '3학년 부회장'}</p>
                            {candidatesList?.map(p => {
                              const count = stats[key][p.id] || 0;
                              const percent = stats.total > 0 ? (count / stats.total) * 100 : 0;
                              const isTop = count > 0 && count === currentMax;
                              return (
                                <div key={p.id} className="space-y-1.5 text-slate-900">
                                  <div className="flex justify-between text-xs font-black text-slate-700">
                                    <span className="flex items-center gap-1">{isTop && <Trophy size={12} className="text-amber-500" />}{p.name}</span>
                                    <span className={isTop ? 'text-rose-600 font-sans' : 'font-sans'}>{count}표</span>
                                  </div>
                                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                    <div className={`h-full transition-all duration-1000 ${isTop ? 'bg-rose-500 shadow-lg' : 'bg-blue-500'}`} style={{ width: `${percent}%` }} />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {adminTab === 'list' && (
                  <div className="space-y-6 text-slate-900">
                    <div className="flex gap-4 text-slate-900 font-sans">
                      <div className="relative flex-1 text-slate-900 font-sans"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" placeholder="학번 또는 이름 검색..." className="w-full p-3 pl-9 bg-slate-50 border rounded-xl text-xs font-bold outline-none font-sans" onChange={e=>setSearchQuery(e.target.value)} /></div>
                      <button onClick={handleExportVoters} className="p-3 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-xs font-black flex items-center gap-2 shadow-sm text-emerald-600 font-sans"><Download size={14}/> 명단 엑셀 다운로드</button>
                    </div>
                    <div className="bg-white border rounded-2xl overflow-hidden max-h-[400px] overflow-y-auto shadow-inner text-slate-900 font-sans text-slate-900">
                      <table className="w-full text-left text-[11px] font-sans text-slate-900">
                        <thead className="bg-slate-50 font-black sticky top-0 text-slate-900 font-sans text-slate-900">
                          <tr><th className="p-4">학번/이름</th><th className="p-4 text-center">코드</th><th className="p-4 text-center">상태</th><th className="p-4 text-center whitespace-nowrap">투표 시간</th><th className="p-4 text-center">관리</th></tr>
                        </thead>
                        <tbody className="divide-y font-sans text-slate-900">
                          {filteredParticipationList.map(([id, data]) => {
                            const voterKey = id + data.name;
                            const voterData = dbVoters[voterKey];
                            const hasVoted = !!voterData;
                            return (
                              <tr key={id} className="hover:bg-slate-50 text-slate-900">
                                <td className="p-4 font-black">{id[0]}-{id[1]}-{id.substring(2)} {data.name}</td>
                                <td className="p-4 text-center font-sans text-blue-600 font-bold">{data.code}</td>
                                <td className="p-4 text-center whitespace-nowrap">
                                  <span className={`px-2 py-1 rounded font-black text-[9px] ${hasVoted ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                    {hasVoted ? '완료' : '미참여'}
                                  </span>
                                </td>
                                <td className="p-4 text-center font-sans text-[10px] text-slate-500 whitespace-nowrap">
                                  {hasVoted && voterData.votedAt ? (
                                    <span className="flex items-center justify-center gap-1 font-sans">
                                      <Clock size={10} className="text-blue-400" />
                                      {new Date(voterData.votedAt).toLocaleString('ko-KR', { hour12: false, month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                    </span>
                                  ) : '-'}
                                </td>
                                <td className="p-4 text-center flex items-center justify-center gap-3">
                                  {hasVoted && <button onClick={()=>setResetConfirm(voterKey)} className="text-amber-500 hover:scale-110 font-sans"><RotateCcw size={14}/></button>}
                                  <button onClick={async ()=>{if(confirm("삭제하시겠습니까?")) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'authVault', id + data.name));}} className="text-rose-500 hover:scale-110 font-sans text-rose-500"><Trash2 size={14}/></button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {adminTab === 'system' && (
                  <div className="space-y-6 text-slate-900 text-slate-900">
                    <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white font-sans text-slate-100">
                      <h4 className="font-black text-lg mb-6 flex items-center gap-2 font-sans text-slate-100"><StopCircle size={20} className="text-rose-500"/> 투표 원격 제어</h4>
                      <div className="flex gap-4">
                        <button onClick={async () => await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'votingControl'), { status: 'ready' })} className={`flex-1 py-5 rounded-3xl font-black transition-all font-sans ${votingState === 'ready' ? 'bg-amber-500 shadow-xl scale-105 text-white' : 'bg-white/10 opacity-50 text-white'}`}>투표 준비</button>
                        <button onClick={async () => await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'votingControl'), { status: 'active' })} className={`flex-1 py-5 rounded-3xl font-black transition-all font-sans ${votingState === 'active' ? 'bg-emerald-500 shadow-xl scale-105 text-white' : 'bg-white/10 opacity-50 text-white'}`}>투표 시작</button>
                        <button onClick={async () => await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'votingControl'), { status: 'finished' })} className={`flex-1 py-5 rounded-3xl font-black transition-all font-sans ${votingState === 'finished' ? 'bg-rose-500 shadow-xl scale-105 text-white' : 'bg-white/10 opacity-50 text-white'}`}>투표 종료</button>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 p-8 rounded-[2.5rem] border border-blue-100 text-slate-900 text-slate-900">
                      <div className="flex justify-between items-start mb-6 text-slate-900 text-slate-900">
                        <div>
                          <h4 className="font-black text-blue-800 text-lg mb-1 flex items-center gap-2 font-sans"><ClipboardCheck size={20}/> 명단 데이터 동기화</h4>
                          <p className="text-xs text-blue-600 font-bold leading-tight font-sans text-slate-600 text-slate-600">코드 속 850명 명단을 서버로 강제 전송합니다.</p>
                        </div>
                        <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl font-black text-xs font-sans text-slate-100">
                          코드 내 감지: {Object.keys(FINAL_AUTH_CODES_MAP).length}명
                        </div>
                      </div>
                      <button onClick={syncAuthVault} disabled={isSyncing} className="w-full py-4 bg-blue-600 text-white rounded-3xl font-black shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform text-slate-100 font-sans">
                        {isSyncing ? <RefreshCw className="animate-spin" /> : <Save />} 서버 명단 갱신 실행
                      </button>
                    </div>

                    <button onClick={() => setShowResetAllModal(true)} className="w-full py-4 bg-rose-50 text-rose-600 border border-rose-200 rounded-3xl font-black text-sm flex items-center justify-center gap-2 hover:bg-rose-100 font-sans text-rose-600"><Trash2 size={16}/> 서버 집계 초기화</button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        <div className="mt-20 pt-10 border-t border-slate-200 text-center text-slate-900 font-sans">
          {!showAdminPanel && (
            <button onClick={() => setShowAdminPanel(true)} className="flex items-center gap-2 mx-auto text-slate-400 hover:text-blue-600 font-bold text-sm transition-colors uppercase tracking-[0.2em] font-sans text-slate-400"><BarChart3 size={16} /> Admin Mode</button>
          )}
        </div>
        <footer className="text-center mt-12 opacity-20 text-[10px] font-black uppercase tracking-[0.4em] font-sans text-slate-900">EMS Terminal V8.1 Final Build</footer>
      </div>
    </div>
  );
}
