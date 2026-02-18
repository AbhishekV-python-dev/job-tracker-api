FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV FLASK_APP=run.py

EXPOSE 5000

COPY start.sh .
RUN chmod +x start.sh

CMD ["./start.sh"]
