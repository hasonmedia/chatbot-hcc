'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Rating, RatingButton } from '@/components/ui/shadcn-io/rating';
import { createRating } from '@/services/ratingService';
import { useToast } from '@/hooks/useToast';
import { Loader2 } from 'lucide-react';

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
  sessionId: string | null;
}

const FeedbackModal = ({ open, onClose, sessionId }: FeedbackModalProps) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error: showError } = useToast();

  const handleSubmit = async () => {
    if (!sessionId) {
      showError('Không tìm thấy session ID');
      return;
    }

    if (rating === 0) {
      showError('Vui lòng chọn số sao đánh giá');
      return;
    }

    setIsSubmitting(true);

    try {
      await createRating(sessionId, {
        rate: rating,
        comment: feedback.trim(),
      });

      success('Cảm ơn bạn đã đánh giá!');

      // Reset form
      setRating(0);
      setFeedback('');
      
      // Đóng modal
      onClose();
    } catch (error) {
      console.error('Lỗi khi gửi đánh giá:', error);
      showError('Không thể gửi đánh giá. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Đánh giá trải nghiệm</DialogTitle>
          <DialogDescription>
            Hãy cho chúng tôi biết trải nghiệm của bạn với chatbot
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Rating Component */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm font-medium">Bạn đánh giá thế nào?</p>
            <Rating value={rating} onValueChange={setRating}>
              {Array.from({ length: 5 }).map((_, index) => (
                <RatingButton key={index} />
              ))}
            </Rating>
          </div>

          {/* Feedback Textarea */}
          <div className="space-y-2">
            <label htmlFor="feedback" className="text-sm font-medium">
              Góp ý của bạn (tùy chọn)
            </label>
            <Textarea
              id="feedback"
              placeholder="Chia sẻ trải nghiệm của bạn..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Bỏ qua
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Gửi đánh giá
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackModal;
