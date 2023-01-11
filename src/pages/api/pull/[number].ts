import type { NextApiRequest, NextApiResponse } from "next";

import { getApprovedReviewsOfPullRequest, getRequestedConsultantReviewsOfPullRequest } from '../../../core/github/repository';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { number } = req.query;
  const { repositoryName } = req.body;

  const approves = await getApprovedReviewsOfPullRequest(repositoryName, Number(number));
  const consultants = await getRequestedConsultantReviewsOfPullRequest(repositoryName, Number(number));

  res.status(200).json({
    reviews: {
      approves: approves,
      consultants: consultants
    }
  });
}