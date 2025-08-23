// src/database/mongoose.plugin.ts
import * as mongoose from 'mongoose';

export function applyMongoosePlugins(schema: mongoose.Schema) {
  schema.set('timestamps', true);
  schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
      delete ret._id;
    },
  });
  if (!schema.paths.createdAt) {
    schema.add({
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    });
  }


  schema.pre('save', function() {
    if (this.isModified() && !this.isNew) {
      this.updatedAt = new Date();
    }
  });
}