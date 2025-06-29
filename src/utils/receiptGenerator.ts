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

const addFooter = (pdf: jsPDF, receiptNumber: string, pageNum: number, totalPages: number) => {
  const footerY = 280;
  
  // Footer line
  pdf.setDrawColor(45, 142, 65);
  pdf.setLineWidth(0.5);
  pdf.line(20, footerY, 190, footerY);
  
  // Footer content
  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100);
  pdf.setFont('helvetica', 'normal');
  
  // Left side - Receipt number
  pdf.text(`Receipt #: ${receiptNumber}`, 20, footerY + 8);
  
  // Center - Generated timestamp
  pdf.text(`Generated: ${new Date().toLocaleString()}`, 105, footerY + 8, { align: 'center' });
  
  // Right side - Page number
  pdf.text(`Page ${pageNum} of ${totalPages}`, 190, footerY + 8, { align: 'right' });
  
  // Contact info on second line
  pdf.setFontSize(7);
  pdf.text('For inquiries: support@vermi-farm.org | +254 799 616 744', 105, footerY + 16, { align: 'center' });
};

export const generateReceipt = async (data: ReceiptData): Promise<void> => {
  try {
    const pdf = new jsPDF();
    const totalPages = 1; // Receipts are typically single page
    
    // Load and add logo watermark
    try {
      const logoBase64 = await loadImageAsBase64('https://i.postimg.cc/MTpyCg68/logo.png');
      
      // Add watermark logo (semi-transparent, centered)
      pdf.setGState(pdf.GState({ opacity: 0.08 }));
      pdf.addImage(logoBase64, 'JPEG', 60, 80, 90, 90);
      pdf.setGState(pdf.GState({ opacity: 1 }));
      
      // Add small logo at top
      pdf.addImage(logoBase64, 'JPEG', 15, 10, 25, 25);
    } catch (logoError) {
      console.warn('Could not load logo, proceeding without watermark:', logoError);
    }
    
    // Header - Centered
    pdf.setFontSize(24);
    pdf.setTextColor(45, 142, 65); // #2d8e41
    pdf.setFont('helvetica', 'bold');
    pdf.text('VERMI-FARM INITIATIVE', 105, 20, { align: 'center' });
    
    pdf.setFontSize(12);
    pdf.setTextColor(100, 100, 100);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Sustainable Agriculture & Financial Inclusion', 105, 28, { align: 'center' });
    
    pdf.setFontSize(18);
    pdf.setTextColor(152, 63, 33); // #983F21
    pdf.setFont('helvetica', 'bold');
    pdf.text('TRANSACTION RECEIPT', 105, 45, { align: 'center' });
    
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
    
    // Status and Amount Section - Better Alignment
    const statusSectionY = 165;
    
    // Create a centered container for status and amount
    const containerWidth = 170;
    const containerX = 20;
    
    // Status indicator - Left aligned in container
    const statusX = containerX + 10;
    const statusY = statusSectionY;
    
    if (data.status.toLowerCase() === 'completed') {
      pdf.setFillColor(45, 142, 65); // green
      pdf.setTextColor(255, 255, 255);
    } else if (data.status.toLowerCase() === 'pending') {
      pdf.setFillColor(234, 179, 8); // yellow
      pdf.setTextColor(255, 255, 255);
    } else {
      pdf.setFillColor(239, 68, 68); // red
      pdf.setTextColor(255, 255, 255);
    }
    
    pdf.roundedRect(statusX, statusY, 50, 15, 3, 3, 'F');
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text(data.status.toUpperCase(), statusX + 25, statusY + 10, { align: 'center' });
    
    // Amount highlight - Right aligned in container
    const amountX = containerX + containerWidth - 70;
    const amountY = statusY;
    
    pdf.setFillColor(45, 142, 65);
    pdf.setTextColor(255, 255, 255);
    pdf.roundedRect(amountX, amountY, 60, 15, 3, 3, 'F');
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`KES ${data.amount.toLocaleString()}`, amountX + 30, amountY + 10, { align: 'center' });
    
    // Security features
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(`Security Code: VF-${Date.now().toString().slice(-6)}`, 20, 200);
    pdf.text(`Verification: ${data.transactionId.slice(-8).toUpperCase()}`, 150, 200);
    
    // Add footer with receipt number, timestamp, and page number
    addFooter(pdf, data.transactionId, 1, totalPages);
    
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
  const totalPages = 1;
  
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
  
  // Status and Amount - Better aligned
  yPosition += 20;
  
  // Status
  pdf.setFillColor(45, 142, 65);
  pdf.setTextColor(255, 255, 255);
  pdf.roundedRect(30, yPosition - 5, 50, 15, 3, 3, 'F');
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text(data.status.toUpperCase(), 55, yPosition + 5, { align: 'center' });
  
  // Amount
  pdf.setFillColor(45, 142, 65);
  pdf.setTextColor(255, 255, 255);
  pdf.roundedRect(130, yPosition - 5, 60, 15, 3, 3, 'F');
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`KES ${data.amount.toLocaleString()}`, 160, yPosition + 5, { align: 'center' });
  
  // Add footer
  addFooter(pdf, data.transactionId, 1, totalPages);
  
  pdf.save(`vermi-farm-receipt-${data.transactionId}.pdf`);
};

export const generateCSVReceipt = (data: ReceiptData): void => {
  const csvContent = `VERMI-FARM Transaction Receipt
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
Email,info@vermi-farm.org
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