import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';

let mongoMemoryServerInstance: any = null;

/**
 * Masks authentication details before a URI is logged or returned.
 */
export function maskMongoUri(uri?: string): string {
  if (!uri) return 'NONE';
  if (uri.includes('@')) {
    return uri.replace(/(mongodb(?:\+srv)?:\/\/)[^/@]+@/, '$1****@');
  }
  return uri.replace(/(mongodb(?:\+srv)?:\/\/)([^/]+)/, '$1****');
}

/**
 * Cleans and formats MongoDB connection URIs.
 * For mongodb+srv:// URIs, DNS SRV records provide the ports, so explicit port numbers
 * (e.g., :27017) are invalid and must be removed.
 */
export function cleanMongoUri(rawUri?: string): string {
  if (!rawUri) return '';
  let cleaned = rawUri.trim();

  if (cleaned.startsWith('mongodb+srv://')) {
    // If the @ separator between credentials and cluster domain is missing,
    // the driver parses the credentials as host:port and fails with
    // "mongodb+srv URI cannot have port number".
    if (!cleaned.includes('@') && cleaned.includes('.mongodb.net')) {
      const match = cleaned.match(/(?:appName=([a-zA-Z0-9_-]+))/i);
      const appName = match ? match[1].toLowerCase() : '';
      if (appName && cleaned.toLowerCase().includes(appName + '.')) {
        const idx = cleaned.toLowerCase().lastIndexOf(appName + '.');
        cleaned = cleaned.slice(0, idx) + '@' + cleaned.slice(idx);
      } else {
        // Fallback: search for subdomain before .mongodb.net
        const netIdx = cleaned.indexOf('.mongodb.net');
        const beforeNet = cleaned.substring(0, netIdx);
        const lastDot = beforeNet.lastIndexOf('.');
        if (lastDot !== -1) {
          const secondLastDot = beforeNet.lastIndexOf('.', lastDot - 1);
          const clusterStart = secondLastDot !== -1 ? secondLastDot + 1 : lastDot + 1;
          cleaned = cleaned.slice(0, clusterStart) + '@' + cleaned.slice(clusterStart);
        }
      }
    }

    // For mongodb+srv, remove any port specification like :27017 or :5000 anywhere before / or ? or end
    cleaned = cleaned.replace(/(mongodb\+srv:\/\/[^/?]+)(?::\d+)([/=?]|$)/, '$1$2');
  }

  return cleaned;
}

export interface DBStatus {
  connected: boolean;
  provider: 'atlas' | 'local-standalone' | 'embedded-persisted';
  maskedUri: string;
  atlasAttempted: boolean;
  atlasConnected: boolean;
  atlasError?: string;
  atlasErrorCode?: number | string;
  atlasErrorCodeName?: string;
  readWriteSuccess?: boolean;
}

export const dbStatus: DBStatus = {
  connected: false,
  provider: 'embedded-persisted',
  maskedUri: '',
  atlasAttempted: false,
  atlasConnected: false,
};

/**
 * Isolated test helper that connects to MongoDB Atlas, executes an end-to-end
 * document insert, query, and cleanup test, and returns the verified result.
 */
export async function testAtlasConnection(uriOverride?: string): Promise<{
  success: boolean;
  provider: string;
  maskedUri: string;
  error?: string;
  errorCode?: number | string;
  errorCodeName?: string;
  readWriteSuccess?: boolean;
  details?: string;
}> {
  const rawUri = uriOverride || process.env.MONGODB_URI;
  const uri = cleanMongoUri(rawUri);
  const maskedUri = maskMongoUri(uri);

  if (!uri) {
    return {
      success: false,
      provider: 'none',
      maskedUri: 'NONE',
      error: 'MONGODB_URI environment variable is not defined.',
      readWriteSuccess: false,
    };
  }

  const testConn = mongoose.createConnection();
  try {
    console.log(`[Atlas Diagnostic] Initiating isolated connection test to ${maskedUri}...`);
    await testConn.openUri(uri, { serverSelectionTimeoutMS: 5000 });
    console.log(`[Atlas Diagnostic] Connection open. Executing read/write verification on 'agriya_connection_test'...`);

    const testCol = testConn.collection('agriya_connection_test');
    const writeResult = await testCol.insertOne({
      test: true,
      platform: 'AGRIYA AgriTech Platform',
      testedAt: new Date(),
    });

    const readResult = await testCol.findOne({ _id: writeResult.insertedId });
    if (!readResult) {
      throw new Error('Test document written to Atlas but could not be read back.');
    }

    await testCol.deleteOne({ _id: writeResult.insertedId });
    console.log(`[Atlas Diagnostic] CRUD operations verified successfully on MongoDB Atlas.`);

    await testConn.close();

    return {
      success: true,
      provider: 'atlas',
      maskedUri,
      readWriteSuccess: true,
      details: 'Atlas connection, persistent write, read query, and deletion confirmed successfully.',
    };
  } catch (err: any) {
    console.error(`[Atlas Diagnostic Error] ${err.name || 'ConnectionError'} (details omitted)`);
    try {
      await testConn.close();
    } catch {
      // ignore close errors
    }
    return {
      success: false,
      provider: 'atlas',
      maskedUri,
      error: 'MongoDB Atlas connection failed. Details omitted.',
      errorCode: err.code,
      errorCodeName: err.codeName,
      readWriteSuccess: false,
    };
  }
}

