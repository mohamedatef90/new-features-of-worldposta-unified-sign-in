import React, { useState } from 'react';
import { Modal, Button, Icon, FormField } from '@/components/ui';

interface FeedbackSystemProps {
    position?: 'default' | 'raised';
}

export const FeedbackSystem: React.FC<FeedbackSystemProps> = ({ position = 'default' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [category, setCategory] = useState('General Feedback');
    const [comments, setComments] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const positionClass = position === 'raised' ? 'bottom-20 right-6' : 'bottom-6 right-6';

    const handleOpen = () => {
        setIsOpen(true);
        // Reset state when opening
        setRating(0);
        setHoverRating(0);
        setCategory('General Feedback');
        setComments('');
        setSubmitted(false);
        setIsLoading(false);
    };

    const handleClose = () => setIsOpen(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            alert('Please select a rating.');
            return;
        }
        setIsLoading(true);
        console.log({
            rating,
            category,
            comments,
            timestamp: new Date().toISOString()
        });
        
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            setSubmitted(true);
            setTimeout(() => {
                handleClose();
            }, 3000); // Close modal after 3 seconds
        }, 1500);
    };

    const StarRating = () => (
        <div className="flex justify-center items-center my-4 space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                    aria-label={`Rate ${star} out of 5 stars`}
                >
                    <Icon
                        name={(hoverRating || rating) >= star ? 'fas fa-star' : 'far fa-star'}
                        className={`text-3xl cursor-pointer transition-colors duration-200 ${
                            (hoverRating || rating) >= star ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-500'
                        }`}
                    />
                </button>
            ))}
        </div>
    );

    return (
        <>
            <div className={`fixed ${positionClass} z-50`}>
                <Button
                    variant="secondary"
                    onClick={handleOpen}
                    className="rounded-full !p-0 w-12 h-12 shadow-lg hover:scale-110 transform transition-transform hover:shadow-xl"
                    aria-label="Give feedback"
                >
                    <Icon name="fas fa-bullhorn" className="text-lg" />
                </Button>
            </div>

            <Modal isOpen={isOpen} onClose={handleClose} title={submitted ? "Thank You!" : "Share Your Feedback"} size="lg">
                {submitted ? (
                    <div className="text-center py-8">
                        <Icon name="fas fa-check-circle" className="text-5xl text-green-500 mb-4" />
                        <p className="text-lg text-gray-700 dark:text-gray-200">Your feedback has been submitted successfully.</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">We appreciate you taking the time to help us improve.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-center text-[#293c51] dark:text-gray-300 mb-2">How was your experience?</label>
                                <StarRating />
                            </div>
                            <FormField
                                id="feedback-category"
                                name="category"
                                label="Feedback Category"
                                as="select"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                <option>General Feedback</option>
                                <option>Bug Report</option>
                                <option>Feature Request</option>
                                <option>UI/UX Suggestion</option>
                            </FormField>
                            <FormField
                                id="feedback-comments"
                                name="comments"
                                label="Comments"
                                as="textarea"
                                rows={5}
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                                placeholder="Tell us more about your experience or suggestions..."
                            />
                        </div>
                        <div className="mt-6 flex justify-end space-x-2">
                            <Button type="button" variant="ghost" onClick={handleClose}>Cancel</Button>
                            <Button type="submit" isLoading={isLoading} disabled={rating === 0 || isLoading}>Submit Feedback</Button>
                        </div>
                    </form>
                )}
            </Modal>
        </>
    );
};