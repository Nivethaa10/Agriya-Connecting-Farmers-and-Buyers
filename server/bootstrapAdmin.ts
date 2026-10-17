import dotenv from 'dotenv';
import { connectDB, disconnectDB } from './db.ts';
import { User } from './models/User.ts';

dotenv.config();

async function bootstrapAdmin() {
  const email = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.INITIAL_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('Set INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD before running admin:bootstrap.');
  }
  if (password.length < 12) {
    throw new Error('INITIAL_ADMIN_PASSWORD must be at least 12 characters.');
  }

  await connectDB();

  const user = await User.findOne({ email }).select('+password');
  if (user && user.role !== 'admin') {
    throw new Error('The configured email belongs to a non-admin account.');
  }

  if (user) {
    user.password = password;
    await user.save();
    console.log('Admin password reset successfully.');
    return;
  }

  const name = process.env.INITIAL_ADMIN_NAME?.trim();
  const phone = process.env.INITIAL_ADMIN_PHONE?.trim();
  if (!name || !phone) {
    throw new Error('To create a new admin, also set INITIAL_ADMIN_NAME and INITIAL_ADMIN_PHONE.');
  }

  await User.create({
    name,
    email,
    phone,
    password,
    role: 'admin',
    isActive: true,
  });
  console.log('Admin account created successfully.');
}

bootstrapAdmin()
  .catch((err: unknown) => {
    const errorName = err instanceof Error ? err.name : 'Error';
    console.error(`Admin bootstrap failed (${errorName}). No credential values were logged.`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDB();
  });
