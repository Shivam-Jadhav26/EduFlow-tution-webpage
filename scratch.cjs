const mongoose = require('mongoose');
require('dotenv').config();
const Batch = require('./backend/src/models/Batch');

async function test() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://shiva:Shivalika2808@cluster1.a8couem.mongodb.net/eduflow?retryWrites=true&w=majority');
  const b = await Batch.find({});
  console.log(b.map(x => ({name: x.name, class: x.class})));
  process.exit();
}
test();
