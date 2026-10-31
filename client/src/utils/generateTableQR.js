
import QRCode from "qrcode";

const WEBSITE_URL =
  import.meta.env.VITE_SITE_URL || window.location.origin;

export const generateTableQR = async (qrToken) => {
  try {
    if (!qrToken || !/^[a-f0-9]{64}$/i.test(qrToken)) {
      throw new Error("Invalid table QR token.");
    }

    const tableURL = `${WEBSITE_URL}/table/${qrToken}`;

    const qrImage = await QRCode.toDataURL(tableURL, {
      width: 400,
      margin: 2,
      errorCorrectionLevel: "H",
      color: {
        dark: "#49352a",
        light: "#ffffff",
      },
    });

    return qrImage;
  } catch (error) {
    console.error("QR generation failed:", error);
    throw error;
  }
};
