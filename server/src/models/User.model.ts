import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { User as IUser } from '@budie/shared';
import { encrypt, decrypt } from '../utils/encryption';

export interface UserDocument extends Omit<IUser, 'id'>, Document {
  password: string;
  emailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  comparePassword(password: string): Promise<boolean>;
}

const userSchema = new Schema<UserDocument>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  profile: {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    timezone: {
      type: String,
      required: true,
      default: 'UTC',
    },
    avatarUrl: String,
    preferences: {
      notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        push: { type: Boolean, default: true },
        inApp: { type: Boolean, default: true },
        quietHours: {
          enabled: { type: Boolean, default: false },
          start: { type: String, default: '22:00' },
          end: { type: String, default: '08:00' },
        },
      },
      workingHours: {
        enabled: { type: Boolean, default: false },
        schedule: {
          type: Map,
          of: {
            enabled: Boolean,
            start: String,
            end: String,
          },
        },
      },
      theme: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'system',
      },
      language: {
        type: String,
        default: 'en',
      },
    },
  },
  integrations: {
    google: {
      accessToken: String,
      refreshToken: String,
      expiresAt: Date,
      scope: [String],
    },
    microsoft: {
      accessToken: String,
      refreshToken: String,
      expiresAt: Date,
      scope: [String],
    },
    whatsapp: {
      phoneNumber: String,
      verified: Boolean,
      businessAccountId: String,
    },
  },
  dataRetention: {
    consentDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    retentionPeriod: {
      type: Number,
      default: 365, // days
    },
    dataDeletionScheduled: Date,
  },
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      delete ret.password;
      delete ret.emailVerificationToken;
      delete ret.passwordResetToken;
      delete ret.passwordResetExpires;
      return ret;
    },
  },
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ 'profile.name': 'text' });

// Pre-save middleware
userSchema.pre('save', async function(next) {
  // Hash password if modified
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }

  // Encrypt OAuth tokens
  if (this.isModified('integrations.google.accessToken') && this.integrations.google?.accessToken) {
    this.integrations.google.accessToken = encrypt(this.integrations.google.accessToken);
  }
  if (this.isModified('integrations.google.refreshToken') && this.integrations.google?.refreshToken) {
    this.integrations.google.refreshToken = encrypt(this.integrations.google.refreshToken);
  }
  if (this.isModified('integrations.microsoft.accessToken') && this.integrations.microsoft?.accessToken) {
    this.integrations.microsoft.accessToken = encrypt(this.integrations.microsoft.accessToken);
  }
  if (this.isModified('integrations.microsoft.refreshToken') && this.integrations.microsoft?.refreshToken) {
    this.integrations.microsoft.refreshToken = encrypt(this.integrations.microsoft.refreshToken);
  }

  next();
});

// Methods
userSchema.methods.comparePassword = async function(password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

// Virtual for decrypted tokens
userSchema.virtual('decryptedTokens').get(function() {
  const tokens: any = {};
  
  if (this.integrations.google?.accessToken) {
    tokens.google = {
      ...this.integrations.google.toObject(),
      accessToken: decrypt(this.integrations.google.accessToken),
      refreshToken: this.integrations.google.refreshToken ? decrypt(this.integrations.google.refreshToken) : undefined,
    };
  }
  
  if (this.integrations.microsoft?.accessToken) {
    tokens.microsoft = {
      ...this.integrations.microsoft.toObject(),
      accessToken: decrypt(this.integrations.microsoft.accessToken),
      refreshToken: this.integrations.microsoft.refreshToken ? decrypt(this.integrations.microsoft.refreshToken) : undefined,
    };
  }
  
  return tokens;
});

export const UserModel = mongoose.model<UserDocument>('User', userSchema);