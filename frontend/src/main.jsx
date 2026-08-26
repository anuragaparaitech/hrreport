import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  CalendarDays, Users, UserCheck, Clock, BriefcaseBusiness, Link2, Plus, Search,
  Building2, FileText, CheckCircle2, XCircle, RefreshCcw, Trash2, Camera, ImagePlus,
  ExternalLink, Edit, Lock, LogOut, Upload, File, Eye, Download, ShieldCheck, User, X
} from 'lucide-react';
import './styles.css';

const API = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api');
const SERVER = API.replace(/\/api\/?$/, '');

const emptyInterview = {
  candidateName: '', phone: '', email: '', college: '', role: 'Software Developer', source: 'Direct',
  interviewDate: '', interviewTime: '', googleMeetLink: '', interviewer: '', round: 'HR Round',
  status: 'Scheduled', joiningStatus: 'Not Applicable', joiningDate: '', salaryOrStipend: '', notes: '', followUpDate: ''
};

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
    const saved = localStorage.getItem('crm_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('crm_token') || '');

  const [tab, setTab] = useState('dashboard');
  const [dash, setDash] = useState({});
  const [items, setItems] = useState([]);
  const [props, setProps] = useState([]);
  const [form, setForm] = useState(emptyInterview);
  const [search, setSearch] = useState('');
  const [selectedCandidateForDocs, setSelectedCandidateForDocs] = useState(null);
  const [editingInterview, setEditingInterview] = useState(null);

  const handleLogin = (loggedUser, authToken) => {
    setUser(loggedUser);
    setToken(authToken);
    localStorage.setItem('crm_user', JSON.stringify(loggedUser));
    localStorage.setItem('crm_token', authToken);
  };

  const handleLogout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('crm_user');
    localStorage.removeItem('crm_token');
  };

  const load = async () => {
    try {
      const [d, i, p] = await Promise.all([
        fetch(API + '/dashboard').then(r => r.json()),
        fetch(API + '/interviews').then(r => r.json()),
        fetch(API + '/proposals').then(r => r.json())
      ]);
      setDash(d);
      setItems(i);
      setProps(p);
      if (selectedCandidateForDocs) {
        const updatedDocCand = i.find(x => x._id === selectedCandidateForDocs._id);
        if (updatedDocCand) setSelectedCandidateForDocs(updatedDocCand);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (user) load();
  }, [user]);

  const filtered = useMemo(() => items.filter(x =>
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
      <aside>
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
          <button className={tab === k ? 'active' : ''} onClick={() => setTab(k)} key={k}>{l}</button>
        ))}

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
          <div style={{ display: 'flex', gap: '10px' }}>
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
                      <b>{x.candidateName}</b>
                      <small>{x.role} • {new Date(x.interviewDate).toLocaleDateString()} {x.interviewTime}</small>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button className="actionBtn" onClick={() => openEditInterview(x)} title="Edit Candidate">
                        <Edit size={14} />
                      </button>
                      {x.googleMeetLink ? (
                        <a href={x.googleMeetLink} target="_blank" rel="noreferrer"><Link2 size={16} /> Meet</a>
                      ) : <span className="muted">No link</span>}
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
                    <th>Meet</th>
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
                      <td><b>{x.candidateName}</b><small>{x.phone}<br />{x.college}</small></td>
                      <td>{x.role}<small>{x.round}</small></td>
                      <td>{new Date(x.interviewDate).toLocaleDateString()}<small>{x.interviewTime}</small></td>
                      <td>{x.googleMeetLink ? <a href={x.googleMeetLink} target="_blank" rel="noreferrer">Open Meet</a> : '-'}</td>
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
                          <button className="actionBtn" onClick={() => openEditInterview(x)} title="Edit Interview">
                            <Edit size={14} /> Edit
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

        {tab === 'joiners' && <JoinerPanel items={items} onManageDocs={setSelectedCandidateForDocs} onEditInterview={openEditInterview} />}

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
        {tab === 'reports' && <ReportPanel items={items} />}

        {selectedCandidateForDocs && (
          <DocumentModal candidate={selectedCandidateForDocs} onClose={() => setSelectedCandidateForDocs(null)} reload={load} />
        )}

        {editingInterview && (
          <EditInterviewModal interview={editingInterview} onClose={() => setEditingInterview(null)} reload={load} />
        )}
      </main>
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

function JoinerPanel({ items, onManageDocs, onEditInterview }) {
  const [filter, setFilter] = useState('All');
  const joiners = useMemo(() => {
    return items.filter(x => {
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
                <b>{j.candidateName}</b>
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

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <small style={{ color: '#475569' }}>
                📁 Uploaded Documents: <b>{(j.documents || []).length} file(s)</b>
              </small>
              <div style={{ display: 'flex', gap: '8px' }}>
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

function ReportPanel({ items }) {
  const today = new Date().toDateString();
  const rows = items.filter(x => new Date(x.interviewDate).toDateString() === today);
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
              <td>{x.candidateName}</td>
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

createRoot(document.getElementById('root')).render(<App />);
