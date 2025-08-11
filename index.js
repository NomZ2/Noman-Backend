const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
app.use(express.json()); // Parse JSON requests

// In-memory task storage
let tasks = [
  { id: 1, title: "Learn Express", completed: false },
  { id: 2, title: "Build a REST API", completed: false },
  { id: 3, title: "Test API with Postman", completed: true },
  { id: 4, title: "Add Swagger Documentation", completed: false },
  { id: 5, title: "Deploy to Server", completed: false }
];

// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Task Manager API",
      version: "1.0.0",
      description: "A simple Task Manager API without a database"
    },
    servers: [{ url: "http://localhost:3000" }]
  },
  apis: ["./index.js"]
};
const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       required:
 *         - title
 *         - completed
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         completed:
 *           type: boolean
 */

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks
 *     responses:
 *       200:
 *         description: List of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 */
app.get('/api/tasks', (req, res) => {
  res.status(200).json({ success: true, data: tasks, message: "Tasks fetched successfully" });
});

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Get a task by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The task ID
 *     responses:
 *       200:
 *         description: Task found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: Task not found
 */
app.get('/api/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.id));
  if (!task) return res.status(404).json({ success: false, message: "Task not found" });
  res.json({ success: true, data: task, message: "Task fetched successfully" });
});

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Task'
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Invalid input
 */
app.post('/api/tasks', (req, res) => {
  const { title, completed } = req.body;
  if (typeof title !== 'string' || typeof completed !== 'boolean') {
    return res.status(400).json({ success: false, message: "Invalid data" });
  }
  const newTask = { id: tasks.length + 1, title, completed };
  tasks.push(newTask);
  res.status(201).json({ success: true, data: newTask, message: "Task created successfully" });
});

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update a task
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Task'
 *     responses:
 *       200:
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Task not found
 */
app.put('/api/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.id));
  if (!task) return res.status(404).json({ success: false, message: "Task not found" });

  const { title, completed } = req.body;
  if (typeof title !== 'string' || typeof completed !== 'boolean') {
    return res.status(400).json({ success: false, message: "Invalid data" });
  }

  task.title = title;
  task.completed = completed;
  res.json({ success: true, data: task, message: "Task updated successfully" });
});

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The task ID
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       404:
 *         description: Task not found
 */
app.delete('/api/tasks/:id', (req, res) => {
  const taskIndex = tasks.findIndex(t => t.id === parseInt(req.params.id));
  if (taskIndex === -1) return res.status(404).json({ success: false, message: "Task not found" });

  const deletedTask = tasks.splice(taskIndex, 1);
  res.json({ success: true, data: deletedTask, message: "Task deleted successfully" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Something went wrong!" });
});

// Start server
app.listen(3000, () => {
  console.log("✅ Server running on http://localhost:3000");
  console.log("📄 Swagger Docs available at http://localhost:3000/api-docs");
});
