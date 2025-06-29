import jsPDF from 'jspdf';

interface StatementData {
  fromDate: string;
  toDate: string;
  userName?: string;
  groupName?: string;
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

const addStatementFooter = (pdf: jsPDF, statementNumber: string, pageNum: number, totalPages: number) => {
  const footerY = 280;
  
  // Footer line
  pdf.setDrawColor(45, 142, 65);
  pdf.setLineWidth(0.5);
  pdf.line(20, footerY, 190, footerY);
  
  // Footer content
  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100);
  pdf.setFont('helvetica', 'normal');
  
  // Left side - Statement number
  pdf.text(`Statement #: ${statementNumber}`, 20, footerY + 8);
  
  // Center - Generated timestamp
  pdf.text(`Generated: ${new Date().toLocaleString()}`, 105, footerY + 8, { align: 'center' });
  
  // Right side - Page number
  pdf.text(`Page ${pageNum} of ${totalPages}`, 190, footerY + 8, { align: 'right' });
  
  // Contact info and disclaimer on second line
  pdf.setFontSize(7);
  pdf.text('This is a computer-generated statement. For inquiries: support@vermi-farm.org | +254 799 616 744', 105, footerY + 16, { align: 'center' });
};

const addWatermarkLogo = async (pdf: jsPDF) => {
  try {
    const logoBase64 = await loadImageAsBase64('https://i.postimg.cc/MTpyCg68/logo.png');
    pdf.setGState(pdf.GState({ opacity: 0.1 }));
    pdf.addImage(logoBase64, 'PNG', 60, 80, 90, 90);
    pdf.setGState(pdf.GState({ opacity: 1 }));
    return logoBase64;
  } catch (error) {
    console.warn('Could not load logo for watermark:', error);
    return null;
  }
};

const addStatementHeader = (pdf: jsPDF, data: StatementData, logoBase64?: string | null) => {
  // Add logo if available
  if (logoBase64) {
    try {
      pdf.addImage(logoBase64, 'PNG', 15, 10, 25, 25);
    } catch (error) {
      console.warn('Could not add header logo:', error);
    }
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
  pdf.text('ACCOUNT STATEMENT', 105, 45, { align: 'center' });
  
  // Line separator
  pdf.setDrawColor(45, 142, 65);
  pdf.setLineWidth(0.5);
  pdf.line(20, 55, 190, 55);
};

const addAccountDetails = (pdf: jsPDF, data: StatementData) => {
  // Account details section
  pdf.setFontSize(14);
  pdf.setTextColor(45, 142, 65);
  pdf.setFont('helvetica', 'bold');
  pdf.text('ACCOUNT DETAILS', 20, 70);
  
  // Details box
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.3);
  pdf.rect(20, 75, 170, 30);
  
  // Account details
  pdf.setFontSize(11);
  pdf.setTextColor(0, 0, 0);
  pdf.setFont('helvetica', 'bold');
  
  let yPosition = 85;
  if (data.userName) {
    pdf.text('Account Holder:', 25, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.userName, 80, yPosition);
    yPosition += 8;
  }
  
  if (data.groupName) {
    pdf.setFont('helvetica', 'bold');
    pdf.text('Group:', 25, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.groupName, 80, yPosition);
    yPosition += 8;
  }
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Statement Period:', 25, yPosition);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`${new Date(data.fromDate).toLocaleDateString()} to ${new Date(data.toDate).toLocaleDateString()}`, 80, yPosition);
  
  return 120; // Return the Y position after account details
};

const addTransactionTableHeader = (pdf: jsPDF, yPosition: number) => {
  // Transaction table header
  pdf.setDrawColor(45, 142, 65);
  pdf.setFillColor(45, 142, 65);
  pdf.rect(20, yPosition - 5, 170, 12, 'F');
  
  pdf.setFontSize(9);
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Date', 25, yPosition + 3);
  pdf.text('Type', 55, yPosition + 3);
  pdf.text('Description', 80, yPosition + 3);
  pdf.text('Amount', 130, yPosition + 3);
  pdf.text('Balance', 160, yPosition + 3);
  
  return yPosition + 15;
};

