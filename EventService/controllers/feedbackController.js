const mongoose = require('mongoose');
const Event = require('../models/eventModel'); // Đường dẫn đến file định nghĩa model Event
const Feedback = require('../models/feedbackModel'); // Đường dẫn đến file định nghĩa model Feedback

const addFeedback = async (req, res) => {
    try {
        const { user_id, event_id, star, content, created_date } = req.body;
        const feedback = new Feedback({ user_id, event_id, star, content, created_date });
        await feedback.save();
        res.status(200).json(feedback);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while adding the feedback' });
    }
};

const updateFeedback = async (req, res) => {
    try {
        const id = req.params.id;
        const updatedFeedback = await Feedback.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!updatedFeedback) {
            return res.status(404).json({ error: 'Feedback not found' });
        }
        res.status(200).json(updatedFeedback);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while updating the feedback' });
    }
};

const deleteFeedback = async (req, res) => {
    try {
        const id = req.params.id;
        const deletedFeedback = await Feedback.findByIdAndDelete(id);
        if (!deletedFeedback) {
            return res.status(404).json({ error: 'Feedback not found' });
        }
        res.status(200).json({ message: 'Feedback is deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while deleting the feedback' });
    }
};

const getAllFeedbacks = async (req, res) => {
    try {
        const { event_id } = req.params;
        const feedbacks = await Feedback.find({ event_id });
        res.status(200).json(feedbacks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching the feedbacks' });
    }
};

module.exports = {
    addFeedback,
    updateFeedback,
    deleteFeedback,
    getAllFeedbacks
};