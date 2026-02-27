// Fetches all Linear issues for the Multimodal GA project and writes data.json
import { writeFileSync } from 'fs';

const API_KEY = process.env.LINEAR_API_KEY;
if (!API_KEY) throw new Error('LINEAR_API_KEY environment variable not set');

const PROJECT_ID = '87d18069-e9b5-48c2-913e-d71df670ff91';

const QUERY = `
  query GetProjectIssues($first: Int = 250, $after: String) {
    issues(
      first: $first
      after: $after
      filter: { project: { id: { eq: "${PROJECT_ID}" } } }
    ) {
      pageInfo { hasNextPage endCursor }
      nodes {
        id
        title
        state { name type }
        labels(first: 10) { nodes { name } }
        createdAt
        completedAt
      }
    }
  }
`;

async function fetchAll() {
  let all = [], cursor = null, hasMore = true;
  while (hasMore) {
    const resp = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': API_KEY,
      },
      body: JSON.stringify({ query: QUERY, variables: { after: cursor } }),
    });
    if (!resp.ok) throw new Error(`Linear API responded with HTTP ${resp.status}`);
    const { data, errors } = await resp.json();
    if (errors) throw new Error(errors[0].message);
    all.push(...data.issues.nodes);
    hasMore = data.issues.pageInfo.hasNextPage;
    cursor = data.issues.pageInfo.endCursor;
    if (hasMore) process.stdout.write(`  fetched ${all.length} so far…\r`);
  }
  return all;
}

console.log('Fetching Linear issues…');
const issues = await fetchAll();
console.log(`Fetched ${issues.length} issues.`);

const output = JSON.stringify({ fetchedAt: new Date().toISOString(), issues }, null, 0);
writeFileSync('data.json', output);
console.log(`Wrote data.json (${(output.length / 1024).toFixed(1)} KB)`);
