package com.footwearshop.service.Impl;

import com.footwearshop.dto.BillItemResponseDto;
import com.footwearshop.dto.BillResponseDto;
import com.footwearshop.service.BillingService;
import com.footwearshop.service.ReportService;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReportServiceImpl implements ReportService {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd-MM-yyyy");

    private final BillingService billingService;

    public ReportServiceImpl(BillingService billingService) {
        this.billingService = billingService;
    }

    @Override
    public List<BillResponseDto> getSalesReport(LocalDate from, LocalDate to, String paymentMode) {
        return filter(billingService.getBillsByDateRange(from, to), paymentMode);
    }

    @Override
    public byte[] generateSalesPdf(LocalDate from, LocalDate to, String paymentMode) {
        List<BillResponseDto> bills = getSalesReport(from, to, paymentMode);
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document doc = new Document(PageSize.A4.rotate());
            PdfWriter.getInstance(doc, out);
            doc.open();
            doc.add(new Paragraph("Shivam Footwear Shop - Sales Report"));
            doc.add(new Paragraph("Period: " + from.format(DATE_FMT) + " to " + to.format(DATE_FMT)));
            doc.add(Chunk.NEWLINE);

            PdfPTable table = new PdfPTable(14);
            table.setWidthPercentage(100);
            String[] headers = {
                    "Bill No", "Date", "Payment", "Brand/Article", "Category", "Type", "Size",
                    "Qty", "MRP", "Purchase", "Sale Price", "Margin", "Returned", "Net"
            };
            for (String h : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(h));
                cell.setBackgroundColor(new java.awt.Color(220, 220, 220));
                table.addCell(cell);
            }

            for (BillResponseDto bill : bills) {
                if (bill.getItems() == null || bill.getItems().isEmpty()) {
                    continue;
                }
                for (BillItemResponseDto item : bill.getItems()) {
                    table.addCell(bill.getBillNo() != null ? bill.getBillNo() : "INV-" + String.format("%04d", bill.getId()));
                    table.addCell(bill.getBillDate().format(DATE_FMT));
                    table.addCell(bill.getPaymentMode());
                    table.addCell((item.getProductName() != null ? item.getProductName() : "") +
                            (item.getArticle() != null ? " / " + item.getArticle() : ""));
                    table.addCell(item.getCategory() != null ? item.getCategory() : "");
                    table.addCell(item.getType() != null ? item.getType() : "");
                    table.addCell(String.valueOf(item.getSize()));
                    table.addCell(String.valueOf(item.getQuantity()));
                    table.addCell(item.getMrp() != null ? item.getMrp().toString() : "");
                    table.addCell(item.getPurchasePrice() != null ? item.getPurchasePrice().toString() : "");
                    table.addCell(item.getActualUnitPrice() != null ? item.getActualUnitPrice().toString() : "0");
                    table.addCell(item.getLineMargin() != null ? item.getLineMargin().toString() : "");
                    table.addCell(item.getReturnedAmount() != null ? item.getReturnedAmount().toString() : "0");
                    table.addCell(bill.getNetTotal() != null ? bill.getNetTotal().toString() : bill.getTotalAmount().toString());
                }
            }
            doc.add(table);
            doc.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("PDF generation failed: " + e.getMessage(), e);
        }
    }

    @Override
    public byte[] generateSalesExcel(LocalDate from, LocalDate to, String paymentMode) {
        List<BillResponseDto> bills = getSalesReport(from, to, paymentMode);
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Sales Report");
            Row header = sheet.createRow(0);
            String[] headers = {
                    "Bill No", "Date", "Time", "Payment", "Sub Brand", "Article", "Brand",
                    "Category", "Type", "Size", "Qty", "MRP", "Purchase Price", "Sale Price",
                    "Line Margin", "Line Total", "Returned Qty", "Returned Amount",
                    "Bill Total", "Bill Margin", "Net Total", "Net Margin"
            };
            for (int i = 0; i < headers.length; i++) {
                header.createCell(i).setCellValue(headers[i]);
            }

            int rowNum = 1;
            for (BillResponseDto bill : bills) {
                if (bill.getItems() == null || bill.getItems().isEmpty()) {
                    continue;
                }
                for (BillItemResponseDto item : bill.getItems()) {
                    Row row = sheet.createRow(rowNum++);
                    int c = 0;
                    row.createCell(c++).setCellValue(bill.getBillNo() != null ? bill.getBillNo() : "INV-" + String.format("%04d", bill.getId()));
                    row.createCell(c++).setCellValue(bill.getBillDate().format(DATE_FMT));
                    row.createCell(c++).setCellValue(bill.getBillTime() != null ? bill.getBillTime().toString() : "");
                    row.createCell(c++).setCellValue(bill.getPaymentMode());
                    row.createCell(c++).setCellValue(item.getSubBrand() != null ? item.getSubBrand() : "");
                    row.createCell(c++).setCellValue(item.getArticle() != null ? item.getArticle() : "");
                    row.createCell(c++).setCellValue(item.getProductName() != null ? item.getProductName() : "");
                    row.createCell(c++).setCellValue(item.getCategory() != null ? item.getCategory() : "");
                    row.createCell(c++).setCellValue(item.getType() != null ? item.getType() : "");
                    row.createCell(c++).setCellValue(item.getSize());
                    row.createCell(c++).setCellValue(item.getQuantity());
                    row.createCell(c++).setCellValue(item.getMrp() != null ? item.getMrp().doubleValue() : 0);
                    row.createCell(c++).setCellValue(item.getPurchasePrice() != null ? item.getPurchasePrice().doubleValue() : 0);
                    row.createCell(c++).setCellValue(item.getActualUnitPrice() != null ? item.getActualUnitPrice().doubleValue() : 0);
                    row.createCell(c++).setCellValue(item.getLineMargin() != null ? item.getLineMargin().doubleValue() : 0);
                    row.createCell(c++).setCellValue(item.getTotal() != null ? item.getTotal().doubleValue() : 0);
                    row.createCell(c++).setCellValue(item.getReturnedQty() != null ? item.getReturnedQty() : 0);
                    row.createCell(c++).setCellValue(item.getReturnedAmount() != null ? item.getReturnedAmount().doubleValue() : 0);
                    row.createCell(c++).setCellValue(bill.getTotalAmount().doubleValue());
                    row.createCell(c++).setCellValue(bill.getTotalMargin() != null ? bill.getTotalMargin().doubleValue() : 0);
                    row.createCell(c++).setCellValue(bill.getNetTotal() != null ? bill.getNetTotal().doubleValue() : bill.getTotalAmount().doubleValue());
                    row.createCell(c++).setCellValue(bill.getNetMargin() != null ? bill.getNetMargin().doubleValue() : 0);
                }
            }
            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Excel generation failed: " + e.getMessage(), e);
        }
    }

    private List<BillResponseDto> filter(List<BillResponseDto> bills, String paymentMode) {
        if (paymentMode == null || paymentMode.isBlank()) {
            return bills;
        }
        return bills.stream()
                .filter(b -> paymentMode.equalsIgnoreCase(b.getPaymentMode()))
                .collect(Collectors.toList());
    }
}
