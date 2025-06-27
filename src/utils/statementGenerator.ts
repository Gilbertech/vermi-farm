import jsPDF from 'jspdf';

interface StatementData {
  fromDate: string;
  toDate: string;
  userName?: string;
  groupName?: string;
  portfolioType?: string;
  transactions: Array<{
    id: string;
    date: string;
    type: string;
    description: string;
    amount: number;
    balance: number;
    status: string;
  }>;
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

export const generateStatement = async (data: StatementData): Promise<void> => {
  try {
    const pdf = new jsPDF();
    
    // Load and add logo watermark
    try {
      const logoBase64 = await loadImageAsBase64('https://www.vermi-farm.org/images/logo1.png');
      
      // Add watermark logo (semi-transparent, centered)
      pdf.setGState(pdf.GState({ opacity: 0.08 }));
      pdf.addImage(logoBase64, 'PNG', 50, 70, 110, 110);
      pdf.setGState(pdf.GState({ opacity: 1 }));
      
      // Add small logo at top left
      pdf.addImage(logoBase64, 'PNG', 15, 10, 30, 30);
    } catch (logoError) {
      console.warn('Could not load primary logo, trying secondary logo:', logoError);
      try {
        const secondaryLogoBase64 = await loadImageAsBase64('https://www.vermi-farm.org/images/logo4.png');
        
        // Add watermark logo (semi-transparent, centered)
        pdf.setGState(pdf.GState({ opacity: 0.08 }));
        pdf.addImage(secondaryLogoBase64, 'PNG', 50, 70, 110, 110);
        pdf.setGState(pdf.GState({ opacity: 1 }));
        
        // Add small logo at top left
        pdf.addImage(secondaryLogoBase64, 'PNG', 15, 10, 30, 30);
      } catch (secondaryLogoError) {
        console.warn('Could not load any logo, proceeding without watermark:', secondaryLogoError);
      }
    }
    
    // Header
    pdf.setFontSize(28);
    pdf.setTextColor(45, 142, 65); // #2d8e41
    pdf.setFont('helvetica', 'bold');
    pdf.text('VERMI-FARM', 55, 22);
    
    pdf.setFontSize(12);
    pdf.setTextColor(100, 100, 100);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Sustainable Agriculture Solutions', 55, 30);
    pdf.text('Empowering Farmers Through Innovation', 55, 37);
    
    // Top right info
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Statement Date: ${new Date().toLocaleDateString()}`, 140, 15);
    pdf.text(`Generated: ${new Date().toLocaleString()}`, 140, 22);
    pdf.text('www.vermi-farm.org', 140, 29);
    
    pdf.setFontSize(20);
    pdf.setTextColor(152, 63, 33); // #983F21
    pdf.setFont('helvetica', 'bold');
    pdf.text('PORTFOLIO STATEMENT', 105, 52, { align: 'center' });
    
    // Statement period
    pdf.setFontSize(12);
    pdf.setTextColor(45, 142, 65);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Period: ${new Date(data.fromDate).toLocaleDateString()} - ${new Date(data.toDate).toLocaleDateString()}`, 105, 62, { align: 'center' });
    
    // Line separator
    pdf.setDrawColor(45, 142, 65);
    pdf.setLineWidth(1);
    pdf.line(20, 68, 190, 68);
    
    // Account details section
    pdf.setFontSize(14);
    pdf.setTextColor(45, 142, 65);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ACCOUNT INFORMATION', 20, 82);
    
    // Details box with gradient effect
    pdf.setFillColor(248, 250, 252);
    pdf.roundedRect(20, 87, 170, 35, 3, 3, 'F');
    pdf.setDrawColor(45, 142, 65);
    pdf.setLineWidth(0.5);
    pdf.roundedRect(20, 87, 170, 35, 3, 3);
    
    // Account details
    pdf.setFontSize(11);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'bold');
    
