import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import sinon from "sinon";

import bcrypt from "bcrypt";
import { register } from "../../../controllers/auth/registerController.js";
import { _setDbForTest } from "../../../configs/db.js";

describe("registerController register Unit Tests", () => {
    let req, res, dbMock, bcryptStub;

    beforeEach(() => {
        req = { body: {} };
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub()
        };
        dbMock = {
            manyOrNone: sinon.stub(),
            one: sinon.stub()
        };
        _setDbForTest(dbMock);
        bcryptStub = sinon.stub(bcrypt, "hash");
    });

    afterEach(() => {
        _setDbForTest(null);
        sinon.restore();
    });

    it("should return 400 if any required field is missing", async () => {
        req.body = { name: "", email: "", password: "", matrix_id: "", role: "" };
        await register.call({ db: dbMock }, req, res);
        assert(res.status.calledWith(400));
        assert(res.json.calledWithMatch({ success: false }));
    });

    it("should return 400 if user already exists", async () => {
        req.body = { name: "A", email: "a@b.com", password: "pw", matrix_id: "A123", role: "Student" };
        dbMock.manyOrNone.resolves([{}]);
        await register.call({ db: dbMock }, req, res);
        assert(res.status.calledWith(400));
        assert(res.json.calledWithMatch({ success: false }));
    });

    it("should return 201 and user data if registration is successful", async () => {
        req.body = { name: "A", email: "a@b.com", password: "pw", matrix_id: "A123", role: "Student" };
        dbMock.manyOrNone.resolves([]);
        bcryptStub.resolves("hashedpw");
        dbMock.one.resolves({
            name: "A",
            email: "a@b.com",
            role: "Student",
            matrix_id: "A123"
        });

        await register.call({ db: dbMock }, req, res);

        assert(res.status.calledWith(201));
        assert(res.json.calledWithMatch({
            success: true,
            message: "User registered successfully",
            data: {
                name: "A",
                email: "a@b.com",
                role: "Student",
                matrix_id: "A123"
            }
        }));
    });

    it("should return 500 on unexpected error", async () => {
        req.body = { name: "A", email: "a@b.com", password: "pw", matrix_id: "A123", role: "Student" };
        dbMock.manyOrNone.rejects(new Error("DB error"));
        await register.call({ db: dbMock }, req, res);
        assert(res.status.calledWith(500));
        assert(res.json.calledWithMatch({ success: false }));
    });
});
