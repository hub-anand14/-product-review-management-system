# 🛍️ Product Review Management System

A full-stack web application where users can view products, submit reviews, and rate products. Admins manage products, while users manage their own reviews.

## ✨ Features

- View products and product details.
- Admin: Add, update, and delete products.
- User: Add, edit, and delete own reviews.
- Product ratings and feedback.
- Admin/User role-based access control.

## 🛠️ Tech Stack

- **Frontend:** React.js, Vite, React Router
- **Hooks:** useState, useEffect
- **Backend:** Node.js, Express.js, REST APIs
- **Database:** MongoDB Atlas, Mongoose
- **Other:** Fetch/Axios, CORS, Git, GitHub
- **Deployment:** Vercel, Render

## 👥 Team Members

| Member | Role |
|---|---|
| ANAND | Team Leader |
| Member 2 Harshit | Frontend Developer |
| Member 3 Pawan | Backend & Database Developer |

## 🗃️ Data Models

**Product**
- name
- category
- price
- description

**Review**
- productId
- userId
- rating (1–5)
- comment

## 🔗 API Endpoints

### Products

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/products` | Get all products |
| GET | `/api/products/:id` | Get product details |
| POST | `/api/products` | Add product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |

### Reviews

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/reviews/:productId` | Get product reviews |
| POST | `/api/reviews` | Add review |
| PUT | `/api/reviews/:id` | Edit own review |
| DELETE | `/api/reviews/:id` | Delete own review |

## ⚙️ Setup Instructions

**1. Clone the repository**
```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd YOUR_PROJECT_FOLDER
```

**2. Backend setup**
```bash
cd backend
npm install
npm run dev
```

Create `backend/.env`:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
```

**3. Frontend setup**

Open another terminal:
```bash
cd frontend
npm install
npm run dev
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000
```

## 🔐 Security

- Never push `.env` to GitHub.
- Use `.env.example` for placeholders.
- Validate requests and handle errors.
- Enforce Admin/User permissions on the backend.
- Configure CORS correctly.

## 🌿 Contribution Guidelines

1. Create a separate Git branch.
2. Commit and push your changes.
3. Create a Pull Request.
4. Get approval before merging into `main`.

## 📸 Screenshots

Add project screenshots here after development.

## 🌐 Deployment Links

- **GitHub:** YOUR_GITHUB_REPOSITORY_URL
- **Frontend:** YOUR_VERCEL_URL
- **Backend:** YOUR_RENDER_URL
