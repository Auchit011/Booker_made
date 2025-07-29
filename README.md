
---

## 🚀 Live Demo


- **Backend API:** [https://booker-made.onrender.com/api](https://booker-made.onrender.com/api)

---

## 🛠️ Tech Stack

- **Frontend:** React (Create React App), Axios, Context API
- **Backend:** Node.js, Express, MongoDB (Atlas), Mongoose, JWT Auth
- **Deployment:** Vercel (frontend), Render (backend), MongoDB Atlas (database)

---

## ⚡ Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/Auchit011/Booker_made.git
cd booker_application
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

- Create a `.env` file in `/backend` with:
  ```
  MONGODB_URI=your_mongodb_atlas_connection_string
  JWT_SECRET=your_jwt_secret
  PORT=5000
  ```

- **Start the backend locally:**
  ```bash
  npm start
  ```

---

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

- Create a `.env` file in `/frontend` with:
  ```
  REACT_APP_API_URL=https://booker-made.onrender.com/api
  ```
  (For local dev, you can use your local backend URL.)

- **Start the frontend locally:**
  ```bash
  npm start
  ```

---

## 🌐 Deployment

### Backend (Render)
- Push your code to GitHub.
- Create a new Web Service on [Render](https://render.com/).
- Set the root directory to `backend`.
- Add environment variables (`MONGODB_URI`, `JWT_SECRET`, etc.).
- Render will auto-deploy and give you a live API URL.

### Frontend (Vercel)
- Import your repo on [Vercel](https://vercel.com/).
- Set the root directory to `frontend`.
- Set environment variable: `REACT_APP_API_URL` to your Render backend API URL.
- Vercel will auto-deploy and give you a live frontend URL.

---

## 📚 Features

- User authentication (JWT)
- Booking management
- Dashboard for users
- Responsive UI

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License

[MIT](LICENSE)

---

## 🙋‍♂️ Author

- [Auchit011](https://github.com/Auchit011)

---
