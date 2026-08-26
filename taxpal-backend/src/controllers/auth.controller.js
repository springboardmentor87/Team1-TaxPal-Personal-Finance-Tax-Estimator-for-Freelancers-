const { AuthService } = require('../services/auth.service');
const { ApiResponse } = require('../utils/ApiResponse');
const { ApiError } = require('../utils/ApiError');
const { MailerService } = require('../services/mailer.service');
const User = require('../models/User');

class AuthController {
  static async register(req, res, next) {
    try {
      const {
        email,
        password,
        role,
        fullName,
        username,
        phone,
        country,
        state,
        city,
      } = req.body;

      const userAgent = req.headers['user-agent'] || 'Web Browser';
      const ipAddress = (req.ip || req.socket.remoteAddress || '127.0.0.1').toString();

      const result = await AuthService.register(
        {
          email,
          password,
          role: role || 'freelancer',
          fullName,
          username,
          phone,
          country,
          state,
          city,
        },
        { deviceName: userAgent, ipAddress }
      );

      const isProduction = process.env.NODE_ENV === 'production';

      res.cookie('accessToken', result.accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000,
      });

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(201).json(new ApiResponse(result, 'User registered successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const userAgent = req.headers['user-agent'] || 'Web Browser';
      const ipAddress = (req.ip || req.socket.remoteAddress || '127.0.0.1').toString();

      const result = await AuthService.login(email, password, { deviceName: userAgent, ipAddress });

      const isProduction = process.env.NODE_ENV === 'production';

      res.cookie('accessToken', result.accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000,
      });

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json(new ApiResponse(result, 'User logged in successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req, res, next) {
    try {
      const userId = req.user && req.user.id;
      if (!userId) {
        throw new ApiError(401, 'Unauthorized: User context missing');
      }

      const user = await AuthService.getProfile(userId);
      res.status(200).json(new ApiResponse(user, 'User profile retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const userId = req.user && req.user.id;
      if (!userId) {
        throw new ApiError(401, 'Unauthorized: User context missing');
      }

      const user = await AuthService.updateProfile(userId, req.body);
      res.status(200).json(new ApiResponse(user, 'Profile updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async logout(req, res, next) {
    try {
      const userId = req.user && req.user.id;
      const refreshToken = req.body.refreshToken || req.cookies.refreshToken;

      if (userId) {
        await AuthService.logout(userId, refreshToken);
      }

      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');

      res.status(200).json(new ApiResponse(null, 'Logged out successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req, res, next) {
    try {
      const refreshToken = req.body.refreshToken || req.cookies.refreshToken;

      if (!refreshToken) {
        throw new ApiError(400, 'Refresh token required');
      }

      const result = await AuthService.refreshTokens(refreshToken);
      const isProduction = process.env.NODE_ENV === 'production';

      res.cookie('accessToken', result.accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000,
      });

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json(new ApiResponse(result, 'Tokens refreshed successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req, res, next) {
    try {
      const userId = req.user && req.user.id;
      const { currentPassword, newPassword } = req.body;

      if (!userId) {
        throw new ApiError(401, 'Unauthorized: User context missing');
      }

      await AuthService.changePassword(userId, currentPassword, newPassword);
      res.status(200).json(new ApiResponse(null, 'Password changed successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async getSessions(req, res, next) {
    try {
      const userId = req.user && req.user.id;
      if (!userId) {
        throw new ApiError(401, 'Unauthorized: User context missing');
      }

      const sessions = await AuthService.getSessions(userId);
      res.status(200).json(new ApiResponse(sessions, 'Device sessions retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async logoutOtherSessions(req, res, next) {
    try {
      const userId = req.user && req.user.id;
      const currentToken = req.cookies.refreshToken || (req.headers.authorization ? req.headers.authorization.split(' ')[1] : '');

      if (!userId) {
        throw new ApiError(401, 'Unauthorized: User context missing');
      }

      await AuthService.logoutOtherSessions(userId, currentToken);
      res.status(200).json(new ApiResponse(null, 'Other device sessions logged out successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      if (!email) {
        throw new ApiError(400, 'Email address is required');
      }

      const user = await User.findByEmail(email);
      if (!user) {
        throw new ApiError(404, 'User with this email does not exist');
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      await User.updateById(user.id, {
        passwordResetOtp: otp,
        passwordResetExpires: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      });

      await MailerService.sendOtpMail(email, otp);

      res.status(200).json(new ApiResponse(null, 'Reset OTP sent successfully to your email'));
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req, res, next) {
    try {
      const { email, otp, newPassword } = req.body;
      if (!email || !otp || !newPassword) {
        throw new ApiError(400, 'Email, OTP, and new password are required');
      }

      const user = await User.findByEmail(email);
      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      if (!user.passwordResetOtp || user.passwordResetOtp !== otp) {
        throw new ApiError(400, 'Invalid OTP code');
      }

      if (!user.passwordResetExpires || new Date() > new Date(user.passwordResetExpires)) {
        throw new ApiError(400, 'OTP code has expired');
      }

      await User.updateById(user.id, {
        password: newPassword,
        passwordResetOtp: null,
        passwordResetExpires: null,
      });

      res.status(200).json(new ApiResponse(null, 'Password has been reset successfully. You can now login.'));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = {
  AuthController,
};
