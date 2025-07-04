import pgPromise from "pg-promise";
import dotenv from "dotenv";
import { createTunnel } from "tunnel-ssh";
import fs from "fs";

dotenv.config();

const pgp = pgPromise();

const tunnelOptions = {
    autoClose: true,
};

const serverOptions = {
    host: "127.0.0.1",
    port: 0,
};

const sshOptions = {
    host: process.env.EC2_HOST,
    port: 22,
    username: process.env.EC2_USERNAME,
    privateKey: fs.readFileSync(process.env.EC2_PRIVATE_KEY_PATH),
    keepaliveInterval: 10000,
};

const forwardOptions = {
    srcAddr: "127.0.0.1",
    dstAddr: process.env.DATABASE_URL,
    dstPort: process.env.DATABASE_PORT,
};

const databaseConfig = {
    host: "127.0.0.1",
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    max: 10,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 2000,
};

let db = null;
let sshTunnel = null;
let isReconnecting = false;
let reconnectionPromise = null;

const initialize = async () => {
    return new Promise((resolve, reject) => {
        if (db) {
            return resolve(db);
        }

        createTunnel(tunnelOptions, serverOptions, sshOptions, forwardOptions)
            .then(([server]) => {
                sshTunnel = server;
                // console.log("SSH tunnel established on port:", server.address().port);
                
                db = pgp({ ...databaseConfig, port: server.address().port });
                resolve(db);
            })
            .catch((err) => {
                console.error("SSH tunnel error:", err);
                reject(err);
            });
    });
};

const reconnect = async () => {
    // console.log("Starting reconnection process...");
    
    if (sshTunnel) {
        try {
            sshTunnel.close();
        } catch (e) {
            console.error("Error closing SSH tunnel:", e);
        }
        sshTunnel = null;
    }

    if (db) {
        pgp.end();
        db = null;
    }

    try {
        await initialize();
        return true;
    } catch (error) {
        console.error("Reconnection failed:", error);
        return false;
    } finally {
        isReconnecting = false;
        reconnectionPromise = null;
    }
};

const ensureConnection = async () => {
    if (db && sshTunnel) {
        try {
            await db.one("SELECT 1 AS connected");
            return true;
        } catch (error) {
            // console.log("Connection test failed");
        }
    }
    
    if (isReconnecting) {
        return reconnectionPromise;
    }
    
    isReconnecting = true;
    reconnectionPromise = reconnect();
    
    return reconnectionPromise;
};

const close = () => {
    if (db) {
        pgp.end();
        db = null;
    }

    if (sshTunnel) {
        try {
            sshTunnel.close();
        } catch (e) {
            console.error("Error closing SSH tunnel:", e);
        }
        sshTunnel = null;
    }
    
    isReconnecting = false;
    reconnectionPromise = null;
};

const _setDbForTest = (mockDb) => {
    db = mockDb;
};

export { initialize, close, db, ensureConnection, _setDbForTest };