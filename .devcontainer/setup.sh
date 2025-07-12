#!/bin/bash

# Update and install essentials
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib redis nodejs npm

# Start Postgres and Redis services
sudo service postgresql start
sudo service redis-server start

# Install Node v20 via NodeSource (more reliable than apt's old Node)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Show versions
echo "Node version: $(node -v)"
echo "Postgres version: $(psql --version)"
echo "Redis version: $(redis-server --version)"

# Set up Postgres user and database
sudo -u postgres psql -c "CREATE USER cinemaos WITH PASSWORD 'password';"
sudo -u postgres psql -c "CREATE DATABASE cinemaos OWNER cinemaos;"

echo "🎬 CinemaOS dev environment ready — open terminal tabs and run your services via npm/yarn!"
