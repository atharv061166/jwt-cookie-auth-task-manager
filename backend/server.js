require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const yaml = require('yamljs');

const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const taskRoutes = require('./src/routes/taskRoutes');
const { notFound, errorHandler } = require('./src/middleware/errorHandler');

const app = express();

// CORS configuration - allow frontend origin
const frontendOrigin = process.env.FRONTEND_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: frontendOrigin,
    credentials: true,
  })
);
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

const swaggerDocument = yaml.load(path.join(__dirname, 'src/swagger/swagger.yaml'));
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tasks', taskRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Export app for testing
module.exports = app;

// Only start server if this file is run directly (not in tests)
if (require.main === module) {
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error('Failed to start server', err);
      process.exit(1);
    });
}


