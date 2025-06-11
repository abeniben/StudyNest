const cron = require('node-cron');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const admin = require('firebase-admin');

const initializeCronJobs = () => {
  // Run every day at 8 AM
  cron.schedule('0 8 * * *', async () => {
    console.log('Running task reminder cron job');
    try {
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const tasks = await Task.find({
        reminder: true,
        status: { $ne: 'Completed' },
        dueDate: { $gte: now, $lte: tomorrow }
      }).populate('userId', 'email fcmToken');

      for (const task of tasks) {
        const user = task.userId;
        if (!user || !user.fcmToken) continue;

        // Create in-app notification
        const notification = new Notification({
          userId: user._id,
          message: `Reminder: Task "${task.title}" is due soon!`,
          taskId: task._id
        });
        await notification.save();

        // Send push notification
        const message = {
          notification: {
            title: 'Task Reminder',
            body: `Your task "${task.title}" is due soon!`
          },
          token: user.fcmToken
        };

        try {
          await admin.messaging().send(message);
          console.log(`Push notification sent for task ${task._id}`);
        } catch (error) {
          console.error(`Failed to send push for task ${task._id}:`, error);
        }
      }
    } catch (error) {
      console.error('Cron job error:', error);
    }
  }, {
    timezone: 'UTC'
  });
};

module.exports = { initializeCronJobs };