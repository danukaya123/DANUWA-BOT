# Use official Node.js 20 LTS image
FROM node:20

# Set working directory inside the container
WORKDIR /app

# Copy package files first (to leverage Docker cache)
COPY package.json package-lock.json* yarn.lock* ./

# Install dependencies (npm or yarn, whichever lockfile you have)
RUN if [ -f yarn.lock ]; then yarn install --frozen-lockfile; else npm install; fi

# Copy the rest of your app files
COPY . .

# Expose any port if needed (usually bots don't need this)
# EXPOSE 3000

# Start your bot
CMD ["node", "index.js"]
