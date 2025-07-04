# Request-Management-System

## Overview
This system facilitates interaction between students and teachers by allowing students to submit requests, such as medical or personal leave, while enabling teachers to review, approve, or reject these requests.

## Setup Instructions

### Prerequisites
- Node.js
- Vue.js
- PostgreSQL
- npm
#### Optional, but some features may have limited functionality without it.
- Azure RMS (for documents storage)
- Redis

### Installation
1. Clone the repository
2. Install dependencies:
```
npm install --ignore-scripts
npm run postinstall
```

### Set up
Create a `.env` file in the `server\api-gateway` directory with the following content:
```properties
PORT=4000

USER_SERVICE_URL=http://localhost:3001
REQUEST_SERVICE_URL=http://localhost:3002
MODULE_SERVICE_URL=http://localhost:3003

JWT_SECRET=secret
```

Create a `.env` file in the `server\<sub-services>` directory with the following content:
```properties
DATABASE_URL=<url_to_database>
DATABASE_PORT=<database_port>
DATABASE_NAME=<database_name>
DATABASE_USERNAME=<username>
DATABASE_PASSWORD=<password>

JWT_SECRET=secret
```

Database Setup
1. Ensure PostgreSQL is running.
2. Execute the SQL scripts in [DDL.txt](https://github.com/CXinCheng/Request-Management-System/blob/sprint01/user-registration/docs/db/Database%20DDL.txt) to set up the database schema.

### Running the application
```
npm run start
```