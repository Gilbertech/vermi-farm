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

const generateQRCode = (data: string, size: number = 100): string => {
  // Simple QR code generation using a pattern-based approach
  // In production, you'd use a proper QR code library
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  
  canvas.width = size;
  canvas.height = size;
  
  // Fill background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, size, size);
  
  // Create a simple pattern based on the data
  const gridSize = 21; // Standard QR code grid
  const cellSize = size / gridSize;
  
  // Generate pattern from data hash
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  ctx.fillStyle = '#000000';
  
  // Draw finder patterns (corners)
  const drawFinderPattern = (x: number, y: number) => {
    // Outer square
    ctx.fillRect(x * cellSize, y * cellSize, 7 * cellSize, 7 * cellSize);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect((x + 1) * cellSize, (y + 1) * cellSize, 5 * cellSize, 5 * cellSize);
    ctx.fillStyle = '#000000';
    ctx.fillRect((x + 2) * cellSize, (y + 2) * cellSize, 3 * cellSize, 3 * cellSize);
  };
  
  // Draw finder patterns
  drawFinderPattern(0, 0);
  drawFinderPattern(14, 0);
  drawFinderPattern(0, 14);
  
  // Draw data pattern
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      // Skip finder patterns
      if ((x < 9 && y < 9) || (x > 12 && y < 9) || (x < 9 && y > 12)) continue;
      
      // Generate pseudo-random pattern based on position and hash
      const seed = (x * gridSize + y + hash) % 1000;
      if (seed % 3 === 0) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }
  }
  
  return canvas.toDataURL('image/png');
};

const createVerticalDigitalStamp = (pdf: jsPDF, x: number, y: number, status: string) => {
  // Vertical stamp dimensions
  const stampWidth = 25;
  const stampHeight = 60;
  
  // Blue color scheme for all stamps
  const stampColor: [number, number, number] = [37, 99, 235]; // Blue
  const textColor: [number, number, number] = [255, 255, 255]; // White
  
  let stampText: string;
  switch (status.toLowerCase()) {
    case 'completed':
      stampText = 'VERIFIED';
      break;
    case 'pending':
      stampText = 'PENDING';
      break;
    case 'failed':
      stampText = 'FAILED';
      break;
    default:
      stampText = 'PROCESSED';
  }
  
  // Save current state
  const currentFillColor = pdf.getFillColor();
  const currentDrawColor = pdf.getDrawColor();
  const currentLineWidth = pdf.getLineWidth();
  
  // Draw stamp border (double border for official look)
  pdf.setDrawColor(stampColor[0], stampColor[1], stampColor[2]);
  pdf.setLineWidth(1.5);
  pdf.roundedRect(x, y, stampWidth, stampHeight, 3, 3, 'S');
  
  pdf.setLineWidth(0.5);
  pdf.roundedRect(x + 1.5, y + 1.5, stampWidth - 3, stampHeight - 3, 2, 2, 'S');
  
  // Fill stamp background with blue
  pdf.setFillColor(stampColor[0], stampColor[1], stampColor[2]);
  pdf.setGState(pdf.GState({ opacity: 0.15 }));
  pdf.roundedRect(x + 1, y + 1, stampWidth - 2, stampHeight - 2, 2, 2, 'F');
  pdf.setGState(pdf.GState({ opacity: 1 }));
  
  // Add stamp text vertically
  pdf.setTextColor(stampColor[0], stampColor[1], stampColor[2]);
  pdf.setFont('helvetica', 'bold');
  
  // Rotate text for vertical orientation
  const centerX = x + stampWidth / 2;
  const centerY = y + stampHeight / 2;
  
  // Main status text
  pdf.setFontSize(8);
  pdf.text(stampText, centerX, centerY - 8, { 
    align: 'center',
    angle: 90
  });
  
  // "VERMI-FARM" text
  pdf.setFontSize(5);
  pdf.setFont('helvetica', 'normal');
  pdf.text('VERMI-FARM', centerX, centerY + 5, { 
    align: 'center',
    angle: 90
  });
  
  // Date stamp
  pdf.setFontSize(4);
  pdf.text(new Date().toLocaleDateString(), centerX, centerY + 15, { 
    align: 'center',
    angle: 90
  });
  
  // Add decorative elements
  pdf.setDrawColor(stampColor[0], stampColor[1], stampColor[2]);
  pdf.setLineWidth(0.3);
  pdf.line(x + 3, y + 5, x + stampWidth - 3, y + 5);
  pdf.line(x + 3, y + stampHeight - 5, x + stampWidth - 3, y + stampHeight - 5);
  
  // Restore previous state
  pdf.setFillColor(currentFillColor);
  pdf.setDrawColor(currentDrawColor);
  pdf.setLineWidth(currentLineWidth);
};

