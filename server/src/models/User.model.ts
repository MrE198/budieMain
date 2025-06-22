import mongoose, { Schema, Document, Model, HydratedSingleSubdocument, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

// OAuth Tokens Interface
interface IOAuthTokens {
  provider: 'google' | 'github' | 'facebook';
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
}

// User Profile Interface
interface IUserProfile {
  name: string;
  timezone: string;
  avatar?: string;
  preferences: {
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
      inApp: boolean;
      quietHours: {
        enabled: boolean;
        start: string;
        end: string;
      };
    };
    workingHours: {
      enabled: boolean;
      schedule: {
        [key: string]: {
          enabled: boolean;
          start: string;
          end: string;
        };
      };
    };
    theme: 'light' | 'dark' | 'system';
    language: string;
  };
}

// Base User Interface
interface IUser {
  email: string;
  password: string;
  profile: IUserProfile;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  oauthTokens?: IOAuthTokens[];
  createdAt: Date;
  updatedAt: Date;
}

// Hydrated Document Override Types
interface IUserHydrated {
  oauthTokens?: HydratedSingleSubdocument<IOAuthTokens>[];
}

// User Instance Methods
interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
  generatePasswordResetToken(): string;
  generateEmailVerificationToken(): string;
}

// User Document Type
interface IUserDocument extends IUser, IUserMethods, Document {}

// User Model Type with hydrated overrides
type UserModelType = Model<IUser, {}, IUserMethods, {}, IUserHydrated>;

// OAuth Tokens Schema
const OAuthTokensSchema = new Schema<IOAuthTokens>({
  provider: {
    type: String,
    required: true,
    enum: ['google', 'github', 'facebook']
  },
  accessToken: {
    type: String,
    required: true
  },
  refreshToken: String,
  expiresAt: Date
});

// User Profile Schema
const UserProfileSchema = new Schema<IUserProfile>({
  name: {
    type: String,
    required: true
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  avatar: String,
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true },
      quietHours: {
        enabled: { type: Boolean, default: false },
        start: { type: String, default: '22:00' },
        end: { type: String, default: '08:00' }
      }
    },
    workingHours: {
      enabled: { type: Boolean, default: false },
      schedule: {
        type: Schema.Types.Mixed,
        default: {
          monday: { enabled: true, start: '09:00', end: '17:00' },
          tuesday: { enabled: true, start: '09:00', end: '17:00' },
          wednesday: { enabled: true, start: '09:00', end: '17:00' },
          thursday: { enabled: true, start: '09:00', end: '17:00' },
          friday: { enabled: true, start: '09:00', end: '17:00' },
          saturday: { enabled: false, start: '09:00', end: '17:00' },
          sunday: { enabled: false, start: '09:00', end: '17:00' }
        }
      }
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    language: {
      type: String,
      default: 'en'
    }
  }
}, { _id: false });

// User Schema
const UserSchema = new Schema<IUser, UserModelType, IUserMethods>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  profile: {
    type: UserProfileSchema,
    required: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    select: false
  },
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetExpires: {
    type: Date,
    select: false
  },
  oauthTokens: [OAuthTokensSchema]
}, {
  timestamps: true
});

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ 'profile.name': 'text' });

// Methods
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  const user = this as IUserDocument;
  return bcrypt.compare(candidatePassword, user.password);
};

UserSchema.methods.generatePasswordResetToken = function(): string {
  const user = this as IUserDocument;
  const token = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
  user.passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour
  return token;
};

UserSchema.methods.generateEmailVerificationToken = function(): string {
  const user = this as IUserDocument;
  const token = crypto.randomBytes(32).toString('hex');
  user.emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');
  return token;
};

// Virtual for user's full profile
UserSchema.virtual('displayName').get(function() {
  return this.profile?.name || this.email.split('@')[0];
});

// Toobject transform to safely handle subdocuments
UserSchema.set('toObject', {
  transform: function(doc, ret) {
    // Handle OAuth tokens properly
    if (ret.oauthTokens && Array.isArray(ret.oauthTokens)) {
      ret.oauthTokens = ret.oauthTokens.map((token: any) => {
        // If it's a subdocument, get the plain object
        if (token && typeof token.toObject === 'function') {
          return token.toObject();
        }
        return token;
      });
    }
    delete ret.__v;
    return ret;
  }
});

// toJSON transform
UserSchema.set('toJSON', {
  transform: function(doc, ret) {
    // Handle OAuth tokens properly
    if (ret.oauthTokens && Array.isArray(ret.oauthTokens)) {
      ret.oauthTokens = ret.oauthTokens.map((token: any) => {
        // If it's a subdocument, get the plain object
        if (token && typeof token.toObject === 'function') {
          return token.toObject();
        }
        return token;
      });
    }
    delete ret.password;
    delete ret.__v;
    return ret;
  }
});

// Import crypto for token generation
import crypto from 'crypto';

// Export the model
export const UserModel = mongoose.model<IUser, UserModelType>('User', UserSchema);

// Export types for use in other files
export type { IUser, IUserDocument, IUserMethods, IOAuthTokens, IUserProfile };