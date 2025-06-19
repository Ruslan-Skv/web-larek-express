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
    { expiresIn: '10m' }
  );

  const refreshToken = jwt.sign(
    { _id: userId },
    process.env.JWT_REFRESH_SECRET || 'some-secret-refresh-key',
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

export const saveRefreshToken = async (userId: string, refreshToken: string) => {
  await User.findByIdAndUpdate(userId, {
    $push: { tokens: { token: refreshToken, createdAt: new Date() } }
  });
};

export const removeRefreshToken = async (userId: string, refreshToken: string) => {
  await User.findByIdAndUpdate(userId, {
    $pull: { tokens: { token: refreshToken } }
  });
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'some-secret-refresh-key') as { _id: string };
};

export const refreshTokens = async (refreshToken: string) => {
  try {
    const payload = verifyRefreshToken(refreshToken);
    const user = await User.findOne({
      _id: payload._id,
      'tokens.token': refreshToken
    });

    if (!user) {
      throw new Error('Invalid refresh token');
    }

    const newTokens = generateTokens(user._id.toString());

    await User.findByIdAndUpdate(user._id, {
      $pull: { tokens: { token: refreshToken } },
      $push: { tokens: { token: newTokens.refreshToken, createdAt: new Date() } }
    });

    return newTokens;
  } catch (error) {
    console.error('Token refresh failed:', error);
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





// const JWT_SECRET = 'your-secret-key';

// export const refreshTokens = async (refreshToken: string) => {
//   try {
//     const payload = jwt.verify(refreshToken, JWT_SECRET) as { userId: string };
//     const tokens = generateTokens(payload.userId);
//     await updateUserTokens(payload.userId, tokens);
//     return tokens;
//   } catch (err) {
//     throw new Error('Invalid refresh token');
//   }
// };

// export const generateTokens = (userId: string): TokenPair => {
//   const accessToken = jwt.sign(
//     { userId },
//     JWT_SECRET,
//     { expiresIn: '1h' }
//   );

//   const refreshToken = jwt.sign(
//     { userId },
//     JWT_SECRET,
//     { expiresIn: '30d' }
//   );

//   return { accessToken, refreshToken };
// };

// export const updateUserTokens = async (userId: string, tokens: TokenPair) => {
//   try {
//     return await User.findOneAndUpdate(
//       { _id: userId },
//       {
//         $set: {
//           'tokens.accessToken': tokens.accessToken,
//           'tokens.refreshToken': tokens.refreshToken
//         }
//       },
//       { new: true, runValidators: true }
//     );
//   } catch (error) {
//     console.error('Token update error:', error);
//     throw error;
//   }
// };