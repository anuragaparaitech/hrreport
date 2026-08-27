import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  CalendarDays, Users, UserCheck, Clock, BriefcaseBusiness, Link2, Plus, Search,
  Building2, FileText, CheckCircle2, XCircle, RefreshCcw, Trash2, Camera, ImagePlus,
  ExternalLink, Edit, Lock, LogOut, Upload, File, Eye, Download, ShieldCheck, User, X,
  Bell, Smartphone, AlertCircle, Calendar, Menu, Layers, Video, Copy
} from 'lucide-react';
import './styles.css';

const API = import.meta.env.VITE_API_URL || (
  typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.startsWith('192.168.') ||
    window.location.hostname.startsWith('10.')
  ) ? `http://${window.location.hostname}:5000/api` : '/api'
);
const SERVER = API.replace(/\/api\/?$/, '');

const emptyInterview = {
  candidateName: '', phone: '', email: '', college: '', role: 'Software Developer', source: 'Direct',
  interviewDate: '', interviewTime: '', googleMeetLink: '', interviewer: '', round: 'HR Round',
  status: 'Scheduled', joiningStatus: 'Not Applicable', joiningDate: '2026-06-02', salaryOrStipend: '', notes: '', followUpDate: ''
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught runtime error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '50px 20px', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
          <div style={{ width: '60px', height: '60px', background: '#4f46e5', color: '#fff', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontWeight: '800', fontSize: '24px' }}>HR</div>
          <h2>HR Interview CRM</h2>
          <p style={{ color: '#64748b', maxWidth: '400px', margin: '0 auto 20px' }}>
            A temporary browser session error occurred. Click below to reset your session and reload.
          </p>
          <button
            style={{ padding: '12px 20px', background: '#4f46e5', color: '#ffffff', border: 0, borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}
            onClick={() => {
              try { localStorage.clear(); } catch(e) {}
              window.location.reload();
            }}
          >
            Reset Session & Reload Web App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(API + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Login failed');
      }
      onLogin(data.user, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="loginPage">
      <div className="loginBox">
        <div className="loginHeader">
          <div className="loginLogo">HR</div>
          <h2>HR Interview CRM</h2>
          <p>Sign in to recruitment command center</p>
        </div>
        {error && <div className="errorAlert">{error}</div>}
        <form onSubmit={handleSubmit} className="loginForm">
          <label>
            Email or Username
            <input
              type="text"
              placeholder="admin@aparaitech.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button type="submit" className="primary loginBtn" disabled={loading}>
            <Lock size={16} /> {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div className="demoBox">
          <b>Demo Admin Credentials:</b><br />
          Email: <code>admin@aparaitech.com</code><br />
          Password: <code>admin123</code>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('crm_user');
      return (saved && saved !== 'undefined') ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('crm_token') || '';
    } catch(e) {
      return '';
    }
  });

  const [tab, setTab] = useState('dashboard');
  const [dash, setDash] = useState({});
  const [items, setItems] = useState([]);
  const [props, setProps] = useState([]);
  const [form, setForm] = useState(emptyInterview);
  const [search, setSearch] = useState('');
  
  // Selection modals state
  const [selectedCandidateForDocs, setSelectedCandidateForDocs] = useState(null);
  const [editingInterview, setEditingInterview] = useState(null);
  const [viewingCandidate, setViewingCandidate] = useState(null);

  // Mobile menu & drawer state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // PWA & Notification state
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [notifPermission, setNotifPermission] = useState(() => {
    try {
      return typeof window !== 'undefined' && 'Notification' in window && Notification ? Notification.permission : 'default';
    } catch (e) {
      return 'default';
    }
  });
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  // Register Service Worker & PWA beforeinstallprompt
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(err => console.warn('SW registration failed:', err));
    }

    const promptHandler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', promptHandler);
    return () => window.removeEventListener('beforeinstallprompt', promptHandler);
  }, []);

  const installPWA = async () => {
    if (!deferredPrompt) {
      alert('To install HR CRM on your phone, tap Chrome menu (⋮) and select "Add to Home Screen" or "Install App".');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  const requestNotifPermission = async () => {
    if (!('Notification' in window)) return alert('Desktop notifications are not supported by your browser.');
    try {
      const perm = await Notification.requestPermission();
      setNotifPermission(perm);
      if (perm === 'granted') {
        sendDesktopNotification('Notifications Active 🔔', 'HR Interview CRM will now send you alerts for interviews, joining dates, and follow-ups.');
      }
    } catch (e) {
      console.warn('Notification permission error:', e);
    }
  };

  const sendDesktopNotification = (title, body) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, { body, icon: '/pwa-192.png', tag: title });
      } catch (e) {
        if (navigator.serviceWorker && navigator.serviceWorker.ready) {
          navigator.serviceWorker.ready.then(reg => reg.showNotification(title, { body, icon: '/pwa-192.png' }));
        }
      }
    }
  };

  const handleLogin = (loggedUser, authToken) => {
    setUser(loggedUser);
    setToken(authToken);
    try {
      localStorage.setItem('crm_user', JSON.stringify(loggedUser));
      localStorage.setItem('crm_token', authToken);
    } catch(e) {}
  };

  const handleLogout = () => {
    setUser(null);
    setToken('');
    try {
      localStorage.removeItem('crm_user');
      localStorage.removeItem('crm_token');
    } catch(e) {}
  };

  const load = async () => {
    try {
      const [d, i, p] = await Promise.all([
        fetch(API + '/dashboard').then(r => r.ok ? r.json() : {}).catch(() => ({})),
        fetch(API + '/interviews').then(r => r.ok ? r.json() : []).catch(() => []),
        fetch(API + '/proposals').then(r => r.ok ? r.json() : []).catch(() => [])
      ]);
      setDash(d || {});
      const interviewList = Array.isArray(i) ? i : [];
      const proposalList = Array.isArray(p) ? p : [];
      setItems(interviewList);
      setProps(proposalList);

      if (selectedCandidateForDocs) {
        const updatedDocCand = interviewList.find(x => x._id === selectedCandidateForDocs._id);
        if (updatedDocCand) setSelectedCandidateForDocs(updatedDocCand);
      }
      if (viewingCandidate) {
        const updatedViewCand = interviewList.find(x => x._id === viewingCandidate._id);
        if (updatedViewCand) setViewingCandidate(updatedViewCand);
      }
    } catch (e) {
      console.error('Data load exception:', e);
    }
  };

  useEffect(() => {
    if (user) load();
  }, [user]);

  // Compute Alerts (Interviews Today, Joining Dates, Follow-ups)
  const alerts = useMemo(() => {
    const todayStr = new Date().toDateString();
    const result = { interviews: [], joinings: [], followups: [] };

    // 1. Interviews Today
    (items || []).forEach(x => {
      if (x.interviewDate && new Date(x.interviewDate).toDateString() === todayStr) {
        result.interviews.push(x);
      }
    });

    // 2. Joining Reminders (Pending Joining / Joined with joiningDate today or soon)
    (items || []).forEach(x => {
      if ((x.joiningStatus === 'Pending Joining' || x.joiningStatus === 'Joined') && x.joiningDate) {
        const jDate = new Date(x.joiningDate);
        const diffDays = Math.ceil((jDate - new Date()) / (1000 * 60 * 60 * 24));
        if (jDate.toDateString() === todayStr || (diffDays >= 0 && diffDays <= 5)) {
          result.joinings.push({ ...x, diffDays });
        }
      }
    });

    // 3. Follow-up Reminders
    (items || []).forEach(x => {
      if (x.followUpDate) {
        const fDate = new Date(x.followUpDate);
        if (fDate <= new Date()) {
          result.followups.push({ title: `${x.candidateName} (${x.role})`, type: 'Candidate', target: x });
        }
      }
    });
    (props || []).forEach(p => {
      if (p.followUpDate) {
        const fDate = new Date(p.followUpDate);
        if (fDate <= new Date()) {
          result.followups.push({ title: `${p.collegeName} Proposal`, type: 'Proposal', target: p });
        }
      }
    });

    return result;
  }, [items, props]);

  const totalAlerts = alerts.interviews.length + alerts.joinings.length + alerts.followups.length;

  // Send desktop notification when alerts exist
  useEffect(() => {
    if (notifPermission === 'granted' && totalAlerts > 0) {
      const msgParts = [];
      if (alerts.interviews.length) msgParts.push(`${alerts.interviews.length} interview(s) today`);
      if (alerts.joinings.length) msgParts.push(`${alerts.joinings.length} candidate joining reminder(s)`);
      if (alerts.followups.length) msgParts.push(`${alerts.followups.length} follow-up(s) due`);
      sendDesktopNotification('HR CRM Reminders 🔔', msgParts.join(', '));
    }
  }, [totalAlerts, notifPermission]);

  const filtered = useMemo(() => (items || []).filter(x =>
    [x.candidateName, x.phone, x.email, x.college, x.role].join(' ').toLowerCase().includes(search.toLowerCase())
  ), [items, search]);

  const addInterview = async e => {
    e.preventDefault();
    await fetch(API + '/interviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    setForm(emptyInterview);
    await load();
    setTab('interviews');
  };

  const update = async (id, patch) => {
    await fetch(API + '/interviews/' + id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch)
    });
    load();
  };

  const del = async id => {
    if (confirm('Delete interview?')) {
      await fetch(API + '/interviews/' + id, { method: 'DELETE' });
      load();
    }
  };

  const openEditInterview = (interview) => {
    setEditingInterview({
      ...interview,
      interviewDate: interview.interviewDate ? new Date(interview.interviewDate).toISOString().split('T')[0] : '',
      joiningDate: interview.joiningDate ? new Date(interview.joiningDate).toISOString().split('T')[0] : '',
      followUpDate: interview.followUpDate ? new Date(interview.followUpDate).toISOString().split('T')[0] : ''
    });
  };

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const cards = [
    ['Total Interviews', dash.total, Users],
    ['Today Interviews', dash.today, CalendarDays],
    ['Pending', dash.pending, Clock],
    ['Selected', dash.selected, UserCheck],
    ['Pending Joining', dash.pendingJoining, BriefcaseBusiness],
    ['Joined', dash.joined, CheckCircle2],
    ['Rejected', dash.rejected, XCircle],
    ['College Proposals', dash.proposals, Building2]
  ];

  return (
    <div className="app">
      {/* Mobile Sticky Header */}
      <div className="mobileTopBar">
        <div className="mobileBrand">
          <div className="logo">HR</div>
          <div>
            <b>HR CRM</b>
            <small>Recruitment</small>
          </div>
        </div>
        <div className="mobileActions">
          <div className="notifWrapper">
            <button className="notifBell" onClick={() => setShowNotifMenu(!showNotifMenu)}>
              <Bell size={18} />
              {totalAlerts > 0 && <span className="notifBadge">{totalAlerts}</span>}
            </button>
          </div>
          <button className="menuBtn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && <div className="mobileBackdrop" onClick={() => setMobileMenuOpen(false)} />}

      {/* Sidebar Navigation */}
      <aside className={mobileMenuOpen ? 'mobileOpen' : ''}>
        <div className="brand">
          <div className="logo">HR</div>
          <div><b>Interview CRM</b><small>Recruitment Center</small></div>
        </div>
        {[
          ['dashboard', 'Dashboard'],
          ['interviews', 'Interviews'],
          ['joiners', 'Joiners & Documents'],
          ['new', 'New Interview'],
          ['proposals', 'College Proposals'],
          ['reports', 'Daily Reports']
        ].map(([k, l]) => (
          <button
            className={tab === k ? 'active' : ''}
            onClick={() => { setTab(k); setMobileMenuOpen(false); }}
            key={k}
          >
            {l}
          </button>
        ))}

        <div style={{ marginTop: '20px', padding: '0 4px' }}>
          <button className="installBtn" style={{ width: '100%', justifyContent: 'center' }} onClick={installPWA}>
            <Smartphone size={16} /> Install CRM App
          </button>
        </div>

        <div className="sidebarFooter">
          <div className="userInfo">
            <div className="userBadge">
              <b>{user.name}</b>
              <small>{user.role || 'HR Admin'}</small>
            </div>
            <button className="logoutBtn" title="Logout" onClick={handleLogout}>
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <main>
        <header>
          <div>
            <h1>
              {tab === 'dashboard' ? 'HR Interview Dashboard' :
               tab === 'new' ? 'Schedule Interview' :
               tab === 'proposals' ? 'College Proposals' :
               tab === 'joiners' ? 'Joiners & Onboarding Documents' :
               tab === 'reports' ? 'Daily Interview Report' : 'Interview Pipeline'}
            </h1>
            <p>Manage interviews, Google Meet, college proposals & joiner documents.</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div className="notifWrapper">
              <button className="notifBell" onClick={() => setShowNotifMenu(!showNotifMenu)} title="Notifications & Reminders">
                <Bell size={18} />
                {totalAlerts > 0 && <span className="notifBadge">{totalAlerts}</span>}
              </button>

              {showNotifMenu && (
                <div className="notifPopover">
                  <div className="notifHeader">
                    <h4>Notifications & Reminders</h4>
                    <button className="closeBtn" onClick={() => setShowNotifMenu(false)}><X size={16} /></button>
                  </div>

                  {notifPermission !== 'granted' && (
                    <div className="enableNotifBar">
                      <span>Enable Desktop Notifications</span>
                      <button className="actionBtn primary" onClick={requestNotifPermission}>Allow</button>
                    </div>
                  )}

                  {totalAlerts === 0 ? (
                    <p className="muted" style={{ margin: '10px 0', fontSize: '13px' }}>No active notifications or reminders today.</p>
                  ) : (
                    <>
                      {alerts.interviews.length > 0 && (
                        <div>
                          <div className="notifCategory">📅 Today's Interviews ({alerts.interviews.length})</div>
                          <div className="notifList">
                            {alerts.interviews.map(i => (
                              <div className="notifCard interview" key={i._id} onClick={() => { setViewingCandidate(i); setShowNotifMenu(false); }}>
                                <div className="notifCardContent">
                                  <b>{i.candidateName}</b>
                                  <small>{i.role} • {i.interviewTime || 'Scheduled Today'}</small>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {alerts.joinings.length > 0 && (
                        <div>
                          <div className="notifCategory">💼 Candidate Joining Reminders ({alerts.joinings.length})</div>
                          <div className="notifList">
                            {alerts.joinings.map(j => (
                              <div className="notifCard joining" key={j._id} onClick={() => { setViewingCandidate(j); setShowNotifMenu(false); }}>
                                <div className="notifCardContent">
                                  <b>{j.candidateName}</b>
                                  <small>{j.role} • Joining Date: {new Date(j.joiningDate).toLocaleDateString()} {j.diffDays === 0 ? '(TODAY)' : `(in ${j.diffDays} days)`}</small>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {alerts.followups.length > 0 && (
                        <div>
                          <div className="notifCategory">🔔 Follow-ups Due ({alerts.followups.length})</div>
                          <div className="notifList">
                            {alerts.followups.map((f, idx) => (
                              <div className="notifCard followup" key={idx} onClick={() => {
                                if (f.type === 'Candidate') setViewingCandidate(f.target);
                                else setTab('proposals');
                                setShowNotifMenu(false);
                              }}>
                                <div className="notifCardContent">
                                  <b>{f.title}</b>
                                  <small>{f.type} Follow-up Action Required</small>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            <button className="installBtn" onClick={installPWA}>
              <Smartphone size={17} /> Install App
            </button>

            <button className="primary" onClick={() => setTab('new')}><Plus size={18} /> New Interview</button>
          </div>
        </header>

        {tab === 'dashboard' && (
          <>
            <section className="cards">
              {cards.map(([t, v, I]) => (
                <div className="card" key={t}>
                  <div><span>{t}</span><strong>{v ?? 0}</strong></div>
                  <I />
                </div>
              ))}
            </section>
            <section className="grid2">
              <div className="panel">
                <h3>Upcoming Interviews</h3>
                {(dash.upcoming || []).map(x => (
                  <div className="row" key={x._id}>
                    <div>
                      <b className="candidateLink" onClick={() => setViewingCandidate(x)}>{x.candidateName}</b>
                      <small>{x.role} • {new Date(x.interviewDate).toLocaleDateString()} {x.interviewTime}</small>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button className="actionBtn" onClick={() => openEditInterview(x)} title="Edit Candidate">
                        <Edit size={14} />
                      </button>
                      {x.googleMeetLink ? (
                        <a href={x.googleMeetLink} target="_blank" rel="noreferrer" className="actionBtn primary" style={{ padding: '6px 10px' }}>
                          <Video size={14} /> Join Meet
                        </a>
                      ) : <button className="actionBtn" onClick={() => openEditInterview(x)}>+ Meet</button>}
                    </div>
                  </div>
                ))}
              </div>
              <div className="panel">
                <h3>Interview by Role</h3>
                {(dash.byRole || []).map(x => (
                  <div className="metric" key={x._id}>
                    <span>{x._id}</span><b>{x.count}</b>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {tab === 'interviews' && (
          <div className="panel">
            <div className="toolbar">
              <div className="search">
                <Search size={17} />
                <input placeholder="Search name, phone, college, role" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <button onClick={load}><RefreshCcw size={16} /></button>
            </div>
            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Role</th>
                    <th>Interview</th>
                    <th>Scheduled Meet</th>
                    <th>Status</th>
                    <th>Joining</th>
                    <th>Meeting Proof</th>
                    <th>Docs</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(x => (
                    <tr key={x._id}>
                      <td>
                        <b className="candidateLink" onClick={() => setViewingCandidate(x)} title="Click to view full student profile">
                          {x.candidateName}
                        </b>
                        <small>{x.phone}<br />{x.college}</small>
                      </td>
                      <td>{x.role}<small>{x.round}</small></td>
                      <td>{new Date(x.interviewDate).toLocaleDateString()}<small>{x.interviewTime}</small></td>
                      <td>
                        {x.googleMeetLink ? (
                          <a href={x.googleMeetLink} target="_blank" rel="noreferrer" className="actionBtn primary" style={{ fontSize: '12px', padding: '6px 10px' }}>
                            <Video size={14} /> Join Meet
                          </a>
                        ) : (
                          <button className="actionBtn" onClick={() => openEditInterview(x)}>
                            + Add Link
                          </button>
                        )}
                      </td>
                      <td>
                        <select value={x.status} onChange={e => update(x._id, { status: e.target.value })}>
                          {['Scheduled', 'Completed', 'Selected', 'Rejected', 'No Show', 'On Hold', 'Pending'].map(v => <option key={v}>{v}</option>)}
                        </select>
                      </td>
                      <td>
                        <select value={x.joiningStatus} onChange={e => update(x._id, { joiningStatus: e.target.value })}>
                          {['Not Applicable', 'Pending Joining', 'Joined', 'Declined'].map(v => <option key={v}>{v}</option>)}
                        </select>
                        {x.joiningDate && <small>{new Date(x.joiningDate).toLocaleDateString()}</small>}
                      </td>
                      <td><MeetingProof interview={x} reload={load} /></td>
                      <td>
                        <button className="actionBtn" onClick={() => setSelectedCandidateForDocs(x)}>
                          <FileText size={15} /> {(x.documents || []).length} Docs
                        </button>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button className="actionBtn" onClick={() => setViewingCandidate(x)} title="View Student Data">
                            <Eye size={14} /> View
                          </button>
                          <button className="actionBtn" onClick={() => openEditInterview(x)} title="Edit Interview">
                            <Edit size={14} />
                          </button>
                          <button className="icon danger" onClick={() => del(x._id)} title="Delete Interview">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'joiners' && <JoinerPanel items={items} onManageDocs={setSelectedCandidateForDocs} onEditInterview={openEditInterview} onViewCandidate={setViewingCandidate} />}

        {tab === 'new' && (
          <form className="panel form" onSubmit={addInterview}>
            <div className="formgrid">
              {[
                ['candidateName', 'Candidate Name', 'text'],
                ['phone', 'Phone', 'text'],
                ['email', 'Email', 'email'],
                ['college', 'College', 'text'],
                ['interviewDate', 'Interview Date', 'date'],
                ['interviewTime', 'Interview Time', 'time'],
                ['googleMeetLink', 'Google Meet Link', 'url'],
                ['interviewer', 'Interviewer', 'text'],
                ['joiningDate', 'Joining Date', 'date'],
                ['salaryOrStipend', 'Salary / Stipend', 'text'],
                ['followUpDate', 'Follow-up Date', 'date']
              ].map(([k, l, t]) => (
                <label key={k}>
                  {l}
                  <input
                    type={t}
                    value={form[k]}
                    required={k === 'candidateName' || k === 'interviewDate'}
                    onChange={e => setForm({ ...form, [k]: e.target.value })}
                  />
                </label>
              ))}
              <label>Role
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  {['BDA', 'Software Developer', 'Java Developer', 'Python Developer', 'React Developer', 'Node.js Developer', 'HR', 'Other'].map(v => <option key={v}>{v}</option>)}
                </select>
              </label>
              <label>Status
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  {['Scheduled', 'Completed', 'Selected', 'Rejected', 'No Show', 'On Hold', 'Pending'].map(v => <option key={v}>{v}</option>)}
                </select>
              </label>
              <label>Joining Status
                <select value={form.joiningStatus} onChange={e => setForm({ ...form, joiningStatus: e.target.value })}>
                  {['Not Applicable', 'Pending Joining', 'Joined', 'Declined'].map(v => <option key={v}>{v}</option>)}
                </select>
              </label>
            </div>
            <label>Notes
              <textarea rows="4" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </label>
            <button className="primary" type="submit">Save Interview</button>
          </form>
        )}

        {tab === 'proposals' && <ProposalPanel props={props} reload={load} />}
        {tab === 'reports' && <ReportPanel items={items} onViewCandidate={setViewingCandidate} />}

        {viewingCandidate && (
          <StudentProfileModal
            candidate={viewingCandidate}
            onClose={() => setViewingCandidate(null)}
            onEdit={openEditInterview}
            onManageDocs={setSelectedCandidateForDocs}
            reload={load}
          />
        )}

        {selectedCandidateForDocs && (
          <DocumentModal candidate={selectedCandidateForDocs} onClose={() => setSelectedCandidateForDocs(null)} reload={load} />
        )}

        {editingInterview && (
          <EditInterviewModal interview={editingInterview} onClose={() => setEditingInterview(null)} reload={load} />
        )}
      </main>

      {/* Fixed Bottom Navigation Bar for Smartphone Screens */}
      <div className="bottomNav">
        <button
          className={`bottomNavItem ${tab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setTab('dashboard')}
        >
          <CalendarDays size={20} />
          <span>Home</span>
        </button>
        <button
          className={`bottomNavItem ${tab === 'interviews' ? 'active' : ''}`}
          onClick={() => setTab('interviews')}
        >
          <Users size={20} />
          <span>Pipeline</span>
        </button>
        <button
          className="bottomNavItem addBtn"
          onClick={() => setTab('new')}
        >
          <div className="addFab">
            <Plus size={22} />
          </div>
        </button>
        <button
          className={`bottomNavItem ${tab === 'joiners' ? 'active' : ''}`}
          onClick={() => setTab('joiners')}
        >
          <BriefcaseBusiness size={20} />
          <span>Joiners</span>
        </button>
        <button
          className={`bottomNavItem ${tab === 'proposals' ? 'active' : ''}`}
          onClick={() => setTab('proposals')}
        >
          <Building2 size={20} />
          <span>Proposals</span>
        </button>
      </div>
    </div>
  );
}

function StudentProfileModal({ candidate, onClose, onEdit, onManageDocs, reload }) {
  const [copied, setCopied] = useState(false);

  const copyMeetLink = () => {
    if (candidate.googleMeetLink) {
      try {
        navigator.clipboard.writeText(candidate.googleMeetLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (e) {}
    }
  };

  return (
    <div className="modalOverlay">
      <div className="modal" style={{ maxWidth: '820px' }}>
        <div className="modalHeader">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h3 style={{ margin: 0 }}>{candidate.candidateName}</h3>
              <span className="badge info">{candidate.role}</span>
              <span className={`badge ${candidate.status === 'Selected' ? 'success' : candidate.status === 'Rejected' ? 'neutral' : 'warning'}`}>
                {candidate.status}
              </span>
            </div>
            <small style={{ color: '#64748b' }}>{candidate.college} • Round: {candidate.round || 'HR Round'}</small>
          </div>
          <button className="closeBtn" onClick={onClose}><X size={20} /></button>
        </div>

        {/* Scheduled Google Meet Direct Join Box */}
        <div className="meetBox">
          <div className="meetInfo">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Video size={20} color="#4338ca" />
              <b>Scheduled Google Meet</b>
            </div>
            <small>{candidate.googleMeetLink || 'No direct Meet link added yet.'}</small>
          </div>
          <div className="meetActions">
            {candidate.googleMeetLink ? (
              <>
                <button className="actionBtn" onClick={copyMeetLink} title="Copy Google Meet Link">
                  <Copy size={15} /> {copied ? 'Copied!' : 'Copy Link'}
                </button>
                <a href={candidate.googleMeetLink} target="_blank" rel="noreferrer" className="meetBtn">
                  <Video size={16} /> Join Scheduled Meet
                </a>
              </>
            ) : (
              <button className="actionBtn primary" onClick={() => { onClose(); onEdit(candidate); }}>
                + Add Google Meet Link
              </button>
            )}
          </div>
        </div>

        {/* Student & Contact Info */}
        <div className="profileSection">
          <h4><User size={16} /> Student Contact & College Details</h4>
          <div className="profileGrid">
            <div className="profileItem"><span>Full Name</span><b>{candidate.candidateName}</b></div>
            <div className="profileItem"><span>Phone Number</span><b>{candidate.phone ? <a href={`tel:${candidate.phone}`}>📞 {candidate.phone}</a> : '-'}</b></div>
            <div className="profileItem"><span>Email Address</span><b>{candidate.email ? <a href={`mailto:${candidate.email}`}>✉️ {candidate.email}</a> : '-'}</b></div>
            <div className="profileItem"><span>College / Institute</span><b>{candidate.college || '-'}</b></div>
            <div className="profileItem"><span>Role Offered</span><b>{candidate.role}</b></div>
            <div className="profileItem"><span>Sourcing Channel</span><b>{candidate.source || 'Direct'}</b></div>
          </div>
        </div>

        {/* Interview Schedule Details */}
        <div className="profileSection">
          <h4><Calendar size={16} /> Interview Schedule & Status</h4>
          <div className="profileGrid">
            <div className="profileItem"><span>Interview Date</span><b>{candidate.interviewDate ? new Date(candidate.interviewDate).toLocaleDateString() : '-'}</b></div>
            <div className="profileItem"><span>Interview Time</span><b>{candidate.interviewTime || 'TBD'}</b></div>
            <div className="profileItem"><span>Interviewer</span><b>{candidate.interviewer || 'HR Team'}</b></div>
            <div className="profileItem"><span>Interview Round</span><b>{candidate.round || 'HR Round'}</b></div>
            <div className="profileItem"><span>Interview Status</span><b>{candidate.status}</b></div>
            <div className="profileItem"><span>Follow-up Date</span><b>{candidate.followUpDate ? new Date(candidate.followUpDate).toLocaleDateString() : '-'}</b></div>
          </div>
        </div>

        {/* Joining & Documents Info */}
        <div className="profileSection">
          <h4><BriefcaseBusiness size={16} /> Joining & Onboarding Details</h4>
          <div className="profileGrid">
            <div className="profileItem"><span>Joining Status</span><b>{candidate.joiningStatus || 'Not Applicable'}</b></div>
            <div className="profileItem"><span>Joining Date</span><b>{candidate.joiningDate ? new Date(candidate.joiningDate).toLocaleDateString() : 'TBD'}</b></div>
            <div className="profileItem"><span>Salary / Stipend</span><b>{candidate.salaryOrStipend || 'Not set'}</b></div>
            <div className="profileItem"><span>Uploaded Documents</span><b>{(candidate.documents || []).length} file(s)</b></div>
            <div className="profileItem"><span>Meeting Proof Photos</span><b>{(candidate.meetingProofPhotos || []).length} photo(s)</b></div>
          </div>
        </div>

        {candidate.notes && (
          <div className="profileSection">
            <h4>Notes & Remarks</h4>
            <p style={{ margin: 0, fontSize: '13px', color: '#334155', whiteSpace: 'pre-wrap' }}>{candidate.notes}</p>
          </div>
        )}

        <div className="modalActions">
          <button className="actionBtn" onClick={() => { onClose(); onEdit(candidate); }}>
            <Edit size={14} /> Edit Candidate Data
          </button>
          <button className="actionBtn primary" onClick={() => { onClose(); onManageDocs(candidate); }}>
            <FileText size={14} /> Manage Documents ({(candidate.documents || []).length})
          </button>
          <button className="actionBtn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

function MeetingProof({ interview, reload }) {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [note, setNote] = useState(interview.proofNote || '');
  const [busy, setBusy] = useState(false);

  const uploadProof = async () => {
    if (!files.length) return alert('Select meeting proof photo first');
    setBusy(true);
    try {
      const fd = new FormData();
      [...files].forEach(f => fd.append('photos', f));
      fd.append('proofNote', note);
      const r = await fetch(API + '/interviews/' + interview._id + '/meeting-proof', { method: 'POST', body: fd });
      const data = await r.json();
      if (!r.ok) throw new Error(data.message || 'Upload failed');
      setFiles([]);
      setOpen(false);
      await reload();
    } catch (e) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="proofCell">
      <button className="proofBtn" onClick={() => setOpen(!open)}>
        <Camera size={15} />{(interview.meetingProofPhotos || []).length ? `${interview.meetingProofPhotos.length} Proof` : 'Add Proof'}
      </button>
      {(interview.meetingProofPhotos || []).length > 0 && (
        <div className="proofThumbs">
          {interview.meetingProofPhotos.slice(0, 3).map((u, i) => (
            <a key={u} href={SERVER + u} target="_blank" rel="noreferrer" title="Open meeting proof">
              <img src={SERVER + u} alt={`Meeting proof ${i + 1}`} />
            </a>
          ))}
        </div>
      )}
      {open && (
        <div className="proofPopover">
          <b>Interview Meeting Proof</b>
          <small>Upload Google Meet/meeting screenshot or interview photo. Max 5 images, 8 MB each.</small>
          <label className="uploadBox">
            <ImagePlus size={18} />Choose proof photos
            <input hidden type="file" accept="image/*" multiple onChange={e => setFiles(e.target.files)} />
          </label>
          {files.length > 0 && <small>{files.length} photo(s) selected</small>}
          <textarea rows="2" placeholder="Proof note (optional)" value={note} onChange={e => setNote(e.target.value)} />
          <div className="proofActions">
            <button onClick={() => setOpen(false)}>Cancel</button>
            <button className="primary" disabled={busy} onClick={uploadProof}>{busy ? 'Uploading...' : 'Upload Proof'}</button>
          </div>
          {interview.proofUploadedAt && <small>Last proof: {new Date(interview.proofUploadedAt).toLocaleString()}</small>}
        </div>
      )}
    </div>
  );
}

function EditInterviewModal({ interview, onClose, reload }) {
  const [f, setF] = useState({ ...interview });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API}/interviews/${interview._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(f)
      });
      if (!res.ok) throw new Error('Failed to update interview');
      await reload();
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modalOverlay">
      <div className="modal">
        <div className="modalHeader">
          <h3>Edit Interview & Candidate Details</h3>
          <button className="closeBtn" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="form">
          <div className="formgrid">
            {[
              ['candidateName', 'Candidate Name', 'text'],
              ['phone', 'Phone Number', 'text'],
              ['email', 'Email Address', 'email'],
              ['college', 'College / Institute', 'text'],
              ['interviewDate', 'Interview Date', 'date'],
              ['interviewTime', 'Interview Time', 'time'],
              ['googleMeetLink', 'Google Meet Link', 'url'],
              ['interviewer', 'Interviewer Name', 'text'],
              ['round', 'Interview Round', 'text'],
              ['joiningDate', 'Joining Date', 'date'],
              ['salaryOrStipend', 'Salary / Stipend', 'text'],
              ['followUpDate', 'Follow-up Date', 'date']
            ].map(([k, l, t]) => (
              <label key={k}>
                {l}
                <input
                  type={t}
                  value={f[k] || ''}
                  required={k === 'candidateName'}
                  onChange={e => setF({ ...f, [k]: e.target.value })}
                />
              </label>
            ))}
            <label>Role / Position
              <select value={f.role || 'Software Developer'} onChange={e => setF({ ...f, role: e.target.value })}>
                {['BDA', 'Software Developer', 'Java Developer', 'Python Developer', 'React Developer', 'Node.js Developer', 'HR', 'Other'].map(v => <option key={v}>{v}</option>)}
              </select>
            </label>
            <label>Interview Status
              <select value={f.status || 'Scheduled'} onChange={e => setF({ ...f, status: e.target.value })}>
                {['Scheduled', 'Completed', 'Selected', 'Rejected', 'No Show', 'On Hold', 'Pending'].map(v => <option key={v}>{v}</option>)}
              </select>
            </label>
            <label>Joining Status
              <select value={f.joiningStatus || 'Not Applicable'} onChange={e => setF({ ...f, joiningStatus: e.target.value })}>
                {['Not Applicable', 'Pending Joining', 'Joined', 'Declined'].map(v => <option key={v}>{v}</option>)}
              </select>
            </label>
          </div>
          <label style={{ marginTop: '12px' }}>Notes & Remarks
            <textarea rows="3" value={f.notes || ''} onChange={e => setF({ ...f, notes: e.target.value })} />
          </label>
          <div className="modalActions">
            <button type="button" className="actionBtn" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary" disabled={saving}>
              {saving ? 'Saving...' : 'Update Interview'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ProposalPanel({ props, reload }) {
  const emptyProp = {
    collegeName: '', district: '', principal: '', principalEmail: '', officePhone: '', contactPerson: '',
    phone: '', email: '', proposalType: 'Placement Drive', roles: 'Software Developer,BDA',
    followUpDate: '', status: 'Sent', mouStatus: 'Pending', seminarStatus: 'Scheduled', studentsRegistered: 0, remarks: ''
  };

  const [f, setF] = useState(emptyProp);
  const [editingProposal, setEditingProposal] = useState(null);

  const submitCreate = async e => {
    e.preventDefault();
    await fetch(API + '/proposals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...f, roles: f.roles.split(',').map(s => s.trim()) })
    });
    setF(emptyProp);
    reload();
  };

  const openEdit = (proposal) => {
    setEditingProposal({
      ...proposal,
      roles: Array.isArray(proposal.roles) ? proposal.roles.join(', ') : (proposal.roles || ''),
      followUpDate: proposal.followUpDate ? new Date(proposal.followUpDate).toISOString().split('T')[0] : ''
    });
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    await fetch(API + '/proposals/' + editingProposal._id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...editingProposal,
        roles: typeof editingProposal.roles === 'string' ? editingProposal.roles.split(',').map(s => s.trim()) : editingProposal.roles
      })
    });
    setEditingProposal(null);
    reload();
  };

  const deleteProposal = async (id) => {
    if (confirm('Are you sure you want to delete this proposal?')) {
      await fetch(API + '/proposals/' + id, { method: 'DELETE' });
      reload();
    }
  };

  return (
    <>
      <form className="panel form" onSubmit={submitCreate}>
        <h3>Send / Track College Proposal</h3>
        <div className="formgrid">
          {[
            ['collegeName', 'College Name', 'text'],
            ['district', 'District', 'text'],
            ['contactPerson', 'TPO Name', 'text'],
            ['phone', 'TPO Phone', 'text'],
            ['email', 'TPO Email', 'text'],
            ['roles', 'Roles Offered', 'text'],
            ['followUpDate', 'Follow-up Date', 'date']
          ].map(([k, l, t]) => (
            <label key={k}>
              {l}
              <input
                type={t}
                required={k === 'collegeName'}
                value={f[k]}
                onChange={e => setF({ ...f, [k]: e.target.value })}
              />
            </label>
          ))}
          <label>Proposal Type
            <select value={f.proposalType} onChange={e => setF({ ...f, proposalType: e.target.value })}>
              {['Placement Drive', 'Internship', 'BDA Hiring', 'Software Hiring', 'Campus Partnership'].map(v => <option key={v}>{v}</option>)}
            </select>
          </label>
          <label>Status
            <select value={f.status} onChange={e => setF({ ...f, status: e.target.value })}>
              {['Draft', 'Sent', 'Follow-up', 'Accepted', 'Rejected', 'Closed'].map(v => <option key={v}>{v}</option>)}
            </select>
          </label>
        </div>
        <button className="primary" style={{ marginTop: '14px' }}>Save Proposal</button>
      </form>

      <div className="panel">
        <h3>College Proposals ({props.length})</h3>
        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>College & District</th>
                <th>TPO / Contact</th>
                <th>Email</th>
                <th>Type & Roles</th>
                <th>Status</th>
                <th>MoU / Seminar</th>
                <th>Follow-up</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {props.map(p => (
                <tr key={p._id || p.collegeName}>
                  <td><b>{p.collegeName}</b>{p.district && <small><br />📍 {p.district}</small>}</td>
                  <td>{p.contactPerson || '-'}{p.phone && <small><br />📞 {p.phone}</small>}</td>
                  <td>{p.email ? <a href={`mailto:${p.email}`}>{p.email}</a> : '-'}</td>
                  <td>{p.proposalType}<small><br />{(p.roles || []).join(', ')}</small></td>
                  <td><span className={`badge ${p.status === 'Accepted' ? 'success' : p.status === 'Sent' ? 'info' : 'neutral'}`}>{p.status || 'Draft'}</span></td>
                  <td>{p.mouStatus || p.seminarStatus || '-'}{p.studentsRegistered ? ` (${p.studentsRegistered} students)` : ''}</td>
                  <td>{p.followUpDate ? new Date(p.followUpDate).toLocaleDateString() : '-'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="actionBtn" onClick={() => openEdit(p)} title="Edit Proposal">
                        <Edit size={14} /> Edit
                      </button>
                      <button className="icon danger" onClick={() => deleteProposal(p._id)} title="Delete Proposal">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingProposal && (
        <div className="modalOverlay">
          <div className="modal">
            <div className="modalHeader">
              <h3>Edit College Proposal</h3>
              <button className="closeBtn" onClick={() => setEditingProposal(null)}><X size={20} /></button>
            </div>
            <form onSubmit={saveEdit} className="form">
              <div className="formgrid">
                <label>College Name
                  <input type="text" required value={editingProposal.collegeName || ''} onChange={e => setEditingProposal({ ...editingProposal, collegeName: e.target.value })} />
                </label>
                <label>District
                  <input type="text" value={editingProposal.district || ''} onChange={e => setEditingProposal({ ...editingProposal, district: e.target.value })} />
                </label>
                <label>TPO / Contact Person
                  <input type="text" value={editingProposal.contactPerson || ''} onChange={e => setEditingProposal({ ...editingProposal, contactPerson: e.target.value })} />
                </label>
                <label>TPO Phone
                  <input type="text" value={editingProposal.phone || ''} onChange={e => setEditingProposal({ ...editingProposal, phone: e.target.value })} />
                </label>
                <label>TPO Email
                  <input type="email" value={editingProposal.email || ''} onChange={e => setEditingProposal({ ...editingProposal, email: e.target.value })} />
                </label>
                <label>Principal Name
                  <input type="text" value={editingProposal.principal || ''} onChange={e => setEditingProposal({ ...editingProposal, principal: e.target.value })} />
                </label>
                <label>Proposal Type
                  <select value={editingProposal.proposalType || 'Placement Drive'} onChange={e => setEditingProposal({ ...editingProposal, proposalType: e.target.value })}>
                    {['Placement Drive', 'Internship', 'BDA Hiring', 'Software Hiring', 'Campus Partnership'].map(v => <option key={v}>{v}</option>)}
                  </select>
                </label>
                <label>Proposal Status
                  <select value={editingProposal.status || 'Draft'} onChange={e => setEditingProposal({ ...editingProposal, status: e.target.value })}>
                    {['Draft', 'Sent', 'Follow-up', 'Accepted', 'Rejected', 'Closed'].map(v => <option key={v}>{v}</option>)}
                  </select>
                </label>
                <label>Roles Offered (comma separated)
                  <input type="text" value={editingProposal.roles || ''} onChange={e => setEditingProposal({ ...editingProposal, roles: e.target.value })} />
                </label>
                <label>MoU Status
                  <input type="text" placeholder="e.g. Signed / Pending" value={editingProposal.mouStatus || ''} onChange={e => setEditingProposal({ ...editingProposal, mouStatus: e.target.value })} />
                </label>
                <label>Seminar Status
                  <input type="text" placeholder="e.g. Completed / Scheduled" value={editingProposal.seminarStatus || ''} onChange={e => setEditingProposal({ ...editingProposal, seminarStatus: e.target.value })} />
                </label>
                <label>Students Registered
                  <input type="number" value={editingProposal.studentsRegistered || 0} onChange={e => setEditingProposal({ ...editingProposal, studentsRegistered: parseInt(e.target.value) || 0 })} />
                </label>
                <label>Follow-up Date
                  <input type="date" value={editingProposal.followUpDate || ''} onChange={e => setEditingProposal({ ...editingProposal, followUpDate: e.target.value })} />
                </label>
              </div>
              <label style={{ marginTop: '12px' }}>Remarks & Notes
                <textarea rows="3" value={editingProposal.remarks || ''} onChange={e => setEditingProposal({ ...editingProposal, remarks: e.target.value })} />
              </label>

              <div className="modalActions">
                <button type="button" onClick={() => setEditingProposal(null)} className="actionBtn">Cancel</button>
                <button type="submit" className="primary">Update Proposal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function JoinerPanel({ items, onManageDocs, onEditInterview, onViewCandidate }) {
  const [filter, setFilter] = useState('All');
  const joiners = useMemo(() => {
    return (items || []).filter(x => {
      if (filter === 'Pending Joining') return x.joiningStatus === 'Pending Joining';
      if (filter === 'Joined') return x.joiningStatus === 'Joined';
      return x.joiningStatus === 'Pending Joining' || x.joiningStatus === 'Joined';
    });
  }, [items, filter]);

  return (
    <div className="panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3>Joiners Onboarding & Document Uploads ({joiners.length})</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['All', 'Pending Joining', 'Joined'].map(f => (
            <button key={f} className={`actionBtn ${filter === f ? 'primary' : ''}`} onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {joiners.length === 0 ? (
        <p className="muted">No joiners found matching status "{filter}". Update candidate joining status to "Pending Joining" or "Joined" to manage onboarding documents.</p>
      ) : (
        joiners.map(j => (
          <div className="joinerCard" key={j._id}>
            <div className="joinerHeader">
              <div className="joinerTitle">
                <b className="candidateLink" onClick={() => onViewCandidate(j)}>{j.candidateName}</b>
                <small>{j.role} • {j.college}</small>
              </div>
              <span className={`badge ${j.joiningStatus === 'Joined' ? 'success' : 'warning'}`}>
                {j.joiningStatus}
              </span>
            </div>

            <div className="joinerDetails">
              <div><span>Email</span><b>{j.email || '-'}</b></div>
              <div><span>Phone</span><b>{j.phone || '-'}</b></div>
              <div><span>Joining Date</span><b>{j.joiningDate ? new Date(j.joiningDate).toLocaleDateString() : 'TBD'}</b></div>
              <div><span>Stipend / CTC</span><b>{j.salaryOrStipend || 'Not set'}</b></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <small style={{ color: '#475569' }}>
                📁 Uploaded Documents: <b>{(j.documents || []).length} file(s)</b>
              </small>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="actionBtn" onClick={() => onViewCandidate(j)}>
                  <Eye size={15} /> View Profile
                </button>
                {onEditInterview && (
                  <button className="actionBtn" onClick={() => onEditInterview(j)}>
                    <Edit size={15} /> Edit Candidate
                  </button>
                )}
                <button className="primary" onClick={() => onManageDocs(j)}>
                  <Upload size={16} /> Manage Joiner Documents
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function DocumentModal({ candidate, onClose, reload }) {
  const [docType, setDocType] = useState('Aadhaar Card');
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const docTypes = [
    'Aadhaar Card',
    'PAN Card',
    'Offer Letter',
    'Resume / CV',
    'Degree / Certificate',
    'Experience Letter',
    'Passport Photo',
    'Bank Passbook / Cheque',
    'Other'
  ];

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert('Please select a document file to upload');

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('documentFile', file);
      fd.append('documentType', docType);
      fd.append('title', title || file.name);

      const res = await fetch(`${API}/interviews/${candidate._id}/documents`, {
        method: 'POST',
        body: fd
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to upload document');

      setFile(null);
      setTitle('');
      await reload();
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDoc = async (docId) => {
    if (confirm('Are you sure you want to delete this document?')) {
      try {
        const res = await fetch(`${API}/interviews/${candidate._id}/documents/${docId}`, {
          method: 'DELETE'
        });
        if (!res.ok) throw new Error('Failed to delete document');
        await reload();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="modalOverlay">
      <div className="modal">
        <div className="modalHeader">
          <div>
            <h3>Joiner Document Vault: {candidate.candidateName}</h3>
            <small style={{ color: '#64748b' }}>{candidate.role} • {candidate.college}</small>
          </div>
          <button className="closeBtn" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleUpload} className="panel form" style={{ background: '#f8fafc', marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 12px' }}>Upload New Joiner Document</h4>
          <div className="formgrid">
            <label>Document Category
              <select value={docType} onChange={e => setDocType(e.target.value)}>
                {docTypes.map(d => <option key={d}>{d}</option>)}
              </select>
            </label>
            <label>Document Title / Label
              <input type="text" placeholder="e.g. Signed Offer Letter, Aadhaar Copy" value={title} onChange={e => setTitle(e.target.value)} />
            </label>
            <label>Choose File (PDF, Image, Doc)
              <input type="file" onChange={e => setFile(e.target.files[0])} required />
            </label>
          </div>
          <button className="primary" style={{ marginTop: '12px' }} disabled={uploading}>
            <Upload size={16} /> {uploading ? 'Uploading Document...' : 'Upload Document'}
          </button>
        </form>

        <h4 style={{ margin: '0 0 12px' }}>Uploaded Documents ({(candidate.documents || []).length})</h4>
        {!(candidate.documents || []).length ? (
          <p className="muted">No documents uploaded for this joiner yet.</p>
        ) : (
          <div className="docGrid">
            {candidate.documents.map(doc => (
              <div className="docItem" key={doc._id}>
                <div className="docMeta">
                  <div className="docIcon"><File size={20} /></div>
                  <div className="docInfo">
                    <b>{doc.title}</b>
                    <small>
                      <span className="badge info" style={{ marginRight: '6px' }}>{doc.documentType}</span>
                      Uploaded on {new Date(doc.uploadedAt).toLocaleDateString()}
                    </small>
                  </div>
                </div>
                <div className="docActions">
                  <a href={SERVER + doc.fileUrl} target="_blank" rel="noreferrer" className="actionBtn">
                    <Eye size={14} /> View / Download
                  </a>
                  <button className="actionBtn danger" onClick={() => handleDeleteDoc(doc._id)}>
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="modalActions">
          <button className="actionBtn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

function ReportPanel({ items, onViewCandidate }) {
  const today = new Date().toDateString();
  const rows = (items || []).filter(x => new Date(x.interviewDate).toDateString() === today);
  const count = s => rows.filter(x => x.status === s).length;
  return (
    <div className="panel">
      <h3>Today Summary</h3>
      <section className="cards mini">
        <div className="card"><strong>{rows.length}</strong><span>Total</span></div>
        <div className="card"><strong>{count('Selected')}</strong><span>Selected</span></div>
        <div className="card"><strong>{count('Rejected')}</strong><span>Rejected</span></div>
        <div className="card"><strong>{count('Scheduled') + count('Pending')}</strong><span>Pending</span></div>
      </section>
      <table>
        <thead>
          <tr>
            <th>Candidate</th>
            <th>Role</th>
            <th>Time</th>
            <th>Status</th>
            <th>Joining</th>
            <th>Remarks</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(x => (
            <tr key={x._id}>
              <td><b className="candidateLink" onClick={() => onViewCandidate(x)}>{x.candidateName}</b></td>
              <td>{x.role}</td>
              <td>{x.interviewTime}</td>
              <td>{x.status}</td>
              <td>{x.joiningStatus}</td>
              <td>{x.notes || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
