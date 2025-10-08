#!/bin/sh
# Docker health check script

# For development environment
if [ "$NODE_ENV" = "development" ]; then
    curl -f http://localhost:5173/ || exit 1
else
    # For production environment
    curl -f http://localhost/health || exit 1
fi


