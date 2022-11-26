import type { NextApiRequest, NextApiResponse } from "next";

import { getApprovedReviewsOfPullRequest } from '../../../core/github/repository';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { number } = req.query;
  const { repositoryName } = req.body;

  const pullReviews = await getApprovedReviewsOfPullRequest(repositoryName, Number(number));

  res.status(200).json({
    reviews: pullReviews
  });
}