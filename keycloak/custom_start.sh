#!/bin/bash

set -e

# Export all variables defined in sourced files
set -a

# Take the first command line argument or default to "start-dev" if it's not given
START_ARG="${1:-start-dev}"

echo "trying to read secrets..."
if [[ -f /run/secrets/keycloak_secrets ]]; then
    echo "sourcing secrets..."
    source /run/secrets/keycloak_secrets
    echo "secrets sourced"
fi

set +a

# Run the 'exec' command as the last step of the script.
# As it replaces the current shell process, no additional shell commands will run after the 'exec' command.
exec /opt/keycloak/bin/kc.sh $START_ARG "$@"
