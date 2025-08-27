import mongoose, { Document } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import UnauthorizedError from '../errors/unauthorized-error';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  tokens: Array<{ token: string }>;
}

interface IUserModel extends mongoose.Model<IUser> {
  findUserByCredentials(
    email: string,
    password: string
  ): Promise<IUser>;
}

const userSchema = new mongoose.Schema<IUser, IUserModel>({
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    default: 'Ё-мое',
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (email: string) => validator.isEmail(email),
      message: 'Некорректный email',
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false,
  },
  tokens: [{
    token: {
      type: String,
      required: true,
    },
  }],
});

userSchema.static('findUserByCredentials', function findUserByCredentials(email: string, password: string) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        throw new UnauthorizedError('Неправильная почта или пароль');
      }

      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            throw new UnauthorizedError('Неправильная почта или пароль');
          }
          return user;
        });
    });
});

export default mongoose.model<IUser, IUserModel>('user', userSchema);
