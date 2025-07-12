#!/bin/bash

sudo apt-get update
sudo apt-get install -y curl postgresql postgresql-contrib redis

# Start services
sudo service postgresql start
sudo service redis-server start

# Install Node 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Setup DB user and database
sudo -u postgres psql -c "CREATE USER cinemaos WITH PASSWORD 'password';"
sudo -u postgres psql -c "CREATE DATABASE cinemaos OWNER cinemaos;"

echo "Setup complete: node $(node -v), postgres $(psql --version), redis $(redis-server --version)"
