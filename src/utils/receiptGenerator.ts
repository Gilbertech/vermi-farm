import jsPDF from "jspdf";

export const generateReceipt = async () => {
  try {
    const pdf = new jsPDF();

    pdf.setFontSize(16);
    pdf.text("VERMI-FARM YETU", 20, 20);

    // Load QR Code from Google Chart API
    const qrURL = "https://chart.googleapis.com/chart?cht=qr&chs=150x150&chl=https://vermi-farm.org/verify/TX-123456";
    const qrImage = await loadImageAsBase64(qrURL);

    // Add QR code to PDF
    pdf.addImage(qrImage, "PNG", 140, 10, 50, 50);

    // Add simple text fields
    pdf.setFontSize(12);
    pdf.text("Transaction ID: TX-123456", 20, 40);
    pdf.text("Amount: KES 1,500", 20, 50);
    pdf.text("Status: COMPLETED", 20, 60);

    // Trigger download
    pdf.save("vermi-receipt.pdf");
  } catch (err) {
    console.error("PDF generation failed:", err);
  }
};

const loadImageAsBase64 = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("No canvas context");
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => reject("QR image failed to load.");
    img.src = url;
  });
};