export const generateStatement = async (data: StatementData): Promise<void> => {
  try {
    const pdf = new jsPDF();
    let currentPage = 1;
    const statementNumber = `VF-STMT-${Date.now().toString().slice(-8)}`;
    
    // Calculate total pages more accurately
    const transactionsPerPage = 12; // Conservative estimate
    const totalPages = Math.max(1, Math.ceil(data.transactions.length / transactionsPerPage) + 1); // +1 for summary
    
    // Load logo once for reuse
    let logoBase64: string | null = null;
    try {
      logoBase64 = await loadImageAsBase64('https://i.postimg.cc/MTpyCg68/logo.png');
    } catch (logoError) {
      console.warn('Could not load logo, proceeding without watermark:', logoError);
    }
    
    // Add watermark to first page
    if (logoBase64) {
      try {
        pdf.setGState(pdf.GState({ opacity: 0.1 }));
        pdf.addImage(logoBase64, 'PNG', 60, 80, 90, 90);
        pdf.setGState(pdf.GState({ opacity: 1 }));
      } catch (error) {
        console.warn('Could not add watermark to first page:', error);
      }
    }
    
    // Add header and account details to first page
    addStatementHeader(pdf, data, logoBase64);
    let yPosition = addAccountDetails(pdf, data);
    
    // Transactions section
    yPosition += 15;
    pdf.setFontSize(14);
    pdf.setTextColor(45, 142, 65);
    pdf.setFont('helvetica', 'bold');
    pdf.text('TRANSACTION HISTORY', 20, yPosition);
    
    yPosition += 15;
    yPosition = addTransactionTableHeader(pdf, yPosition);
    
    // Transaction rows
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'normal');
    
    data.transactions.forEach((transaction, index) => {
      // Check if we need a new page (leave space for footer)
      if (yPosition > 235) {
        // Add footer to current page
        addStatementFooter(pdf, statementNumber, currentPage, totalPages);
        
        // Create new page
        pdf.addPage();
        currentPage++;
        yPosition = 30;
        
        // Re-add logo watermark on new page if available
        if (logoBase64) {
          try {
            pdf.setGState(pdf.GState({ opacity: 0.1 }));
            pdf.addImage(logoBase64, 'PNG', 60, 80, 90, 90);
            pdf.setGState(pdf.GState({ opacity: 1 }));
          } catch (error) {
            console.warn('Could not add logo to new page:', error);
          }
        }
        
        // Add page header for continuation
        pdf.setFontSize(16);
        pdf.setTextColor(45, 142, 65);
        pdf.setFont('helvetica', 'bold');
        pdf.text('TRANSACTION HISTORY (Continued)', 20, yPosition);
        yPosition += 15;
        
        // Re-add transaction table header on new page
        yPosition = addTransactionTableHeader(pdf, yPosition);
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'normal');
      }
      
      // Alternate row colors
      const rowColor = index % 2 === 0 ? [255, 255, 255] : [249, 250, 251];
      pdf.setFillColor(rowColor[0], rowColor[1], rowColor[2]);
      pdf.rect(20, yPosition - 5, 170, 10, 'F');
      
      pdf.setFontSize(8);
      pdf.setTextColor(0, 0, 0);
      
      // Date
      pdf.text(new Date(transaction.date).toLocaleDateString(), 25, yPosition);
      
      // Type
      pdf.text(transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1), 55, yPosition);
      
      // Description (truncate if too long)
      const description = transaction.description.length > 25 
        ? transaction.description.substring(0, 25) + '...' 
        : transaction.description;
      pdf.text(description, 80, yPosition);
      
      // Amount with color coding
      const amountColor = transaction.type === 'deposit' || transaction.type === 'loan' 
        ? [34, 197, 94] : [239, 68, 68]; // green for credit, red for debit
      pdf.setTextColor(amountColor[0], amountColor[1], amountColor[2]);
      pdf.text(`KES ${transaction.amount.toLocaleString()}`, 130, yPosition);
      
      // Balance
      pdf.setTextColor(0, 0, 0);
      pdf.text(`KES ${transaction.balance.toLocaleString()}`, 160, yPosition);
      
      yPosition += 12;
    });
    
    // Summary section
    yPosition += 20;
    
    // Check if we need a new page for summary
    if (yPosition > 200) {
      // Add footer to current page
      addStatementFooter(pdf, statementNumber, currentPage, totalPages);
      
      // Create new page for summary
      pdf.addPage();
      currentPage++;
      yPosition = 30;
      
      // Add watermark to summary page if available
      if (logoBase64) {
        try {
          pdf.setGState(pdf.GState({ opacity: 0.1 }));
          pdf.addImage(logoBase64, 'PNG', 60, 80, 90, 90);
          pdf.setGState(pdf.GState({ opacity: 1 }));
        } catch (error) {
          console.warn('Could not add logo to summary page:', error);
        }
      }
    }
    
    // Summary section header
    pdf.setDrawColor(45, 142, 65);
    pdf.setLineWidth(0.5);
    pdf.line(20, yPosition, 190, yPosition);
    
    yPosition += 15;
    pdf.setFontSize(14);
    pdf.setTextColor(45, 142, 65);
    pdf.setFont('helvetica', 'bold');
    pdf.text('STATEMENT SUMMARY', 20, yPosition);
    
    // Summary box
    yPosition += 10;
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.3);
    pdf.rect(20, yPosition, 170, 50);
    
    yPosition += 15;
    pdf.setFontSize(11);
    pdf.setTextColor(0, 0, 0);
    
    // Calculate summary values
    const totalCredits = data.transactions
      .filter(t => t.type === 'deposit' || t.type === 'loan')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalDebits = data.transactions
      .filter(t => t.type === 'withdrawal' || t.type === 'repayment')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const finalBalance = data.transactions.length > 0 
      ? data.transactions[data.transactions.length - 1].balance 
      : 0;
    
    const transactionCount = data.transactions.length;
    
    // Summary details in two columns
    pdf.setFont('helvetica', 'bold');
    pdf.text('Total Transactions:', 25, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(transactionCount.toString(), 80, yPosition);
    
    pdf.setFont('helvetica', 'bold');
    pdf.text('Statement Period:', 110, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${Math.ceil((new Date(data.toDate).getTime() - new Date(data.fromDate).getTime()) / (1000 * 60 * 60 * 24))} days`, 165, yPosition);
    
    yPosition += 10;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Total Credits:', 25, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(34, 197, 94);
    pdf.text(`KES ${totalCredits.toLocaleString()}`, 80, yPosition);
    
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Opening Balance:', 110, yPosition);
    pdf.setFont('helvetica', 'normal');
    const openingBalance = data.transactions.length > 0 
      ? data.transactions[0].balance - data.transactions[0].amount 
      : 0;
    pdf.text(`KES ${openingBalance.toLocaleString()}`, 165, yPosition);
    
    yPosition += 10;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Total Debits:', 25, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(239, 68, 68);
    pdf.text(`KES ${totalDebits.toLocaleString()}`, 80, yPosition);
    
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Closing Balance:', 110, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(45, 142, 65);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`KES ${finalBalance.toLocaleString()}`, 165, yPosition);
    
    // Add footer to final page
    addStatementFooter(pdf, statementNumber, currentPage, totalPages);
    
    // Download the PDF
    const fileName = data.userName 
      ? `vermi-farm-statement-${data.userName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`
      : `vermi-farm-statement-${new Date().toISOString().split('T')[0]}.pdf`;
    
    pdf.save(fileName);
    
  } catch (error) {
    console.error('Error generating statement:', error);
    // Fallback to simple statement
    generateSimpleStatement(data);
  }
};

const generateSimpleStatement = (data: StatementData): void => {
  const pdf = new jsPDF();
  const statementNumber = `VF-STMT-${Date.now().toString().slice(-8)}`;
  const transactionsPerPage = 20;
  const totalPages = Math.max(1, Math.ceil(data.transactions.length / transactionsPerPage) + 1);
  let currentPage = 1;
  
  // Simple header
  pdf.setFontSize(20);
  pdf.setTextColor(45, 142, 65);
  pdf.text('VERMI-FARM INITIATIVE STATEMENT', 105, 20, { align: 'center' });
  
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  pdf.text(`Period: ${new Date(data.fromDate).toLocaleDateString()} - ${new Date(data.toDate).toLocaleDateString()}`, 105, 35, { align: 'center' });
  
  if (data.userName) {
    pdf.text(`Account: ${data.userName}`, 105, 45, { align: 'center' });
  }
  
  if (data.groupName) {
    pdf.text(`Group: ${data.groupName}`, 105, 55, { align: 'center' });
  }
  
  // Table header
  let yPosition = 70;
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Date', 20, yPosition);
  pdf.text('Type', 60, yPosition);
  pdf.text('Description', 90, yPosition);
  pdf.text('Amount', 140, yPosition);
  pdf.text('Balance', 170, yPosition);
  
  yPosition += 5;
  pdf.line(20, yPosition, 190, yPosition);
  yPosition += 10;
  
  // Simple transaction list
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  
  data.transactions.forEach((transaction, index) => {
    if (yPosition > 240) { // Leave space for footer
      addStatementFooter(pdf, statementNumber, currentPage, totalPages);
      pdf.addPage();
      currentPage++;
      yPosition = 30;
      
      // Re-add header on new page
      pdf.setFont('helvetica', 'bold');
      pdf.text('Date', 20, yPosition);
      pdf.text('Type', 60, yPosition);
      pdf.text('Description', 90, yPosition);
      pdf.text('Amount', 140, yPosition);
      pdf.text('Balance', 170, yPosition);
      yPosition += 5;
      pdf.line(20, yPosition, 190, yPosition);
      yPosition += 10;
      pdf.setFont('helvetica', 'normal');
    }
    
    pdf.text(`${new Date(transaction.date).toLocaleDateString()}`, 20, yPosition);
    pdf.text(transaction.type, 60, yPosition);
    
    // Truncate description if too long
    const desc = transaction.description.length > 20 
      ? transaction.description.substring(0, 20) + '...' 
      : transaction.description;
    pdf.text(desc, 90, yPosition);
    
    pdf.text(`KES ${transaction.amount.toLocaleString()}`, 140, yPosition);
    pdf.text(`KES ${transaction.balance.toLocaleString()}`, 170, yPosition);
    
    yPosition += 8;
  });
  
  // Summary section
  yPosition += 15;
  if (yPosition > 220) {
    addStatementFooter(pdf, statementNumber, currentPage, totalPages);
    pdf.addPage();
    currentPage++;
    yPosition = 30;
  }
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('SUMMARY', 20, yPosition);
  yPosition += 10;
  
  const totalCredits = data.transactions
    .filter(t => t.type === 'deposit' || t.type === 'loan')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalDebits = data.transactions
    .filter(t => t.type === 'withdrawal' || t.type === 'repayment')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const finalBalance = data.transactions.length > 0 
    ? data.transactions[data.transactions.length - 1].balance 
    : 0;
  
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Total Transactions: ${data.transactions.length}`, 20, yPosition);
  yPosition += 8;
  pdf.text(`Total Credits: KES ${totalCredits.toLocaleString()}`, 20, yPosition);
  yPosition += 8;
  pdf.text(`Total Debits: KES ${totalDebits.toLocaleString()}`, 20, yPosition);
  yPosition += 8;
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Final Balance: KES ${finalBalance.toLocaleString()}`, 20, yPosition);
  
  // Add footer to final page
  addStatementFooter(pdf, statementNumber, currentPage, totalPages);
  
  const fileName = data.userName 
    ? `statement-${data.userName.replace(/\s+/g, '-').toLowerCase()}.pdf`
    : `statement-${new Date().toISOString().split('T')[0]}.pdf`;
  
  pdf.save(fileName);
};

export const generateCSVStatement = (data: StatementData): void => {
  const csvContent = `VERMI-FARM Account Statement
Period,${new Date(data.fromDate).toLocaleDateString()} - ${new Date(data.toDate).toLocaleDateString()}
${data.userName ? `Account Holder,${data.userName}` : ''}
${data.groupName ? `Group,${data.groupName}` : ''}
Generated,${new Date().toLocaleString()}

Date,Type,Description,Amount,Balance,Status
${data.transactions.map(t => 
  `${new Date(t.date).toLocaleDateString()},${t.type},${t.description},${t.amount},${t.balance},${t.status}`
).join('\n')}

Summary
Total Transactions,${data.transactions.length}
Total Credits,${data.transactions.filter(t => t.type === 'deposit' || t.type === 'loan').reduce((sum, t) => sum + t.amount, 0)}
Total Debits,${data.transactions.filter(t => t.type === 'withdrawal' || t.type === 'repayment').reduce((sum, t) => sum + t.amount, 0)}
Final Balance,${data.transactions.length > 0 ? data.transactions[data.transactions.length - 1].balance : 0}`;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  
  const fileName = data.userName 
    ? `vermi-farm-statement-${data.userName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`
    : `vermi-farm-statement-${new Date().toISOString().split('T')[0]}.csv`;
  
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};