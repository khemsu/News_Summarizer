import pdfplumber


def extract_text_from_pdf(file) -> str:
    with pdfplumber.open(file) as pdf:
        text = ''
        for page in pdf.pages:
            text += page.extract_text() + '\n'
    return text