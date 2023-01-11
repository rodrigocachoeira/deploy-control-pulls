import type { NextApiRequest, NextApiResponse } from 'next';

import { getApprovedReviewsOfPullRequest, getPullRequestsNumbers } from '../../../core/github/repository';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { repositoryName } = req.query;

  const pullRequests = await getPullRequestsNumbers(repositoryName as string);

  let pullRequestReviewers:Array<any> = [];
  
  for(let i = 0; i < pullRequests.length; i++) {
    const pullRequest = pullRequests[i];

    const approvedReviews = await getApprovedReviewsOfPullRequest(repositoryName as string, pullRequests[i].number);
    const consultants = pullRequests[i].consultants;

    delete pullRequest.consultants;

    pullRequestReviewers.push({
      pullRequest: pullRequests[i],
      approvedReviews: approvedReviews,
      consultants: consultants
    });
  }

  res.status(200).json(pullRequestReviewers);
}