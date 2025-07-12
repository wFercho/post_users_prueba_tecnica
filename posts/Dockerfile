FROM python:3.11-slim

WORKDIR /app

COPY . .

ENV PYTHONPATH=/app

RUN pip install --no-cache-dir -r posts/requirements.txt

EXPOSE 8001

CMD ["uvicorn", "posts.main:app", "--host", "0.0.0.0", "--port", "8001"]