    let yPosition = 97;
    if (data.userName) {
      pdf.text('Account Holder:', 25, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.text(data.userName, 85, yPosition);
      yPosition += 8;
    }
    
    if (data.groupName) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('Group/Organization:', 25, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.text(data.groupName, 85, yPosition);
      yPosition += 8;
    }
    
    if (data.portfolioType) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('Portfolio Type:', 25, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.text(data.portfolioType, 85, yPosition);
      yPosition += 8;
    }
    
    pdf.setFont('helvetica', 'bold');
    pdf.text('Statement Period:', 25, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${new Date(data.fromDate).toLocaleDateString()} to ${new Date(data.toDate).toLocaleDateString()}`, 85, yPosition);
    
    // Transactions section
    yPosition = 140;
    pdf.setFontSize(14);
    pdf.setTextColor(45, 142, 65);
    pdf.setFont('helvetica', 'bold');
    pdf.text('TRANSACTION HISTORY', 20, yPosition);
    
    // Transaction table header
    yPosition += 10;
    pdf.setFillColor(45, 142, 65);
    pdf.roundedRect(20, yPosition - 3, 170, 15, 2, 2, 'F');
    
    pdf.setFontSize(9);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Date', 25, yPosition + 5);
    pdf.text('Type', 50, yPosition + 5);
    pdf.text('Description', 75, yPosition + 5);
    pdf.text('Amount (KES)', 125, yPosition + 5);
    pdf.text('Balance (KES)', 160, yPosition + 5);
    
    // Transaction rows
    yPosition += 20;
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'normal');
    
    data.transactions.forEach((transaction, index) => {
      if (yPosition > 250) {
        pdf.addPage();
        
        // Add logo to new page
        try {
          const logoBase64 = await loadImageAsBase64('https://www.vermi-farm.org/images/logo1.png');
          pdf.setGState(pdf.GState({ opacity: 0.05 }));
          pdf.addImage(logoBase64, 'PNG', 50, 70, 110, 110);
          pdf.setGState(pdf.GState({ opacity: 1 }));
        } catch (error) {
          // Continue without logo on new page
        }
        
        yPosition = 30;
        
        // Repeat header on new page
        pdf.setFontSize(12);
        pdf.setTextColor(45, 142, 65);
        pdf.setFont('helvetica', 'bold');
        pdf.text('TRANSACTION HISTORY (Continued)', 20, yPosition);
        
        yPosition += 15;
        pdf.setFillColor(45, 142, 65);
        pdf.roundedRect(20, yPosition - 3, 170, 15, 2, 2, 'F');
        
        pdf.setFontSize(9);
        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Date', 25, yPosition + 5);
        pdf.text('Type', 50, yPosition + 5);
        pdf.text('Description', 75, yPosition + 5);
        pdf.text('Amount (KES)', 125, yPosition + 5);
        pdf.text('Balance (KES)', 160, yPosition + 5);
        
        yPosition += 20;
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'normal');
      }
      
      // Alternating row colors
      const rowColor = index % 2 === 0 ? [255, 255, 255] : [248, 250, 252];
      pdf.setFillColor(rowColor[0], rowColor[1], rowColor[2]);
      pdf.roundedRect(20, yPosition - 4, 170, 12, 1, 1, 'F');
      
      pdf.setFontSize(8);
      pdf.text(new Date(transaction.date).toLocaleDateString(), 25, yPosition + 2);
      
      // Transaction type with color coding
      const typeColor = getTransactionTypeColor(transaction.type);
      pdf.setTextColor(typeColor[0], typeColor[1], typeColor[2]);
      pdf.setFont('helvetica', 'bold');
      pdf.text(transaction.type.toUpperCase(), 50, yPosition + 2);
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      
      // Handle long descriptions
      const description = transaction.description.length > 25 
        ? transaction.description.substring(0, 25) + '...' 
        : transaction.description;
      pdf.text(description, 75, yPosition + 2);
      
      // Amount with color coding
      const amountColor = transaction.amount >= 0 
        ? [34, 197, 94] : [239, 68, 68]; // green for credit, red for debit
      pdf.setTextColor(amountColor[0], amountColor[1], amountColor[2]);
      pdf.setFont('helvetica', 'bold');
      pdf.text(Math.abs(transaction.amount).toLocaleString(), 125, yPosition + 2);
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      pdf.text(transaction.balance.toLocaleString(), 160, yPosition + 2);
      
      yPosition += 12;
    });
    
    // Summary section
    yPosition += 15;
    if (yPosition > 240) {
      pdf.addPage();
      yPosition = 30;
    }
    
    pdf.setFillColor(248, 250, 252);
    pdf.roundedRect(20, yPosition - 5, 170, 50, 3, 3, 'F');
    pdf.setDrawColor(45, 142, 65);
    pdf.setLineWidth(0.5);
    pdf.roundedRect(20, yPosition - 5, 170, 50, 3, 3);
    
    pdf.setFontSize(14);
    pdf.setTextColor(45, 142, 65);
    pdf.setFont('helvetica', 'bold');
    pdf.text('STATEMENT SUMMARY', 25, yPosition + 5);
    
    yPosition += 18;
    pdf.setFontSize(11);
    pdf.setTextColor(0, 0, 0);
    
    const totalCredits = data.transactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalDebits = data.transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const finalBalance = data.transactions.length > 0 
      ? data.transactions[data.transactions.length - 1].balance 
      : 0;
    
    const totalTransactions = data.transactions.length;
    
    // Summary details in two columns
    pdf.setFont('helvetica', 'bold');
    pdf.text('Total Transactions:', 25, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(totalTransactions.toString(), 80, yPosition);
    
    pdf.setFont('helvetica', 'bold');
    pdf.text('Total Credits:', 110, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(34, 197, 94);
    pdf.text(`KES ${totalCredits.toLocaleString()}`, 150, yPosition);
    
    yPosition += 10;
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Opening Balance:', 25, yPosition);
    pdf.setFont('helvetica', 'normal');
    const openingBalance = data.transactions.length > 0 ? data.transactions[0].balance - data.transactions[0].amount : 0;
    pdf.text(`KES ${openingBalance.toLocaleString()}`, 80, yPosition);
    
    pdf.setFont('helvetica', 'bold');
    pdf.text('Total Debits:', 110, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(239, 68, 68);
    pdf.text(`KES ${totalDebits.toLocaleString()}`, 150, yPosition);
    
    yPosition += 12;
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text('CLOSING BALANCE:', 25, yPosition);
    pdf.setTextColor(45, 142, 65);
    pdf.text(`KES ${finalBalance.toLocaleString()}`, 110, yPosition);
    
    // Footer
    const footerY = 270;
    pdf.setDrawColor(45, 142, 65);
    pdf.setLineWidth(1);
    pdf.line(20, footerY, 190, footerY);
    
    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    pdf.setFont('helvetica', 'normal');
    pdf.text('This is a computer-generated statement and does not require a signature.', 105, footerY + 8, { align: 'center' });
    
    // Contact information
    pdf.setFontSize(8);
    pdf.text('VERMI-FARM | Sustainable Agriculture Solutions', 105, footerY + 16, { align: 'center' });
    pdf.setTextColor(45, 142, 65);
    pdf.text('Email: support@vermi-farm.org | Phone: +254 700 000 000 | Web: www.vermi-farm.org', 105, footerY + 23, { align: 'center' });
    
    // Security features
    pdf.setFontSize(7);
    pdf.setTextColor(150, 150, 150);
    pdf.text(`Statement ID: VF-STMT-${Date.now().toString().slice(-8)}`, 20, footerY + 32);
    pdf.text(`Security Hash: ${generateSecurityHash()}`, 105, footerY + 32, { align: 'center' });
    pdf.text(`Generated: ${new Date().toISOString()}`, 190, footerY + 32, { align: 'right' });
    
    // Download the PDF
    const fileName = data.userName 
      ? `vermi-farm-statement-${data.userName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`
      : `vermi-farm-statement-${data.portfolioType || 'portfolio'}-${new Date().toISOString().split('T')[0]}.pdf`;
    
    pdf.save(fileName);
    
  } catch (error) {
    console.error('Error generating statement:', error);
    // Fallback to simple statement
    generateSimpleStatement(data);
  }
};

const getTransactionTypeColor = (type: string): [number, number, number] => {
  switch (type.toLowerCase()) {
    case 'deposit':
    case 'credit':
    case 'loan':
      return [34, 197, 94]; // green
    case 'withdrawal':
    case 'debit':
    case 'repayment':
      return [239, 68, 68]; // red
    case 'transfer':
      return [59, 130, 246]; // blue
    case 'fee':
      return [245, 158, 11]; // orange
    default:
      return [107, 114, 128]; // gray
  }
};

const generateSecurityHash = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const generateSimpleStatement = (data: StatementData): void => {
  const pdf = new jsPDF();
  
  // Simple header
  pdf.setFontSize(20);
  pdf.setTextColor(45, 142, 65);
  pdf.text('VERMI-FARM STATEMENT', 105, 20, { align: 'center' });
  
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  pdf.text(`Period: ${new Date(data.fromDate).toLocaleDateString()} - ${new Date(data.toDate).toLocaleDateString()}`, 105, 35, { align: 'center' });
  
  if (data.userName) {
    pdf.text(`Account: ${data.userName}`, 105, 45, { align: 'center' });
  }
  
  if (data.portfolioType) {
    pdf.text(`Portfolio: ${data.portfolioType}`, 105, 55, { align: 'center' });
  }
  
  // Simple transaction list
  let yPosition = 70;
  pdf.setFontSize(10);
  
  // Headers
  pdf.setFont('helvetica', 'bold');
  pdf.text('Date', 20, yPosition);
  pdf.text('Type', 60, yPosition);
  pdf.text('Description', 90, yPosition);
  pdf.text('Amount', 140, yPosition);
  pdf.text('Balance', 170, yPosition);
  
  yPosition += 10;
  pdf.setFont('helvetica', 'normal');
  
  data.transactions.forEach((transaction, index) => {
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = 30;
    }
    
    pdf.text(new Date(transaction.date).toLocaleDateString(), 20, yPosition);
    pdf.text(transaction.type, 60, yPosition);
    
    const description = transaction.description.length > 20 
      ? transaction.description.substring(0, 20) + '...' 
      : transaction.description;
    pdf.text(description, 90, yPosition);
    
    pdf.text(`KES ${Math.abs(transaction.amount).toLocaleString()}`, 140, yPosition);
    pdf.text(`KES ${transaction.balance.toLocaleString()}`, 170, yPosition);
    
    yPosition += 8;
  });
  
  const fileName = data.userName 
    ? `statement-${data.userName.replace(/\s+/g, '-').toLowerCase()}.pdf`
    : `statement-${data.portfolioType || 'portfolio'}-${new Date().toISOString().split('T')[0]}.pdf`;
  
  pdf.save(fileName);
};

export const generateCSVStatement = (data: StatementData): void => {
  const csvContent = `VERMI-FARM Portfolio Statement
Period,${new Date(data.fromDate).toLocaleDateString()} - ${new Date(data.toDate).toLocaleDateString()}
${data.userName ? `Account Holder,${data.userName}` : ''}
${data.groupName ? `Group,${data.groupName}` : ''}
${data.portfolioType ? `Portfolio Type,${data.portfolioType}` : ''}
Generated,${new Date().toLocaleString()}

Date,Type,Description,Amount,Balance,Status
${data.transactions.map(t => 
  `${new Date(t.date).toLocaleDateString()},${t.type},${t.description.replace(/,/g, ';')},${t.amount},${t.balance},${t.status}`
).join('\n')}

Summary
Total Transactions,${data.transactions.length}
Total Credits,${data.transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0)}
Total Debits,${data.transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0)}
Opening Balance,${data.transactions.length > 0 ? data.transactions[0].balance - data.transactions[0].amount : 0}
Closing Balance,${data.transactions.length > 0 ? data.transactions[data.transactions.length - 1].balance : 0}

Contact Information
Email,support@vermi-farm.org
Phone,+254 700 000 000
Website,www.vermi-farm.org
Generated by,Vermi-Farm Portfolio Management System`;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  
  const fileName = data.userName 
    ? `vermi-farm-statement-${data.userName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`
    : `vermi-farm-statement-${data.portfolioType || 'portfolio'}-${new Date().toISOString().split('T')[0]}.csv`;
  
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};