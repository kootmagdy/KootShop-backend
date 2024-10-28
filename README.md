# KootShop Backend
Kootshop Backend is the server-side API for a Ecommerce platform that focuses on delivering products to users.

## Installation

### Clone the repository:
`git clone https://github.com/kootmagdy/kootshop-backend`  
`cd kootshop-backend`

### Install dependencies:
`npm install`

### Set up environment variables: Create a .env file in the root directory and define the following:
`MONGO_URI=<Your MongoDB connection string>`
`JWT_SECRET=<Your JWT secret>`
`PORT=<Port number>`
`MONGO_URI=<Your MongoDB connection string>`  
`JWT_SECRET=<Your JWT secret>`  
`PORT=<Port number>`  
`EMAIL_USERNAME=<email user>`
`EMAIL_PASSWORD=<email password>`
`EMAIL_HOST=<email host>`
`EMAIL_PORT=<email port>`

### Run the application:
`npm start`

## Features
- User Management: Handles user registration, login, reset password.
- Role-Based Access: Provides different access levels for users (admin, regular users).
- Error Handling & Validation: Built-in validation for requests and proper error handling.
- JWT Authentication: Ensures secure access to the platform with JSON Web Tokens.

## Tech Stack
- Node.js: JavaScript runtime for backend development.
- Express.js: Web framework for building RESTful APIs.
- MongoDB: NoSQL database for storing user, products.
- Mongoose: ODM for MongoDB to easily interact with the database.
- JWT (JSON Web Tokens): For secure user authentication and authorization.
- Bcrypt.js: Password hashing for enhanced security.


## Development
Node.js version: 14.x and above
Database: MongoDB Atlas or local MongoDB instance

## Contributing
Contributions are welcome! Please open a pull request or create an issue to discuss your ideas.

### Author   
[koot magdy](https://github.com/kootmagdy)