import * as bcrypt from 'bcryptjs';

async function generateHashes() {
    const ownerPassword = "demo@123";
    const staffPin = "1234";

    const ownerHash = await bcrypt.hash(ownerPassword, 10);
    const pinHash = await bcrypt.hash(staffPin, 10);

    console.log("Owner Password Hash:", ownerHash);
    console.log("Staff PIN Hash:", pinHash);
}

generateHashes();
