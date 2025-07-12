FROM python:3.11-slim

WORKDIR /app

COPY . .

ENV PYTHONPATH=/app

RUN pip install --no-cache-dir -r users/requirements.txt

EXPOSE 8000

CMD ["uvicorn", "users.main:app", "--host", "0.0.0.0", "--port", "8000"]