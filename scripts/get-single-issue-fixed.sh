#!/bin/bash
# Get a single Linear issue by exact identifier

API_KEY="${LINEAR_API_KEY}"
API_URL="https://api.linear.app/graphql"
IDENTIFIER="$1"

# Extract just the number from BAC-154
NUMBER=$(echo $IDENTIFIER | grep -oE '[0-9]+')

# Query for exact identifier match - properly escaped
curl -s -H "Authorization: $API_KEY" \
     -H "Content-Type: application/json" \
     -X POST "$API_URL" \
     -d "{\"query\": \"query { issues(filter: { number: { eq: $NUMBER } }) { nodes { id identifier title state { name } project { name } team { name } createdAt updatedAt assignee { name } } } }\"}" | python3 -m json.tool