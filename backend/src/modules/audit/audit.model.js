import mongoose from 'mongoose';

const auditSchema = new mongoose.Schema(
  {
    tenantId: { type: String, required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true }, // e.g. 'lead.created', 'auth.login'
    resource: { type: String, required: true },
    resourceId: mongoose.Schema.Types.ObjectId,
    metadata: mongoose.Schema.Types.Mixed,
    ipAddress: String,
    userAgent: String,
  },
  { timestamps: true, strict: true }
);

auditSchema.index({ tenantId: 1, createdAt: -1 });
auditSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('AuditLog', auditSchema);
