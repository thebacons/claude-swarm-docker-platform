#!/bin/bash
# Enhanced Linear API wrapper with full issue access

API_KEY="${LINEAR_API_KEY}"
API_URL="https://api.linear.app/graphql"

# Function to make GraphQL queries
query_linear() {
    local query=$1
    curl -s -H "Authorization: $API_KEY" \
         -H "Content-Type: application/json" \
         -X POST "$API_URL" \
         -d "{\"query\": \"$query\"}"
}

# Command dispatcher
case "$1" in
    "list-projects")
        query_linear "query { projects { nodes { id name description } } }" | python3 -m json.tool
        ;;
    "list-issues")
        query_linear "query { issues(first: 50) { nodes { id identifier title state { name } assignee { name } } } }" | python3 -m json.tool
        ;;
    "get-issue")
        ISSUE_ID="$2"
        query_linear "query { issue(id: \\\"$ISSUE_ID\\\") { id identifier title description state { name } assignee { name } createdAt updatedAt project { name } team { name } } }" | python3 -m json.tool
        ;;
    "get-issue-by-identifier")
        IDENTIFIER="$2"
        query_linear "query { searchIssues(term: \\\"$IDENTIFIER\\\") { nodes { id identifier title description state { name } assignee { name } createdAt updatedAt project { name } team { name } } } }" | python3 -m json.tool
        ;;
    "list-teams")
        query_linear "query { teams { nodes { id name } } }" | python3 -m json.tool
        ;;
    "create-issue")
        TITLE="$2"
        TEAM_ID="514e7aa2-933b-47df-ab36-1d6ca335316d"  # Bacon-ai team
        query_linear "mutation { createIssue(input: { title: \\\"$TITLE\\\", teamId: \\\"$TEAM_ID\\\" }) { issue { id identifier title } } }" | python3 -m json.tool
        ;;
    *)
        echo "Usage: $0 {list-projects|list-issues|get-issue <id>|get-issue-by-identifier <BAC-XXX>|list-teams|create-issue <title>}"
        exit 1
        ;;
esac