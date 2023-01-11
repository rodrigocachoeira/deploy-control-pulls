import { get, paginate } from './request';

const OWNER = 'atlastechnol';
const PER_PAGE = 30;

export async function getPullRequestsNumbers(repositoryName: string) {
  let page = 1;
  let hasMorePages = true;

  let allPulls:Array<any> = [];
  let pulls:Array<any> = [];

  while (hasMorePages) {
    const paginatedRecords = await paginate(`/repos/${OWNER}/${repositoryName}/pulls?per_page=${PER_PAGE}`, page);

    allPulls.push(...paginatedRecords.data);
    hasMorePages = paginatedRecords.hasMorePages;
    page++;
  }

  for(let i = 0; i  < allPulls.length; i++) {
    const pull = allPulls[i];
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
        createdAt: pull.created_at,
        consultants: getConsultantsOfTeams(pull.requested_teams) 
      });
    }
  }

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

function getConsultantsOfTeams(teams: Array<any>) {
  const consultants:Object[] = [];

  teams.forEach((team: any) => {
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