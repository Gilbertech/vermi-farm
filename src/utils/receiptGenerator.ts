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
      pdf.setGState(pdf.GState({ opacity: 0.08 }));
      pdf.addImage(logoBase64, 'JPEG', 55, 90, 100, 100);
      pdf.setGState(pdf.GState({ opacity: 1 }));
      
      // Add centered logo at top
      pdf.addImage(logoBase64, 'JPEG', 92.5, 8, 25, 25);
    } catch (logoError) {
      console.warn('Could not load logo, proceeding without watermark:', logoError);
    }
    
    // Decorative header background
    pdf.setFillColor(45, 142, 65); // Primary green
    pdf.roundedRect(15, 5, 180, 45, 5, 5, 'F');
    
    // Inner decorative element
    pdf.setFillColor(152, 63, 33); // Secondary brown
    pdf.roundedRect(20, 35, 170, 8, 2, 2, 'F');
    
    // Centered Header
    pdf.setFontSize(22);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.text('VERMI-FARM INITIATIVE', 105, 20, { align: 'center' });
    
    pdf.setFontSize(11);
    pdf.setTextColor(240, 240, 240);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Sustainable Agriculture & Financial Inclusion', 105, 28, { align: 'center' });
    
    pdf.setFontSize(14);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.text('TRANSACTION RECEIPT', 105, 40, { align: 'center' });
    
    // Transaction ID banner
    pdf.setFillColor(152, 63, 33);
    pdf.roundedRect(25, 60, 160, 15, 3, 3, 'F');
    pdf.setFontSize(12);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Receipt #: ${data.transactionId}`, 105, 70, { align: 'center' });
    
    // Main content area with gradient-like effect
    pdf.setFillColor(248, 250, 252);
    pdf.roundedRect(20, 85, 170, 90, 5, 5, 'F');
    
    // Accent border
    pdf.setDrawColor(45, 142, 65);
    pdf.setLineWidth(1);
    pdf.roundedRect(20, 85, 170, 90, 5, 5, 'S');
    
    // Section header
    pdf.setFillColor(45, 142, 65);
    pdf.roundedRect(25, 90, 160, 12, 3, 3, 'F');
    pdf.setFontSize(12);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.text('TRANSACTION DETAILS', 105, 98, { align: 'center' });
    
    // Details section
    pdf.setFontSize(11);
    pdf.setTextColor(0, 0, 0);
    
    const details = [
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

    let yPosition = 110;
    details.forEach(([label, value], index) => {
      // Alternating row background
      if (index % 2 === 0) {
        pdf.setFillColor(255, 255, 255);
        pdf.rect(25, yPosition - 5, 160, 8, 'F');
      }
      
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(45, 142, 65);
      pdf.text(label, 30, yPosition);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      
      // Handle long text wrapping
      const maxWidth = 90;
      const lines = pdf.splitTextToSize(value, maxWidth);
      pdf.text(lines, 95, yPosition);
      
      yPosition += 8;
    });
    
    // Status and amount highlight section
    const statusY = 185;
    
    // Status indicator with enhanced styling
    let statusColor, statusBgColor;
    if (data.status.toLowerCase() === 'completed') {
      statusColor = [255, 255, 255];
      statusBgColor = [34, 197, 94]; // green
    } else if (data.status.toLowerCase() === 'pending') {
      statusColor = [0, 0, 0];
      statusBgColor = [255, 193, 7]; // amber
    } else {
      statusColor = [255, 255, 255];
      statusBgColor = [239, 68, 68]; // red
    }
    
    pdf.setFillColor(...statusBgColor);
    pdf.roundedRect(25, statusY, 50, 15, 5, 5, 'F');
    pdf.setFontSize(11);
    pdf.setTextColor(...statusColor);
    pdf.setFont('helvetica', 'bold');
    pdf.text(data.status.toUpperCase(), 50, statusY + 9, { align: 'center' });
    
    // Amount highlight with enhanced styling
    pdf.setFillColor(45, 142, 65);
    pdf.roundedRect(135, statusY, 55, 15, 5, 5, 'F');
    pdf.setFontSize(13);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`KES ${data.amount.toLocaleString()}`, 162.5, statusY + 9, { align: 'center' });
    
    // Decorative footer section
    const footerY = 215;
    pdf.setFillColor(45, 142, 65);
    pdf.roundedRect(15, footerY, 180, 50, 5, 5, 'F');
    
    // Footer accent
    pdf.setFillColor(152, 63, 33);
    pdf.roundedRect(20, footerY + 5, 170, 3, 1, 1, 'F');
    
    pdf.setFontSize(10);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'italic');
    pdf.text('This is a computer-generated receipt and does not require a signature.', 105, footerY + 18, { align: 'center' });
    
    // Contact information with better spacing
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('FOR INQUIRIES & SUPPORT', 105, footerY + 30, { align: 'center' });
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Email: support@vermi-farm.org | Phone: +254 799 616 744', 105, footerY + 38, { align: 'center' });
    pdf.text('Website: www.vermi-farm.org', 105, footerY + 46, { align: 'center' });
    
    // Security features with enhanced styling
    pdf.setFontSize(8);
    pdf.setTextColor(200, 200, 200);
    const securityCode = `VF-${Date.now().toString().slice(-6)}`;
    const verification = data.transactionId.slice(-8).toUpperCase();
    pdf.text(`Security: ${securityCode}`, 25, footerY + 58);
    pdf.text(`Verification: ${verification}`, 140, footerY + 58);
    
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
  
  // Enhanced simple header
  pdf.setFillColor(45, 142, 65);
  pdf.roundedRect(15, 10, 180, 35, 5, 5, 'F');
  
  pdf.setFontSize(20);
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.text('VERMI-FARM INITIATIVE', 105, 25, { align: 'center' });
  
  pdf.setFontSize(14);
  pdf.setTextColor(240, 240, 240);
  pdf.text('Transaction Receipt', 105, 35, { align: 'center' });
  
  // Transaction ID
  pdf.setFillColor(152, 63, 33);
  pdf.roundedRect(25, 55, 160, 12, 3, 3, 'F');
  pdf.setFontSize(11);
  pdf.setTextColor(255, 255, 255);
  pdf.text(`Receipt #: ${data.transactionId}`, 105, 63, { align: 'center' });
  
  // Content area
  pdf.setFillColor(248, 250, 252);
  pdf.roundedRect(20, 75, 170, 80, 5, 5, 'F');
  
  // Receipt details
  pdf.setFontSize(11);
  pdf.setTextColor(0, 0, 0);
  
  const details = [
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

  let yPosition = 85;
  details.forEach(([label, value]) => {
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(45, 142, 65);
    pdf.text(label, 25, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.text(value, 85, yPosition);
    yPosition += 8;
  });
  
  // Footer
  pdf.setFillColor(45, 142, 65);
  pdf.roundedRect(15, 165, 180, 35, 5, 5, 'F');
  
  pdf.setFontSize(10);
  pdf.setTextColor(255, 255, 255);
  pdf.text('This is a computer-generated receipt.', 105, 180, { align: 'center' });
  pdf.text('For inquiries, contact support@vermi-farm.org', 105, 190, { align: 'center' });
  
  pdf.save(`vermi-farm-receipt-${data.transactionId}.pdf`);
};

export const generateCSVReceipt = (data: ReceiptData): void => {
  const csvContent = `VERMI-FARM INITIATIVE Transaction Receipt
Receipt Number,${data.transactionId}
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
Phone,+254 799 616 744
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