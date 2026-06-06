import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../../contexts/AuthProvider";
import type { Review } from "../../types";

type Props = {
  reviewedUserId: string;
};

const Reviews = ({ reviewedUserId }: Props) => {
  const { userId, userName } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const currentUserReview = useMemo(
    () => reviews.find((review) => review.reviewing_user_id === userId),
    [reviews, userId],
  );

  const canReview =
    !loading && Boolean(userId) && userId !== reviewedUserId && !currentUserReview;
  const canEdit = !loading && Boolean(currentUserReview);

  const loadReviews = async () => {
    if (!reviewedUserId) return;

    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({ id: reviewedUserId });
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/get_reviews_for_user?${params}`,
      );

      if (!response.ok) {
        throw new Error("Failed to load reviews");
      }

      const data: Review[] = await response.json();
      setReviews(data);
    } catch (error) {
      console.error("Error loading reviews:", error);
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [reviewedUserId]);

  useEffect(() => {
    if (!currentUserReview) {
      setRating(5);
      setComment("");
      return;
    }

    setRating(currentUserReview.rating);
    setComment(currentUserReview.comment);
  }, [currentUserReview]);

  const submitReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!userId || userId === reviewedUserId) return;

    setSubmitting(true);
    setError("");

    const params = new URLSearchParams({
      rating: String(rating),
      comment,
    });

    const endpoint = currentUserReview ? "/edit_review" : "/new_review";

    if (currentUserReview) {
      params.append("id", String(currentUserReview.id));
    } else {
      params.append("reviewing_user_id", userId);
      params.append("reviewing_username", userName || "Unknown user");
      params.append("reviewed_user_id", reviewedUserId);
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}${endpoint}?${params}`,
        {
          method: currentUserReview ? "PUT" : "POST",
        },
      );

      if (!response.ok) {
        throw new Error(
          currentUserReview ? "Failed to edit review" : "Failed to add review",
        );
      }

      const savedReview: Review = await response.json();

      setReviews((currentReviews) => {
        if (currentUserReview) {
          return currentReviews.map((review) =>
            review.id === savedReview.id ? savedReview : review,
          );
        }

        return [savedReview, ...currentReviews];
      });
    } catch (error) {
      console.error("Error saving review:", error);
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Reviews</h2>
          <p className="mt-1 text-sm text-slate-600">
            {reviews.length > 0
              ? `${reviews.length} review(s), average ${averageRating.toFixed(1)} / 5`
              : "No reviews yet."}
          </p>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {(canReview || canEdit) && (
        <form onSubmit={submitReview} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[10rem_minmax(0,1fr)]">
            <label className="space-y-2">
              <span className="block text-sm font-semibold text-slate-700">
                Rating
              </span>
              <select
                value={rating}
                onChange={(event) => setRating(Number(event.target.value))}
                disabled={submitting}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200 disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="block text-sm font-semibold text-slate-700">
                Comment
              </span>
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                rows={3}
                required
                disabled={submitting}
                placeholder="Share your experience with this user"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </label>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !comment.trim()}
              className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-orange-300 disabled:active:scale-100"
            >
              {submitting
                ? "Saving..."
                : currentUserReview
                  ? "Update Review"
                  : "Add Review"}
            </button>
          </div>
        </form>
      )}

      {!userId && (
        <p className="mt-5 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Log in to leave a review.
        </p>
      )}

      {userId === reviewedUserId && (
        <p className="mt-5 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Reviews from other users will appear here.
        </p>
      )}

      <div className="mt-5 space-y-3">
        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
            Loading reviews...
          </div>
        ) : reviews.length > 0 ? (
          reviews.map((review) => (
            <article
              key={review.id}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="font-semibold text-slate-900">
                  {review.reviewing_username}
                </h3>
                <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                  {review.rating} / 5
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-700">
                {review.comment}
              </p>
            </article>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
            No reviews have been posted for this user.
          </div>
        )}
      </div>
    </section>
  );
};

export default Reviews;