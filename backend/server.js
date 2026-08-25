import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import morgan from 'morgan';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, 'uploads', 'meeting-proofs');
fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadsDir),
  filename: (_, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${Math.round(Math.random()*1e9)}-${safe}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024, files: 5 },
  fileFilter: (_, file, cb) => file.mimetype.startsWith('image/') ? cb(null, true) : cb(new Error('Only image files are allowed'))
});

const interviewSchema = new mongoose.Schema({
  candidateName: { type: String, required: true },
  phone: String, email: String, college: String,
  role: { type: String, enum: ['BDA','Software Developer','Java Developer','Python Developer','React Developer','Node.js Developer','HR','Other'], default: 'Software Developer' },
  source: { type: String, default: 'Direct' },
  interviewDate: { type: Date, required: true },
  interviewTime: String,
  googleMeetLink: String,
  interviewer: String,
  round: { type: String, default: 'HR Round' },
  status: { type: String, enum: ['Scheduled','Completed','Selected','Rejected','No Show','On Hold','Pending'], default: 'Scheduled' },
  joiningStatus: { type: String, enum: ['Not Applicable','Pending Joining','Joined','Declined'], default: 'Not Applicable' },
  joiningDate: Date,
  salaryOrStipend: String,
  notes: String,
  meetingProofPhotos: [{ type: String }],
  proofNote: String,
  proofUploadedAt: Date,
  followUpDate: Date,
  createdAt: { type: Date, default: Date.now }
});

const proposalSchema = new mongoose.Schema({
  collegeName: { type: String, required: true },
  district: String,
  principal: String,
  principalEmail: String,
  officePhone: String,
  contactPerson: String,
  phone: String,
  email: String,
  seminarStatus: String,
  mouStatus: String,
  studentsRegistered: { type: Number, default: 0 },
  proposalType: { type: String, enum: ['Placement Drive','Internship','BDA Hiring','Software Hiring','Campus Partnership'], default: 'Placement Drive' },
  roles: { type: [String], default: ['Software Developer', 'BDA'] },
  sentDate: { type: Date, default: Date.now },
  followUpDate: Date,
  status: { type: String, enum: ['Draft','Sent','Follow-up','Accepted','Rejected','Closed'], default: 'Draft' },
  remarks: String,
  createdAt: { type: Date, default: Date.now }
});

const Interview = mongoose.model('Interview', interviewSchema);
const Proposal = mongoose.model('Proposal', proposalSchema);

app.get('/api/health', (req,res)=>res.json({ok:true, service:'HR Interview CRM'}));

app.get('/api/interviews', async (req,res)=>{
  const { status, role, from, to, search } = req.query;
  const q = {};
  if(status) q.status = status;
  if(role) q.role = role;
  if(from || to){ q.interviewDate = {}; if(from) q.interviewDate.$gte = new Date(from); if(to) q.interviewDate.$lte = new Date(to); }
  if(search) q.$or = [
    {candidateName: {$regex:search,$options:'i'}}, {phone: {$regex:search,$options:'i'}},
    {email: {$regex:search,$options:'i'}}, {college: {$regex:search,$options:'i'}}
  ];
  res.json(await Interview.find(q).sort({interviewDate:-1, createdAt:-1}));
});
app.post('/api/interviews', async (req,res)=>res.status(201).json(await Interview.create(req.body)));
app.put('/api/interviews/:id', async (req,res)=>res.json(await Interview.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true})));
app.delete('/api/interviews/:id', async (req,res)=>{ await Interview.findByIdAndDelete(req.params.id); res.json({ok:true}); });

app.post('/api/interviews/:id/meeting-proof', upload.array('photos', 5), async (req,res)=>{
  const interview = await Interview.findById(req.params.id);
  if(!interview) return res.status(404).json({message:'Interview not found'});
  const urls = (req.files || []).map(f => `/uploads/meeting-proofs/${f.filename}`);
  if(!urls.length) return res.status(400).json({message:'Please select at least one proof photo'});
  interview.meetingProofPhotos = [...(interview.meetingProofPhotos || []), ...urls];
  if(req.body.proofNote !== undefined) interview.proofNote = req.body.proofNote;
  interview.proofUploadedAt = new Date();
  await interview.save();
  res.json(interview);
});

