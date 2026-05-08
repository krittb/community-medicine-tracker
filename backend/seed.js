require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');
const Medicine = require('./models/Medicine');

const seed = async () => {
  await connectDB();
  await User.deleteMany({});
  await Medicine.deleteMany({});

  const users = [
    { name: 'Admin User', email: 'admin@demo.com', password: 'password123', role: 'admin', phone: '9000000001' },
    { name: 'Dr. Priya Sharma', email: 'doctor@demo.com', password: 'password123', role: 'doctor', phone: '9000000002', specialization: 'General Physician' },
    { name: 'Dr. Rajan Mehta', email: 'doctor2@demo.com', password: 'password123', role: 'doctor', phone: '9000000003', specialization: 'Paediatrician' },
    { name: 'Arjun Pharmacist', email: 'pharma@demo.com', password: 'password123', role: 'pharmacist', phone: '9000000004' },
    { name: 'Rahul Kumar', email: 'patient@demo.com', password: 'password123', role: 'patient', phone: '9000000005', age: 32, gender: 'male' },
    { name: 'Sneha Patel', email: 'patient2@demo.com', password: 'password123', role: 'patient', phone: '9000000006', age: 27, gender: 'female' },
  ];

  for (const u of users) {
    const salt = await bcrypt.genSalt(10);
    u.password = await bcrypt.hash(u.password, salt);
  }
  await User.insertMany(users, { validateBeforeSave: false });

  const medicines = [
    { name: 'Paracetamol 500mg', category: 'analgesic', quantity: 500, unit: 'tablets', threshold: 50, manufacturer: 'Sun Pharma', price: 2 },
    { name: 'Amoxicillin 250mg', category: 'antibiotic', quantity: 200, unit: 'capsules', threshold: 30, manufacturer: 'Cipla', price: 8 },
    { name: 'Cetirizine 10mg', category: 'antihistamine', quantity: 8, unit: 'tablets', threshold: 20, manufacturer: 'Mankind', price: 3 },
    { name: 'Omeprazole 20mg', category: 'antacid', quantity: 0, unit: 'capsules', threshold: 25, manufacturer: 'Zydus', price: 5 },
    { name: 'Azithromycin 500mg', category: 'antibiotic', quantity: 150, unit: 'tablets', threshold: 20, manufacturer: 'Cipla', price: 15 },
    { name: 'Vitamin C 500mg', category: 'vitamin', quantity: 300, unit: 'tablets', threshold: 40, manufacturer: 'Abbott', price: 4 },
    { name: 'Metformin 500mg', category: 'other', quantity: 12, unit: 'tablets', threshold: 50, manufacturer: 'USV', price: 3 },
    { name: 'Pantoprazole 40mg', category: 'antacid', quantity: 180, unit: 'tablets', threshold: 30, manufacturer: 'Sun Pharma', price: 6 },
    { name: 'Dolo 650mg', category: 'analgesic', quantity: 400, unit: 'tablets', threshold: 60, manufacturer: 'Micro Labs', price: 3 },
    { name: 'Ibuprofen 400mg', category: 'analgesic', quantity: 250, unit: 'tablets', threshold: 40, manufacturer: 'Cipla', price: 5 },
    { name: 'Aspirin 75mg', category: 'analgesic', quantity: 320, unit: 'tablets', threshold: 40, manufacturer: 'Bayer', price: 2 },
    { name: 'Metronidazole 400mg', category: 'antibiotic', quantity: 180, unit: 'tablets', threshold: 25, manufacturer: 'Cipla', price: 6 },
    { name: 'Zinc Supplement', category: 'supplement', quantity: 5, unit: 'tablets', threshold: 30, manufacturer: 'Abbott', price: 4 },
  ];
  await Medicine.insertMany(medicines);

  console.log('✅ Database seeded successfully');
  console.log('Demo accounts:');
  console.log('  admin@demo.com / password123');
  console.log('  doctor@demo.com / password123');
  console.log('  pharma@demo.com / password123');
  console.log('  patient@demo.com / password123');
  process.exit(0);
};

seed().catch(e => { console.error(e); process.exit(1); });
