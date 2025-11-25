package com.mogbook;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfWriter;

import java.io.FileOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class Recibo {

    public static String gerar(
            String alunoId,
            String alunoNome,
            String premioId,
            String premioNome,
            int pontos,
            String caminho
    ) {
        try {
            Document doc = new Document();
            PdfWriter.getInstance(doc, new FileOutputStream(caminho));
            doc.open();

            Font titulo = new Font(Font.FontFamily.HELVETICA, 18, Font.BOLD);
            Font texto = new Font(Font.FontFamily.HELVETICA, 12);

            doc.add(new Paragraph("recibo de troca de prêmio", titulo));
            doc.add(new Paragraph("\n"));

            doc.add(new Paragraph("id do aluno: " + alunoId, texto));
            doc.add(new Paragraph("nome do aluno: " + alunoNome, texto));
            doc.add(new Paragraph("id do prêmio: " + premioId, texto));
            doc.add(new Paragraph("nome do prêmio: " + premioNome, texto));
            doc.add(new Paragraph("pontos gastos: " + pontos, texto));

            String horario = LocalDateTime.now()
                    .format(DateTimeFormatter.ofPattern("dd/MM/yyyy  HH:mm"));

            doc.add(new Paragraph("data da troca: " + horario, texto));

            doc.close();
            return caminho;

        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}
