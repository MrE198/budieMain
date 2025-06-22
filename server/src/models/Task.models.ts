import mongoose, { Schema, Document } from 'mongoose';
import { Task as ITask } from '@budie/shared';

export interface TaskDocument extends Omit<ITask, 'id'>, Document {
  completedAt?: Date;
}

const subtaskSchema = new Schema({
  id: {
    type: String,
    required: true,
    default: () => new mongoose.Types.ObjectId().toString(),
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  order: {
    type: Number,
    required: true,
  },
}, { _id: false });

const attachmentSchema = new Schema({
  id: {
    type: String,
    required: true,
    default: () => new mongoose.Types.ObjectId().toString(),
  },
  filename: {
    type: String,
    required: true,
  },
  mimeType: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

const taskSchema = new Schema<TaskDocument>({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 2000,
  },
  priority: {
    type: String,
    enum: ['urgent', 'high', 'medium', 'low'],
    default: 'medium',
    index: true,
  },
  aiPriorityScore: {
    type: Number,
    min: 0,
    max: 100,
  },
  dueDate: {
    type: Date,
    index: true,
  },
  category: {
    type: String,
    enum: ['work', 'personal', 'family'],
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
    default: 'pending',
    index: true,
  },
  linkedEvents: [{
    type: String,
  }],
  createdBy: {
    type: String,
    enum: ['user', 'ai-suggestion'],
    default: 'user',
  },
  subtasks: [subtaskSchema],
  attachments: [attachmentSchema],
  completedAt: Date,
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
});

// Indexes for performance
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, dueDate: 1 });
taskSchema.index({ userId: 1, priority: 1 });
taskSchema.index({ userId: 1, category: 1 });
taskSchema.index({ title: 'text', description: 'text' });

// Virtual for overdue status
taskSchema.virtual('isOverdue').get(function() {
  return this.dueDate && this.dueDate < new Date() && this.status !== 'completed';
});

// Pre-save middleware
taskSchema.pre('save', function(next) {
  // Ensure subtasks have proper order
  if (this.subtasks && this.subtasks.length > 0) {
    this.subtasks.forEach((subtask, index) => {
      if (!subtask.order) {
        subtask.order = index;
      }
    });
  }
  next();
});

// Instance methods
taskSchema.methods.complete = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

taskSchema.methods.addSubtask = function(title: string) {
  const order = this.subtasks ? this.subtasks.length : 0;
  this.subtasks.push({
    id: new mongoose.Types.ObjectId().toString(),
    title,
    completed: false,
    order,
  });
  return this.save();
};

// Static methods
taskSchema.statics.findByUser = function(userId: string) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

taskSchema.statics.findOverdue = function(userId: string) {
  return this.find({
    userId,
    dueDate: { $lt: new Date() },
    status: { $ne: 'completed' },
  });
};

export const TaskModel = mongoose.model<TaskDocument>('Task', taskSchema);