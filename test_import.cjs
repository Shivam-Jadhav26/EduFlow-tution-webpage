const fs = require('fs');
const xlsx = require('xlsx');
const mongoose = require('mongoose');
const User = require('./backend/src/models/User');
const Batch = require('./backend/src/models/Batch');

mongoose.connect('mongodb+srv://shivamaj2005_db_user:masterop@astroid99.a8couem.mongodb.net/eduflow?retryWrites=true&w=majority')
  .then(async () => {
    try {
      const workbook = xlsx.readFile('D:/indian_students_import.xlsx');
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(sheet);

      const allBatches = await Batch.find({ isActive: true });
      const batchLookup = {};
      allBatches.forEach(b => {
        batchLookup[b.name.toLowerCase().trim()] = b._id;
      });

      const results = { success: 0, failed: 0, skipped: 0, errors: [] };

      for (let index = 0; index < data.length; index++) {
        const row = data[index];
        try {
          const name = row.Name || row.name || row['Full Name'];
          const email = row.Email || row.email;
          const password = row.Password || row.password || 'EduFlow@123';
          const gender = (row.Gender || row.gender || 'other').toLowerCase();
          const studentClass = row.Class || row.class || row.Grade || row.grade;
          const batchName = row.Batch || row.batch;
          const phone = row.Phone || row.phone;
          const parentName = row.ParentName || row.parentName || row['Parent Name'];
          const parentPhone = row.ParentPhone || row.parentPhone || row['Parent Phone'];

          if (!name || !email) {
            results.failed++;
            results.errors.push(`Row ${index + 2}: Name and Email are required.`);
            continue;
          }

          const existing = await User.findOne({ email });
          if (existing) {
            results.skipped++;
            continue;
          }

          let batchId = null;
          if (batchName) {
            batchId = batchLookup[batchName.toLowerCase().trim()] || null;
          }

          await User.create({
            name,
            email,
            passwordHash: password,
            gender: ['male', 'female', 'other'].includes(gender) ? gender : 'other',
            role: 'student',
            class: String(studentClass || ''),
            batch: batchId,
            phone: String(phone || ''),
            parentName: String(parentName || ''),
            parentPhone: String(parentPhone || ''),
            status: 'active'
          });

          results.success++;
        } catch (err) {
          results.failed++;
          results.errors.push(`Row ${index + 2}: ${err.message}`);
        }
      }

      console.log(JSON.stringify(results, null, 2));
    } catch(e) {
      console.error('Outer error:', e);
    }
    process.exit(0);
  });
