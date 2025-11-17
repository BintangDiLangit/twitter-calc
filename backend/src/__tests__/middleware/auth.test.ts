import jwt from 'jsonwebtoken';
import { authenticate } from '../../middleware/auth';
import { AuthRequest } from '../../types';
import { Response } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

describe('Authentication Middleware', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
  });

  it('should authenticate valid token', () => {
    const token = jwt.sign({ id: 1, username: 'testuser' }, JWT_SECRET);
    mockRequest.headers = {
      authorization: `Bearer ${token}`,
    };

    authenticate(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect(mockRequest.user).toEqual({ id: 1, username: 'testuser' });
  });

  it('should reject missing token', () => {
    authenticate(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'No token provided' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should reject invalid token', () => {
    mockRequest.headers = {
      authorization: 'Bearer invalid-token',
    };

    authenticate(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should reject malformed authorization header', () => {
    mockRequest.headers = {
      authorization: 'InvalidFormat token',
    };

    authenticate(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(nextFunction).not.toHaveBeenCalled();
  });
});

