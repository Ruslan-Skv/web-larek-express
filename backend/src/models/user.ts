import mongoose from "mongoose";
import validator from "validator";
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  tokens: Array<{ token: string }>;
}

// export interface IUserDocument extends Document {
//   name: string;
//   email: string;
//   password: string;
//   tokens: Array<{ token: string }>;
//   comparePassword(password: string): Promise<boolean>;
// }


// export interface IUserModel extends mongoose.Model<IUserDocument> {
//   findUserByCredentials(email: string, password: string): Promise<IUserDocument>;
// }

// interface IUserModel extends mongoose.Model<IUser> {
//   findUserByCredentials: (email: string, password: string) => Promise<mongoose.Document<unknown, any, IUser>>
// }

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
    default: 'Ё-мое'
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (email: string) => validator.isEmail(email),
      message: 'Некорректный email'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false // Не возвращать пароль при запросах
  },
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }]
});

// userSchema.static('findUserByCredentials', function findUserByCredentials(email: string, password: string) {
//   return this.findOne({ email })
//     .then((user) => {
//       if (!user) {
//         return Promise.reject(new Error('Неправильная почта или пароль'));
//       }

//       return bcrypt.compare(password, user.password)
//         .then((matched) => {
//           if (!matched) {
//             return Promise.reject(new Error('Неправильная почта или пароль'));
//           }

//           return user;
//         });
//     });
// });

userSchema.static('findUserByCredentials', function findUserByCredentials(
  email: string,
  password: string
): Promise<IUser> {
  return this.findOne({ email }).select('+password')
    .then((user: IUser | null) => {
      if (!user) {
        return Promise.reject(new Error('Неправильная почта или пароль'));
      }

      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(new Error('Неправильная почта или пароль'));
          }

          return user;
        });
    });
});

export default mongoose.model<IUser, IUserModel>('user', userSchema);

// export default mongoose.model<IUserDocument, IUserModel>('User', userSchema);

// const userSchema = new mongoose.Schema<IUser>({
//   name: {
//     type: String,
//     minlength: 2,
//     maxlength: 30,
//     default: 'Ё-мое'
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//     validate: {
//       validator: (email: string) => validator.isEmail(email),
//       message: 'Некорректный email'
//     }
//   },
//   password: {
//     type: String,
//     required: true,
//     minlength: 6,
//     select: false // Не возвращать пароль при запросах
//   },
//   tokens: [{
//     token: {
//       type: String,
//       required: true
//     }
//   }]
// });

// export default mongoose.model<IUser>('User', userSchema);