export async function connectDB() {
  const rawUri = process.env.MONGODB_URI;
  const uri = cleanMongoUri(rawUri);
  const isExternal = Boolean(uri && !uri.includes('127.0.0.1') && !uri.includes('localhost'));
  const maskedUri = maskMongoUri(uri);
  dbStatus.maskedUri = maskedUri;

  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Ensure data directory for persistent embedded Mongo exists
  const mongoDataDir = path.join(process.cwd(), '.mongo-data');
  if (!fs.existsSync(mongoDataDir)) {
    fs.mkdirSync(mongoDataDir, { recursive: true });
  }

  // If external MONGODB_URI is provided, attempt connection
  if (isExternal) {
    dbStatus.atlasAttempted = true;
    try {
      console.log(`Connecting to external MongoDB Atlas at ${maskedUri}...`);
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      console.log('MongoDB Atlas connected successfully via MONGODB_URI');
      dbStatus.connected = true;
      dbStatus.atlasConnected = true;
      dbStatus.provider = 'atlas';
      dbStatus.readWriteSuccess = true;
      return;
    } catch (err: any) {
      dbStatus.atlasConnected = false;
      dbStatus.atlasError = 'MongoDB Atlas connection failed. Details omitted.';
      dbStatus.atlasErrorCode = err.code;
      dbStatus.atlasErrorCodeName = err.codeName;

      console.error(`\n================================================================================`);
      console.error(`🚨 [MONGODB ATLAS CONNECTION FAILED]`);
      console.error(`   Target URI:       ${maskedUri}`);
      console.error(`   Atlas Error Code: ${err.code || 'N/A'} (${err.codeName || 'N/A'})`);
      console.error(`================================================================================\n`);

      if (
        process.env.MONGODB_ALLOW_LOCAL_FALLBACK !== 'true' ||
        process.env.STRICT_MONGODB_ATLAS === 'true'
      ) {
        throw new Error('MongoDB Atlas connection failed. Local fallback is disabled.');
      }

      console.warn('Explicit local database fallback enabled; application data will not be stored in Atlas.');
    }
  }

  const localUri = uri && !isExternal ? uri : 'mongodb://127.0.0.1:27017/agriya';

  // Check if a local mongod is listening on standard port 27017
  try {
    await mongoose.connect(localUri, {
      serverSelectionTimeoutMS: 1500,
    });
    console.log('Connected to existing local MongoDB instance.');
    dbStatus.connected = true;
    dbStatus.provider = 'local-standalone';
    return;
  } catch {
    // Local standalone not running; boot MongoMemoryServer with persistent disk storage
  }

  try {
    console.log('Booting embedded MongoDB daemon with persistent disk storage in .mongo-data...');
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    mongoMemoryServerInstance = await MongoMemoryServer.create({
      instance: {
        dbPath: mongoDataDir,
        storageEngine: 'wiredTiger',
      },
    });
    const mongoUri = mongoMemoryServerInstance.getUri() + 'agriya';
    await mongoose.connect(mongoUri);
    console.log(`Embedded MongoDB started and connected successfully at: ${mongoUri}`);
    dbStatus.connected = true;
    dbStatus.provider = 'embedded-persisted';
  } catch (err: any) {
    console.error('Failed to start embedded MongoDB:', err);
    throw err;
  }
}

export async function disconnectDB() {
  await mongoose.disconnect();
  if (mongoMemoryServerInstance) {
    await mongoMemoryServerInstance.stop();
  }
}
