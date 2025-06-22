import { describe, it } from 'node:test';
import assert from 'node:assert';
import { verifyToken, authorizeRoles } from '../../middlewares/authMiddleware.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

describe('Authentication Middleware', () => {
  describe('verifyToken', () => {
    it('should return 401 if no token is provided', () => {
      const req = {
        headers: {}
      };
      const res = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.body = data;
          return this;
        }
      };
      const next = () => {};

      verifyToken(req, res, next);
      assert.strictEqual(res.statusCode, 401);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error, 'Access denied. No token provided.');
    });

    it('should call next() if a valid token is provided', () => {
      const payload = { matrix_id: 'A1234567B', role: 'Student' };
      const token = jwt.sign(payload, process.env.JWT_SECRET || 'your-test-secret', { expiresIn: '1h' });
      
      const req = {
        headers: {
          authorization: `Bearer ${token}`
        }
      };
      
      let nextCalled = false;
      const res = {};
      const next = () => { nextCalled = true; };

      verifyToken(req, res, next);
      assert.strictEqual(nextCalled, true);
      assert.strictEqual(req.user.matrix_id, payload.matrix_id);
      assert.strictEqual(req.user.role, payload.role);
    });

    it('should return 403 for invalid token', () => {
      const req = {
        headers: {
          authorization: 'Bearer invalid-token'
        }
      };
      
      const res = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.body = data;
          return this;
        }
      };
      
      const next = () => {};

      verifyToken(req, res, next);
      assert.strictEqual(res.statusCode, 403);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error, 'Invalid or expired token.');
    });
  });

  describe('authorizeRoles', () => {
    it('should return 403 if user role is not defined', () => {
      const req = {
        user: {}
      };
      
      const res = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.body = data;
          return this;
        }
      };
      
      const next = () => {};
      const middleware = authorizeRoles(['Student', 'Professor', 'Admin']); 
      
      middleware(req, res, next);
      assert.strictEqual(res.statusCode, 403);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error, 'Access denied. Role verification failed.');
    });

    it('should return 403 if user role is not allowed', () => {
      const req = {
        user: { role: 'Student' }
      };
      
      const res = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.body = data;
          return this;
        }
      };
      
      const next = () => {};
      const middleware = authorizeRoles(['Professor', 'Admin']);
      
      middleware(req, res, next);
      assert.strictEqual(res.statusCode, 403);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error, 'Access denied. Insufficient permissions.');
    });
    
    it('should call next() if user role is allowed', () => {
      const req = {
        user: { role: 'Professor' }
      };
      
      const res = {};
      let nextCalled = false;
      const next = () => { nextCalled = true; };
      
      const middleware = authorizeRoles(['Professor', 'Admin']);
      
      middleware(req, res, next);
      assert.strictEqual(nextCalled, true);
    });
  });
});