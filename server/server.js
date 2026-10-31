import app from "./app.js";
import db from "./config/db.js";

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    const connection = await db.getConnection();

    console.log("MySQL database connected successfully!");

    connection.release();

    app.listen(PORT, () => {
      console.log(`Cafe backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
}

startServer();