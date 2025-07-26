#!/bin/bash
# Get a single Linear issue by exact identifier using proper team filter

API_KEY="${LINEAR_API_KEY}"
API_URL="https://api.linear.app/graphql"
IDENTIFIER="$1"

# Extract team prefix and number
TEAM=$(echo $IDENTIFIER | grep -oE '^[A-Z]+')
NUMBER=$(echo $IDENTIFIER | grep -oE '[0-9]+')

# Query using issue() method with proper ID lookup
QUERY=$(cat <<EOF
{
  "query": "query { 
    issues(filter: { number: { eq: $NUMBER }, team: { key: { eq: \\"$TEAM\\" } } }) { 
      nodes { 
        id 
        identifier 
        title 
        description
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