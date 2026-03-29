import React, { useState } from 'react';
import { Star, MessageCircle, CheckCircle } from 'lucide-react';
import api from '../../../services/api';

const FeedbackForm = ({ type = 'showroom', bikeId = null, onComplete }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hover, setHover] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/feedback', { rating, comment, type, bikeId });
      setSubmitted(true);
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 2000);
    } catch (err) {
      alert('Failed to submit feedback');
    }
  };

  if (submitted) {
    return (
      <div className="py-20 text-center animate-in fade-in zoom-in duration-500">
         <CheckCircle className="w-16 h-16 text-primary mx-auto mb-6" />
         <h2 className="text-3xl font-black uppercase italic">Feedback Received!</h2>
         <p className="text-gray-500 mt-2">Thank you for helping us evolve.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center">
         <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 mb-6">How was your {type} experience?</p>
         <div className="flex space-x-3 mb-10">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                className="transition-all transform hover:scale-125 focus:outline-none"
              >
                <Star 
                  className={`w-10 h-10 ${
                    (hover || rating) >= star ? 'text-primary fill-primary' : 'text-gray-800'
                  }`} 
                />
              </button>
            ))}
         </div>
      </div>

      <div className="space-y-4">
         <div className="relative">
            <MessageCircle className="absolute left-6 top-6 w-5 h-5 text-gray-600" />
            <textarea 
              rows="4" 
              placeholder="Your thoughts, suggestions, or complaints..." 
              className="w-full bg-[#f5f5f7] border border-gray-200 rounded-[32px] p-8 pl-16 outline-none focus:border-primary resize-none font-medium"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
         </div>
         <button 
           onClick={handleSubmit}
           disabled={!rating}
           className="btn-primary w-full py-5 text-xl font-black uppercase tracking-widest disabled:opacity-30"
         >
           DISPATCH FEEDBACK
         </button>
      </div>
    </div>
  );
};

export default FeedbackForm;
