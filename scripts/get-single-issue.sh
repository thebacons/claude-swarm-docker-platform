#!/bin/bash
# Get a single Linear issue by exact identifier

API_KEY="${LINEAR_API_KEY}"
API_URL="https://api.linear.app/graphql"
IDENTIFIER="$1"

# Query for exact identifier match
QUERY=$(cat <<EOF
{
  "query": "query { 
    issues(filter: { number: { eq: 154 } }) { 
      nodes { 
        id 
        identifier 
        title 
        state { name } 
        project { name } 
        team { name }
        createdAt
        updatedAt
        assignee { name }
      } 
    } 
  }"
}
EOF
)

curl -s -H "Authorization: $API_KEY" \
     -H "Content-Type: application/json" \
     -X POST "$API_URL" \
     -d "$QUERY" | python3 -m json.tool