import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import sinon from "sinon";

import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import * as resetPasswordController from "../../../controllers/auth/resetPasswordController.js";
import { _setDbForTest } from "../../../configs/db.js";

describe("resetPasswordController", () => {
  let req, res, dbMock, bcryptHashStub, bcryptCompareStub, nodemailerStub, sendMailStub;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
    dbMock = {
      oneOrNone: sinon.stub(),
      none: sinon.stub(),
    };
    _setDbForTest(dbMock);
    bcryptHashStub = sinon.stub(bcrypt, "hash");
    bcryptCompareStub = sinon.stub(bcrypt, "compare");
    sendMailStub = sinon.stub().callsFake((opts, cb) => cb && cb(null, { response: "ok" }));
    nodemailerStub = sinon.stub(nodemailer, "createTransport").returns({ sendMail: sendMailStub });
  });

  afterEach(() => {
    _setDbForTest(null);
    sinon.restore();
  });

  describe("verifyEmail", () => {
    it("should return 400 if email is missing", async () => {
      req.body = {};
      await resetPasswordController.verifyEmail(req, res);
      assert(res.status.calledWith(400));
      assert(res.json.calledWithMatch({ success: false }));
    });

    it("should return 404 if user not found", async () => {
      req.body = { email: "a@b.com" };
      dbMock.oneOrNone.resolves(null);
      await resetPasswordController.verifyEmail(req, res);
      assert(res.status.calledWith(404));
      assert(res.json.calledWithMatch({ success: false }));
    });

    it("should return 200 and otp if successful", async () => {
      req.body = { email: "a@b.com" };
      dbMock.oneOrNone.resolves({ matrix_id: "A1", email: "a@b.com" });
      dbMock.none.resolves();
      await resetPasswordController.verifyEmail(req, res);
      assert(res.json.calledWithMatch({ success: true, otp: sinon.match.string }));
    });

    it("should return 500 on sendMail error", async () => {
      req.body = { email: "a@b.com" };
      dbMock.oneOrNone.resolves({ matrix_id: "A1", email: "a@b.com" });
      dbMock.none.resolves();
      sendMailStub.callsFake((opts, cb) => cb(new Error("fail")));
      await resetPasswordController.verifyEmail(req, res);
      assert(res.status.calledWith(500));
      assert(res.json.calledWithMatch({ success: false }));
    });
  });

  describe("verifyOTP", () => {
    it("should return 400 if email or otp missing", async () => {
      req.body = {};
      await resetPasswordController.verifyOTP(req, res);
      assert(res.status.calledWith(400));
      assert(res.json.calledWithMatch({ success: false }));
    });

    it("should return 400 if otp is invalid or expired", async () => {
      req.body = { email: "a@b.com", otp: "123456" };
      dbMock.oneOrNone.resolves(null);
      await resetPasswordController.verifyOTP(req, res);
      assert(res.status.calledWith(400));
      assert(res.json.calledWithMatch({ success: false }));
    });

    it("should return 200 if otp is valid", async () => {
      req.body = { email: "a@b.com", otp: "123456" };
      dbMock.oneOrNone.resolves({
        otp_code: "123456",
        expires_at: new Date(Date.now() + 10000),
        is_used: false,
      });
      await resetPasswordController.verifyOTP(req, res);
      assert(res.json.calledWithMatch({ success: true }));
    });
  });

  describe("resetPassword", () => {
    it("should return 400 if required fields missing", async () => {
      req.body = {};
      await resetPasswordController.resetPassword(req, res);
      assert(res.status.calledWith(400));
      assert(res.json.calledWithMatch({ success: false }));
    });

    it("should return 400 if otp is invalid or expired", async () => {
      req.body = { email: "a@b.com", otp: "123456", newPassword: "pw" };
      dbMock.oneOrNone.resolves(null);
      await resetPasswordController.resetPassword(req, res);
      assert(res.status.calledWith(400));
      assert(res.json.calledWithMatch({ success: false }));
    });

    it("should return 400 if new password is same as current", async () => {
      req.body = { email: "a@b.com", otp: "123456", newPassword: "pw" };
      dbMock.oneOrNone.onFirstCall().resolves({
        otp_code: "123456",
        expires_at: new Date(Date.now() + 10000),
        is_used: false,
      });
      dbMock.oneOrNone.onSecondCall().resolves({ password: "hashed" });
      bcryptHashStub.resolves("hashed");
      bcryptCompareStub.resolves(true);
      await resetPasswordController.resetPassword(req, res);
      assert(res.status.calledWith(400));
      assert(res.json.calledWithMatch({ success: false }));
    });

    it("should return 200 if password reset is successful", async () => {
      req.body = { email: "a@b.com", otp: "123456", newPassword: "pw" };
      dbMock.oneOrNone.onFirstCall().resolves({
        otp_code: "123456",
        expires_at: new Date(Date.now() + 10000),
        is_used: false,
      });
      dbMock.oneOrNone.onSecondCall().resolves({ password: "oldhash" });
      bcryptHashStub.resolves("newhash");
      bcryptCompareStub.resolves(false);
      dbMock.none.resolves();
      await resetPasswordController.resetPassword(req, res);
      assert(res.json.calledWithMatch({ success: true }));
    });

    it("should return 500 on unexpected error", async () => {
      req.body = { email: "a@b.com", otp: "123456", newPassword: "pw" };
      dbMock.oneOrNone.rejects(new Error("fail"));
      await resetPasswordController.resetPassword(req, res);
      assert(res.status.calledWith(500));
      assert(res.json.calledWithMatch({ success: false }));
    });
  });
});
