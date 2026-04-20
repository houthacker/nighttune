#!/usr/bin/env bash

# Exit immediately on error
set -e

ENV_FILE=${ENV_FILE:-'/config/.env'}
NEXT_DIST_DIR=${NEXT_DIST_DIR:-'/app/dist'}

# The 'real' env file must be mounted at /config/.env
if [ ! -f "${ENV_FILE}" ]; then
    echo "Missing required environment file at ${ENV_FILE}, aborting."
    exit 1
fi

# Largely inspired by https://www.abgeo.dev/blog/dynamic-environment-variables-dockerized-nextjs/
replace_template_env_vars () {
    cat ${ENV_FILE} | while read -r LINE ; do
        if [ ! -z "${LINE}" ]; then
            # Get key
            KEY=$(cut -d '=' -f1 <<< "$LINE")

            # Get value (everything after the first '=')
            VALUE=$(cut -d '=' -f2- <<< "$LINE")

            # Remove possible single- and double quotes
            VALUE="${VALUE%\'}"
            VALUE="${VALUE#\'}"
            VALUE="${VALUE%\"}"
            VALUE="${VALUE#\"}"

            # Escape forward slashes
            VALUE="${VALUE//\//\\/}"

            # Replace everything in the nextjs distribution directory with the real env values
            echo "find ${NEXT_DIST_DIR} -type f -exec sed -i \"s/_${KEY}_/${VALUE}/g\" {} +"
            find ${NEXT_DIST_DIR} -type f -exec sed -i "s/_${KEY}_/${VALUE}/g" {} +
        fi
    done
}

replace_template_env_vars

# Start the app
exec npm start