import pgPromise from "pg-promise";
import dotenv from "dotenv";
import { Client } from 'ssh2';
import fs from 'fs';
import net from "net";

dotenv.config();

const pgp = pgPromise();

const sshConfig = {
    host: process.env.EC2_HOST,
    port: 22,
    username: process.env.EC2_USERNAME,
    privateKey: fs.readFileSync(process.env.EC2_PRIVATE_KEY_PATH),
};

const databaseConfig = {
    host: 'localhost',
    port: process.env.EC2_FORWARD_PORT, // local port to forward to
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
};

const rdsConfig = {
    host: process.env.DATABASE_URL,
    port: process.env.DATABASE_PORT,
};

let db = null;
let sshClient = null;

const initialize = async () => {
    return new Promise((resolve, reject) => {
        sshClient = new Client();

        sshClient.on('ready', () => {
            sshClient.forwardOut(
                'localhost',
                databaseConfig.port,
                rdsConfig.host,
                rdsConfig.port,
                (err, stream) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    const server = net.createServer(socket => {
                        socket.pipe(stream);
                        stream.pipe(socket);
                    }).listen(databaseConfig.port, 'localhost', () => {
                        console.log('SSH tunnel established');
                        
                        db = pgp({
                            ...databaseConfig,
                            host: 'localhost'
                        });
                        
                        resolve(db);
                    });
                }
            );
        });

        sshClient.on('error', (err) => {
            console.error('SSH connection error:', err);
            reject(err);
        });

        sshClient.connect(sshConfig);
    });
};

const close = () => {
    if (sshClient) {
        sshClient.end();
    }
    if (db) {
        pgp.end();
    }
};

export { initialize, close, db };