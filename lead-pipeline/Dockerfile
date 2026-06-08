FROM python:3.12-slim

# Install system dependencies Chromium needs
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libwayland-client0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2 \
    xdg-utils \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Install Python packages
RUN pip install --no-cache-dir \
    playwright==1.44.0 \
    pandas \
    openpyxl \
    python-dotenv \
    httpx

# Install only Chromium browser (smaller than full install)
RUN playwright install chromium

# Copy app code
COPY app/ .

# Default command
CMD ["python", "main.py"]
