import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AcademicRecord, Student, AttendanceRecord, FeeItem, PaymentTransaction } from '../types';

export const exportReportCardPDF = (record: AcademicRecord, student?: Student) => {
  const doc = new jsPDF();

  // Header Banner
  doc.setFillColor(236, 72, 153); // #EC4899 Primary Pink
  doc.rect(0, 0, 210, 36, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('PARENTTEACHER CONNECT', 14, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Official Academic Performance Report Card', 14, 26);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 155, 26);

  // Student Info Box
  doc.setTextColor(31, 41, 55); // Dark text
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Student Information', 14, 48);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Student Name: ${record.studentName}`, 14, 56);
  doc.text(`Roll Number: ${student?.rollNumber || 'N/A'}`, 14, 62);
  doc.text(`Class & Section: ${record.class}`, 14, 68);

  doc.text(`Examination: ${record.examName}`, 110, 56);
  doc.text(`Exam Date: ${record.examDate}`, 110, 62);
  doc.text(`Class Teacher: ${student?.classTeacherName || 'Mrs. Sarah Jenkins'}`, 110, 68);

  // Divider
  doc.setDrawColor(243, 244, 246);
  doc.line(14, 74, 196, 74);

  // Academic Scores Table
  const tableRows = record.scores.map(s => [
    s.subject,
    `${s.obtainedMarks} / ${s.maxMarks}`,
    `${Math.round((s.obtainedMarks / s.maxMarks) * 100)}%`,
    s.grade,
    s.remarks || 'Good proficiency'
  ]);

  autoTable(doc, {
    startY: 80,
    head: [['Subject', 'Marks Obtained', 'Percentage', 'Grade', 'Teacher Remarks']],
    body: tableRows,
    headStyles: {
      fillColor: [236, 72, 153],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9,
      cellPadding: 4
    },
    alternateRowStyles: {
      fillColor: [255, 247, 251] // Light pink tint
    }
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 150;

  // Summary Card
  doc.setFillColor(252, 231, 243); // #FCE7F3
  doc.roundedRect(14, finalY + 8, 182, 32, 3, 3, 'F');

  doc.setTextColor(31, 41, 55);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Score: ${record.totalObtained} / ${record.totalMax}`, 20, finalY + 20);
  doc.text(`Overall Percentage: ${record.percentage}%`, 85, finalY + 20);
  doc.text(`Overall Grade: ${record.overallGrade}`, 155, finalY + 20);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Result Status: Pass with Distinction`, 20, finalY + 30);
  doc.text(`Attendance Standing: ${student?.overallAttendancePct || 94.2}%`, 85, finalY + 30);

  // Teacher Feedback
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Teacher Observations & Comments:', 14, finalY + 50);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  const splitFeedback = doc.splitTextToSize(record.teacherFeedback || 'Consistent academic performance throughout the evaluation term.', 180);
  doc.text(splitFeedback, 14, finalY + 58);

  // Signature Block
  const sigY = finalY + 85;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('_______________________', 20, sigY);
  doc.text('Class Teacher Signature', 20, sigY + 6);

  doc.text('_______________________', 140, sigY);
  doc.text('Principal / Academic Dean', 140, sigY + 6);

  doc.save(`${record.studentName.replace(/\s+/g, '_')}_Report_Card.pdf`);
};

export const exportAttendancePDF = (records: AttendanceRecord[], title = 'Student Attendance Report') => {
  const doc = new jsPDF();

  doc.setFillColor(236, 72, 153);
  doc.rect(0, 0, 210, 30, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('PARENTTEACHER CONNECT', 14, 16);
  doc.setFontSize(10);
  doc.text(title, 14, 24);

  const tableRows = records.map(r => [
    r.date,
    r.studentName,
    r.class,
    r.status,
    r.markedBy,
    r.remarks || '-'
  ]);

  autoTable(doc, {
    startY: 38,
    head: [['Date', 'Student Name', 'Class', 'Status', 'Marked By', 'Remarks']],
    body: tableRows,
    headStyles: {
      fillColor: [236, 72, 153],
      textColor: [255, 255, 255]
    },
    styles: { fontSize: 8.5 }
  });

  doc.save(`Attendance_Report_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportFeeReceiptPDF = (txn: PaymentTransaction, feeItem?: FeeItem) => {
  const doc = new jsPDF();

  doc.setFillColor(236, 72, 153);
  doc.rect(0, 0, 210, 36, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('PARENTTEACHER CONNECT', 14, 18);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Official Fee Payment Receipt (Simulated Demonstration)', 14, 26);
  doc.text(`Receipt #: ${txn.receiptNumber}`, 145, 26);

  doc.setTextColor(31, 41, 55);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Transaction Details', 14, 48);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Student: ${txn.studentName}`, 14, 56);
  doc.text(`Paid By: ${txn.paidBy}`, 14, 62);
  doc.text(`Payment Date: ${txn.paymentDate}`, 14, 68);

  doc.text(`Category: ${feeItem?.category || 'Tuition / School Fee'}`, 110, 56);
  doc.text(`Payment Method: ${txn.paymentMethod}`, 110, 62);
  doc.text(`Amount Paid: $${txn.amount.toFixed(2)}`, 110, 68);

  autoTable(doc, {
    startY: 76,
    head: [['Item Description', 'Total Assessed', 'Paid in Transaction', 'Outstanding Balance']],
    body: [
      [
        feeItem?.category || 'School Fee',
        feeItem ? `$${feeItem.totalAmount}` : `$${txn.amount}`,
        `$${txn.amount}`,
        feeItem ? `$${Math.max(0, feeItem.totalAmount - feeItem.paidAmount)}` : '$0'
      ]
    ],
    headStyles: { fillColor: [236, 72, 153], textColor: [255, 255, 255] },
    styles: { fontSize: 10 }
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 110;
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Notes: ' + (txn.notes || 'Verified electronic payment acknowledgment.'), 14, finalY + 12);
  doc.text('* This is an educational demonstration receipt generated by ParentTeacher Connect.', 14, finalY + 18);

  doc.save(`Receipt_${txn.receiptNumber}.pdf`);
};

export const exportToCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
  const csvContent =
    'data:text/csv;charset=utf-8,' +
    [headers.join(','), ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
