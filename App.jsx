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
  User, CheckCircle, Award, Users, AlertCircle, Lock, BarChart3, RefreshCw, KeyRound, ShieldCheck, X, Search, RotateCcw, Trash2, AlertTriangle
} from 'lucide-react';

// --- [유지] 사용자님의 실제 Firebase 최신 설정값 적용 ---
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

export default function App() {
  // --- 상태 관리 ---
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState({ grade: '', class: '', number: '', name: '' });
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

  // 1. 학생 명단 데이터 (정제됨)
  const rawStudentData = "1101강은재1102권다은1103김나윤1104김미소1105김보민1106김서하1107김소정1108김수민1109김수윤1110김수현1111김시현1112김아란1113김주혜1114김지민1115김지현1116박연서1117박은서1118신수빈1119신유빈1120양서연1121윤가은1122윤예원1123음채율1124이서연1125이서은1126이정민1127이채은1128임서현1129조온규1130최다연1131황다겸1201금미서1202김가윤1203김가은1204김결이1205김도연1206김도현1207김서율1208김연우1209김예림1210김윤슬1211박예진1212박주은1213박지연1214배규나1215서진주1216성지민1217신지아1218안나윤1219안유빈1220오주아1221윤채원1222이소율1223이아인1224이윤서1225이자은1226장예율1227정새봄1228최민채1229최소영1230최수빈1301강나윤1302곽은서1303김나윤1304김민정1305박서진1306박소영1307박시원1308방은우1309배서연1310변예린1311손지원1312손채원1313안수민1314우수현1315윤아진1316이경서1317이소윤1318이소희1319이아윤1320이예빈1321이유정1322이지민1323이지유1324이호정1325전혜주1326전효재1327정세인1328조하온1329최예나1330최지아1331최지율1401구나언1402권예진1403김결1404김보경1405김보애1406김수빈1407김연지1408김예빈1409김예지1410김정윤1411김지오1412나서영1413나지영1414박사랑1415박서현1416박성효1417오윤나1418유다은1419이규민1420이나현1421이다원1422이다은1423이연서1424이지유1425이채이1426장지원1427전아윤1428전아현1429조한별1430조혜원1431홍아현1501강에일린1502구민채1503김다연1504김민영1505김소현1506김예지1507김지우1508민세하1509박민서1510박서윤1511박솔아1512서정원1513손하영1514안채원1515양윤지1516유주연1517윤현아1518이민서1519이서경1520이서현1522이은서1523이채은1524이채희1525이현서1526인세현1527임주하1528장서현1529최서연1530최현영1531황채영1532박하윤1601김나윤1602김다정1603김미우1604김민정1605김보경1606김소윤1607김유비1608김윤서1609김지우1610김지율1611김하늘1612김한희1613김효원1614도가윤1615도연우1616박소린1617박유진1618신다연1619유세연1620이규림1621이나윤1622이다은1623이유주1624이채현1625이해윤1626임다현1627전이레1628정지민1629정지후1631하윤서1701고소현1702곽나경1703구은재1704권나현1705김다윤1706김서연1707김시은1708김연아1709김예은1710김윤하1711김은서1712김주하1713류이안1714박수하1715스미스클로이1716신재은1717육예지1718이서진1719이솔민1720이연서1721이지아1722이채연1723이하연1724장서이1725정소윤1726조서현1727조현서1728지서연1729차수진1730최가온1731최예진1801강나겸1802김가령1803김나연1804김민채1805김서연1806김서현1807김시현1808김예나1809김정민1810김지윤1811김채윤1812김효담1813박다은1815손연주1816원다경1817윤나경1818이다은1819이도희1821이채윤1822장효서1823정수아1824정유진1825채시안1826최가은1827최라임1828최수현1829최윤채1830팔리로니스해나루이즈1831황서율1832김민서1901강소윤1902고나영1903구나은1904권나연1905권율하1906김다윤1907김서윤1908김수하1909노윤채1910박가은1911박나경1912박서우1913박시은1914박지연1915서아진1916서예린1917서현아1918윤정원1919이규민1920이나현1921이서현1922이은서1923이지윤1924이채연1925장예원1926전다현1927정지유1928주효주1929천세은1930천지민1931최민서2101권보윤2102김민서2103김세경2104김소현2105김연재2106김예은2107김주원2108김주은2109김지우2110김채율2111김태이2112김하진2113남연수2114남유담2115노하영2116박세영2117박소윤2118박영은2119서지원2120서한비2121송서영2122신보빈2123안효신2124엄선경2125윤서영2126윤혜솔2127이경은2128이다원2129이라희2130이미림2131이효리2132정라원2133정지우2134차예설2201공가윤2202권효주2203김도연2204김도이2205김민재2206김시원2207김지민2208김지우2209김태희2210김하린2211류겸미2212박건희2213박규빈2214박정인2215신소율2216신한별2217안혜림2218오유림2219원하라2220윤수민2221윤지혜2222윤채현2223이나현2224이수민2225이지민2226이효우2227임연서2228전소율2229정연우2230조진아2231조채윤2232천혜원2233최아랑2234추민서2301구해나2302구해린2303권서연2304권세라2305권희원2306김나윤2307김민서2308김민슬2309김보현2310김시원2311김연아2312김윤민2313김지연2314김지유2315남건희2316도효은2317박서윤2318박지희2319빈예진2320서하진2321안세민2322오지윤2323윤리라2324이고원2325이서영2327이유나2328이채민2329이혜민2330전율2331주예진2332차지윤2333최정연2334허다현2401강나현2402공민주2403권현아2404김다인2405김민서2406김민주2407김수연2408김연서2409김예나2410김예원2411김유나2412김은유2413김지우2414김채현2415도민슬2416박서은2417배수민2418성지희2419성혜지2420안은솔2421이세령2422이승연2423이유나2424이지영2425이하율2426임현서2427임혜인2428장채완2429전아인2430천율이2431최지우2432한예지2433홍수연2501강아연2502곽유진2503권수빈2504권효언2505김가윤2506김규린2507김민서2508김민채2509김소은2510김수연2511김예후2512문서현2513박혜린2514석예지2515성한별2516신연우2517심민정2518여서현2519예서영2520윤가인2521이담희2522이서희2523이세연2524이예원2526임하음2527장윤서2528정아진2529정유나2530정은유2531정지우2532조은별2533주효안2601권유안2602김나현2603김려원2604김서희2605김영원2606김지빈2607김채민2608나연우2609남서연2610문지원2611박지성2612박나연2613박다영2614박민서2615박예진2616박현서2617배수민2618서지운2619성채원2620윤슬2621이서영2622이세랑2623이주희2624이지율2625임유나2626전하진2627정수현2628정시윤2629정윤슬2630정해린2631채민하2632천가인2633최윤슬2634최희수2701권하윤2702김경은2703김단희2704김민채2705김서령2706김성연2707김이슬2708김주희2709김채윤2710류민서2711문규림2712박다해2713박소영2714박지수2715박채은2716백승연2717백하비2718변예진2719서보배2720신아윤2721심예담2722양채원2723여소율2724유수진2725이수연2726이하린2727이효린2728장아영2729장혜리2730정연후2731정하은2732하연재2733한윤슬2801권효서2802김가연2803김가예2804김나온2805김소연2806김연서2807김연우2808김유진2809김주혜2810김지우2811박시연2812박예봄2813서예빈2814신은설2815여시화2816유채령2817윤연우2818이도혜2819이라현2820이서현2821이채은2822이하은2823전지현2824전현서2825정윤지2826조서연2827지송은2828진은서2829최유란2830최윤서2831하지원2832허수진2833황서윤2901강소율2902김가은2903김나윤2904김나현2905김서연2906김수영2907김은우2908김인하2909김하은2910도예서2911도유빈2912도윤슬2913박민서2914박선영2915박소이2916박수빈2917박윤서2918백서현2919손지민2920송현지2921심윤서2922안민슬2923음채우2924이다은2925이수연2926이연우2927이예진2928이윤진2929장채윤2930전이진2931정다연2932정려원2933정하린3101김가령3102김수연3103김승은3104김시현3105김예담3106김이경3107김주연3108김주원3109김효림3110김효빈3111박서윤3112박세은3113박지윤3114박채영3115배드린3116손유3117손지우3118송슬3119유재서3120윤서윤3121윤혜린3122장하은3123전하늘3124조희진3125천영서3126천지민3127최민서3128최정윤3129최한나3130황정윤3201강현진3202곽예설3203김가온3204김민하3205김예림3206김예서3207김지원3208김태영3209김하은3210남유민3211문예진3212박서윤3213박서진3214박수민3215박채연3216설하영3217예도연3218우승은3219이세은3220이유주3221이하정3222임서영3223정규현3224정다인3225정서영3226최가은3227최다연3228최리아3229최지우3230최희윤3301강현서3302권아연3303김민유3304김보미3305김서영3306김소윤3307김소은3308김예지3309김지율3310김현서3311남승연3312박새봄3313박지후3314박채은3315박혜린3316박혜진3317박효은3318배시온3319오서윤3320오세율3321이경민3322이은희3323이채은3324이혜원3325장혜정3326조한울3327주은성3328진연우3329황다현3330황서영3401곽다연3402김가은3403김민선3404김지원3405노하정3406도하진3407박경빈3408박미준3409박서영3410박서윤3411배가은3412백하영3413손민주3414손예영3415송민아3416신나라3417신서연3418우지민3419이서아3420이서율3421이세령3422이소정3423이연우3424정아인3425정해원3426최효리3427최휘진3428현다연3429홍도영3430황서영3431황서휘3501권가람3502권도연3503김사랑3504김수정3505김유진3506김은서3507김현주3508손서윤3509송지은3510송채윤3511신다솜3512신예원3513양소윤3514우정민3515유수민3516이비안3517이서진3518이유진3519이윤서3520이지안3521이채은3522이현서3523전지율3524정다은3525정유림3526정은교3527진효림3528최연우3529최희재3530하지우3531황봄3601김경민3602김고은3603김기란3604김미령3605김사랑3606김소연3607김소윤3608김예린3609김지우3610문서영3611박지성3612박나연3613백인경3614서지우3615서혜정3616송주연3617신효주3618윤선진3619윤수아3620윤진서3621이선주3622이수안3623이지우3624임주비3625임하윤3626전소이3627전지윤3628정지민3629천사론3630한서윤3631황혜린3701강연우3702곽은빈3703김가을3704김란희3705김영아3706김채윤3707김효린3708박다은3709박민서3710박보민3711박서윤3712박현서3713변서현3714신서영3715여효이3716오채원3717이라은3718이서연3719이시원3720이예은3721이제아3722이현진3723이효주3724정다민3725정은희3726조시연3727천예현3728최유리3729최재원3730하루아3731허다령3801권경민3802권예린3803김수혜3804김윤아3805김지인3806김한결3807박채원3808배해인3809서지우3810양예지3811이나경3812이다인3813이세은3814이승은3815이지윤3816이채은3817이효원3818임소현3819전민지3820정민주3821조다혜3822지수현3823차승연3824천원정3825최아영3826최유나3827최윤화3828하민서3829홍승아3830황수현3901권윤솔3902김미담3903김민지3904김민채3905김수아3906김유진3907김정현3908김지아3909남민지3910박선우3911박지현3912백민주3913빈다은3914손주연3915손현재3916신그린3917오은채3918윤소원3919이가윤3920이시윤3921이은교3922이채윤3923이한비3924전하늘3925정여원3926조민영3927지예안3928최은교3929허윤서3930황서영";

  const totalStudentsList = useMemo(() => {
    const regex = /(\d)(\d)(\d{2})([^0-9\s]+)/g;
    const students = [];
    let match;
    while ((match = regex.exec(rawStudentData)) !== null) {
      students.push({
        key: match[0], grade: match[1], class: match[2], number: match[3], name: match[4]
      });
    }
    const uniqueMap = new Map();
    students.forEach(s => uniqueMap.set(s.key, s));
    return Array.from(uniqueMap.values());
  }, []);

  // 후보자 명단
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

  // --- Firebase 인증 ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (err) { console.warn("인증 보류 중:", err.message); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // --- 실시간 데이터 수신 ---
  useEffect(() => {
    if (!user) return;
    
    const votesRef = collection(db, 'artifacts', appId, 'public', 'data', 'votes');
    const unsubVotes = onSnapshot(votesRef, (snapshot) => {
      setDbVotes(snapshot.docs.map(doc => doc.data()));
    }, (err) => console.error("득표 로드 오류:", err));

    const votersRef = collection(db, 'artifacts', appId, 'public', 'data', 'voters');
    const unsubVoters = onSnapshot(votersRef, (snapshot) => {
      const votersMap = {};
      snapshot.docs.forEach(doc => { votersMap[doc.id] = true; });
      setDbVoters(votersMap);
    }, (err) => console.error("명단 로드 오류:", err));
    
    return () => { unsubVotes(); unsubVoters(); };
  }, [user]);

  // --- 주요 함수 ---
  const verifyStudent = async () => {
    setIsVerifying(true);
    const { grade, class: cls, number, name } = userData;
    const formattedNumber = number.toString().padStart(2, '0');
    const userKey = `${grade}${cls}${formattedNumber}${name}`;
    
    if (!rawStudentData.includes(userKey)) {
      setError('명단에 없는 학생입니다. 정보를 다시 확인하세요.');
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
      setError('데이터베이스 규칙(Rules) 설정을 완료해주세요.');
      setIsVerifying(false);
      return false;
    }
  };

  const handleNextStep = async () => {
    if (step === 1) {
      if (await verifyStudent()) setStep(2);
    } else setStep(prev => prev + 1);
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
    } else { setAdminAuthError('로그인 정보가 틀렸습니다.'); }
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
    } catch (err) {
      console.error("전체 리셋 실패", err);
    } finally {
      setIsResettingAll(false);
    }
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
          <button onClick={() => window.location.reload()} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black active:scale-95 transition-all">닫기</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4 font-sans text-slate-900 selection:bg-blue-100">
      <div className="max-w-3xl w-full">
        {/* Header */}
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
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shadow-inner"><User size={28} strokeWidth={2.5} /></div>
                  <h2 className="text-2xl font-black text-slate-900">본인 확인</h2>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <select value={userData.grade} onChange={(e) => setUserData({...userData, grade: e.target.value})} className="p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-center outline-none">
                    <option value="">학년</option><option value="1">1</option><option value="2">2</option><option value="3">3</option>
                  </select>
                  <input type="number" placeholder="반" value={userData.class} onChange={(e) => setUserData({...userData, class: e.target.value})} className="p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-center outline-none" />
                  <input type="number" placeholder="번" value={userData.number} onChange={(e) => setUserData({...userData, number: e.target.value})} className="p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-center outline-none" />
                </div>
                <input type="text" placeholder="이름" value={userData.name} onChange={(e) => setUserData({...userData, name: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-xl px-8 mb-6 outline-none focus:border-blue-500" />
                {error && <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 mb-6 flex items-center gap-2 text-sm font-black animate-in shake"><AlertCircle size={18} />{error}</div>}
                <button disabled={!userData.grade || !userData.class || !userData.number || !userData.name || isVerifying} onClick={handleNextStep} className="w-full py-6 bg-blue-600 text-white rounded-3xl font-black text-xl shadow-xl transition-all active:scale-95">
                  {isVerifying ? <RefreshCw className="animate-spin mx-auto" /> : '인증 완료 및 시작'}
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
                    <p className="text-sm text-rose-500 font-black mb-6 leading-tight">주의! 모든 학생의 투표 기록과 득표 결과가 완전히 삭제됩니다. 이 작업은 되돌릴 수 없습니다.</p>
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
          {!showAdminPanel ? (
            <button onClick={() => setShowAdminPanel(true)} className="flex items-center gap-2 mx-auto text-slate-400 hover:text-blue-600 font-bold text-sm transition-colors uppercase tracking-[0.2em]"><BarChart3 size={16} /> Admin Mode</button>
          ) : null}
        </div>
        <footer className="text-center mt-12 opacity-20 text-[10px] font-black uppercase tracking-[0.4em]">EMS Terminal V3.5 Final Build</footer>
      </div>
    </div>
  );
}
