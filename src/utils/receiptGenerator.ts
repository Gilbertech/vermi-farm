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

const loadImageAsBase64 = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      try {
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      } catch (error) {
        reject(error);
      }
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = url;
  });
};

export const generateReceipt = async (data: ReceiptData): Promise<void> => {
  try {
    const pdf = new jsPDF();

    // Load Logo
    let logoBase64 = '';
    try {
      logoBase64 = await loadImageAsBase64('https://i.postimg.cc/MTpyCg68/logo.png');
      pdf.setGState(pdf.GState({ opacity: 0.1 }));
      pdf.addImage(logoBase64, 'JPEG', 60, 80, 90, 90);
      pdf.setGState(pdf.GState({ opacity: 1 }));
      pdf.addImage(logoBase64, 'JPEG', 15, 10, 25, 25);
    } catch (e) {
      console.warn('Could not load logo:', e);
    }

    // Header
    pdf.setFontSize(24);
    pdf.setTextColor(45, 142, 65);
    pdf.setFont('helvetica', 'bold');
    pdf.text('VERMI-FARM YETU', 50, 20);

    pdf.setFontSize(12);
    pdf.setTextColor(100, 100, 100);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Sustainable Agriculture Solutions', 50, 28);

    pdf.setFontSize(18);
    pdf.setTextColor(152, 63, 33); // #983F21
    pdf.setFont('helvetica', 'bold');
    pdf.text('TRANSACTION RECEIPT', 105, 45, { align: 'center' });

    // Meta Info
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Receipt #: ${data.transactionId}`, 150, 15);
    pdf.text(`Generated: ${new Date().toLocaleString()}`, 150, 22);

    pdf.setDrawColor(45, 142, 65);
    pdf.line(20, 55, 190, 55);

    pdf.setFontSize(14);
    pdf.setTextColor(45, 142, 65);
    pdf.text('TRANSACTION DETAILS', 20, 70);

    pdf.setDrawColor(200, 200, 200);
    pdf.rect(20, 75, 170, 80);

    // ✅ Add QR Code using Google's Chart API
    const qrURL = `https://chart.googleapis.com/chart?cht=qr&chs=128x128&chl=${encodeURIComponent(
      `https://vermi-farm.org/verify/${data.transactionId}`
    )}`;
    const qrBase64 = await loadImageAsBase64(qrURL);
    pdf.addImage(qrBase64, 'PNG', 155, 70, 30, 30);

    // Transaction Details
    pdf.setFontSize(11);
    pdf.setTextColor(0, 0, 0);

    const details = [
      ['Transaction ID:', data.transactionId],
      ['Date & Time:', new Date(data.date).toLocaleString()],
      ['Transaction Type:', data.type],
      ['Status:', data.status.toUpperCase()],
      ['Amount:', `KES ${data.amount.toLocaleString()}`],
      ['User Name:', data.userName],
      ['Phone Number:', data.userPhone],
    ];

    if (data.fees) details.push(['Transaction Fees:', data.fees]);
    if (data.from) details.push(['From:', data.from]);
    if (data.to) details.push(['To:', data.to]);

    let y = 85;
    details.forEach(([label, value]) => {
      pdf.setFont('helvetica', 'bold');
      pdf.text(label, 25, y);
      pdf.setFont('helvetica', 'normal');
      const lines = pdf.splitTextToSize(value, 100);
      pdf.text(lines, 90, y);
      y += lines.length > 1 ? 8 * lines.length : 8;
    });

    // Status Badge
    const statusY = 165;
    const status = data.status.toLowerCase();
    if (status === 'completed') {
      pdf.setFillColor(34, 197, 94);
    } else if (status === 'pending') {
      pdf.setFillColor(234, 179, 8);
    } else {
      pdf.setFillColor(239, 68, 68);
    }
    pdf.setTextColor(255, 255, 255);
    pdf.roundedRect(20, statusY, 40, 12, 2, 2, 'F');
    pdf.setFontSize(10);
    pdf.text(data.status.toUpperCase(), 40, statusY + 8, { align: 'center' });

    // Amount Highlight
    pdf.setFillColor(45, 142, 65);
    pdf.roundedRect(130, statusY, 60, 12, 2, 2, 'F');
    pdf.setFontSize(12);
    pdf.text(`KES ${data.amount.toLocaleString()}`, 160, statusY + 8, { align: 'center' });

    // Footer
    const footerY = 200;
    pdf.setDrawColor(45, 142, 65);
    pdf.line(20, footerY, 190, footerY);

    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.setFont('helvetica', 'normal');
    pdf.text('This is a computer-generated receipt and does not require a signature.', 105, footerY + 10, { align: 'center' });

    pdf.setFontSize(9);
    pdf.text('For inquiries and support:', 105, footerY + 20, { align: 'center' });
    pdf.setTextColor(45, 142, 65);
    pdf.text('Email: support@vermi-farm.org | Phone: +254 799 616 744', 105, footerY + 28, { align: 'center' });
    pdf.text('Website: www.vermi-farm.org', 105, footerY + 36, { align: 'center' });

    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(`Security Code: VF-${Date.now().toString().slice(-6)}`, 20, footerY + 50);
    pdf.text(`Verification: ${data.transactionId.slice(-8).toUpperCase()}`, 150, footerY + 50);

    // Save PDF
    pdf.save(`vermi-farm-receipt-${data.transactionId}.pdf`);
  } catch (error) {
    console.error('Receipt generation error:', error);
  }
};
