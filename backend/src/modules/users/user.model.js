import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    tenantId:  { type: String, required: true, index: true },
    firstName: { type: String, required: true, trim: true },
    lastName:  { type: String, required: true, trim: true },
    email:     { type: String, required: true, lowercase: true, trim: true },
    password:  { type: String, required: true, minlength: 8, select: false },
    role:      { type: String, enum: ['admin', 'manager', 'sales'], default: 'sales' },
    avatar:    String,
    phone:     String,
    isActive:  { type: Boolean, default: true },
    lastLogin: Date,
    refreshTokens:        { type: [String], select: false },
    passwordResetToken:   { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

userSchema.index({ email: 1, tenantId: 1 }, { unique: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.set('toJSON', { virtuals: true });

export default mongoose.model('User', userSchema);
