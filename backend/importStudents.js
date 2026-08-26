import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const interviewSchema = new mongoose.Schema({
  candidateName: { type: String, required: true },
  phone: String, email: String, college: String,
  role: { type: String, enum: ['BDA','Software Developer','Java Developer','Python Developer','React Developer','Node.js Developer','HR','Other'], default: 'BDA' },
  source: { type: String, default: 'Campus Placement' },
  interviewDate: { type: Date, required: true },
  interviewTime: String,
  googleMeetLink: String,
  interviewer: String,
  round: { type: String, default: 'Final Round' },
  status: { type: String, enum: ['Scheduled','Completed','Selected','Rejected','No Show','On Hold','Pending'], default: 'Selected' },
  joiningStatus: { type: String, enum: ['Not Applicable','Pending Joining','Joined','Declined'], default: 'Pending Joining' },
  joiningDate: Date,
  salaryOrStipend: String,
  notes: String,
  meetingProofPhotos: [{ type: String }],
  proofNote: String,
  proofUploadedAt: Date,
  followUpDate: Date,
  createdAt: { type: Date, default: Date.now }
});

const Interview = mongoose.model('Interview', interviewSchema);

const studentsData = [
  {
    candidateName: "Mangali Dungaram Choudhary",
    email: "mangalichoudhary383@gmail.com",
    phone: "8799969587",
    college: "Dhole Patil College of Engineering",
    role: "BDA",
    notes: "Offer Letter Sent. Target Base: Partially Ok with Target Base (Rating: 5/5)"
  },
  {
    candidateName: "Shoyab Raju Pathan",
    email: "shoyabpathan878@gmail.com",
    phone: "9552295428",
    college: "Dhole Patil College of Engineering",
    role: "BDA",
    notes: "Offer Letter Sent."
  },
  {
    candidateName: "Hariom Chilveri",
    email: "hariom.chilveri@gmail.com",
    phone: "7038935697",
    college: "NBN Sinhgad School Of Engineering",
    role: "BDA",
    notes: "Offer Letter Sent. Target Base: Okay with it (Very Confident) (Rating: 5/5)"
  },
  {
    candidateName: "Dnyaneshwari Sanjay Dandagawhal",
    email: "dandagawhaldnyaneshwari@gmail.com",
    phone: "9307293946",
    college: "Dhole Patil College of Engineering",
    role: "BDA",
    notes: "Offer Letter Sent."
  },
  {
    candidateName: "Vishal Ghuge",
    email: "vghuge662@gmail.com",
    phone: "7620290331",
    college: "Keystone School Of Engineering, Pune",
    role: "BDA",
    notes: "Offer Letter Sent. Target Base: Okay with It (Rating: 4/5)"
  },
  {
    candidateName: "Priyanka Uddhav Gaikwad",
    email: "priya937027@gmail.com",
    phone: "9370275325",
    college: "Keystone School Of Engineering, Pune",
    role: "BDA",
    notes: "Offer Letter Sent. Target Base: Okay with It (Rating: 3/5)"
  },
  {
    candidateName: "Anjali Ashok Gharde",
    email: "ghardeanjali05@gmail.com",
    phone: "9588679333",
    college: "Keystone School Of Engineering, Pune",
    role: "BDA",
    notes: "Offer Letter Sent. Target Base: Okay with It (Rating: 4/5)"
  },
  {
    candidateName: "Chetna Kishor Kothawade",
    email: "chetnakothawade@gmail.com",
    phone: "7020855433",
    college: "Dhole Patil College of Engineering",
    role: "BDA",
    notes: "Offer Letter Sent. Target Base: Okay with It (Rating: 4/5)"
  },
  {
    candidateName: "Kshitija Ramesh Rajpure",
    email: "rajpurekshitija@gmail.com",
    phone: "7823869957",
    college: "Dhole Patil College of Engineering",
    role: "BDA",
    notes: "Offer Letter Sent."
  },
  {
    candidateName: "Aishwarya Sudhir Sonawane",
    email: "aishwaryasonawane191627@gmail.com",
    phone: "9552038110",
    college: "Keystone School Of Engineering, Pune",
    role: "BDA",
    notes: "Offer Letter Sent."
  },
  {
    candidateName: "Ishwari Shankar Nanaware",
    email: "ishwarinanaware27@gmail.com",
    phone: "9284170733",
    college: "Keystone School Of Engineering, Pune",
    role: "BDA",
    notes: "Offer Letter Sent. Target Base: Okay with it (Rating: 3/5)"
  },
  {
    candidateName: "Arman Akil Momin",
    email: "armanmomin202@gmail.com",
    phone: "9322955240",
    college: "Keystone School Of Engineering, Pune",
    role: "BDA",
    notes: "Offer Letter Sent. Target Base: Okay with it (Rating: 3/5)"
  },
  {
    candidateName: "Renuka Jitendra Jadhav",
    email: "jadhavrenuka2020@gmail.com",
    phone: "9860824075",
    college: "Keystone School Of Engineering, Pune",
    role: "BDA",
    notes: "Offer Letter Sent. Target Base: Okay with it (Rating: 4.5/5)"
  },
  {
    candidateName: "Prafulla walunj",
    email: "prafullawalunj125@gmail.com",
    phone: "9322917438",
    college: "Dhole Patil College of Engineering",
    role: "Software Developer",
    notes: "Offer Letter Sent. Interested in Software"
  },
  {
    candidateName: "Kirti Lahanu Datir",
    email: "kirtidatir2004@gmail.com",
    phone: "9156021021",
    college: "Dhole Patil College of Engineering",
    role: "BDA",
    notes: "Offer Letter Sent."
  },
  {
    candidateName: "Shital Kantilal Bhade hade",
    email: "shitalbhade74@gmail.com",
    phone: "8830292849",
    college: "Dhole Patil College of Engineering",
    role: "BDA",
    notes: "Offer Letter Sent."
  },
  {
    candidateName: "Disha Rajendra Kale",
    email: "kaledisha868@gmail.com",
    phone: "8767416802",
    college: "Keystone School Of Engineering, Pune",
    role: "BDA",
    notes: "Offer Letter Sent. Target Base: Okay with it (Rating: 4.5/5)"
  }
];

async function run() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://mailblast:Aparaitech2129@ac-rl6rdwo-shard-00-00.kmi9oku.mongodb.net:27017,ac-rl6rdwo-shard-00-01.kmi9oku.mongodb.net:27017,ac-rl6rdwo-shard-00-02.kmi9oku.mongodb.net:27017/?ssl=true&replicaSet=atlas-3ebffw-shard-0&authSource=admin&appName=Cluster0';
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(mongoUri);
  console.log('Connected!');

  let count = 0;
  for (const student of studentsData) {
    await Interview.updateOne(
      { email: student.email },
      { 
        $set: {
          ...student,
          status: 'Selected',
          joiningStatus: 'Pending Joining',
          joiningDate: new Date('2026-06-02'),
          interviewDate: new Date(),
          round: 'Final Round',
          source: 'Campus Placement'
        } 
      },
      { upsert: true }
    );
    count++;
  }

  console.log(`SUCCESS: Imported ${count} selected student records into MongoDB.`);
  process.exit(0);
}

run().catch(err => {
  console.error('Import error:', err);
  process.exit(1);
});
