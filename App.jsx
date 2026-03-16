import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, doc, setDoc, getDoc, onSnapshot, deleteDoc, writeBatch, getDocs 
} from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { 
  User, CheckCircle, Award, Users, AlertCircle, Lock, BarChart3, RefreshCw, KeyRound, ShieldCheck, X, Search, RotateCcw, Trash2, AlertTriangle, Fingerprint, ChevronRight, ChevronLeft, ShieldAlert, PlayCircle, StopCircle, Timer, Clock, Trophy, Download
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
// [보안 데이터] 명단 초기화됨 (AUTH_CODES_RAW)
// 새로운 명단을 넣으려면 아래 객체에 "학번이름": "코드" 형식으로 입력하세요.
// ==========================================
const AUTH_CODES_RAW = {};

const FINAL_AUTH_CODES = {};
Object.entries(AUTH_CODES_RAW).forEach(([key, val]) => {
  const cleanKey = key.replace(/\|/g, "").replace(/\s/g, "");
  const match = cleanKey.match(/(\d{4})(.+)/);
  if (match) { FINAL_AUTH_CODES[match[1] + match[2]] = val.replace(/\*/g, "").trim(); }
  else { FINAL_AUTH_CODES[cleanKey] = val.replace(/\*/g, "").trim(); }
});

const candidates = {
  president: [
    { id: 1, name: '황수현', slogan: '3학년 8반의 열정으로 학교를 빛내겠습니다!' },
    { id: 2, name: '김병진', slogan: '3학년 6반의 리더십, 신명의 변화를 약속합니다.' },
    { id: 3, name: '김재수', slogan: '3학년 7반의 성실함으로 모두가 행복한 학교!' },
    { id: 4, name: '박재두', slogan: '3학년 9반의 패기, 소통하는 회장이 되겠습니다.' },
    { id: 5, name: '손희동', slogan: '3학년 7반의 진심, 발로 뛰는 일꾼이 되겠습니다.' },
    { id: 6, name: '김민혜', slogan: '3학년 4반의 따뜻함, 학생들의 목소리를 듣겠습니다.' }
  ],
  vp1: [
    { id: 101, name: '후보1', slogan: '1학년을 위한 슬로건' },
    { id: 102, name: '후보2', slogan: '행동으로 보여주는 1학년' }
  ],
  vp2: [{ id: 201, name: '후보A', slogan: '2학년의 자부심' }],
  vp3: [{ id: 301, name: '후보X', slogan: '3학년의 마지막 열정' }]
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
  const [adminTab, setAdminTab] = useState('stats');
  const [resetConfirm, setResetConfirm] = useState(null);
  const [isResettingAll, setIsResettingAll] = useState(false);
  const [showResetAllModal, setShowResetAllModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [filterGrade, setFilterGrade] = useState('all');
  const [filterClass, setFilterClass] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 개발자 도구 차단
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

  const totalStudentsList = useMemo(() => {
    return Object.keys(FINAL_AUTH_CODES).map(key => ({
      key, grade: key[0], class: key[1], number: key.substring(2, 4), name: key.substring(4)
    }));
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try { await signInAnonymously(auth); } catch (err) { console.warn(err.message); }
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
    return () => unsubSettings();
  }, [user]);

  useEffect(() => {
    if (!user || !isAdminAuthenticated) return;
    const votesRef = collection(db, 'artifacts', appId, 'public', 'data', 'votes');
    const unsubVotes = onSnapshot(votesRef, (snapshot) => { setDbVotes(snapshot.docs.map(doc => doc.data())); });
    const votersRef = collection(db, 'artifacts', appId, 'public', 'data', 'voters');
    const unsubVoters = onSnapshot(votersRef, (snapshot) => {
      const votersMap = {};
      snapshot.docs.forEach(doc => { votersMap[doc.id] = doc.data(); });
      setDbVoters(votersMap);
    });
    return () => { unsubVotes(); unsubVoters(); };
  }, [user, isAdminAuthenticated]);

  const verifyStudent = async () => {
    if (votingState !== 'active') return false;
    setIsVerifying(true);
    const { grade, class: cls, number, name, authCode } = userData;
    const formattedNumber = number.toString().padStart(2, '0');
    const studentKey = `${grade}${cls}${formattedNumber}${name}`;
    
    if (!user) { setError('서버 연결 중...'); setIsVerifying(false); return false; }

    try {
      const vaultDoc = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'authVault', studentKey));
      const expectedCode = vaultDoc.exists() ? vaultDoc.data().code : FINAL_AUTH_CODES[studentKey];

      if (!expectedCode) { setError('명단에 없는 학생입니다.'); setIsVerifying(false); return false; }
      if (expectedCode !== authCode.trim()) { setError('인증 코드가 일치하지 않습니다.'); setIsVerifying(false); return false; }

      const voterDoc = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'voters', studentKey));
      if (voterDoc.exists()) { setError('이미 투표를 완료했습니다.'); setIsVerifying(false); return false; }
      
      setError(''); setIsVerifying(false); return true;
    } catch (err) { setError('데이터베이스 연결 오류'); setIsVerifying(false); return false; }
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
        presidentId: selectedPres.id, vp1Id: selectedVP1.id, vp2Id: selectedVP2.id, vp3Id: selectedVP3.id, timestamp: now
      });
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'voters', userKey), { voted: true, votedAt: now });
      setIsSubmitted(true);
    } catch (err) { setError('제출 실패'); }
  };

  const setGlobalVotingState = async (status) => {
    if (!user || !isAdminAuthenticated) return;
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'votingControl'), { status });
    } catch (err) { alert("오류: " + err.message); }
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminAuthForm.id === 'kmge439' && adminAuthForm.pw === 'dkssud2323!') {
      setIsAdminAuthenticated(true);
      setAdminAuthError('');
    } else { setAdminAuthError('인증 실패'); }
  };

  const handleResetVoter = async (studentKey) => {
    if (!user || !isAdminAuthenticated) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'voters', studentKey));
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'votes', studentKey));
      setResetConfirm(null);
    } catch (err) { console.error(err); }
  };

  const handleResetAllVotes = async () => {
    if (!user || !isAdminAuthenticated) return;
    if (!confirm("주의! 모든 투표 기록, 참여 명단, 그리고 서버에 저장된 학생 인증 정보가 완전히 삭제됩니다. 계속하시겠습니까?")) return;
    setIsResettingAll(true);
    try {
      // 1. Voters 삭제
      const votersSnap = await getDocs(collection(db, 'artifacts', appId, 'public', 'data', 'voters'));
      const batch1 = writeBatch(db);
      votersSnap.docs.forEach((doc) => batch1.delete(doc.ref));
      await batch1.commit();

      // 2. Votes 삭제
      const votesSnap = await getDocs(collection(db, 'artifacts', appId, 'public', 'data', 'votes'));
      const batch2 = writeBatch(db);
      votesSnap.docs.forEach((doc) => batch2.delete(doc.ref));
      await batch2.commit();

      // 3. AuthVault(명단 금고) 삭제
      const vaultSnap = await getDocs(collection(db, 'artifacts', appId, 'public', 'data', 'authVault'));
      const batch3 = writeBatch(db);
      vaultSnap.docs.forEach((doc) => batch3.delete(doc.ref));
      await batch3.commit();

      setShowResetAllModal(false);
      alert("서버 내 모든 명단 및 결과가 초기화되었습니다.");
    } catch (err) { console.error(err); } 
    finally { setIsResettingAll(false); }
  };

  const syncAuthVault = async () => {
    if (!confirm("코드에 입력된 명단을 금고(DB)로 동기화하시겠습니까?")) return;
    setIsSyncing(true);
    try {
      const batch = writeBatch(db);
      Object.entries(FINAL_AUTH_CODES).forEach(([key, code]) => {
        batch.set(doc(db, 'artifacts', appId, 'public', 'data', 'authVault', key), { code });
      });
      await batch.commit();
      alert("동기화 완료!");
    } catch (err) { alert("실패: " + err.message); }
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
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toLocaleDateString()}.csv`;
    link.click();
  };

  const handleExportResults = () => {
    const rows = [["선거 부문", "후보 이름", "득표수"]];
    candidates.president.forEach(p => rows.push(["전교회장", p.name, stats.pres[p.id] || 0]));
    candidates.vp1.forEach(p => rows.push(["1학년 부회장", p.name, stats.vp1[p.id] || 0]));
    candidates.vp2.forEach(p => rows.push(["2학년 부회장", p.name, stats.vp2[p.id] || 0]));
    candidates.vp3.forEach(p => rows.push(["3학년 부회장", p.name, stats.vp3[p.id] || 0]));
    downloadCSV(rows, `신명여중_투표집계`);
  };

  const handleExportVoters = () => {
    const rows = [["학년", "반", "번호", "이름", "투표 여부", "투표 시간"]];
    totalStudentsList.forEach(s => {
      const v = dbVoters[s.key];
      const timeStr = v?.votedAt ? new Date(v.votedAt).toLocaleString() : "-";
      rows.push([s.grade, s.class, s.number, s.name, v ? "완료" : "미참여", timeStr]);
    });
    downloadCSV(rows, `신명여중_투표명단`);
  };

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
        <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 text-center border border-slate-100 text-slate-900">
          <CheckCircle size={80} className="text-emerald-500 mx-auto mb-6" />
          <h2 className="text-3xl font-black mb-4 tracking-tight">투표 제출 완료</h2>
          <p className="text-slate-600 mb-8 font-medium">참여해 주셔서 감사합니다.</p>
          <button onClick={() => window.location.reload()} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black transition-all active:scale-95 text-slate-100">닫기</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4 font-sans text-slate-900 selection:bg-blue-100 select-none">
      <div className="max-w-3xl w-full text-slate-900">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full mb-4 uppercase tracking-[0.2em] shadow-lg text-slate-100">
            <Lock size={12} /> SECURED SYSTEM V5.8.1
          </div>
          <h1 className="text-4xl font-black mb-2 tracking-tighter">2026학년도 신명여자중학교 전교 회장단 선거</h1>
        </div>

        {!showAdminPanel ? (
          <div className="max-w-2xl mx-auto">
            {step === 1 && (
              <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-100 animate-in slide-in-from-bottom-4 duration-500">
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
                      <input type="number" placeholder="반" value={userData.class} onChange={(e) => setUserData({...userData, class: e.target.value})} className="p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-center outline-none" />
                      <input type="number" placeholder="번" value={userData.number} onChange={(e) => setUserData({...userData, number: e.target.value})} className="p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-center outline-none" />
                    </div>
                    <input type="text" placeholder="이름" value={userData.name} onChange={(e) => setUserData({...userData, name: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-xl px-8 mb-4 outline-none focus:border-blue-500" />
                    <div className="relative mb-6">
                      <KeyRound className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-400" size={20} />
                      <input type="text" placeholder="인증 코드 입력" value={userData.authCode} onChange={(e) => setUserData({...userData, authCode: e.target.value})} className="w-full p-5 pl-16 bg-blue-50 border-2 border-blue-100 rounded-2xl font-black text-xl outline-none focus:border-blue-500" />
                    </div>
                    {error && <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 mb-6 flex items-center gap-2 text-sm font-black animate-in shake"><AlertCircle size={18} />{error}</div>}
                    <button disabled={!userData.grade || !userData.class || !userData.number || !userData.name || !userData.authCode || isVerifying} onClick={handleNextStep} className="w-full py-6 bg-blue-600 text-white rounded-3xl font-black text-xl shadow-xl transition-all active:scale-95 text-slate-100">
                      {isVerifying ? <RefreshCw className="animate-spin mx-auto" /> : '인증 확인 및 투표 시작'}
                    </button>
                  </>
                ) : (
                  <div className="text-center py-10">
                    {votingState === 'ready' ? (
                      <><Timer size={64} className="mx-auto text-amber-500 mb-6" /><h2 className="text-2xl font-black mb-4">투표 준비 중</h2><p className="text-slate-500 font-bold">아직 투표 시간이 아닙니다. 시작될 때까지 기다려 주세요.</p></>
                    ) : (
                      <><StopCircle size={64} className="mx-auto text-rose-500 mb-6" /><h2 className="text-2xl font-black mb-4">투표 종료</h2><p className="text-slate-500 font-bold">2026학년도 선거 투표가 마감되었습니다.</p></>
                    )}
                  </div>
                )}
              </div>
            )}

            {[2, 3, 4, 5].includes(step) && (
              <div className="animate-in slide-in-from-right-8 duration-500">
                <div className="flex justify-between items-end mb-8 text-slate-900">
                  <h2 className="text-2xl font-black flex items-center gap-3 tracking-tight">
                    {step === 2 && <><Award className="text-amber-500" /> 전교회장 투표</>}
                    {step === 3 && <><Users className="text-blue-500" /> 1학년 부회장 투표</>}
                    {step === 4 && <><Users className="text-indigo-500" /> 2학년 부회장 투표</>}
                    {step === 5 && <><Users className="text-purple-500" /> 3학년 부회장 투표</>}
                  </h2>
                  <span className="text-xs font-black text-slate-400 tracking-widest uppercase font-sans">Step {step-1} / 4</span>
                </div>
                <div className="grid gap-4">
                  {(step === 2 ? candidates.president : step === 3 ? candidates.vp1 : step === 4 ? candidates.vp2 : candidates.vp3).map(c => {
                    const isSelected = (step===2 && selectedPres?.id===c.id) || (step===3 && selectedVP1?.id===c.id) || (step===4 && selectedVP2?.id===c.id) || (step===5 && selectedVP3?.id===c.id);
                    return (
                      <div key={c.id} onClick={() => {
                        if(step===2) setSelectedPres(c); if(step===3) setSelectedVP1(c); if(step===4) setSelectedVP2(c); if(step===5) setSelectedVP3(c);
                      }} className={`p-6 bg-white rounded-[1.5rem] border-4 cursor-pointer transition-all flex justify-between items-center ${isSelected ? 'border-blue-600 bg-blue-50 shadow-lg scale-[1.01]' : 'border-white hover:border-slate-100'}`}>
                        <div><span className="text-[10px] font-black bg-slate-100 px-3 py-1 rounded-lg uppercase tracking-wider text-slate-900">기호 {c.id % 100}번</span><h3 className="text-xl font-black mt-2 text-slate-900">{c.name}</h3><p className="text-slate-500 font-bold text-sm italic">"{c.slogan}"</p></div>
                        <CheckCircle size={28} className={isSelected ? 'text-blue-600' : 'text-slate-100'} />
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-4 mt-10">
                  <button onClick={() => setStep(step - 1)} className="flex-1 py-4 bg-white border border-slate-200 rounded-2xl font-black transition-all active:scale-95 flex items-center justify-center gap-2 text-slate-900"><ChevronLeft size={18}/>이전</button>
                  <button disabled={(step===2 && !selectedPres) || (step===3 && !selectedVP1) || (step===4 && !selectedVP2) || (step===5 && !selectedVP3)} onClick={handleNextStep} className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 text-slate-100">다음 단계 <ChevronRight size={18}/></button>
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="bg-white rounded-[3rem] shadow-2xl p-10 border border-slate-100 animate-in zoom-in duration-500 text-slate-900">
                <h2 className="text-2xl font-black text-center mb-6 tracking-tight uppercase">최종 투표 내용 확인</h2>
                <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 mb-8 flex items-start gap-3 text-slate-900">
                  <ShieldCheck size={24} className="text-blue-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-blue-900 font-bold leading-relaxed font-sans">본 투표는 <span className="underline decoration-2 underline-offset-2">비밀 투표</span>로 진행됩니다. 제출 후에는 그 누구도 투표 내용을 확인할 수 없으니 안심하고 제출해 주세요.</p>
                </div>
                <div className="space-y-4 mb-10">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 font-black text-center text-lg">{userData.grade}학년 {userData.class}반 {userData.number}번 {userData.name}</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 bg-amber-50 border border-amber-100 rounded-2xl font-black"><p className="text-[10px] text-amber-600 mb-1 uppercase tracking-widest font-black">전교회장</p>{selectedPres?.name}</div>
                    <div className="p-5 bg-blue-50 border border-blue-100 rounded-2xl font-black"><p className="text-[10px] text-blue-600 mb-1 uppercase tracking-widest font-black">1학년 부회장</p>{selectedVP1?.name}</div>
                    <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-2xl font-black"><p className="text-[10px] text-indigo-600 mb-1 uppercase tracking-widest font-black">2학년 부회장</p>{selectedVP2?.name}</div>
                    <div className="p-5 bg-purple-50 border border-purple-100 rounded-2xl font-black"><p className="text-[10px] text-purple-600 mb-1 uppercase tracking-widest font-black">3학년 부회장</p>{selectedVP3?.name}</div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setStep(5)} className="flex-1 py-5 bg-slate-100 rounded-2xl font-black transition-all active:scale-95 text-slate-900">수정</button>
                  <button onClick={handleSubmit} className="flex-[2] py-5 bg-emerald-600 text-white rounded-2xl font-black text-xl shadow-xl hover:bg-emerald-700 active:scale-95 transition-all text-slate-100">최종 투표 제출</button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden relative animate-in slide-in-from-bottom-4 text-left text-slate-900">
              {(resetConfirm || showResetAllModal) && (
                <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 text-center text-white">
                  <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in text-slate-900">
                    <div className={`w-16 h-16 ${resetConfirm ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      {resetConfirm ? <RotateCcw size={32} /> : <AlertTriangle size={32} />}
                    </div>
                    <h4 className="text-xl font-black mb-2">{resetConfirm ? '개별 리셋' : '전체 초기화'}</h4>
                    <p className="text-sm text-slate-500 font-bold mb-6">{resetConfirm ? '해당 학생의 투표 데이터를 삭제하시겠습니까?' : '주의! 모든 투표 결과와 명단 데이터가 삭제됩니다.'}</p>
                    <div className="flex gap-3 text-slate-900 font-sans">
                      <button onClick={() => {setResetConfirm(null); setShowResetAllModal(false);}} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold">취소</button>
                      <button onClick={resetConfirm ? () => handleResetVoter(resetConfirm) : handleResetAllVotes} className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-bold shadow-lg text-slate-100">실행</button>
                    </div>
                  </div>
                </div>
              )}
              <div className="bg-slate-900 p-8 text-white flex justify-between items-center font-sans">
                <h3 className="text-xl font-black flex items-center gap-3"><ShieldCheck className="text-emerald-400" /> {isAdminAuthenticated ? '관리 대시보드' : '보안 인증'}</h3>
                <button onClick={() => {setShowAdminPanel(false); setIsAdminAuthenticated(false);}} className="p-2 bg-white/10 rounded-full hover:bg-white/20"><X size={18}/></button>
              </div>
              {!isAdminAuthenticated ? (
                <form onSubmit={handleAdminLogin} className="p-10 space-y-4">
                  <input type="text" placeholder="ID" value={adminAuthForm.id} onChange={(e)=>setAdminAuthForm({...adminAuthForm, id: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:border-blue-500" />
                  <input type="password" placeholder="Password" value={adminAuthForm.pw} onChange={(e)=>setAdminAuthForm({...adminAuthForm, pw: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:border-blue-500" />
                  {adminAuthError && <p className="text-xs text-rose-500 font-black">{adminAuthError}</p>}
                  <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-slate-100">인증</button>
                </form>
              ) : (
                <div className="p-8 space-y-8 animate-in fade-in duration-500 font-sans">
                  <div className="bg-slate-100 p-4 rounded-3xl flex flex-wrap items-center justify-center gap-4 text-slate-900">
                    <button onClick={() => setGlobalVotingState('ready')} className={`px-5 py-2.5 rounded-2xl font-black text-xs flex items-center gap-2 transition-all ${votingState === 'ready' ? 'bg-amber-500 text-white shadow-lg' : 'bg-white text-slate-400'}`}><Timer size={16}/> 투표 준비</button>
                    <button onClick={() => setGlobalVotingState('active')} className={`px-5 py-2.5 rounded-2xl font-black text-xs flex items-center gap-2 transition-all ${votingState === 'active' ? 'bg-emerald-500 text-white shadow-lg' : 'bg-white text-slate-400'}`}><PlayCircle size={16}/> 투표 시작</button>
                    <button onClick={() => setGlobalVotingState('finished')} className={`px-5 py-2.5 rounded-2xl font-black text-xs flex items-center gap-2 transition-all ${votingState === 'finished' ? 'bg-rose-500 text-white shadow-lg' : 'bg-white text-slate-400'}`}><StopCircle size={16}/> 투표 종료</button>
                  </div>

                  <div className="flex bg-slate-100 p-1.5 rounded-2xl text-slate-900">
                    <button onClick={()=>setAdminTab('stats')} className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${adminTab === 'stats' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>집계</button>
                    <button onClick={()=>setAdminTab('list')} className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${adminTab === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>명단/보안</button>
                  </div>
                  {adminTab === 'stats' ? (
                    <div className="space-y-10">
                      <div className="flex flex-wrap justify-between items-center gap-4">
                        <p className="font-black text-slate-700 text-sm">전체 투표율: <span className="text-blue-600 text-xl font-sans">{((stats.total / totalStudentsList.length) * 100).toFixed(1)}%</span> ({stats.total}/{totalStudentsList.length}명)</p>
                        <div className="flex gap-2">
                          <button onClick={handleExportResults} className="px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-emerald-100 transition-all text-emerald-600"><Download size={14}/> 결과 다운로드</button>
                          <button onClick={() => setShowResetAllModal(true)} className="px-4 py-2 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-rose-100 transition-all text-rose-600"><Trash2 size={14}/> 초기화</button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 text-slate-900">
                        {['pres', 'vp1', 'vp2', 'vp3'].map((key) => {
                          const categoryKey = key === 'pres' ? 'president' : key;
                          const currentMax = Math.max(...candidates[categoryKey].map(p => stats[key][p.id] || 0));
                          return (
                          <div key={key} className="space-y-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">{key==='pres' ? '전교회장' : key==='vp1' ? '1학년 부회장' : key==='vp2' ? '2학년 부회장' : '3학년 부회장'}</p>
                            {candidates[categoryKey].map(p => {
                              const count = stats[key][p.id] || 0;
                              const percent = stats.total > 0 ? (count / stats.total) * 100 : 0;
                              const isTop = count > 0 && count === currentMax;
                              return (
                                <div key={p.id} className="space-y-1.5">
                                  <div className="flex justify-between text-xs font-black text-slate-700">
                                    <span className="flex items-center gap-1">{isTop && <Trophy size={12} className="text-amber-500" />}{p.name}</span>
                                    <span className={isTop ? 'text-rose-600 font-sans' : 'font-sans'}>{count}표</span>
                                  </div>
                                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner relative">
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
                  ) : (
                    <div className="space-y-6">
                      <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
                        <h4 className="font-black text-sm mb-2 flex items-center gap-2 text-amber-800"><ShieldAlert size={18}/> 보안 금고(DB) 동기화</h4>
                        <button onClick={syncAuthVault} disabled={isSyncing} className="w-full py-3 bg-amber-600 text-white rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-lg text-slate-100">
                          {isSyncing ? <RefreshCw className="animate-spin" size={14}/> : <KeyRound size={14}/>} 인증 코드 DB 동기화 실행
                        </button>
                      </div>
                      <div className="flex flex-wrap justify-between items-center gap-4 text-slate-900">
                        <div className="grid grid-cols-2 gap-3 flex-1 text-slate-900">
                          <select onChange={(e)=>setFilterGrade(e.target.value)} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold outline-none text-slate-900"><option value="all">학년</option><option value="1">1</option><option value="2">2</option><option value="3">3</option></select>
                          <div className="relative text-slate-900 font-sans"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" placeholder="검색" value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)} className="w-full p-3 pl-9 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none text-slate-900" /></div>
                        </div>
                        <button onClick={handleExportVoters} className="p-3 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-xs font-black flex items-center gap-2 shadow-sm text-emerald-600"><Download size={14}/> 명단 엑셀 다운로드</button>
                      </div>
                      <div className="bg-white border rounded-2xl overflow-hidden max-h-[300px] overflow-y-auto shadow-inner text-slate-900 font-sans">
                        <table className="w-full text-left text-[10px] font-sans text-slate-900">
                          <thead className="bg-slate-50 font-black sticky top-0 text-slate-900">
                            <tr><th className="p-3">학생 정보</th><th className="p-3 text-center">상태</th><th className="p-3 text-center">투표 시간</th><th className="p-3 text-center">리셋</th></tr>
                          </thead>
                          <tbody className="divide-y font-sans">
                            {filteredParticipationList.map((s, idx) => {
                              const voterData = dbVoters[s.key];
                              const hasVoted = !!voterData;
                              return (
                                <tr key={`${s.key}-${idx}`} className="hover:bg-slate-50 transition-colors">
                                  <td className="p-3 font-black text-slate-900">{s.grade}-{s.class}-{s.number} {s.name}</td>
                                  <td className="p-3 text-center whitespace-nowrap">
                                    <span className={`px-2 py-0.5 rounded font-black text-[9px] ${hasVoted ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                      {hasVoted ? '완료' : '미참여'}
                                    </span>
                                  </td>
                                  <td className="p-3 text-center text-[9px] font-bold text-slate-500 font-sans whitespace-nowrap">
                                    {hasVoted && voterData.votedAt ? (
                                      <span className="flex items-center justify-center gap-1 text-slate-900"><Clock size={10} className="text-blue-400" />{new Date(voterData.votedAt).toLocaleString('ko-KR', { hour12: false, month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                                    ) : '-'}
                                  </td>
                                  <td className="p-3 text-center">
                                    {hasVoted && (
                                      <button onClick={() => setResetConfirm(s.key)} className="text-amber-500 hover:scale-110 text-amber-500">
                                        <RotateCcw size={14} />
                                      </button>
                                    )}
                                  </td>
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
        <div className="mt-20 pt-10 border-t border-slate-200 text-center text-slate-900 font-sans">
          {!showAdminPanel && (
            <button onClick={() => setShowAdminPanel(true)} className="flex items-center gap-2 mx-auto text-slate-400 hover:text-blue-600 font-bold text-sm transition-colors uppercase tracking-[0.2em] font-sans text-slate-400"><BarChart3 size={16} /> Admin Mode</button>
          )}
        </div>
        <footer className="text-center mt-12 opacity-20 text-[10px] font-black uppercase tracking-[0.4em] font-sans text-slate-900">EMS Terminal V5.8 Final Build</footer>
      </div>
    </div>
  );
}