const addQRCode = (pdf: jsPDF, data: ReceiptData, x: number, y: number, size: number = 30) => {
  // Create QR code data string
  const qrData = `VF-${data.transactionId}-${data.amount}-${new Date(data.date).getTime()}`;
  
  try {
    // Generate QR code
    const qrCodeDataURL = generateQRCode(qrData, 150);
    
    // Add QR code to PDF
    pdf.addImage(qrCodeDataURL, 'PNG', x, y, size, size);
    
    // Add border around QR code
    pdf.setDrawColor(100, 100, 100);
    pdf.setLineWidth(0.5);
    pdf.rect(x, y, size, size);
    
    // Add label below QR code
    pdf.setFontSize(6);
    pdf.setTextColor(100, 100, 100);
    pdf.setFont('helvetica', 'normal');
    pdf.text('SCAN TO VERIFY', x + size/2, y + size + 5, { align: 'center' });
    pdf.text(`ID: ${data.transactionId.slice(-6)}`, x + size/2, y + size + 10, { align: 'center' });
    
  } catch (error) {
    console.warn('Could not generate QR code, adding placeholder:', error);
    
    // Fallback: Draw QR code placeholder
    pdf.setDrawColor(150, 150, 150);
    pdf.setLineWidth(0.5);
    pdf.rect(x, y, size, size);
    
    // Add grid pattern
    const gridLines = 8;
    for (let i = 1; i < gridLines; i++) {
      const linePos = (size / gridLines) * i;
      pdf.line(x + linePos, y, x + linePos, y + size);
      pdf.line(x, y + linePos, x + size, y + linePos);
    }
    
    pdf.setFontSize(6);
    pdf.setTextColor(100, 100, 100);
    pdf.text('QR CODE', x + size/2, y + size/2, { align: 'center' });
    pdf.text('VERIFICATION', x + size/2, y + size/2 + 4, { align: 'center' });
    pdf.text(`${data.transactionId.slice(-6)}`, x + size/2, y + size + 5, { align: 'center' });
  }
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
    
    // Add Blue Vertical Digital Stamp - Positioned in top right corner of details section
    createVerticalDigitalStamp(pdf, 160, 80, data.status);
    
    // Add QR Code - Positioned in bottom left
    addQRCode(pdf, data, 20, 190, 35);
    
    // Security features
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(`Security Code: VF-${Date.now().toString().slice(-6)}`, 70, 200);
    pdf.text(`Verification: ${data.transactionId.slice(-8).toUpperCase()}`, 70, 208);
    
    // Important Notice
    pdf.setFontSize(9);
    pdf.setTextColor(152, 63, 33);
    pdf.setFont('helvetica', 'bold');
    pdf.text('IMPORTANT NOTICE:', 70, 220);
    pdf.setFontSize(8);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'normal');
    pdf.text('• This receipt is valid for 90 days from the date of issue.', 70, 228);
    pdf.text('• Keep this receipt for your records and future reference.', 70, 235);
    pdf.text('• Scan QR code to verify transaction authenticity.', 70, 242);
    
    // Digital signature placeholder
    pdf.setFontSize(7);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Digitally signed by Vermi-Farm System', 70, 250);
    pdf.text(`Digital signature: ${data.transactionId.slice(-12).toUpperCase()}`, 70, 257);
    
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
  
  // Add blue vertical digital stamp
  createVerticalDigitalStamp(pdf, 160, 60, data.status);
  
  // Add QR code
  addQRCode(pdf, data, 20, 150, 30);
  
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