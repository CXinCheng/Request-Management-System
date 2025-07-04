import { describe, it, beforeEach, afterEach } from "node:test";
import assert from 'node:assert';
import sinon from 'sinon';

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { login } from '../../../controllers/auth/loginController.js';
import { _setDbForTest } from "../../../configs/db.js";

describe('loginController login Unit Tests', () => {
    let req, res, dbMock, bcryptStub, jwtStub;

    beforeEach(() => {
        req = { body: {} };
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub()
        };
        dbMock = { oneOrNone: sinon.stub() };
        _setDbForTest(dbMock);
        bcryptStub = sinon.stub(bcrypt, 'compare');
        jwtStub = sinon.stub(jwt, 'sign');
    });

    afterEach(() => {
        _setDbForTest(null);
        sinon.restore();
    });

    it('should return 400 if email or password is missing', async () => {
        req.body = { email: '', password: '' };
        await login.call({ db: dbMock }, req, res);
        assert(res.status.calledWith(400));
        assert(res.json.calledWithMatch({ success: false }));
    });

    it('should return 401 if user not found', async () => {
        req.body = { email: 'test@example.com', password: 'pass' };
        dbMock.oneOrNone.resolves(null);
        await login.call({ db: dbMock }, req, res);
        assert(res.status.calledWith(401));
        assert(res.json.calledWithMatch({ success: false }));
    });

    it('should return 401 if password is invalid', async () => {
        req.body = { email: 'test@example.com', password: 'wrongpass' };
        dbMock.oneOrNone.resolves({ password: 'hashed' });
        bcryptStub.resolves(false);
        await login.call({ db: dbMock }, req, res);
        assert(res.status.calledWith(401));
        assert(res.json.calledWithMatch({ success: false }));
    });

    it('should return 200 and token if login is successful', async () => {
        req.body = { email: 'test@example.com', password: 'pass' };
        const user = {
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
            role: 'Student',
            matrix_id: 'A1234567X',
            faculty: 'Science',
            contact_number: '12345678',
            password: 'hashed',
            email_interval: 7
        };
        dbMock.oneOrNone.resolves(user);
        bcryptStub.resolves(true);
        jwtStub.returns('mocktoken');

        await login.call({ db: dbMock }, req, res);

        assert(res.json.calledWithMatch({
            success: true,
            message: 'Login successful',
            data: {
                token: 'mocktoken',
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    matrix_id: user.matrix_id,
                    faculty: user.faculty,
                    contact: user.contact_number,
                    email_interval: user.email_interval,
                }
            }
        }));
    });

    it('should return 500 on unexpected error', async () => {
        req.body = { email: 'test@example.com', password: 'pass' };
        dbMock.oneOrNone.rejects(new Error('DB error'));
        await login.call({ db: dbMock }, req, res);
        assert(res.status.calledWith(500));
        assert(res.json.calledWithMatch({ success: false }));
    });
});
