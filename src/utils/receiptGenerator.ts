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
    
    // Load and add logo watermark
    try {
      const logoBase64 = await loadImageAsBase64('https://i.postimg.cc/MTpyCg68/logo.png');
      
      // Add watermark logo (semi-transparent, centered)
      pdf.setGState(pdf.GState({ opacity: 0.1 }));
      pdf.addImage(logoBase64, 'JPEG', 60, 80, 90, 90);
      pdf.setGState(pdf.GState({ opacity: 1 }));
      
      // Add small logo at top
      pdf.addImage(logoBase64, 'JPEG', 15, 10, 25, 25);
    } catch (logoError) {
      console.warn('Could not load logo, proceeding without watermark:', logoError);
    }
    
    // Header
    pdf.setFontSize(24);
    pdf.setTextColor(45, 142, 65); // #2d8e41
    pdf.setFont('helvetica', 'bold');
    pdf.text('VERMI-FARM', 50, 20);
    
    pdf.setFontSize(12);
    pdf.setTextColor(100, 100, 100);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Sustainable Agriculture Solutions', 50, 28);
    
    pdf.setFontSize(18);
    pdf.setTextColor(152, 63, 33); // #983F21
    pdf.setFont('helvetica', 'bold');
    pdf.text('TRANSACTION RECEIPT', 105, 45, { align: 'center' });
    
    // Receipt number and date
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Receipt #: ${data.transactionId}`, 150, 15);
    pdf.text(`Generated: ${new Date().toLocaleString()}`, 150, 22);
    
    // Line separator
    pdf.setDrawColor(45, 142, 65);
    pdf.setLineWidth(0.5);
    pdf.line(20, 55, 190, 55);
    
    // Transaction details section
    pdf.setFontSize(14);
    pdf.setTextColor(45, 142, 65);
    pdf.setFont('helvetica', 'bold');
    pdf.text('TRANSACTION DETAILS', 20, 70);
    
    // Details box
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.3);
    pdf.rect(20, 75, 170, 80);
    
    // Receipt details
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

    let yPosition = 85;
    details.forEach(([label, value]) => {
      pdf.setFont('helvetica', 'bold');
      pdf.text(label, 25, yPosition);
      pdf.setFont('helvetica', 'normal');
      
      // Handle long text wrapping
      const maxWidth = 100;
      const lines = pdf.splitTextToSize(value, maxWidth);
      pdf.text(lines, 90, yPosition);
      
      yPosition += lines.length > 1 ? 8 * lines.length : 8;
    });
    
    // Status indicator
    const statusY = 165;
    if (data.status.toLowerCase() === 'completed') {
      pdf.setFillColor(34, 197, 94); // green
      pdf.setTextColor(255, 255, 255);
    } else if (data.status.toLowerCase() === 'pending') {
      pdf.setFillColor(234, 179, 8); // yellow
      pdf.setTextColor(255, 255, 255);
    } else {
      pdf.setFillColor(239, 68, 68); // red
      pdf.setTextColor(255, 255, 255);
    }
    
    pdf.roundedRect(20, statusY, 40, 12, 2, 2, 'F');
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text(data.status.toUpperCase(), 40, statusY + 8, { align: 'center' });
    
    // Amount highlight
    pdf.setFillColor(45, 142, 65);
    pdf.setTextColor(255, 255, 255);
    pdf.roundedRect(130, statusY, 60, 12, 2, 2, 'F');
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`KES ${data.amount.toLocaleString()}`, 160, statusY + 8, { align: 'center' });
    
    // Footer section
    const footerY = 200;
    pdf.setDrawColor(45, 142, 65);
    pdf.setLineWidth(0.5);
    pdf.line(20, footerY, 190, footerY);
    
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.setFont('helvetica', 'normal');
    pdf.text('This is a computer-generated receipt and does not require a signature.', 105, footerY + 10, { align: 'center' });
    
    // Contact information
    pdf.setFontSize(9);
    pdf.text('For inquiries and support:', 105, footerY + 20, { align: 'center' });
    pdf.setTextColor(45, 142, 65);
    pdf.text('Email: support@vermi-farm.org | Phone: +254 700 000 000', 105, footerY + 28, { align: 'center' });
    pdf.text('Website: www.vermi-farm.org', 105, footerY + 36, { align: 'center' });
    
    // Security features
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(`Security Code: VF-${Date.now().toString().slice(-6)}`, 20, footerY + 50);
    pdf.text(`Verification: ${data.transactionId.slice(-8).toUpperCase()}`, 150, footerY + 50);
    
    // Download the PDF
    pdf.save(`vermi-farm-receipt-${data.transactionId}.pdf`);
    
  } catch (error) {
    console.error('Error generating receipt:', error);
    // Fallback to simple receipt without logo
    generateSimpleReceipt(data);
  }
};

const generateSimpleReceipt = (data: ReceiptData): void => {
  const pdf = new jsPDF();
  
  // Simple header without logo
  pdf.setFontSize(20);
  pdf.setTextColor(45, 142, 65);
  pdf.text('VERMI-FARM', 105, 20, { align: 'center' });
  
  pdf.setFontSize(16);
  pdf.setTextColor(152, 63, 33);
  pdf.text('Transaction Receipt', 105, 35, { align: 'center' });
  
  // Line separator
  pdf.setDrawColor(200, 200, 200);
  pdf.line(20, 45, 190, 45);
  
  // Receipt details
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  
  const details = [
    ['Transaction ID:', data.transactionId],
    ['Date & Time:', new Date(data.date).toLocaleString()],
    ['Transaction Type:', data.type],
    ['Status:', data.status],
    ['Amount:', `KES ${data.amount.toLocaleString()}`],
    ['User Name:', data.userName],
    ['Phone Number:', data.userPhone],
  ];

  if (data.from) details.push(['From:', data.from]);
  if (data.to) details.push(['To:', data.to]);
  if (data.fees) details.push(['Fees:', data.fees]);

  let yPosition = 60;
  details.forEach(([label, value]) => {
    pdf.setFont('helvetica', 'bold');
    pdf.text(label, 20, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(value, 80, yPosition);
    yPosition += 10;
  });
  
  // Footer
  yPosition += 20;
  pdf.setDrawColor(200, 200, 200);
  pdf.line(20, yPosition, 190, yPosition);
  
  yPosition += 15;
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text('This is a computer-generated receipt.', 105, yPosition, { align: 'center' });
  pdf.text('For inquiries, contact support@vermi-farm.org', 105, yPosition + 10, { align: 'center' });
  
  pdf.save(`vermi-farm yetu-receipt-${data.transactionId}.pdf`);
};

export const generateCSVReceipt = (data: ReceiptData): void => {
  const csvContent = `VERMI-FARM YETU Transaction Receipt
Receipt Number,${data.transactionId}
Generated Date,${new Date().toLocaleString()}
Transaction Date,${new Date(data.date).toLocaleString()}
Transaction Type,${data.type}
Status,${data.status}
Amount,KES ${data.amount.toLocaleString()}
User Name,${data.userName}
Phone Number,${data.userPhone}
${data.from ? `From,${data.from}` : ''}
${data.to ? `To,${data.to}` : ''}
${data.fees ? `Fees,${data.fees}` : ''}

Contact Information
Email,support@vermi-farm.org
Website,www.vermi-farm.org
Generated by,Vermi-Farm Admin System`;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `vermi-farm-receipt-${data.transactionId}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};