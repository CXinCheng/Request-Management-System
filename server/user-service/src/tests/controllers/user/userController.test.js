import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import sinon from "sinon";
import Redis from "ioredis";
sinon.stub(Redis.prototype, "publish").resolves();
sinon.stub(Redis.prototype, "quit").resolves();

import * as userController from "../../../controllers/user/userController.js";
import { _setDbForTest } from "../../../configs/db.js";

describe("User Controller Unit Tests", () => {
  let req, res, dbMock;

  beforeEach(() => {
    req = { params: {}, query: {}, body: {} };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
    dbMock = {
      manyOrNone: sinon.stub(),
      oneOrNone: sinon.stub(),
      one: sinon.stub(),
      result: sinon.stub(),
    };
    _setDbForTest(dbMock);
  });

  afterEach(async() => {
    _setDbForTest(null);
    sinon.restore();
  });

  it("getAllUsers - should return users", async () => {
    dbMock.manyOrNone.resolves([{ name: "A" }]);
    await userController.getAllUsers(req, res);
    assert(res.json.calledWithMatch({ success: true, data: [{ name: "A" }] }));
  });

  it("getAllUsers - should handle error", async () => {
    dbMock.manyOrNone.rejects(new Error("fail"));
    await userController.getAllUsers(req, res);
    assert(res.status.calledWith(500));
    assert(res.json.calledWithMatch({ success: false }));
  });

  it("getAllProfessors - should return professors", async () => {
    dbMock.manyOrNone.resolves([{ name: "Prof" }]);
    await userController.getAllProfessors(req, res);
    assert(res.json.calledWithMatch({ success: true, data: [{ name: "Prof" }] }));
  });

  it("getAllStudents - should return students", async () => {
    dbMock.manyOrNone.resolves([{ name: "Stu" }]);
    await userController.getAllStudents(req, res);
    assert(res.json.calledWithMatch({ success: true, data: [{ name: "Stu" }] }));
  });

  it("getUser - should return user if found", async () => {
    req.params.matrix_id = "A1";
    dbMock.oneOrNone.resolves({ name: "A" });
    await userController.getUser(req, res);
    assert(res.json.calledWithMatch({ success: true, data: { name: "A" } }));
  });

  it("getUser - should return 404 if not found", async () => {
    req.params.matrix_id = "A1";
    dbMock.oneOrNone.resolves(null);
    await userController.getUser(req, res);
    assert(res.status.calledWith(404));
    assert(res.json.calledWithMatch({ success: false }));
  });

  it("updateUser - should return 404 if user not found", async () => {
    req.params.matrix_id = "A1";
    dbMock.oneOrNone.resolves(null);
    await userController.updateUser(req, res);
    assert(res.status.calledWith(404));
    assert(res.json.calledWithMatch({ success: false }));
  });

  it("deleteUser - should delete user", async () => {
    req.params.matrix_id = "A1";
    dbMock.result.resolves({ rowCount: 1 });
    await userController.deleteUser(req, res);
    assert(res.json.calledWithMatch({ success: true }));
  });

  it("deleteUser - should return 404 if user not found", async () => {
    req.params.matrix_id = "A1";
    dbMock.result.resolves({ rowCount: 0 });
    await userController.deleteUser(req, res);
    assert(res.status.calledWith(404));
    assert(res.json.calledWithMatch({ success: false }));
  });

  it("getProfessors - should return 400 if no ids", async () => {
    req.query.ids = null;
    await userController.getProfessors(req, res);
    assert(res.status.calledWith(400));
  });

  it("getProfessors - should return 404 if no professors found", async () => {
    req.query.ids = "A1";
    dbMock.manyOrNone.resolves([]);
    await userController.getProfessors(req, res);
    assert(res.status.calledWith(404));
  });

  it("getProfessors - should return professors", async () => {
    req.query.ids = "A1";
    dbMock.manyOrNone.resolves([{ name: "Prof" }]);
    await userController.getProfessors(req, res);
    assert(res.json.calledWithMatch({ success: true, data: [{ name: "Prof" }] }));
  });
});
