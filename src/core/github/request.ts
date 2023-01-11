import { Octokit } from 'octokit';

export async function get(path: string) {
  const res = await getApi().request(`GET ${path}`);
  return res.data;
}

export async function paginate(path: string, page: number) {
  const res = await getApi().request(`GET ${path}&page=${page}`);
  const lastPage = getLastPage(String(res.headers.link));

  return {
    data: res.data,
    hasMorePages: page < lastPage
  };
}

function getLastPage(link: string) {
  if (link) {
    let last = String(link.split(",")[1]);
    const lastPage = last.split("page=")[2].split(">")[0];
    
    return lastPage;
  }

  return 999;
}

function getApi() {
  return new Octokit({
    auth: process.env.GITHUB_TOKEN
  });
}