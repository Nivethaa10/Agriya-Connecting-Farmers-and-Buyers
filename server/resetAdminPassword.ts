import { emitKeypressEvents } from 'node:readline';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { connectDB, dbStatus, disconnectDB } from './db.ts';
import { User } from './models/User.ts';

function readPassword(prompt: string): Promise<string> {
  if (!process.stdin.isTTY || !process.stdin.setRawMode) {
    return Promise.reject(new Error('Run admin:reset from an interactive terminal.'));
  }

  return new Promise((resolve, reject) => {
    const input = process.stdin;
    let password = '';

    const cleanup = () => {
      input.removeListener('keypress', onKeypress);
      input.setRawMode(false);
      input.pause();
    };

    const onKeypress = (value: string, key: { name?: string; ctrl?: boolean }) => {
      if (key.ctrl && key.name === 'c') {
        cleanup();
        process.stdout.write('\n');
        reject(new Error('Password reset cancelled.'));
        return;
      }
      if (key.name === 'return' || key.name === 'enter') {
        cleanup();
        process.stdout.write('\n');
        resolve(password);
        return;
      }
      if (key.name === 'backspace') {
        password = password.slice(0, -1);
        return;
      }
      if (!key.ctrl && value) {
        password += value;
      }
    };

    process.stdout.write(prompt);
    emitKeypressEvents(input);
    input.setRawMode(true);
    input.resume();
    input.on('keypress', onKeypress);
  });
}

async function resetAdminPassword() {
  dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)) });

  const email = (process.env.INITIAL_ADMIN_EMAIL || 'admin@agriya.org').trim().toLowerCase();
  const environmentPassword = process.env.AGRIYA_ADMIN_RESET_PASSWORD;
  let password: string;

  if (environmentPassword !== undefined && environmentPassword.length > 0) {
    password = environmentPassword;
  } else {
    if (!process.stdin.isTTY || !process.stdin.setRawMode) {
      throw new Error(
        'Set AGRIYA_ADMIN_RESET_PASSWORD to a password of at least 12 characters, then rerun admin:reset.'
      );
    }

    password = await readPassword(`New password for ${email}: `);
    const confirmation = await readPassword('Confirm new password: ');
    if (password !== confirmation) {
      throw new Error('Passwords do not match.');
    }
  }

  if (password.length < 12) {
    throw new Error('Password must be at least 12 characters.');
  }

  await connectDB();

  const admin = await User.findOne({ email }).select('+password');
  if (!admin || admin.role !== 'admin') {
    throw new Error('The configured admin account was not found; no account was created.');
  }

  admin.password = password;
  await admin.save();

  const savedAdmin = await User.findById(admin._id).select('+password');
  if (!savedAdmin || !(await savedAdmin.comparePassword(password))) {
    throw new Error('Password reset could not be verified in the database.');
  }
  console.log(`Admin password reset and verified for ${email} in ${dbStatus.provider}.`);
}

resetAdminPassword()
  .catch((err: unknown) => {
    const message = err instanceof Error ? err.message : 'Unexpected error.';
    console.error(`Admin password reset failed: ${message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDB();
  });
