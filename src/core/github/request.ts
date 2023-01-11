import { Octokit } from 'octokit';

export async function get(path: string) {
  const res = await getApi().request(`GET ${path}`);
  return res.data;
}

function getApi() {
  return new Octokit({
    auth: process.env.GITHUB_TOKEN
  });
}