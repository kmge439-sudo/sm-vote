import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, doc, setDoc, getDoc, onSnapshot, deleteDoc, writeBatch, getDocs, updateDoc 
} from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { 
  User, CheckCircle, Award, Users, AlertCircle, Lock, BarChart3, RefreshCw, KeyRound, ShieldCheck, X, Search, RotateCcw, Trash2, AlertTriangle, Fingerprint, ChevronRight, ChevronLeft, ShieldAlert, PlayCircle, StopCircle, Timer, Clock, Trophy, Download, UserPlus, UserMinus, UserCog, Edit3, Save, Plus
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
// [보안 데이터] 849명 전교생 명단 및 고유 코드 (압축 텍스트 방식)
// ==========================================
const RAW_STUDENT_DATA = "1101강은재:8241,1102권다은:3192,1103김나윤:5674,1104김미소:1209,1105김보민:9932,1106김서하:4421,1107김소정:6712,1108김수민:2389,1109김수윤:7710,1110김수현:1543,1111김시현:3922,1112김아란:8841,1113김주혜:6620,1114김지민:2104,1115김지현:5539,1116박연서:9012,1117박은서:4328,1118신수빈:7611,1119신유빈:1298,1120양서연:3409,1121윤가은:5110,1122윤예원:6782,1123음채율:2245,1124이서연:9001,1125이서은:1123,1126이정민:4450,1127이채은:8762,1128임서현:3341,1129조온규:6092,1130최다연:1987,1131황다겸:7721,1201금미서:4561,1202김가윤:8920,1203김가은:1104,1204김결이:3452,1205김도연:7781,1206김도현:2234,1207김서율:9019,1208김연우:6654,1209김예림:4321,1210김윤슬:8812,1211박예진:5543,1212박주은:1198,1213박지연:7609,1214배규나:3421,1215서진주:9901,1216성지민:2132,1217신지아:6784,1218안나윤:1201,1219안유빈:8234,1220오주아:4456,1221윤채원:3349,1222이소율:9008,1223이아인:1127,1224이윤서:5671,1225이자은:8765,1226장예율:2381,1227정새봄:4412,1228최민채:6619,1229최소영:8832,1230최수빈:1254,1301강나윤:7741,1302곽은서:3195,1303김나윤:5682,1304김민정:1213,1305박서진:9941,1306박소영:4429,1307박시원:6719,1308방은우:2391,1309배서연:7718,1310변예린:1549,1311손지원:3929,1312손채원:8848,1313안수민:6627,1314우수현:2111,1315윤아진:5545,1316이경서:9019,1317이소윤:4334,1318이소희:7618,1319이아윤:1305,1320이예빈:3416,1321이유정:5117,1322이지민:6789,1323이지유:2252,1324이호정:9008,1325전혜주:1130,1326전효재:4457,1327정세인:8769,1328조하온:3348,1329최예나:6099,1330최지아:1994,1331최지율:7728,1401구나언:4568,1402권예진:8927,1403김결:1111,1404김보경:3459,1405김보애:7788,1406김수빈:2241,1407김연지:9026,1408김예빈:6661,1409김예지:4328,1410김정윤:8819,1411김지오:5550,1412나서영:1205,1413나지영:7616,1414박사랑:3428,1415박서현:9908,1416박성효:2139,1417오윤나:6791,1418유다은:1208,1419이규민:8241,1420이나현:4463,1421이다원:3356,1422이다은:9015,1423이연서:1134,1424이지유:5678,1425이채이:8772,1426장지원:2388,1427전아윤:4419,1428전아현:6626,1429조한별:8839,1430조혜원:1261,1431홍아현:7748,1501강에일린:3202,1502구민채:5689,1503김다연:1220,1504김민영:9948,1505김소현:4436,1506김예지:6726,1507김지우:2398,1508민세하:7725,1509박민서:1556,1510박서윤:3936,1511박솔아:8855,1512서정원:6634,1513손하영:2118,1514안채원:5552,1515양윤지:9026,1516유주연:4341,1517윤현아:7625,1518이민서:1312,1519이서경:3423,1520이서현:5124,1522이은서:6796,1523이채은:2259,1524이채희:9015,1525이현서:1137,1526인세현:4464,1527임주하:8776,1528장서현:3355,1529최서연:6106,1530최현영:2001,1531황채영:7735,1532박하윤:4575,1601김나윤:8934,1602김다정:1118,1603김미우:3466,1604김민정:7795,1605김보경:2248,1606김소윤:9033,1607김유비:6668,1608김윤서:4335,1609김지우:8826,1610김지율:5557,1611김하늘:1212,1612김한희:7623,1613김효원:3435,1614도가윤:9915,1615도연우:2146,1616박소린:6798,1617박유진:1215,1618신다연:8248,1619유세연:4470,1620이규림:3363,1621이나윤:9022,1622이다은:1141,1623이유주:5685,1624이채현:8779,1625이해윤:2395,1626임다현:4426,1627전이레:6633,1628정지민:8846,1629정지후:1268,1631하윤서:7755,1701고소현:3209,1702곽나경:5696,1703구은재:1227,1704권나현:9955,1705김다윤:4443,1706김서연:6733,1707김시은:2405,1708김연아:7732,1709김예은:1563,1710김윤하:3943,1711김은서:8862,1712김주하:6641,1713류이안:2125,1714박수하:5559,1715스미스클로이:9033,1716신재은:4348,1717육예지:7632,1718이서진:1319,1719이솔민:3430,1720이연서:5131,1721이지아:6803,1722이채연:2266,1723이하연:9022,1724장서이:1144,1725정소윤:4471,1726조서현:8783,1727조현서:3362,1728지서연:6113,1729차수진:2008,1730최가온:7742,1731최예진:4582,1801강나겸:8941,1802김가령:1125,1803김나연:3473,1804김민채:7802,1805김서연:2255,1806김서현:9040,1807김시현:6675,1808김예나:4342,1809김정민:8833,1810김지윤:5564,1811김채윤:1219,1812김효담:7630,1813박다은:3442,1815손연주:9922,1816원다경:2153,1817윤나경:6805,1818이다은:1222,1819이도희:8255,1821이채윤:4477,1822장효서:3370,1823정수아:9029,1824정유진:1148,1825채시안:5692,1826최가은:8786,1827최라임:2402,1828최수현:4433,1829최윤채:6640,1830팔리로니스해나루이즈:8853,1831황서율:1275,1832김민서:7762,1901강소윤:3216,1902고나영:5703,1903구나은:1234,1904권나연:9962,1905권율하:4450,1906김다윤:6740,1907김서윤:2412,1908김수하:7739,1909노윤채:1570,1910박가은:3950,1911박나경:8869,1912박서우:6648,1913박시은:2132,1914박지연:5566,1915서아진:9040,1916서예린:4355,1917서현아:7639,1918윤정원:1326,1919이규민:3437,1920이나현:5138,1921이서현:6810,1922이은서:2273,1923이지윤:9029,1924이채연:1151,1925장예원:4478,1926전다현:8790,1927정지유:3369,1928주효주:6120,1929천세은:2015,1930천지민:7749,1931최민서:4589,2101권보윤:8948,2102김민서:1132,2103김세경:3480,2104김소현:7809,2105김연재:2262,2106김예은:9047,2107김주원:6682,2108김주은:4349,2109김지우:8840,2110김채율:5571,2111김태이:1226,2112김하진:7637,2113남연수:3449,2114남유담:9929,2115노하영:2160,2116박세영:6812,2117박소윤:1229,2118박영은:8262,2119서지원:4484,2120서한비:3377,2121송서영:9036,2122신보빈:1155,2123안효신:5699,2124엄선경:8793,2125윤서영:2409,2126윤혜솔:4440,2127이경은:6647,2128이다원:8860,2129이라희:1282,2130이미림:7769,2131이효리:3223,2132정라원:5710,2133정지우:1241,2134차예설:9969,2201공가윤:4457,2202권효주:6747,2203김도연:2419,2204김도이:7746,2205김민재:1577,2206김시원:3957,2207김지민:8876,2208김지우:6655,2209김태희:2139,2210김하린:5573,2211류겸미:9047,2212박건희:4362,2213박규빈:7646,2214박정인:1333,2215신소율:3444,2216신한별:5145,2217안혜림:6817,2218오유림:2280,2219원하라:9036,2220윤수민:1158,2221윤지혜:4485,2222윤채현:8797,2223이나현:3376,2224이수민:6127,2225이지민:2022,2226이효우:7756,2227임연서:4596,2228전소율:8955,2229정연우:1139,2230조진아:3487,2231조채윤:7816,2232천혜원:2269,2233최아랑:9054,2234추민서:6689,2301구해나:4356,2302구해린:8847,2303권서연:5578,2304권세라:1233,2305권희원:7644,2306김나윤:3456,2307김민서:9936,2308김민슬:2167,2309김보현:6819,2310김시원:1236,2311김연아:8269,2312김윤민:4491,2313김지연:3384,2314김지유:9043,2315남건희:1162,2316도효은:5706,2317박서윤:8800,2318박지희:2416,2319빈예진:4447,2320서하진:6654,2321안세민:8867,2322오지윤:1289,2323윤리라:7776,2324이고원:3230,2325이서영:5717,2327이유나:1248,2328이채민:9976,2329이혜민:4464,2330전율:6754,2331주예진:2426,2332차지윤:7753,2333최정연:1584,2334허다현:3964,2401강나현:8883,2402공민주:6662,2403권현아:2146,2404김다인:5580,2405김민서:9054,2406김민주:4369,2407김수연:7653,2408김연서:1340,2409김예나:3451,2410김예원:5152,2411김유나:6824,2412김은유:2287,2413김지우:9043,2414김채현:1165,2415도민슬:4492,2416박서은:8804,2417배수민:3383,2418성지희:6134,2419성혜지:2029,2420안은솔:7763,2421이세령:4603,2422이승연:8962,2423이유나:1146,2424이지영:3494,2425이하율:7823,2426임현서:2276,2427임혜인:9061,2428장채완:6696,2429전아인:4363,2430천율이:8854,2431최지우:5585,2432한예지:1240,2433홍수연:7651,2501강아연:3463,2502곽유진:9943,2503권수빈:2174,2504권효언:6826,2505김가윤:1243,2506김규린:8276,2507김민서:4498,2508김민채:3391,2509김소은:9050,2510김수연:1169,2511김예후:5713,2512문서현:8807,2513박혜린:2423,2514석예지:4454,2515성한별:6661,2516신연우:8874,2517심민정:1296,2518여서현:7783,2519예서영:3237,2520윤가인:5724,2521이담희:1255,2522이서희:9983,2523이세연:4471,2524이예원:6761,2526임하음:2433,2527장윤서:7760,2528정아진:1591,2529정유나:3971,2530정은유:8890,2531정지우:6669,2532조은별:2153,2533주효안:5587,2601권유안:9061,2602김나현:4376,2603김려원:7660,2604김서희:1347,2605김영원:3458,2606김지빈:5159,2607김채민:6831,2608나연우:2294,2609남서연:9050,2610문지원:1172,2611박지성:4499,2612박나연:6796,2613백인경:2468,2614서지우:7795,2615서혜정:1626,2616송주연:4006,3617신효주:8925,3618윤선진:6704,3619윤수아:2188,3620윤진서:5622,3621이선주:9096,3622이수안:4411,3623이지우:7695,3624임주비:1382,3625임하윤:3493,3626전소이:5194,3627전지윤:6866,3628정지민:2329,3629천사론:9085,3630한서윤:1207,3631황혜린:4534,3701강연우:8846,3702곽은빈:3425,3703김가을:6176,3704김란희:2071,3705김영아:7805,3706김채윤:4645,3707김효린:9004,3708박다은:1188,3709박민서:3536,3710박보민:7865,3711박서윤:2318,3712박현서:9103,3713변서현:6738,3714신서영:4398,3715여효이:8896,3716오채원:5627,3717이라은:1282,3718이서연:7693,3719이시원:3505,3720이예은:9985,3721이제아:2216,3722이현진:6868,3723이효주:1285,3724정다민:8318,3725정은희:4540,3726조시연:3433,3727천예현:9092,3728최유리:1211,3729최재원:5755,3730하루아:8849,3731허다령:2465,3801권경민:4496,3802권예린:6703,3803김수혜:8916,3804김윤아:1338,3805김지인:7825,3806김한결:3279,3807박채원:5766,3808배해인:1297,3809서지우:1025,3810양예지:4513,3811이나경:6803,3812이다인:2475,3813이세은:7802,3814이승은:1633,3815이지윤:4013,3816이채은:8932,3817이효원:6711,3818임소현:2195,3819전민지:5629,3820정민주:9103,3821조다혜:4418,3822지수현:7702,3823차승연:1389,3824천원정:3500,3825최아영:5201,3826최유나:6873,3827최윤화:2336,3828하민서:9092,3829홍승아:1214,3830황수현:4541,3901권윤솔:8853,3902김미담:3432,3903김민지:6183,3904김민채:2078,3905김수아:7812,3906김유진:4652,3907김정현:9011,3908김지아:1195,3909남민지:3543,3910박선우:7872,3911박지현:2325,3912백민주:9110,3913빈다은:6745,3914손주연:4405,3915손현재:8903,3916신그린:5634,3917오은채:1289,3918윤소원:7700,3919이가윤:3512,3920이시윤:9992,3921이은교:2223,3922이채윤:6875,3923이한비:1292,3924전하늘:8325,3925정여원:4547,3926조민영:3440,3927지예안:9099,3928최은교:1218,3929허윤서:5762,3930황서영:8856";

// 실시간 파싱 함수
const parseStudentVault = () => {
  const map = {};
  RAW_STUDENT_DATA.split(',').forEach(item => {
    const [key, code] = item.split(':');
    if (key && code) map[key] = code;
  });
  return map;
};

const INITIAL_CANDIDATES = {
  president: [
    { id: 1, name: '황수현', slogan: '3학년 8반의 열정으로 학교를 빛내겠습니다!' },
    { id: 2, name: '김병진', slogan: '3학년 6반의 리더십, 신명의 변화를 약속합니다.' },
    { id: 3, name: '김재수', slogan: '3학년 7반의 성실함으로 모두가 행복한 학교!' },
    { id: 4, name: '박재두', slogan: '3학년 9반의 패기, 소통하는 회장이 되겠습니다.' },
    { id: 5, name: '손희동', slogan: '3학년 7반의 진심, 발로 뛰는 일꾼이 되겠습니다.' },
    { id: 6, name: '김민혜', slogan: '3학년 4반의 따뜻함, 학생들의 목소리를 듣겠습니다.' }
  ],
  vp1: [{ id: 101, name: '후보1', slogan: '1학년 슬로건' }],
  vp2: [{ id: 201, name: '후보A', slogan: '2학년 슬로건' }],
  vp3: [{ id: 301, name: '후보X', slogan: '3학년 슬로건' }]
};

export default function App() {
  const [user, setUser] = useState(null);
  const [votingState, setVotingState] = useState('ready');
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState({ grade: '', class: '', number: '', name: '', authCode: '' });
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  
  const [dbCandidates, setDbCandidates] = useState(null);
  const [selectedPres, setSelectedPres] = useState(null);
  const [selectedVP1, setSelectedVP1] = useState(null);
  const [selectedVP2, setSelectedVP2] = useState(null);
  const [selectedVP3, setSelectedVP3] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminAuthForm, setAdminAuthForm] = useState({ id: '', pw: '' });
  const [adminAuthError, setAdminAuthError] = useState('');
  const [adminTab, setAdminTab] = useState('stats');
  const [dbVotes, setDbVotes] = useState([]);
  const [dbVoters, setDbVoters] = useState({});
  const [dbStudents, setDbStudents] = useState([]);
  const [isResettingAll, setIsResettingAll] = useState(false);
  const [showResetAllModal, setShowResetAllModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterGrade, setFilterGrade] = useState('all');
  const [newStudent, setNewStudent] = useState({ grade: '', class: '', number: '', name: '', code: '' });

  // 개발자 도구 방어
  useEffect(() => {
    const block = (e) => e.preventDefault();
    const handleKeys = (e) => {
      if (e.keyCode === 123 || (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) || (e.ctrlKey && e.keyCode === 85)) e.preventDefault();
    };
    window.addEventListener('contextmenu', block);
    window.addEventListener('keydown', handleKeys);
    return () => { window.removeEventListener('contextmenu', block); window.removeEventListener('keydown', handleKeys); };
  }, []);

  useEffect(() => {
    const init = async () => { try { await signInAnonymously(auth); } catch (e) { } };
    init();
    const unsubAuth = onAuthStateChanged(auth, setUser);
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!user) return;
    onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'votingControl'), (snap) => {
      if (snap.exists()) setVotingState(snap.data().status || 'ready');
    });
    onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'candidates'), (snap) => {
      if (snap.exists()) setDbCandidates(snap.data());
      else setDbCandidates(INITIAL_CANDIDATES);
    });
  }, [user]);

  useEffect(() => {
    if (!user || !isAdminAuthenticated) return;
    const unsubVotes = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'votes'), (snap) => {
      setDbVotes(snap.docs.map(d => d.data()));
    });
    const unsubVoters = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'voters'), (snap) => {
      const map = {};
      snap.docs.forEach(d => { map[d.id] = d.data(); });
      setDbVoters(map);
    });
    const unsubVault = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'authVault'), (snap) => {
      setDbStudents(snap.docs.map(d => ({ key: d.id, ...d.data() })));
    });
    return () => { unsubVotes(); unsubVoters(); unsubVault(); };
  }, [user, isAdminAuthenticated]);

  const verifyStudent = async () => {
    if (votingState !== 'active') return false;
    setIsVerifying(true);
    const { grade, class: cls, number, name, authCode } = userData;
    const key = `${grade}${cls}${number.toString().padStart(2, '0')}${name}`;
    try {
      const vaultDoc = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'authVault', key));
      if (!vaultDoc.exists()) { setError('명단에 없는 학생입니다.'); setIsVerifying(false); return false; }
      if (vaultDoc.data().code !== authCode.trim()) { setError('인증 코드가 틀렸습니다.'); setIsVerifying(false); return false; }
      const voterDoc = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'voters', key));
      if (voterDoc.exists()) { setError('이미 투표를 완료했습니다.'); setIsVerifying(false); return false; }
      setError(''); setIsVerifying(false); return true;
    } catch (e) { setError('서버 연결 오류'); setIsVerifying(false); return false; }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    const adminRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'adminAccount');
    const adminSnap = await getDoc(adminRef);
    if (!adminSnap.exists()) {
      if (adminAuthForm.id === 'kmge439' && adminAuthForm.pw === 'dkssud2323!') {
        setIsAdminAuthenticated(true);
        await setDoc(adminRef, { id: 'kmge439', pw: 'dkssud2323!' });
      } else { setAdminAuthError('인증 실패'); }
      return;
    }
    const { id, pw } = adminSnap.data();
    if (adminAuthForm.id === id && adminAuthForm.pw === pw) { setIsAdminAuthenticated(true); setAdminAuthError(''); }
    else { setAdminAuthError('계정 정보가 일치하지 않습니다.'); }
  };

  const syncAllData = async () => {
    if (!confirm("전교생 849명 명단을 DB로 전송하시겠습니까?")) return;
    setIsSyncing(true);
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'candidates'), INITIAL_CANDIDATES);
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'adminAccount'), { id: 'kmge439', pw: 'dkssud2323!' });
      
      const vaultMap = parseStudentVault();
      const entries = Object.entries(vaultMap);
      
      // Batch 처리 (Firestore 1회 한도 500개 주의)
      for (let i = 0; i < entries.length; i += 400) {
        const batch = writeBatch(db);
        const chunk = entries.slice(i, i + 400);
        chunk.forEach(([key, code]) => {
          batch.set(doc(db, 'artifacts', appId, 'public', 'data', 'authVault', key), { code });
        });
        await batch.commit();
      }
      
      alert("849명 명단 DB 이관 완료!");
    } catch (e) { alert("오류: " + e.message); }
    finally { setIsSyncing(false); }
  };

  const deleteStudent = async (studentKey) => {
    if (!confirm(`${studentKey} 학생의 모든 데이터를 삭제하시겠습니까?`)) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'authVault', studentKey));
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'voters', studentKey));
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'votes', studentKey));
    } catch (e) { alert("삭제 실패"); }
  };

  const handleSubmit = async () => {
    if (!user || votingState !== 'active') return;
    const { grade, class: cls, number, name } = userData;
    const userKey = `${grade}${cls}${number.toString().padStart(2, '0')}${name}`;
    const now = new Date().toISOString();
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'votes', userKey), {
        presidentId: selectedPres.id, vp1Id: selectedVP1.id, vp2Id: selectedVP2.id, vp3Id: selectedVP3.id, timestamp: now
      });
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'voters', userKey), { voted: true, votedAt: now });
      setIsSubmitted(true);
    } catch (err) { setError('제출 실패'); }
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

  const filteredStudentsList = useMemo(() => {
    return dbStudents.filter(s => {
      const matchGrade = filterGrade === 'all' || s.key.startsWith(filterGrade);
      const matchSearch = s.key.includes(searchQuery);
      return matchGrade && matchSearch;
    }).sort((a,b) => a.key.localeCompare(b.key));
  }, [dbStudents, filterGrade, searchQuery]);

  const handleExportResults = () => {
    const rows = [["부문", "후보", "득표"]];
    if (!dbCandidates) return;
    ['president', 'vp1', 'vp2', 'vp3'].forEach(cat => {
      const key = cat === 'president' ? 'pres' : cat;
      dbCandidates[cat].forEach(p => rows.push([cat, p.name, stats[key][p.id] || 0]));
    });
    downloadCSV(rows, "투표집계");
  };

  const handleExportVoters = () => {
    const rows = [["학번이름", "상태", "투표시간"]];
    dbStudents.forEach(s => {
      const v = dbVoters[s.key];
      const timeStr = v?.votedAt ? new Date(v.votedAt).toLocaleString('ko-KR') : "-";
      rows.push([s.key, v ? "완료" : "미참여", timeStr]);
    });
    downloadCSV(rows, "명단현황");
  };

  const downloadCSV = (data, name) => {
    const BOM = '\uFEFF';
    const csv = BOM + data.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${name}_${new Date().toLocaleDateString()}.csv`;
    link.click();
  };

  if (isSubmitted) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 text-center border border-slate-100 text-slate-900">
        <CheckCircle size={80} className="text-emerald-500 mx-auto mb-6" />
        <h2 className="text-3xl font-black mb-4 tracking-tight">투표 완료</h2>
        <p className="text-slate-600 mb-8 font-medium">참여해 주셔서 감사합니다.</p>
        <button onClick={() => window.location.reload()} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black">닫기</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4 font-sans text-slate-900 selection:bg-blue-100 select-none">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full mb-4 uppercase tracking-widest shadow-lg">
            <Lock size={12} /> SECURED SYSTEM V6.2
          </div>
          <h1 className="text-4xl font-black mb-2 tracking-tighter">2026학년도 신명여자중학교 전교 회장단 선거</h1>
        </div>

        {!showAdminPanel ? (
          <div className="max-w-2xl mx-auto">
            {step === 1 && (
              <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-100 animate-in slide-in-from-bottom-4 duration-500 text-slate-900">
                {votingState === 'active' ? (
                  <>
                    <div className="flex items-center gap-4 mb-10 text-slate-900">
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shadow-inner"><Fingerprint size={28} strokeWidth={2.5} /></div>
                      <h2 className="text-2xl font-black">본인 확인 및 인증</h2>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-4 text-slate-900">
                      <select value={userData.grade} onChange={(e) => setUserData({...userData, grade: e.target.value})} className="p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-center outline-none">
                        <option value="">학년</option><option value="1">1</option><option value="2">2</option><option value="3">3</option>
                      </select>
                      <input type="number" placeholder="반" value={userData.class} onChange={(e) => setUserData({...userData, class: e.target.value})} className="p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-center outline-none text-slate-900" />
                      <input type="number" placeholder="번" value={userData.number} onChange={(e) => setUserData({...userData, number: e.target.value})} className="p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-center outline-none text-slate-900" />
                    </div>
                    <input type="text" placeholder="이름" value={userData.name} onChange={(e) => setUserData({...userData, name: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-xl px-8 mb-4 outline-none focus:border-blue-500 text-slate-900" />
                    <div className="relative mb-6">
                      <KeyRound className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-400" size={20} />
                      <input type="text" placeholder="인증 코드 입력" value={userData.authCode} onChange={(e) => setUserData({...userData, authCode: e.target.value})} className="w-full p-5 pl-16 bg-blue-50 border-2 border-blue-100 rounded-2xl font-black text-xl outline-none focus:border-blue-500 text-slate-900" />
                    </div>
                    {error && <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 mb-6 flex items-center gap-2 text-sm font-black animate-in shake"><AlertCircle size={18} />{error}</div>}
                    <button disabled={!userData.grade || !userData.class || !userData.number || !userData.name || !userData.authCode || isVerifying} onClick={async () => { if(await verifyStudent()) setStep(2); }} className="w-full py-6 bg-blue-600 text-white rounded-3xl font-black text-xl shadow-xl active:scale-95 transition-all">
                      {isVerifying ? <RefreshCw className="animate-spin mx-auto" /> : '인증 확인 및 시작'}
                    </button>
                  </>
                ) : (
                  <div className="text-center py-10">
                    {votingState === 'ready' ? (
                      <><Timer size={64} className="mx-auto text-amber-500 mb-6" /><h2 className="text-2xl font-black mb-4 text-slate-900">투표 준비 중</h2><p className="text-slate-500 font-bold">아직 선거 시작 전입니다.</p></>
                    ) : (
                      <><StopCircle size={64} className="mx-auto text-rose-500 mb-6" /><h2 className="text-2xl font-black mb-4 text-slate-900">투표 종료</h2><p className="text-slate-500 font-bold">선거 투표가 마감되었습니다.</p></>
                    )}
                  </div>
                )}
              </div>
            )}

            {[2, 3, 4, 5].includes(step) && dbCandidates && (
              <div className="animate-in slide-in-from-right-8 duration-500 text-slate-900">
                <div className="flex justify-between items-end mb-8">
                  <h2 className="text-2xl font-black flex items-center gap-3">
                    {step === 2 && <><Award className="text-amber-500" /> 전교회장 투표</>}
                    {step === 3 && <><Users className="text-blue-500" /> 1학년 부회장 투표</>}
                    {step === 4 && <><Users className="text-indigo-500" /> 2학년 부회장 투표</>}
                    {step === 5 && <><Users className="text-purple-500" /> 3학년 부회장 투표</>}
                  </h2>
                  <span className="text-xs font-black text-slate-400 font-sans tracking-widest uppercase">Step {step-1}/4</span>
                </div>
                <div className="grid gap-4">
                  {dbCandidates[step === 2 ? 'president' : `vp${step-2}`].map(c => {
                    const isSelected = (step===2 && selectedPres?.id===c.id) || (step===3 && selectedVP1?.id===c.id) || (step===4 && selectedVP2?.id===c.id) || (step===5 && selectedVP3?.id===c.id);
                    return (
                      <div key={c.id} onClick={() => {
                        if(step===2) setSelectedPres(c); if(step===3) setSelectedVP1(c); if(step===4) setSelectedVP2(c); if(step===5) setSelectedVP3(c);
                      }} className={`p-6 bg-white rounded-2xl border-4 cursor-pointer transition-all flex justify-between items-center ${isSelected ? 'border-blue-600 bg-blue-50 shadow-lg scale-[1.01]' : 'border-white hover:border-slate-100'}`}>
                        <div>
                          <span className="text-[10px] font-black bg-slate-100 px-3 py-1 rounded-lg uppercase tracking-wider text-slate-900">기호 {c.id % 100}번</span>
                          <h3 className="text-xl font-black mt-2 text-slate-900">{c.name}</h3>
                          <p className="text-slate-500 font-bold text-sm italic">"{c.slogan}"</p>
                        </div>
                        <CheckCircle size={28} className={isSelected ? 'text-blue-600' : 'text-slate-100'} />
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-4 mt-10 text-slate-900">
                  <button onClick={() => setStep(step - 1)} className="flex-1 py-4 bg-white border border-slate-200 rounded-2xl font-black flex items-center justify-center gap-2"><ChevronLeft size={18}/>이전</button>
                  <button disabled={(step===2 && !selectedPres) || (step===3 && !selectedVP1) || (step===4 && !selectedVP2) || (step===5 && !selectedVP3)} onClick={() => setStep(step+1)} className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2">다음 단계 <ChevronRight size={18}/></button>
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="bg-white rounded-[3rem] shadow-2xl p-10 border border-slate-100 animate-in zoom-in duration-500 text-slate-900">
                <h2 className="text-2xl font-black text-center mb-6 uppercase">최종 투표 내용 확인</h2>
                <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 mb-8 flex items-start gap-3 text-slate-900">
                  <ShieldCheck size={24} className="text-blue-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-blue-900 font-bold leading-relaxed">본 투표는 <span className="underline decoration-2">비밀 투표</span>로 진행됩니다. 제출 후에는 그 누구도 투표 내용을 확인할 수 없으니 안심하고 제출해 주세요.</p>
                </div>
                <div className="space-y-4 mb-10 text-slate-900">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 font-black text-center text-lg">{userData.grade}학년 {userData.class}반 {userData.number}번 {userData.name}</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 bg-amber-50 rounded-2xl font-black text-slate-900"><p className="text-[10px] text-amber-600 mb-1 uppercase tracking-widest font-black">전교회장</p>{selectedPres?.name}</div>
                    <div className="p-5 bg-blue-50 rounded-2xl font-black text-slate-900"><p className="text-[10px] text-blue-600 mb-1 uppercase tracking-widest font-black">1학년 부회장</p>{selectedVP1?.name}</div>
                    <div className="p-5 bg-indigo-50 rounded-2xl font-black text-slate-900"><p className="text-[10px] text-indigo-600 mb-1 uppercase tracking-widest font-black">2학년 부회장</p>{selectedVP2?.name}</div>
                    <div className="p-5 bg-purple-50 rounded-2xl font-black text-slate-900"><p className="text-[10px] text-purple-600 mb-1 uppercase tracking-widest font-black">3학년 부회장</p>{selectedVP3?.name}</div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setStep(5)} className="flex-1 py-5 bg-slate-100 rounded-2xl font-black text-slate-900">수정</button>
                  <button onClick={handleSubmit} className="flex-[2] py-5 bg-emerald-600 text-white rounded-2xl font-black text-xl shadow-xl hover:bg-emerald-700 active:scale-95 transition-all">최종 제출</button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* --- 관리자 패널 --- */
          <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
            {!!(resetConfirm || showResetAllModal) && (
              <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 text-center text-slate-900">
                <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in text-slate-900">
                  <div className={`w-16 h-16 ${resetConfirm ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    {resetConfirm ? <RotateCcw size={32} /> : <AlertTriangle size={32} />}
                  </div>
                  <h4 className="text-xl font-black mb-2 text-slate-900">{resetConfirm ? '개별 리셋' : '전체 초기화'}</h4>
                  <p className="text-sm text-slate-500 font-bold mb-6 text-slate-900">{resetConfirm ? '데이터를 삭제하시겠습니까?' : '주의! 모든 투표 결과가 삭제됩니다.'}</p>
                  <div className="flex gap-3 text-slate-900 font-sans">
                    <button onClick={() => {setResetConfirm(null); setShowResetAllModal(false);}} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold">취소</button>
                    <button onClick={resetConfirm ? () => handleResetVoter(resetConfirm) : handleResetAllVotes} className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-bold shadow-lg">진행</button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-slate-900 p-8 text-white flex justify-between items-center font-sans">
              <h3 className="text-xl font-black flex items-center gap-3"><ShieldCheck className="text-emerald-400" /> 관리 대시보드</h3>
              <button onClick={() => {setShowAdminPanel(false); setIsAdminAuthenticated(false);}} className="p-2 bg-white/10 rounded-full"><X size={18}/></button>
            </div>

            {!isAdminAuthenticated ? (
              <form onSubmit={handleAdminLogin} className="p-10 space-y-4">
                <input type="text" placeholder="Admin ID" value={adminAuthForm.id} onChange={(e)=>setAdminAuthForm({...adminAuthForm, id: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none text-slate-900" />
                <input type="password" placeholder="Password" value={adminAuthForm.pw} onChange={(e)=>setAdminAuthForm({...adminAuthForm, pw: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none text-slate-900" />
                {adminAuthError && <p className="text-xs text-rose-500 font-black">{adminAuthError}</p>}
                <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black">로그인</button>
              </form>
            ) : (
              <div className="p-8 space-y-8 animate-in fade-in duration-500">
                <div className="flex bg-slate-100 p-1.5 rounded-2xl overflow-x-auto text-slate-900 font-sans">
                  <button onClick={()=>setAdminTab('stats')} className={`flex-1 py-3 px-4 rounded-xl font-black text-xs whitespace-nowrap ${adminTab === 'stats' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>집계 현황</button>
                  <button onClick={()=>setAdminTab('students')} className={`flex-1 py-3 px-4 rounded-xl font-black text-xs whitespace-nowrap ${adminTab === 'students' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>명단 관리</button>
                  <button onClick={()=>setAdminTab('candidates')} className={`flex-1 py-3 px-4 rounded-xl font-black text-xs whitespace-nowrap ${adminTab === 'candidates' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>후보 관리</button>
                  <button onClick={()=>setAdminTab('system')} className={`flex-1 py-3 px-4 rounded-xl font-black text-xs whitespace-nowrap ${adminTab === 'system' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>시스템 설정</button>
                </div>

                {adminTab === 'stats' && (
                  <div className="space-y-10">
                    <div className="flex justify-between items-center gap-4">
                      <p className="font-black text-sm text-slate-900">전체 투표율: <span className="text-blue-600 text-xl font-sans">{((stats.total / dbStudents.length) * 100).toFixed(1)}%</span> ({stats.total}/{dbStudents.length}명)</p>
                      <button onClick={handleExportResults} className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-black flex items-center gap-2 shadow-sm"><Download size={14}/> 엑셀</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 text-slate-900">
                      {['pres', 'vp1', 'vp2', 'vp3'].map((key) => {
                        const catKey = key === 'pres' ? 'president' : key;
                        const candidatesList = dbCandidates ? dbCandidates[catKey] : [];
                        const currentMax = candidatesList.length > 0 ? Math.max(...candidatesList.map(p => stats[key][p.id] || 0)) : 0;
                        return (
                          <div key={key} className="space-y-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">{key==='pres' ? '전교회장' : key==='vp1' ? '1학년 부회장' : key==='vp2' ? '2학년 부회장' : '3학년 부회장'}</p>
                            {candidatesList.map(p => {
                              const count = stats[key][p.id] || 0;
                              const percent = stats.total > 0 ? (count / stats.total) * 100 : 0;
                              const isTop = count > 0 && count === currentMax;
                              return (
                                <div key={p.id} className="space-y-1.5">
                                  <div className="flex justify-between text-xs font-black text-slate-700">
                                    <span className="flex items-center gap-1">{isTop && <Trophy size={12} className="text-amber-500" />}{p.name}</span>
                                    <span className={isTop ? 'text-rose-600' : ''}>{count}표</span>
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

                {adminTab === 'students' && (
                  <div className="space-y-6 text-slate-900">
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-slate-900">
                      <h4 className="font-black text-sm mb-4 flex items-center gap-2 text-slate-900"><UserPlus size={18}/> 신규 학생 등록</h4>
                      <div className="grid grid-cols-5 gap-2 text-slate-900">
                        <input placeholder="학년" className="p-3 border rounded-xl text-xs font-bold" value={newStudent.grade} onChange={e=>setNewStudent({...newStudent, grade: e.target.value})} />
                        <input placeholder="반" className="p-3 border rounded-xl text-xs font-bold" value={newStudent.class} onChange={e=>setNewStudent({...newStudent, class: e.target.value})} />
                        <input placeholder="번" className="p-3 border rounded-xl text-xs font-bold" value={newStudent.number} onChange={e=>setNewStudent({...newStudent, number: e.target.value})} />
                        <input placeholder="이름" className="p-3 border rounded-xl text-xs font-bold" value={newStudent.name} onChange={e=>setNewStudent({...newStudent, name: e.target.value})} />
                        <input placeholder="코드" className="p-3 border rounded-xl text-xs font-bold font-sans" value={newStudent.code} onChange={e=>setNewStudent({...newStudent, code: e.target.value})} />
                      </div>
                      <button onClick={async () => {
                        const { grade, class: cls, number, name, code } = newStudent;
                        if (!grade || !name || !code) return alert("필수 정보를 입력하세요.");
                        const key = `${grade}${cls}${number.padStart(2, '0')}${name}`;
                        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'authVault', key), { code });
                        setNewStudent({ grade: '', class: '', number: '', name: '', code: '' });
                      }} className="w-full mt-4 py-3 bg-blue-600 text-white rounded-xl font-black text-xs">명단 추가하기</button>
                    </div>

                    <div className="flex gap-4 text-slate-900">
                      <div className="relative flex-1 text-slate-900"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input placeholder="학번 또는 이름 검색..." className="w-full p-3 pl-9 bg-slate-50 border rounded-xl text-xs font-bold outline-none text-slate-900" onChange={e=>setSearchQuery(e.target.value)} /></div>
                      <button onClick={handleExportVoters} className="p-3 bg-emerald-50 text-emerald-600 rounded-xl font-black text-xs flex items-center gap-2 shadow-sm"><Download size={14}/> 명단 엑셀</button>
                    </div>

                    <div className="bg-white border rounded-2xl overflow-hidden max-h-[400px] overflow-y-auto text-slate-900 shadow-inner">
                      <table className="w-full text-left text-[11px] text-slate-900">
                        <thead className="bg-slate-50 font-black sticky top-0 text-slate-900">
                          <tr>
                            <th className="p-4">학번/이름</th>
                            <th className="p-4 text-center">코드</th>
                            <th className="p-4 text-center">상태</th>
                            <th className="p-4 text-center whitespace-nowrap">투표 시간</th>
                            <th className="p-4 text-center font-sans">관리</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y text-slate-900">
                          {filteredStudentsList.map(s => {
                            const voterData = dbVoters[s.key];
                            return (
                              <tr key={s.key} className="hover:bg-slate-50 text-slate-900">
                                <td className="p-4 font-black">{s.key}</td>
                                <td className="p-4 text-center font-sans text-blue-600 font-bold">{s.code}</td>
                                <td className="p-4 text-center">
                                  <span className={`px-2 py-1 rounded font-black text-[9px] ${voterData ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                    {voterData ? '완료' : '미참여'}
                                  </span>
                                </td>
                                <td className="p-4 text-center font-sans font-bold text-slate-500 whitespace-nowrap">
                                  {voterData?.votedAt ? (
                                    <span className="flex items-center justify-center gap-1 text-slate-900">
                                      <Clock size={10} className="text-blue-400" />
                                      {new Date(voterData.votedAt).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                                    </span>
                                  ) : '-'}
                                </td>
                                <td className="p-4 text-center flex items-center justify-center gap-3">
                                  {voterData && <button onClick={()=>setResetConfirm(s.key)} className="text-amber-500 hover:scale-110 transition-transform"><RotateCcw size={14}/></button>}
                                  <button onClick={()=>deleteStudent(s.key)} className="text-rose-500 hover:scale-110 transition-transform"><Trash2 size={14}/></button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Tab: 후보 관리 */}
                {adminTab === 'candidates' && !!dbCandidates && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-900">
                    {['president', 'vp1', 'vp2', 'vp3'].map(cat => (
                      <div key={cat} className="bg-slate-50 p-6 rounded-3xl border text-slate-900">
                        <h4 className="font-black text-sm mb-4 flex items-center gap-2 text-slate-600"><Award size={16}/> {cat === 'president' ? '전교회장' : cat === 'vp1' ? '1학년 부회장' : cat === 'vp2' ? '2학년 부회장' : '3학년 부회장'}</h4>
                        <div className="space-y-4">
                          {dbCandidates[cat].map((c, i) => (
                            <div key={c.id} className="bg-white p-4 rounded-xl shadow-sm space-y-2 border text-slate-900">
                              <input className="w-full font-black text-sm bg-transparent outline-none border-b focus:border-blue-500 text-slate-900" value={c.name} onChange={async (e)=>{
                                const updated = { ...dbCandidates }; updated[cat][i].name = e.target.value;
                                await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'candidates'), updated);
                              }} placeholder="이름" />
                              <input className="w-full text-xs font-bold text-slate-500 bg-transparent outline-none text-slate-900 font-sans" value={c.slogan} onChange={async (e)=>{
                                const updated = { ...dbCandidates }; updated[cat][i].slogan = e.target.value;
                                await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'candidates'), updated);
                              }} placeholder="슬로건" />
                            </div>
                          ))}
                          <button onClick={async () => {
                            const updated = { ...dbCandidates };
                            updated[cat].push({ id: Date.now(), name: '새 후보', slogan: '슬로건 입력' });
                            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'candidates'), updated);
                          }} className="w-full py-2 border-2 border-dashed rounded-xl text-slate-400 font-black text-[10px] hover:bg-slate-100 font-sans">+ 추가</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tab: 시스템 설정 */}
                {adminTab === 'system' && (
                  <div className="space-y-6 text-slate-900">
                    <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white">
                      <h4 className="font-black text-lg mb-6 flex items-center gap-2"><StopCircle className="text-rose-500"/> 투표 원격 제어</h4>
                      <div className="flex gap-4">
                        <button onClick={async () => await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'votingControl'), { status: 'ready' })} className={`flex-1 py-5 rounded-3xl font-black transition-all ${votingState === 'ready' ? 'bg-amber-500 shadow-xl scale-105' : 'bg-white/10 opacity-50'}`}>투표 준비</button>
                        <button onClick={async () => await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'votingControl'), { status: 'active' })} className={`flex-1 py-5 rounded-3xl font-black transition-all ${votingState === 'active' ? 'bg-emerald-500 shadow-xl scale-105' : 'bg-white/10 opacity-50'}`}>투표 시작</button>
                        <button onClick={async () => await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'votingControl'), { status: 'finished' })} className={`flex-1 py-5 rounded-3xl font-black transition-all ${votingState === 'finished' ? 'bg-rose-500 shadow-xl scale-105' : 'bg-white/10 opacity-50'}`}>투표 종료</button>
                      </div>
                    </div>
                    <div className="bg-amber-50 p-8 rounded-[2.5rem] border border-amber-100">
                      <h4 className="font-black text-amber-800 mb-2">⚠ 849명 명단 데이터 강제 동기화</h4>
                      <p className="text-xs text-amber-700 font-bold mb-6 leading-tight">코드 내의 전체 명단을 DB 서버로 전송합니다. 초기 1회 실행하세요.</p>
                      <button onClick={syncAllData} disabled={isSyncing} className="w-full py-4 bg-amber-600 text-white rounded-3xl font-black shadow-lg flex items-center justify-center gap-2 font-sans">
                        {isSyncing ? <RefreshCw className="animate-spin" /> : <Save />} 명단 DB 이관 실행
                      </button>
                    </div>
                    <button onClick={() => setShowResetAllModal(true)} className="w-full py-4 bg-rose-50 text-rose-600 border border-rose-200 rounded-3xl font-black text-sm flex items-center justify-center gap-2 text-rose-600 font-sans"><Trash2 size={16}/> 전체 투표 데이터 초기화</button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        <div className="mt-20 pt-10 border-t border-slate-200 text-center text-slate-900 font-sans">
          {!showAdminPanel && (
            <button onClick={() => setShowAdminPanel(true)} className="flex items-center gap-2 mx-auto text-slate-400 hover:text-blue-600 font-bold text-sm transition-colors uppercase tracking-[0.2em]"><BarChart3 size={16} /> Admin Mode</button>
          )}
        </div>
        <footer className="text-center mt-12 opacity-20 text-[10px] font-black uppercase tracking-[0.4em] font-sans text-slate-900">EMS Terminal V6.2 Master Build</footer>
      </div>
    </div>
  );
}
