# Employee Management System

A responsive Employee Management web application built with Node.js, Express.js, MongoDB, and Mongoose. It provides a browser interface and REST API for creating, viewing, updating, and deleting employee records.

## Requirements

- Node.js 18.11 or newer
- MongoDB running locally, or a MongoDB Atlas connection string

## Run locally

1. Install dependencies:

   ```powershell
   npm install
   ```

2. Copy `.env.example` to `.env`.

3. Add the MongoDB connection string:

   ```env
   PORT=3000
   MONGODB_URI=mongodb://127.0.0.1:27017/employee_management
   ```

4. Start the application:

   ```powershell
   npm start
   ```

5. Open `http://localhost:3000`. The health check is available at `/api/health`.

## Employee API

An employee contains `name`, `email`, `department`, `designation`, and `salary`. Name, email, department, designation, and salary are required. Email addresses must be unique.

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/employees` | List all employees |
| GET | `/api/employees/:id` | Get one employee |
| POST | `/api/employees` | Create an employee |
| PUT | `/api/employees/:id` | Replace employee fields |
| PATCH | `/api/employees/:id` | Partially update employee fields |
| DELETE | `/api/employees/:id` | Delete an employee |

Example request body:

```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "department": "Information Technology",
  "designation": "Developer",
  "salary": 45000
}
```

## Deployment

**Deployed application URL:** `https://employee-management-system-xrvu.onrender.com/`

Deploy the application to a Node.js hosting platform such as Render, Railway, or a similar provider. Set `MONGODB_URI` to the hosted MongoDB Atlas connection string and configure the build command as `npm install` and the start command as `npm start`.
