# Use Bun official image
FROM oven/bun:latest

# Set working directory
WORKDIR /app/socket

# Copy package and lock files
COPY package.json  bun.lock ./

# Install dependencies
RUN bun install

# Copy the rest of the project
COPY . .

# Expose the port your app listens on
EXPOSE 10000

# Start the server
CMD ["bun", "run", "server"]
