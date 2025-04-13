import React, { useEffect, useState } from "react";
import "./FeedbackAdmin.css";
import { getAuthToken } from "../utils/auth";
import { useDataCache } from "../contexts/DataContext";
import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;
window.Echo = new Echo({
  broadcaster: "pusher",
  key: "fea5d607d4b38ea09320",
  cluster: "ap1",
  forceTLS: true,
});

const FeedbackAdmin = () => {
    const { getCachedData, updateCache } = useDataCache();
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const cachedFeedback = getCachedData("feedback");

    // Realtime listener
    useEffect(() => {
        const channel = window.Echo.channel("feedback");

        channel.listen(".new.feedback", (e) => {
            console.log("📥 New Feedback Received:", e.feedback);
            const updated = [...(getCachedData("feedback") || []), e.feedback];
            updateCache("feedback", updated);
            setFeedbacks(updated);
        });

        return () => window.Echo.leave("feedback");
    }, []);

    // Initial fetch or use cached
    useEffect(() => {
        if (cachedFeedback?.length) {
            setFeedbacks(cachedFeedback);
            setLoading(false);
            return;
        }

        const fetchFeedbacks = async () => {
            try {
                const response = await fetch("https://seagold-laravel-production.up.railway.app/api/feedback", {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${getAuthToken()}`,
                    },
                });

                if (!response.ok) throw new Error("Failed to fetch feedbacks.");

                const data = await response.json();
                setFeedbacks(data);
                updateCache("feedback", data);
            } catch (error) {
                console.error("Error fetching feedbacks:", error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchFeedbacks();
    }, []);

    if (loading) return <p>Loading feedbacks...</p>;

    return (
        <div className="feedback-container">
            <h2 className="feedback-header">User Feedback</h2>
            {feedbacks.length === 0 ? (
                <p>No feedbacks available.</p>
            ) : (
                <table className="feedback-table">
                    <thead>
                        <tr>
                            <th>User Email</th>
                            <th>Emoji Rating</th>
                            <th>Comment</th>
                            <th>Submitted At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {feedbacks.map((feedback) => (
                            <tr key={feedback.id}>
                                <td>{feedback.user_email || "Anonymous"}</td>
                                <td>{feedback.emoji_rating}</td>
                                <td>{feedback.comment || "No comment"}</td>
                                <td>{new Date(feedback.created_at).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default FeedbackAdmin;
