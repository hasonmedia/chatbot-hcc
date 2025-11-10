// @/types/feedback.ts

export interface FeedbackPayload {
  rating: number;
  feedback: string;
}

export interface CreateRatingRequest {
  rate: number;
  comment: string;
}

export interface CreateRatingResponse {
  message: string;
  rating: {
    id: number;
    session_id: number;
    rate: number;
    comment: string;
    created_at: string;
  };
}

export interface GetRatingResponse {
  id: number;
  session_id: number;
  rate: number;
  comment: string;
  created_at: string;
}

export interface CheckRatingResponse {
  is_rated: boolean;
}
