import bcrypt from 'bcryptjs';

const password = 'dam123'; // Password yang belum di-hash

bcrypt.hash(password, 10, (err, hashedPassword) => {
  if (err) {
    console.error('Error hashing password:', err);
    return;
  }
  console.log('Hashed password:', hashedPassword); // Menampilkan hasil hash password
});
