import jsPDF from 'jspdf';

interface ReceiptData {
  transactionId: string;
  date: string;
  userName: string;
  userPhone: string;
  amount: number;
  type: string;
  status: string;
  from?: string;
  to?: string;
  fees?: string;
}

// Constants for theme styling
const PDF_CONFIG = {
  colors: {
    primary: [45, 142, 65] as [number, number, number],     // #2D8E41
    secondary: [152, 63, 33] as [number, number, number],   // #983F21
    textMuted: [100, 100, 100] as [number, number, number],
    completed: [45, 142, 65] as [number, number, number],
    pending: [234, 179, 8] as [number, number, number],
    failed: [239, 68, 68] as [number, number, number],
  },
  font: 'helvetica',
};

const loadImageAsBase64 = (url: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('Canvas context not available');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch (error) {
        reject(error);
      }
    };
    img.onerror = () => reject('Image failed to load');
    img.src = url;
  });

const addFooter = (pdf: jsPDF, receiptNumber: string, pageNum: number, totalPages: number) => {
  const footerY = 280;

  pdf.setDrawColor(
    PDF_CONFIG.colors.primary[0],
    PDF_CONFIG.colors.primary[1],
    PDF_CONFIG.colors.primary[2]
  );
  pdf.setLineWidth(0.5);
  pdf.line(20, footerY, 190, footerY);

  pdf.setFontSize(8);
  pdf.setTextColor(...PDF_CONFIG.colors.textMuted);
  pdf.setFont(PDF_CONFIG.font, 'normal');

  pdf.text(`Receipt #: ${receiptNumber}`, 20, footerY + 8);
  pdf.text(`Generated: ${new Date().toLocaleString()}`, 105, footerY + 8, { align: 'center' });
  pdf.text(`Page ${pageNum} of ${totalPages}`, 190, footerY + 8, { align: 'right' });

  pdf.setFontSize(7);
  pdf.text('For inquiries: support@vermi-farm.org | +254 799 616 744', 105, footerY + 16, { align: 'center' });
};

export const generateReceipt = async (data: ReceiptData): Promise<void> => {
  const pdf = new jsPDF();
  pdf.setProperties({
    title: `Receipt ${data.transactionId}`,
    subject: 'Transaction Receipt',
    author: 'Vermi-Farm Admin System',
    keywords: 'receipt, vermi-farm, transaction',
    creator: 'Vermi-Farm System',
  });

  try {
    const totalPages = 1;

    try {
      const logo = await loadImageAsBase64('https://i.postimg.cc/MTpyCg68/logo.png');

      pdf.setGState(pdf.GState({ opacity: 0.08 }));
      pdf.addImage(logo, 'JPEG', 60, 80, 90, 90);
      pdf.setGState(pdf.GState({ opacity: 1 }));
      pdf.addImage(logo, 'JPEG', 15, 10, 25, 25);
    } catch {
      console.warn('Logo load failed, proceeding without watermark.');
    }

    // Headers
    pdf.setFont(PDF_CONFIG.font, 'bold');
    pdf.setFontSize(24);
    pdf.setTextColor(...PDF_CONFIG.colors.primary);
    pdf.text('VERMI-FARM INITIATIVE', 105, 20, { align: 'center' });

    pdf.setFontSize(12);
    pdf.setTextColor(...PDF_CONFIG.colors.textMuted);
    pdf.setFont(PDF_CONFIG.font, 'normal');
    pdf.text('Sustainable Agriculture & Financial Inclusion', 105, 28, { align: 'center' });

    pdf.setFontSize(18);
    pdf.setTextColor(...PDF_CONFIG.colors.secondary);
    pdf.setFont(PDF_CONFIG.font, 'bold');
    pdf.text('TRANSACTION RECEIPT', 105, 45, { align: 'center' });

    pdf.setDrawColor(...PDF_CONFIG.colors.primary);
    pdf.line(20, 55, 190, 55);

    // Transaction Details Section
    pdf.setFontSize(14);
    pdf.setTextColor(...PDF_CONFIG.colors.primary);
    pdf.setFont(PDF_CONFIG.font, 'bold');
    pdf.text('TRANSACTION DETAILS', 20, 70);

    pdf.setDrawColor(200, 200, 200);
    pdf.rect(20, 75, 170, 80);

    pdf.setFontSize(11);
    pdf.setTextColor(0, 0, 0);

    const fields: [string, string][] = [
      ['Transaction ID:', data.transactionId],
      ['Date & Time:', new Date(data.date).toLocaleString()],
      ['Transaction Type:', data.type],
      ['Status:', data.status.toUpperCase()],
      ['Amount:', `KES ${data.amount.toLocaleString()}`],
      ['User Name:', data.userName],
      ['Phone Number:', data.userPhone],
    ];

    if (data.fees) fields.push(['Transaction Fees:', data.fees]);
    if (data.from) fields.push(['From:', data.from]);
    if (data.to) fields.push(['To:', data.to]);

    let y = 85;
    fields.forEach(([label, val]) => {
      pdf.setFont(PDF_CONFIG.font, 'bold');
      pdf.text(label, 25, y);
      pdf.setFont(PDF_CONFIG.font, 'normal');
      const lines = pdf.splitTextToSize(val, 90);
      pdf.text(lines, 90, y);
      y += lines.length > 1 ? 8 * lines.length : 8;
    });

    // Status styling
    const statusColor =
      data.status.toLowerCase() === 'completed'
        ? PDF_CONFIG.colors.completed
        : data.status.toLowerCase() === 'pending'
        ? PDF_CONFIG.colors.pending
        : PDF_CONFIG.colors.failed;

    const yBase = 165;
    pdf.setFillColor(...statusColor);
    pdf.setTextColor(255, 255, 255);
    pdf.roundedRect(30, yBase, 50, 15, 3, 3, 'F');
    pdf.setFont(PDF_CONFIG.font, 'bold');
    pdf.setFontSize(11);
    pdf.text(data.status.toUpperCase(), 55, yBase + 10, { align: 'center' });

    pdf.setFillColor(...PDF_CONFIG.colors.primary);
    pdf.roundedRect(120, yBase, 60, 15, 3, 3, 'F');
    pdf.setFontSize(12);
    pdf.text(`KES ${data.amount.toLocaleString()}`, 150, yBase + 10, { align: 'center' });

    // Security Notes
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(`Security Code: VF-${Date.now().toString().slice(-6)}`, 20, 200);
    pdf.text(`Verification: ${data.transactionId.slice(-8).toUpperCase()}`, 150, 200);

    // Footer
    addFooter(pdf, data.transactionId, 1, totalPages);

    // Save PDF
    pdf.save(`vermi-farm-receipt-${data.transactionId}.pdf`);
  } catch (err) {
    console.error('Receipt generation failed:', err);
  }
};
