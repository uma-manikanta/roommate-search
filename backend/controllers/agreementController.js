const PDFDocument = require('pdfkit');

// @desc    Generate a Joint Living Agreement PDF
// @route   POST /api/agreements/generate
// @access  Private
const generateAgreement = async (req, res) => {
  try {
    const {
      tenant1Name = req.user.name || 'Tenant 1',
      tenant2Name = 'Tenant 2',
      propertyAddress = 'TBD Property Address',
      rentSplit = '50-50',
      deposit = '2 Months Rent',
      noticePeriod = '30 Days',
      houseRules = 'No smoking. Quiet hours after 10 PM. Clean dishes immediately.'
    } = req.body;

    // Set the headers to tell the browser it's a PDF
    res.setHeader('Content-Disposition', 'attachment; filename=roommate-agreement.pdf');
    res.setHeader('Content-Type', 'application/pdf');

    // Create the PDF document
    const doc = new PDFDocument({ margin: 50 });

    // Pipe the PDF directly to the response stream
    doc.pipe(res);

    // Document Header
    doc.fontSize(24).font('Helvetica-Bold').text('Joint Living Agreement', { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(10).font('Helvetica').text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(2);

    // Section 1: Parties
    doc.fontSize(16).font('Helvetica-Bold').text('1. The Parties');
    doc.fontSize(12).font('Helvetica').moveDown(0.5);
    doc.text(`This agreement is made between ${tenant1Name} (Tenant 1) and ${tenant2Name} (Tenant 2).`);
    doc.moveDown();

    // Section 2: Property
    doc.fontSize(16).font('Helvetica-Bold').text('2. The Property');
    doc.fontSize(12).font('Helvetica').moveDown(0.5);
    doc.text(`The roommates agree to jointly lease the property located at: ${propertyAddress}`);
    doc.moveDown();

    // Section 3: Financial Terms
    doc.fontSize(16).font('Helvetica-Bold').text('3. Financial Terms');
    doc.fontSize(12).font('Helvetica').moveDown(0.5);
    doc.text(`• Rent Split Ratio: ${rentSplit}`);
    doc.text(`• Security Deposit Split: ${deposit}`);
    doc.text(`• Notice Period: ${noticePeriod}`);
    doc.moveDown();

    // Section 4: House Rules
    doc.fontSize(16).font('Helvetica-Bold').text('4. House Rules & Lifestyle');
    doc.fontSize(12).font('Helvetica').moveDown(0.5);
    doc.text(houseRules);
    doc.moveDown(2);

    // Signatures
    doc.fontSize(16).font('Helvetica-Bold').text('5. Signatures');
    doc.fontSize(12).font('Helvetica').moveDown(1);
    
    doc.text('_____________________________', 50, doc.y);
    doc.text('_____________________________', 300, doc.y - 12);
    
    doc.moveDown();
    doc.text(`${tenant1Name} (Signature)`, 50, doc.y);
    doc.text(`${tenant2Name} (Signature)`, 300, doc.y - 12);

    // Finalize the PDF and end the stream
    doc.end();

  } catch (error) {
    console.error('Error generating PDF:', error);
    // If the header hasn't been sent yet, we can send a 500 JSON error
    if (!res.headersSent) {
      res.status(500).json({ message: 'Failed to generate PDF agreement' });
    }
  }
};

module.exports = { generateAgreement };
