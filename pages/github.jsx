import Image from 'next/image';
import GitHubCalendar from 'react-github-calendar';
import RepoCard from '../components/RepoCard';
import styles from '../styles/GithubPage.module.css';

const GithubPage = ({ repos, user, error }) => {
  const theme = {
    dark: ['#161B22', '#0e4429', '#006d32', '#26a641', '#39d353'],
  };

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  if (!user) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <>
      <div className={styles.user}>
        <div>
          <Image
            src={user.avatar_url}
            className={styles.avatar}
            alt={user.login}
            width={50}
            height={50}
          />
          <h3 className={styles.username}>{user.login}</h3>
        </div>
        <div>
          <h3>{user.public_repos} repos</h3>
        </div>
        <div>
          <h3>{user.followers} followers</h3>
        </div>
      </div>
      <div className={styles.container}>
        {repos && repos.length > 0 ? (
          repos.map((repo) => <RepoCard key={repo.id} repo={repo} />)
        ) : (
          <p>No repositories found.</p>
        )}
      </div>
      <div className={styles.contributions}>
        <GitHubCalendar
          username={process.env.NEXT_PUBLIC_GITHUB_USERNAME}
          theme={theme}
          hideColorLegend
          hideMonthLabels
        />
      </div>
    </>
  );
};

export default GithubPage;

export async function getStaticProps() {
  const username = process.env.NEXT_PUBLIC_GITHUB_USERNAME;

  try {
    // Fetch user data
    const userRes = await fetch(`https://api.github.com/users/${username}`);
    const userData = await userRes.json();
    console.log('User API Response:', userData);

    if (!userRes.ok) {
      throw new Error(`Failed to fetch user data: ${userData.message}`);
    }

    // Fetch repos data
    const repoRes = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`
    );
    const reposData = await repoRes.json();
    console.log('Repos API Response:', reposData);

    if (!repoRes.ok) {
      throw new Error(`Failed to fetch repos: ${reposData.message}`);
    }

    if (!Array.isArray(reposData)) {
      throw new Error('Repos data is not in the expected format');
    }

    // Sort repos by star count and slice to get top 6
    const sortedRepos = reposData
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 6);

    return {
      props: {
        title: 'GitHub',
        repos: sortedRepos,
        user: userData,
        error: null,
      },
      revalidate: 60 * 60, // Revalidate every hour
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    return {
      props: {
        title: 'GitHub',
        repos: [],
        user: null,
        error: error.message,
      },
      revalidate: 60 * 60, // Revalidate every hour
    };
  }
}
