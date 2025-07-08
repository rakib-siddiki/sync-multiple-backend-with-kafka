import { model, Schema } from "mongoose";

const reviewSchema = new Schema(
  {
    reviewer: {
      // Reference to the user who wrote the review
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    profession: {
      // Reference to the FindProfession being reviewed
      type: Schema.Types.ObjectId,
      ref: "FindProfession",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
reviewSchema.index({ profession: 1 });
reviewSchema.index({ reviewer: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ profession: 1, rating: -1 });

export const ReviewModel = model("Review", reviewSchema);
