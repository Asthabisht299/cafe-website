# ☕ Café Website — Full-Stack Café Management & Online Ordering Platform

<div align="center">

### A modern digital experience for cafés ✨

A full-stack café website designed to simplify customer ordering and café management through a responsive interface, QR-based dine-in ordering, product reviews, and an administrative dashboard.

[![Live Website](https://img.shields.io/badge/♡_Live_Website-Visit_Café-9B7653?style=for-the-badge&logo=vercel&logoColor=white)](https://cafe-website-six-theta.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Source_Code-5C4033?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Asthabisht299/cafe-website)

![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=flat&logo=mysql&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=flat&logo=cloudinary&logoColor=white)

</div>

---

## 🌿 About the Project

The Café Website is a full-stack web application developed to provide customers with a convenient online café experience while helping café administrators manage daily operations.

Customers can explore the menu, view product details, add items to their cart, place takeaway orders, and order directly from their table using QR codes.

The platform also supports product ratings and reviews, order tracking, customer enquiries, and WhatsApp contact functionality.

Administrators can manage products, categories, orders, tables, customer enquiries, and product reviews through a dedicated dashboard.

**Project Goal:** To bring customer ordering and café management together in one easy-to-use digital platform.

## ✨ Key Features

### ☕ Customer Features

- Responsive homepage and café information pages.
- Browse menu items and categories.
- Dynamic featured products on the homepage.
- Live menu search and product discovery.
- View individual product details.
- Add products to cart and manage quantities.
- Place takeaway orders.
- QR-based dine-in ordering.
- Table verification for dine-in orders.
- Order confirmation and order tracking.
- Product ratings and customer reviews.
- Contact form with customer phone number support.
- WhatsApp contact button.
- Newsletter subscription.
- Café gallery, testimonials, and opening-hours information.
- Instagram section with configurable social media link.

### 🎀 Admin Dashboard

- Secure admin authentication.
- Dashboard with order statistics.
- Add, edit, and delete products.
- Manage product categories.
- Upload and manage product images.
- View and manage customer orders.
- Update order statuses.
- Manage customer enquiries.
- Manage café tables.
- Generate individual and bulk table QR codes.
- View and manage product reviews.

### 🔐 Security & Backend Features

- RESTful API architecture.
- Password hashing using bcrypt.
- JWT-based authentication.
- HTTP-only authentication cookies.
- Protected admin routes.
- Backend input validation.
- Centralized error handling.
- Image upload validation.
- Secure table QR token verification.
- Database integration using MySQL-compatible TiDB Cloud.
- Transaction-based order creation.
- Order tracking using secure tracking tokens.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React | Frontend development |
| Vite | Frontend build tool |
| JavaScript | Application logic |
| HTML5 & CSS3 | Structure and styling |
| Node.js | Backend runtime |
| Express.js | REST API development |
| MySQL / TiDB Cloud | Database |
| mysql2 | Database connectivity |
| JWT | Authentication |
| bcrypt | Password hashing |
| Cloudinary | Image storage |
| Multer | Image upload handling |
| Axios | API communication |
| Git & GitHub | Version control |
| Vercel | Frontend deployment |
| Render | Backend deployment |

---

## 🏗️ Project Architecture

The application follows a client-server architecture.

```text
                 CUSTOMER / ADMIN
                        |
                        v
               React + Vite Frontend
                        |
                        v
                  Axios Requests
                        |
                        v
               Node.js + Express
                    Backend
                        |
             +----------+----------+
             |          |          |
             v          v          v
           TiDB     Cloudinary   JWT Auth
         Database   Image Store  Security
```

## 📂 Project Structure

```text
cafe-website/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── admin/
│   │   ├── config/
│   │   ├── api/
│   │   └── ...
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── database/
│   │   └── migrations/
│   ├── uploads/
│   ├── package.json
│   └── server.js
│
└── README.md
```

*The structure above represents the main application areas; individual filenames may vary.*

---

## ⚙️ Installation & Setup

Follow these steps to run the project locally.

### 1. Clone the repository

```bash
git clone https://github.com/Asthabisht299/cafe-website.git
```

```bash
cd cafe-website
```

### 2. Set up the backend

```bash
cd server
npm install
```

Create a `.env` file inside the `server` directory.

Add your own configuration:

```env
PORT=5000
NODE_ENV=development

CLIENT_URL=http://localhost:5173

DB_HOST=your_database_host
DB_PORT=3306
DB_USER=your_database_username
DB_PASSWORD=your_database_password
DB_NAME=cafe_db

JWT_SECRET=your_jwt_secret
COOKIE_SAME_SITE=lax

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

For a cloud database requiring SSL, configure the appropriate CA certificate using the backend's supported SSL environment variable.

### 3. Start the backend

```bash
npm run dev
```

The backend should run at:

`http://localhost:5000`

### 4. Set up the frontend

Open another terminal:

```bash
cd client
npm install
```

Create a `.env` file inside the `client` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

### 5. Start the frontend

```bash
npm run dev
```

Open the local development URL displayed by Vite, usually:

`http://localhost:5173`

---

## ☁️ Deployment

The project uses cloud services for deployment and storage.

| Service | Purpose |
|---|---|
| Vercel | Frontend hosting |
| Render | Backend hosting |
| TiDB Cloud | MySQL-compatible cloud database |
| Cloudinary | Product image storage |

**Live Project:** [Visit Café Website](https://cafe-website-six-theta.vercel.app)

**Source Code:** [GitHub Repository](https://github.com/Asthabisht299/cafe-website)

---

## 💳 Ordering & Payment Information

The project currently supports:

- Takeaway ordering.
- QR-based dine-in ordering.
- Table verification.
- Payment at the café counter.
- Cash payment at pickup.
- Order confirmation and tracking.

Online payment gateway integration and home delivery are planned future enhancements.

---

## 🚀 Future Improvements

- Online payment gateway integration (Razorpay / UPI).
- Kitchen Order Display System.
- Home delivery functionality.
- Advanced sales and revenue analytics.
- Customer accounts and order history.
- Inventory and stock management.
- Coupons, discounts, and promotional offers.
- Customer loyalty and rewards system.
- Email, SMS, and order notifications.
- Advanced search and filtering.
- Automated database backups.

---

## 🎯 What I Learned

Through this project, I gained practical experience in:

- Developing a full-stack application using React and Node.js.
- Connecting a frontend with REST APIs.
- Designing and managing relational databases.
- Implementing authentication and protected routes.
- Building CRUD operations.
- Handling image uploads using Cloudinary.
- Creating QR-based ordering functionality.
- Implementing product ratings and reviews.
- Building customer order tracking.
- Deploying frontend and backend applications.
- Managing cloud database connectivity.
- Debugging real-world integration issues.

---

## 👩‍💻 Developed By

<div align="center">

### Astha Bisht 🌷

B.Tech Computer Science & Engineering

[![GitHub](https://img.shields.io/badge/GitHub-Asthabisht299-5C4033?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Asthabisht299)

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-9B7653?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/astha-bisht-s291105)

*Built with ☕, creativity, and lots of debugging.*

</div>

---

<div align="center">

### ✨ Thank you for visiting! ✨

If you find this project interesting, consider giving the repository a ⭐.

</div>
