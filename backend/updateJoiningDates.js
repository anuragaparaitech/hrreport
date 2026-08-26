import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const interviewSchema = new mongoose.Schema({
  candidateName: String,
  joiningStatus: String,
  joiningDate: Date
}, { strict: false });

const Interview = mongoose.model('Interview', interviewSchema);

async function run() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://mailblast:Aparaitech2129@ac-rl6rdwo-shard-00-00.kmi9oku.mongodb.net:27017,ac-rl6rdwo-shard-00-01.kmi9oku.mongodb.net:27017,ac-rl6rdwo-shard-00-02.kmi9oku.mongodb.net:27017/?ssl=true&replicaSet=atlas-3ebffw-shard-0&authSource=admin&appName=Cluster0';
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(mongoUri);
  console.log('Connected!');

  const june2Date = new Date('2026-06-02T00:00:00.000Z');

  const result = await Interview.updateMany(
    { 
      $or: [
        { joiningStatus: { $in: ['Pending Joining', 'Joined'] } },
        { status: 'Selected' }
      ]
    },
    { 
      $set: { joiningDate: june2Date } 
    }
  );

  console.log(`SUCCESS: Updated ${result.modifiedCount} candidate joining dates to 02 June 2026.`);
  process.exit(0);
}

run().catch(err => {
  console.error('Update error:', err);
  process.exit(1);
});
