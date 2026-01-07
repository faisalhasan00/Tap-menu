import { Order } from '@/services/orderService';

interface InvoiceData {
  restaurantName: string;
  orderId: string;
  trackingNumber: string;
  orderDate: string;
  tableNumber: number;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  totalAmount: number;
}

/**
 * Generate and download a PDF invoice for an order
 */
export async function generateInvoice(data: InvoiceData): Promise<void> {
  try {
    // Dynamically import jsPDF
    const jsPDF = await import('jspdf');
    const pdf = new jsPDF.default('p', 'mm', 'a4');

    const pageWidth = 210; // A4 width in mm
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let yPosition = margin;

    // Helper function to add a new page if needed
    const checkPageBreak = (requiredHeight: number) => {
      if (yPosition + requiredHeight > 280) {
        pdf.addPage();
        yPosition = margin;
        return true;
      }
      return false;
    };

    // Helper function to add text with word wrap
    const addText = (text: string, x: number, y: number, options?: { fontSize?: number; fontStyle?: string; align?: 'left' | 'center' | 'right'; color?: [number, number, number] }) => {
      pdf.setFontSize(options?.fontSize || 12);
      if (options?.fontStyle) {
        pdf.setFont('helvetica', options.fontStyle as any);
      }
      if (options?.color) {
        pdf.setTextColor(options.color[0], options.color[1], options.color[2]);
      }
      const lines = pdf.splitTextToSize(text, contentWidth - (x - margin));
      pdf.text(lines, x, y);
      return lines.length * (options?.fontSize || 12) * 0.35; // Approximate line height
    };

    // Header Section
    pdf.setFillColor(34, 197, 94); // #22C55E
    pdf.rect(margin, yPosition, contentWidth, 15, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('INVOICE', margin + 10, yPosition + 10);
    
    yPosition += 20;

    // Restaurant Name
    pdf.setTextColor(15, 23, 42); // #0F172A
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text(data.restaurantName, margin, yPosition);
    yPosition += 10;

    // Order Information Section
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    
    const orderInfo = [
      ['Order ID:', data.orderId.substring(0, 20) + '...'],
      ['Tracking Number:', data.trackingNumber],
      ['Date & Time:', new Date(data.orderDate).toLocaleString()],
      ['Table Number:', `Table ${data.tableNumber}`],
    ];

    orderInfo.forEach(([label, value]) => {
      pdf.setTextColor(100, 100, 100);
      pdf.setFont('helvetica', 'normal');
      pdf.text(label, margin, yPosition);
      pdf.setTextColor(15, 23, 42);
      pdf.setFont('helvetica', 'bold');
      pdf.text(value, margin + 50, yPosition);
      yPosition += 6;
    });

    yPosition += 10;

    // Divider Line
    pdf.setDrawColor(200, 200, 200);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // Items Table Header
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(15, 23, 42);
    pdf.text('Items', margin, yPosition);
    yPosition += 8;

    // Table Header Row
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(100, 100, 100);
    
    const tableHeaders = ['Item', 'Qty', 'Price', 'Total'];
    const columnWidths = [80, 20, 35, 35];
    let xPos = margin;
    
    tableHeaders.forEach((header, index) => {
      pdf.text(header, xPos, yPosition);
      xPos += columnWidths[index];
    });
    
    yPosition += 5;
    
    // Draw line under header
    pdf.setDrawColor(200, 200, 200);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;

    // Items Rows
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(15, 23, 42);
    
    data.items.forEach((item) => {
      checkPageBreak(15);
      
      // Item Name
      const itemNameLines = pdf.splitTextToSize(item.name, columnWidths[0] - 5);
      pdf.setFontSize(10);
      pdf.text(itemNameLines, margin, yPosition);
      const itemNameHeight = itemNameLines.length * 5;
      
      // Quantity
      pdf.text(item.quantity.toString(), margin + columnWidths[0], yPosition);
      
      // Price
      pdf.text(`₹${item.price.toFixed(2)}`, margin + columnWidths[0] + columnWidths[1], yPosition);
      
      // Total
      const itemTotal = item.price * item.quantity;
      pdf.text(`₹${itemTotal.toFixed(2)}`, margin + columnWidths[0] + columnWidths[1] + columnWidths[2], yPosition);
      
      yPosition += Math.max(itemNameHeight, 8);
    });

    yPosition += 10;

    // Total Section
    checkPageBreak(20);
    
    // Divider Line
    pdf.setDrawColor(200, 200, 200);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // Total Amount
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(15, 23, 42);
    pdf.text('Total Amount:', margin, yPosition);
    
    pdf.setFontSize(16);
    pdf.setTextColor(34, 197, 94); // #22C55E
    pdf.text(`₹${data.totalAmount.toFixed(2)}`, pageWidth - margin - 40, yPosition, { align: 'right' });
    
    yPosition += 15;

    // Footer Section
    checkPageBreak(20);
    
    // Divider Line
    pdf.setDrawColor(200, 200, 200);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // Powered by D-Menu
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(150, 150, 150);
    pdf.text('Powered by D-Menu', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 5;
    
    // Thank you message
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Thank you for your order!', pageWidth / 2, yPosition, { align: 'center' });

    // Generate filename
    const fileName = `Invoice-${data.trackingNumber}-${new Date().getTime()}.pdf`;
    
    // Save PDF
    pdf.save(fileName);
  } catch (error) {
    console.error('Error generating invoice:', error);
    throw new Error('Failed to generate invoice. Please try again.');
  }
}

/**
 * Generate invoice from Order object
 */
export async function generateInvoiceFromOrder(order: Order, restaurantName: string): Promise<void> {
  const trackingNumber = order.trackingNumber || order.trackingId || 'N/A';
  
  const invoiceData: InvoiceData = {
    restaurantName,
    orderId: order._id,
    trackingNumber,
    orderDate: order.createdAt,
    tableNumber: order.tableNumber,
    items: order.items.map(item => ({
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
    totalAmount: order.totalAmount,
  };

  await generateInvoice(invoiceData);
}
