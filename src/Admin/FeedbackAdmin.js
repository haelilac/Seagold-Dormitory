import React, { useEffect, useState } from "react";
import "./FeedbackAdmin.css";

const FeedbackAdmin = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeedbacks = async () => {
            try {
                const response = await fetch("http://localhost:8000/api/feedback", {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });

                if (!response.ok) throw new Error("Failed to fetch feedbacks.");

                const data = await response.json();
                setFeedbacks(data);
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