app.delete('/api/interviews/:id/meeting-proof', async (req,res)=>{
  const { photo } = req.body || {};
  const interview = await Interview.findById(req.params.id);
  if(!interview) return res.status(404).json({message:'Interview not found'});
  interview.meetingProofPhotos = (interview.meetingProofPhotos || []).filter(x => x !== photo);
  if(photo && photo.startsWith('/uploads/')) {
    const localPath = path.join(__dirname, photo.replace(/^\/uploads\//,''));
    if(fs.existsSync(localPath)) fs.unlinkSync(localPath);
  }
  await interview.save();
  res.json(interview);
});

app.get('/api/proposals', async (req,res)=>res.json(await Proposal.find().sort({createdAt:-1})));
app.post('/api/proposals', async (req,res)=>res.status(201).json(await Proposal.create(req.body)));
app.put('/api/proposals/:id', async (req,res)=>res.json(await Proposal.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true})));
app.delete('/api/proposals/:id', async (req,res)=>{ await Proposal.findByIdAndDelete(req.params.id); res.json({ok:true}); });

app.get('/api/dashboard', async (req,res)=>{
  const start = new Date(); start.setHours(0,0,0,0); const end = new Date(); end.setHours(23,59,59,999);
  const [total, today, pending, selected, rejected, pendingJoining, joined, noShow, proposals, acceptedProposals] = await Promise.all([
    Interview.countDocuments(), Interview.countDocuments({interviewDate:{$gte:start,$lte:end}}),
    Interview.countDocuments({status:{$in:['Scheduled','Pending','On Hold']}}), Interview.countDocuments({status:'Selected'}),
    Interview.countDocuments({status:'Rejected'}), Interview.countDocuments({joiningStatus:'Pending Joining'}),
    Interview.countDocuments({joiningStatus:'Joined'}), Interview.countDocuments({status:'No Show'}), Proposal.countDocuments(), Proposal.countDocuments({status:'Accepted'})
  ]);
  const byRole = await Interview.aggregate([{ $group:{_id:'$role',count:{$sum:1}} },{$sort:{count:-1}}]);
  const upcoming = await Interview.find({interviewDate:{$gte:new Date()}}).sort({interviewDate:1}).limit(8);
  const followUps = await Interview.find({followUpDate:{$ne:null}}).sort({followUpDate:1}).limit(8);
  res.json({total,today,pending,selected,rejected,pendingJoining,joined,noShow,proposals,acceptedProposals,byRole,upcoming,followUps});
});

app.get('/api/reports/daily', async (req,res)=>{
  const date = req.query.date ? new Date(req.query.date) : new Date();
  const start = new Date(date); start.setHours(0,0,0,0); const end = new Date(date); end.setHours(23,59,59,999);
  const rows = await Interview.find({interviewDate:{$gte:start,$lte:end}}).sort({interviewTime:1});
  const summary = rows.reduce((a,r)=>{ a.total++; a[r.status]=(a[r.status]||0)+1; if(r.joiningStatus==='Pending Joining') a.pendingJoining++; if(r.joiningStatus==='Joined') a.joined++; return a; },{total:0,pendingJoining:0,joined:0});
  res.json({date:start,summary,rows});
});

const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGO_URI || 'mongodb://mailblast:Aparaitech2129@ac-rl6rdwo-shard-00-00.kmi9oku.mongodb.net:27017,ac-rl6rdwo-shard-00-01.kmi9oku.mongodb.net:27017,ac-rl6rdwo-shard-00-02.kmi9oku.mongodb.net:27017/?ssl=true&replicaSet=atlas-3ebffw-shard-0&authSource=admin&appName=Cluster0';

let isDbConnected = false;
async function connectDB() {
  if (isDbConnected && mongoose.connection.readyState === 1) return;
  try {
    await mongoose.connect(mongoUri);
    isDbConnected = true;
    console.log('Connected to MongoDB Atlas');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
  }
}

app.use(async (req, res, next) => {
  await connectDB();
  next();
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  connectDB().then(() => {
    app.listen(port, () => console.log(`HR Interview CRM backend running on http://localhost:${port}`));
  });
}

export default app;
