import jwt from 'jsonwebtoken';
import ms from 'ms';
import User from '../models/user';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export const generateTokens = (userId: string): TokenPair => {
  const accessToken = jwt.sign(
    { _id: userId },
    process.env.JWT_ACCESS_SECRET || 'some-secret-access-key',
    { expiresIn: '10m' },
  );

  const refreshToken = jwt.sign(
    { _id: userId },
    process.env.JWT_REFRESH_SECRET || 'some-secret-refresh-key',
    { expiresIn: '7d' },
  );

  return { accessToken, refreshToken };
};

export const saveRefreshToken = async (userId: string, refreshToken: string) => {
  await User.findByIdAndUpdate(userId, {
    $push: { tokens: { token: refreshToken, createdAt: new Date() } },
  });
};

export const removeRefreshToken = async (userId: string, refreshToken: string) => {
  await User.findByIdAndUpdate(userId, {
    $pull: { tokens: { token: refreshToken } },
  });
};

// eslint-disable-next-line max-len
export const verifyRefreshToken = (token: string) => jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'some-secret-refresh-key') as { _id: string };

export const refreshTokens = async (refreshToken: string) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const payload = verifyRefreshToken(refreshToken);
    const user = await User.findOne({
      _id: payload._id,
      'tokens.token': refreshToken,
    });

    if (!user) {
      throw new Error('Invalid refresh token');
    }

    const newTokens = generateTokens(user._id.toString());

    await User.findByIdAndUpdate(user._id, {
      $pull: { tokens: { token: refreshToken } },
      $push: { tokens: { token: newTokens.refreshToken, createdAt: new Date() } },
    });

    return newTokens;
  } catch (error) {
    throw error;
  }
};

export const getCookieOptions = () => ({
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  maxAge: ms('7d'),
  path: '/',
});
