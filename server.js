require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");
const PORT = process.env.PORT;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

const app = express();

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com; script-src-elem 'self' 'unsafe-inline' https://cdn.tailwindcss.com; style-src 'self' 'unsafe-inline'; style-src-elem 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data: https:; connect-src 'self' https:; base-uri 'self'; form-action 'self'; object-src 'none';",
  );
  next();
});

app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/favicon.ico", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "favicon.ico"));
});

app.get("/logo.png", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "logo.png"));
});

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function gerarPdf(nome) {
  const pdfPath = path.join(__dirname, "public", "certificado.pdf");
  const pdfBytes = fs.readFileSync(pdfPath);

  const pdfDoc = await PDFDocument.load(pdfBytes);
  const page = pdfDoc.getPages()[0];
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const fontSize = 18;
  const x = 285;
  const y = 365;

  page.drawText(nome, {
    x,
    y,
    size: fontSize,
    font,
    color: rgb(0, 0, 0),
  });

  return Buffer.from(await pdfDoc.save());
}

app.post("/enviar", async (req, res) => {
  try {
    const { nome, email } = req.body;
    const pdfBuffer = await gerarPdf(nome);

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Seu certificado "Meu primeiro código" chegou 🎉',
      html: `
        <p>Olá ${nome},</p>
        <p>Segue em anexo o seu certificado.</p>
        <p>Parabéns pela conclusão e obrigado pela participação!</p>
        <p>Atenciosamente,<br>Turma A - Engenharia de Sofwatre</p>
      `,
      attachments: [
        {
          filename: "certificado.pdf",
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    res.json({ ok: true, message: "Enviado com sucesso" });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(
    `Servidor rodando na porta: ${PORT} senha: ${EMAIL_PASS} email: ${EMAIL_USER}`,
  );
});
