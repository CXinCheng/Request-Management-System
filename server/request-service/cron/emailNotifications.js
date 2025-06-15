import { db, ensureConnection } from "../src/configs/db.js";
import nodemailer from "nodemailer";
import nodeCron from "node-cron";
import Redis from 'ioredis';

const cronJobs = {}; // global
const redisSubscriber = new Redis();

redisSubscriber.subscribe('user:interval:update', (err, count) => {
    if (err) {
        console.error('Failed to subscribe:', err);
        return;
    }
    console.log(`Subscribed to ${count} channel(s). Waiting for messages...`);
});

redisSubscriber.on('message', (channel, message) => {
    if (channel === 'user:interval:update') {
        const { prof } = JSON.parse(message);
        console.log(`Received update for prof ${prof.name}`);

        createOrUpdateCronJob(prof);
    }
});

function createOrUpdateCronJob(prof) {
    if (cronJobs[prof.matrix_id]) {
        cronJobs[prof.matrix_id].stop();
        delete cronJobs[prof.matrix_id];
        console.log(`Stopped existing cron for ${prof.matrix_id}`);
    }

    const interval = prof.email_interval || 'daily'; // default: once daily
    const cronExpr = getCronExpr(interval);

    if (!cronExpr) {
        console.warn(`Invalid interval for ${prof.matrix_id}: ${prof.email_interval}`);
        return;
    }

    const job = nodeCron.schedule(cronExpr, () => {
        notifyPendingRequestsForProfessor(prof);
        }, {
            timezone: 'Asia/Singapore'
        });

    cronJobs[prof.matrix_id] = job;
}


export const setupDynamicCrons = async () => {
    const connectionActive = await ensureConnection();
    if (!connectionActive) {
        console.log("Database connection unavailable");
        return;
    }

    const professors = await db.manyOrNone(`
        SELECT matrix_id, email, name, email_interval
        FROM request_management.users
        WHERE role = 'Professor'
    `);

    for (const prof of professors) {
        createOrUpdateCronJob(prof)
    }
};

const getCronExpr = (interval) => {
    switch (interval) {
    case 'daily':
        return '0 8 * * *'; // 8 AM daily
    case 'weekly':
        return '0 8 * * 1'; // 8 AM every Monday
    case 'monthly':
        return '0 8 1 * *'; // 8 AM on 1st of every month
    default:
        return null;
    }
};

const notifyPendingRequestsForProfessor = async (professor) => {
    const connectionActive = await ensureConnection();
    if (!connectionActive) {
        console.log("Database connection unavailable");
        return;
    }

    let pendingRequests;
    try {
        pendingRequests = await db.manyOrNone(`
            SELECT sr.module_code, COUNT(*) as count
            FROM request_management.sub_request AS sr
            WHERE sr.status = 'Pending' AND sr.approver_id = $1
            GROUP BY sr.module_code
        `, [professor.matrix_id]);
        } catch (error) {
            console.error(`Error fetching pending requests for ${professor.email}:`, error);
            return;
    }

    if (!pendingRequests.length) {
        console.log(`No pending requests for ${professor.email}`);
        return;
    }

    const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
    },
    });

    const requestLines = pendingRequests
    .map(r => `- ${r.module_code}: ${r.count} pending`)
    .join('\n');

    const mailOptions = {
        from: `"Admin" ${process.env.EMAIL}`,
        to: `${process.env.TEST_EMAIL}`, // professor.email in prod
        subject: 'You have pending student requests',
        text: `Dear ${professor.name || 'Professor'},\n\nYou have the following pending requests:\n\n${requestLines}\n\nPlease attend to them.\n\nThanks.`,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${professor.email}: ${info.response}`);
    } catch (error) {
        console.error(`Failed to send to ${professor.email}:`, error);
    }
};
