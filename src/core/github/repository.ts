import { get } from './request';

const OWNER = 'atlastechnol';

export async function getPullRequestsNumbers(repositoryName: string) {
  const data = await get(`/repos/${OWNER}/${repositoryName}/pulls`);

  let pulls:Array<any> = [];

  await data.forEach((pull: any) => {
    const isOpen = pull.state == 'open';

    if (isOpen) {
      pulls.push({
        number: pull.number,
        title: pull.title,
        body: pull.body,
        createdBy: {
          author: pull.user.login,
          image: pull.user.avatar_url
        },
        createdAt: pull.created_at
      });
    }
  });

  return pulls;
}

export async function getRequestedConsultantReviewsOfPullRequest(repositoryName: string, pullNumber: Number) {
  const data = await get(`/repos/${OWNER}/${repositoryName}/pulls/${pullNumber}/requested_reviewers`);

  let consultants:Object[] = [];

  await data.teams.forEach((team: any) => {
    consultants.push({
      name: team.name,
      slug: team.slug
    });
  });

  return consultants;
}

export async function getApprovedReviewsOfPullRequest(repositoryName: string, pullNumber: Number) {
  const data = await get(`/repos/${OWNER}/${repositoryName}/pulls/${pullNumber}/reviews`);

  let reviews:Object[] = [];

  await data.forEach((review: any) => {
    const isApproved = review.state == 'APPROVED';

    if (isApproved) {   
      const alreadyApproved = reviews.filter((r: any) => {
        return r.author === review.user.login;
      }) as any;

      if (alreadyApproved.length == 0) {
        reviews.push({
          author: review.user.login,
          reviewed_at: review.submitted_at
        });

        return;
      }

      reviews = updateApprovedReviewsList(reviews, review, alreadyApproved[0]);
    }
  });

  return reviews;
}

function updateApprovedReviewsList(reviews: Object[], newReview: any, currentReview: any) {
  const newReviewDate = new Date(newReview.submitted_at);
  const currentReiewDate = new Date(currentReview.reviewed_at);

  if (newReviewDate > currentReiewDate) {
    reviews = reviews.filter((r: any) => {
      return r.author !== newReview.user.login;
    });

    reviews.push({
      author: newReview.user.login,
      reviewed_at: newReview.submitted_at
    });
  }

  return reviews;
}