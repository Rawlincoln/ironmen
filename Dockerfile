FROM python:3.12-slim

WORKDIR /app

COPY . .

RUN mkdir -p api/data

ENV PORT=8080
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8080/api/health')"

CMD ["python", "api/server.py"]