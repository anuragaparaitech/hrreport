import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

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

const Proposal = mongoose.model('Proposal', proposalSchema);

const rawData = [
  {
    collegeName: "Example College",
    district: "Example District",
    principal: "Dr. A. Sharma",
    principalEmail: "principal@example.edu",
    officePhone: "0123-456789",
    contactPerson: "Mr. R. Verma",
    phone: "9876543210",
    email: "tpo@example.edu",
    seminarStatus: "Scheduled",
    status: "Sent",
    followUpDate: new Date("2026-08-15"),
    mouStatus: "Pending",
    studentsRegistered: 45
  },
  {
    collegeName: "Government College of Engineering, Amravati",
    district: "Amravati",
    contactPerson: "Dr. Kawita D Thakur",
    email: "dean.tnp@gcoea.ac.in",
    status: "Sent"
  },
  {
    collegeName: "Sant Gadge Baba Amravati University, Amravati",
    district: "Amravati",
    status: "Draft"
  },
  {
    collegeName: "Government College of Engineering, Yavatmal",
    district: "Yavatmal",
    contactPerson: "Prof. M.J.Deshmukh (T.P.O)",
    phone: "9860449811",
    email: "tpogcoey@gcoey.ac.in",
    status: "Sent"
  },
  {
    collegeName: "Shri Sant Gajanan Maharaj College of Engineering, Shegaon",
    district: "Shegaon",
    contactPerson: "Mr. Adesh Solanke",
    phone: "9422926420",
    email: "placements@ssgmce.ac.in, absolanke@ssgmce.ac.in",
    status: "Sent",
    followUpDate: new Date("2026-08-08")
  },
  {
    collegeName: "Prof. Ram Meghe Institute of Technology & Research, Amravati",
    district: "Amravati",
    contactPerson: "Dr. Nikkoo Khalsa",
    phone: "9823793943",
    email: "principal@mitra.ac.in",
    status: "Sent"
  },
  {
    collegeName: "P. R. Pote Patil College of Engineering & Management, Amravati",
    district: "Amravati",
    contactPerson: "Prof. Laxmikant S. Bhattad",
    phone: "9860076591",
    email: "deantnp@prpotepatilengg.ac.in",
    status: "Sent"
  },
  {
    collegeName: "Sipna Shikshan Prasarak Mandal College of Engineering & Technology, Amravati",
    district: "Amravati",
    contactPerson: "Dr. Pawan G. Deshmukh",
    phone: "9420186398",
    email: "tpo.sipna@gmail.com",
    status: "Sent"
  },
  {
    collegeName: "Shri Shivaji Education Society's College of Engineering and Technology, Akola",
    district: "Akola",
    contactPerson: "Dr. S. K. AGRAWAL",
    phone: "9960590205",
    email: "tpo@coeta.ac.in",
    status: "Sent"
  },
  {
    collegeName: "Janata Shikshan Prasarak Mandals Babasaheb Naik College Of Engineering, Pusad",
    district: "Pusad",
    contactPerson: "Dr. Sanjay S. Bhagwat",
    phone: "9921418998",
    email: "tandp@bncoepusad.ac.in, tandp_bnce@rediffmail.com",
    status: "Sent"
  },
  {
    collegeName: "ANURADHA COLLEGE OF ENGINEERING & TECHNOLOGY",
    contactPerson: "Dr. Lokesh T. Lonare",
    phone: "84338 85867",
    status: "Draft"
  },
  {
    collegeName: "Jawaharlal Darda Institute of Engineering and Technology, Yavatmal",
    contactPerson: "Mr. M. K. Popat",
    phone: "9096746855",
    email: "tpo@jdiet.ac.in",
    status: "Sent"
  },
  {
    collegeName: "Shri Hanuman Vyayam Prasarak Mandals College of Engineering & Technology, Amravati",
    district: "Amravati",
    contactPerson: "Mr. Jaicky R. Sancheti",
    phone: "9028673739",
    email: "tpohvpmcoet@gmail.com",
    status: "Sent"
  },
  {
    collegeName: "Dr. Rajendra Gode Institute of Technology & Research, Amravati",
    contactPerson: "Prof. A. A. Shahade",
    phone: "8888137777",
    email: "tpoibsscoe@gmail.com",
    status: "Sent"
  },
  {
    collegeName: "Dwarka Bahu Uddeshiya Gramin Vikas Foundation, Rajarshi Shahu College of Engineering, Buldhana",
    contactPerson: "Prof. Mohsin M. Khan",
    phone: "7387272641",
    email: "tpo.rsce.2008@gmail.com",
    status: "Draft"
  },
  {
    collegeName: "Takshashila Institute of Engineering & Technology, Darapur, Amravati",
    status: "Draft"
  },
  {
    collegeName: "Jagadambha Bahuuddeshiya Gramin Vikas Sanstha's Jagdambha College of Engineering and Technology, Yavatmal",
    status: "Draft"
  },
  {
    collegeName: "Prof Ram Meghe College of Engineering and Management, Badnera",
    status: "Draft"
  },
  {
    collegeName: "Vision Buldhana Educational & Welfare Society's Pankaj Laddhad Institute of Technology & Management Studies, Yelgaon",
    status: "Draft"
  },
  {
    collegeName: "Sanmati Engineering College, Sawargaon Barde, Washim",
    status: "Draft"
  }
];

async function run() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://mailblast:Aparaitech2129@ac-rl6rdwo-shard-00-00.kmi9oku.mongodb.net:27017,ac-rl6rdwo-shard-00-01.kmi9oku.mongodb.net:27017,ac-rl6rdwo-shard-00-02.kmi9oku.mongodb.net:27017/?ssl=true&replicaSet=atlas-3ebffw-shard-0&authSource=admin&appName=Cluster0';
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(mongoUri);
  console.log('Connected!');

  let count = 0;
  for (const item of rawData) {
    await Proposal.updateOne(
      { collegeName: item.collegeName },
      { $set: item },
      { upsert: true }
    );
    count++;
  }

  console.log(`SUCCESS: Imported ${count} college proposals into MongoDB.`);
  process.exit(0);
}

run().catch(err => {
  console.error('Import error:', err);
  process.exit(1);
});
